export default async function handler(req, res) {
  const SUPABASE_DOMAIN = 'udfphsvzhigupkhdagyx.supabase.co';

  // 🔥 1. CORS HEADERS (MANDATORY)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PUT,DELETE,OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );

  // 🔥 2. HANDLE PREFLIGHT EARLY
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = `https://${SUPABASE_DOMAIN}${req.url.replace(
    '/api/supabase',
    ''
  )}`;

  // Clean headers
  const cleanHeaders = {};
  const forbiddenHeaders = [
    'host',
    'connection',
    'content-length',
    'transfer-encoding',
  ];

  Object.keys(req.headers).forEach((key) => {
    if (!forbiddenHeaders.includes(key.toLowerCase())) {
      cleanHeaders[key] = req.headers[key];
    }
  });

  // Force correct host for Supabase
  cleanHeaders['host'] = SUPABASE_DOMAIN;

  try {
    const fetchOptions = {
      method: req.method,
      headers: cleanHeaders,
    };

    if (
      req.method !== 'GET' &&
      req.method !== 'HEAD' &&
      req.body
    ) {
      fetchOptions.body =
        typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    // Mirror content type
    res.setHeader(
      'Content-Type',
      response.headers.get('content-type') || 'application/json'
    );

    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({
      error: 'Proxy failed',
      details: err.message,
    });
  }
}
