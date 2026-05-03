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
  const sgeSecret = process.env.SGE_SECRET;

  try {
    // Step 1: Find the contact by tx_ref using our custom endpoint
    const findRes = await fetch(
      wpUrl + '/wp-json/sge/v1/find-by-tx-ref',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SGE-Secret': sgeSecret
        },
        body: JSON.stringify({ tx_ref: txRef })
      }
    );
    const findData = await findRes.json();

    console.log('[fw-webhook] Find result:', JSON.stringify(findData));

    if (!findData.found) {
      console.log('[fw-webhook] Contact not found for tx_ref:', txRef);
      return res.status(200).json({ received: true, found: false });
    }

    const contactId = findData.contact_id;
    const contactEmail = findData.email;

    console.log('[fw-webhook] Found contact:', contactId, 'email:', contactEmail);

    // Step 2: Determine which tags to add based on amount
    const isEarlyBird = amount <= 7000;
    const tagsToAdd = ['Paid - Conference 2026'];
    if (isEarlyBird) tagsToAdd.push('Early Bird');
    else tagsToAdd.push('Standard Price');

    // Step 3: Update the contact via Fluent CRM REST API
    const credentials = Buffer.from(wpUser + ':' + wpPass).toString('base64');

    const updatePayload = {
      attach_tags: tagsToAdd,
      detach_tags: ['Checkout Started', 'Checkout Abandoned'],
      attach_lists: ['Paid Registrants 2026']
    };

    const updateRes = await fetch(
      wpUrl + '/wp-json/fluent-crm/v2/subscribers/' + contactId,
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
    console.log('[fw-webhook] Update response body:', JSON.stringify(updateData).substring(0, 500));

    return res.status(200).json({
      received: true,
      success: true,
      contact_id: contactId,
      email: contactEmail,
      tags_applied: tagsToAdd
    });

  } catch (err) {
    console.error('[fw-webhook] Error:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
}
