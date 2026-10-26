/* ============================================
 * NOVA AI — main client script
 * ============================================ */

const API_URL = "https://tradeaiapi.fatalnetwork.ru";
const ACTIVE_SIGNAL_KEY = "trade_ai_active_signal";
const AI_PHOTO_PAGE = !!document.getElementById("aiPhotoRoot");

/* --------------------------------------------
 * Translations
 * -------------------------------------------- */

const translations = {
    ru: {
        select_language: "Выберите язык",
        lang_btn: "Выбрать язык",
        signal_label: "СИГНАЛ",
        pair_label: "Валютная пара",
        tf_label: "Таймфрейм",
        accuracy_label: "Точность",
        direction_label: "Направление",
        until_label: "до",
        waiting_status: "Ожидание...",
        get_signal_btn: "ПОЛУЧИТЬ СИГНАЛ",
        searching_signal: "ПОИСК СИГНАЛА...",
        nav_home: "ГЛАВНАЯ",
        nav_broker: "БРОКЕР",
        access_title: "AI Чат закрыт",
        access_need_reg: "Зарегистрируйтесь в Pocket Option через Broker, чтобы открыть AI Чат.",
        access_need_deposit: "Нужен депозит от ${min}$. Ваш депозит: ${current}$.",
        access_open_broker: "Открыть Broker",
        access_error: "Откройте приложение через Telegram.",
        access_no_user: "Откройте приложение через Telegram.",
        nav_profile: "ПРОФИЛЬ",
        nav_aiphoto: "AI ФОТО",
        nav_chat: "AI ЧАТ",
        expiration_time: "Время экспирации",
        chart_screenshot: "СКРИНШОТ ГРАФИКА",
        upload_chart_title: "Загрузите скриншот графика",
        upload_chart_desc: "Сфотографируйте или загрузите изображение графика для AI-анализа",
        upload_photo_btn: "Загрузить фото",
        photo_required: "Сначала загрузите скриншот графика",
        receive_new_signal: "ПОЛУЧИТЬ НОВЫЙ СИГНАЛ",
        signal_found: "Сигнал найден",
        error: "Ошибка",
        up: "Покупка",
        down: "Продажа",
        win: "WIN",
        lose: "LOSE",
        neutral: "NEUTRAL",
        profile_page_title: "ПРОФИЛЬ",
        total_signals: "Всего сигналов",
        win_rate_label: "Win Rate",
        history_title: "ИСТОРИЯ СДЕЛОК",
        filter_today: "Сегодня",
        filter_week: "Неделя",
        filter_month: "Месяц",
        filter_all: "Все",
        market_regular: "Обычный",
        market_otc: "OTC",
        alert_title: "Сигнал недоступен",
        alert_desc: "Вы не можете получить сигнал сейчас, так как предыдущий сигнал еще активен. Пожалуйста, дождитесь окончания таймфрейма.",
        alert_btn_got_it: "Понятно",
    },
    en: {
        select_language: "Select Language",
        lang_btn: "Select Language",
        signal_label: "SIGNAL",
        pair_label: "Currency Pair",
        tf_label: "Timeframe",
        accuracy_label: "Accuracy",
        direction_label: "Direction",
        until_label: "until",
        waiting_status: "Waiting...",
        get_signal_btn: "GET SIGNAL",
        searching_signal: "SEARCHING SIGNAL...",
        nav_home: "HOME",
        nav_broker: "BROKER",
        access_title: "AI Chat locked",
        access_need_reg: "Register on Pocket Option via Broker to unlock AI Chat.",
        access_need_deposit: "Deposit at least ${min}. Your deposit: ${current}.",
        access_open_broker: "Open Broker",
        access_error: "Please open this app via Telegram.",
        access_no_user: "Please open this app via Telegram.",
        nav_profile: "PROFILE",
        nav_aiphoto: "AI PHOTO",
        nav_chat: "AI CHAT",
        expiration_time: "Expiration Time",
        chart_screenshot: "CHART SCREENSHOT",
        upload_chart_title: "Upload a chart screenshot",
        upload_chart_desc: "Take a photo or upload your chart image for AI analysis",
        upload_photo_btn: "Upload Photo",
        photo_required: "Please upload a chart screenshot first",
        receive_new_signal: "RECEIVE A NEW SIGNAL",
        signal_found: "Signal found",
        error: "Error",
        up: "Buy",
        down: "Sell",
        win: "WIN",
        lose: "LOSE",
        neutral: "NEUTRAL",
        profile_page_title: "PROFILE",
        total_signals: "Total Signals",
        win_rate_label: "Win Rate",
        history_title: "TRADING HISTORY",
        filter_today: "Today",
        filter_week: "Week",
        filter_month: "Month",
        filter_all: "All",
        market_regular: "Regular",
        market_otc: "OTC",
        alert_title: "Signal Unavailable",
        alert_desc: "You cannot get a new signal right now because the previous signal is still active. Please wait for the timeframe to end.",
        alert_btn_got_it: "Got it",
    },
    uz: {
        select_language: "Tilni tanlang",
        lang_btn: "Tilni tanlang",
        signal_label: "SIGNAL",
        pair_label: "Valyuta juftligi",
        tf_label: "Taymfrey",
        accuracy_label: "Aniqlik",
        direction_label: "Yo'nalish",
        until_label: "gacha",
        waiting_status: "Kutilmoqda...",
        get_signal_btn: "SIGNAL OLISH",
        searching_signal: "SIGNAL QIDIRILMOQDA...",
        nav_home: "ASOSIY",
        nav_broker: "BROKER",
        access_title: "AI Chat locked",
        access_need_reg: "Register on Pocket Option via Broker to unlock AI Chat.",
        access_need_deposit: "Deposit at least ${min}. Your deposit: ${current}.",
        access_open_broker: "Open Broker",
        access_error: "Please open this app via Telegram.",
        access_no_user: "Please open this app via Telegram.",
        nav_profile: "PROFIL",
        nav_aiphoto: "AI FOTO",
        nav_chat: "AI CHAT",
        expiration_time: "Tugash vaqti",
        chart_screenshot: "GRAFIK SKRINSHOTI",
        upload_chart_title: "Grafik skrinshotini yuklang",
        upload_chart_desc: "Suratga oling yoki AI tahlili uchun grafik tasvirini yuklang",
        upload_photo_btn: "Foto yuklash",
        photo_required: "Avval grafik skrinshotini yuklang",
        receive_new_signal: "YANGI SIGNAL OLISH",
        signal_found: "Signal topildi",
        error: "Xato",
        up: "Sotib olish",
        down: "Sotish",
        win: "WIN",
        lose: "LOSE",
        neutral: "NEUTRAL",
        profile_page_title: "PROFIL",
        total_signals: "Jami signallar",
        win_rate_label: "Win Rate",
        history_title: "SAVDO TARIXI",
        filter_today: "Bugun",
        filter_week: "Hafta",
        filter_month: "Oy",
        filter_all: "Barchasi",
        market_regular: "Odatiy",
        market_otc: "OTC",
        alert_title: "Signal mavjud emas",
        alert_desc: "Oldingi signal hali faol bo'lganligi sababli hozir yangi signal ololmaysiz. Iltimos, taymfrey tugashini kuting.",
        alert_btn_got_it: "Tushunarli",
    },
    hi: {
        select_language: "भाषा चुनें",
        lang_btn: "भाषा चुनें",
        signal_label: "संकेत",
        pair_label: "मुद्रा जोड़ी",
        tf_label: "समय सीमा",
        accuracy_label: "सटीकता",
        direction_label: "दिशा",
        until_label: "तक",
        waiting_status: "प्रतीक्षा...",
        get_signal_btn: "संकेत प्राप्त करें",
        searching_signal: "संकेत खोज रहा है...",
        nav_home: "घर",
        nav_broker: "BROKER",
        access_title: "AI Chat locked",
        access_need_reg: "Register on Pocket Option via Broker to unlock AI Chat.",
        access_need_deposit: "Deposit at least ${min}. Your deposit: ${current}.",
        access_open_broker: "Open Broker",
        access_error: "Please open this app via Telegram.",
        access_no_user: "Please open this app via Telegram.",
        nav_profile: "प्रोफ़ाइल",
        nav_aiphoto: "AI फोटो",
        nav_chat: "AI चैट",
        expiration_time: "समाप्ति समय",
        chart_screenshot: "चार्ट स्क्रीनशॉट",
        upload_chart_title: "चार्ट स्क्रीनशॉट अपलोड करें",
        upload_chart_desc: "फ़ोटो लें या AI विश्लेषण के लिए चार्ट छवि अपलोड करें",
        upload_photo_btn: "फ़ोटो अपलोड करें",
        photo_required: "पहले चार्ट स्क्रीनशॉट अपलोड करें",
        receive_new_signal: "नया संकेत प्राप्त करें",
        signal_found: "संकेत मिला",
        error: "त्रुटि",
        up: "खरीदें",
        down: "बेचें",
        win: "जीत",
        lose: "हार",
        neutral: "तटस्थ",
        profile_page_title: "प्रोफ़ाइल",
        total_signals: "कुल संकेत",
        win_rate_label: "Win Rate",
        history_title: "ट्रेडिंग इतिहास",
        filter_today: "आज",
        filter_week: "सप्ताह",
        filter_month: "महीना",
        filter_all: "सभी",
        market_regular: "नियमित",
        market_otc: "OTC",
        alert_title: "संकेत उपलब्ध नहीं",
        alert_desc: "पिछला संकेत अभी भी सक्रिय है, इसलिए अभी नया संकेत नहीं मिल सकता। कृपया टाइमफ्रेम समाप्त होने की प्रतीक्षा करें।",
        alert_btn_got_it: "समझ गया",
    },
    pt: {
        select_language: "Selecione o idioma",
        lang_btn: "Selecione o idioma",
        signal_label: "SINAL",
        pair_label: "Par de moedas",
        tf_label: "Prazo",
        accuracy_label: "Precisão",
        direction_label: "Direção",
        until_label: "até",
        waiting_status: "Aguardando...",
        get_signal_btn: "OBTER SINAL",
        searching_signal: "BUSCANDO SINAL...",
        nav_home: "INÍCIO",
        nav_broker: "BROKER",
        access_title: "AI Chat locked",
        access_need_reg: "Register on Pocket Option via Broker to unlock AI Chat.",
        access_need_deposit: "Deposit at least ${min}. Your deposit: ${current}.",
        access_open_broker: "Open Broker",
        access_error: "Please open this app via Telegram.",
        access_no_user: "Please open this app via Telegram.",
        nav_profile: "PERFIL",
        nav_aiphoto: "AI FOTO",
        nav_chat: "AI CHAT",
        expiration_time: "Tempo de expiração",
        chart_screenshot: "CAPTURA DO GRÁFICO",
        upload_chart_title: "Envie uma captura do gráfico",
        upload_chart_desc: "Tire uma foto ou envie a imagem do gráfico para análise por IA",
        upload_photo_btn: "Enviar foto",
        photo_required: "Envie primeiro uma captura do gráfico",
        receive_new_signal: "RECEBER NOVO SINAL",
        signal_found: "Sinal encontrado",
        error: "Erro",
        up: "Compra",
        down: "Venda",
        win: "WIN",
        lose: "LOSE",
        neutral: "NEUTRAL",
        profile_page_title: "PERFIL",
        total_signals: "Total de sinais",
        win_rate_label: "Win Rate",
        history_title: "HISTÓRICO DE OPERAÇÕES",
        filter_today: "Hoje",
        filter_week: "Semana",
        filter_month: "Mês",
        filter_all: "Todos",
        market_regular: "Regular",
        market_otc: "OTC",
        alert_title: "Sinal indisponível",
        alert_desc: "Você não pode obter um novo sinal agora porque o sinal anterior ainda está ativo. Aguarde o fim do timeframe.",
        alert_btn_got_it: "Entendi",
    },
    ar: {
        select_language: "اختر اللغة",
        lang_btn: "اختر اللغة",
        signal_label: "إشارة",
        pair_label: "زوج العملات",
        tf_label: "الإطار الزمني",
        accuracy_label: "الدقة",
        direction_label: "الاتجاه",
        until_label: "حتى",
        waiting_status: "انتظار...",
        get_signal_btn: "احصل على إشارة",
        searching_signal: "جاري البحث عن إشارة...",
        nav_home: "الرئيسية",
        nav_broker: "BROKER",
        access_title: "AI Chat locked",
        access_need_reg: "Register on Pocket Option via Broker to unlock AI Chat.",
        access_need_deposit: "Deposit at least ${min}. Your deposit: ${current}.",
        access_open_broker: "Open Broker",
        access_error: "Please open this app via Telegram.",
        access_no_user: "Please open this app via Telegram.",
        nav_profile: "الملف الشخصي",
        nav_aiphoto: "صورة AI",
        nav_chat: "محادثة AI",
        expiration_time: "وقت الانتهاء",
        chart_screenshot: "لقطة الرسم البياني",
        upload_chart_title: "ارفع لقطة شاشة للرسم البياني",
        upload_chart_desc: "التقط صورة أو ارفع صورة الرسم البياني لتحليل الذكاء الاصطناعي",
        upload_photo_btn: "رفع الصورة",
        photo_required: "يرجى رفع لقطة الرسم البياني أولاً",
        receive_new_signal: "احصل على إشارة جديدة",
        signal_found: "تم العثور على إشارة",
        error: "خطأ",
        up: "شراء",
        down: "بيع",
        win: "فوز",
        lose: "خسارة",
        neutral: "محايد",
        profile_page_title: "الملف الشخصي",
        total_signals: "إجمالي الإشارات",
        win_rate_label: "Win Rate",
        history_title: "سجل التداول",
        filter_today: "اليوم",
        filter_week: "أسبوع",
        filter_month: "شهر",
        filter_all: "الكل",
        market_regular: "عادي",
        market_otc: "OTC",
        alert_title: "الإشارة غير متاحة",
        alert_desc: "لا يمكنك الحصول على إشارة جديدة الآن لأن الإشارة السابقة ما زالت نشطة. يرجى انتظار انتهاء الإطار الزمني.",
        alert_btn_got_it: "حسناً",
    },
    kz: {
        select_language: "Тілді таңдаңыз",
        lang_btn: "Тілді таңдаңыз",
        signal_label: "СИГНАЛ",
        pair_label: "Валюта жұбы",
        tf_label: "Таймфрейм",
        accuracy_label: "Дәлдік",
        direction_label: "Бағыт",
        until_label: "дейін",
        waiting_status: "Күту...",
        get_signal_btn: "СИГНАЛ АЛУ",
        searching_signal: "СИГНАЛ ІЗДЕУ...",
        nav_home: "БАСТЫ",
        nav_broker: "BROKER",
        access_title: "AI Chat locked",
        access_need_reg: "Register on Pocket Option via Broker to unlock AI Chat.",
        access_need_deposit: "Deposit at least ${min}. Your deposit: ${current}.",
        access_open_broker: "Open Broker",
        access_error: "Please open this app via Telegram.",
        access_no_user: "Please open this app via Telegram.",
        nav_profile: "ПРОФИЛЬ",
        nav_aiphoto: "AI ФОТО",
        nav_chat: "AI ЧАТ",
        expiration_time: "Аяқталу уақыты",
        chart_screenshot: "ГРАФИК СКРИНШОТЫ",
        upload_chart_title: "График скриншотын жүктеңіз",
        upload_chart_desc: "Сурет түсіріңіз немесе AI талдауы үшін график бейнесін жүктеңіз",
        upload_photo_btn: "Фото жүктеу",
        photo_required: "Алдымен график скриншотын жүктеңіз",
        receive_new_signal: "ЖАҢА СИГНАЛ АЛУ",
        signal_found: "Сигнал табылды",
        error: "Қате",
        up: "Сатып алу",
        down: "Сату",
        win: "WIN",
        lose: "LOSE",
        neutral: "NEUTRAL",
        profile_page_title: "ПРОФИЛЬ",
        total_signals: "Барлық сигналдар",
        win_rate_label: "Win Rate",
        history_title: "САУДА ТАРИХЫ",
        filter_today: "Бүгін",
        filter_week: "Апта",
        filter_month: "Ай",
        filter_all: "Барлығы",
        market_regular: "Қалыпты",
        market_otc: "OTC",
        alert_title: "Сигнал қолжетімсіз",
        alert_desc: "Алдыңғы сигнал әлі белсенді болғандықтан жаңа сигнал ала алмайсыз. Таймфрейм аяқталғанша күтіңіз.",
        alert_btn_got_it: "Түсінікті",
    },
};

