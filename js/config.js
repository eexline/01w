/* ============================================
 * App config
 * STATUS_API_URL берётся из Vercel env через /api/config
 * Реф. ссылка и мин. депозит — из админки бота (/app/settings)
 * ============================================ */

window.APP_CONFIG = {
    STATUS_API_URL: "",

    // Фоллбеки, пока /app/settings не ответил
    // Если в ссылке уже есть ?параметры — в конце &sub_id1={user_id}
    BROKER_URL_TEMPLATE:
        "https://pocketoption.com/en/register/?utm_source=bot&sub_id1={user_id}",
    MIN_DEPOSIT: 100,
};

window.APP_CONFIG_READY = (async () => {
    try {
        const res = await fetch("/api/config", { method: "GET" });
        if (!res.ok) throw new Error("config_http_" + res.status);
        const data = await res.json();
        if (data && data.STATUS_API_URL) {
            window.APP_CONFIG.STATUS_API_URL = String(data.STATUS_API_URL)
                .trim()
                .replace(/\/$/, "");
        }
    } catch (e) {
        console.warn("[config] /api/config failed", e);
    }
    return window.APP_CONFIG;
})();
