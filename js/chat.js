/* =======================================================================
   NOVA AI — AI CHAT section
   Chat-style signal desk. One signal at a time: a new one replaces the old,
   switching the model starts a clean chat. No history is stored.

   Signal sources (same as the HOME section):
     Regular -> backend UT bot  (POST /run, GET /signal, POST /signal/check)
     OTC     -> local random
   ======================================================================= */

const API_URL = "https://tradeaiapi.fatalnetwork.ru";

/* ----------------------------------------------------------------------
   MODEL ROSTER — rename / add / remove freely, the UI builds itself.
   `theme` picks the palette declared in chat.css ([data-theme="..."]).
   ---------------------------------------------------------------------- */

const MODEL_FAMILIES = [
    {
        id: "xai", label: "xAI", theme: "grok", logo: "#logo-grok",
        models: [
            { id: "grok-4-6",    name: "Grok 4.6",    sub: "Flagship" },
            { id: "grok-4-5",    name: "Grok 4.5",    sub: "" },
            { id: "grok-4-3",    name: "Grok 4.3",    sub: "" },
            { id: "grok-3-mini", name: "Grok 3 Mini", sub: "Fast" }
        ]
    },
    {
        id: "openai", label: "ChatGPT", theme: "gpt", logo: "#logo-gpt",
        models: [
            { id: "gpt-6-astra",   name: "GPT-6 Astra",   sub: "Flagship" },
            { id: "gpt-5-6-sol",   name: "GPT-5.6 Sol",   sub: "" },
            { id: "gpt-5-6-terra", name: "GPT-5.6 Terra", sub: "" },
            { id: "gpt-5-mini",    name: "GPT-5 mini",    sub: "Fast" }
        ]
    },
    {
        id: "anthropic", label: "Anthropic", theme: "claude", logo: "#logo-claude",
        models: [
            { id: "claude-opus-5",    name: "Claude Opus 5",    sub: "Flagship" },
            { id: "claude-sonnet-5",  name: "Claude Sonnet 5",  sub: "" },
            { id: "claude-fable-5-1", name: "Claude Fable 5.1", sub: "" },
            { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", sub: "Fast" }
        ]
    },
    {
        id: "google", label: "Google", theme: "gemini", logo: "#logo-gemini",
        models: [
            { id: "gemini-3-1-pro",   name: "Gemini 3.1 Pro",   sub: "Flagship" },
            { id: "gemini-3-8-flash", name: "Gemini 3.8 Flash", sub: "" },
            { id: "gemini-3-7-flash", name: "Gemini 3.7 Flash", sub: "Fast" },
            { id: "gemini-2-5-pro",   name: "Gemini 2.5 Pro",   sub: "" }
        ]
    }
];

const ALL_MODELS = MODEL_FAMILIES.flatMap(f =>
    f.models.map(m => ({ ...m, family: f.id, familyLabel: f.label, theme: f.theme, logo: f.logo }))
);

/* ---------------------------- INSTRUMENTS ----------------------------- */

const STANDARD_PAIRS = [
    "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "AUDUSD",
    "GBPJPY", "EURJPY", "EURGBP", "EURCAD", "GBPCHF", "CADJPY",
    "AUDCAD", "AUDJPY", "EURCHF", "CADCHF"
];

const OTC_PAIRS = [
    "EURUSD OTC", "CADJPY OTC", "GBPCHF OTC", "EURCAD OTC", "EURGBP OTC",
    "EURJPY OTC", "GBPJPY OTC", "AUDUSD OTC", "USDCAD OTC", "USDCHF OTC",
    "USDJPY OTC", "GBPUSD OTC", "AUDCAD OTC", "GBPCAD OTC", "AUDJPY OTC",
    "EURCHF OTC", "CADCHF OTC"
];

const STANDARD_TFS = ["1m", "3m", "5m", "15m"];
const OTC_TFS = ["5s", "15s", "30s", "1m", "2m", "3m", "4m", "5m"];

const LANGS = [
    { code: "ru", name: "Русский",  flag: "ru" },
    { code: "en", name: "English",  flag: "gb" },
    { code: "uz", name: "O'zbek",   flag: "uz" },
    { code: "hi", name: "हिन्दी",      flag: "in" },
    { code: "pt", name: "Português", flag: "br" },
    { code: "ar", name: "العربية",    flag: "sa" },
    { code: "kz", name: "Қазақша",  flag: "kz" }
];

/* ------------------------------- I18N --------------------------------- */

const T = {
    en: {
        nav_home: "HOME", nav_broker: "BROKER", nav_chat: "AI CHAT",
        access_title: "AI Chat locked",
        access_need_reg: "Register on Pocket Option via Broker to unlock AI Chat.",
        access_need_deposit: "Deposit at least ${min}. Your deposit: ${current}.",
        access_open_broker: "Open Broker",
        access_error: "Please open this app via Telegram.",
        access_no_user: "Please open this app via Telegram.",
        chat_hero_sub: "Set the instrument, market and expiration — then tap send to get a signal.",
        market_regular: "Regular", market_otc: "OTC",
        sheet_pair: "Currency pair", sheet_market: "Market", sheet_tf: "Expiration time",
        sheet_model: "AI model", sheet_lang: "Select language",
        prompt_tpl: "{pair}, expiration time {tf} — analyze the chart.",
        stages: ["Processing request…", "Collecting data…", "Building signal…"],
        lead: "Analysis complete. Priority signal — {dir}.",
        dir_buy: "BUY", dir_sell: "SELL",
        new_signal: "Get a new signal",
        until: "until", expired: "Expiration finished",
        win: "WIN", lose: "LOSE", neutral: "NEUTRAL",
        alert_title: "Signal Unavailable",
        alert_desc: "You cannot get a new signal right now because the previous signal is still active. Please wait for the timeframe to end.",
        alert_btn_got_it: "Got it",
        locked_hint: "Wait for the signal to finish · {time}",
        closed_title: "<b>Forex</b> is closed right now — no signal available.",
        closed_btn: "Switch to OTC to get a signal",
        error_text: "The analysis could not be completed. Try again in a moment.",
        error_btn: "Try again",
        tf: { "5s": "5 seconds", "15s": "15 seconds", "30s": "30 seconds", "1m": "1 minute", "2m": "2 minutes", "3m": "3 minutes", "4m": "4 minutes", "5m": "5 minutes", "15m": "15 minutes" },
        r_buy_a: ["Market structure: price holds above the local average.", "Market structure: short-term demand dominates.", "Market structure: higher lows on the last impulse."],
        r_buy_b: ["Confirmation: rejection from local support.", "Confirmation: momentum expands with the trend.", "Confirmation: buyers absorb the pullback."],
        r_sell_a: ["Market structure: price holds below the local average.", "Market structure: short-term supply dominates.", "Market structure: lower highs capping the move."],
        r_sell_b: ["Confirmation: rejection from local resistance.", "Confirmation: momentum fades on the rebound.", "Confirmation: sellers absorb the pullback."]
    },
    ru: {
        nav_home: "ГЛАВНАЯ", nav_broker: "БРОКЕР", nav_chat: "AI ЧАТ",
        access_title: "AI Чат закрыт",
        access_need_reg: "Зарегистрируйтесь в Pocket Option через Broker, чтобы открыть AI Чат.",
        access_need_deposit: "Нужен депозит от ${min}$. Ваш депозит: ${current}$.",
        access_open_broker: "Открыть Broker",
        access_error: "Откройте приложение через Telegram.",
        access_no_user: "Откройте приложение через Telegram.",
        chat_hero_sub: "Укажите инструмент, рынок и время экспирации — затем нажмите отправку, чтобы получить сигнал.",
        market_regular: "Обычный", market_otc: "OTC",
        sheet_pair: "Валютная пара", sheet_market: "Рынок", sheet_tf: "Время экспирации",
        sheet_model: "AI-модель", sheet_lang: "Выберите язык",
        prompt_tpl: "{pair}, время экспирации {tf} — проанализируй график.",
        stages: ["Обработка запроса…", "Сбор данных…", "Формирую сигнал…"],
        lead: "Анализ завершён. Приоритетный сигнал — {dir}.",
        dir_buy: "BUY (покупка)", dir_sell: "SELL (продажа)",
        new_signal: "Получить новый сигнал",
        until: "до", expired: "Экспирация завершена",
        win: "WIN", lose: "LOSE", neutral: "NEUTRAL",
        alert_title: "Сигнал недоступен",
        alert_desc: "Вы не можете получить сигнал сейчас, так как предыдущий сигнал ещё активен. Пожалуйста, дождитесь окончания таймфрейма.",
        alert_btn_got_it: "Понятно",
        locked_hint: "Дождитесь окончания сигнала · {time}",
        closed_title: "<b>Forex</b> сейчас закрыт — сигнал недоступен.",
        closed_btn: "Переключитесь на OTC, чтобы получить сигнал",
        error_text: "Не удалось завершить анализ. Попробуйте ещё раз через момент.",
        error_btn: "Попробовать снова",
        tf: { "5s": "5 секунд", "15s": "15 секунд", "30s": "30 секунд", "1m": "1 минута", "2m": "2 минуты", "3m": "3 минуты", "4m": "4 минуты", "5m": "5 минут", "15m": "15 минут" },
        r_buy_a: ["Структура рынка: цена закрепилась выше локальной средней.", "Структура рынка: краткосрочный спрос доминирует.", "Структура рынка: растущие минимумы на последнем импульсе."],
        r_buy_b: ["Подтверждение: отражение от локальной поддержки.", "Подтверждение: импульс расширяется по тренду.", "Подтверждение: покупатели выкупают откат."],
        r_sell_a: ["Структура рынка: цена закрепилась ниже локальной средней.", "Структура рынка: краткосрочное предложение доминирует.", "Структура рынка: снижающиеся максимумы ограничивают рост."],
        r_sell_b: ["Подтверждение: отражение от локального сопротивления.", "Подтверждение: импульс затухает на отскоке.", "Подтверждение: продавцы перекрывают откат."]
    },
    uz: {
        nav_home: "ASOSIY", nav_broker: "BROKER", nav_chat: "AI CHAT",
        access_title: "AI Chat locked",
        access_need_reg: "Register on Pocket Option via Broker to unlock AI Chat.",
        access_need_deposit: "Deposit at least ${min}. Your deposit: ${current}.",
        access_open_broker: "Open Broker",
        access_error: "Please open this app via Telegram.",
        access_no_user: "Please open this app via Telegram.",
        chat_hero_sub: "Instrument, bozor va ekspiratsiya vaqtini tanlang — so'ng signal olish uchun yuborishni bosing.",
        market_regular: "Oddiy", market_otc: "OTC",
        sheet_pair: "Valyuta juftligi", sheet_market: "Bozor", sheet_tf: "Ekspiratsiya vaqti",
        sheet_model: "AI model", sheet_lang: "Tilni tanlang",
        prompt_tpl: "{pair}, ekspiratsiya vaqti {tf} — grafikni tahlil qil.",
        stages: ["So\u0027rov qayta ishlanmoqda…", "Ma\u0027lumot yig\u0027ilmoqda…", "Signal shakllanmoqda…"],
        lead: "Tahlil yakunlandi. Ustuvor signal — {dir}.",
        dir_buy: "BUY (sotib olish)", dir_sell: "SELL (sotish)",
        new_signal: "Yangi signal olish",
        until: "gacha", expired: "Ekspiratsiya tugadi",
        win: "WIN", lose: "LOSE", neutral: "NEUTRAL",
        alert_title: "Signal mavjud emas",
        alert_desc: "Hozir yangi signal ololmaysiz, chunki oldingi signal hali faol. Iltimos, taymfreym tugashini kuting.",
        alert_btn_got_it: "Tushunarli",
        locked_hint: "Signal tugashini kuting · {time}",
        closed_title: "<b>Forex</b> hozir yopiq — signal mavjud emas.",
        closed_btn: "Signal olish uchun OTC ga o'ting",
        error_text: "Tahlilni yakunlab bo'lmadi. Bir lahzadan so'ng qayta urinib ko'ring.",
        error_btn: "Qayta urinish",
        tf: { "5s": "5 soniya", "15s": "15 soniya", "30s": "30 soniya", "1m": "1 daqiqa", "2m": "2 daqiqa", "3m": "3 daqiqa", "4m": "4 daqiqa", "5m": "5 daqiqa", "15m": "15 daqiqa" },
        r_buy_a: ["Bozor tuzilmasi: narx lokal o'rtachadan yuqorida ushlanmoqda.", "Bozor tuzilmasi: qisqa muddatli talab ustun.", "Bozor tuzilmasi: oxirgi impulsda minimumlar ko'tarilmoqda."],
        r_buy_b: ["Tasdiq: lokal qo'llab-quvvatlashdan qaytish.", "Tasdiq: impuls trend bo'ylab kengaymoqda.", "Tasdiq: xaridorlar tuzatishni qoplamoqda."],
        r_sell_a: ["Bozor tuzilmasi: narx lokal o'rtachadan pastda ushlanmoqda.", "Bozor tuzilmasi: qisqa muddatli taklif ustun.", "Bozor tuzilmasi: pasayuvchi maksimumlar o'sishni cheklaydi."],
        r_sell_b: ["Tasdiq: lokal qarshilikdan qaytish.", "Tasdiq: qaytishda impuls so'nmoqda.", "Tasdiq: sotuvchilar tuzatishni qoplamoqda."]
    },
    hi: {
        nav_home: "होम", nav_broker: "BROKER", nav_chat: "AI चैट",
        access_title: "AI Chat locked",
        access_need_reg: "Register on Pocket Option via Broker to unlock AI Chat.",
        access_need_deposit: "Deposit at least ${min}. Your deposit: ${current}.",
        access_open_broker: "Open Broker",
        access_error: "Please open this app via Telegram.",
        access_no_user: "Please open this app via Telegram.",
        chat_hero_sub: "इंस्ट्रूमेंट, मार्केट और एक्सपायरी चुनें — फिर सिग्नल पाने के लिए भेजें दबाएँ।",
        market_regular: "सामान्य", market_otc: "OTC",
        sheet_pair: "करेंसी पेयर", sheet_market: "मार्केट", sheet_tf: "एक्सपायरी समय",
        sheet_model: "AI मॉडल", sheet_lang: "भाषा चुनें",
        prompt_tpl: "{pair}, एक्सपायरी समय {tf} — चार्ट का विश्लेषण करें।",
        stages: ["अनुरोध संसाधित हो रहा है…", "डेटा एकत्र किया जा रहा है…", "सिग्नल बन रहा है…"],
        lead: "विश्लेषण पूरा। प्राथमिक सिग्नल — {dir}।",
        dir_buy: "BUY (खरीद)", dir_sell: "SELL (बिक्री)",
        new_signal: "नया सिग्नल प्राप्त करें",
        until: "तक", expired: "एक्सपायरी समाप्त",
        win: "WIN", lose: "LOSE", neutral: "NEUTRAL",
        alert_title: "सिग्नल उपलब्ध नहीं",
        alert_desc: "आप अभी नया सिग्नल नहीं ले सकते, क्योंकि पिछला सिग्नल अभी सक्रिय है। कृपया टाइमफ्रेम समाप्त होने की प्रतीक्षा करें।",
        alert_btn_got_it: "ठीक है",
        locked_hint: "सिग्नल समाप्त होने की प्रतीक्षा करें · {time}",
        closed_title: "<b>Forex</b> अभी बंद है — सिग्नल उपलब्ध नहीं।",
        closed_btn: "सिग्नल पाने के लिए OTC पर जाएँ",
        error_text: "विश्लेषण पूरा नहीं हो सका। कुछ देर बाद फिर कोशिश करें।",
        error_btn: "पुनः प्रयास करें",
        tf: { "5s": "5 सेकंड", "15s": "15 सेकंड", "30s": "30 सेकंड", "1m": "1 मिनट", "2m": "2 मिनट", "3m": "3 मिनट", "4m": "4 मिनट", "5m": "5 मिनट", "15m": "15 मिनट" },
        r_buy_a: ["मार्केट संरचना: कीमत स्थानीय औसत से ऊपर टिकी है।", "मार्केट संरचना: अल्पकालिक मांग हावी है।", "मार्केट संरचना: पिछले इम्पल्स पर ऊँचे निचले स्तर।"],
        r_buy_b: ["पुष्टि: स्थानीय सपोर्ट से वापसी।", "पुष्टि: ट्रेंड के साथ मोमेंटम बढ़ रहा है।", "पुष्टि: खरीदार गिरावट को सोख रहे हैं।"],
        r_sell_a: ["मार्केट संरचना: कीमत स्थानीय औसत से नीचे टिकी है।", "मार्केट संरचना: अल्पकालिक आपूर्ति हावी है।", "मार्केट संरचना: नीचे आते उच्च स्तर बढ़त रोक रहे हैं।"],
        r_sell_b: ["पुष्टि: स्थानीय रेज़िस्टेंस से वापसी।", "पुष्टि: रिबाउंड पर मोमेंटम कमजोर।", "पुष्टि: विक्रेता उछाल को सोख रहे हैं।"]
    },
    pt: {
        nav_broker: "BROKER", nav_home: "INÍCIO", nav_chat: "AI CHAT",
        access_title: "AI Chat locked",
        access_need_reg: "Register on Pocket Option via Broker to unlock AI Chat.",
        access_need_deposit: "Deposit at least ${min}. Your deposit: ${current}.",
        access_open_broker: "Open Broker",
        access_error: "Please open this app via Telegram.",
        access_no_user: "Please open this app via Telegram.",
        chat_hero_sub: "Defina o instrumento, o mercado e a expiração — depois toque em enviar para receber o sinal.",
        market_regular: "Regular", market_otc: "OTC",
        sheet_pair: "Par de moedas", sheet_market: "Mercado", sheet_tf: "Tempo de expiração",
        sheet_model: "Modelo de IA", sheet_lang: "Selecione o idioma",
        prompt_tpl: "{pair}, tempo de expiração {tf} — analise o gráfico.",
        stages: ["Processando a solicitação…", "Coletando dados…", "Gerando o sinal…"],
        lead: "Análise concluída. Sinal prioritário — {dir}.",
        dir_buy: "BUY (compra)", dir_sell: "SELL (venda)",
        new_signal: "Receber um novo sinal",
        until: "até", expired: "Expiração concluída",
        win: "WIN", lose: "LOSE", neutral: "NEUTRAL",
        alert_title: "Sinal indisponível",
        alert_desc: "Você não pode receber um novo sinal agora porque o sinal anterior ainda está ativo. Aguarde o fim do timeframe.",
        alert_btn_got_it: "Entendi",
        locked_hint: "Aguarde o fim do sinal · {time}",
        closed_title: "<b>Forex</b> está fechado agora — sinal indisponível.",
        closed_btn: "Mude para OTC para receber um sinal",
        error_text: "Não foi possível concluir a análise. Tente novamente em instantes.",
        error_btn: "Tentar novamente",
        tf: { "5s": "5 segundos", "15s": "15 segundos", "30s": "30 segundos", "1m": "1 minuto", "2m": "2 minutos", "3m": "3 minutos", "4m": "4 minutos", "5m": "5 minutos", "15m": "15 minutos" },
        r_buy_a: ["Estrutura de mercado: o preço se mantém acima da média local.", "Estrutura de mercado: a demanda de curto prazo domina.", "Estrutura de mercado: fundos ascendentes no último impulso."],
        r_buy_b: ["Confirmação: rejeição no suporte local.", "Confirmação: o momentum se expande com a tendência.", "Confirmação: compradores absorvem a correção."],
        r_sell_a: ["Estrutura de mercado: o preço se mantém abaixo da média local.", "Estrutura de mercado: a oferta de curto prazo domina.", "Estrutura de mercado: topos descendentes limitam a alta."],
        r_sell_b: ["Confirmação: rejeição na resistência local.", "Confirmação: o momentum enfraquece no repique.", "Confirmação: vendedores absorvem a correção."]
    },
    ar: {
        nav_broker: "BROKER", nav_home: "الرئيسية", nav_chat: "محادثة AI",
        access_title: "AI Chat locked",
        access_need_reg: "Register on Pocket Option via Broker to unlock AI Chat.",
        access_need_deposit: "Deposit at least ${min}. Your deposit: ${current}.",
        access_open_broker: "Open Broker",
        access_error: "Please open this app via Telegram.",
        access_no_user: "Please open this app via Telegram.",
        chat_hero_sub: "حدّد الأداة والسوق ووقت الانتهاء — ثم اضغط إرسال للحصول على الإشارة.",
        market_regular: "عادي", market_otc: "OTC",
        sheet_pair: "زوج العملات", sheet_market: "السوق", sheet_tf: "وقت الانتهاء",
        sheet_model: "نموذج الذكاء الاصطناعي", sheet_lang: "اختر اللغة",
        prompt_tpl: "{pair}، وقت الانتهاء {tf} — حلّل الرسم البياني.",
        stages: ["جاري معالجة الطلب…", "جاري جمع البيانات…", "جاري تكوين الإشارة…"],
        lead: "اكتمل التحليل. الإشارة ذات الأولوية — {dir}.",
        dir_buy: "BUY (شراء)", dir_sell: "SELL (بيع)",
        new_signal: "احصل على إشارة جديدة",
        until: "حتى", expired: "انتهى وقت الصفقة",
        win: "WIN", lose: "LOSE", neutral: "NEUTRAL",
        alert_title: "الإشارة غير متاحة",
        alert_desc: "لا يمكنك الحصول على إشارة جديدة الآن لأن الإشارة السابقة ما زالت نشطة. يرجى انتظار انتهاء الإطار الزمني.",
        alert_btn_got_it: "حسناً",
        locked_hint: "انتظر انتهاء الإشارة · {time}",
        closed_title: "<b>Forex</b> مغلق الآن — لا تتوفر إشارة.",
        closed_btn: "انتقل إلى OTC للحصول على إشارة",
        error_text: "تعذّر إكمال التحليل. حاول مرة أخرى بعد قليل.",
        error_btn: "حاول مرة أخرى",
        tf: { "5s": "5 ثوانٍ", "15s": "15 ثانية", "30s": "30 ثانية", "1m": "دقيقة واحدة", "2m": "دقيقتان", "3m": "3 دقائق", "4m": "4 دقائق", "5m": "5 دقائق", "15m": "15 دقيقة" },
        r_buy_a: ["بنية السوق: السعر يثبت فوق المتوسط المحلي.", "بنية السوق: الطلب قصير المدى هو المسيطر.", "بنية السوق: قيعان صاعدة على الدفعة الأخيرة."],
        r_buy_b: ["تأكيد: ارتداد من الدعم المحلي.", "تأكيد: الزخم يتوسع مع الاتجاه.", "تأكيد: المشترون يمتصون التصحيح."],
        r_sell_a: ["بنية السوق: السعر يثبت تحت المتوسط المحلي.", "بنية السوق: العرض قصير المدى هو المسيطر.", "بنية السوق: قمم هابطة تحد من الصعود."],
        r_sell_b: ["تأكيد: ارتداد من المقاومة المحلية.", "تأكيد: الزخم يضعف عند الارتداد.", "تأكيد: البائعون يمتصون التصحيح."]
    },
    kz: {
        nav_broker: "BROKER", nav_home: "БАСТЫ", nav_chat: "AI ЧАТ",
        access_title: "AI Чат закрыт",
        access_need_reg: "Зарегистрируйтесь в Pocket Option через Broker, чтобы открыть AI Чат.",
        access_need_deposit: "Нужен депозит от ${min}$. Ваш депозит: ${current}$.",
        access_open_broker: "Открыть Broker",
        access_error: "Откройте приложение через Telegram.",
        access_no_user: "Откройте приложение через Telegram.",
        chat_hero_sub: "Құралды, нарықты және экспирация уақытын таңдаңыз — содан соң сигнал алу үшін жіберуді басыңыз.",
        market_regular: "Қарапайым", market_otc: "OTC",
        sheet_pair: "Валюта жұбы", sheet_market: "Нарық", sheet_tf: "Экспирация уақыты",
        sheet_model: "AI моделі", sheet_lang: "Тілді таңдаңыз",
        prompt_tpl: "{pair}, экспирация уақыты {tf} — графикті талда.",
        stages: ["Сұраныс өңделуде…", "Деректер жиналуда…", "Сигнал жасалуда…"],
        lead: "Талдау аяқталды. Басым сигнал — {dir}.",
        dir_buy: "BUY (сатып алу)", dir_sell: "SELL (сату)",
        new_signal: "Жаңа сигнал алу",
        until: "дейін", expired: "Экспирация аяқталды",
        win: "WIN", lose: "LOSE", neutral: "NEUTRAL",
        alert_title: "Сигнал қолжетімсіз",
        alert_desc: "Қазір жаңа сигнал ала алмайсыз, себебі алдыңғы сигнал әлі белсенді. Таймфрейм аяқталуын күтіңіз.",
        alert_btn_got_it: "Түсінікті",
        locked_hint: "Сигналдың аяқталуын күтіңіз · {time}",
        closed_title: "<b>Forex</b> қазір жабық — сигнал қолжетімсіз.",
        closed_btn: "Сигнал алу үшін OTC-ге ауысыңыз",
        error_text: "Талдауды аяқтау мүмкін болмады. Сәлден соң қайталап көріңіз.",
        error_btn: "Қайталау",
        tf: { "5s": "5 секунд", "15s": "15 секунд", "30s": "30 секунд", "1m": "1 минут", "2m": "2 минут", "3m": "3 минут", "4m": "4 минут", "5m": "5 минут", "15m": "15 минут" },
        r_buy_a: ["Нарық құрылымы: баға жергілікті орташадан жоғары бекіді.", "Нарық құрылымы: қысқа мерзімді сұраныс басым.", "Нарық құрылымы: соңғы импульсте минимумдар өсуде."],
        r_buy_b: ["Растау: жергілікті қолдаудан қайту.", "Растау: импульс трендпен кеңеюде.", "Растау: сатып алушылар түзетуді сіңіруде."],
        r_sell_a: ["Нарық құрылымы: баға жергілікті орташадан төмен бекіді.", "Нарық құрылымы: қысқа мерзімді ұсыныс басым.", "Нарық құрылымы: төмендеуші максимумдар өсуді шектейді."],
        r_sell_b: ["Растау: жергілікті кедергіден қайту.", "Растау: серпілісте импульс әлсіреуде.", "Растау: сатушылар түзетуді сіңіруде."]
    }
};

/* ------------------------------- STATE -------------------------------- */

const LS_LANG = "trade_ai_lang";
const LS_MODEL = "nova_chat_model";
const LS_SIGNAL = "nova_chat_signal";

let lang = localStorage.getItem(LS_LANG) || "en";
if (!T[lang]) lang = "en";

let model = ALL_MODELS.find(m => m.id === localStorage.getItem(LS_MODEL)) || ALL_MODELS[0];
let isOTC = false;
let pair = STANDARD_PAIRS[0];
let tf = STANDARD_TFS[0];

let busy = false;            // request in flight
let activeSignal = null;     // signal currently counting down
let tickTimer = null;
let tgUser = null;

/* -------------------------------- DOM --------------------------------- */

const $ = id => document.getElementById(id);

const el = {
    html: document.documentElement,
    stage: $("stage"),
    thread: $("thread"),
    heroName: $("heroName"),
    heroSub: $("heroSub"),
    heroLogoUse: $("heroLogoUse"),
    chipPair: $("chipPair"),
    chipPairText: $("chipPairText"),
    chipPairFlags: $("chipPairFlags"),
    chipMarket: $("chipMarket"),
    chipMarketText: $("chipMarketText"),
    chipTf: $("chipTf"),
    chipTfText: $("chipTfText"),
    promptText: $("promptText"),
    modelPill: $("modelPill"),
    modelPillName: $("modelPillName"),
    modelPillLogoUse: $("modelPillLogoUse"),
    sendBtn: $("sendBtn"),
    sendIconUse: $("sendIconUse"),
    langBtn: $("langBtn"),
    sheet: $("sheet"),
    sheetBackdrop: $("sheetBackdrop"),
    sheetTitle: $("sheetTitle"),
    sheetBody: $("sheetBody"),
    sheetClose: $("sheetClose"),
    alertModal: $("alertModal"),
    closeAlertBtn: $("closeAlertBtn"),
    userInfo: $("userInfo"),
    userAvatar: $("userAvatar")
};

/* ------------------------------ HELPERS ------------------------------- */

const t = key => (T[lang] && T[lang][key]) !== undefined ? T[lang][key] : T.en[key];

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function formatPair(code) {
    const otc = code.endsWith(" OTC");
    const raw = otc ? code.slice(0, -4) : code;
    return raw.slice(0, 3) + "/" + raw.slice(3, 6) + (otc ? " OTC" : "");
}

function apiPair(code) {
    return code.endsWith(" OTC") ? code.slice(0, -4) : code;
}

const COUNTRY = { EUR: "eu", USD: "us", GBP: "gb", JPY: "jp", CHF: "ch", CAD: "ca", AUD: "au", NZD: "nz" };

function flagsHTML(code) {
    const raw = apiPair(code);
    const a = COUNTRY[raw.slice(0, 3)];
    const b = COUNTRY[raw.slice(3, 6)];
    if (!a || !b) return "";
    return '<span class="pair-icons">' +
        '<img class="currency-icon base" src="/assets/flags/' + a + '.svg" alt="">' +
        '<img class="currency-icon quote" src="/assets/flags/' + b + '.svg" alt="">' +
        '</span>';
}

function tfSeconds(code) {
    if (code.endsWith("s")) return parseInt(code, 10);
    if (code.endsWith("m")) return parseInt(code, 10) * 60;
    return 60;
}

function tfWords(code) {
    const map = t("tf");
    return map[code] || code;
}

function clockTime(ms) {
    return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function mmss(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}

function svgUse(href, cls) {
    return '<svg class="' + (cls || "") + '"><use href="' + href + '"></use></svg>';
}

function promptString() {
    return t("prompt_tpl")
        .replace("{pair}", formatPair(pair))
        .replace("{tf}", tfWords(tf));
}

/* ------------------------------ RENDERING ----------------------------- */

function applyStaticText() {
    document.querySelectorAll("[data-i18n]").forEach(node => {
        const key = node.getAttribute("data-i18n");
        const val = t(key);
        if (typeof val === "string") node.textContent = val;
    });
}

let renderedFlagsFor = null;

function renderComposer() {
    // the market chip already states OTC — no need to repeat it here
    el.chipPairText.textContent = formatPair(pair).replace(" OTC", "");
    // the flag images are only rebuilt when the pair actually changes, so the
    // countdown tick does not re-request them four times a second
    if (renderedFlagsFor !== pair) {
        el.chipPairFlags.innerHTML = flagsHTML(pair);
        renderedFlagsFor = pair;
    }
    el.chipMarketText.textContent = isOTC ? t("market_otc") : t("market_regular");
    el.chipTfText.textContent = tf;

    if (activeSignal) {
        const left = activeSignal.startTime + activeSignal.duration - Date.now();
        el.promptText.classList.add("is-placeholder");
        el.promptText.textContent = t("locked_hint").replace("{time}", mmss(left));
    } else {
        el.promptText.classList.remove("is-placeholder");
        el.promptText.innerHTML = promptString()
            .replace(formatPair(pair), '<span class="p-hl">' + formatPair(pair) + "</span>");
    }

    // an active signal keeps the button tappable so it can explain the wait;
    // only an in-flight request blocks the tap outright
    el.sendBtn.disabled = busy;
    el.sendBtn.classList.toggle("is-locked", busy || !!activeSignal);
    el.sendIconUse.setAttribute("href", activeSignal ? "#ic-lock" : "#ic-send");
}

function renderModel() {
    el.html.setAttribute("data-theme", model.theme);
    el.heroName.textContent = model.name;
    el.heroLogoUse.setAttribute("href", model.logo);
    el.modelPillName.textContent = model.name;
    el.modelPillLogoUse.setAttribute("href", model.logo);
}

function setThreadVisible(on) {
    el.stage.classList.toggle("has-thread", on);
}

function clearThread() {
    el.thread.innerHTML = "";
    setThreadVisible(false);
}

function scrollBottom() {
    requestAnimationFrame(() => { el.stage.scrollTop = el.stage.scrollHeight; });
}

function pushUser(text) {
    const node = document.createElement("div");
    node.className = "msg-user";
    node.textContent = text;
    el.thread.appendChild(node);
    setThreadVisible(true);
    scrollBottom();
}

function pushAI() {
    const wrap = document.createElement("div");
    wrap.className = "msg-ai";
    wrap.innerHTML =
        '<div class="msg-ai-avatar">' + svgUse(model.logo) + "</div>" +
        '<div class="msg-ai-body"></div>';
    el.thread.appendChild(wrap);
    setThreadVisible(true);
    scrollBottom();
    return wrap.querySelector(".msg-ai-body");
}

/* The bubble walks through "processing / collecting / building" while the
   signal is produced, then holds on the last stage. */
function thinkingNode() {
    const node = document.createElement("div");
    node.className = "thinking";
    const stages = t("stages");
    node.innerHTML = '<span class="thinking-orb"></span><span class="thinking-label">' + stages[0] + "</span>";

    const label = node.querySelector(".thinking-label");
    let i = 0;
    const timer = setInterval(() => {
        i += 1;
        if (i >= stages.length - 1) clearInterval(timer);
        label.textContent = stages[Math.min(i, stages.length - 1)];
    }, THINK_STAGE_MS);
    node._stop = () => clearInterval(timer);
    return node;
}

function leadNode(dir) {
    const node = document.createElement("div");
    node.className = "msg-ai-lead";
    node.textContent = t("lead").replace("{dir}", dir === "BUY" ? t("dir_buy") : t("dir_sell"));
    return node;
}

function signNode() {
    const node = document.createElement("div");
    node.className = "msg-sign";
    node.innerHTML = svgUse(model.logo) + "<span>" + model.name + "</span>";
    return node;
}

/* ---------------------------- SIGNAL CARD ----------------------------- */

const THINK_STAGE_MS = 950;
const THINK_MIN_MS = 2700;

const RING_R = 11;
const RING_C = 2 * Math.PI * RING_R;

function buildCard(sig) {
    const dir = sig.signal === "BUY" ? "buy" : "sell";
    const acc = Math.round(Number(sig.confidence) || 0);
    const offset = RING_C * (1 - acc / 100);

    const wrap = document.createElement("div");
    wrap.className = "sig-wrap";
    wrap.innerHTML =
        '<div class="sig-card ' + dir + '">' +
            '<div class="sig-head">' +
                '<div class="sig-dir">' +
                    svgUse(dir === "buy" ? "#ic-tri-up" : "#ic-tri-down") +
                    "<span>" + (dir === "buy" ? "BUY" : "SELL") + "</span>" +
                "</div>" +
                '<div class="sig-acc">' +
                    '<svg class="sig-ring" viewBox="0 0 26 26">' +
                        '<circle class="ring-track" cx="13" cy="13" r="' + RING_R + '"></circle>' +
                        '<circle class="ring-fill" cx="13" cy="13" r="' + RING_R + '" ' +
                            'stroke-dasharray="' + RING_C.toFixed(2) + '" ' +
                            'stroke-dashoffset="' + RING_C.toFixed(2) + '"></circle>' +
                    "</svg>" +
                    '<span class="sig-acc-val">' + acc + "%</span>" +
                "</div>" +
            "</div>" +
            '<div class="sig-meta">' +
                '<span class="sig-tag">' + flagsHTML(sig.pair) + "<span>" + formatPair(sig.pair) + "</span></span>" +
                '<span class="sig-tag">' + sig.tf + "</span>" +
            "</div>" +
            '<div class="sig-reasons">' +
                '<div class="sig-reason">' + sig.reasons[0] + "</div>" +
                '<div class="sig-reason">' + sig.reasons[1] + "</div>" +
            "</div>" +
            '<div class="sig-progress">' +
                '<div class="sig-track"><div class="sig-fill"></div></div>' +
                '<div class="sig-progress-row">' +
                    "<span class=\"sig-status\">" + t("until") + " " + clockTime(sig.startTime + sig.duration) + "</span>" +
                    '<span class="sig-pct">0%</span>' +
                "</div>" +
            "</div>" +
            '<button type="button" class="sig-action">' + svgUse("#ic-refresh") + "<span>" + t("new_signal") + "</span></button>" +
        "</div>";

    // animate the ring after paint
    requestAnimationFrame(() => {
        const ring = wrap.querySelector(".ring-fill");
        if (ring) ring.setAttribute("stroke-dashoffset", offset.toFixed(2));
    });

    wrap.querySelector(".sig-action").addEventListener("click", () => {
        if (activeSignal) { openAlert(); return; }
        requestSignal();
    });
    return wrap;
}

/* actions: [{ label, onClick, ghost }] — first one is the primary button */
function noticeNode(html, actions) {
    const node = document.createElement("div");
    node.className = "notice";
    node.innerHTML = '<div class="notice-text">' + html + "</div>";
    (actions || []).forEach(a => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = a.ghost ? "notice-btn ghost" : "notice-btn";
        b.textContent = a.label;
        b.addEventListener("click", a.onClick);
        node.appendChild(b);
    });
    return node;
}

/* --------------------------- COUNTDOWN LOOP ---------------------------- */

function stopTick() {
    if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
}

function startTick() {
    stopTick();
    tickTimer = setInterval(onTick, 250);
    onTick();
}

function onTick() {
    if (!activeSignal) { stopTick(); return; }

    const now = Date.now();
    const elapsed = now - activeSignal.startTime;
    const pct = Math.min(100, (elapsed / activeSignal.duration) * 100);

    const card = el.thread.querySelector(".sig-wrap");
    if (card) {
        const fill = card.querySelector(".sig-fill");
        const pctEl = card.querySelector(".sig-pct");
        if (fill) fill.style.width = pct.toFixed(1) + "%";
        if (pctEl) pctEl.textContent = Math.floor(pct) + "%";
    }

    renderComposer();

    if (elapsed >= activeSignal.duration) {
        const finished = activeSignal;
        stopTick();
        activeSignal = null;
        localStorage.removeItem(LS_SIGNAL);
        finishSignal(finished);
        renderComposer();
    }
}

async function finishSignal(sig) {
    const card = el.thread.querySelector(".sig-wrap");
    const status = card ? card.querySelector(".sig-status") : null;
    const action = card ? card.querySelector(".sig-action") : null;
    if (action) action.disabled = false;

    if (sig.type !== "REGULAR" || !sig.price) {
        if (status) status.textContent = t("expired");
        return;
    }

    try {
        const r = await fetch(API_URL + "/signal?pair=" + encodeURIComponent(sig.apiPair) + "&tf=" + encodeURIComponent(sig.tf));
        if (!r.ok) throw new Error("no result");
        const latest = await r.json();
        const newPrice = Number(latest.price);
        const basePrice = Number(sig.price);

        let outcome = "LOSE";
        if (newPrice === basePrice) outcome = "NEUTRAL";
        else if (sig.signal === "BUY") outcome = newPrice > basePrice ? "WIN" : "LOSE";
        else outcome = newPrice < basePrice ? "WIN" : "LOSE";

        if (sig.id) {
            fetch(API_URL + "/signal/check?signal_id=" + encodeURIComponent(sig.id) + "&current_price=" + newPrice, { method: "POST" })
                .catch(() => {});
        }

        if (status) {
            status.outerHTML = '<span class="sig-stamp ' + outcome.toLowerCase() + '">' + t(outcome.toLowerCase()) + "</span>";
        }
    } catch (_) {
        if (status) status.textContent = t("expired");
    }
}

/* ---------------------------- SIGNAL FLOW ------------------------------ */

function reasonsFor(dir) {
    return dir === "BUY"
        ? [pick(t("r_buy_a")), pick(t("r_buy_b"))]
        : [pick(t("r_sell_a")), pick(t("r_sell_b"))];
}

async function requestSignal() {
    if (busy) return;
    if (activeSignal) { openAlert(); return; }

    busy = true;
    renderComposer();

    // one signal at a time: the previous exchange is wiped
    clearThread();
    pushUser(promptString());
    const body = pushAI();
    const think = thinkingNode();
    body.appendChild(think);
    scrollBottom();

    const askedAt = Date.now();
    const startedPair = pair;
    const startedTf = tf;
    const startedOTC = isOTC;

    try {
        let sig;

        if (startedOTC) {
            const dir = Math.random() > 0.5 ? "BUY" : "SELL";
            sig = {
                type: "OTC",
                pair: startedPair,
                apiPair: apiPair(startedPair),
                tf: startedTf,
                signal: dir,
                confidence: Math.floor(Math.random() * 14) + 85,
                price: null,
                id: null
            };
        } else {
            const params = new URLSearchParams({ pair: apiPair(startedPair), tf: startedTf });
            if (tgUser && tgUser.id) params.append("user_id", tgUser.id);
            const resp = await fetch(API_URL + "/run?" + params.toString(), { method: "POST" });
            if (!resp.ok) {
                let detail = "";
                try { detail = (await resp.json()).detail || ""; } catch (_) {}
                const err = new Error(detail || "request failed");
                err.closed = /clos|weekend|holiday|market|forex|session|unavail|недоступ|выход|закр|рынок|сесси/i.test(detail);
                throw err;
            }
            const data = (await resp.json()).data;
            sig = {
                type: "REGULAR",
                pair: startedPair,
                apiPair: apiPair(startedPair),
                tf: startedTf,
                signal: data.signal,
                confidence: data.confidence,
                price: data.price,
                id: data.id
            };
        }

        // hold the bubble long enough for the three stages to read as real work
        const spent = Date.now() - askedAt;
        if (spent < THINK_MIN_MS) {
            await new Promise(r => setTimeout(r, THINK_MIN_MS - spent + Math.random() * 500));
        }
        think._stop();

        sig.reasons = reasonsFor(sig.signal);
        sig.startTime = Date.now();
        sig.duration = tfSeconds(startedTf) * 1000;

        think.remove();
        body.appendChild(leadNode(sig.signal));
        body.appendChild(buildCard(sig));
        body.appendChild(signNode());
        scrollBottom();

        activeSignal = sig;
        localStorage.setItem(LS_SIGNAL, JSON.stringify({ ...sig, model: model.id }));
        startTick();

    } catch (e) {
        think._stop();
        think.remove();
        const toOTC = () => { setMarket(true); requestSignal(); };
        if (e && e.closed) {
            body.appendChild(noticeNode(t("closed_title"), [{ label: t("closed_btn"), onClick: toOTC }]));
        } else {
            // the backend wording for a closed market is not guaranteed, so the
            // OTC escape hatch is offered on any Regular failure
            body.appendChild(noticeNode(t("error_text"), [
                { label: t("error_btn"), onClick: () => requestSignal() },
                startedOTC ? null : { label: t("closed_btn"), onClick: toOTC, ghost: true }
            ].filter(Boolean)));
        }
        body.appendChild(signNode());
        scrollBottom();
    } finally {
        busy = false;
        renderComposer();
    }
}

function restoreSignal() {
    const raw = localStorage.getItem(LS_SIGNAL);
    if (!raw) return;

    let sig;
    try { sig = JSON.parse(raw); } catch (_) { localStorage.removeItem(LS_SIGNAL); return; }

    if (!sig || Date.now() - sig.startTime >= sig.duration) {
        localStorage.removeItem(LS_SIGNAL);
        return;
    }

    // detached = the user moved to another model; only the cooldown survives,
    // the chat stays empty and the current model selection is untouched
    if (sig.detached) {
        activeSignal = sig;
        startTick();
        return;
    }

    // a stored signal belongs to the model that produced it
    const owner = ALL_MODELS.find(m => m.id === sig.model);
    if (owner) { model = owner; renderModel(); }

    isOTC = sig.type === "OTC";
    pair = sig.pair;
    tf = sig.tf;

    clearThread();
    pushUser(promptString());
    const body = pushAI();
    body.appendChild(leadNode(sig.signal));
    body.appendChild(buildCard(sig));
    body.appendChild(signNode());

    activeSignal = sig;
    const action = el.thread.querySelector(".sig-action");
    if (action) action.disabled = true;
    startTick();
}

/* ------------------------------- SHEETS -------------------------------- */

let sheetOwner = null;

function openSheet(title, html, owner) {
    el.sheetTitle.textContent = title;
    el.sheetBody.innerHTML = html;
    el.sheetBody.scrollTop = 0;
    el.sheet.classList.add("open");
    el.sheetBackdrop.classList.add("open");
    // bring the current choice into view on long lists
    requestAnimationFrame(() => {
        const sel = el.sheetBody.querySelector(".opt.selected");
        if (sel && sel.offsetTop > el.sheetBody.clientHeight - 90) {
            el.sheetBody.scrollTop = sel.offsetTop - el.sheetBody.clientHeight / 2 + 30;
        }
    });
    sheetOwner = owner || null;
    if (sheetOwner) sheetOwner.classList.add("is-open");
}

function closeSheet() {
    el.sheet.classList.remove("open");
    el.sheetBackdrop.classList.remove("open");
    if (sheetOwner) sheetOwner.classList.remove("is-open");
    sheetOwner = null;
}

function optHTML(value, label, opts) {
    const o = opts || {};
    return '<button type="button" class="opt' + (o.selected ? " selected" : "") + '"' +
        ' data-value="' + value + '"' + (o.family ? ' data-family="' + o.family + '"' : "") + ">" +
        (o.lead || "") +
        '<span class="opt-label">' + label + (o.sub ? ' <span class="opt-sub">· ' + o.sub + "</span>" : "") + "</span>" +
        svgUse("#ic-check", "opt-check") +
        "</button>";
}

function onSheetPick(handler) {
    el.sheetBody.querySelectorAll(".opt").forEach(node => {
        node.addEventListener("click", () => {
            handler(node.getAttribute("data-value"));
            closeSheet();
        });
    });
}

function openPairSheet() {
    const list = isOTC ? OTC_PAIRS : STANDARD_PAIRS;
    const html = list.map(p => optHTML(p, formatPair(p), {
        selected: p === pair,
        lead: '<span class="opt-flags">' + flagsHTML(p) + "</span>"
    })).join("");
    openSheet(t("sheet_pair"), html, el.chipPair);
    onSheetPick(v => { pair = v; renderComposer(); });
}

function openMarketSheet() {
    const html =
        optHTML("regular", t("market_regular"), { selected: !isOTC }) +
        optHTML("otc", t("market_otc"), { selected: isOTC });
    openSheet(t("sheet_market"), html, el.chipMarket);
    onSheetPick(v => setMarket(v === "otc"));
}

function openTfSheet() {
    const list = isOTC ? OTC_TFS : STANDARD_TFS;
    const html = list.map(x => optHTML(x, x, { selected: x === tf, sub: tfWords(x) })).join("");
    openSheet(t("sheet_tf"), html, el.chipTf);
    onSheetPick(v => { tf = v; renderComposer(); });
}

function openModelSheet() {
    const html = MODEL_FAMILIES.map(f =>
        '<div class="group-label">' + f.label + "</div>" +
        f.models.map(m => optHTML(m.id, m.name, {
            selected: m.id === model.id,
            sub: m.sub,
            family: f.id,
            lead: '<span class="opt-logo">' + svgUse(f.logo) + "</span>"
        })).join("")
    ).join("");
    openSheet(t("sheet_model"), html, el.modelPill);
    onSheetPick(setModel);
}

function openLangSheet() {
    const html = LANGS.map(l => optHTML(l.code, l.name, {
        selected: l.code === lang,
        lead: '<img class="lang-flag" src="/assets/flags/' + l.flag + '.svg" alt="">'
    })).join("");
    openSheet(t("sheet_lang"), html, null);
    onSheetPick(setLang);
}

/* ------------------------------ MUTATIONS ------------------------------ */

function setMarket(otc) {
    if (isOTC === otc) return;
    isOTC = otc;
    const pairs = isOTC ? OTC_PAIRS : STANDARD_PAIRS;
    const tfs = isOTC ? OTC_TFS : STANDARD_TFS;
    // keep the same instrument across markets when it exists there
    const twin = pairs.find(p => apiPair(p) === apiPair(pair));
    pair = twin || pairs[0];
    if (!tfs.includes(tf)) tf = tfs[0];
    renderComposer();
}

function setModel(id) {
    const next = ALL_MODELS.find(m => m.id === id);
    if (!next || next.id === model.id) return;
    model = next;
    localStorage.setItem(LS_MODEL, model.id);

    // Switching the model starts a clean chat — no mixing between models.
    // A running signal keeps its countdown though, otherwise hopping between
    // models would be a free way around the cooldown. It just goes card-less:
    // the composer shows the remaining time until it expires.
    clearThread();
    if (activeSignal) {
        activeSignal.detached = true;
        localStorage.setItem(LS_SIGNAL, JSON.stringify({ ...activeSignal, model: model.id }));
    }

    renderModel();
    renderComposer();
}

function setLang(code) {
    if (!T[code]) return;
    lang = code;
    localStorage.setItem(LS_LANG, code);
    applyStaticText();
    el.heroSub.textContent = t("chat_hero_sub");
    renderComposer();
    // the visible exchange is rebuilt in the new language
    if (activeSignal && !activeSignal.detached) {
        activeSignal.reasons = reasonsFor(activeSignal.signal);
        localStorage.setItem(LS_SIGNAL, JSON.stringify({ ...activeSignal, model: model.id }));
        clearThread();
        pushUser(promptString());
        const body = pushAI();
        body.appendChild(leadNode(activeSignal.signal));
        body.appendChild(buildCard(activeSignal));
        body.appendChild(signNode());
        startTick();
    } else {
        clearThread();
    }
}

/* -------------------------------- ALERT -------------------------------- */

function openAlert() { el.alertModal.classList.add("open"); }
function closeAlert() { el.alertModal.classList.remove("open"); }

/* ------------------------------- WIRING -------------------------------- */

el.chipPair.addEventListener("click", openPairSheet);
el.chipMarket.addEventListener("click", openMarketSheet);
el.chipTf.addEventListener("click", openTfSheet);
el.modelPill.addEventListener("click", openModelSheet);
el.langBtn.addEventListener("click", openLangSheet);

el.sheetClose.addEventListener("click", closeSheet);
el.sheetBackdrop.addEventListener("click", closeSheet);

el.sendBtn.addEventListener("click", () => {
    if (activeSignal) { openAlert(); return; }
    requestSignal();
});

el.closeAlertBtn.addEventListener("click", closeAlert);
el.alertModal.addEventListener("click", e => { if (e.target === el.alertModal) closeAlert(); });

/* ------------------------------ TELEGRAM ------------------------------- */

const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;

/**
 * In fullscreen Telegram paints its own Close / collapse / menu controls on top
 * of the page. `contentSafeAreaInset` is how the client reports that strip, so
 * the header has to start below it instead of underneath the buttons.
 */
function applyTgInsets() {
    if (!tg) return;

    const sa = tg.safeAreaInset || {};
    const csa = tg.contentSafeAreaInset || {};
    const statusBar = sa.top || 0;

    let top = statusBar + (csa.top || 0);
    const bottom = (sa.bottom || 0) + (csa.bottom || 0);

    // some client versions report a 0 content inset while still overlaying the
    // controls — keep the button strip clear anyway
    if (tg.isFullscreen && top < statusBar + 46) top = statusBar + 46;

    const root = document.documentElement.style;
    if (top) root.setProperty("--tg-top", top + "px");
    if (bottom) root.setProperty("--tg-bottom", bottom + "px");
}

if (tg) {
    try {
        tg.ready();
        tg.expand();
        if (tg.requestFullscreen) tg.requestFullscreen();

        applyTgInsets();
        if (tg.onEvent) {
            ["safeAreaChanged", "contentSafeAreaChanged", "fullscreenChanged", "viewportChanged"]
                .forEach(ev => tg.onEvent(ev, applyTgInsets));
        }
        // the insets land a beat after fullscreen is granted
        setTimeout(applyTgInsets, 300);
        setTimeout(applyTgInsets, 1200);

        let u = tg.initDataUnsafe && tg.initDataUnsafe.user ? tg.initDataUnsafe.user : null;
        if (!u && tg.initData) {
            try {
                const userRaw = new URLSearchParams(tg.initData).get("user");
                if (userRaw) u = JSON.parse(userRaw);
            } catch (_) {}
        }

        if (u) {
            tgUser = u;
            const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || ("ID " + u.id);
            if (el.userInfo) el.userInfo.textContent = name;
            if (el.userAvatar) {
                const fallback = "https://ui-avatars.com/api/?name=" + encodeURIComponent(name) + "&background=1a1c22&color=e5e7eb&size=128";
                el.userAvatar.src = u.username ? ("https://unavatar.io/telegram/" + u.username) : fallback;
                el.userAvatar.onerror = () => { el.userAvatar.src = fallback; };
            }
            fetch(API_URL + "/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: u.id,
                    username: u.username,
                    first_name: u.first_name,
                    last_name: u.last_name,
                    language_code: u.language_code,
                    is_premium: u.is_premium
                })
            }).catch(() => {});
        }
    } catch (_) {}
}

