import { OAuth2Client } from "google-auth-library";
import { config } from "../config/env.js";

// Initialize OAuth2Client with Client ID and Client Secret (kept securely on the backend)
const client = new OAuth2Client(
  config.googleClientId,
  config.googleClientSecret
);

export async function verifyGoogleToken(idToken) {
  if (!idToken) {
    throw new Error("Missing Google ID Token");
  }

  // Verify ID Token with Google's official library
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: config.googleClientId ? config.googleClientId : undefined,
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid Google token payload");
  }

  // Validate issuer (accounts.google.com or https://accounts.google.com)
  const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
  if (!validIssuers.includes(payload.iss)) {
    throw new Error("Invalid token issuer");
  }

  return {
    googleSub: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified,
    name: payload.name || payload.email?.split("@")[0] || "User",
    picture: payload.picture || null,
  };
}