/* --------------------------------------------
 * State
 * -------------------------------------------- */

let currentLang = localStorage.getItem("trade_ai_lang") || "en";
let isOTC = false;
let isSignalActive = false;
let hasPhoto = false;
let aiPhotoReturnTimer = null;
let _restoringSignal = false;
let progressTimer = null;
let tgUser = null;
let currentHistoryPeriod = "today";

/* --------------------------------------------
 * Market data
 * -------------------------------------------- */

const standardPairs = [
    "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "AUDUSD",
    "GBPJPY", "EURJPY", "EURGBP", "EURCAD", "GBPCHF", "CADJPY",
    "AUDCAD", "AUDJPY", "EURCHF", "CADCHF",
];

const otcPairs = [
    "EURUSD OTC", "CADJPY OTC", "GBPCHF OTC", "EURCAD OTC", "EURGBP OTC",
    "EURJPY OTC", "GBPJPY OTC", "AUDUSD OTC", "USDCAD OTC", "USDCHF OTC",
    "USDJPY OTC", "GBPUSD OTC", "AUDCAD OTC", "GBPCAD OTC", "AUDJPY OTC",
    "EURCHF OTC", "CADCHF OTC",
];

const standardTimeframes = ["1m", "3m", "5m", "15m"];
const otcTimeframes = ["5s", "15s", "30s", "1m", "2m", "3m", "4m", "5m"];

