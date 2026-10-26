/**
 * Upstream postback base from Vercel env (http:// allowed — вызывается только на сервере).
 */
export function getUpstreamBase() {
    return String(process.env.STATUS_API_URL || "")
        .trim()
        .replace(/\/$/, "");
}

/**
 * Проксирует GET на upstream и отдаёт JSON клиенту.
 */
export async function proxyGet(req, res, upstreamPath) {
    const base = getUpstreamBase();
    if (!base) {
        res.status(500).json({
            error: "STATUS_API_URL_not_set",
            detail: "Set STATUS_API_URL in Vercel Environment Variables",
        });
        return;
    }

    const url = new URL(req.url, "http://localhost");
    const qs = url.search || "";
    const target = `${base}${upstreamPath}${qs}`;

    try {
        const upstream = await fetch(target, {
            method: "GET",
            headers: { Accept: "application/json" },
        });
        const text = await upstream.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = { error: "invalid_upstream_json", raw: text.slice(0, 500) };
        }
        res.setHeader("Cache-Control", "no-store");
        res.status(upstream.status).json(data);
    } catch (e) {
        console.error("[proxy]", target, e);
        res.status(502).json({
            error: "upstream_unreachable",
            detail: String(e && e.message ? e.message : e),
        });
    }
}
