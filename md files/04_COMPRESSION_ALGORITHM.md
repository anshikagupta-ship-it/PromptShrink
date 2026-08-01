# Compression Algorithm & Analysis Specification

## Objective
Minimize input tokens while preserving exact user intent, instructions, and critical constraints using a single-pass tokenization engine.

---

## 🏗️ Compiler-Inspired Architecture (`extractor.rs` Pipeline)

The system avoids repeatedly re-lexing or re-parsing the input document. The single-pass lexer produces tokens once, which are then passed downstream through feature extraction, line scoring, FSM state parsing, and segment optimization.

```text
Raw Prompt
    │
    ▼
Lexer (lex_all)
    │
    ▼
Tokens (Produced ONCE)
    │
    ▼
Feature Extraction (per line)
    │
    ▼
Line Scoring (code_score - english_score)
    │
    ▼
Score Smoothing (windowed_scores)
    │
    ▼
Finite State Machine (Natural → CandidateCode → Code → CandidateEnglish)
    │
    ▼
Detected Code Blocks
    │
    ▼
Document { original, tokens, blocks }
    │
    ▼
Compressor Optimization Passes
    │
    ▼
Compressed Prompt Output
```

---

## ⚡ Step-by-Step Execution Pipeline

### Stage 1: Single-Pass Lexical Analysis (`Lexer::lex_all()`)
The prompt is tokenized into word, whitespace, operator, bracket, and symbol tokens once.

### Stage 2: Line Feature Extraction (`extract_line_features()`)
Iterates over line ranges and extracts:
- Indentation (`indent_chars`)
- Explicit code flags (````` `code` `````)
- Keyword hits (`LANG_KEYWORDS`)
- Documentation words (`DOC_WORDS`)
- Stopwords (`STOPWORDS`)
- CamelCase / snake_case identifiers
- Streaming incremental average word length calculation

### Stage 3: Scoring & Smoothing
- $\text{code\_score} = \text{symbols} + \text{keywords} + \text{camelCase} + \text{indentation} + \text{numbers}$
- $\text{english\_score} = \text{stopwords} + \text{doc\_words} + \text{question\_mark} + \text{avg\_word\_len}$
- $\text{line\_score} = \text{clamp}_0^1(\text{code\_score} - \text{english\_score})$
- Windowed score smoothing prevents false transitions on isolated empty lines or brackets.

### Stage 4: Finite State Machine (FSM)
Smooth transition parsing between `NaturalLanguage`, `CandidateCode`, `Code`, and `CandidateEnglish` states (using `ENTER_THRESHOLD = 0.55` and `EXIT_THRESHOLD = 0.35`).

### Stage 5: Context Association & Block Detection
Associates preceding explanation lines (up to 3 lines prior) with detected code blocks.

### Stage 6: Compressor Passes & Serialization
Partitions natural language prose from code regions, applies lossless cleanup, near-duplicate removal, and constraint locking, and outputs the final compressed prompt context.
