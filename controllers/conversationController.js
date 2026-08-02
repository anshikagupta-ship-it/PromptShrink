import { supabaseAdmin } from "../db/supabaseAdmin.js";
import { SessionModel } from "../models/sessionModel.js";

async function getAuthUserId(req) {
  const sessionId = req.cookies?.contextzero_session;
  if (!sessionId) return null;
  const session = await SessionModel.findSessionById(sessionId);
  return session ? session.userId : null;
}

export const ConversationController = {
  async getConversations(req, res) {
    try {
      const userId = await getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized. Log in required.", conversations: [] });
      }

      // 1. Fetch conversations belonging strictly to authenticated user
      const { data: convos, error: convoError } = await supabaseAdmin
        .from("conversations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (convoError) {
        console.error("[ConversationController] Fetch convos error:", convoError.message);
        return res.status(500).json({ error: convoError.message, conversations: [] });
      }

      if (!convos || convos.length === 0) {
        return res.json({ conversations: [] });
      }

      // 2. Fetch messages for these conversations
      const convoIds = convos.map((c) => c.id);
      const { data: msgs, error: msgsError } = await supabaseAdmin
        .from("messages")
        .select("*")
        .in("conversation_id", convoIds)
        .order("created_at", { ascending: true });

      if (msgsError) {
        console.error("[ConversationController] Fetch msgs error:", msgsError.message);
      }

      const messagesByConvo = (msgs || []).reduce((acc, m) => {
        if (!acc[m.conversation_id]) acc[m.conversation_id] = [];
        acc[m.conversation_id].push(m);
        return acc;
      }, {});

      const result = convos.map((c) => ({
        ...c,
        messages: messagesByConvo[c.id] || [],
      }));

      return res.json({ conversations: result });
    } catch (err) {
      console.error("[ConversationController] Exception:", err.message);
      return res.status(500).json({ error: err.message, conversations: [] });
    }
  },

  async saveConversation(req, res) {
    try {
      const userId = await getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized. Log in required." });
      }

      const { title, model = "cO-1.0", targetRatio = 70, promptText, result } = req.body;

      if (!promptText) {
        return res.status(400).json({ error: "Missing promptText." });
      }

      const newTitle = title || promptText.slice(0, 30) + "...";

      // 1. Create conversation record
      const { data: convo, error: convoError } = await supabaseAdmin
        .from("conversations")
        .insert([{
          user_id: userId,
          title: newTitle,
          model,
          target_ratio: targetRatio,
        }])
        .select()
        .single();

      if (convoError || !convo) {
        console.error("[ConversationController] Insert convo error:", convoError?.message);
        return res.status(500).json({ error: convoError?.message || "Failed to save conversation thread." });
      }

      // 2. Insert User Prompt & Assistant Response Messages
      const { error: msgError } = await supabaseAdmin.from("messages").insert([
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
        console.error("[ConversationController] Insert msgs error:", msgError.message);
      }

      return res.json({ conversation: convo });
    } catch (err) {
      console.error("[ConversationController] Save exception:", err.message);
      return res.status(500).json({ error: err.message });
    }
  },

  async deleteConversation(req, res) {
    try {
      const userId = await getAuthUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized. Log in required." });
      }

      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from("conversations")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        console.error("[ConversationController] Delete error:", error.message);
        return res.status(500).json({ error: error.message });
      }

      return res.json({ success: true, message: "Conversation deleted successfully." });
    } catch (err) {
      console.error("[ConversationController] Delete exception:", err.message);
      return res.status(500).json({ error: err.message });
    }
  },
};
