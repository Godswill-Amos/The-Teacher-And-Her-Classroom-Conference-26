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
  const authHeader = { 'Authorization': 'Basic ' + credentials };

  try {
    // Step 1: Get all subscribers (just to get IDs and basic info)
    const allRes = await fetch(
      wpUrl + '/wp-json/fluent-crm/v2/subscribers?per_page=100&order_by=created_at&order=DESC',
      { headers: authHeader }
    );
    const allData = await allRes.json();
    const subscribers = allData?.subscribers?.data || [];

    console.log('[fw-webhook] Total subscribers to check:', subscribers.length);

    // Step 2: Loop through each subscriber and fetch their full record (which includes custom_values)
    let contact = null;
    for (const sub of subscribers) {
      const detailRes = await fetch(
        wpUrl + '/wp-json/fluent-crm/v2/subscribers/' + sub.id,
        { headers: authHeader }
      );
      const detailData = await detailRes.json();
      const detailContact = detailData?.subscriber;

      if (!detailContact) continue;

      const cv = detailContact.custom_values || {};
      console.log('[fw-webhook] Checking contact', sub.id, 'tx_ref field:', cv.tx_ref);

      if (cv.tx_ref === txRef) {
        contact = detailContact;
        console.log('[fw-webhook] MATCH found! Contact ID:', sub.id);
        break;
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
    console.log('[fw-webhook] Update response status:', updateRes.status);
    console.log('[fw-webhook] Update response body:', JSON.stringify(updateData));

    return res.status(200).json({
      received: true,
      success: true,
      contact_id: contact.id,
      email: contact.email,
      tags_applied: tagsToAdd
    });

  } catch (err) {
    console.error('[fw-webhook] Error:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
}
