export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, tx_ref } = req.body;

  if (!email || !tx_ref) {
    return res.status(400).json({ error: 'Missing email or tx_ref' });
  }

  const wpUrl = process.env.WP_URL;
  const wpUser = process.env.WP_USERNAME;
  const wpPass = process.env.WP_APP_PASSWORD;

  const credentials = Buffer.from(wpUser + ':' + wpPass).toString('base64');

  try {
    const findRes = await fetch(
      wpUrl + '/wp-json/fluent-crm/v2/subscribers?search=' + encodeURIComponent(email),
      { headers: { 'Authorization': 'Basic ' + credentials } }
    );
    const findData = await findRes.json();

    const contact = findData?.subscribers?.data?.find(c => c.email === email);

    if (!contact) {
      console.log('[store-tx-ref] Contact not found for email:', email);
      return res.status(200).json({ success: false, message: 'Contact not found' });
    }

    const updateRes = await fetch(
      wpUrl + '/wp-json/fluent-crm/v2/subscribers/' + contact.id,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + credentials
        },
        body: JSON.stringify({
          custom_values: { tx_ref: tx_ref }
        })
      }
    );

    const updateData = await updateRes.json();
    console.log('[store-tx-ref] Updated contact:', contact.id, 'with tx_ref:', tx_ref);

    return res.status(200).json({ success: true, contact_id: contact.id });

  } catch (err) {
    console.error('[store-tx-ref] Error:', err);
    return res.status(200).json({ success: false, error: err.message });
  }
}
