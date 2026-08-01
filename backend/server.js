import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";
import compressRoutes from "./routes/compressRoutes.js";

const app = express();

// Middleware: CORS with credentialed cookie support
app.use(
  cors({
    origin: [config.frontendUrl, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/v1", compressRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", service: "ContextZero Backend API", env: config.nodeEnv });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start Server
app.listen(config.port, () => {
  console.log(`ContextZero Backend running on port ${config.port} (${config.nodeEnv})`);
  console.log(`Accepting credentials from ${config.frontendUrl}`);
});
