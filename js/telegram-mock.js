/* =========================================================
 * ВРЕМЕННЫЙ МОК Telegram.WebApp — только для локальной проверки.
 * Потом удалить этот файл и <script> из chat.html.
 *
 * Подмена user id: http://localhost:5500/chat.html?tg_id=123456789
 * ========================================================= */

(function () {
    const host = location.hostname;
    const isLocal =
        host === "localhost"
        || host === "127.0.0.1"
        || host === "[::1]"
        || host === "";

    if (!isLocal) return;

    const params = new URLSearchParams(location.search);
    const id = Number(params.get("tg_id") || params.get("user_id") || 123456789);

    const user = {
        id: id,
        first_name: "Test",
        last_name: "User",
        username: "test_user",
        language_code: "en",
        is_premium: false,
    };

    const mock = {
        initDataUnsafe: { user: user, auth_date: Math.floor(Date.now() / 1000) },
        initData: "user=" + encodeURIComponent(JSON.stringify(user)),
        version: "8.0",
        platform: "web",
        colorScheme: "dark",
        themeParams: {},
        isExpanded: true,
        isFullscreen: false,
        viewportHeight: window.innerHeight,
        viewportStableHeight: window.innerHeight,
        safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
        contentSafeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
        ready: function () {},
        expand: function () {},
        close: function () {},
        requestFullscreen: function () {},
        openLink: function (url) { window.open(url, "_blank"); },
        openTelegramLink: function (url) { window.open(url, "_blank"); },
        onEvent: function () {},
        offEvent: function () {},
        sendData: function () {},
        HapticFeedback: {
            impactOccurred: function () {},
            notificationOccurred: function () {},
            selectionChanged: function () {},
        },
    };

    window.Telegram = window.Telegram || {};
    window.Telegram.WebApp = mock;

    console.info("[telegram-mock] active, user.id =", id);
})();
