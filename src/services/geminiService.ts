import { GoogleGenAI, Type } from '@google/genai';
import { DynamicCoachingResult, BookCurriculum, ModuleData } from '../types/curriculum';

// Storage key for user-provided Gemini API key
const STORAGE_KEY = 'learning_coach_gemini_api_key';

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY) || ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) || '';
}

export function saveApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * High-fidelity fallback behavioral science coach
 * Used when no API key is provided or offline, ensuring 100% zero-cost operation.
 */
function generateOfflineCoachingResponse(
  book: BookCurriculum,
  module: ModuleData,
  userInput: string,
  currentUserState: Record<string, any>
): DynamicCoachingResult {
  const cleanInput = userInput.trim();
  const updatedState = { ...currentUserState };
  updatedState[module.interactivePrompt.stateTargetKey] = cleanInput;

  let coaching_response = '';
  let next_question = '';

  switch (book.id) {
    case 'situated':
      if (module.id === 1) {
        coaching_response = `تحلیل موقعیت شما نشان می‌دهد که تکانه رفتاری در جعبه ۳ ریشه در دسترسی‌پذیری بدون اصطکاک در جعبه ۱ دارد. شما سعی داشته‌اید با اراده جلوی آن را بگیرید، اما مغز خسته توان مقابله ندارد. جعبه ۱ شما باید بازمهندسی شود.`;
        next_question = 'چگونه می‌توانید یک مانع فیزیکی بسازید که برای دسترسی به آن محرک، نیاز به تلاش فیزیکی باشد؟';
        updatedState['objective_environment_box1'] = 'محرک فیزیکی در دسترس مستقیم بدون هیچ مانع قبلی';
      } else if (module.id === 2) {
        coaching_response = `مانع پیشنهادی شما نقطه اصطکاک بالادستی موثری ایجاد می‌کند. با افزودن حداقل ۲۰ ثانیه وقفه فیزیکی، زمان لازم برای مداخله بخش منطقی مغز فراهم می‌شود. این همان تفاوت مهندسی پیشگیرانه با جنگ فرسایشی اراده است.`;
        next_question = 'آیا فرد یا محیط اجتماعی مشخصی وجود دارد که به پایبندی شما به این مانع کمک کند؟';
        updatedState['upstream_redesign_strategy'] = cleanInput;
      } else if (module.id === 3) {
        coaching_response = `اهرم اجتماعی انتخابی شما، مسئولیت‌پذیری بیرونی ایجاد می‌کند. در علم رفتارشناسی، وقتی متعهد می‌شوید نتیجه را به دیگری گزارش کنید، هزینه نقض تعهد از هزینه عمل بیشتر می‌شود.`;
        next_question = 'برای ۴۸ ساعت آینده چه تعهد عملیاتی مشخصی وضع می‌کنید؟';
        updatedState['applied_situational_levers'] = [cleanInput];
      } else {
        coaching_response = `بلوپرینت موقعیتی شما کامل شد. تمرکز شما از مهار پایین‌دست اراده به معماری فیزیکی و اجتماعی بالادست منتقل شده است. ۴۸ ساعت آینده صرفاً آزمایشی برای کالیبره کردن این چیدمان است.`;
        next_question = 'اکنون بلوپرینت نهایی شما برای اقدام آماده است.';
        updatedState['status'] = 'completed_blueprint';
      }
      break;

    case 'power-of-habit':
      if (module.id === 1) {
        coaching_response = `شما رفتار روتین خودکار را تفکیک کردید. این رفتار در گانگلیای پایه‌ای مغز حک شده و با سرزنش خود حذف نمی‌شود. تمرکز بعدی ما پیدا کردن نشانه‌ محرک و پاداش عصبی واقعی است.`;
        next_question = 'در چه زمان یا با چه حس و رویدادی این روتین دقیقاً کلید می‌خورد؟';
      } else if (module.id === 2) {
        coaching_response = `نشانه محرک به وضوح شناسایی شد. مغز شما با دیدن این شرایط، انتظار دریافت پاداش را از پیش فعال می‌کند (Craving). اکنون می‌دانیم کلید استارت کجاست.`;
        next_question = 'پاداش واقعی چیست؟ احساس رهایی، وقفه ذهنی، یا تسکین موقت؟';
        updatedState['specific_cue'] = cleanInput;
      } else if (module.id === 3) {
        coaching_response = `تفکیک پاداش ظاهری از نیاز عصبی عمیق، قفل این چرخه را باز کرد. روتین قبلی فقط یک ابزار کم‌کیفیت برای پاسخ به این نیاز واقعی بود. اکنون می‌توانیم روتین جدید را طراحی کنیم.`;
        next_question = 'روتین جایگزین کم‌هزینه و سالمی که همین پاداش را بدهد چیست؟';
        updatedState['real_craving_and_reward'] = cleanInput;
      } else {
        coaching_response = `قانون طلایی تغییر عادت پیاده‌سازی شد: همان نشانه، همان پاداش، روتین بازنویسی‌شده. این پیوند عصبی جدید طی ۴۸ ساعت آینده در شرایط آزمایش تست خواهد شد.`;
        next_question = 'سند تغییر عادت شما آماده اجراست.';
        updatedState['golden_rule_replacement_routine'] = cleanInput;
      }
      break;

    case 'atomic-habits':
      if (module.id === 1) {
        coaching_response = `تمرکز بر هویت به جای نتیجه، سوخت روانی پایدار تولید می‌کند. هر عمل از این پس یک رأی مثبت به نفع انسانی است که تصمیم گرفته‌اید باشید، نه فقط تعقیب یک عدد بیرونی.`;
        next_question = 'این هویت را به کدام رفتار قطعی و جاری روزمره‌تان لنگر می‌اندازید؟';
        updatedState['target_identity'] = cleanInput;
      } else if (module.id === 2) {
        coaching_response = `لنگر عادتی شما هوشمندانه است؛ چون مغز مدار عصبی رفتار قبلی را دارد، ضمیمه کردن رفتار نو کمترین مقاومت شناختی را به همراه خواهد داشت.`;
        next_question = 'نسخه ۲ دقیقه‌ای این رفتار چیست تا مقاومت شروع به صفر برسد؟';
        updatedState['habit_stacking_rule'] = cleanInput;
      } else if (module.id === 3) {
        coaching_response = `نسخه ۲ دقیقه‌ای شما آستانه ورود را کاملاً حذف کرد. قانون طلایی این است: رفتار قبل از اینکه بهینه‌سازی شود، باید تثبیت گردد. ورود به درگاه مهم‌ترین بخش است.`;
        next_question = 'چگونه نشانه فیزیکی این عمل را در محیط آشکار و جلوی چشم می‌گذارید؟';
        updatedState['two_minute_version'] = cleanInput;
      } else if (module.id === 4) {
        coaching_response = `نشانه محیطی شما انتخاب درست قانون اول است. طراحی محیط دیداری بار اراده را به صفر می‌رساند. اکنون سیستم آماده تست ۴۸ ساعته است.`;
        next_question = 'معیار ثبت پیروزی شما در ۴۸ ساعت آینده چیست؟';
        updatedState['law_environment_design'] = cleanInput;
      } else {
        coaching_response = `سیستم عادات اتمی شما کامل است: هویت مشخص، لنگر انباشت، نسخه ۲ دقیقه‌ای و نشانه آشکار. سیستم اکنون آماده عمل بدون وابستگی به انگیزه لحظه‌ای است.`;
        next_question = 'بلوپرینت ۴۸ ساعته آماده است.';
        updatedState['status'] = 'completed_blueprint';
      }
      break;

    case 'thinking-fast-slow':
      if (module.id === 1) {
        coaching_response = `تصمیم بررسی‌شده به وضوح نشان‌دهنده غلبه سرعت سیستم ۱ بر دقت تحلیلی بود. سیستم ۱ شما سریعاً سناریوی حسی ساخت و سیستم ۲ بدون محاسبه آن را تایید کرد.`;
        next_question = 'چه شواهد یا داده‌های پنهانی در آن لحظه غایب بودند (WYSIATI)؟';
        updatedState['impulsive_decision_context'] = cleanInput;
      } else if (module.id === 2) {
        coaching_response = `شما نقاط کور ناشی از WYSIATI را افشا کردید. سیستم ۱ داستان‌سرایی را دوست دارد حتی اگر بر پایه ۱۰٪ شواهد باشد. دیدن داده‌های مفقوده اولین گام بیداری سیستم ۲ است.`;
        next_question = 'کدام خطای اکتشافی (خاطره اخیر یا لنگر اولین داده) شما را تحت تاثیر قرار داد؟';
        updatedState['wysiati_blindspots'] = cleanInput;
      } else if (module.id === 3) {
        coaching_response = `تله اکتشافی ریشه‌یابی شد. وزن دادن نامتناسب به اطلاعات دم‌دست یا اولین ارقام، خطای رایج زیستی است. خط‌کش تحلیلی شما باید این خطا را مهار کند.`;
        next_question = 'پروتکل وقفه فیزیکی یا مشورتی شما برای توقف تصمیم شتابزده چیست؟';
        updatedState['system1_triggers_and_heuristics'] = cleanInput;
      } else {
        coaching_response = `پروتکل ترمز و مهار شناختی شما ثبت شد. اکنون در مواجهه با شرایط مشابه، به جای اتکا به حس درونی، به چک‌لیست و مکث طراحی‌شده سیستم ۲ اتکا خواهید کرد.`;
        next_question = 'پروتکل بازداری شناختی آماده اجرا در آزمایش ۴۸ ساعته است.';
        updatedState['system2_interception_protocol'] = cleanInput;
      }
      break;

    case 'crucial-conversations':
      if (module.id === 1) {
        coaching_response = `مکالمه شناسایی‌شده تمام معیارهای یک گفتگوی حیاتی را دارد. الگوی کنونی شما فرار به سمت سکوت یا دفاع تهاجمی است که استخر معانی مشترک را مسدود کرده است.`;
        next_question = 'هدف عمیق قلبی شما برای خود، طرف مقابل و بقای رابطه چیست؟';
        updatedState['high_stakes_situation'] = cleanInput;
      } else if (module.id === 2) {
        coaching_response = `شفاف‌سازی انگیزه قلبی، شما را از تله برنده شدن در بحث یا انتقام رها کرد. وقتی نیت شما حفظ رابطه و سود دوطرفه باشد، لحن صدا و کلمات به شکل طبیعی تعدیل می‌شوند.`;
        next_question = 'جمله کنتراست (چیزی که نمی‌خواهید در برابر چیزی که واقعاً می‌خواهید) را چطور می‌سازید؟';
        updatedState['mutual_purpose_definition'] = cleanInput;
      } else if (module.id === 3) {
        coaching_response = `بیانیه کنتراست شما اضطراب دفاعی طرف مقابل را خاموش می‌کند. این جمله به طرف مقابل اثبات می‌کند که تهدید جانی یا حیثیتی در کار نیست و فضا برای شنیدن حقایق امن است.`;
        next_question = 'زمان، مکان و فکت‌های عینی آغازگر شما برای این گفتگو در ۴۸ ساعت آینده چیست؟';
        updatedState['contrasting_statement_ready'] = cleanInput;
      } else {
        coaching_response = `شما به ساختار کامل گفتگوهای حیاتی مجهز شدید: انگیزه قلبی، امنیت‌آفرینی با کنتراست و مسیر حقایق عینی. گام نهایی، اجرای مکث و گوش دادن فعال در صحنه است.`;
        next_question = 'سند سناریوی مکالمه آماده است.';
        updatedState['silence_or_violence_pattern'] = cleanInput;
      }
      break;

    default:
      coaching_response = `پاسخ شما بر اساس مدل ذهنی تجزیه شد. نقاط کلیدی رفتاری استخراج و در وضعیت شخصی شما ثبت گردید.`;
      next_question = 'به گام بعدی بروید.';
  }

  return {
    coaching_response,
    next_question,
    updated_user_state: updatedState,
    is_final_blueprint: module.id === book.modules.length
  };
}

