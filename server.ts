import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log('--- Environment Diagnostic ---');
  console.log('VITE_FLUTTERWAVE_PUBLIC_KEY:', process.env.VITE_FLUTTERWAVE_PUBLIC_KEY ? 'Present' : 'Missing');
  console.log('FLUTTERWAVE_PUBLIC_KEY:', process.env.FLUTTERWAVE_PUBLIC_KEY ? 'Present' : 'Missing');
  console.log('FLUTTERWAVE_SECRET_KEY:', process.env.FLUTTERWAVE_SECRET_KEY ? 'Present' : 'Missing');
  console.log('WP_URL:', process.env.WP_URL ? 'Present' : 'Missing');
  console.log('------------------------------');

  app.use(cors());
  app.use(express.json());

  // Public Config for Frontend Fallback
  app.get("/api/public-config", (req, res) => {
    res.json({
      flutterwavePublicKey: process.env.VITE_FLUTTERWAVE_PUBLIC_KEY || process.env.FLUTTERWAVE_PUBLIC_KEY || null
    });
  });

  // --- API Routes ---

  // Lead Capture
  app.post("/api/capture-lead", async (req, res) => {
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

      if (!wpUser || !wpPass || !wpUrl) {
        console.log("WP credentials missing, skipping Fluent CRM sync");
        return res.json({ success: true, message: "WP credentials missing" });
      }

      // Clean WP URL and ensure it has a protocol
      let cleanWpUrl = wpUrl.trim().replace(/\/$/, "");
      if (!cleanWpUrl.startsWith('http')) {
        cleanWpUrl = `https://${cleanWpUrl}`;
      }

      // Encode credentials for Basic Auth
      const credentials = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

      const response = await axios.post(
        `${cleanWpUrl}/wp-json/fluent-crm/v2/contacts`,
        {
          ...contactPayload,
          status: 'subscribed' // Ensure contact is marked as subscribed
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`
          }
        }
      );

      console.log('Fluent CRM response:', response.data);
      res.status(200).json({ success: true, data: response.data });

    } catch (error: any) {
      const errorData = error.response?.data || error.message;
      console.error('Capture lead error:', typeof errorData === 'object' ? JSON.stringify(errorData, null, 2) : errorData);
      res.status(200).json({ success: true });
    }
  });

  // Flutterwave Verification
  app.get("/api/verify-flutterwave", async (req, res) => {
    const { transaction_id } = req.query;
    if (!transaction_id) return res.status(400).json({ error: "Transaction ID is required" });

    if (!process.env.FLUTTERWAVE_SECRET_KEY) {
      console.error("FLUTTERWAVE_SECRET_KEY is missing in environment variables");
      return res.status(500).json({ error: "Payment verification is not configured (Missing Secret Key)" });
    }

    try {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          },
        }
      );

      console.log(`[Verify] Flutterwave Response for ID ${transaction_id}:`, JSON.stringify(response.data, null, 2));

      if (response.data.status === "success" && response.data.data.status === "successful") {
        // SUCCESS: Trigger manual fallback webhook to Uncanny Automator
        const webhookUrl = "https://www.theteacherandherclassroom.ng/wp-json/uap/v2/uap-17-18";
        
        console.log(`[Verify] Payment Successful. Triggering manual fallback webhook to Uncanny Automator...`);
        
        try {
          const webhookResponse = await axios.post(webhookUrl, {
            event: 'charge.completed',
            status: 'successful',
            tx_ref: response.data.data.tx_ref,
            amount: String(response.data.data.amount),
            currency: response.data.data.currency,
            payment_type: response.data.data.payment_type,
            customer_email: response.data.data.customer?.email,
            customer_name: response.data.data.customer?.name,
            customer_phone: response.data.data.customer?.phone_number,
            verification_source: 'site_fallback'
          });
          console.log(`[Verify] Manual Webhook Trigger Response:`, webhookResponse.status, webhookResponse.data);
        } catch (webhookErr: any) {
          console.error(`[Verify] Manual Webhook Trigger Failed:`, webhookErr.response?.data || webhookErr.message);
        }

        res.json({ status: "success", data: response.data.data });
      } else {
        console.warn(`[Verify] Transaction check failed. Status: ${response.data?.data?.status || 'unknown'}`);
        res.status(400).json({ status: "failed", message: `Transaction status: ${response.data?.data?.status || 'failed'}` });
      }
    } catch (error: any) {
      console.error("Flutterwave Verification Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
