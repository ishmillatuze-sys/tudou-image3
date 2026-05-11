import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: '环境变量未设置' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 测试简单查询
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .limit(1);

    if (error) {
      return res.status(500).json({
        error: 'Supabase 查询失败',
        details: error.message,
        code: error.code
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Supabase 连接成功',
      data: data
    });
  } catch (err) {
    return res.status(500).json({
      error: '异常错误',
      details: err.message,
      stack: err.stack?.substring(0, 500)
    });
  }
}