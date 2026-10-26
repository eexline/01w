/* ============================================
 * Onboarding gate: Account → Deposit → Chat
 * Requires: window.APP_CONFIG, Telegram.WebApp (optional)
 * ============================================ */

(function (global) {
    const cfg = () => global.APP_CONFIG || {};
    let settingsLoaded = false;
    let settingsPromise = null;
    let currentStep = "account"; // account | deposit | chat | guest
    let lastStatus = null;
    let i18nGetter = () => ({});
    let gateCallbacks = {};
    let awaitingReturn = false;
    let refreshInFlight = null;
    let lastRefreshAt = 0;
    let waitLoopActive = false;
    let waitAbort = null;

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
        return (cfg().STATUS_API_URL || "/api").replace(/\/$/, "") || "/api";
    }

    function t(key, fallback) {
        const dict = i18nGetter() || {};
        return dict[key] || fallback || key;
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

        if (/[?&]sub_id1=/i.test(template)) {
            return template.replace(
                /([?&]sub_id1=)[^&]*/i,
                `$1${encodeURIComponent(id)}`
            );
        }

        template = template.replace(/[?&]+$/, "");
        const join = template.includes("?") ? "&" : "?";
        return `${template}${join}sub_id1=${encodeURIComponent(id)}`;
    }

    async function fetchUserStatus(telegramId) {
        await loadAppSettings();
        const base = apiBase();
        const res = await fetch(
            `${base}/user/status?telegram_id=${encodeURIComponent(telegramId)}`,
            { method: "GET" }
        );
        if (!res.ok) throw new Error("status_http_" + res.status);
        return res.json();
    }

    async function waitUserStatus(telegramId, known, signal) {
        await loadAppSettings();
        const base = apiBase();
        const q = new URLSearchParams({
            telegram_id: String(telegramId),
            known_registered: known && known.registered ? "1" : "0",
            known_unlocked: known && known.chat_unlocked ? "1" : "0",
            known_deposit: known && known.deposit != null ? String(known.deposit) : "-1",
            timeout: "20",
        });
        const res = await fetch(`${base}/user/wait?${q.toString()}`, {
            method: "GET",
            signal: signal,
        });
        if (!res.ok) throw new Error("wait_http_" + res.status);
        return res.json();
    }

    function applyStatus(status, opts) {
        opts = opts || gateCallbacks;
        lastStatus = status;
        const step = resolveStep(status);

        if (step === "chat") {
            awaitingReturn = false;
            stopWaitLoop();
            showOnboarding(false);
            if (typeof opts.onUnlocked === "function") opts.onUnlocked(status);
            return { ok: true, step: "chat", status };
        }

        showOnboarding(true);
        setTab(step);
        startWaitLoop();
        if (typeof opts.onLocked === "function") opts.onLocked(status);
        return { ok: false, step, status };
    }

    function stopWaitLoop() {
        waitLoopActive = false;
        if (waitAbort) {
            try { waitAbort.abort(); } catch (_) {}
            waitAbort = null;
        }
    }

    function startWaitLoop() {
        if (waitLoopActive) return;
        if (currentStep === "chat" || currentStep === "guest") return;
        waitLoopActive = true;

        (async function loop() {
            while (waitLoopActive && currentStep !== "chat" && currentStep !== "guest") {
                const user = getTelegramUser();
                if (!user || !user.id) break;

                waitAbort = typeof AbortController !== "undefined"
                    ? new AbortController()
                    : null;
                try {
                    const data = await waitUserStatus(
                        user.id,
                        lastStatus,
                        waitAbort && waitAbort.signal
                    );
                    if (!waitLoopActive) break;
                    if (data && data.changed) {
                        applyStatus(data, gateCallbacks);
                        if (resolveStep(data) === "chat") break;
                    } else {
                        // long-poll timeout без изменений — сразу новый wait
                        await new Promise((r) => setTimeout(r, 50));
                    }
                } catch (e) {
                    if (e && e.name === "AbortError") break;
                    console.warn("[access] wait failed", e);
                    // пауза только при ошибке сети
                    await new Promise((r) => setTimeout(r, 2500));
                } finally {
                    waitAbort = null;
                }
            }
            waitLoopActive = false;
        })();
    }

    function openBrokerExternal(userId) {
        const uid = userId != null
            ? userId
            : (getTelegramUser() && getTelegramUser().id);
        const url = buildBrokerUrl(uid);
        const tg = getTg();
        if (tg && typeof tg.openLink === "function") {
            try {
                tg.openLink(url);
                return;
            } catch (_) {}
        }
        global.open(url, "_blank", "noopener,noreferrer");
    }

    function $(id) {
        return document.getElementById(id);
    }

    function showOnboarding(show) {
        const root = $("onboarding");
        if (!root) return;
        root.classList.toggle("hidden", !show);
        root.setAttribute("aria-hidden", show ? "false" : "true");
        document.body.classList.toggle("onboarding-open", !!show);
    }

    function setTab(step) {
        const tabAccount = $("obTabAccount");
        const tabDeposit = $("obTabDeposit");
        const line = $("obTabLine");
        const panelAccount = $("obPanelAccount");
        const panelDeposit = $("obPanelDeposit");
        const panelGuest = $("obPanelGuest");
        const stepLabel = $("obStepLabel");
        const footer = $("obFooter");
        const ctaText = $("obCtaText");
        const depDesc = $("obDepDesc");
        const depMeta = $("obDepMeta");

        currentStep = step;

        if (panelGuest) panelGuest.classList.toggle("hidden", step !== "guest");
        if (panelAccount) panelAccount.classList.toggle("hidden", step !== "account");
        if (panelDeposit) panelDeposit.classList.toggle("hidden", step !== "deposit");

        if (step === "guest") {
            if (tabAccount) {
                tabAccount.classList.remove("active");
                tabAccount.disabled = true;
            }
            if (tabDeposit) {
                tabDeposit.classList.remove("active");
                tabDeposit.disabled = true;
            }
            if (stepLabel) stepLabel.textContent = "";
            if (footer) footer.classList.add("hidden");
            return;
        }

        if (footer) footer.classList.remove("hidden");

        const registered = !!(lastStatus && lastStatus.registered);

        if (tabAccount) {
            tabAccount.disabled = false;
            tabAccount.classList.toggle("active", step === "account");
            tabAccount.setAttribute("aria-selected", step === "account" ? "true" : "false");
        }
        if (tabDeposit) {
            tabDeposit.disabled = !registered;
            tabDeposit.classList.toggle("active", step === "deposit");
            tabDeposit.setAttribute("aria-selected", step === "deposit" ? "true" : "false");
        }
        if (line) line.classList.toggle("deposit", step === "deposit");

        if (stepLabel) {
            stepLabel.textContent = step === "deposit"
                ? t("ob_step_2", "STEP 2 OF 2")
                : t("ob_step_1", "STEP 1 OF 2");
        }

        if (ctaText) {
            ctaText.textContent = step === "deposit"
                ? t("ob_dep_cta", "Deposit")
                : t("ob_reg_cta", "Register");
        }

        if (step === "deposit" && depDesc) {
            const min = (lastStatus && lastStatus.min_deposit) || cfg().MIN_DEPOSIT || 100;
            const tpl = t(
                "ob_dep_desc",
                "Deposit at least ${min}$ to unlock AI Chat. After the deposit is credited, return here."
            );
            depDesc.textContent = tpl
                .replace(/\$\{min\}/g, String(min))
                .replace(/\{min\}/g, String(min));
        }

        if (depMeta) {
            if (step === "deposit" && lastStatus) {
                const min = lastStatus.min_deposit || cfg().MIN_DEPOSIT || 100;
                const cur = lastStatus.deposit || 0;
                const tpl = t(
                    "ob_dep_meta",
                    "Minimum: ${min}$ · Your deposit: ${current}$"
                );
                depMeta.textContent = tpl
                    .replace(/\$\{min\}/g, String(min))
                    .replace(/\{min\}/g, String(min))
                    .replace(/\$\{current\}/g, String(cur))
                    .replace(/\{current\}/g, String(cur));
            } else {
                depMeta.textContent = "";
            }
        }
    }

    function applyI18nStatic() {
        document.querySelectorAll("#onboarding [data-i18n]").forEach((node) => {
            const key = node.getAttribute("data-i18n");
            if (!key) return;
            const val = t(key, node.textContent);
            if (val) node.textContent = val;
        });
    }

    function resolveStep(status) {
        if (!status) return "account";
        if (status.chat_unlocked) return "chat";
        if (status.registered) return "deposit";
        return "account";
    }

    async function refreshGate(options) {
        const opts = Object.assign({}, gateCallbacks, options || {});
        if (refreshInFlight) return refreshInFlight;

        refreshInFlight = (async () => {
            lastRefreshAt = Date.now();
            stopWaitLoop();
            const user = getTelegramUser();

            if (!user || !user.id) {
                lastStatus = null;
                showOnboarding(true);
                setTab("guest");
                if (typeof opts.onLocked === "function") opts.onLocked();
                return { ok: false, step: "guest" };
            }

            let status;
            try {
                status = await fetchUserStatus(user.id);
            } catch (e) {
                console.warn("[access] status failed", e);
                lastStatus = null;
                showOnboarding(true);
                setTab("account");
                startWaitLoop();
                if (typeof opts.onLocked === "function") opts.onLocked();
                return { ok: false, step: "account", error: true };
            }

            return applyStatus(status, opts);
        })();

        try {
            return await refreshInFlight;
        } finally {
            refreshInFlight = null;
        }
    }

    /** Проверка только по факту возврата в Mini App (без таймера). */
    function checkOnReturn(force) {
        if (currentStep === "chat") return;
        if (!force && !awaitingReturn && document.visibilityState !== "visible") return;
        if (!force && Date.now() - lastRefreshAt < 1200) return;
        refreshGate({});
    }

    function bindOnboarding(options) {
        gateCallbacks = {
            onUnlocked: options && options.onUnlocked,
            onLocked: options && options.onLocked,
        };
        i18nGetter = options && options.getI18n
            ? options.getI18n
            : () => ({});

        applyI18nStatic();
        loadAppSettings();

        const tabAccount = $("obTabAccount");
        const tabDeposit = $("obTabDeposit");
        const cta = $("obCta");

        if (tabAccount) {
            tabAccount.addEventListener("click", () => {
                if (currentStep === "guest") return;
                setTab("account");
            });
        }
        if (tabDeposit) {
            tabDeposit.addEventListener("click", () => {
                if (tabDeposit.disabled) return;
                setTab("deposit");
            });
        }
        if (cta) {
            cta.addEventListener("click", async () => {
                await loadAppSettings();
                awaitingReturn = true;
                openBrokerExternal();
            });
        }

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                checkOnReturn(true);
            }
        });

        global.addEventListener("pageshow", () => checkOnReturn(true));
        global.addEventListener("focus", () => checkOnReturn(false));

        const tg = getTg();
        if (tg && typeof tg.onEvent === "function") {
            try {
                tg.onEvent("activated", () => checkOnReturn(true));
                tg.onEvent("viewportChanged", () => {
                    if (awaitingReturn) checkOnReturn(false);
                });
            } catch (_) {}
        }

        return refreshGate(gateCallbacks);
    }

    // Back-compat shims
    function openBroker() {
        openBrokerExternal();
    }
    function closeBroker() {
        /* no-op: iframe removed */
    }
    async function ensureChatAccess(i18n) {
        if (i18n) {
            const prev = i18nGetter;
            i18nGetter = () => i18n;
            const result = await refreshGate({});
            i18nGetter = prev;
            return result.ok;
        }
        const result = await refreshGate({});
        return result.ok;
    }
    function bindNav(options) {
        return bindOnboarding(options);
    }
    function showAccessModal() { /* replaced by onboarding */ }
    function hideAccessModal() { showOnboarding(false); }
    function accessMessage() { return ""; }

    global.AppAccess = {
        openBroker,
        closeBroker,
        openBrokerExternal,
        fetchUserStatus,
        ensureChatAccess,
        bindNav,
        bindOnboarding,
        refreshGate,
        applyI18nStatic,
        loadAppSettings,
        getTelegramUser,
        hideAccessModal,
        showAccessModal,
        accessMessage,
        buildBrokerUrl,
    };
})(window);
