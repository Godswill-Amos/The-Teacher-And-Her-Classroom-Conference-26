export default async function handler(req, res) {
  const { transaction_id } = req.query;
  if (!transaction_id) return res.status(400).json({ error: "Transaction ID is required" });

  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) {
    console.error("FLUTTERWAVE_SECRET_KEY is missing");
    return res.status(500).json({ error: "Payment verification not configured" });
  }

  try {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const result = await response.json();
    
    console.log(`[Verify] Flutterwave Response for ID ${transaction_id}:`, JSON.stringify(result, null, 2));

    if (result.status === "success" && result.data.status === "successful") {
      // SUCCESS: Fallback Manual Webhook Trigger
      // If the native Flutterwave webhook is failing, we trigger the automation manually here
      const webhookUrl = "https://www.theteacherandherclassroom.ng/wp-json/uap/v2/uap-17-18";
      
      console.log(`[Verify] Payment Successful. Triggering manual fallback webhook to Uncanny Automator...`);
      
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'charge.completed',
            data: result.data,
            verification_source: 'site_fallback'
          })
        });
        const webhookResult = await webhookResponse.text();
        console.log(`[Verify] Manual Webhook Trigger Result:`, webhookResult);
      } catch (webhookErr) {
        console.error(`[Verify] Manual Webhook Trigger Failed:`, webhookErr.message);
      }

      res.status(200).json({ status: "success", data: result.data });
    } else {
      console.warn(`[Verify] Transaction check failed. Status: ${result?.data?.status || 'unknown'}`);
      res.status(400).json({ status: "failed", message: `Transaction status: ${result?.data?.status || 'failed'}` });
    }
  } catch (error) {
    console.error("Flutterwave Verification Error:", error.message);
    res.status(500).json({ error: "Verification failed" });
  }
}
