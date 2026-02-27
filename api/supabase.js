export default async function handler(req, res) {
   const allowedOrigins = [
    'http://localhost:3000',
    'https://your-frontend-domain.vercel.app', // change this later
  ];
  // Later change to your production frontend domain

  // --- CORS HEADERS ---
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-supabase-api-version, apikey"
  );

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { path = [] } = req.query;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const targetUrl = `${supabaseUrl}/${path.join("/")}${
      req.url.includes("?") ? "?" + req.url.split("?")[1] : ""
    }`;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": req.headers.authorization || "",
        "apikey": supabaseServiceKey,
        "x-supabase-api-version":
          req.headers["x-supabase-api-version"] || "2024-01-01"
      },
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? JSON.stringify(req.body)
          : undefined
    });

    const data = await response.text();

    res.status(response.status).send(data);

  } catch (error) {
    console.error("Proxy Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
