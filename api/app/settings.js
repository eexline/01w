import { proxyGet } from "../../lib/upstream.js";

/** GET /api/app/settings → STATUS_API_URL/app/settings */
export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        res.status(405).json({ error: "method_not_allowed" });
        return;
    }
    await proxyGet(req, res, "/app/settings");
}
