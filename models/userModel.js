import { supabaseAdmin } from "../db/supabaseAdmin.js";
import { cryptoNative } from "../utils/cryptoUtil.js";

export const UserModel = {
  async findUserByGoogleSub(googleSub) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("google_sub", googleSub)
      .maybeSingle();

    if (error) {
      console.error("[UserModel] findUserByGoogleSub error:", error.message);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      googleSub: data.google_sub,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async findUserById(id) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[UserModel] findUserById error:", error.message);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      googleSub: data.google_sub,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async createUser({ googleSub, email, name, avatarUrl }) {
    const id = cryptoNative.randomUUID();
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert([{ id, google_sub: googleSub, email, name, avatar_url: avatarUrl, created_at: now, updated_at: now }])
      .select()
      .single();

    if (error) {
      console.error("[UserModel] createUser error:", error.message);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      googleSub: data.google_sub,
      email: data.email,
      name: data.name,
      avatarUrl: data.avatar_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },
};
