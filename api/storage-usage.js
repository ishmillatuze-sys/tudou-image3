import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 获取所有存储桶的文件列表和大小
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      return res.status(500).json({ error: bucketsError.message });
    }

    let totalSize = 0;
    let totalFiles = 0;
    const bucketDetails = [];

    for (const bucket of buckets || []) {
      try {
        const { data: files, error: filesError } = await supabase
          .storage
          .from(bucket.name)
          .list('', { limit: 1000 });

        if (!filesError && files) {
          let bucketSize = 0;
          let bucketFiles = 0;

          for (const file of files) {
            if (file.metadata?.size) {
              bucketSize += file.metadata.size;
              bucketFiles++;
            }
          }

          totalSize += bucketSize;
          totalFiles += bucketFiles;
          bucketDetails.push({
            name: bucket.name,
            size: bucketSize,
            files: bucketFiles,
            sizeMB: Math.round(bucketSize / 1024 / 1024 * 100) / 100
          });
        }
      } catch (e) {
        // 忽略单个桶的错误
      }
    }

    // Supabase 免费版有 1GB 存储，Pro 版有 100GB
    const freeLimit = 1024 * 1024 * 1024; // 1GB
    const usedPercentage = Math.round((totalSize / freeLimit) * 100);

    return res.status(200).json({
      totalSizeBytes: totalSize,
      totalSizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100,
      totalSizeGB: Math.round(totalSize / 1024 / 1024 / 1024 * 100) / 100,
      totalFiles,
      buckets: bucketDetails,
      freeTierLimit: '1GB',
      usedPercentage: usedPercentage > 100 ? '100+%' : `${usedPercentage}%`,
      remainingMB: Math.round((freeLimit - totalSize) / 1024 / 1024)
    });
  } catch (error) {
    console.error('Storage usage error:', error);
    return res.status(500).json({ error: '服务器错误' });
  }
}