/* --------------------------------------------
 * DOM references
 * -------------------------------------------- */

const pairSelect = document.getElementById("pair");
const timeframeSelect = document.getElementById("timeframe");
const getSignalBtn = document.getElementById("getSignalBtn");
const userInfo = document.getElementById("userInfo");
const userAvatar = document.getElementById("userAvatar");
const statusText = document.getElementById("statusText");
const metaPair = document.getElementById("metaPair");
const metaTf = document.getElementById("metaTf");
const metaTime = document.getElementById("metaTime");
const metaAcc = document.getElementById("metaAcc");
const metaDir = document.getElementById("metaDir");
const metaUntil = document.getElementById("metaUntil");
const spinner = document.getElementById("spinner");
const pairFlags = document.getElementById("pairFlags");
const pairFlagDisplay = document.getElementById("pairFlagDisplay");
const pairTextDisplay = document.getElementById("pairTextDisplay");
const tfTextDisplay = document.getElementById("tfTextDisplay");
const cardPairFlags = document.getElementById("cardPairFlags");
const spinnerOverlay = document.getElementById("spinnerOverlay");
const resultStamp = document.getElementById("resultStamp");
const dirIcon = document.getElementById("dirIcon");
const dirIconUse = document.getElementById("dirIconUse");
const dirCard = document.getElementById("dirCard");
const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");
const resultLabel = document.getElementById("resultLabel");
const resultIconUse = document.getElementById("resultIconUse");
const closeProfileBtn = document.getElementById("closeProfileBtn");
const langBtn = document.getElementById("langBtn");
const langModal = document.getElementById("langModal");
const closeLangBtn = document.getElementById("closeLangBtn");
const alertModal = document.getElementById("alertModal");
const closeAlertBtn = document.getElementById("closeAlertBtn");
const currentLangFlag = document.getElementById("currentLangFlag");
const p_id = document.getElementById("p_id");
const p_name = document.getElementById("p_name");
const p_username = document.getElementById("p_username");
const p_lang = document.getElementById("p_lang");
const p_premium = document.getElementById("p_premium");
const p_last = document.getElementById("p_last");
const btnRegular = document.getElementById("btnRegular");
const btnOTC = document.getElementById("btnOTC");
const marketToggleContainer = document.querySelector(".market-toggle-container");
const profileRoot = document.getElementById("profileRoot");
const newSignalBtn = document.getElementById("newSignalBtn");

