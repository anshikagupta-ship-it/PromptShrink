# Database Schema Specification (SQLite & Supabase PostgreSQL)

ContextZero supports both a lightweight local SQLite database (`backend/data/contextzero.db`) and a production Supabase PostgreSQL cloud database.

---

## 🐘 Supabase PostgreSQL Schema

### 1. `conversations` Table
Stores user compression conversation threads:

| Field | Type | Description |
|---|---|---|
| `id` | `UUID` (PK) | Unique conversation ID |
| `user_id` | `UUID` (FK -> `auth.users.id`) | Owner user reference |
| `title` | `TEXT` | Conversation title |
| `model` | `TEXT` | Target model (`'cO-1.0'`, `'cO-1.0 Pro'`, `'cO-1.0 Flash'`) |
| `target_ratio` | `INTEGER` | Compression target ratio percentage (`50`, `70`, `85`) |
| `created_at` | `TIMESTAMPTZ` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | Last updated timestamp |

### 2. `messages` Table
Stores individual prompt inputs and compressed assistant outputs:

| Field | Type | Description |
|---|---|---|
| `id` | `UUID` (PK) | Unique message ID |
| `conversation_id` | `UUID` (FK -> `conversations.id`) | Conversation parent reference |
| `sender` | `TEXT` | `'user'` or `'assistant'` |
| `content` | `TEXT` | Raw prompt or response payload |
| `original_tokens` | `INTEGER` | Input token count |
| `compressed_tokens` | `INTEGER` | Optimized token count |
| `reduction_ratio` | `NUMERIC(5,2)` | Reduction percentage |
| `created_at` | `TIMESTAMPTZ` | Message timestamp |

---

## 🗄️ Local SQLite Schema (`contextzero.db`)

### 1. `users` Table
```sql
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    google_sub TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `sessions` Table
```sql
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
