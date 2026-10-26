/* ============================================
 * App config
 * Статус / настройки идут через Vercel proxy: /api/*
 * Upstream (в т.ч. http://) задаётся в Vercel env: STATUS_API_URL
 * ============================================ */

window.APP_CONFIG = {
    // Same-origin proxy на Vercel (не прямой URL постбэка)
    STATUS_API_URL: "/api",

    // Фоллбеки, пока /api/app/settings не ответил
    BROKER_URL_TEMPLATE:
        "https://pocketoption.com/en/register/?utm_source=bot&sub_id1={user_id}",
    MIN_DEPOSIT: 100,
};

window.APP_CONFIG_READY = Promise.resolve(window.APP_CONFIG);
