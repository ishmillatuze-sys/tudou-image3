import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: '服务器配置错误' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const userId = req.headers['x-beta-code'];

  if (!userId) {
    return res.status(401).json({ error: '请先登录' });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: '用户无效' });
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

    const data = await response.json();

    if (data.code !== 200) {
      return res.status(400).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}