const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;

/* --------------------------------------------
 * Helpers — flags & timeframes
 * -------------------------------------------- */

function getCurrencyCountryCode(cur) {
    const map = {
        EUR: "eu", USD: "us", GBP: "gb", JPY: "jp",
        CHF: "ch", CAD: "ca", AUD: "au", NZD: "nz",
    };
    return map[cur] || null;
}

function flagForCurrency(cur) {
    const map = {
        EUR: "🇪🇺", USD: "🇺🇸", GBP: "🇬🇧", JPY: "🇯🇵",
        CHF: "🇨🇭", CAD: "🇨🇦", AUD: "🇦🇺", NZD: "🇳🇿",
    };
    return map[cur] || "";
}

function flagsForPair(pair) {
    const cleanPair = pair.replace(" OTC", "");
    const base = cleanPair.slice(0, 3);
    const quote = cleanPair.slice(3, 6);
    const baseCode = getCurrencyCountryCode(base);
    const quoteCode = getCurrencyCountryCode(quote);

    if (baseCode && quoteCode) {
        return `
        <div class="pair-icons">
            <img src="/assets/flags/${baseCode}.svg" class="currency-icon base" alt="">
            <img src="/assets/flags/${quoteCode}.svg" class="currency-icon quote" alt="">
        </div>`;
    }
    return `${flagForCurrency(base)} ${flagForCurrency(quote)}`.trim();
}

function getSecondsFromTf(tf) {
    if (tf.endsWith("s")) return parseInt(tf, 10);
    if (tf.endsWith("m")) return parseInt(tf, 10) * 60;
    return 60;
}

function formatTime(dateOrMs) {
    const d = dateOrMs instanceof Date ? dateOrMs : new Date(dateOrMs);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* --------------------------------------------
 * i18n
 * -------------------------------------------- */

function changeLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem("trade_ai_lang", lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll(".lang-item").forEach((item) => {
        item.classList.toggle("selected", item.getAttribute("data-lang") === lang);
    });
}

function showLangModal() {
    if (!langModal) return;
    langModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function hideLangModal() {
    if (!langModal) return;
    langModal.classList.add("hidden");
    document.body.style.overflow = "";
}

function showCustomAlert() {
    if (!alertModal) return;
    alertModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function hideCustomAlert() {
    if (!alertModal) return;
    alertModal.classList.add("hidden");
    document.body.style.overflow = "";
}

/* --------------------------------------------
 * Custom dropdowns
 * -------------------------------------------- */

function initCustomDropdown(container) {
    const select = container.querySelector("select");
    const trigger = container.querySelector(".select-trigger");
    if (!select || !trigger) return;

    select.style.display = "none";

    const list = document.createElement("div");
    list.className = "dropdown-list";

    Array.from(select.options).forEach((opt) => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = opt.text;

        if (select.id === "pair") {
            item.innerHTML = `${flagsForPair(opt.value)} ${opt.text}`;
            item.style.display = "flex";
            item.style.alignItems = "center";
            item.style.gap = "10px";
        }

        item.dataset.value = opt.value;
        if (opt.selected) item.classList.add("selected");

        item.addEventListener("click", (e) => {
            e.stopPropagation();
            select.value = opt.value;
            select.dispatchEvent(new Event("change"));
            list.classList.remove("open");
            list.querySelectorAll(".dropdown-item").forEach((i) => i.classList.remove("selected"));
            item.classList.add("selected");
        });

        list.appendChild(item);
    });

    container.appendChild(list);

    trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".dropdown-list").forEach((l) => {
            if (l !== list) l.classList.remove("open");
        });
        list.classList.toggle("open");
    });
}

function initCustomDropdowns() {
    document.querySelectorAll(".custom-select").forEach((container) => {
        initCustomDropdown(container);
    });

    document.addEventListener("click", () => {
        document.querySelectorAll(".dropdown-list").forEach((l) => l.classList.remove("open"));
    });
}

function rebuildDropdownList(selectEl, withFlags) {
    const container = selectEl.closest(".custom-select");
    if (!container) return;

    const list = container.querySelector(".dropdown-list");
    if (!list) return;

    list.innerHTML = "";

    Array.from(selectEl.options).forEach((opt) => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = opt.text;

        if (withFlags) {
            item.innerHTML = `${flagsForPair(opt.value)} ${opt.text}`;
            item.style.display = "flex";
            item.style.alignItems = "center";
            item.style.gap = "10px";
        }

        item.dataset.value = opt.value;
        if (opt.selected) item.classList.add("selected");

        item.addEventListener("click", (e) => {
            e.stopPropagation();
            selectEl.value = opt.value;
            selectEl.dispatchEvent(new Event("change"));
            list.classList.remove("open");
            list.querySelectorAll(".dropdown-item").forEach((i) => i.classList.remove("selected"));
            item.classList.add("selected");
        });

        list.appendChild(item);
    });
}

/* --------------------------------------------
 * Market mode — pairs & timeframes
 * -------------------------------------------- */

function updatePairOptions() {
    if (!pairSelect) return;

    const pairs = isOTC ? otcPairs : standardPairs;
    pairSelect.innerHTML = "";

    pairs.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p;
        opt.text = isOTC ? p : `${p.slice(0, 3)}/${p.slice(3, 6)}`;
        pairSelect.appendChild(opt);
    });

    pairSelect.selectedIndex = 0;
    rebuildDropdownList(pairSelect, true);
    updateSelectedInstrument();
}

