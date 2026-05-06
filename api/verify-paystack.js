export default async function handler(req, res) {
  const reference = req.query.reference;
  if (!reference) return res.status(400).json({ error: 'Reference required' });

  const secret = process.env.PAYSTACK_SECRET_KEY;

  try {
    const r = await fetch('https://api.paystack.co/transaction/verify/' + reference, {
      headers: { 'Authorization': 'Bearer ' + secret }
    });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
