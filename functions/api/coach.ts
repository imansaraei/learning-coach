// Cloudflare Pages Function: /api/coach
// Executes server-side on Cloudflare edge, bypassing client IP restrictions and protecting keys.

interface Env {
  GEMINI_API_KEY?: string;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const data = await request.json() as any;
    const { book, module, nextModule, userInput, currentUserState, clientApiKey } = data;

    // Use Cloudflare Pages Environment Variable if present, or client provided key
    const apiKey = env.GEMINI_API_KEY || clientApiKey;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'NO_API_KEY', message: 'No Gemini API key available on server or client.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const hasNextModule = Boolean(nextModule);

    let systemInstruction = `شما یک حکیم کهن و خردمند با جوهر زنده هستید؛ مربی و معمار ارشد تغییر رفتار که با تلفیق مدل ذهنی کتاب "${book.titleFa}" اثر ${book.authorFa} (مدل: ${book.frameworkNameFa || ''}) در گام "${module.title}"، ادامهٔ این کتاب را بر اساس اعتراف و موقعیت کاربر هم‌نگاری می‌کنید.

قوانین اکید:
۱. زبان خروجی منحصراً فارسی فاخر، روان، صریح و محترمانه باشد.
۲. ابتدا کلمات، مثال و بافت واقعی موقعیت کاربر را صریحاً بازتاب دهید تا کاربر عمیقاً احساس کند نوشته‌اش با دقت خوانده شده و کاملاً درک شده است.
۳. به کاربر نشان دهید که ادامهٔ این کتاب بر اساس همین اعتراف و موقعیت او در حال نگارش است؛ کتاب همراه با قلم او بازآفرینی می‌شود نه یک پرسش و پاسخ کلیشه‌ای.
۴. مطلقاً از قالب‌های عمومی و نصیحت‌های از پیش‌آماده پرهیز کنید؛ مستقیماً روی جزئیات عینی که کاربر نوشته تمرکز کنید.
۵. لحن شما مثل یک حکیم کهن و خردمند با جوهر زنده است: نافذ، همدلانه، صریح و بدون تعارف یا تملق.
۶. حداکثر طول coaching_response حدود ۱۲۰ تا ۱۵۰ کلمه فارسی باشد. بسیار فشرده، نافذ، متصل به بافت کاربر و متمرکز بر مدل ذهنی بنویسید.
۷. وضعیت کاربر (updated_user_state) را به طور تمیز و ساختاریافته آپدیت کنید. فیلد کلیدی "${module.interactivePrompt?.stateTargetKey || 'target'}" را در آن ثبت یا غنی‌سازی کنید.
۸. خروجی صرفاً یک آبجکت JSON معتبر مطابق با اسکیما باشد.`;

    if (hasNextModule) {
      systemInstruction += `

دستورالعمل ویژه بازآفرینی فصل بعد (generated_next_module):
شما باید کل فصل بعدی را با لحن و قلم اصیل نویسنده کتاب (${book.authorFa}) منحصراً برای همین کاربر بازنویسی و خلق کنید:
۱. اعتراف و بافت واقعی کاربر («${userInput}») را مستقیماً در تاروپود نقطه عطف نظریه فصل بعد یعنی «${nextModule.title}» (تیتر پایه: «${nextModule.staticCoreLesson?.headline || ''}») ببافید.
۲. مطلقاً نصیحت عمومی نکنید؛ اشیاء عینی، اتاق‌ها، فضاها و رفتارهای ملموس کاربر را درون مفهوم نظری (concept) به طول ۱۴۰ تا ۱۸۰ کلمه فارسی فاخر و نافذ تشریح کنید.
۳. یک پیام کلیدی تک‌خطی و قاطع (keyTakeaway) ارائه دهید.
۴. یک پرسش کاوش‌گرانه و هدفمند بعدی (question) متناسب با گام بعد طراحی کنید.
۵. ۳ مرحله دیاگرام (diagramSteps) شامل label و desc با استفاده مستقیم از بافت عینی کاربر بسازید.`;
    }

    let prompt = `اطلاعات ماژول فعلی:
- کتاب: ${book.titleFa}
- عنوان درس: ${module.title}
- مفهوم ذهنی: ${module.staticCoreLesson?.concept || ''}
- سوال مطرح‌شده از کاربر: ${module.interactivePrompt?.question || ''}

پاسخ و موقعیت کاربر به این پرسش:
"${userInput}"

وضعیت فعلی داده‌های کاربر (USER_STATE_JSON):
${JSON.stringify(currentUserState, null, 2)}`;

    if (hasNextModule) {
      prompt += `

داربست نقطه عطف نظریه فصل بعد (Scaffold for Next Chapter):
- عنوان فصل بعد: ${nextModule.title}
- تیتر نظریه پایه فصل بعد: ${nextModule.staticCoreLesson?.headline || ''}
- مفهوم پایه فصل بعد: ${nextModule.staticCoreLesson?.concept || ''}
- پرسش پایه فصل بعد: ${nextModule.interactivePrompt?.question || ''}

وظیفه شما:
۱. بازتاب همدلانه و مستقیم موقعیت کاربر (coaching_response) در حدود ۱۲۰-۱۵۰ کلمه فارسی.
۲. تعیین سوال راهبردی بعدی (next_question).
۳. به‌روزرسانی آبجکت وضعیت کاربر (updated_user_state).
۴. تألیف و بازآفرینی کامل فصل بعدی در آبجکت generated_next_module با قلم اصیل ${book.authorFa} و بر اساس جزئیات اعتراف کاربر.`;
    } else {
      prompt += `

این فصل، آخرین گام کتاب است و پس از آن به طرح نهایی (Blueprint) خواهیم رسید.

وظیفه شما:
۱. بازتاب کلمات و موقعیت کاربر (coaching_response) در حدود ۱۲۰-۱۵۰ کلمه فارسی و جمع‌بندی مسیر طی‌شده.
۲. تعیین سوال هدایت‌کننده بعدی (next_question).
۳. به‌روزرسانی وضعیت کاربر (updated_user_state).`;
    }

    const responseSchema: any = {
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
    };

    if (hasNextModule) {
      responseSchema.properties.generated_next_module = {
        type: 'OBJECT',
        properties: {
          headline: { type: 'STRING', description: 'تیتر جذاب فصل بعد پیرامون موقعیت کاربر' },
          concept: { type: 'STRING', description: 'متن عمیق و روان درس بعدی با لحن نویسنده کتاب (حداکثر ۱۶۰ تا ۱۸۰ کلمه فارسی)' },
          keyTakeaway: { type: 'STRING', description: 'پیام کلیدی یک‌خطی' },
          question: { type: 'STRING', description: 'پرسش کاوش‌گرانه بعدی' },
          diagramSteps: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                label: { type: 'STRING' },
                desc: { type: 'STRING' }
              },
              required: ['label', 'desc']
            }
          }
        },
        required: ['headline', 'concept', 'keyTakeaway', 'question']
      };
      responseSchema.required.push('generated_next_module');
    }

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
            responseSchema
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
    const responsePayload: any = {
      coaching_response: parsed.coaching_response,
      next_question: parsed.next_question,
      updated_user_state: {
        ...currentUserState,
        ...parsed.updated_user_state,
        [module.interactivePrompt?.stateTargetKey || 'target']: userInput
      },
      is_final_blueprint: !hasNextModule
    };

    if (hasNextModule) {
      responsePayload.generated_next_module = parsed.generated_next_module;
    }

    return new Response(
      JSON.stringify(responsePayload),
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
