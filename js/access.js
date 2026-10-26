/* ============================================
 * Broker iframe + AI Chat access gate
 * Requires: window.APP_CONFIG, Telegram.WebApp (optional)
 * ============================================ */

(function (global) {
    const cfg = () => global.APP_CONFIG || {};
    let settingsLoaded = false;
    let settingsPromise = null;

    function getTg() {
        return global.Telegram && global.Telegram.WebApp
            ? global.Telegram.WebApp
            : null;
    }

    function getTelegramUser() {
        const tg = getTg();
        if (!tg) return null;
        let u = tg.initDataUnsafe && tg.initDataUnsafe.user
            ? tg.initDataUnsafe.user
            : null;
        if (!u && tg.initData) {
            try {
                const raw = new URLSearchParams(tg.initData).get("user");
                if (raw) u = JSON.parse(raw);
            } catch (_) {}
        }
        return u;
    }

    function apiBase() {
        return (cfg().STATUS_API_URL || "").replace(/\/$/, "");
    }

    async function loadAppSettings() {
        if (settingsLoaded) return cfg();
        if (settingsPromise) return settingsPromise;

        settingsPromise = (async () => {
            if (global.APP_CONFIG_READY) {
                try {
                    await global.APP_CONFIG_READY;
                } catch (_) {}
            }
            const base = apiBase();
            if (!base) return cfg();
            try {
                const res = await fetch(`${base}/app/settings`);
                if (!res.ok) throw new Error("settings_http_" + res.status);
                const data = await res.json();
                if (data.ref_link) {
                    global.APP_CONFIG.BROKER_URL_TEMPLATE = data.ref_link;
                }
                if (data.min_deposit != null) {
                    global.APP_CONFIG.MIN_DEPOSIT = Number(data.min_deposit);
                }
                settingsLoaded = true;
            } catch (e) {
                console.warn("[access] settings failed", e);
            }
            return cfg();
        })();

        return settingsPromise;
    }

    function buildBrokerUrl(userId) {
        let template = (cfg().BROKER_URL_TEMPLATE || "https://pocketoption.com/").trim();
        const id = userId != null ? String(userId) : "";

        if (
            template.includes("{user_id}")
            || template.includes("{telegram_id}")
            || template.includes("{sub_id1}")
        ) {
            return template
                .replaceAll("{user_id}", id)
                .replaceAll("{telegram_id}", id)
                .replaceAll("{sub_id1}", id);
        }

        if (!id) return template;

        // Уже есть sub_id1=... — подставляем значение
        if (/[?&]sub_id1=/i.test(template)) {
            return template.replace(
                /([?&]sub_id1=)[^&]*/i,
                `$1${encodeURIComponent(id)}`
            );
        }

        // В конец: &sub_id1= если в ссылке уже есть ?, иначе ?sub_id1=
        template = template.replace(/[?&]+$/, "");
        const join = template.includes("?") ? "&" : "?";
        return `${template}${join}sub_id1=${encodeURIComponent(id)}`;
    }

    function setNavActive(which) {
        const broker = document.getElementById("navBroker")
            || document.querySelector("[data-nav='broker']");
        const chat = document.getElementById("navChat")
            || document.querySelector("[data-nav='chat']");
        if (broker) broker.classList.toggle("active", which === "broker");
        if (chat) chat.classList.toggle("active", which === "chat");
    }

    function ensureBrokerView() {
        let view = document.getElementById("brokerView");
        if (view) return view;

        view = document.createElement("div");
        view.id = "brokerView";
        view.className = "broker-view hidden";
        view.setAttribute("aria-hidden", "true");
        view.innerHTML = '<iframe id="brokerFrame" class="broker-frame" title="Broker" src="about:blank" allow="clipboard-write; payment *; fullscreen"></iframe>';
        document.body.appendChild(view);
        return view;
    }

    function closeBroker() {
        const view = document.getElementById("brokerView");
        const frame = document.getElementById("brokerFrame");
        if (view) {
            view.classList.add("hidden");
            view.setAttribute("aria-hidden", "true");
        }
        if (frame) frame.src = "about:blank";
        document.body.classList.remove("broker-open");
        setNavActive("chat");
    }

    async function openBroker(userId) {
        await loadAppSettings();
        hideAccessModal();

        const uid = userId != null
            ? userId
            : (getTelegramUser() && getTelegramUser().id);
        const url = buildBrokerUrl(uid);

        const view = ensureBrokerView();
        const frame = document.getElementById("brokerFrame");
        if (frame) frame.src = url;

        view.classList.remove("hidden");
        view.setAttribute("aria-hidden", "false");
        document.body.classList.add("broker-open");
        setNavActive("broker");
    }

    async function fetchUserStatus(telegramId) {
        await loadAppSettings();
        const base = apiBase();
        if (!base) {
            console.warn("[access] STATUS_API_URL is empty (set it in Vercel env)");
            return {
                registered: false,
                deposit: 0,
                min_deposit: cfg().MIN_DEPOSIT || 100,
                chat_unlocked: false,
                error: "no_api",
            };
        }
        const res = await fetch(
            `${base}/user/status?telegram_id=${encodeURIComponent(telegramId)}`,
            { method: "GET" }
        );
        if (!res.ok) throw new Error("status_http_" + res.status);
        return res.json();
    }

    function accessMessage(status, i18n) {
        const t = i18n || {};
        const min = (status && status.min_deposit) || cfg().MIN_DEPOSIT || 100;
        if (!status || status.error === "no_api") {
            return t.access_no_user || "Please open this app via Telegram.";
        }
        if (!status.registered) {
            return t.access_need_reg
                || "Register on Pocket Option via Broker to unlock AI Chat.";
        }
        if ((status.deposit || 0) < min) {
            const tpl = t.access_need_deposit
                || "Deposit at least ${min}. Your deposit: ${current}.";
            return tpl
                .replace("{min}", String(min))
                .replace("${min}", String(min))
                .replace("{current}", String(status.deposit || 0))
                .replace("${current}", String(status.deposit || 0));
        }
        return t.access_denied || "AI Chat is locked.";
    }

    function showAccessModal(opts) {
        const modal = document.getElementById("accessModal");
        if (!modal) return;
        const title = document.getElementById("accessModalTitle");
        const desc = document.getElementById("accessModalDesc");
        if (title && opts.title) title.textContent = opts.title;
        if (desc && opts.desc) desc.textContent = opts.desc;
        modal.classList.remove("hidden");
        modal.classList.add("open");
        modal.style.pointerEvents = "auto";
    }

    function hideAccessModal() {
        const modal = document.getElementById("accessModal");
        if (!modal) return;
        modal.classList.add("hidden");
        modal.classList.remove("open");
    }

    async function ensureChatAccess(i18n) {
        const user = getTelegramUser();
        if (!user || !user.id) {
            showAccessModal({
                title: (i18n && i18n.access_title) || "Access denied",
                desc: (i18n && i18n.access_no_user)
                    || "Please open this app via Telegram.",
            });
            return false;
        }
        let status;
        try {
            status = await fetchUserStatus(user.id);
        } catch (e) {
            console.warn("[access] status failed", e);
            showAccessModal({
                title: (i18n && i18n.access_title) || "Access denied",
                desc: (i18n && i18n.access_no_user)
                    || "Please open this app via Telegram.",
            });
            return false;
        }
        if (status.chat_unlocked) return true;
        showAccessModal({
            title: (i18n && i18n.access_title) || "AI Chat locked",
            desc: accessMessage(status, i18n),
        });
        return false;
    }

    function bindNav(options) {
        const i18nGetter = options && options.getI18n
            ? options.getI18n
            : () => ({});
        const onUnlockedChat = options && options.onUnlockedChat;

        loadAppSettings();

        document.querySelectorAll("[data-nav='broker']").forEach((el) => {
            el.addEventListener("click", (e) => {
                e.preventDefault();
                openBroker();
            });
        });

        document.querySelectorAll("[data-nav='chat']").forEach((el) => {
            el.addEventListener("click", async (e) => {
                e.preventDefault();
                closeBroker();
                const ok = await ensureChatAccess(i18nGetter());
                if (!ok) return;
                if (typeof onUnlockedChat === "function") {
                    onUnlockedChat();
                }
            });
        });

        const openBtn = document.getElementById("accessOpenBrokerBtn");
        if (openBtn) {
            openBtn.addEventListener("click", () => openBroker());
        }
        // Модалку доступа нельзя закрыть — только Open Broker
    }

    global.AppAccess = {
        openBroker,
        closeBroker,
        fetchUserStatus,
        ensureChatAccess,
        bindNav,
        loadAppSettings,
        getTelegramUser,
        hideAccessModal,
        showAccessModal,
        accessMessage,
    };
})(window);
