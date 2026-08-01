import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  sessionSecret: process.env.SESSION_SECRET || "default_session_secret_change_in_prod",
  isProduction: process.env.NODE_ENV === "production",
};
