import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { userId, prompt, images, refImages, size, resolution } = req.body;

  if (!userId || !images) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('history')
      .insert({
        user_id: userId,
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