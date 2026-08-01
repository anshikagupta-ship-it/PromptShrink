# Compressor Analysis Phase (`extractor.rs`)

This document details the **analysis phase** of the ContextZero prompt compressor. 

---

## Architectural Overview

Compared to traditional compressors that repeatedly re-lex prompts, ContextZero only lexes **once** as its core architectural foundation. Tokens generated during the initial lexical pass are stored and reused throughout all subsequent feature extraction, scoring, smoothing, and parsing stages.

```text
                User Prompt
                     │
                     ▼
              Lexer::lex_all()
                     │
          (Produces Tokens once)
                     │
                     ▼
          Document::analyze()
                     │
        extract_line_features()
                     │
      code_score() / english_score()
                     │
             line_score()
                     │
          windowed_scores()
                     │
      State Machine (FSM Parser)
                     │
          Detect Code Blocks
                     │
              Document
      ┌───────────────────────────┐
      │ original text             │
      │ tokens                    │
      │ detected code blocks      │
      └───────────────────────────┘
                     │
                     ▼
         compressor.rs uses this
```

---

## Complete Step-by-Step Execution Flow

When `Document::analyze(input)` is invoked, the execution flow proceeds through 12 deterministic stages:

### Step 1: Lexical Pass (`Lexer::lex_all()`)
The input prompt is converted into structured lexical tokens once:

**Input:**
```rust
Can you help me?

fn add(a:i32,b:i32)->i32{
    a+b
}
```

**Output Tokens:**
```text
Word("Can"), Whitespace, Word("you"), Whitespace, Word("help"), Newline, Newline,
Word("fn"), Whitespace, Word("add"), Bracket("("), ...
```

Each token retains:
```rust
Token {
    kind: TokenKind,
    text: String,
    start: usize,
    end: usize,
    flags: TokenFlags,
}
```

---

### Step 2: Line Feature Extraction (`extract_line_features()`)
The system switches from token-by-token processing to line-by-line structural analysis.

### Step 3: Line Boundary Discovery
Determines byte ranges `(start, end)` for every line in the input:
```text
line_ranges = [(0, 14), (15, 28), (29, 41), (42, 43)]
```

### Step 4: LineFeatures Initialization
Every line receives a fresh `LineFeatures` struct with zeroed counters:
```rust
LineFeatures {
    is_blank: true,
    word_tokens: 0,
    symbol_tokens: 0,
    keyword_hits: 0,
    ...
}
```

### Step 5: Single-Pass Token Scanning Loop
A single loop `for tok in tokens` updates every line's statistics:
- **Whitespace**: First token determines line indentation depth (`indent_chars`).
- **Explicit Code**: Code block markers (````` `code` `````) set `is_explicit_code = true`.
- **Word Analysis**:
  - `LANG_KEYWORDS` hit -> `lang_keyword_hits++`
  - `DOC_WORDS` hit -> `doc_word_hits++`
  - `STOPWORDS` hit -> `stopword_hits++`
  - CamelCase / snake_case detection -> `camel_or_snake++`
  - Incremental streaming average calculation for word length (`avg += (new - avg) / count`).
- **Operators & Brackets**: `symbol_tokens++`.
- **Punctuation**: Question marks set `ends_with_question = true`.

---

### Step 6: Code Score Computation (`code_score()`)
Calculates Code likelihood from symbols, keywords, camelCase identifiers, indentation, and numeric literals:
$$\text{code\_score} = \text{symbols} + \text{keywords} + \text{camelCase} + \text{indentation} + \text{numbers}$$
*(Explicit code blocks automatically score 1.0)*.

---

### Step 7: English Score Computation (`english_score()`)
Calculates Natural Language likelihood from stopwords, documentation vocabulary, question marks, and average word lengths:
$$\text{english\_score} = \text{stopwords} + \text{doc\_words} + \text{question\_mark} + \text{avg\_word\_len}$$

---

### Step 8: Net Line Score Calculation (`line_score()`)
$$\text{line\_score} = \text{clamp}_0^1(\text{code\_score} - \text{english\_score})$$
- `0.0`: High probability of Natural English text.
- `1.0`: High probability of Programming Source Code.

---

### Step 9: Score Smoothing (`windowed_scores()`)
Applies windowed smoothing to remove isolated spikes (e.g. standalone `}` or blank lines within code blocks):
$$\text{smoothed\_score}_i = \frac{0.5 \cdot \text{score}_{i-1} + \text{score}_i + 0.5 \cdot \text{score}_{i+1}}{2}$$

---

### Step 10: Finite State Machine (FSM Parser)
Classifies continuous ranges using 4 states:
- `NaturalLanguage`
- `CandidateCode` (Requires 2 consecutive high lines above `ENTER_THRESHOLD = 0.55`)
- `Code`
- `CandidateEnglish` (Requires 2 consecutive low lines below `EXIT_THRESHOLD = 0.35`)

---

### Step 11: Context Association
Walks up to 3 non-blank lines preceding a code block to extract contextual headings or explanations (e.g., `"Implement DFS"` for `fn dfs(...)`).

---

### Step 12: Final Document Output
Returns the enriched `Document` containing original text, tokens, and detected code blocks directly to `compressor.rs` for optimization passes.

```text
Document {
    original: String,
    tokens: Vec<Token>,
    blocks: Vec<CodeBlock>,
}
```
