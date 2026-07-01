import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse incoming request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Dynamic API Routes mapping to files under /api
  app.all("/api/config", async (req, res, next) => {
    try {
      const handler = (await import("./api/config.js")).default;
      await handler(req, res);
    } catch (err) {
      console.error('[server] Error in /api/config:', err);
      next(err);
    }
  });

  app.all("/api/create-contact", async (req, res, next) => {
    try {
      const handler = (await import("./api/create-contact.js")).default;
      await handler(req, res);
    } catch (err) {
      console.error('[server] Error in /api/create-contact:', err);
      next(err);
    }
  });

  app.all("/api/store-tx-ref", async (req, res, next) => {
    try {
      const handler = (await import("./api/store-tx-ref.js")).default;
      await handler(req, res);
    } catch (err) {
      console.error('[server] Error in /api/store-tx-ref:', err);
      next(err);
    }
  });

  app.all("/api/verify-flutterwave", async (req, res, next) => {
    try {
      const handler = (await import("./api/verify-flutterwave.js")).default;
      await handler(req, res);
    } catch (err) {
      console.error('[server] Error in /api/verify-flutterwave:', err);
      next(err);
    }
  });

  app.all("/api/verify-paystack", async (req, res, next) => {
    try {
      const handler = (await import("./api/verify-paystack.js")).default;
      await handler(req, res);
    } catch (err) {
      console.error('[server] Error in /api/verify-paystack:', err);
      next(err);
    }
  });

  app.all("/api/check-payment-status", async (req, res, next) => {
    try {
      const handler = (await import("./api/check-payment-status.js")).default;
      await handler(req, res);
    } catch (err) {
      console.error('[server] Error in /api/check-payment-status:', err);
      next(err);
    }
  });

  app.all("/api/flutterwave-webhook", async (req, res, next) => {
    try {
      const handler = (await import("./api/flutterwave-webhook.js")).default;
      await handler(req, res);
    } catch (err) {
      console.error('[server] Error in /api/flutterwave-webhook:', err);
      next(err);
    }
  });

  app.all("/api/paystack-webhook", async (req, res, next) => {
    try {
      const handler = (await import("./api/paystack-webhook.js")).default;
      await handler(req, res);
    } catch (err) {
      console.error('[server] Error in /api/paystack-webhook:', err);
      next(err);
    }
  });

  // Handle errors gracefully in APIs
  app.use("/api", (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({ error: err.message || "Internal Server Error" });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    console.log('[server] Starting in DEVELOPMENT mode using Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log('[server] Starting in PRODUCTION mode with compiled assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
