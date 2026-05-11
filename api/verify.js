export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  // 从环境变量获取内测码（如果有的话）
  const validCodes = process.env.BETA_CODES ? process.env.BETA_CODES.split(',') : [
    'TD2X-YWGJ-JPRH',
    'TD2X-JQU3-7X4A',
    'TD2X-47NE-LF48',
    'TD2X-5EG7-94UL',
    'TD2X-WF3H-TQZ5',
    'TD2X-B6KK-MAKG',
    'TD2X-2JFC-LZCV',
    'TD2X-4X9A-VZMS',
    'TD2X-LT4Z-S5X6',
    'TD2X-BA89-SB26',
    'TD2X-DT59-3NUJ',
    'TD2X-846W-ZU7R',
    'TD2X-MQNX-ET7G',
    'TD2X-MEAQ-AWJW',
    'TD2X-EP99-BAM4',
    'TD2X-SMLR-PAZJ',
    'TD2X-7V8C-9M2Y',
    'TD2X-AQ2A-7W2F',
    'TD2X-UD9D-HPKN',
    'TD2X-MTL3-L8ED',
    'TD2X-HA6Q-UQAV',
    'TD2X-CQ5E-MEUQ',
    'TD2X-C5GY-NZEN',
    'TD2X-QYCH-ZRV5',
    'TD2X-GXYD-HVMS',
    'TD2X-9YJ3-TXWZ',
    'TD2X-WPNC-DAP4',
    'TD2X-4GH6-HZ2S',
    'TD2X-Z29V-SQD7',
    'TD2X-MLM5-M2FV'
  ];

  const isValid = validCodes.includes(code);

  return res.status(200).json({
    valid: isValid,
    message: isValid ? 'Code is valid' : 'Invalid code'
  });
}
