export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: '请输入邮箱' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: '邮箱格式不正确' });
  }

  // 生成6位验证码
  const code = Math.random().toString().slice(-6);

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: '邮件服务未配置' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: '土豆 Image-2 <noreply@tudouimage.cn>',
        to: email,
        subject: '您的验证码',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #667eea;">土豆 Image-2 验证码</h2>
            <p>您好！</p>
            <p>您的验证码是：</p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #666;">验证码有效期为5分钟，请勿泄露给他人。</p>
            <p style="color: #999; font-size: 12px;">如果您没有请求此验证码，请忽略此邮件。</p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(500).json({ error: '发送失败，请稍后重试' });
    }

    return res.status(200).json({
      success: true,
      message: '验证码已发送到您的邮箱',
      code: code // 开发环境返回验证码，生产环境删除这行
    });
  } catch (error) {
    console.error('Send code error:', error);
    return res.status(500).json({ error: '发送失败' });
  }
}