/* --------------------------------- BOOT -------------------------------- */

applyStaticText();
el.heroSub.textContent = t("chat_hero_sub");
renderModel();
renderComposer();
restoreSignal();


/* Broker + chat access gate */
(function bootAccess() {
    if (!window.AppAccess) return;

    function i18nBag() {
        const code = (typeof lang !== "undefined" && lang) || "en";
        return (typeof T !== "undefined" && (T[code] || T.en)) || {};
    }

    function setChatLocked(locked) {
        document.body.classList.toggle("chat-locked", !!locked);
        const main = document.querySelector("main.stage");
        const composer = document.getElementById("composer");
        if (main) main.style.pointerEvents = locked ? "none" : "";
        if (composer) composer.style.pointerEvents = locked ? "none" : "";
    }

    window.AppAccess.bindNav({
        getI18n: i18nBag,
        onUnlockedChat: () => {
            setChatLocked(false);
            window.AppAccess.closeBroker();
        },
    });

    window.AppAccess.ensureChatAccess(i18nBag()).then((ok) => {
        const user = window.AppAccess.getTelegramUser();
        if (!user || !user.id) {
            setChatLocked(true);
            const nav = document.querySelector(".bottom-nav");
            if (nav) nav.style.pointerEvents = "auto";
            const modal = document.getElementById("accessModal");
            if (modal) modal.style.pointerEvents = "auto";
            return;
        }

        if (ok) {
            setChatLocked(false);
            return;
        }

        setChatLocked(true);
        const nav = document.querySelector(".bottom-nav");
        if (nav) nav.style.pointerEvents = "auto";
        const modal = document.getElementById("accessModal");
        if (modal) modal.style.pointerEvents = "auto";
    });
})();
