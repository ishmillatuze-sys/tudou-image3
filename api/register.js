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

  const { username, password, inviteCode } = req.body;

  if (!username || !password || !inviteCode) {
    return res.status(400).json({ error: '请填写所有字段' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: '用户名需要3-20个字符' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少6个字符' });
  }

  try {
    const { data: inviteData, error: inviteError } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', inviteCode)
      .eq('is_used', false)
      .single();

    if (inviteError || !inviteData) {
      return res.status(400).json({ error: '邀请码无效或已被使用' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        username,
        password,
        invite_code: inviteCode
      })
      .select()
      .single();

    if (createError) {
      return res.status(500).json({ error: '注册失败' });
    }

    await supabase
      .from('invite_codes')
      .update({ is_used: true, used_by: user.id })
      .eq('id', inviteData.id);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
}