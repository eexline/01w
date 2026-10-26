import { getUpstreamBase } from "../../lib/upstream.js";

export const config = {
    maxDuration: 30,
};

/** GET /api/user/wait → long-poll STATUS_API_URL/user/wait */
export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        res.status(405).json({ error: "method_not_allowed" });
        return;
    }

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
    const target = `${base}/user/wait${qs}`;

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 28000);
        const upstream = await fetch(target, {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal,
        });
        clearTimeout(timer);

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
        console.error("[proxy wait]", target, e);
        res.status(504).json({
            error: "upstream_wait_timeout",
            detail: String(e && e.message ? e.message : e),
        });
    }
}
