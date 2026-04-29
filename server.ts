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

  const processedTransactions = new Set<string>();
  
  // Lead Storage for Webhook recovery (Local Memory Map)
  // In production, this should be a DB like Redis or Firestore
  const leadStorage = new Map<string, any>();

  // Lead Capture
  app.post("/api/capture-lead", async (req, res) => {
    const {
      name,
      email,
      phone,
      status,
      tx_ref
    } = req.body;

    console.log(`[Capture Lead] Received data for tx_ref: ${tx_ref || 'MISSING'}`);

    // Store mapped data by tx_ref if available
    if (tx_ref) {
      const leadData = {
        customer_email: email,
        customer_name: name,
        customer_phone: phone,
        captured_at: new Date().toISOString()
      };
      leadStorage.set(tx_ref, leadData);
      console.log(`[Capture Lead] Stored lead data for tx_ref ${tx_ref}:`, JSON.stringify(leadData, null, 2));
    }

    // Use Uncanny Automator webhook for Checkout Started
    const webhookUrl = process.env.UNCANNY_CHECKOUT_STARTED_WEBHOOK_URL;

    if (!webhookUrl) {
      console.log("[Capture Lead] UNCANNY_CHECKOUT_STARTED_WEBHOOK_URL missing, skipping.");
      return res.json({ success: true, message: "Webhook URL missing" });
    }

    const payload = {
      "event": "checkout.started",
      "status": status || "started",
      "customer_email": email,
      "customer_name": name,
      "customer_phone": phone
    };

    console.log(`[Capture Lead] Sending payload to Uncanny:`, JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log(`[Capture Lead] Uncanny Response Status:`, response.status);
      console.log(`[Capture Lead] Uncanny Response Body:`, JSON.stringify(response.data, null, 2));
      
      res.status(200).json({ success: true, data: response.data });
    } catch (error: any) {
      const errorData = error.response?.data || error.message;
      console.error('[Capture Lead] Uncanny Trigger Failed:', typeof errorData === 'object' ? JSON.stringify(errorData, null, 2) : errorData);
      // Still return 200 to not block the frontend
      res.status(200).json({ success: true, error: errorData });
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
        const verifiedData = response.data.data;
        const txRef = verifiedData.tx_ref;
        const transactionId = String(verifiedData.id);

        // SUCCESS: Trigger manual fallback webhook to Uncanny Automator if not already processed
        const webhookUrl = process.env.UNCANNY_AUTOMATOR_WEBHOOK_URL;
        
        if (webhookUrl && !processedTransactions.has(txRef) && !processedTransactions.has(transactionId)) {
          // Look up lead data from storage using tx_ref
          const storedLead = leadStorage.get(txRef) || {};
          console.log(`[Verify] Lead lookup for tx_ref ${txRef}:`, JSON.stringify(storedLead, null, 2));

          // Construct flattened payload strictly as requested, preferring stored values as primary source
          const flatPayload = {
            event: "charge.completed",
            status: verifiedData.status,
            tx_ref: txRef,
            amount: String(verifiedData.amount),
            currency: verifiedData.currency,
            payment_type: verifiedData.payment_type,
            customer_email: storedLead.customer_email || verifiedData.customer?.email,
            customer_name: storedLead.customer_name || verifiedData.customer?.name,
            customer_phone: storedLead.customer_phone || verifiedData.customer?.phone_number
          };

          console.log(`[Verify] Transaction ${txRef} verified successfully.`);
          console.log(`[Verify] Final payload sent to Uncanny:`, JSON.stringify(flatPayload, null, 2));
          
          try {
            const webhookResponse = await axios.post(webhookUrl, flatPayload, {
              headers: { 'Content-Type': 'application/json' }
            });
            console.log(`[Verify] Uncanny Response Status:`, webhookResponse.status);
            console.log(`[Verify] Uncanny Response Body:`, JSON.stringify(webhookResponse.data, null, 2));
            
            // Mark as processed
            processedTransactions.add(txRef);
            processedTransactions.add(transactionId);
          } catch (webhookErr: any) {
            console.error(`[Verify] Uncanny Webhook Trigger Failed:`, webhookErr.response?.data || webhookErr.message);
          }
        } else {
          console.log(`[Verify] Skipping Uncanny forward (already processed or webhook URL missing): ${txRef}`);
        }

        res.json({ status: "success", data: verifiedData });
      } else {
        console.warn(`[Verify] Transaction check failed. Status: ${response.data?.data?.status || 'unknown'}`);
        res.status(400).json({ status: "failed", message: `Transaction status: ${response.data?.data?.status || 'failed'}` });
      }
    } catch (error: any) {
      console.error("Flutterwave Verification Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Verification failed" });
    }
  });

  // Flutterwave Webhook
  app.post("/api/flutterwave-webhook", async (req, res) => {
    const body = req.body;
    
    // Verify it is a real Flutterwave webhook (Hash Check)
    const hash = req.headers['verif-hash'];
    if (hash && process.env.FLUTTERWAVE_WEBHOOK_HASH && hash !== process.env.FLUTTERWAVE_WEBHOOK_HASH) {
      console.warn(`[Webhook] Invalid hash received: ${hash}`);
      return res.status(401).send("Invalid Hash");
    }

    console.log(`[Webhook] Incoming webhook for tx_ref: ${body.data?.tx_ref}`);

    // Only process successful payments
    if (body?.data?.status !== 'successful') {
      return res.status(200).json({ received: true });
    }

    const txRef = body.data.tx_ref;
    const transactionId = String(body.data.id);

    if (txRef && !processedTransactions.has(txRef)) {
      // Look up lead data
      const storedLead = leadStorage.get(txRef) || {};
      console.log(`[Webhook] Lead lookup result for tx_ref ${txRef}:`, JSON.stringify(storedLead, null, 2));

      // Build payload with priority logic
      const flatPayload = {
        event: body.event || "charge.completed",
        status: body.data.status,
        tx_ref: txRef,
        amount: String(body.data.amount),
        currency: body.data.currency,
        payment_type: body.data.payment_type,
        customer_email: storedLead.customer_email || body.data.customer?.email,
        customer_name: storedLead.customer_name || body.data.customer?.name,
        customer_phone: storedLead.customer_phone || body.data.customer?.phone_number
      };

      console.log(`[Webhook] Final payload sent to Uncanny:`, JSON.stringify(flatPayload, null, 2));

      // Forward to Uncanny
      const webhookUrl = process.env.UNCANNY_AUTOMATOR_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await axios.post(webhookUrl, flatPayload);
          processedTransactions.add(txRef);
          if (transactionId) processedTransactions.add(transactionId);
        } catch (e: any) {
          console.error('[Webhook] Forwarding to Uncanny failed:', e.message);
        }
      }
    }

    res.status(200).json({ received: true });
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
