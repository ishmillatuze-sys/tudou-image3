export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const apiKey = process.env.APIMART_API_KEY;

  return res.status(200).json({
    supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
    supabaseKey: supabaseKey ? 'SET (length: ' + supabaseKey.length + ')' : 'NOT SET',
    apiKey: apiKey ? 'SET' : 'NOT SET',
    keyPrefix: supabaseKey ? supabaseKey.substring(0, 20) + '...' : null,
    hasNewlines: supabaseKey ? supabaseKey.includes('\n') : false
  });
}