export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  return res.status(200).json({
    flutterwave_public_key: process.env.FLUTTERWAVE_PUBLIC_KEY || process.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-80158c07d0d7299afeb9d5d76b4600f5-X'
  });
}
