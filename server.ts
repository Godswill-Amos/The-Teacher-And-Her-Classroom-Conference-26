import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import * as admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Firebase Admin safely
  let firestore: any = null;
  try {
    const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(firebaseConfigPath)) {
      const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
      
      // Check if already initialized to avoid "app already exists" error
      let firebaseApp;
      if (admin.apps.length === 0) {
        firebaseApp = admin.initializeApp({
          projectId: firebaseConfig.projectId,
        });
      } else {
        firebaseApp = admin.app();
      }
      
      // Connect to Firestore (with named database support if present)
      const dbId = firebaseConfig.firestoreDatabaseId;
      if (dbId) {
        firestore = getFirestore(firebaseApp, dbId);
        console.log(`[Firebase] Initialized with database: ${dbId}`);
      } else {
        firestore = getFirestore(firebaseApp);
        console.log("[Firebase] Initialized with default database");
      }
    } else {
      console.warn("[Firebase] Config not found. Persistence will be disabled.");
    }
  } catch (err: any) {
    console.error("[Firebase] Initialization error:", err.message);
    // Continue without firestore
  }

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

  // Helper to mark a transaction as processed
  const markAsProcessed = async (ref: string) => {
    if (!firestore) return;
    try {
      await firestore.collection("processed_transactions").doc(ref).set({
        processed_at: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (e: any) {
      console.error(`[Firestore] Failed to mark ${ref} as processed:`, e.message);
    }
  };

  // Helper to check if a transaction was processed
  const isProcessed = async (ref: string) => {
    if (!firestore) return false;
    try {
      const doc = await firestore.collection("processed_transactions").doc(ref).get();
      return doc.exists;
    } catch (e: any) {
      console.error(`[Firestore] Failed to check if ${ref} is processed:`, e.message);
      return false;
    }
  };

  // Helper to store lead data in Firestore
  const saveLead = async (tx_ref: string, data: any) => {
    if (!firestore) {
      console.error("[Firestore] Cannot save lead: Firestore not initialized.");
      return;
    }
    try {
      await firestore.collection("leads").doc(tx_ref).set({
        ...data,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e: any) {
      console.error(`[Firestore] Failed to save lead for tx_ref ${tx_ref}:`, e.message);
    }
  };

  // Helper to get lead data from Firestore
  const getLead = async (tx_ref: string) => {
    if (!firestore) return null;
    try {
      const doc = await firestore.collection("leads").doc(tx_ref).get();
      return doc.exists ? doc.data() : null;
    } catch (e: any) {
      console.error(`[Firestore] Failed to get lead for tx_ref ${tx_ref}:`, e.message);
      return null;
    }
  };

  // Lead Capture
  app.post("/api/capture-lead", async (req, res) => {
    const {
      name,
      email,
      phone,
      status,
      tx_ref,
      transaction_id
    } = req.body;

    console.log(`[Capture Lead] Received data for tx_ref: ${tx_ref || 'MISSING'}, id: ${transaction_id || 'MISSING'}`);

    // Store mapped data by tx_ref if available
    if (tx_ref) {
      const leadData = {
        customer_email: email,
        customer_name: name,
        customer_phone: phone,
        transaction_id: transaction_id,
        status: status,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      };
      await saveLead(tx_ref, leadData);
      console.log(`[Firestore] Saved lead data for tx_ref: ${tx_ref}`);
    }

    // Use Uncanny Automator webhook for Checkout Started
    const webhookUrl = process.env.UNCANNY_CHECKOUT_STARTED_WEBHOOK_URL;

    if (!webhookUrl) {
      console.log("[Capture Lead] UNCANNY_CHECKOUT_STARTED_WEBHOOK_URL missing, skipping.");
      return res.json({ success: true, message: "Webhook URL missing" });
    }

    const payload = {
      "event": status === "paid" ? "charge.completed" : "checkout.started",
      "status": status || "started",
      "customer_email": email,
      "customer_name": name,
      "customer_phone": phone,
      "tx_ref": tx_ref,
      "transaction_id": transaction_id
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

        // Check if already processed
        const alreadyProcessedTxRef = await isProcessed(txRef);
        const alreadyProcessedId = await isProcessed(transactionId);
        
        // SUCCESS: Trigger manual fallback webhook to Uncanny Automator if not already processed
        const webhookUrl = process.env.UNCANNY_AUTOMATOR_WEBHOOK_URL;
        
        if (webhookUrl && !alreadyProcessedTxRef && !alreadyProcessedId) {
          // Try tx_ref first, then transaction_id
          const storedLead: any = await getLead(txRef) || await getLead(transactionId) || {};
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
            await markAsProcessed(txRef);
            await markAsProcessed(transactionId);
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

    const alreadyProcessed = await isProcessed(txRef);

    if (txRef && !alreadyProcessed) {
      // Try tx_ref first, then transaction_id
      let storedLead: any = await getLead(txRef) || await getLead(transactionId) || {};

      console.log('[Webhook] tx_ref:', txRef);
      console.log('[Webhook] storedLead:', JSON.stringify(storedLead));
      console.log('[Webhook] Flutterwave customer:', JSON.stringify(body.data.customer));

      // Build payload with priority logic
      const flatPayload = {
        event: body.event || 'charge.completed',
        status: body.data.status,
        tx_ref: txRef,
        transaction_id: transactionId,
        amount: String(body.data.amount),
        currency: body.data.currency,
        payment_type: body.data.payment_type,
        customer_email: storedLead.customer_email || body.data.customer?.email || '',
        customer_name: storedLead.customer_name || body.data.customer?.name || '',
        customer_phone: storedLead.customer_phone || body.data.customer?.phone_number || ''
      };

      console.log('[Webhook] Sending to Uncanny Automator:', JSON.stringify(flatPayload));

      // Forward to Uncanny
      const webhookUrl = process.env.UNCANNY_AUTOMATOR_WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await axios.post(webhookUrl, flatPayload);
          await markAsProcessed(txRef);
          if (transactionId) await markAsProcessed(transactionId);
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
