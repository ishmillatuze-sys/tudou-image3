export default async function handler(req, res) {
  // 设置 CORS 头 - 允许 tudouimage.cn 及其子域名
  const origin = req.headers.origin || '';
  if (origin.includes('tudouimage.cn') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 验证请求来源
  const referer = req.headers.referer || req.headers.origin || '';
  const allowedDomains = ['tudouimage.cn', 'localhost', '127.0.0.1'];
  const isAllowed = allowedDomains.some(domain => referer.includes(domain));

  if (!isAllowed && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: '请求来源不被允许' });
  }

  const API_KEY = process.env.APIMART_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const body = req.body;

    const response = await fetch('https://api.apimart.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(body)
    });

    // 先检查响应是否成功
    if (!response.ok) {
      const text = await response.text();
      console.error('API Error Response:', text);
      return res.status(response.status).json({
        code: response.status,
        message: `API错误: ${response.status} ${response.statusText}`
      });
    }

    const data = await response.json();

    if (data.code !== 200) {
      return res.status(400).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ code: 500, message: '服务器错误: ' + error.message });
  }
}