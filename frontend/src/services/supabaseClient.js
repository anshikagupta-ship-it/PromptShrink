import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-supabase.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Fetch all user conversations from Supabase PostgreSQL DB
 */
export async function getUserConversations(userId) {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch conversations error:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Supabase connection warning:", err.message);
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
      console.warn("Supabase fetch messages error:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Supabase fetch messages warning:", err.message);
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
  try {
    // 1. Create conversation record
    const { data: convo, error: convoError } = await supabase
      .from("conversations")
      .insert([
        {
          user_id: userId || null,
          title: title || promptText.slice(0, 30) + "...",
          model,
          target_ratio: targetRatio,
        },
      ])
      .select()
      .single();

    if (convoError || !convo) {
      console.warn("Supabase convo insert info:", convoError?.message);
      return null;
    }

    // 2. Insert User Prompt & Assistant Response Messages
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
        content: result?.generatedAnswer || result?.compressedPrompt || "",
        original_tokens: result?.originalTokens || 0,
        compressed_tokens: result?.compressedTokens || 0,
        reduction_ratio: result?.reductionRatio || 0,
      },
    ]);

    return convo;
  } catch (err) {
    console.warn("Supabase save thread warning:", err.message);
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
    if (!conversationId) return;

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
        content: result?.generatedAnswer || result?.compressedPrompt || "",
        original_tokens: result?.originalTokens || 0,
        compressed_tokens: result?.compressedTokens || 0,
        reduction_ratio: result?.reductionRatio || 0,
      },
    ]);

    // Touch updated_at timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  } catch (err) {
    console.warn("Supabase append messages error:", err.message);
  }
}

/**
 * Rename a conversation in Supabase DB
 */
export async function renameConversationDb(conversationId, newTitle) {
  try {
    const { error } = await supabase
      .from("conversations")
      .update({ title: newTitle, updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    if (error) console.warn("Supabase rename warning:", error.message);
  } catch (err) {
    console.warn("Supabase rename error:", err.message);
  }
}

/**
 * Delete a conversation in Supabase DB
 */
export async function deleteConversationDb(conversationId) {
  try {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) console.warn("Supabase delete warning:", error.message);
  } catch (err) {
    console.warn("Supabase delete error:", err.message);
  }
}
