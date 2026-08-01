use crate::lexer::{Lexer, Token, TokenFlags, TokenKind};

const LANG_KEYWORDS: &[&str] = &[
    "fn", "let", "impl", "struct", "trait", "pub", "mod", "mut", "enum",
    "match", "async", "await", "unwrap", "def", "elif", "except", "import",
    "namespace", "const", "static", "void", "def", "lambda", "yield",
    "println", "printf", "endl", "nullptr", "None", "true", "false",
];

const DOC_WORDS: &[&str] = &[
    "function", "class", "variable", "method", "loop", "code", "error",
    "bug", "issue", "script", "program", "file", "example", "snippet",
    "output", "result", "following",
];

const ENGLISH_STOPWORDS: &[&str] = &[
    "i", "i'm", "i've", "i'll", "i'd", "you", "you're", "you've", "your",
    "yours", "my", "mine", "our", "ours", "we", "we're", "they", "he",
    "she", "it's", "the", "that", "this", "because", "should", "would",
    "could", "please", "here's", "what's", "something's", "is", "are",
    "was", "were", "a", "an", "of", "to", "and", "but", "so", "just",
    "really", "think", "know", "maybe", "probably", "also", "any",
    "ideas", "what", "how", "why", "when", "who", "can", "help", "thanks",
];

#[derive(Debug, Default, Clone)]
struct LineFeatures {
    start: usize,
    end: usize,
    is_blank: bool,
    indent_chars: usize,
    total_tokens: usize,
    word_tokens: usize,
    symbol_tokens: usize,
    lang_keyword_hits: usize,
    doc_word_hits: usize,
    stopword_hits: usize,
    camel_or_snake: usize,
    has_numbers: bool,
    ends_with_symbol: bool,
    ends_with_question: bool,
    avg_word_len: f32,
    is_explicit_code: bool,
}

fn is_camel_or_snake(word: &str) -> bool {
    let has_underscore = word.contains('_') && word.len() > 1;
    let has_inner_upper = word.chars().skip(1).any(|c| c.is_uppercase())
        && word.chars().next().map_or(false, |c| c.is_lowercase());
    has_underscore || has_inner_upper
}

fn code_score(f: &LineFeatures) -> f32 {
    if f.is_explicit_code {
        return 1.0;
    }
    let total = f.total_tokens.max(1) as f32;
    let words = f.word_tokens.max(1) as f32;

    let mut s = 0.0f32;
    s += (f.symbol_tokens as f32 / total) * 1.2;
    s += (f.lang_keyword_hits as f32 / words).min(1.0) * 0.6;
    s += (f.camel_or_snake as f32 / words).min(1.0) * 0.4;
    s += if f.indent_chars >= 2 { 0.15 } else { 0.0 };
    s += if f.ends_with_symbol { 0.15 } else { 0.0 };
    s += if f.has_numbers { 0.05 } else { 0.0 };
    s.clamp(0.0, 1.0)
}

fn english_score(f: &LineFeatures) -> f32 {
    let words = f.word_tokens.max(1) as f32;

    let mut s = 0.0f32;
    s += (f.stopword_hits as f32 / words).min(1.0) * 1.1;
    s += (f.doc_word_hits as f32 / words).min(1.0) * 0.5;
    s += if f.ends_with_question { 0.35 } else { 0.0 };
    s += ((f.avg_word_len - 4.0).max(0.0)) * 0.08;
    s.clamp(0.0, 1.0)
}

fn line_score(f: &LineFeatures) -> f32 {
    if f.is_blank {
        return f32::NAN;
    }
    (code_score(f) - english_score(f)).clamp(0.0, 1.0)
}

