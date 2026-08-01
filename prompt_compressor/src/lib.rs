pub mod lexer;
pub mod extractor;
pub mod compressor;

pub use extractor::{CodeBlock, Document};
pub use lexer::{Lexer, Token, TokenFlags, TokenKind};

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = r#"Hey, I've been getting a weird bug in my auth middleware.
Here's the relevant function, can you tell me what's wrong with it?

fn check_token(token: &str, secret: &str) -> bool {
    if token.is_empty() {
        return false;
    }
    let parts: Vec<&str> = token.split('.').collect();
    for p in parts.iter() {
        if p.len() < 4 {
            return false;
        }
    }
    hash_matches(parts[2], secret)
}

I think the issue might be in the loop but I'm not sure. It happens
maybe 1 in 20 requests, seemingly at random. Any ideas what could
cause that kind of intermittent failure?
"#;

    #[test]
    fn identifies_the_code_block_and_not_the_prose() {
        let doc = Document::analyze(SAMPLE);
        assert!(!doc.blocks().is_empty(), "expected at least one code block");
        for b in doc.blocks() {
            println!("--- block score={:.2} ---\n{}", b.score, &SAMPLE[b.start..b.end]);
        }
        let joined: String = doc.blocks().iter().map(|b| SAMPLE[b.start..b.end].to_string()).collect();
        assert!(joined.contains("fn check_token"));
        assert!(!joined.contains("weird bug"));
        assert!(!joined.contains("intermittent failure"));
    }

    #[test]
    fn transform_and_splice_round_trips_on_identity() {
        let doc = Document::analyze(SAMPLE);
        let rebuilt = doc.transform_blocks(|text, _b| text.to_string());
        assert_eq!(rebuilt, SAMPLE);
    }

    #[test]
    fn transform_can_shrink_a_block_and_still_reassemble_cleanly() {
        let doc = Document::analyze(SAMPLE);
        let rebuilt = doc.transform_blocks(|text, _b| {
            text.lines().filter(|l| !l.trim().is_empty()).collect::<Vec<_>>().join("\n")
        });
        assert!(rebuilt.len() < SAMPLE.len());
        assert!(rebuilt.contains("weird bug"));
        assert!(rebuilt.contains("fn check_token"));
    }
}
