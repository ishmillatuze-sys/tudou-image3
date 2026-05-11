import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// 简单的验证码存储（生产环境应该用Redis）
const codeStore = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: '请输入邮箱' });
  }

  // 检查邮箱格式
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }

  try {
    // 生成6位验证码
    const code = Math.random().toString().slice(-6);

    // 存储验证码，5分钟有效
    codeStore.set(email, { code, expires: Date.now() + 5 * 60 * 1000 });

    // 发送邮件 - 使用Supabase的magic link功能发送验证码
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 创建一个临时用户来发送验证邮件
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { code },
        emailRedirectTo: req.headers.origin || 'https://tudouimage.cn'
      }
    });

    if (error) {
      console.error('Send code error:', error);
      // 如果OTP失败，我们手动存储验证码，让用户输入
      // 生产环境应该用真正的邮件服务如Resend
    }

    return res.status(200).json({
      success: true,
      code: code, // 临时返回验证码，生产环境应该去掉这行
      message: '验证码已发送'
    });
  } catch (error) {
    console.error('Send code error:', error);
    return res.status(500).json({ error: '发送失败' });
  }
}

// 导出codeStore供register使用
export { codeStore };