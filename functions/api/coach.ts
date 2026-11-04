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

    const systemInstruction = `شما یک مربی و معمار ارشد تغییر رفتار هستید که با تلفیق مدل ذهنی کتاب "${book.titleFa}" اثر ${book.authorFa}، رفتار و موقعیت فردی کاربر را هدایت و مهندسی مجدد می‌کنید.
قوانین اکید:
۱. پاسخ شما باید به زبان فارسی فاخر، روان، دقیق و صریح باشد.
۲. مطلقاً از تملق و ستایش بی‌خاصیت ("آفرین پاسخ عالی بود"، "خیلی خوب گفتی") استفاده نکنید.
۳. حداکثر طول coaching_response دقیقاً ۱۵۰ کلمه است. بسیار فشرده، تیز و متمرکز بر علوم رفتاری بنویسید.
۴. وضعیت کاربر (updated_user_state) را به طور تمیز و ساختاریافته آپدیت کنید. فیلد کلیدی "${module.interactivePrompt.stateTargetKey}" را در آن ثبت یا غنی‌سازی کنید.
۵. خروجی صرفاً یک آبجکت JSON معتبر مطابق با اسکیما باشد.`;

    const prompt = `اطلاعات ماژول فعلی:
- کتاب: ${book.titleFa}
- عنوان درس: ${module.title}
- مفهوم ذهنی: ${module.staticCoreLesson.concept}
- سوال مطرح‌شده از کاربر: ${module.interactivePrompt.question}

پاسخ کاربر به این پرسش:
"${userInput}"

وضعیت فعلی داده‌های کاربر (USER_STATE_JSON):
${JSON.stringify(currentUserState, null, 2)}

وظیفه شما:
یک ارزیابی روان‌شناختی/رفتاری تیز و بدون تعارف بنویسید (حداکثر ۱۵۰ کلمه فارسی)، سوال هدایت‌کننده بعدی را مشخص کنید و آبجکت وضعیت کاربر را به‌روزرسانی کنید.`;

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
                  description: 'تحلیل دقیق و فشرده مربی به زبان فارسی بدون تملق، حداکثر ۱۵۰ کلمه'
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
