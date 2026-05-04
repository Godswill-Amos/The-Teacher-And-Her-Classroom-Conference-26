export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const wpUrl = process.env.WP_URL;
  const sgeSecret = process.env.SGE_SECRET;

  try {
    const r = await fetch(wpUrl + '/wp-json/sge/v1/check-payment-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SGE-Secret': sgeSecret
      },
      body: JSON.stringify({ email })
    });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('[check-payment-status] Error:', err);
    return res.status(200).json({ paid: false, error: err.message });
  }
}
