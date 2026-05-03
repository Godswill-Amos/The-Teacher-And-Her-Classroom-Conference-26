export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const hash = req.headers['verif-hash'];
  if (hash !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
    return res.status(401).end();
  }

  const body = req.body;
  if (body?.data?.status !== 'successful') {
    return res.status(200).json({ received: true });
  }

  const txRef = body.data.tx_ref;
  if (!txRef) {
    return res.status(200).json({ received: true });
  }

  const wpUrl = process.env.WP_URL;
  const wpUser = process.env.WP_USERNAME;
  const wpPass = process.env.WP_APP_PASSWORD;
  const credentials = Buffer.from(wpUser + ':' + wpPass).toString('base64');
  const authHeader = { 'Authorization': 'Basic ' + credentials };

  try {
    const variants = [
      wpUrl + '/wp-json/fluent-crm/v2/subscribers/13',
      wpUrl + '/wp-json/fluent-crm/v2/subscribers/13?with[]=custom_values',
      wpUrl + '/wp-json/fluent-crm/v2/subscribers/13?with=custom_values',
      wpUrl + '/wp-json/fluent-crm/v2/subscribers/13?include=custom_values',
      wpUrl + '/wp-json/fluent-crm/v2/subscribers/13/custom-values',
      wpUrl + '/wp-json/fluent-crm/v2/subscribers/13?with_meta=true'
    ];

    for (const url of variants) {
      try {
        const r = await fetch(url, { headers: authHeader });
        const d = await r.json();
        console.log('[fw-webhook] === URL:', url);
        console.log('[fw-webhook] Status:', r.status);
        console.log('[fw-webhook] Top-level keys:', Object.keys(d || {}));
        if (d?.subscriber) {
          console.log('[fw-webhook] subscriber keys:', Object.keys(d.subscriber));
        }
        console.log('[fw-webhook] FULL response:', JSON.stringify(d).substring(0, 2000));
      } catch (e) {
        console.log('[fw-webhook] Error fetching', url, ':', e.message);
      }
    }

    return res.status(200).json({ received: true, debug: 'Check Vercel logs' });

  } catch (err) {
    console.error('[fw-webhook] Error:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
}
