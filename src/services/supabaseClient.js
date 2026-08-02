import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-supabase.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch all user conversations along with their messages
 * Tries authenticated Express API first (session cookie verified), falls back to direct Supabase client
 */
export async function getUserConversations(userId) {
  if (!userId) return [];

  // Step 1: Try authenticated Express backend endpoint
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.conversations)) {
        return data.conversations;
      }
    }
  } catch (backendErr) {
    console.warn("[API] Backend conversations fetch notice:", backendErr.message);
  }

  // Step 2: Direct Supabase client query with explicit user_id filter
  try {
    const { data: convos, error: convoError } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (convoError || !convos || convos.length === 0) {
      return [];
    }

    const convoIds = convos.map((c) => c.id);
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .in("conversation_id", convoIds)
      .order("created_at", { ascending: true });

    const messagesByConvo = (msgs || []).reduce((acc, m) => {
      if (!acc[m.conversation_id]) acc[m.conversation_id] = [];
      acc[m.conversation_id].push(m);
      return acc;
    }, {});

    return convos.map((c) => ({
      ...c,
      messages: messagesByConvo[c.id] || [],
    }));
  } catch (err) {
    console.warn("[Supabase] Connection exception:", err.message);
    return [];
  }
}

/**
 * Save new conversation thread & messages
 * Tries authenticated Express API first, falls back to direct Supabase client
 */
export async function saveConversationThread({
  userId,
  title,
  model = "cO-1.0",
  targetRatio = 70,
  promptText,
  result,
}) {
  if (!userId && !promptText) return null;

  // Step 1: Try authenticated Express backend endpoint
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title,
        model,
        targetRatio,
        promptText,
        result,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.conversation) {
        return data.conversation;
      }
    }
  } catch (backendErr) {
    console.warn("[API] Backend conversation save notice:", backendErr.message);
  }

  // Step 2: Direct Supabase client insert
  if (!userId) return null;

  try {
    const convoPayload = {
      title: title || promptText.slice(0, 30) + "...",
      model,
      target_ratio: targetRatio,
      user_id: userId,
    };

    const { data: convo, error: convoError } = await supabase
      .from("conversations")
      .insert([convoPayload])
      .select()
      .single();

    if (convoError || !convo) {
      console.error("[Supabase Error] Conversation insert failed:", convoError?.message);
      return null;
    }

    await supabase.from("messages").insert([
      {
        conversation_id: convo.id,
        sender: "user",
        content: promptText,
        original_tokens: result?.originalTokens || 0,
        compressed_tokens: 0,
        reduction_ratio: 0,
      },
      {
        conversation_id: convo.id,
        sender: "assistant",
        content: result?.compressedPrompt || result?.generatedAnswer || "",
        original_tokens: result?.originalTokens || 0,
        compressed_tokens: result?.compressedTokens || 0,
        reduction_ratio: result?.reductionRatio || 0,
      },
    ]);

    return convo;
  } catch (err) {
    console.error("[Supabase Exception] Save thread failed:", err.message);
    return null;
  }
}

/**
 * Append additional prompt & response turn to an existing conversation
 */
export async function appendMessagesToConversation({
  conversationId,
  promptText,
  result,
}) {
  try {
    if (!conversationId || conversationId.startsWith("hist-")) return;

    await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender: "user",
        content: promptText,
        original_tokens: result?.originalTokens || 0,
        compressed_tokens: 0,
        reduction_ratio: 0,
      },
      {
        conversation_id: conversationId,
        sender: "assistant",
        content: result?.compressedPrompt || result?.generatedAnswer || "",
        original_tokens: result?.originalTokens || 0,
        compressed_tokens: result?.compressedTokens || 0,
        reduction_ratio: result?.reductionRatio || 0,
      },
    ]);

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  } catch (err) {
    console.warn("[Supabase Exception] Append messages failed:", err.message);
  }
}

/**
 * Delete a conversation thread
 * Tries authenticated Express API first, falls back to direct Supabase client
 */
export async function deleteConversationDb(conversationId) {
  if (!conversationId || conversationId.startsWith("hist-")) return;

  // Step 1: Try authenticated Express backend endpoint
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) return;
  } catch (backendErr) {
    console.warn("[API] Backend delete notice:", backendErr.message);
  }

  // Step 2: Direct Supabase client delete
  try {
    await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);
  } catch (err) {
    console.warn("[Supabase] Delete exception:", err.message);
  }
}

/**
 * Fetch messages for a specific conversation ID
 */
export async function getConversationMessages(conversationId) {
  if (!conversationId || conversationId.startsWith("hist-")) return [];

  try {
    const { data: msgs, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error || !msgs) return [];
    return msgs;
  } catch (err) {
    console.warn("[Supabase] Fetch messages exception:", err.message);
    return [];
  }
}

/**
 * Rename a conversation thread title
 */
export async function renameConversationDb(conversationId, newTitle) {
  if (!conversationId || conversationId.startsWith("hist-")) return;

  try {
    await supabase
      .from("conversations")
      .update({ title: newTitle, updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  } catch (err) {
    console.warn("[Supabase] Rename conversation exception:", err.message);
  }
}
