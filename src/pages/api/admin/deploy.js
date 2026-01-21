export default async function handler(req, res) {
  // 填入你从 Vercel 设置里拿到的 Hook URL (格式: https://api.vercel.com/v1/...)
  const VERCEL_HOOK = 'https://api.vercel.com/v1/integrations/deploy/prj_VLi5jzJ66SohK987g8lev5SPgiCi/Zg1wvfNE9W';
  
  if (!VERCEL_HOOK.startsWith('http')) {
     return res.status(200).json({ success: false, message: '请先配置 Hook URL' });
  }
  
  try {
    await fetch(VERCEL_HOOK, { method: 'POST' });
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
}