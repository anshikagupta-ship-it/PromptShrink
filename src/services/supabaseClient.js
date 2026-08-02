import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-supabase.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch all user conversations along with their messages from Supabase PostgreSQL DB
 */
export async function getUserConversations(userId) {
  if (!userId) {
    console.warn("[Supabase] getUserConversations called without userId, returning empty array.");
    return [];
  }
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*, messages(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Supabase] Fetch conversations notice:", error.message);
      // Fallback: try fetching conversations alone without relational join
      let fallbackQuery = supabase
        .from("conversations")
        .select("*")
        .order("created_at", { ascending: false });

      if (userId) {
        fallbackQuery = fallbackQuery.eq("user_id", userId);
      }

      const { data: simpleConvos, error: simpleError } = await fallbackQuery;

      if (simpleError) {
        console.warn("[Supabase] Fallback fetch conversations notice:", simpleError.message);
        return [];
      }
      return simpleConvos || [];
    }
    return data || [];
  } catch (err) {
    console.warn("[Supabase] Connection exception:", err.message);
    return [];
  }
}

/**
 * Fetch messages for a specific conversation ID
 */
export async function getConversationMessages(conversationId) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("[Supabase] Fetch messages notice:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("[Supabase] Fetch messages exception:", err.message);
    return [];
  }
}

/**
 * Save new conversation thread & messages to Supabase DB
 */
export async function saveConversationThread({
  userId,
  title,
  model = "cO-1.0",
  targetRatio = 70,
  promptText,
  result,
}) {
  if (!userId) {
    console.warn("[Supabase] saveConversationThread skipped: No userId provided.");
    return null;
  }
  try {
    const convoPayload = {
      title: title || promptText.slice(0, 30) + "...",
      model,
      target_ratio: targetRatio,
      user_id: userId,
    };

    // 1. Create conversation record
    const { data: convo, error: convoError } = await supabase
      .from("conversations")
      .insert([convoPayload])
      .select()
      .single();

    if (convoError || !convo) {
      console.error("[Supabase Error] Conversation insert failed:", convoError?.message || convoError);
      return null;
    }

    console.log("[Supabase] Successfully saved conversation thread:", convo.id);

    // 2. Insert User Prompt & Assistant Response Messages
    const { error: msgError } = await supabase.from("messages").insert([
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

    if (msgError) {
      console.error("[Supabase Error] Messages insert failed:", msgError.message);
    } else {
      console.log("[Supabase] Successfully saved conversation messages for:", convo.id);
    }

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

    const { error: msgError } = await supabase.from("messages").insert([
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

    if (msgError) {
      console.error("[Supabase Error] Append messages failed:", msgError.message);
    }

    // Touch updated_at timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  } catch (err) {
    console.error("[Supabase Exception] Append messages failed:", err.message);
  }
}

/**
 * Rename a conversation in Supabase DB
 */
export async function renameConversationDb(conversationId, newTitle) {
  try {
    if (!conversationId || conversationId.startsWith("hist-")) return;
    const { error } = await supabase
      .from("conversations")
      .update({ title: newTitle, updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (error) console.warn("[Supabase] Rename notice:", error.message);
  } catch (err) {
    console.warn("[Supabase] Rename exception:", err.message);
  }
}

/**
 * Delete a conversation in Supabase DB
 */
export async function deleteConversationDb(conversationId) {
  try {
    if (!conversationId || conversationId.startsWith("hist-")) return;
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) console.warn("[Supabase] Delete notice:", error.message);
  } catch (err) {
    console.warn("[Supabase] Delete exception:", err.message);
  }
}
