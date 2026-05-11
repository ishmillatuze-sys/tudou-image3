export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  const apiKey = process.env.APIMART_API_KEY;

  return res.status(200).json({
    supabaseUrlRaw: supabaseUrl,
    supabaseUrlLength: supabaseUrl ? supabaseUrl.length : 0,
    supabaseUrlStartsWithHttps: supabaseUrl ? supabaseUrl.startsWith('https://') : false,
    supabaseKeyLength: supabaseKey ? supabaseKey.length : 0,
    apiKey: apiKey ? 'SET' : 'NOT SET',
    supabaseUrlHasSpaces: supabaseUrl ? supabaseUrl.includes(' ') : false,
    supabaseUrlHasNewlines: supabaseUrl ? supabaseUrl.includes('\n') : false
  });
}