function updateTimeframeOptions() {
    if (!timeframeSelect) return;

    const tfs = isOTC ? otcTimeframes : standardTimeframes;
    timeframeSelect.innerHTML = "";

    tfs.forEach((tf) => {
        const opt = document.createElement("option");
        opt.value = tf;
        opt.text = tf;
        timeframeSelect.appendChild(opt);
    });

    timeframeSelect.selectedIndex = 0;
    rebuildDropdownList(timeframeSelect, false);
    updateSelectedInstrument();
}

function setMarketMode(mode) {
    isOTC = mode === "OTC";

    if (isOTC) {
        btnRegular?.classList.remove("active");
        btnOTC?.classList.add("active");
        marketToggleContainer?.classList.add("otc-active");
    } else {
        btnOTC?.classList.remove("active");
        btnRegular?.classList.add("active");
        marketToggleContainer?.classList.remove("otc-active");
    }

    updatePairOptions();
    updateTimeframeOptions();
}

function updateSelectedInstrument() {
    if (!pairSelect || !timeframeSelect) return;

    if (isSignalActive && !_restoringSignal) {
        isSignalActive = false;
        if (progressTimer) {
            clearInterval(progressTimer);
            progressTimer = null;
        }
        if (progressBar) progressBar.style.width = "0%";
        if (progressLabel) progressLabel.textContent = "0%";
        if (getSignalBtn) {
            getSignalBtn.disabled = false;
            updateGetSignalAvailability();
        }
        if (statusText) statusText.textContent = translations[currentLang].waiting_status;
    }

    const livePairTextDisplay = document.getElementById("pairTextDisplay");
    const livePairFlagDisplay = document.getElementById("pairFlagDisplay");
    const liveTfTextDisplay = document.getElementById("tfTextDisplay");
    const pairLabel = pairSelect.options[pairSelect.selectedIndex].text;

    if (livePairTextDisplay) livePairTextDisplay.textContent = pairLabel;
    if (livePairFlagDisplay) livePairFlagDisplay.innerHTML = flagsForPair(pairSelect.value);
    if (liveTfTextDisplay) liveTfTextDisplay.textContent = timeframeSelect.value;
    if (cardPairFlags) cardPairFlags.innerHTML = flagsForPair(pairSelect.value);
    if (metaPair) metaPair.textContent = pairLabel;
    if (metaTf) metaTf.textContent = timeframeSelect.value;

    if (!_restoringSignal) {
        if (metaAcc) metaAcc.textContent = "--%";
        if (metaDir) {
            metaDir.textContent = "--";
            metaDir.classList.remove("up", "down");
        }
        if (metaUntil) metaUntil.textContent = "--:--";
        if (statusText) statusText.textContent = translations[currentLang].waiting_status;
        if (progressBar) progressBar.style.width = "0%";
        if (progressLabel) progressLabel.textContent = "0%";
        if (resultStamp) {
            resultStamp.textContent = "";
            resultStamp.classList.add("hidden");
            resultStamp.classList.remove("win", "lose");
        }
        const mainCard = document.getElementById("mainCard");
        if (mainCard) {
            mainCard.classList.remove("win-glow", "lose-glow");
            if (AI_PHOTO_PAGE) mainCard.classList.add("hidden");
        }
    }
}

/* --------------------------------------------
 * Signal progress & persistence
 * -------------------------------------------- */

function startSignalProgress(durationMs, startTime, onFinish) {
    if (progressTimer) {
        clearInterval(progressTimer);
        progressTimer = null;
    }

    if (progressBar) progressBar.style.width = "0%";
    if (progressLabel) progressLabel.textContent = "0%";

    progressTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, (elapsed / durationMs) * 100);

        if (progressBar) progressBar.style.width = `${pct}%`;
        if (progressLabel) progressLabel.textContent = `${Math.floor(pct)}%`;

        if (elapsed >= durationMs) {
            clearInterval(progressTimer);
            progressTimer = null;
            if (onFinish) onFinish();
        }
    }, 50);
}

function saveSignalState(state) {
    localStorage.setItem(ACTIVE_SIGNAL_KEY, JSON.stringify(state));
}

function clearSignalState() {
    localStorage.removeItem(ACTIVE_SIGNAL_KEY);
}

function unlockSignalButton() {
    if (!getSignalBtn) return;
    getSignalBtn.disabled = false;
    updateGetSignalAvailability();
}

function scheduleAIPhotoReturn(delayMs = 4000) {
    if (!AI_PHOTO_PAGE) return;
    if (aiPhotoReturnTimer) clearTimeout(aiPhotoReturnTimer);
    aiPhotoReturnTimer = setTimeout(() => showAIPhotoUploadView(), delayMs);
}

function applySignalDirection(signal) {
    if (metaDir) {
        metaDir.textContent =
            signal === "BUY"
                ? translations[currentLang].up
                : signal === "SELL"
                  ? translations[currentLang].down
                  : "";
        metaDir.classList.remove("up", "down");
        if (signal === "BUY") metaDir.classList.add("up");
        if (signal === "SELL") metaDir.classList.add("down");
    }

    const dIcon = document.getElementById("dirIcon");
    if (dIcon) {
        dIcon.classList.remove("up", "down");
        void dIcon.offsetWidth;
        if (signal === "BUY") dIcon.classList.add("up");
        if (signal === "SELL") dIcon.classList.add("down");
    }

    if (dirIconUse) {
        dirIconUse.setAttribute("href", signal === "BUY" ? "#icon-up" : "#icon-down");
    }
}

function applySignalResult(resultStatus) {
    const key = resultStatus.toLowerCase();
    if (resultStamp) {
        resultStamp.textContent = translations[currentLang][key];
        resultStamp.classList.remove("hidden", "win", "lose", "neutral");
        resultStamp.classList.add(key);
    }
    const mainCard = document.getElementById("mainCard");
    if (mainCard) {
        mainCard.classList.remove("win-glow", "lose-glow", "neutral-glow");
        mainCard.classList.add(`${key}-glow`);
    }
}

function computeResultStatus(signal, basePrice, newPrice) {
    if (newPrice === basePrice) return "NEUTRAL";
    if (signal === "BUY") return newPrice > basePrice ? "WIN" : "LOSE";
    return newPrice < basePrice ? "WIN" : "LOSE";
}

async function checkSignalOutcome(pair, tf, signal, basePrice, signalId) {
    try {
        const r = await fetch(`${API_URL}/signal?pair=${pair}&tf=${tf}`);
        if (!r.ok) return;

        const latest = await r.json();
        const newPrice = Number(latest.price);
        const resultStatus = computeResultStatus(signal, Number(basePrice), newPrice);

        if (signalId) {
            fetch(`${API_URL}/signal/check?signal_id=${signalId}&current_price=${newPrice}`, {
                method: "POST",
            }).catch((err) => console.error("Failed to save result", err));
        }

        applySignalResult(resultStatus);
    } catch (_) {
        /* ignore network errors on outcome check */
    }
}

