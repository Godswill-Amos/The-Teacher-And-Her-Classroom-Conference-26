import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Verify Paystack signature
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers['x-paystack-signature'];

  const rawBody = JSON.stringify(req.body);
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

  if (hash !== signature) {
    console.log('[ps-webhook] Invalid signature');
    return res.status(401).end();
  }

  const body = req.body;

  // Only process successful charges
  if (body?.event !== 'charge.success') {
    console.log('[ps-webhook] Event not charge.success, ignoring:', body?.event);
    return res.status(200).json({ received: true });
  }

  const reference = body.data.reference;
  const amount = body.data.amount / 100; // Paystack amount is in kobo

  if (!reference) {
    console.log('[ps-webhook] No reference in webhook');
    return res.status(200).json({ received: true });
  }

  console.log('[ps-webhook] Looking for reference:', reference);

  const wpUrl = process.env.WP_URL;
  const wpUser = process.env.WP_USERNAME;
  const wpPass = process.env.WP_APP_PASSWORD;
  const sgeSecret = process.env.SGE_SECRET;

  try {
    // Step 1: Find contact by reference (stored in tx_ref custom field)
    const findRes = await fetch(wpUrl + '/wp-json/sge/v1/find-by-tx-ref', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SGE-Secret': sgeSecret
      },
      body: JSON.stringify({ tx_ref: reference })
    });
    const findData = await findRes.json();

    console.log('[ps-webhook] Find result:', JSON.stringify(findData));

    if (!findData.found) {
      return res.status(200).json({ received: true, found: false });
    }

    const contactId = findData.contact_id;

    // Step 2: Update tags via Fluent CRM REST API
    const credentials = Buffer.from(wpUser + ':' + wpPass).toString('base64');
    const isEarlyBird = amount <= 7000;
    const tagsToAdd = ['Paid - Conference 2026'];
    if (isEarlyBird) tagsToAdd.push('Early Bird');
    else tagsToAdd.push('Standard Price');

    const updateRes = await fetch(wpUrl + '/wp-json/fluent-crm/v2/subscribers/' + contactId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + credentials
      },
      body: JSON.stringify({
        attach_tags: tagsToAdd,
        detach_tags: ['Checkout Started', 'Checkout Abandoned'],
        attach_lists: ['Paid Registrants 2026']
      })
    });

    const updateData = await updateRes.json();
    console.log('[ps-webhook] Update status:', updateRes.status);

    return res.status(200).json({
      received: true,
      success: true,
      contact_id: contactId,
      tags_applied: tagsToAdd
    });

  } catch (err) {
    console.error('[ps-webhook] Error:', err);
    return res.status(200).json({ received: true, error: err.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
};
