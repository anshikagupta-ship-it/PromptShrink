import { Router } from "express";
import { ConversationController } from "../controllers/conversationController.js";

const router = Router();

// GET /api/conversations - List all conversations for authenticated user
router.get("/", ConversationController.getConversations);

// POST /api/conversations - Create new conversation thread & messages
router.post("/", ConversationController.saveConversation);

// DELETE /api/conversations/:id - Delete conversation thread for authenticated user
router.delete("/:id", ConversationController.deleteConversation);

export default router;
