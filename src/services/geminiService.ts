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
        coaching_response = `در موقعیتی که ثبت کردید: «${cleanInput}»، اعتراف شما ریشهٔ مسأله را عریان کرد: تکانهٔ رفتاری در جعبه ۳ زاییدهٔ دسترسی بی‌اصطکاک در جعبه ۱ است. شما بارها کوشیده‌اید با تازیانهٔ اراده بر آن غلبه کنید، اما صفحات بعدی این کتاب نشان می‌دهند که ادامهٔ مسیر نه جنگ فرسایشی با خود، بلکه بازمهندسیِ همین صحنهٔ فیزیکی است.`;
        next_question = 'چگونه می‌توانید یک مانع فیزیکی بسازید که برای دسترسی به آن محرک در این موقعیت، نیاز به تلاش فیزیکی باشد؟';
        updatedState['objective_environment_box1'] = 'محرک فیزیکی در دسترس مستقیم بدون هیچ مانع قبلی';
      } else if (module.id === 2) {
        coaching_response = `با قرار دادن «${cleanInput}» در کانون این صفحه، ادامهٔ کتاب بر مهندسی دقیق همین نقطه متمرکز می‌شود. افزودن حداقل ۲۰ ثانیه وقفه فیزیکی در این صحنه، دقیقاً همان پادزهری است که نبرد درونی را به آرامش ساختاری بدل می‌کند. اکنون قلم کتاب به سمت اهرم‌های انسانی پیرامون شما حرکت می‌کند.`;
        next_question = 'آیا فرد یا محیط اجتماعی مشخصی وجود دارد که به پایبندی شما به این مانع کمک کند؟';
        updatedState['upstream_redesign_strategy'] = cleanInput;
      } else if (module.id === 3) {
        coaching_response = `اهرم اجتماعی که برگزیدید: «${cleanInput}»، نیروی پنهان نگاه دیگران را به خدمت دگرگونی شما درمی‌آورد. ادامهٔ کتاب با ثبت این حضور انسانی ورق می‌خورد؛ در علم رفتارشناسی، وقتی متعهد می‌شوید نتیجه را به دیگری گزارش دهید، هزینهٔ نقض عهد از وسوسهٔ تسلیم سنگین‌تر می‌شود.`;
        next_question = 'برای ۴۸ ساعت آینده چه تعهد عملیاتی مشخصی وضع می‌کنید؟';
        updatedState['applied_situational_levers'] = [cleanInput];
      } else {
        coaching_response = `پروتکل اقدام شما تثبیت شد: «${cleanInput}». این کتاب اکنون دیگر مجموعه‌ای از کلمات دور از دسترس نیست؛ سطرسطر آن با قلم و موقعیت واقعی شما بازآفریده شده است. تمرکز شما از مهار پایین‌دست اراده به معماری فیزیکی و اجتماعی بالادست منتقل گردید. ۴۸ ساعت آینده آزمونی برای کالیبره کردن این بنای نو است.`;
        next_question = 'بلوپرینت ۴۸ ساعته موقعیت شما آماده اجراست.';
        updatedState['status'] = 'completed_blueprint';
      }
      break;

    case 'power-of-habit':
      if (module.id === 1) {
        coaching_response = `در رفتاری که ثبت کردید: «${cleanInput}»، روتین خودکاری که در گانگلیای پایه‌ای مغزتان ریشه دوانده بر صفحه آشکار شد. ادامهٔ این کتاب بر سرزنش یا ملامت خویش بنا نمی‌شود؛ کلمات ما از این پس به کالبدشکافی علمی حلقهٔ عادتیِ همین رفتار مشخص شما می‌پردازند.`;
        next_question = 'در چه زمان، با چه حس و با وقوع چه رویدادی این روتین دقیقاً کلید می‌خورد؟';
        updatedState['undesirable_routine'] = cleanInput;
      } else if (module.id === 2) {
        coaching_response = `با آشکار شدن نشانهٔ محرک: «${cleanInput}»، کلید استارت این چرخه در متن کتاب ثبت شد. مغز شما با دیدن این شرایط، اشتیاق و ولع (Craving) ناخودآگاه را پیش‌فعال می‌کند. همراه با قلم شما، ادامهٔ کتاب مستقیماً به شناسایی نیازی می‌پردازد که در پس این ولع نهفته است.`;
        next_question = 'پاداش واقعی و نیاز عصبی چیست؟ احساس رهایی، وقفه ذهنی، یا تسکین موقت؟';
        updatedState['specific_cue'] = cleanInput;
      } else if (module.id === 3) {
        coaching_response = `کشف پاداش واقعی: «${cleanInput}»، گره ناخودآگاه این حلقه را گشود. روتین گذشته تنها پاسخی بدوی به این نیاز زیستی بود. اینک صفحهٔ بعدی کتاب دست به قلم شما می‌دهد تا روتین تازه‌ای مهندسی کنیم که همین پاداش عصبی را بدون تخریب به روان شما هدیه دهد.`;
        next_question = 'روتین جایگزین کم‌هزینه و سالمی که دقیقاً همین پاداش را بازتولید کند چیست؟';
        updatedState['real_craving_and_reward'] = cleanInput;
      } else {
        coaching_response = `قانون طلایی تغییر عادت با جایگزینی «${cleanInput}» در بافت اختصاصی شما تثبیت شد: همان نشانه، همان پاداش، روتین بازنویسی‌شده. این اثر اکنون بر اساس نبض عصب‌شناختی شما نگارش یافته و آزمایش ۴۸ ساعته، بستر حک شدن این مدار نو در رفتار شماست.`;
        next_question = 'سند تغییر عادت شما آماده اجراست.';
        updatedState['golden_rule_replacement_routine'] = cleanInput;
        updatedState['status'] = 'completed_blueprint';
      }
      break;

    case 'atomic-habits':
      if (module.id === 1) {
        coaching_response = `با استقرار هویت: «${cleanInput}»، بنیاد این فصل از کتاب بر سنگ خارا گذاشته شد. ادامهٔ این کتاب دیگر پیرامون دویدن به دنبال اعداد و نتایج ناپایدار نیست؛ هر صفحه بازآفرینی این حقیقت است که هر عمل از این پس، رأیی مثبت به انسانی است که برگزیده‌اید باشید.`;
        next_question = 'این هویت را به کدام رفتار قطعی و تثبیت‌شدهٔ روزمره‌تان لنگر می‌اندازید؟';
        updatedState['target_identity'] = cleanInput;
      } else if (module.id === 2) {
        coaching_response = `با فرمول‌بندی لنگر انباشت عادات: «${cleanInput}»، کتاب همگام با اتصالات عصبی مغز شما ورق می‌خورد. پیوند زدن این نهال نو به درخت تناور عادات کهنه‌تان، مقاومت شناختی آغاز را محو می‌سازد.`;
        next_question = 'نسخه ۲ دقیقه‌ای این رفتار چیست تا مقاومت شروع در بدترین روزها به صفر برسد؟';
        updatedState['habit_stacking_rule'] = cleanInput;
      } else if (module.id === 3) {
        coaching_response = `نسخه ۲ دقیقه‌ای که خلق کردید: «${cleanInput}»، دروازهٔ ورود را از هر قید و اصطکاکی پیراست. حکمت این صفحه یادآور می‌شود: رفتار پیش از آنکه متعالی شود، باید متولد گردد. اکنون قلم کتاب بر ساختن نشانه‌ای متمرکز است که اجازه فراموشی ندهد.`;
        next_question = 'چگونه نشانه فیزیکی این عمل را در محیط روزمره کاملاً آشکار و جلوی چشم می‌گذارید؟';
        updatedState['two_minute_version'] = cleanInput;
      } else if (module.id === 4) {
        coaching_response = `معماری نشانهٔ دیداری شما: «${cleanInput}»، اراده را از معادله حذف و محیط را مربی رفتار ساخت. این صفحه از کتاب به شما نشان می‌دهد که اتاق و ابزارها می‌توانند پیش از بیداری ذهن، تصمیم درست را به شما دیکته کنند.`;
        next_question = 'معیار ثبت پیروزی و آزمون پایبندی شما در ۴۸ ساعت آینده چیست؟';
        updatedState['law_environment_design'] = cleanInput;
      } else {
        coaching_response = `معیار آزمایش و ثبت رأی شما: «${cleanInput}»، آخرین بند این کتاب شخصی را رقم زد. هویت برگزیده، لنگر استوار، دروازهٔ ۲ دقیقه‌ای و نشانهٔ آشکار به یک سیستم خودبسنده بدل شدند که با نبض زیست شما همگام است.`;
        next_question = 'بلوپرینت ۴۸ ساعته سیستم عادات اتمی شما آماده اجراست.';
        updatedState['current_outcome_focus'] = cleanInput;
        updatedState['status'] = 'completed_blueprint';
      }
      break;

    case 'thinking-fast-slow':
      if (module.id === 1) {
        coaching_response = `در موقعیتی که اعتراف کردید: «${cleanInput}»، شتاب‌زدگی سیستم ۱ و فریب قطعیت حسی کاملاً آشکار است. سیستم ۱ داستان‌سرایی کرد و سیستم ۲ تنبلانه مهر تایید زد. ادامهٔ این کتاب با کالبدشکافی دقیق همین رخداد شما، سازوکار بیداری سیستم ۲ را قدم‌به‌قدم بازآفرینی می‌کند.`;
        next_question = 'چه شواهد، داده‌ها یا زوایای پنهانی در آن لحظه غایب بودند (WYSIATI)؟';
        updatedState['impulsive_decision_context'] = cleanInput;
      } else if (module.id === 2) {
        coaching_response = `با آشکار کردن نقاط کور و شواهد مفقوده: «${cleanInput}»، توهم WYSIATI در این برگ از کتاب برملا شد. سیستم ۱ عاشق سادگیِ برآمده از ۱۰٪ شواهد است. ادامه نگارش کتاب با باز کردن این زاویه، سیستم ۲ را از خواب غفلت بیدار می‌سازد.`;
        next_question = 'کدام خطای اکتشافی (خاطره تازه، هیجان اخیر یا لنگر اولین داده) در این قضاوت شما را به بیراهه برد؟';
        updatedState['wysiati_blindspots'] = cleanInput;
      } else if (module.id === 3) {
        coaching_response = `تلهٔ اکتشافی شناسایی‌شده: «${cleanInput}»، میانبر ذهنی پرهزینه‌ای را در برابر چشمان ما نهاد. اتکا بر در دسترس‌ترین داده‌ها یا اولین ارقام، خطای کهن فرگشت است. قلم کتاب اکنون بر مجهز کردن شما به یک خط‌کش عینی متمرکز می‌شود تا احساس راحتی کاذب را مهار کند.`;
        next_question = 'پروتکل وقفه فیزیکی یا مشورتی شما برای توقف تصمیم شتابزده در موقعیت‌های مشابه چیست؟';
        updatedState['system1_triggers_and_heuristics'] = cleanInput;
      } else {
        coaching_response = `پروتکل ترمز و مهار شناختی شما ثبت شد: «${cleanInput}». از این پس کتاب تصمیم‌گیری شما به چک‌لیستی عینی مجهز است؛ به جای سپردن سرنوشت به تندباد هیجانات اولیه، این مکث طراحی‌شده سیستم ۲ را به صحنه فرامی‌خواند.`;
        next_question = 'پروتکل بازداری شناختی آماده اجرا در آزمایش ۴۸ ساعته است.';
        updatedState['system2_interception_protocol'] = cleanInput;
        updatedState['status'] = 'completed_blueprint';
      }
      break;

    case 'crucial-conversations':
      if (module.id === 1) {
        coaching_response = `مکالمهٔ پرخطری که فاش کردید: «${cleanInput}»، کانون این فصل از کتاب شماست. گریز به سکوت یا خشونت در این صحنه، استخر معانی مشترک را مسدود کرده است. ادامهٔ این کتاب نه موعظه‌ای عمومی، بلکه تدوین نقشه‌ای سنجیده برای بازگشایی امن همین گفتگوست.`;
        next_question = 'انگیزه عمیق و پایدار قلبی شما برای خود، طرف مقابل و بقای رابطه چیست؟';
        updatedState['high_stakes_situation'] = cleanInput;
      } else if (module.id === 2) {
        coaching_response = `با بیان انگیزه قلبی: «${cleanInput}»، جهت‌گیری این صفحه از تلهٔ اثبات حقانیت یا تنبیه رهایی یافت. وقتی نیت شما حفظ رابطه و سود دوطرفه باشد، لحن و واژگان شما به شکلی طبیعی زره دفاعی طرف مقابل را نرم می‌کنند.`;
        next_question = 'جمله کنتراست خود (شفاف‌سازی عدم سوءنیت در کنار تاکید بر هدف مشترک) را چگونه می‌سازید؟';
        updatedState['mutual_purpose_definition'] = cleanInput;
      } else if (module.id === 3) {
        coaching_response = `بیانیهٔ کنتراست شما: «${cleanInput}»، اضطراب دفاعی طرف مقابل را خاموش می‌سازد. این کلمات در متن کتاب شما اثبات می‌کنند که نه تهدیدی در کار است و نه سرزنشی؛ فضا برای شنیدن حقایق بدون هراس از آسیب آماده شده است.`;
        next_question = 'زمان، مکان و فکت‌های عینی آغازگر شما برای این گفتگو در ۴۸ ساعت آینده چیست؟';
        updatedState['contrasting_statement_ready'] = cleanInput;
      } else {
        coaching_response = `سناریوی ورود به گفتگوی حیاتی تکمیل گردید: «${cleanInput}». این کتاب اختصاصی اکنون به ابزار آغاز با فکت‌های ملموس، ایجاد امنیت و غوطه‌وری در استخر معانی مشترک مجهز است. آزمایش ۴۸ ساعته، زمان تحقق عملی این مهارت در صحنه واقعی است.`;
        next_question = 'سند سناریوی مکالمه آماده آزمایش ۴۸ ساعته است.';
        updatedState['silence_or_violence_pattern'] = cleanInput;
        updatedState['status'] = 'completed_blueprint';
      }
      break;

    case 'mindset':
      if (module.id === 1) {
        coaching_response = `در چالشی که شرح دادید: «${cleanInput}»، اصطکاک میان طرز فکر ثابت و رشد آشکار است. ادامهٔ این کتاب پیرامون تغییر نگاه به اشتباهات و بازتعریف تلاش به عنوان جوهر مهارت نگاشته می‌شود.`;
        next_question = 'پیام درونی که در لحظه رویارویی با این چالش دریافت کردید چه بود؟';
      } else {
        coaching_response = `با محور قرار دادن «${cleanInput}»، ادامهٔ کتاب تمرکز شما را از نیاز به اثبات بی‌نقص بودن به لذت پیشرفت و رشد معطوف می‌سازد.`;
        next_question = 'اقدام بعدی شما برای تثبیت این ذهنیت نو چیست؟';
      }
      break;

    case 'deep-work':
      if (module.id === 1) {
        coaching_response = `در وضعیت تمرکزی که قید کردید: «${cleanInput}»، نبرد میان حواس‌پرتی‌های کم‌عمق و ارزش‌آفرینی ژرف نمایان است. ادامهٔ این کتاب معطوف به ساخت حصاری نفوذناپذیر در محیط پیرامون شماست.`;
        next_question = 'بزرگ‌ترین روزنه نشتی توجه شما در طول کار عمیق چیست؟';
      } else {
        coaching_response = `با تدوین «${cleanInput}» به عنوان سنگر تمرکز، ادامهٔ کتاب بر ساختن مناسک روزانه برای حراست از توجه شما استوار می‌گردد.`;
        next_question = 'پروتکل خروج شما از دنیای آنلاین برای ۴۸ ساعت آینده چیست؟';
      }
      break;

    default:
      coaching_response = `با قرار دادن «${cleanInput}» در کانون این صفحه، ادامهٔ کتاب بر مهندسی دقیق همین نقطه و بافت تجربی شما متمرکز می‌شود. جوهر زنده این اثر، گام بعدی را متناسب با اعتراف شما بازآفرینی می‌کند.`;
      next_question = 'برای ادامه هم‌نگاری این کتاب به گام بعدی وارد شوید.';
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

      const systemInstruction = `شما یک حکیم کهن و خردمند با جوهر زنده هستید؛ مربی و معمار ارشد تغییر رفتار که با تلفیق مدل ذهنی کتاب "${book.titleFa}" (مدل: ${book.frameworkNameFa}) در گام "${module.title}"، ادامهٔ این کتاب را بر اساس اعتراف و موقعیت کاربر هم‌نگاری می‌کنید.

قوانین اکید:
۱. زبان خروجی منحصراً فارسی روان، فاخر، صریح و محترمانه باشد.
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
                description: 'بازتاب همدلانه کلمات کاربر و ادامه نگارش کتاب بر اساس موقعیت او به زبان فارسی، حدود ۱۲۰ تا ۱۵۰ کلمه'
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
