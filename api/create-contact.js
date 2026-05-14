export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, first_name, last_name, phone } = req.body;

  if (!email || !first_name || !last_name || !phone) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const wpUrl = process.env.WP_URL;
  const sgeSecret = process.env.SGE_SECRET;

  try {
    const r = await fetch(wpUrl + '/wp-json/sge/v1/create-checkout-contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SGE-Secret': sgeSecret
      },
      body: JSON.stringify({ email, first_name, last_name, phone })
    });
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    console.error('[create-contact] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