/**
 * Call Gemini 2.5 Flash with structured JSON output schema
 * Falls back to offline smart coach if no API key or network error
 */
export async function getDynamicCoachingTurn(
  book: BookCurriculum,
  module: ModuleData,
  userInput: string,
  currentUserState: Record<string, any>
): Promise<DynamicCoachingResult> {
  const apiKey = getStoredApiKey();

  // Strategy 1: Try Cloudflare Edge Pages Function (/api/coach)
  // Handles server GEMINI_API_KEY and avoids browser CORS/region restrictions
  try {
    const edgeResponse = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        book,
        module,
        userInput,
        currentUserState,
        clientApiKey: apiKey,
      }),
    });

    if (edgeResponse.ok) {
      const edgeData = (await edgeResponse.json()) as DynamicCoachingResult;
      if (edgeData && edgeData.coaching_response) {
        return edgeData;
      }
    }
  } catch (_edgeErr) {
    // Proceed to direct client SDK or offline fallback
  }

  // Strategy 2: Client-side Direct Google Gemini SDK call (if API key is present)
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `شما یک مربی ارشد و تیزهوش در حوزه علوم رفتاری و طراحی عادت هستید (مشابه ترکیب Angela Duckworth، James Clear، Daniel Kahneman و Charles Duhigg).
رسالت شما: بررسی پاسخ کاربر بر اساس مدل ذهنی کتاب "${book.titleFa}" (مدل: ${book.frameworkNameFa}) در گام "${module.title}".

قوانین اکید:
۱. زبان خروجی منحصراً فارسی روان، فاخر، صریح و محترمانه باشد.
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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coaching_response: {
                type: Type.STRING,
                description: 'تحلیل دقیق و فشرده مربی به زبان فارسی بدون تملق، حداکثر ۱۵۰ کلمه'
              },
              next_question: {
                type: Type.STRING,
                description: 'سوال راهبردی برای مرحله بعدی'
              },
              updated_user_state: {
                type: Type.OBJECT,
                description: 'وضعیت ادغام‌شده و جدید کاربر بر اساس مدل ذهنی'
              }
            },
            required: ['coaching_response', 'next_question', 'updated_user_state']
          }
        }
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text) as {
          coaching_response: string;
          next_question: string;
          updated_user_state: Record<string, any>;
        };

        return {
          coaching_response: parsed.coaching_response,
          next_question: parsed.next_question,
          updated_user_state: {
            ...currentUserState,
            ...parsed.updated_user_state,
            [module.interactivePrompt.stateTargetKey]: userInput
          },
          is_final_blueprint: module.id === book.modules.length
        };
      }
    } catch (sdkError) {
      console.warn('Client Gemini SDK call failed, falling back to smart local coach:', sdkError);
    }
  }

  // Strategy 3: Graceful fallback to smart local behavioral science coach
  return generateOfflineCoachingResponse(book, module, userInput, currentUserState);
}