function renderActiveSignalUI(pair, pairLabel, tf, signal, confidence, startTime) {
    if (statusText) statusText.textContent = translations[currentLang].signal_found;
    if (pairFlags) pairFlags.innerHTML = flagsForPair(pair);
    if (cardPairFlags) cardPairFlags.innerHTML = flagsForPair(pair);
    if (metaPair) metaPair.textContent = pairLabel;
    if (metaTf) metaTf.textContent = tf;
    if (metaTime) metaTime.textContent = formatTime(startTime);
    if (metaAcc) {
        metaAcc.textContent =
            typeof confidence !== "undefined" ? `${Number(confidence).toFixed(0)}%` : "";
    }
    applySignalDirection(signal);

    const tfSeconds = getSecondsFromTf(tf);
    if (metaUntil) metaUntil.textContent = formatTime(startTime + tfSeconds * 1000);
}

function clearSignalUI() {
    if (pairFlags) pairFlags.textContent = "";
    if (cardPairFlags) cardPairFlags.textContent = "";
    if (metaPair) metaPair.textContent = "";
    if (metaTf) metaTf.textContent = "";
    if (metaTime) metaTime.textContent = "";
    if (metaAcc) metaAcc.textContent = "";
    if (metaDir) metaDir.textContent = "";
    if (metaUntil) metaUntil.textContent = "";
    if (progressBar) progressBar.style.width = "0%";
    if (progressLabel) progressLabel.textContent = "";
    if (resultStamp) {
        resultStamp.textContent = "";
        resultStamp.classList.add("hidden");
        resultStamp.classList.remove("win", "lose", "neutral");
    }
    const mainCard = document.getElementById("mainCard");
    if (mainCard) {
        mainCard.classList.remove("win-glow", "lose-glow", "neutral-glow");
        if (AI_PHOTO_PAGE) mainCard.classList.remove("hidden");
    }
}

/* --------------------------------------------
 * Generate signal
 * -------------------------------------------- */

async function generateSignal() {
    if (isSignalActive) {
        showCustomAlert();
        return;
    }

    if (AI_PHOTO_PAGE && !hasPhoto) {
        if (statusText) statusText.textContent = translations[currentLang].photo_required;
        return;
    }

    const pair = pairSelect.value;
    const tf = timeframeSelect.value;
    const pairLabel = pairSelect.options[pairSelect.selectedIndex].text;

    isSignalActive = true;
    getSignalBtn.disabled = true;
    if (statusText) statusText.textContent = translations[currentLang].searching_signal;
    if (spinnerOverlay) spinnerOverlay.classList.remove("hidden");

    const spinnerText = spinnerOverlay?.querySelector(".spinner-text");
    if (spinnerText) spinnerText.textContent = translations[currentLang].searching_signal;

    clearSignalUI();
    if (AI_PHOTO_PAGE) showAIPhotoSignalView();

    /* --- OTC: local random signal --- */
    if (isOTC) {
        setTimeout(() => {
            if (spinnerOverlay) spinnerOverlay.classList.add("hidden");

            const randomSignal = Math.random() > 0.5 ? "BUY" : "SELL";
            const randomConfidence = Math.floor(Math.random() * (98 - 85 + 1)) + 85;
            const startTime = Date.now();
            const durationMs = Math.floor(getSecondsFromTf(tf) * 1000);

            renderActiveSignalUI(pair, pairLabel, tf, randomSignal, randomConfidence, startTime);

            saveSignalState({
                type: "OTC",
                pair,
                pairLabel,
                tf,
                startTime,
                duration: durationMs,
                signal: randomSignal,
                confidence: randomConfidence,
                price: null,
            });

            startSignalProgress(durationMs, startTime, () => {
                isSignalActive = false;
                clearSignalState();
                unlockSignalButton();
                scheduleAIPhotoReturn(4000);
            });
        }, 2000);
        return;
    }

    /* --- Regular: API signal --- */
    try {
        const params = new URLSearchParams({ pair, tf });
        if (tgUser?.id) params.append("user_id", tgUser.id);

        const resp = await fetch(`${API_URL}/run?${params.toString()}`, { method: "POST" });
        if (!resp.ok) {
            const err = await resp.json();
            throw new Error(err.detail || "Request failed");
        }

        const result = await resp.json();
        const data = result.data;
        const startTime = Date.now();
        const durationMs = Math.floor(getSecondsFromTf(tf) * 1000);

        renderActiveSignalUI(pair, pairLabel, tf, data.signal, data.confidence, startTime);

        saveSignalState({
            type: "REGULAR",
            pair,
            pairLabel,
            tf,
            startTime,
            duration: durationMs,
            signal: data.signal,
            confidence: data.confidence,
            price: data.price,
            id: data.id,
        });

        startSignalProgress(durationMs, startTime, async () => {
            isSignalActive = false;
            clearSignalState();
            await checkSignalOutcome(pair, tf, data.signal, data.price, data.id);
            unlockSignalButton();
            scheduleAIPhotoReturn(4000);
        });
    } catch (e) {
        isSignalActive = false;
        clearSignalState();
        if (statusText) statusText.textContent = translations[currentLang].error;
        scheduleAIPhotoReturn(2500);
    } finally {
        if (getSignalBtn && !isSignalActive) unlockSignalButton();
        if (spinnerOverlay) spinnerOverlay.classList.add("hidden");
    }
}

/* --------------------------------------------
 * Restore active signal after reload
 * -------------------------------------------- */

function restoreActiveSignal() {
    const stored = localStorage.getItem(ACTIVE_SIGNAL_KEY);
    if (!stored) return;

    try {
        const state = JSON.parse(stored);
        const elapsed = Date.now() - state.startTime;

        if (elapsed >= state.duration) {
            clearSignalState();
            return;
        }

        if (!getSignalBtn || !progressBar) return;

        _restoringSignal = true;
        isSignalActive = true;
        getSignalBtn.disabled = true;

        const mainCard = document.getElementById("mainCard");
        if (mainCard && AI_PHOTO_PAGE) mainCard.classList.remove("hidden");
        if (AI_PHOTO_PAGE) showAIPhotoSignalView();

        setMarketMode(state.type === "OTC" ? "OTC" : "Regular");
        if (pairSelect) pairSelect.value = state.pair;
        if (timeframeSelect) timeframeSelect.value = state.tf;
        updateSelectedInstrument();
        _restoringSignal = false;

        renderActiveSignalUI(
            state.pair,
            state.pairLabel || state.pair,
            state.tf,
            state.signal,
            state.confidence,
            state.startTime
        );

        startSignalProgress(state.duration, state.startTime, async () => {
            isSignalActive = false;
            clearSignalState();

            if (state.type !== "OTC") {
                await checkSignalOutcome(state.pair, state.tf, state.signal, state.price, state.id);
            }

            unlockSignalButton();
            scheduleAIPhotoReturn(4000);
        });
    } catch (e) {
        console.error("Failed to restore signal", e);
        clearSignalState();
        _restoringSignal = false;
    }
}

