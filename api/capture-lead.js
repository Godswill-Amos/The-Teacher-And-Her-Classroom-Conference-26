export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') return res.status(405).end();

  const {
    name,
    email,
    phone,
    status,
    gateway,
    price,
    reference
  } = req.body;

  // Split full name into first and last
  const nameParts = (name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Assign tags based on payment status
  const tags = status === 'paid'
    ? ['Paid - Conference 2026', price <= 7000 ? 'Early Bird' : 'Standard Price']
    : ['Checkout Started'];

  const contactPayload = {
    email,
    first_name: firstName,
    last_name: lastName,
    phone,
    tags,
    lists: ['Conference 2026'],
    custom_values: {
      payment_gateway: gateway || 'flutterwave',
      amount_paid: price ? `₦${price.toLocaleString()}` : '',
      payment_reference: reference || '',
      checkout_status: status || 'started'
    }
  };

  try {
    const wpUser = process.env.WP_USERNAME;
    const wpPass = process.env.WP_APP_PASSWORD;
    const wpUrl = process.env.WP_URL;

    // Encode credentials for Basic Auth
    const credentials = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

    const response = await fetch(
      `${wpUrl}/wp-json/fluent-crm/v2/contacts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(contactPayload)
      }
    );

    const result = await response.json();

    // Log for debugging in Vercel logs
    console.log('Fluent CRM response:', result);

    res.status(200).json({ success: true, data: result });

  } catch (error) {
    // Log the error but always return 200
    // so the payment flow is never blocked
    console.error('Capture lead error:', error.message);
    res.status(200).json({ success: true });
  }
}
