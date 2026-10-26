/**
 * Vercel serverless: отдаёт STATUS_API_URL из Environment Variables.
 * В Vercel: Settings → Environment Variables → STATUS_API_URL=https://your-postback.example.com
 */
export default function handler(req, res) {
    const url = String(process.env.STATUS_API_URL || "")
        .trim()
        .replace(/\/$/, "");

    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({
        STATUS_API_URL: url,
    });
}
