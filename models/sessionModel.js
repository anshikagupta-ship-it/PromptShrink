import { supabaseAdmin } from "../db/supabaseAdmin.js";
import { cryptoNative } from "../utils/cryptoUtil.js";

export const SessionModel = {
  async createSession(userId, durationDays = 7) {
    const sessionId = cryptoNative.randomSessionToken();
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("sessions")
      .insert([{ id: sessionId, user_id: userId, expires_at: expiresAt, created_at: createdAt }])
      .select()
      .single();

    if (error) {
      console.error("[SessionModel] createSession error:", error.message);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      userId: data.user_id,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    };
  },

  async findSessionById(sessionId) {
    const { data, error } = await supabaseAdmin
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle();

    if (error) {
      console.error("[SessionModel] findSessionById error:", error.message);
      return null;
    }
    if (!data) return null;

    // Check if session has expired
    if (new Date(data.expires_at) < new Date()) {
      await this.deleteSession(sessionId);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    };
  },

  async deleteSession(sessionId) {
    const { error } = await supabaseAdmin
      .from("sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      console.error("[SessionModel] deleteSession error:", error.message);
    }
    return true;
  },
};
