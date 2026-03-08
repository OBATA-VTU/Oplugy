import express from "express";
import cors from "cors";
import path from "path";
import * as admin from "firebase-admin";
import axios from "axios";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 3000;

console.log("[Server] Starting Oplug API Gateway...");
console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`[Server] Vercel Environment: ${process.env.VERCEL ? "Yes" : "No"}`);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   FIREBASE INITIALIZATION
========================= */

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
    });
  } else {
    admin.initializeApp();
  }
}

const db = admin.firestore();

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  const envStatus = {
    FIREBASE_SERVICE_ACCOUNT: !!process.env.FIREBASE_SERVICE_ACCOUNT,
    INLOMAX_API_KEY: !!process.env.INLOMAX_API_KEY,
    OGAVIRAL_API_KEY: !!process.env.OGAVIRAL_API_KEY,
    PAYSTACK_SECRET_KEY: !!process.env.PAYSTACK_SECRET_KEY,
    BILLSTACK_SECRET_KEY: !!process.env.BILLSTACK_SECRET_KEY,
  };

  const allSet = Object.values(envStatus).every((v) => v === true);

  res.json({
    status: allSet ? "ok" : "configuration_required",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    config: envStatus,
  });
});

/* =========================
   INLOMAX API CALL
========================= */

async function callServer1(endpoint: string, method: string, data: any) {
  const apiKey = process.env.INLOMAX_API_KEY;

  if (!apiKey) {
    throw new Error("Inlomax API key not configured.");
  }

  const url = `https://inlomax.com/api/${endpoint.replace(/^\//, "")}`;

  const headers: any = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Token ${apiKey}`,
  };

  const response = await axios({
    url,
    method: method.toUpperCase(),
    headers,
    params: method === "GET" ? data : undefined,
    data: method !== "GET" ? data : undefined,
  });

  return response.data;
}

/* =========================
   OGAVIRAL API
========================= */

async function callOgaviral(action: string, data: any = {}) {
  const apiKey = process.env.OGAVIRAL_API_KEY;

  const params = new URLSearchParams();
  params.append("key", apiKey || "");
  params.append("action", action);

  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) {
      params.append(k, String(v));
    }
  });

  const response = await axios.post(
    "https://ogaviral.com/api/v2",
    params,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return response.data;
}

/* =========================
   AUTH
========================= */

app.post("/api/auth/login", async (req, res) => {
  const { email } = req.body;

  const snapshot = await db
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  const doc = snapshot.docs[0];

  res.json({
    status: true,
    data: { id: doc.id, ...doc.data() },
  });
});

app.post("/api/auth/signup", async (req, res) => {
  const data = req.body;

  const exists = await db
    .collection("users")
    .where("email", "==", data.email)
    .limit(1)
    .get();

  if (!exists.empty) {
    return res.status(400).json({
      status: false,
      message: "User already exists",
    });
  }

  const newUser = {
    ...data,
    walletBalance: 0,
    role: "User",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const ref = await db.collection("users").add(newUser);

  res.json({
    status: true,
    data: { id: ref.id, ...newUser },
  });
});

/* =========================
   VTU PURCHASE
========================= */

app.post("/api/vtu/purchase", async (req, res) => {
  const { userId, service, details } = req.body;

  if (!userId || !service || !details) {
    return res.status(400).json({
      status: false,
      message: "Missing parameters",
    });
  }

  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    const user = userDoc.data();

    if (!user || user.walletBalance < details.amount) {
      return res.status(400).json({
        status: false,
        message: "Insufficient balance",
      });
    }

    const result = await callServer1(service, "POST", details.payload);

    if (result.status === "success" || result.status === true) {
      await userRef.update({
        walletBalance: admin.firestore.FieldValue.increment(
          -details.amount
        ),
      });

      await db.collection("transactions").add({
        userId,
        amount: details.amount,
        type: service,
        status: "SUCCESS",
        date_created: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.json({
        status: true,
        message: "Success",
      });
    }

    res.status(400).json({
      status: false,
      message: result.message || "Transaction failed",
    });
  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
});

/* =========================
   GENERAL PROXY
========================= */

app.all("/api/proxy", async (req, res) => {
  const payload = req.method === "POST" ? req.body : req.query;
  const { endpoint, method = "GET", data, server = "1" } = payload;

  try {
    let result;

    if (server === "1") {
      result = await callServer1(endpoint, method, data);
    }

    if (server === "smm") {
      result = await callOgaviral(endpoint || "services", data);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
});

/* =========================
   PAYSTACK WEBHOOK
========================= */

app.post("/api/paystack-webhook", async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return res.status(500).json({ message: "Secret missing" });
    }

    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const data = event.data;

      const amount = data.amount / 100;
      const email = data.customer.email;

      const snapshot = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const userRef = snapshot.docs[0].ref;

        await userRef.update({
          walletBalance:
            admin.firestore.FieldValue.increment(amount),
        });
      }
    }

    res.json({ status: "received" });
  } catch (err) {
    console.error("Webhook error", err);
    res.status(500).json({ status: "error" });
  }
});

/* =========================
   BILLSTACK WEBHOOK
========================= */

app.post("/api/billstack-webhook", async (req, res) => {
  res.json({ status: "received" });
});

/* =========================
   SPA ROUTING
========================= */

if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(process.cwd(), "build");

  app.use(express.static(buildPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    res.sendFile(path.join(buildPath, "index.html"));
  });
}

/* =========================
   SERVER START
========================= */

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;