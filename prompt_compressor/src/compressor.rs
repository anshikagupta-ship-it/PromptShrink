use crate::extractor::Document;
use crate::lexer::{Token, TokenFlags, TokenKind};
use rust_stemmers::{Algorithm, Stemmer};
use std::collections::{HashMap, HashSet};

const STOPWORDS: &[&str] = &[
    "a", "also", "an", "and", "any", "are", "because", "but", "could", "he",
    "help", "here's", "i", "i'd", "i'll", "i'm", "i've", "ideas", "is",
    "it's", "just", "know", "maybe", "mine", "my", "of", "our", "ours",
    "please", "probably", "really", "she", "so", "something's", "thanks",
    "that", "the", "they", "think", "this", "to", "was", "we", "we're",
    "were", "what's", "would", "you", "you're", "you've", "your", "yours",
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
    pub compression_ratio: f32,
    pub theoretical_max_ratio: f32,
}

pub enum Region {
    English(Vec<Token>),
    Code(Vec<Token>),
}

struct Sentence {
    tokens: Vec<Token>,
    /// Maps a stemmed entity to its accumulated weighted frequency in this sentence
    entities: HashMap<String, f32>,
    score: f32,
    keep: bool,
}

pub fn analyze_prompt(doc: &Document) -> PromptAnalysis {
    let source = doc.original.as_str();
    let total_tokens = doc
        .tokens
        .iter()
        .filter(|t| t.kind != TokenKind::Whitespace && t.kind != TokenKind::Newline)
        .count();

    if total_tokens == 0 {
        return PromptAnalysis {
            token_count: 0,
            code_ratio: 0.0,
            boilerplate_ratio: 0.0,
            compressibility: 0.0,
            size_category: PromptSize::Tiny,
        };
    }

    let mut boilerplate_tokens = 0;
    for tok in &doc.tokens {
        if tok.kind == TokenKind::Word {
            if STOPWORDS.iter().any(|&s| s.eq_ignore_ascii_case(tok.text(source))) {
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

    PromptAnalysis {
        token_count: total_tokens,
        code_ratio,
        boilerplate_ratio,
        compressibility,
        size_category,
    }
}

pub fn compress_prompt(doc: &Document) -> (String, CompressionResult) {
    let analysis = analyze_prompt(doc);
    let source = doc.original.as_str();

    // 1. Partition tokens into structurally isolated regions (Code vs English)
    // This ensures code is NEVER touched by the deduplicator or graph remover
    let mut regions = partition_regions(doc);

    // 2. Build Code Vocabulary (Extract all identifiers from Code regions)
    let code_vocab = extract_code_vocabulary(&regions, source);

    let stemmer = Stemmer::create(Algorithm::English);
    let mut final_output = String::with_capacity(doc.original.len());
    let mut final_tokens = 0;

    // 3. Process Regions Independently
    for region in &mut regions {
        match region {
            Region::Code(tokens) => {
                // Code bypasses deduplication entirely. It just gets minified.
                minify_code(tokens);

                let (text, count) = serialize_tokens(tokens, source);
                final_output.push_str(&text);
                final_tokens += count;
            }
            Region::English(tokens) => {
                if analysis.size_category == PromptSize::Tiny {
                    let (text, count) = serialize_tokens(tokens, source);
                    final_output.push_str(&text);
                    final_tokens += count;
                    continue;
                }

                // English/Logs go through Deduplication -> Semantic Concept Graph pipeline
                let compressed_english = process_english_graph(tokens, source, &stemmer, &code_vocab);
                let count = compressed_english.split_whitespace().count();

                final_output.push_str(&compressed_english);
                final_output.push('\n');
                final_tokens += count;
            }
        }
    }

    let compressed_text = final_output.trim().to_string();
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

fn partition_regions(doc: &Document) -> Vec<Region> {
    let mut regions = Vec::new();
    let mut current_region_tokens = Vec::new();
    let mut in_code = false;
    let mut block_idx = 0;

    for tok in &doc.tokens {
        while block_idx < doc.blocks.len() && tok.start >= doc.blocks[block_idx].end {
            block_idx += 1;
        }

        let tok_in_code = block_idx < doc.blocks.len()
            && tok.start >= doc.blocks[block_idx].start
            && tok.start < doc.blocks[block_idx].end;

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
        current_region_tokens.push(*tok);
    }

    if !current_region_tokens.is_empty() {
        if in_code {
            regions.push(Region::Code(current_region_tokens));
        } else {
            regions.push(Region::English(current_region_tokens));
        }
    }

    regions
}

fn extract_code_vocabulary(regions: &[Region], source: &str) -> HashSet<String> {
    let mut vocab = HashSet::new();
    for region in regions {
        if let Region::Code(tokens) = region {
            for tok in tokens {
                if tok.kind == TokenKind::Word {
                    let text = tok.text(source).to_ascii_lowercase();
                    if text.len() > 2 {
                        vocab.insert(text);
                    }
                }
            }
        }
    }
    vocab
}

fn minify_code(tokens: &mut Vec<Token>) {
    tokens.retain(|tok| tok.kind != TokenKind::Comment);

    let mut write = 0;
    let mut consecutive_newlines = 0;
    let mut pending_space = false;

    for read in 0..tokens.len() {
        let tok = tokens[read];
        match tok.kind {
            TokenKind::Newline => {
                if consecutive_newlines < 1 {
                    tokens[write] = tok;
                    write += 1;
                    consecutive_newlines += 1;
                }
                pending_space = false;
            }
            TokenKind::Whitespace => {
                pending_space = true;
            }
            TokenKind::CodeBlock | TokenKind::InlineCode => {
                if pending_space {
                    tokens[write] = Token {
                        kind: TokenKind::Whitespace,
                        start: tok.start,
                        end: tok.start,
                        flags: TokenFlags::SYNTHETIC,
                    };
                    write += 1;
                    pending_space = false;
                }
                consecutive_newlines = 0;
                tokens[write] = tok;
                write += 1;
            }
            _ => {
                if pending_space {
                    tokens[write] = Token {
                        kind: TokenKind::Whitespace,
                        start: tok.start,
                        end: tok.start,
                        flags: TokenFlags::SYNTHETIC,
                    };
                    write += 1;
                    pending_space = false;
                }
                consecutive_newlines = 0;
                tokens[write] = tok;
                write += 1;
            }
        }
    }
    tokens.truncate(write);
}

fn process_english_graph(tokens: &[Token], source: &str, stemmer: &Stemmer, code_vocab: &HashSet<String>) -> String {
    let mut sentences = build_sentences(tokens, source, stemmer, code_vocab);

    // Pass 1: Aggressively remove exact duplicates (logs) and repetitive adjacent structures (filler)
    deduplicate_sentences(&mut sentences, source);

    // Retain only kept sentences so dropped ones don't skew the graph memory/weights
    sentences.retain(|s| s.keep);

    let n = sentences.len();
    if n <= 2 {
        return sentences.iter()
            .map(|s| serialize_tokens(&s.tokens, source).0)
            .collect::<Vec<_>>()
            .join(" ");
    }

    // Pass 2: Build Adjacency Matrix
    let mut adj = vec![vec![0.0; n]; n];
    for i in 0..n {
        for j in (i + 1)..n {
            let mut edge_weight = 0.0;
            for (entity, weight_i) in &sentences[i].entities {
                if let Some(weight_j) = sentences[j].entities.get(entity) {
                    edge_weight += weight_i * weight_j;
                }
            }
            if edge_weight > 0.0 {
                adj[i][j] = edge_weight;
                adj[j][i] = edge_weight;
            }
        }
    }

    // Pass 3: Run Weighted PageRank
    let ranks = compute_weighted_pagerank(&adj, 20, 0.85);
    for (i, sentence) in sentences.iter_mut().enumerate() {
        sentence.score = ranks[i];
    }

    // Pass 4: Prune semantic leaves (Bottom 30%)
    let mut ranked_indices: Vec<usize> = (0..n).collect();
    ranked_indices.sort_unstable_by(|&a, &b| sentences[a].score.partial_cmp(&sentences[b].score).unwrap());

    let drop_count = (n as f32 * 0.30) as usize;
    for &idx in &ranked_indices[..drop_count] {
        sentences[idx].keep = false;
    }

    let mut out = String::new();
    for sentence in sentences {
        if sentence.keep {
            let (text, _) = serialize_tokens(&sentence.tokens, source);
            out.push_str(text.trim());
            out.push(' ');
        }
    }

    out
}

fn deduplicate_sentences(sentences: &mut Vec<Sentence>, source: &str) {
    let mut seen_normalized = HashSet::new();
    let mut last_entities: Option<HashMap<String, f32>> = None;

    for sentence in sentences.iter_mut() {
        // Build a normalized string consisting only of words and numbers (ignoring punctuation)
        let normalized: String = sentence.tokens.iter()
            .filter(|t| matches!(t.kind, TokenKind::Word | TokenKind::Number | TokenKind::InlineCode))
            .map(|t| t.text(source).to_ascii_lowercase())
            .collect::<Vec<_>>()
            .join(" ");

        if normalized.is_empty() {
            continue;
        }

        // STRATEGY 1: Global Exact Match (Crucial for log spam like "INFO server started")
        // If we have seen this EXACT sequence of words anywhere before, drop it.
        if !seen_normalized.insert(normalized) {
            sentence.keep = false;
            continue;
        }

        // STRATEGY 2: Consecutive Structural Match (Crucial for list-like filler)
        // Checks if the current sentence shares > 50% vocabulary with the immediate previous one.
        // e.g. "I've spent hours reading StackOverflow" vs "I've spent hours reading Reddit"
        if let Some(prev_entities) = &last_entities {
            let similarity = compute_jaccard_similarity(&sentence.entities, prev_entities);
            if similarity > 0.50 {
                sentence.keep = false;
                continue;
            }
        }

        // Only update `last_entities` if we kept the current sentence
        last_entities = Some(sentence.entities.clone());
    }
}

fn compute_jaccard_similarity(a: &HashMap<String, f32>, b: &HashMap<String, f32>) -> f32 {
    if a.is_empty() && b.is_empty() { return 1.0; }
    if a.is_empty() || b.is_empty() { return 0.0; }

    let mut intersection = 0.0;
    let mut union = 0.0;

    let mut all_keys = HashSet::new();
    for k in a.keys() { all_keys.insert(k.as_str()); }
    for k in b.keys() { all_keys.insert(k.as_str()); }

    for k in all_keys {
        let va = a.get(k).copied().unwrap_or(0.0);
        let vb = b.get(k).copied().unwrap_or(0.0);
        intersection += va.min(vb);
        union += va.max(vb);
    }

    if union == 0.0 { 0.0 } else { intersection / union }
}

fn build_sentences(tokens: &[Token], source: &str, stemmer: &Stemmer, code_vocab: &HashSet<String>) -> Vec<Sentence> {
    let mut sentences = Vec::new();
    let mut current_tokens = Vec::new();
    let mut current_entities: HashMap<String, f32> = HashMap::new();

    for &tok in tokens {
        current_tokens.push(tok);

        if matches!(tok.kind, TokenKind::Word | TokenKind::InlineCode) {
            let mut raw_text = tok.text(source);
            raw_text = raw_text.trim_matches(|c: char| c.is_ascii_punctuation());

            if raw_text.len() > 1 && !STOPWORDS.iter().any(|&s| s.eq_ignore_ascii_case(raw_text)) {
                let lower = raw_text.to_ascii_lowercase();
                let stemmed = stemmer.stem(&lower).into_owned();

                let mut weight = 1.0;
                if tok.flags.contains(TokenFlags::ALL_CAPS) { weight += 3.0; }
                else if tok.flags.contains(TokenFlags::CAPITALIZED) { weight += 2.0; }
                if tok.flags.contains(TokenFlags::HAS_NUMBERS) { weight += 1.0; }
                if tok.kind == TokenKind::InlineCode { weight += 5.0; }

                if code_vocab.contains(&lower) || code_vocab.contains(&stemmed) {
                    weight += 6.0;
                }

                *current_entities.entry(stemmed).or_insert(0.0) += weight;
            }
        }

        let is_boundary = if tok.kind == TokenKind::Newline {
            true
        } else if tok.kind == TokenKind::Punctuation {
            let t = tok.text(source);
            t == "." || t == "?" || t == "!" || t == ";"
        } else {
            false
        };

        if is_boundary {
            if current_tokens.iter().any(|t| t.kind != TokenKind::Whitespace && t.kind != TokenKind::Newline) {
                sentences.push(Sentence {
                    tokens: std::mem::take(&mut current_tokens),
                    entities: std::mem::take(&mut current_entities),
                    score: 0.0,
                    keep: true,
                });
            } else {
                current_tokens.clear();
                current_entities.clear();
            }
        }
    }

    if current_tokens.iter().any(|t| t.kind != TokenKind::Whitespace && t.kind != TokenKind::Newline) {
        sentences.push(Sentence {
            tokens: current_tokens,
            entities: current_entities,
            score: 0.0,
            keep: true,
        });
    }

    sentences
}

fn compute_weighted_pagerank(adj: &[Vec<f32>], iterations: usize, damping: f32) -> Vec<f32> {
    let n = adj.len();
    if n == 0 { return vec![]; }

    let mut ranks = vec![1.0 / (n as f32); n];
    let mut next_ranks = vec![0.0; n];
    let base_score = (1.0 - damping) / (n as f32);

    let out_degree_sums: Vec<f32> = adj.iter()
        .map(|row| row.iter().sum::<f32>())
        .collect();

    for _ in 0..iterations {
        for r in &mut next_ranks {
            *r = base_score;
        }

        for i in 0..n {
            let out_sum = out_degree_sums[i];

            if out_sum == 0.0 {
                let share = (ranks[i] * damping) / (n as f32);
                for r in &mut next_ranks {
                    *r += share;
                }
            } else {
                for j in 0..n {
                    if adj[i][j] > 0.0 {
                        let weight_ratio = adj[i][j] / out_sum;
                        next_ranks[j] += damping * ranks[i] * weight_ratio;
                    }
                }
            }
        }
        ranks.copy_from_slice(&next_ranks);
    }

    ranks
}

fn serialize_tokens(tokens: &[Token], source: &str) -> (String, usize) {
    let mut out = String::new();
    let mut count = 0;
    let mut last_was_space = false;

    for tok in tokens {
        if tok.flags.contains(TokenFlags::SYNTHETIC) {
            match tok.kind {
                TokenKind::Newline => {
                    out.push('\n');
                    last_was_space = true;
                }
                _ => {
                    if !last_was_space {
                        out.push(' ');
                        last_was_space = true;
                    }
                }
            }
        } else {
            let is_space = matches!(tok.kind, TokenKind::Whitespace | TokenKind::Newline);
            if is_space {
                if !last_was_space {
                    out.push(if tok.kind == TokenKind::Newline { '\n' } else { ' ' });
                    last_was_space = true;
                }
            } else {
                out.push_str(tok.text(source));
                count += 1;
                last_was_space = false;
            }
        }
    }
    (out, count)
}
