import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { username, password, email, code } = req.body;

  // 验证输入
  if (!username || !password || !email || !code) {
    return res.status(400).json({ error: '请填写所有字段' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: '用户名需要3-20个字符' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少6个字符' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }

  try {
    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    // 检查邮箱是否已存在
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return res.status(400).json({ error: '该邮箱已注册' });
    }

    // 创建用户
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        username,
        password,
        email,
        email_verified: true
      })
      .select()
      .single();

    if (createError) {
      console.error('Create user error:', createError);
      return res.status(500).json({ error: '注册失败' });
    }

    return res.status(200).json({
      success: true,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
}