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

    if (result.status === "success" && result.data.status === "successful") {
      res.status(200).json({ status: "success", data: result.data });
    } else {
      res.status(400).json({ status: "failed", message: "Transaction not successful" });
    }
  } catch (error) {
    console.error("Flutterwave Verification Error:", error.message);
    res.status(500).json({ error: "Verification failed" });
  }
}
