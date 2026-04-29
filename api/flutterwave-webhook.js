export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const body = req.body;

  // Verify it is a real Flutterwave webhook
  const hash = req.headers['verif-hash'];
  if (hash !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
    return res.status(401).end();
  }

  // Only process successful payments
  if (body?.data?.status !== 'successful') {
    return res.status(200).json({ received: true });
  }

  // Flatten the nested Flutterwave data into simple keys, preferring meta values
  const flatPayload = {
    event: body.event,
    status: body.data.status,
    tx_ref: body.data.tx_ref,
    amount: String(body.data.amount),
    currency: body.data.currency,
    payment_type: body.data.payment_type,
    customer_email: body.data.meta?.customer_email || body.data.customer?.email,
    customer_name: body.data.meta?.customer_name || body.data.customer?.name,
    customer_phone: body.data.meta?.customer_phone || body.data.customer?.phone_number
  };

  console.log(`[Webhook] Incoming Meta:`, JSON.stringify(body.data.meta, null, 2));
  console.log(`[Webhook] Incoming Customer:`, JSON.stringify(body.data.customer, null, 2));
  console.log(`[Webhook] Forwarding Payload to Uncanny:`, JSON.stringify(flatPayload, null, 2));

  // Forward the flattened data to Uncanny Automator
  try {
    const automatorUrl = process.env.UNCANNY_AUTOMATOR_WEBHOOK_URL;
    await fetch(automatorUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flatPayload)
    });
  } catch (e) {
    console.error('Failed to forward to Uncanny Automator:', e);
  }

  res.status(200).json({ received: true });
}