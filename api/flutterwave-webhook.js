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

  console.log('[fw-webhook] Looking for tx_ref:', txRef);

  const wpUrl = process.env.WP_URL;
  const wpUser = process.env.WP_USERNAME;
  const wpPass = process.env.WP_APP_PASSWORD;
  const credentials = Buffer.from(wpUser + ':' + wpPass).toString('base64');

  try {
    // Fetch all subscribers with custom values included
    const allRes = await fetch(
      wpUrl + '/wp-json/fluent-crm/v2/subscribers?per_page=100&with[]=custom_values',
      { headers: { 'Authorization': 'Basic ' + credentials } }
    );
    const allData = await allRes.json();

    console.log('[fw-webhook] Total subscribers fetched:', allData?.subscribers?.data?.length || 0);

    if (allData?.subscribers?.data?.[0]) {
      const sample = allData.subscribers.data[0];
      console.log('[fw-webhook] Sample contact keys:', Object.keys(sample));
      console.log('[fw-webhook] Sample custom_values:', JSON.stringify(sample.custom_values));
    }

    let contact = allData?.subscribers?.data?.find(c => {
      const cv = c.custom_values || {};
      return cv.tx_ref === txRef || cv.transaction_reference === txRef;
    });

    // Fallback: fetch each contact's full record individually if list view doesn't include custom_values
    if (!contact && allData?.subscribers?.data) {
      console.log('[fw-webhook] No match in list view, trying individual lookups...');
      for (const c of allData.subscribers.data.slice(0, 30)) {
        const detailRes = await fetch(
          wpUrl + '/wp-json/fluent-crm/v2/subscribers/' + c.id,
          { headers: { 'Authorization': 'Basic ' + credentials } }
        );
        const detailData = await detailRes.json();
        const detailContact = detailData?.subscriber;
        if (detailContact?.custom_values?.tx_ref === txRef ||
            detailContact?.custom_values?.transaction_reference === txRef) {
          contact = detailContact;
          console.log('[fw-webhook] Found contact via individual lookup:', c.id);
          console.log('[fw-webhook] Detail custom_values:', JSON.stringify(detailContact.custom_values));
          break;
        }
      }
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
    console.log('[fw-webhook] Update response:', JSON.stringify(updateData));

    return res.status(200).json({ received: true, success: true, contact_id: contact.id });

  } catch (err) {
    console.error('[fw-webhook] Error:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
}
