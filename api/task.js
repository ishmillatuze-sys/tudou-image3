export default async function handler(req, res) {
  // 设置 CORS 头
  const origin = req.headers.origin || '';
  if (origin.includes('tudouimage.cn') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 验证请求来源
  const referer = req.headers.referer || req.headers.origin || '';
  const allowedDomains = ['tudouimage.cn', 'localhost', '127.0.0.1'];
  const isAllowed = allowedDomains.some(domain => referer.includes(domain));

  if (!isAllowed && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: '请求来源不被允许' });
  }

  const { taskId } = req.query;
  const API_KEY = process.env.APIMART_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch(`https://api.apimart.ai/v1/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Task Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}