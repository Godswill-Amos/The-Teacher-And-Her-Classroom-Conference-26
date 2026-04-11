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

  app.use(cors());
  app.use(express.json());

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

      // Encode credentials for Basic Auth
      const credentials = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

      const response = await axios.post(
        `${wpUrl}/wp-json/fluent-crm/v2/contacts`,
        contactPayload,
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
      console.error('Capture lead error:', error.response?.data || error.message);
      res.status(200).json({ success: true });
    }
  });

  // Flutterwave Verification
  app.get("/api/verify-flutterwave", async (req, res) => {
    const { transaction_id } = req.query;
    if (!transaction_id) return res.status(400).json({ error: "Transaction ID is required" });

    try {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          },
        }
      );

      if (response.data.status === "success" && response.data.data.status === "successful") {
        // Here you would typically save the registration to your database
        res.json({ status: "success", data: response.data.data });
      } else {
        res.status(400).json({ status: "failed", message: "Transaction not successful" });
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
