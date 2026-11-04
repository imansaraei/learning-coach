// Cloudflare Pages Function: /api/coach
// Executes server-side on Cloudflare edge, bypassing client IP restrictions and protecting keys.

interface Env {
  GEMINI_API_KEY?: string;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const data = await request.json() as any;
    const { book, module, userInput, currentUserState, clientApiKey } = data;

    // Use Cloudflare Pages Environment Variable if present, or client provided key
    const apiKey = env.GEMINI_API_KEY || clientApiKey;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'NO_API_KEY', message: 'No Gemini API key available on server or client.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemInstruction = `شما یک حکیم کهن و خردمند با جوهر زنده هستید؛ مربی و معمار ارشد تغییر رفتار که با تلفیق مدل ذهنی کتاب "${book.titleFa}" اثر ${book.authorFa} (مدل: ${book.frameworkNameFa || ''}) در گام "${module.title}"، ادامهٔ این کتاب را بر اساس اعتراف و موقعیت کاربر هم‌نگاری می‌کنید.

قوانین اکید:
۱. زبان خروجی منحصراً فارسی فاخر، روان، صریح و محترمانه باشد.
۲. ابتدا کلمات، مثال و بافت واقعی موقعیت کاربر را صریحاً بازتاب دهید تا کاربر عمیقاً احساس کند نوشته‌اش با دقت خوانده شده و کاملاً درک شده است.
۳. به کاربر نشان دهید که ادامهٔ این کتاب بر اساس همین اعتراف و موقعیت او در حال نگارش است؛ کتاب همراه با قلم او بازآفرینی می‌شود نه یک پرسش و پاسخ کلیشه‌ای.
۴. مطلقاً از قالب‌های عمومی و نصیحت‌های از پیش‌آماده پرهیز کنید؛ مستقیماً روی جزئیات عینی که کاربر نوشته تمرکز کنید.
۵. لحن شما مثل یک حکیم کهن و خردمند با جوهر زنده است: نافذ، همدلانه، صریح و بدون تعارف یا تملق.
۶. حداکثر طول coaching_response حدود ۱۲۰ تا ۱۵۰ کلمه فارسی باشد. بسیار فشرده، نافذ، متصل به بافت کاربر و متمرکز بر مدل ذهنی بنویسید.
۷. وضعیت کاربر (updated_user_state) را به طور تمیز و ساختاریافته آپدیت کنید. فیلد کلیدی "${module.interactivePrompt.stateTargetKey}" را در آن ثبت یا غنی‌سازی کنید.
۸. خروجی صرفاً یک آبجکت JSON معتبر مطابق با اسکیما باشد.`;

    const prompt = `اطلاعات ماژول فعلی:
- کتاب: ${book.titleFa}
- عنوان درس: ${module.title}
- مفهوم ذهنی: ${module.staticCoreLesson.concept}
- سوال مطرح‌شده از کاربر: ${module.interactivePrompt.question}

پاسخ و موقعیت کاربر به این پرسش:
"${userInput}"

وضعیت فعلی داده‌های کاربر (USER_STATE_JSON):
${JSON.stringify(currentUserState, null, 2)}

وظیفه شما:
ابتدا کلمات و بافت واقعی موقعیت کاربر را صریحاً بازتاب دهید و نشان دهید ادامه این کتاب بر اساس همین اعتراف در حال نگارش است (حدود ۱۲۰-۱۵۰ کلمه فارسی)، سوال هدایت‌کننده بعدی را مشخص کنید و آبجکت وضعیت کاربر را به‌روزرسانی کنید.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                coaching_response: {
                  type: 'STRING',
                  description: 'بازتاب همدلانه کلمات کاربر و ادامه نگارش کتاب بر اساس موقعیت او به زبان فارسی، حدود ۱۲۰ تا ۱۵۰ کلمه'
                },
                next_question: {
                  type: 'STRING',
                  description: 'سوال راهبردی برای مرحله بعدی'
                },
                updated_user_state: {
                  type: 'OBJECT',
                  description: 'وضعیت ادغام‌شده و جدید کاربر بر اساس مدل ذهنی'
                }
              },
              required: ['coaching_response', 'next_question', 'updated_user_state']
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: 'UPSTREAM_ERROR', details: errText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json() as any;
    const candidate = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error('No content candidate returned from Gemini');
    }

    const parsed = JSON.parse(candidate);
    return new Response(
      JSON.stringify({
        coaching_response: parsed.coaching_response,
        next_question: parsed.next_question,
        updated_user_state: {
          ...currentUserState,
          ...parsed.updated_user_state,
          [module.interactivePrompt.stateTargetKey]: userInput
        },
        is_final_blueprint: module.id === book.modules.length
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'SERVER_ERROR', message: err?.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
