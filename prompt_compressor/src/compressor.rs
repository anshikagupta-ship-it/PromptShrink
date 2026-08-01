use crate::extractor::Document;
use crate::lexer::{Token, TokenKind};

// Removed informative words (how, why, what, can, should).
const STOPWORDS: &[&str] = &[
    "a", "also", "an", "and", "any", "are", "because", "but", "could",
    "he", "help", "here's", "i", "i'd", "i'll", "i'm", "i've", "ideas",
    "is", "it's", "just", "know", "maybe", "mine", "my", "of", "our",
    "ours", "please", "probably", "really", "she", "so", "something's",
    "thanks", "that", "the", "they", "think", "this", "to", "was", "we",
    "we're", "were", "what's", "would", "you", "you're", "you've", "your",
    "yours",
];

// Multi-word conversational boilerplate to strip entirely.
const PHRASES: &[&[&str]] = &[
    &["could", "you", "please"],
    &["i", "was", "wondering", "if"],
    &["can", "you", "help", "me"],
    &["would", "it", "be", "possible", "to"],
    &["i", "am", "trying", "to"],
    &["the", "problem", "is", "that"],
];

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum PromptSize {
    Tiny,
    Small,
    Medium,
    Large,
    Huge,
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
    pub compression_ratio: f32,       // (original - compressed) / original
    pub theoretical_max_ratio: f32,   // target based on boilerplate analysis
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum OptimizationLevel {
    Skip,
    Light,
    Aggressive,
    Full,
}

pub enum Region {
    English(Vec<Token>),
    Code(Vec<Token>),
}

pub struct TokenStream {
    pub regions: Vec<Region>,
}

impl TokenStream {
    pub fn serialize(&self) -> String {
        let mut out = String::new();
        for region in &self.regions {
            match region {
                Region::English(tokens) | Region::Code(tokens) => {
                    for tok in tokens {
                        out.push_str(&tok.text);
                    }
                }
            }
        }
        out
    }
}

pub fn analyze_prompt(doc: &Document) -> PromptAnalysis {
    let total_tokens = doc.tokens.iter().filter(|t| t.kind != TokenKind::Whitespace && t.kind != TokenKind::Newline).count();
    if total_tokens == 0 {
        return PromptAnalysis {
            token_count: 0, code_ratio: 0.0, boilerplate_ratio: 0.0,
            compressibility: 0.0, size_category: PromptSize::Tiny,
        };
    }

    let mut boilerplate_tokens = 0;
    for tok in &doc.tokens {
        if tok.kind == TokenKind::Word {
            if STOPWORDS.iter().any(|&s| s.eq_ignore_ascii_case(&tok.text)) {
                boilerplate_tokens += 1;
            }
        }
    }

    let code_bytes: usize = doc.blocks.iter().map(|b| b.end - b.start).sum();
    let code_ratio = code_bytes as f32 / doc.original.len().max(1) as f32;

    let boilerplate_ratio = boilerplate_tokens as f32 / total_tokens as f32;
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

pub fn compress_prompt(doc: &Document) -> (String, CompressionResult) {
    let analysis = analyze_prompt(doc);

    let opt_level = match analysis.size_category {
        PromptSize::Tiny => OptimizationLevel::Skip,
        PromptSize::Small => if analysis.compressibility > 0.3 { OptimizationLevel::Light } else { OptimizationLevel::Skip },
        PromptSize::Medium => OptimizationLevel::Aggressive,
        PromptSize::Large | PromptSize::Huge => OptimizationLevel::Full,
    };

    if opt_level == OptimizationLevel::Skip {
        let res = CompressionResult {
            original_tokens: analysis.token_count,
            compressed_tokens: analysis.token_count,
            compression_ratio: 0.0,
            theoretical_max_ratio: analysis.compressibility,
        };
        return (doc.original.clone(), res);
    }

    // O(N) partitioning of tokens into structural regions.
    let mut regions = Vec::new();
    let mut current_region_tokens = Vec::new();
    let mut in_code = false;
    let mut block_idx = 0;

    for tok in &doc.tokens {
        while block_idx < doc.blocks.len() && tok.start >= doc.blocks[block_idx].end {
            block_idx += 1;
        }

        let mut tok_in_code = false;
        if block_idx < doc.blocks.len() && tok.start >= doc.blocks[block_idx].start && tok.start < doc.blocks[block_idx].end {
            tok_in_code = true;
        }

        if tok_in_code != in_code {
            if !current_region_tokens.is_empty() {
                if in_code {
                    regions.push(Region::Code(std::mem::take(&mut current_region_tokens)));
                } else {
                    regions.push(Region::English(std::mem::take(&mut current_region_tokens)));
                }
            }
            in_code = tok_in_code;
        }
        current_region_tokens.push(tok.clone());
    }

    if !current_region_tokens.is_empty() {
        if in_code {
            regions.push(Region::Code(current_region_tokens));
        } else {
            regions.push(Region::English(current_region_tokens));
        }
    }

    let mut stream = TokenStream { regions };

    for region in &mut stream.regions {
        match region {
            Region::English(tokens) => {
                if opt_level >= OptimizationLevel::Aggressive {
                    phrase_pass(tokens);
                    stopword_pass(tokens);
                }
                english_whitespace_pass(tokens);
            }
            Region::Code(tokens) => {
                if opt_level >= OptimizationLevel::Light {
                    comment_pass(tokens);
                }
                if opt_level >= OptimizationLevel::Aggressive {
                    code_whitespace_pass(tokens);
                }
            }
        }
    }

    // Recalculate directly from final Tokens instead of a 3rd lexer pass.
    let final_tokens = stream.regions.iter()
        .flat_map(|r| match r {
            Region::English(t) | Region::Code(t) => t.iter()
        })
        .filter(|t| t.kind != TokenKind::Whitespace && t.kind != TokenKind::Newline)
        .count();

    let compressed_text = stream.serialize().trim().to_string();

    let compression_ratio = if analysis.token_count > 0 {
        (analysis.token_count.saturating_sub(final_tokens)) as f32 / analysis.token_count as f32
    } else {
        0.0
    };

    let res = CompressionResult {
        original_tokens: analysis.token_count,
        compressed_tokens: final_tokens,
        compression_ratio,
        theoretical_max_ratio: analysis.compressibility,
    };

    (compressed_text, res)
}

fn phrase_pass(tokens: &mut Vec<Token>) {
    let mut to_delete = std::collections::HashSet::new();
    let mut i = 0;

    while i < tokens.len() {
        if tokens[i].kind != TokenKind::Word {
            i += 1;
            continue;
        }

        let mut matched = false;
        for phrase in PHRASES {
            let mut phrase_idx = 0;
            let mut tok_idx = i;
            let mut match_indices = Vec::new();

            while phrase_idx < phrase.len() && tok_idx < tokens.len() {
                if tokens[tok_idx].kind == TokenKind::Word {
                    if tokens[tok_idx].text.eq_ignore_ascii_case(phrase[phrase_idx]) {
                        match_indices.push(tok_idx);
                        phrase_idx += 1;
                    } else {
                        break;
                    }
                }
                tok_idx += 1;
            }

            if phrase_idx == phrase.len() {
                let start = match_indices.first().unwrap();
                let end = match_indices.last().unwrap();
                for j in *start..=*end {
                    to_delete.insert(j);
                }

                // Fix Bug: Consume trailing whitespace or commas following the deleted phrase
                let mut tail = end + 1;
                while tail < tokens.len() && matches!(tokens[tail].kind, TokenKind::Whitespace | TokenKind::Punctuation) {
                    // Do not delete sentence-terminating punctuation
                    if tokens[tail].text == "." || tokens[tail].text == "?" || tokens[tail].text == "!" {
                        break;
                    }
                    to_delete.insert(tail);
                    tail += 1;
                }

                i = tail;
                matched = true;
                break;
            }
        }
        if !matched {
            i += 1;
        }
    }

    let mut new_tokens = Vec::with_capacity(tokens.len());
    for (idx, tok) in tokens.drain(..).enumerate() {
        if !to_delete.contains(&idx) {
            new_tokens.push(tok);
        }
    }
    *tokens = new_tokens;
}

fn stopword_pass(tokens: &mut Vec<Token>) {
    // Zero-allocation scan
    tokens.retain(|tok| {
        if tok.kind == TokenKind::Word {
            !STOPWORDS.iter().any(|&s| s.eq_ignore_ascii_case(&tok.text))
        } else {
            true
        }
    });
}

fn english_whitespace_pass(tokens: &mut Vec<Token>) {
    let mut new_tokens = Vec::with_capacity(tokens.len());
    let mut last_was_space = false;
    for tok in tokens.drain(..) {
        if tok.kind == TokenKind::Whitespace || tok.kind == TokenKind::Newline {
            if !last_was_space {
                let mut space_tok = tok.clone();
                space_tok.text = " ".to_string();
                space_tok.kind = TokenKind::Whitespace;
                new_tokens.push(space_tok);
                last_was_space = true;
            }
        } else {
            new_tokens.push(tok);
            last_was_space = false;
        }
    }

    if new_tokens.first().map_or(false, |t| t.kind == TokenKind::Whitespace) {
        new_tokens.remove(0);
    }
    if new_tokens.last().map_or(false, |t| t.kind == TokenKind::Whitespace) {
        new_tokens.pop();
    }
    *tokens = new_tokens;
}

fn comment_pass(tokens: &mut Vec<Token>) {
    tokens.retain(|tok| tok.kind != TokenKind::Comment);
}

fn code_whitespace_pass(tokens: &mut Vec<Token>) {
    let mut new_tokens = Vec::with_capacity(tokens.len());
    let mut consecutive_newlines = 0;
    let mut pending_space = false;

    for tok in tokens.drain(..) {
        match tok.kind {
            TokenKind::Newline => {
                if consecutive_newlines < 1 {
                    let mut nl = tok.clone();
                    nl.text = "\n".to_string();
                    new_tokens.push(nl);
                    consecutive_newlines += 1;
                }
                pending_space = false;
            }
            TokenKind::Whitespace => {
                pending_space = true;
            }
            TokenKind::CodeBlock | TokenKind::InlineCode => {
                if pending_space {
                    let mut sp = tok.clone();
                    sp.kind = TokenKind::Whitespace;
                    sp.text = " ".to_string();
                    new_tokens.push(sp);
                    pending_space = false;
                }
                consecutive_newlines = 0;
                new_tokens.push(tok);
            }
            _ => {
                if pending_space {
                    let is_safe_to_strip = |k: &TokenKind| matches!(k, TokenKind::Bracket | TokenKind::Punctuation);
                    let prev_is_safe = new_tokens.last().map(|t| is_safe_to_strip(&t.kind)).unwrap_or(false);
                    let curr_is_safe = is_safe_to_strip(&tok.kind);

                    if !prev_is_safe && !curr_is_safe {
                        let mut sp = tok.clone();
                        sp.kind = TokenKind::Whitespace;
                        sp.text = " ".to_string();
                        new_tokens.push(sp);
                    }
                    pending_space = false;
                }
                consecutive_newlines = 0;
                new_tokens.push(tok);
            }
        }
    }
    *tokens = new_tokens;
}
