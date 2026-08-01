# Frontend Specification (ContextZero)

## Core Goal
Provide a product-led SaaS interface for **ContextZero** consisting of:
1. A public, high-converting product-focused landing page at `/` featuring an interactive live prompt compressor as the main attraction.
2. A secure Google Identity Services login page at `/login`.
3. A ChatGPT-inspired AI workspace at `/app` where ContextZero algorithmically optimizes prompt context in real-time before LLM execution.

---

## 🌐 Public SaaS Landing Page Flow (`/`)

```text
1. NAVBAR
   ContextZero Logo | Product | How It Works | Results | Sign In

2. HERO SECTION
   Headline: "Less context. Same intent."
   Subheading: "ContextZero removes redundant tokens from your prompts while preserving the information that matters."
   Buttons: [ Try It Now → ] (#compressor) | [ How It Works ↓ ] (#how-it-works)

3. LIVE PROMPT COMPRESSOR (MAIN ATTRACTION)
   ┌─────────────────────────────┐  ┌─────────────────────────────┐
   │ ORIGINAL PROMPT             │  │ OPTIMIZED PROMPT            │
   │ 184 tokens                  │  │ 109 tokens                  │
   └─────────────────────────────┘  └─────────────────────────────┘
                ↓
        75 TOKENS REMOVED • 40.8% REDUCTION

4. WHAT CONTEXTZERO DOES
   - Remove Redundancy
   - Preserve Intent
   - Measure Reduction

5. HOW IT WORKS
   01 YOUR PROMPT → 02 CONTEXTZERO → 03 OPTIMIZED PROMPT → 04 YOUR LLM

6. REAL BEFORE VS AFTER RESULTS
   - CODING PROMPT: 421 → 253 tokens (39.9% reduction)
   - RESEARCH PROMPT: 612 → 391 tokens (36.1% reduction)
   - LOG ANALYSIS: 1,240 → 340 tokens (72.6% reduction)

7. YOUR RESULT (LIVE STATISTICS TABLE)
   - Original Tokens | Optimized Tokens | Tokens Removed | Reduction % | Characters Removed

8. WHAT GETS REMOVED VS PRESERVED
   - Sentence transformation visualizer + Removed vs Preserved checklist

9. WHY TOKEN REDUCTION MATTERS
   - Visual flow: MORE TOKENS → CONTEXTZERO → FEWER TOKENS

10. FINAL CTA & FOOTER
    "How much of your prompt do you actually need?"
    [ Try ContextZero → ]
    Footer: ContextZero | Product | How It Works | Sign In | © 2026 ContextZero
```

---

## 🔒 Authentication Flow (`/login`)
- Google Identity Services (GIS) button with minimum identity scope requested (`openid, email, profile`).
- Renders `google.accounts.id.renderButton` inside a ContextZero dark neutral card.

---

## 💬 App Workspace (`/app/*`)
- **Left Sidebar**: `ContextZero` logo, `+ New compression` button, `Recent` conversation history, `Benchmarks Suite` nav link, user profile pill (avatar, name, email) & Logout button.
- **Top Header Bar**: Target Model Selector (`GPT-4o`, `Claude 3.5 Sonnet`, `Llama 3 70B`), Mode segmented control (`Conservative`, `Balanced`, `Aggressive`), `Target 70%` badge.
- **Chat Canvas**: User message bubble with payload token badge, Claude-style AI thinking animation (`✦ Optimizing context & thinking...`), Assistant response, and **Compression Result Card** (`1240 Before`, `340 After`, `72.6% Saved`, `98.2% Retention`).
- **Compression Inspector Drawer**: 460px right drawer with tabs for `Prompt Diff`, `Protected Info`, and `Pipeline Stages`.
