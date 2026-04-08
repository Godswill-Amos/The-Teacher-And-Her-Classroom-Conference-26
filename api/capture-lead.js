export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { name, email, phone, gateway, price, status, timestamp, source, reference } = req.body;
    
    // Log the lead data
    console.log('Lead captured:', { name, email, phone, gateway, price, status, timestamp, reference });

    // --- TODO: Fluent CRM Integration ---
    // The buyer will add their WordPress credentials and Fluent CRM API endpoint here.
    // 
    // Example Integration:
    /*
    const fluentCrmEndpoint = 'https://yourdomain.com/wp-json/fluent-crm/v2/contacts';
    const authHeader = 'Basic ' + Buffer.from('username:application_password').toString('base64');
    
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    await fetch(fluentCrmEndpoint, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        tags: [status === 'paid' ? 'Conference 2026 Paid' : 'Checkout Started'],
        lists: ['Conference 2026'],
        status: 'subscribed'
      })
    });
    */

    return res.status(200).json({ success: true, message: 'Lead captured successfully' });
  } catch (error) {
    console.error('Error capturing lead:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
