import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import compressRoutes from "./routes/compressRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

const app = express();

// Robust CORS Configuration for Production Deployments (Render / Vercel)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, health probes)
      if (!origin) return callback(null, true);

      if (
        origin.includes("localhost") ||
        origin.includes("127.0.0.1") ||
        origin.includes("vercel.app") ||
        origin.includes("netlify.app") ||
        origin === config.frontendUrl
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Health check endpoint for Render deployment monitoring
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", service: "ContextZero Backend API", env: config.nodeEnv });
});

// Root route for Render deployment sanity check
app.get("/", (req, res) => {
  res.json({ message: "ContextZero Backend API Service Running Live" });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/v1", compressRoutes);
app.use("/api/conversations", conversationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

// Start Server listening on 0.0.0.0 for cloud hosting platforms (Render)
const port = process.env.PORT || config.port || 8000;
const host = "0.0.0.0";

app.listen(port, host, () => {
  console.log(`ContextZero Backend running on http://${host}:${port} (${config.nodeEnv})`);
  console.log(`Accepting credentials from ${config.frontendUrl}`);
});
