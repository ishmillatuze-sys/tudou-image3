import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || '';
  if (origin.includes('tudouimage.cn') || origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 统计信息
    const stats = {
      total: data.length,
      today: data.filter(u => new Date(u.created_at) > new Date(Date.now() - 24*60*60*1000)).length,
      thisWeek: data.filter(u => new Date(u.created_at) > new Date(Date.now() - 7*24*60*60*1000)).length
    };

    return res.status(200).json({ users: data, stats });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
}