/* --------------------------------------------
 * Telegram WebApp
 * -------------------------------------------- */

function applyTgInsets() {
    if (!tg) return;

    const sa = tg.safeAreaInset || {};
    const csa = tg.contentSafeAreaInset || {};
    const statusBar = sa.top || 0;

    let top = statusBar + (csa.top || 0);
    const bottom = (sa.bottom || 0) + (csa.bottom || 0);

    if (tg.isFullscreen && top < statusBar + 46) top = statusBar + 46;

    const root = document.documentElement.style;
    root.setProperty("--tg-top", top + "px");
    root.setProperty("--tg-bottom", bottom + "px");
}

function updateUserAvatar(u) {
    if (!userAvatar) return;

    const name = [u.first_name, u.last_name].filter(Boolean).join(" ") || u.username || `ID ${u.id}`;
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=e5e7eb&size=128`;
    const src = u.username ? `https://unavatar.io/telegram/${u.username}` : fallback;

    userAvatar.src = src;
    userAvatar.alt = name;
    userAvatar.onerror = () => {
        userAvatar.src = fallback;
    };
}

function initTelegram() {
    if (!tg) return;

    try {
        tg.ready();
        tg.expand();
        if (tg.requestFullscreen) tg.requestFullscreen();

        applyTgInsets();
        if (tg.onEvent) {
            ["safeAreaChanged", "contentSafeAreaChanged", "fullscreenChanged", "viewportChanged"].forEach(
                (ev) => tg.onEvent(ev, applyTgInsets)
            );
        }
        setTimeout(applyTgInsets, 300);
        setTimeout(applyTgInsets, 1200);

        let u = tg.initDataUnsafe?.user || null;
        if (!u && tg.initData) {
            try {
                const params = new URLSearchParams(tg.initData);
                const userRaw = params.get("user");
                if (userRaw) u = JSON.parse(userRaw);
            } catch (_) {
                /* ignore parse errors */
            }
        }

        if (u) {
            tgUser = u;
            if (userInfo) {
                userInfo.textContent =
                    [u.first_name, u.last_name].filter(Boolean).join(" ") ||
                    u.username ||
                    `ID ${u.id}`;
            }

            fetch(`${API_URL}/profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: u.id,
                    username: u.username,
                    first_name: u.first_name,
                    last_name: u.last_name,
                    language_code: u.language_code,
                    is_premium: u.is_premium,
                }),
            }).catch(() => {});

            updateUserAvatar(u);
        }

        if (window.location.pathname.endsWith("profile.html") && tg.BackButton) {
            tg.BackButton.show();
            tg.BackButton.onClick(() => {
                window.location.href = "index.html";
            });
        } else if (tg.BackButton) {
            tg.BackButton.hide();
        }
    } catch (_) {
        /* Telegram SDK optional */
    }
}

/* --------------------------------------------
 * Profile page
 * -------------------------------------------- */

async function fetchHistory() {
    if (!tgUser) return;
    try {
        const h = await fetch(
            `${API_URL}/history/user?uid=${tgUser.id}&limit=50&period=${currentHistoryPeriod}`
        );
        if (h.ok) {
            const rows = await h.json();
            renderHistoryCards(rows);
        }
    } catch (_) {
        /* ignore */
    }
}

function renderHistoryCards(rows) {
    const container = document.getElementById("historyList");
    if (!container) return;

    if (rows.length === 0) {
        container.innerHTML =
            '<div style="text-align:center; color:var(--text-muted); padding:20px;">Нет сделок за этот период</div>';
        return;
    }

    container.innerHTML = rows
        .map((r) => {
            const resClass =
                r.result === "WIN" ? "win" : r.result === "LOSE" ? "lose" : "pending";
            const resText = r.result || "ACTIVE";
            const tfText =
                r.timeframe === "1m"
                    ? "1-2 мин"
                    : r.timeframe === "3m"
                      ? "3-5 мин"
                      : r.timeframe === "5m"
                        ? "5-10 мин"
                        : r.timeframe;

            return `
        <div class="history-card">
            <div class="hc-top">${r.timestamp}</div>
            <div class="hc-main">
                <div class="hc-pair-info">
                    <span class="hc-flags">${flagsForPair(r.pair)}</span>
                    <span class="hc-pair-name">${r.pair}</span>
                </div>
                <div class="hc-center">${tfText}</div>
                <div class="hc-status ${resClass}">${resText}</div>
            </div>
        </div>`;
        })
        .join("");
}

async function loadProfilePage() {
    if (!profileRoot) return;

    document.querySelectorAll(".filter-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".filter-tab").forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            currentHistoryPeriod = tab.getAttribute("data-period");
            fetchHistory();
        });
    });

    if (!tgUser) return;

    const uInfo = document.getElementById("userInfo");
    const uName = document.getElementById("profileName");
    const uSub = document.getElementById("userSubtitle");
    const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || "User";

    if (uInfo) uInfo.textContent = fullName;
    if (uName) uName.textContent = fullName;
    if (uSub) {
        uSub.textContent = tgUser.username ? `@${tgUser.username}` : `ID: ${tgUser.id}`;
    }
    updateUserAvatar(tgUser);

    try {
        const s = await fetch(`${API_URL}/stats/user?uid=${tgUser.id}`);
        if (s.ok) {
            const stats = await s.json();
            const totalEl = document.getElementById("totalSignals");
            const winRateEl = document.getElementById("winRate");
            if (totalEl) totalEl.textContent = stats.total_signals;
            if (winRateEl) winRateEl.textContent = `${stats.win_rate}%`;
        }
    } catch (_) {
        /* ignore */
    }

    await fetchHistory();
}

/* --------------------------------------------
 * AI PHOTO page
 * -------------------------------------------- */

function updateGetSignalAvailability() {
    const btn = document.getElementById("getSignalBtn");
    if (!btn) return;
    if (isSignalActive) {
        btn.disabled = true;
        return;
    }
    btn.disabled = AI_PHOTO_PAGE ? !hasPhoto : false;
}

function setHasPhoto(value) {
    hasPhoto = !!value;
    updateGetSignalAvailability();
}

function showAIPhotoSignalView() {
    if (!AI_PHOTO_PAGE) return;

    const root = document.getElementById("aiPhotoRoot");
    if (root) {
        root.classList.add("ai-photo-mode-signal");
        root.classList.remove("ai-photo-mode-upload");
    }

    const mainCard = document.getElementById("mainCard");
    if (mainCard) mainCard.classList.remove("hidden");

    if (aiPhotoReturnTimer) {
        clearTimeout(aiPhotoReturnTimer);
        aiPhotoReturnTimer = null;
    }

    try {
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (_) {
        window.scrollTo(0, 0);
    }
}

function showAIPhotoUploadView() {
    if (!AI_PHOTO_PAGE) return;

    if (aiPhotoReturnTimer) {
        clearTimeout(aiPhotoReturnTimer);
        aiPhotoReturnTimer = null;
    }

    const root = document.getElementById("aiPhotoRoot");
    if (root) {
        root.classList.remove("ai-photo-mode-signal");
        root.classList.add("ai-photo-mode-upload");
    }

    const mainCard = document.getElementById("mainCard");
    if (mainCard) {
        mainCard.classList.add("hidden");
        mainCard.classList.remove("win-glow", "lose-glow", "neutral-glow");
    }

    if (resultStamp) {
        resultStamp.textContent = "";
        resultStamp.classList.add("hidden");
        resultStamp.classList.remove("win", "lose", "neutral");
    }
    if (metaAcc) metaAcc.textContent = "--%";
    if (metaDir) {
        metaDir.textContent = "--";
        metaDir.classList.remove("up", "down");
    }
    if (metaUntil) metaUntil.textContent = "--:--";
    if (progressBar) progressBar.style.width = "0%";
    if (progressLabel) progressLabel.textContent = "0%";
    if (statusText) statusText.textContent = translations[currentLang].waiting_status;

    const dIcon = document.getElementById("dirIcon");
    if (dIcon) dIcon.classList.remove("up", "down");

    const input = document.getElementById("photoInput");
    const previewImg = document.getElementById("previewImg");
    const empty = document.getElementById("photoEmpty");
    const preview = document.getElementById("photoPreview");
    if (input) input.value = "";
    if (previewImg) previewImg.src = "";
    if (empty) empty.classList.remove("hidden");
    if (preview) preview.classList.add("hidden");
    setHasPhoto(false);

    try {
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (_) {
        window.scrollTo(0, 0);
    }
}

function initAIPhotoUploader() {
    if (!AI_PHOTO_PAGE) return;

    const dropzone = document.getElementById("photoDropzone");
    const input = document.getElementById("photoInput");
    const uploadBtn = document.getElementById("uploadBtn");
    const empty = document.getElementById("photoEmpty");
    const preview = document.getElementById("photoPreview");
    const previewImg = document.getElementById("previewImg");
    const removeBtn = document.getElementById("removePhotoBtn");

    if (!dropzone || !input) return;

    const showPreview = (src) => {
        if (previewImg) previewImg.src = src;
        if (empty) empty.classList.add("hidden");
        if (preview) preview.classList.remove("hidden");
        setHasPhoto(true);
    };

    const clearPreview = () => {
        if (previewImg) previewImg.src = "";
        if (empty) empty.classList.remove("hidden");
        if (preview) preview.classList.add("hidden");
        if (input) input.value = "";
        setHasPhoto(false);
    };

    const handleFile = (file) => {
        if (!file?.type?.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = (e) => showPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    if (uploadBtn) {
        uploadBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            input.click();
        });
    }

    dropzone.addEventListener("click", () => {
        if (!hasPhoto) input.click();
    });

    input.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    });

    if (removeBtn) {
        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            clearPreview();
        });
    }

    ["dragenter", "dragover"].forEach((ev) => {
        dropzone.addEventListener(ev, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add("dragover");
        });
    });

    ["dragleave", "drop"].forEach((ev) => {
        dropzone.addEventListener(ev, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove("dragover");
        });
    });

    dropzone.addEventListener("drop", (e) => {
        const file = e.dataTransfer?.files?.[0];
        if (file) handleFile(file);
    });

    setHasPhoto(false);
}

/* --------------------------------------------
 * Event listeners
 * -------------------------------------------- */

if (btnRegular) btnRegular.addEventListener("click", () => setMarketMode("Regular"));
if (btnOTC) btnOTC.addEventListener("click", () => setMarketMode("OTC"));
if (pairSelect) pairSelect.addEventListener("change", updateSelectedInstrument);
if (timeframeSelect) timeframeSelect.addEventListener("change", updateSelectedInstrument);
if (getSignalBtn) getSignalBtn.addEventListener("click", generateSignal);
if (langBtn) langBtn.addEventListener("click", showLangModal);
if (closeLangBtn) closeLangBtn.addEventListener("click", hideLangModal);
if (langModal) {
    langModal.addEventListener("click", (e) => {
        if (e.target === langModal) hideLangModal();
    });
}
if (closeAlertBtn) closeAlertBtn.addEventListener("click", hideCustomAlert);
if (alertModal) {
    alertModal.addEventListener("click", (e) => {
        if (e.target === alertModal) hideCustomAlert();
    });
}

document.querySelectorAll(".lang-item").forEach((item) => {
    item.addEventListener("click", () => {
        document.querySelectorAll(".lang-item").forEach((i) => i.classList.remove("selected"));
        item.classList.add("selected");
        changeLanguage(item.getAttribute("data-lang"));
        hideLangModal();
    });
});

if (newSignalBtn) {
    newSignalBtn.addEventListener("click", () => {
        if (isSignalActive) {
            showCustomAlert();
            return;
        }
        showAIPhotoUploadView();
    });
}

/* --------------------------------------------
 * Bootstrap
 * -------------------------------------------- */

initCustomDropdowns();
updateSelectedInstrument();
changeLanguage(currentLang);
initTelegram();

/* Broker + chat access */
if (window.AppAccess) {
    window.AppAccess.bindNav({
        getI18n: () => (translations[currentLang] || translations.en || {}),
        onUnlockedChat: () => { window.location.href = "/chat"; },
    });
}

restoreActiveSignal();
loadProfilePage();
initAIPhotoUploader();
