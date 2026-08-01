import { SessionModel } from "../models/sessionModel.js";
import { UserModel } from "../models/userModel.js";

export async function requireAuth(req, res, next) {
  try {
    const sessionId = req.cookies?.contextzero_session;

    if (!sessionId) {
      return res.status(401).json({ error: "Unauthorized. No authentication session found." });
    }

    const session = await SessionModel.findSessionById(sessionId);
    if (!session) {
      res.clearCookie("contextzero_session", { path: "/" });
      return res.status(401).json({ error: "Unauthorized. Session expired or invalid." });
    }

    const user = await UserModel.findUserById(session.userId);
    if (!user) {
      res.clearCookie("contextzero_session", { path: "/" });
      return res.status(401).json({ error: "Unauthorized. User account not found." });
    }

    req.user = user;
    req.sessionId = sessionId;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ error: "Internal authentication error." });
  }
}
