use crate::extractor::Document;
use crate::lexer::{Lexer, TokenKind};

/// A ruthless list of conversational stopwords that LLMs do not need
/// to understand the core semantic intent of a prompt.
const STOPWORDS: &[&str] = &[
    "i", "i'm", "i've", "i'll", "i'd", "you", "you're", "you've", "your",
    "yours", "my", "mine", "our", "ours", "we", "we're", "they", "he",
    "she", "it's", "the", "that", "this", "because", "should", "would",
    "could", "please", "here's", "what's", "something's", "is", "are",
    "was", "were", "a", "an", "of", "to", "and", "but", "so", "just",
    "really", "think", "know", "maybe", "probably", "also", "any",
    "ideas", "what", "how", "why", "when", "who", "can", "help", "thanks",
];

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum PromptSize {
    Tiny,   // 0-20 tokens
    Small,  // 21-80 tokens
    Medium, // 81-300 tokens
    Large,  // 301-1000 tokens
    Huge,   // 1000+ tokens
}

#[derive(Debug, Clone)]
pub struct PromptAnalysis {
    pub token_count: usize,
    pub code_ratio: f32,
    pub boilerplate_ratio: f32,
    pub compressibility: f32,
    pub size_category: PromptSize,
}

#[derive(Debug, Clone)]
pub struct CompressionResult {
    pub original_tokens: usize,
    pub compressed_tokens: usize,
    pub removable_tokens: usize,
    pub compression_ratio: f32,
    pub theoretical_max_ratio: f32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OptimizationLevel {
    Skip,
    Light,
    Aggressive,
    Full,
}

/// Pre-computes the redundancy in the prompt to select the optimal pipeline strategy.
pub fn analyze_prompt(doc: &Document) -> PromptAnalysis {
    let original = doc.original();
    let tokens = Lexer::new(original).lex_all();

    let total_tokens = tokens.iter().filter(|t| t.kind != TokenKind::Whitespace && t.kind != TokenKind::Newline).count();
    if total_tokens == 0 {
        return PromptAnalysis {
            token_count: 0, code_ratio: 0.0, boilerplate_ratio: 0.0,
            compressibility: 0.0, size_category: PromptSize::Tiny,
        };
    }

    let mut boilerplate_tokens = 0;
    for tok in &tokens {
        if tok.kind == TokenKind::Word {
            let lower = tok.text.to_ascii_lowercase();
            if STOPWORDS.contains(&lower.as_str()) {
                boilerplate_tokens += 1;
            }
        }
    }

    let code_bytes: usize = doc.blocks().iter().map(|b| b.end - b.start).sum();
    let code_ratio = code_bytes as f32 / original.len().max(1) as f32;

    let boilerplate_ratio = boilerplate_tokens as f32 / total_tokens as f32;
    // We estimate code blocks have roughly 30% removable tokens via formatting/comments
    let compressibility = (boilerplate_ratio + (code_ratio * 0.3)).clamp(0.0, 1.0);

    let size_category = match total_tokens {
        0..=20 => PromptSize::Tiny,
        21..=80 => PromptSize::Small,
        81..=300 => PromptSize::Medium,
        301..=1000 => PromptSize::Large,
        _ => PromptSize::Huge,
    };

    PromptAnalysis { token_count: total_tokens, code_ratio, boilerplate_ratio, compressibility, size_category }
}

/// The main adaptive pipeline. Returns the compressed text alongside the efficiency stats.
pub fn compress_prompt(doc: &Document) -> (String, CompressionResult) {
    let analysis = analyze_prompt(doc);

    // Choose the optimization strategy based on size and compressible content
    let opt_level = match analysis.size_category {
        PromptSize::Tiny => OptimizationLevel::Skip,
        PromptSize::Small => if analysis.compressibility > 0.3 { OptimizationLevel::Light } else { OptimizationLevel::Skip },
        PromptSize::Medium => OptimizationLevel::Aggressive,
        PromptSize::Large | PromptSize::Huge => OptimizationLevel::Full,
    };

    let removable = (analysis.token_count as f32 * analysis.compressibility) as usize;

    // Early exit for tiny, dense prompts (e.g. "Explain Rust ownership.")
    if opt_level == OptimizationLevel::Skip {
        let res = CompressionResult {
            original_tokens: analysis.token_count,
            compressed_tokens: analysis.token_count,
            removable_tokens: removable,
            compression_ratio: 0.0,
            theoretical_max_ratio: analysis.compressibility,
        };
        return (doc.original().to_string(), res);
    }

    let original = doc.original();
    let mut out = String::with_capacity(original.len() / 2);
    let mut cursor = 0;

    for block in doc.blocks() {
        let prose = &original[cursor..block.start];
        compress_english_into(prose, &mut out, opt_level);

        let code = &original[block.start..block.end];
        out.push_str("\n```\n");
        compress_code_into(code, &mut out, opt_level);
        out.push_str("\n```\n");

        cursor = block.end;
    }

    let remainder = &original[cursor..];
    compress_english_into(remainder, &mut out, opt_level);
    let compressed_text = out.trim().to_string();

    let final_tokens = Lexer::new(&compressed_text).lex_all().iter().filter(|t| t.kind != TokenKind::Whitespace && t.kind != TokenKind::Newline).count();
    let ratio = 1.0 - (final_tokens as f32 / analysis.token_count.max(1) as f32);

    let res = CompressionResult {
        original_tokens: analysis.token_count,
        compressed_tokens: final_tokens,
        removable_tokens: removable,
        compression_ratio: ratio,
        theoretical_max_ratio: analysis.compressibility,
    };

    (compressed_text, res)
}

fn compress_english_into(raw: &str, out: &mut String, opt: OptimizationLevel) {
    let lexer = Lexer::new(raw);
    let tokens = lexer.lex_all();
    let mut last_was_space = false;

    let strip_stopwords = matches!(opt, OptimizationLevel::Aggressive | OptimizationLevel::Full);

    if !out.is_empty() && !out.ends_with(|c: char| c.is_whitespace()) {
        out.push(' ');
        last_was_space = true;
    }

    for tok in tokens {
        match tok.kind {
            TokenKind::Word => {
                let lower = tok.text.to_ascii_lowercase();
                // Only drop english filler if we are in Aggressive/Full tiers
                if strip_stopwords && STOPWORDS.contains(&lower.as_str()) {
                    continue;
                }
                if !last_was_space && !out.is_empty() && !out.ends_with(|c: char| c.is_whitespace()) {
                    out.push(' ');
                }
                out.push_str(&tok.text);
                last_was_space = false;
            },
            TokenKind::Punctuation => {
                if last_was_space && out.ends_with(' ') {
                    out.pop();
                }
                out.push_str(&tok.text);
                last_was_space = false;
            },
            TokenKind::Whitespace | TokenKind::Newline => {},
            _ => {
                if !last_was_space && !out.is_empty() && !out.ends_with(|c: char| c.is_whitespace()) {
                    out.push(' ');
                }
                out.push_str(&tok.text);
                last_was_space = false;
            }
        }
    }
}

fn compress_code_into(raw: &str, out: &mut String, opt: OptimizationLevel) {
    let mut chars = raw.chars().peekable();
    let mut in_string = false;
    let mut string_delim = '\0';
    let mut last_was_space = true;
    let mut last_char = '\0';

    // Feature flags derived from our optimization tier
    let strip_comments = matches!(opt, OptimizationLevel::Aggressive | OptimizationLevel::Full);
    let strip_symbol_space = matches!(opt, OptimizationLevel::Full);

    while let Some(c) = chars.next() {
        if !in_string && (c == '"' || c == '\'') {
            in_string = true;
            string_delim = c;
            out.push(c);
            last_was_space = false;
            last_char = c;
            continue;
        }

        if in_string {
            out.push(c);
            if c == '\\' {
                if let Some(esc) = chars.next() { out.push(esc); }
            } else if c == string_delim {
                in_string = false;
            }
            continue;
        }

        if strip_comments && c == '/' {
            if let Some(&next_c) = chars.peek() {
                if next_c == '/' {
                    chars.next();
                    for lc in chars.by_ref() { if lc == '\n' { break; } }
                    if !last_was_space { out.push(' '); last_was_space = true; }
                    continue;
                } else if next_c == '*' {
                    chars.next();
                    let mut prev_star = false;
                    for bc in chars.by_ref() {
                        if prev_star && bc == '/' { break; }
                        prev_star = bc == '*';
                    }
                    if !last_was_space { out.push(' '); last_was_space = true; }
                    continue;
                }
            }
        }

        if c.is_whitespace() {
            if !last_was_space && last_char != '\0' && (!strip_symbol_space || !is_symbol(last_char)) {
                out.push(' ');
                last_was_space = true;
            }
            continue;
        }

        if strip_symbol_space && is_symbol(c) {
            if last_was_space && out.ends_with(' ') {
                out.pop();
            }
            out.push(c);
            last_was_space = true;
            last_char = c;
            continue;
        }

        out.push(c);
        last_was_space = false;
        last_char = c;
    }
}

/// Checks if a character is a typical structural or mathematical symbol
/// in programming languages, allowing us to safely strip surrounding spaces.
fn is_symbol(c: char) -> bool {
    "()[]{}<>=+-*/&|!^%;:.,?".contains(c)
}
