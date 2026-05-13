export default async function handler(req, res) {
  const transactionId = req.query.transaction_id;
  if (!transactionId) return res.status(400).json({ error: 'transaction_id required' });

  const secret = process.env.FLUTTERWAVE_SECRET_KEY;

  try {
    const r = await fetch('https://api.flutterwave.com/v3/transactions/' + transactionId + '/verify', {
      headers: { 'Authorization': 'Bearer ' + secret }
    });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