fn extract_line_features(input: &str, tokens: &[Token]) -> Vec<LineFeatures> {
    let mut line_ranges = Vec::new();
    let mut line_start = 0;
    for (i, b) in input.bytes().enumerate() {
        if b == b'\n' {
            line_ranges.push((line_start, i + 1));
            line_start = i + 1;
        }
    }
    if line_start < input.len() {
        line_ranges.push((line_start, input.len()));
    }
    if line_ranges.is_empty() {
        line_ranges.push((0, input.len()));
    }

    let mut lines: Vec<LineFeatures> = line_ranges
        .iter()
        .map(|&(s, e)| LineFeatures {
            start: s,
            end: e,
            is_blank: true,
            ..Default::default()
        })
        .collect();

    let mut line_idx = 0;
    for tok in tokens {
        while line_idx + 1 < line_ranges.len() && tok.start >= line_ranges[line_idx].1 {
            line_idx += 1;
        }
        let lf = &mut lines[line_idx];

        match tok.kind {
            TokenKind::Whitespace => {
                if lf.total_tokens == 0 {
                    lf.indent_chars = tok.text(input).len();
                }
                continue;
            }
            TokenKind::Newline => continue,
            TokenKind::CodeBlock | TokenKind::InlineCode => {
                lf.is_explicit_code = true;
            }
            TokenKind::Word => {
                lf.word_tokens += 1;
                let lower = tok.text(input).to_ascii_lowercase();
                if LANG_KEYWORDS.contains(&lower.as_str()) {
                    lf.lang_keyword_hits += 1;
                } else if DOC_WORDS.contains(&lower.as_str()) {
                    lf.doc_word_hits += 1;
                } else if ENGLISH_STOPWORDS.contains(&lower.as_str()) {
                    lf.stopword_hits += 1;
                }
                if is_camel_or_snake(tok.text(input)) {
                    lf.camel_or_snake += 1;
                }
                if tok.flags.contains(TokenFlags::HAS_NUMBERS) {
                    lf.has_numbers = true;
                }
                let n = lf.word_tokens as f32;
                lf.avg_word_len = lf.avg_word_len + (tok.text(input).len() as f32 - lf.avg_word_len) / n;
            }
            TokenKind::Operator | TokenKind::Bracket => {
                lf.symbol_tokens += 1;
            }
            TokenKind::Punctuation => {
                lf.symbol_tokens += 1;
                if tok.text(input) == "?" {
                    lf.ends_with_question = true;
                }
            }
            _ => {}
        }

        lf.is_blank = false;
        lf.total_tokens += 1;
        lf.ends_with_symbol = matches!(
            tok.kind,
            TokenKind::Operator | TokenKind::Bracket | TokenKind::Punctuation
        );
        if tok.kind == TokenKind::Punctuation && tok.text(input) != "?" {
            lf.ends_with_symbol = tok.text(input) != "?";
        }
    }

    lines
}

fn windowed_scores(raw: &[f32]) -> Vec<f32> {
    let n = raw.len();
    let mut out = vec![f32::NAN; n];
    for i in 0..n {
        if raw[i].is_nan() {
            continue;
        }
        let prev = if i > 0 && !raw[i - 1].is_nan() { raw[i - 1] } else { raw[i] };
        let next = if i + 1 < n && !raw[i + 1].is_nan() { raw[i + 1] } else { raw[i] };
        out[i] = ((0.5 * prev + raw[i] + 0.5 * next) / 2.0).clamp(0.0, 1.0);
    }
    out
}

#[derive(Debug, Clone)]
pub struct CodeBlock {
    pub start: usize,
    pub end: usize,
    pub score: f32,
    pub context: Option<String>,
}

/// The Document now acts as the single source of truth for tokens.
pub struct Document {
    pub original: String,
    pub tokens: Vec<Token>,
    pub blocks: Vec<CodeBlock>,
}

const ENTER_THRESHOLD: f32 = 0.55;
const EXIT_THRESHOLD: f32 = 0.35;
const CONSECUTIVE_REQUIRED: usize = 2;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum ParserState {
    NaturalLanguage,
    CandidateCode,
    Code,
    CandidateEnglish,
}

fn find_context(
    input: &str,
    lines: &[LineFeatures],
    raw: &[f32],
    block_start_line: usize,
) -> Option<String> {
    let mut j = block_start_line;
    while j > 0 && j > block_start_line.saturating_sub(3) {
        j -= 1;
        if lines[j].is_blank {
            continue;
        }
        let text = input[lines[j].start..lines[j].end].trim();
        return if !text.is_empty() && raw[j] < ENTER_THRESHOLD {
            Some(text.to_string())
        } else {
            None
        };
    }
    None
}

