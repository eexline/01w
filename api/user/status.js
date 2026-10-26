import { proxyGet } from "../../lib/upstream.js";

/** GET /api/user/status?telegram_id=… → STATUS_API_URL/user/status?… */
export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        res.status(405).json({ error: "method_not_allowed" });
        return;
    }
    await proxyGet(req, res, "/user/status");
}
