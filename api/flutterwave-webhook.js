export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const hash = req.headers['verif-hash'];
  if (hash !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
    console.log('[fw-webhook] Invalid hash:', hash);
    return res.status(401).end();
  }

  const body = req.body;

  if (body?.data?.status !== 'successful') {
    console.log('[fw-webhook] Payment not successful, ignoring');
    return res.status(200).json({ received: true });
  }

  const txRef = body.data.tx_ref;
  const amount = body.data.amount;

  if (!txRef) {
    console.log('[fw-webhook] No tx_ref in webhook');
    return res.status(200).json({ received: true });
  }

  const wpUrl = process.env.WP_URL;
  const wpUser = process.env.WP_USERNAME;
  const wpPass = process.env.WP_APP_PASSWORD;
  const credentials = Buffer.from(wpUser + ':' + wpPass).toString('base64');

  try {
    const findRes = await fetch(
      wpUrl + '/wp-json/fluent-crm/v2/subscribers?custom_field_search=tx_ref:' + encodeURIComponent(txRef),
      { headers: { 'Authorization': 'Basic ' + credentials } }
    );
    const findData = await findRes.json();

    let contact = findData?.subscribers?.data?.find(c =>
      c.custom_values && c.custom_values.tx_ref === txRef
    );

    if (!contact) {
      const allRes = await fetch(
        wpUrl + '/wp-json/fluent-crm/v2/subscribers?per_page=50&order_by=created_at&order=DESC',
        { headers: { 'Authorization': 'Basic ' + credentials } }
      );
      const allData = await allRes.json();
      contact = allData?.subscribers?.data?.find(c =>
        c.custom_values && c.custom_values.tx_ref === txRef
      );
    }

    if (!contact) {
      console.log('[fw-webhook] Contact not found for tx_ref:', txRef);
      return res.status(200).json({ received: true, found: false });
    }

    console.log('[fw-webhook] Found contact:', contact.id, 'email:', contact.email);

    const isEarlyBird = amount <= 7000;
    const tagsToAdd = ['Paid - Conference 2026'];
    if (isEarlyBird) tagsToAdd.push('Early Bird');
    else tagsToAdd.push('Standard Price');

    const updatePayload = {
      attach_tags: tagsToAdd,
      detach_tags: ['Checkout Started', 'Checkout Abandoned'],
      attach_lists: ['Paid Registrants 2026']
    };

    const updateRes = await fetch(
      wpUrl + '/wp-json/fluent-crm/v2/subscribers/' + contact.id,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + credentials
        },
        body: JSON.stringify(updatePayload)
      }
    );

    const updateData = await updateRes.json();
    console.log('[fw-webhook] Updated contact', contact.id, 'with tags:', tagsToAdd);

    return res.status(200).json({ received: true, success: true });

  } catch (err) {
    console.error('[fw-webhook] Error:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
}
