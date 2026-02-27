export default async function handler(req, res) {
  const targetUrl = `https://udfphsvzhigupkhdagyx.supabase.co${req.url.replace('/api/supabase', '')}`;

  // 1. Clean up headers to avoid conflicts
  const cleanHeaders = {};
  const forbiddenHeaders = ['host', 'connection', 'content-length', 'transfer-encoding'];
  Object.keys(req.headers).forEach(key => {
    if (!forbiddenHeaders.includes(key.toLowerCase())) {
      cleanHeaders[key] = req.headers[key];
    }
  });
  
  // 2. Force the correct host for Supabase/Cloudflare
  cleanHeaders['host'] = 'udfphsvzhigupkhdagyx.supabase.co';

  try {
    const fetchOptions = {
      method: req.method,
      headers: cleanHeaders,
    };

    // 3. Stringify the body if it's an object
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();
    
    // 4. Mirror the content type back to the app
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
}
