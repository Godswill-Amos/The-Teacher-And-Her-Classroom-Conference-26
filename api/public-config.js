export default function handler(req, res) {
  res.status(200).json({
    flutterwavePublicKey: process.env.VITE_FLUTTERWAVE_PUBLIC_KEY || process.env.FLUTTERWAVE_PUBLIC_KEY || null
  });
}
