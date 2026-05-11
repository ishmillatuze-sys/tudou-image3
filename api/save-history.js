import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 验证用户 token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }

  const { prompt, images, refImages, size, resolution } = req.body;

  if (!images) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('history')
      .insert({
        user_id: user.id,
        prompt,
        images,
        ref_images: refImages,
        size,
        resolution
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: '保存失败' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Save history error:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
}