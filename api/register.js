import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password, inviteCode } = req.body;

  // 验证输入
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
    // 检查邀请码是否有效
    const { data: inviteData, error: inviteError } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('code', inviteCode)
      .eq('is_used', false)
      .single();

    if (inviteError || !inviteData) {
      return res.status(400).json({ error: '邀请码无效或已被使用' });
    }

    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 创建用户
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        username,
        password, // 注意：实际生产环境应该加密密码
        invite_code: inviteCode
      })
      .select()
      .single();

    if (createError) {
      return res.status(500).json({ error: '注册失败' });
    }

    // 标记邀请码已使用
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
