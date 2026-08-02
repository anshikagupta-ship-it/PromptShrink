-- ContextZero Supabase PostgreSQL Schema Definition

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    model TEXT NOT NULL DEFAULT 'cO-1.0',
    target_ratio INTEGER NOT NULL DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant')),
    content TEXT NOT NULL,
    original_tokens INTEGER DEFAULT 0,
    compressed_tokens INTEGER DEFAULT 0,
    reduction_ratio NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop previous strict policies if present
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;

-- Force all access to go through the backend API which validates user ownership.
-- We drop these public policies so anonymous users cannot access chat histories.
DROP POLICY IF EXISTS "Allow public select conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow public insert conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow public update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Allow public delete conversations" ON public.conversations;

DROP POLICY IF EXISTS "Allow public select messages" ON public.messages;
DROP POLICY IF EXISTS "Allow public insert messages" ON public.messages;