impl Document {
    /// Core analysis, shared by `analyze` (borrows) and `analyze_owned`
    /// (takes ownership, used by the chunked streaming path in main.rs so
    /// we don't pay for an extra full-text clone per chunk).
    fn build(input: &str) -> (Vec<Token>, Vec<CodeBlock>) {
        // We now only lex exactly once.
        let tokens = Lexer::new(input).lex_all();
        let lines = extract_line_features(input, &tokens);
        let raw: Vec<f32> = lines.iter().map(line_score).collect();
        let smoothed = windowed_scores(&raw);

        let mut blocks: Vec<CodeBlock> = Vec::new();
        let mut state = ParserState::NaturalLanguage;
        let mut block_start_line = 0usize;
        let mut streak = 0usize;
        let mut low_run_start = 0usize;
        let mut score_sum = 0.0f32;
        let mut score_n = 0usize;

        let n = lines.len();
        for i in 0..n {
            let blank = lines[i].is_blank;
            let s = smoothed[i];
            let high = !blank && s >= ENTER_THRESHOLD;
            let low = blank || s < EXIT_THRESHOLD;

            match state {
                ParserState::NaturalLanguage => {
                    if high {
                        state = ParserState::CandidateCode;
                        streak = 1;
                        block_start_line = i;
                        score_sum = s;
                        score_n = 1;
                    }
                }
                ParserState::CandidateCode => {
                    if blank {
                    } else if high {
                        streak += 1;
                        score_sum += s;
                        score_n += 1;
                        if streak >= CONSECUTIVE_REQUIRED {
                            state = ParserState::Code;
                        }
                    } else {
                        state = ParserState::NaturalLanguage;
                    }
                }
                ParserState::Code => {
                    if !blank {
                        score_sum += s;
                        score_n += 1;
                    }
                    if low {
                        state = ParserState::CandidateEnglish;
                        streak = 1;
                        low_run_start = i;
                    }
                }
                ParserState::CandidateEnglish => {
                    if low {
                        streak += 1;
                        if streak >= CONSECUTIVE_REQUIRED {
                            let end_line = low_run_start.saturating_sub(1).max(block_start_line);
                            let context = find_context(input, &lines, &raw, block_start_line);
                            blocks.push(CodeBlock {
                                start: lines[block_start_line].start,
                                end: lines[end_line].end,
                                score: if score_n > 0 { score_sum / score_n as f32 } else { 0.0 },
                                context,
                            });
                            state = ParserState::NaturalLanguage;
                        }
                    } else {
                        state = ParserState::Code;
                        score_sum += s;
                        score_n += 1;
                    }
                }
            }
        }

        match state {
            ParserState::Code => {
                blocks.push(CodeBlock {
                    start: lines[block_start_line].start,
                    end: lines[n - 1].end,
                    score: if score_n > 0 { score_sum / score_n as f32 } else { 0.0 },
                    context: find_context(input, &lines, &raw, block_start_line),
                });
            }
            ParserState::CandidateEnglish => {
                let end_line = low_run_start.saturating_sub(1).max(block_start_line);
                blocks.push(CodeBlock {
                    start: lines[block_start_line].start,
                    end: lines[end_line].end,
                    score: if score_n > 0 { score_sum / score_n as f32 } else { 0.0 },
                    context: find_context(input, &lines, &raw, block_start_line),
                });
            }
            _ => {}
        }

        (tokens, blocks)
    }

    /// Analyze borrowed text. Clones `input` once into `original` -- fine
    /// for small/one-shot inputs or library callers who don't already own
    /// a `String`. For large inputs processed in a memory-bounded backend,
    /// prefer `analyze_owned`.
    pub fn analyze(input: &str) -> Self {
        let (tokens, blocks) = Self::build(input);
        Document {
            original: input.to_string(),
            tokens,
            blocks,
        }
    }

    /// Analyze text we already own, moving it straight into the Document
    /// instead of cloning. This is the entry point the chunked streaming
    /// reader in main.rs uses, since each chunk it reads is already an
    /// owned `String` with nowhere else it needs to live.
    pub fn analyze_owned(input: String) -> Self {
        let (tokens, blocks) = Self::build(&input);
        Document {
            original: input,
            tokens,
            blocks,
        }
    }

    pub fn blocks(&self) -> &[CodeBlock] {
        &self.blocks
    }

    pub fn block_text(&self, i: usize) -> &str {
        &self.original[self.blocks[i].start..self.blocks[i].end]
    }
}
