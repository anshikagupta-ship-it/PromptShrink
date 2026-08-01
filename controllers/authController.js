import { verifyGoogleToken } from "../auth/googleVerifier.js";
import { UserModel } from "../models/userModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { config } from "../config/env.js";

export const AuthController = {
  async googleAuth(req, res) {
    try {
      const { credential } = req.body;
      if (!credential) {
        return res.status(400).json({ error: "Missing Google authentication credential token." });
      }

      // Step 1: Verify token server-side with official Google library
      const googleUser = await verifyGoogleToken(credential);

      // Step 2: Find or create user by unique googleSub
      let user = await UserModel.findUserByGoogleSub(googleUser.googleSub);

      if (!user) {
        user = await UserModel.createUser({
          googleSub: googleUser.googleSub,
          email: googleUser.email,
          name: googleUser.name,
          avatarUrl: googleUser.picture,
        });
      }

      // Step 3: Create server-managed application session
      const session = await SessionModel.createSession(user.id, 7);

      // Step 4: Set secure cross-site HttpOnly cookie
      const isProd = process.env.NODE_ENV === "production" || config.isProduction;

      res.cookie("contextzero_session", session.id, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Step 5: Return safe user object
      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
    } catch (error) {
      console.error("Google Auth Controller Error:", error);
      return res.status(401).json({
        error: "Google authentication failed.",
        details: error.message,
      });
    }
  },

  async getMe(req, res) {
    try {
      const sessionId = req.cookies?.contextzero_session;
      if (!sessionId) {
        return res.status(401).json({ user: null, authenticated: false });
      }

      const session = await SessionModel.findSessionById(sessionId);
      if (!session) {
        const isProd = process.env.NODE_ENV === "production" || config.isProduction;
        res.clearCookie("contextzero_session", {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
          path: "/",
        });
        return res.status(401).json({ user: null, authenticated: false });
      }

      const user = await UserModel.findUserById(session.userId);
      if (!user) {
        const isProd = process.env.NODE_ENV === "production" || config.isProduction;
        res.clearCookie("contextzero_session", {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
          path: "/",
        });
        return res.status(401).json({ user: null, authenticated: false });
      }

      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
        authenticated: true,
      });
    } catch (error) {
      console.error("GetMe Auth Controller Error:", error);
      return res.status(500).json({ error: "Internal session check error." });
    }
  },

  async logout(req, res) {
    try {
      const sessionId = req.cookies?.contextzero_session;
      if (sessionId) {
        await SessionModel.deleteSession(sessionId);
      }

      const isProd = process.env.NODE_ENV === "production" || config.isProduction;

      res.clearCookie("contextzero_session", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
      });

      return res.json({ success: true, message: "Logged out successfully." });
    } catch (error) {
      console.error("Logout Auth Controller Error:", error);
      return res.status(500).json({ error: "Failed to log out." });
    }
  },
};
