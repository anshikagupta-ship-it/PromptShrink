use bitflags::bitflags;
use std::str::CharIndices;

bitflags! {
    /// Flags to annotate tokens during lexing or later optimization passes.
    #[derive(Debug, Clone, Copy, PartialEq, Eq)]
    pub struct TokenFlags: u32 {
        const NONE = 0;
        const CAPITALIZED = 1 << 0;
        const ALL_CAPS = 1 << 1;
        const HAS_NUMBERS = 1 << 2;
        const IS_STOP_WORD = 1 << 3;
        const IS_BOILERPLATE = 1 << 4;
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum TokenKind {
    Word,
    Number,
    String,
    Url,
    CodeBlock,
    InlineCode,
    Punctuation,
    Operator,
    Bracket,
    Whitespace,
    Newline,
    Comment,
    Unknown,
}

#[derive(Debug, Clone)]
pub struct Token {
    pub kind: TokenKind,
    pub text: String,
    pub start: usize,
    pub end: usize,
    pub flags: TokenFlags,
}

/// The Lexer acts as the Front-End scanner for our prompt compiler.
pub struct Lexer<'a> {
    input: &'a str,
    chars: CharIndices<'a>,
    current_char: Option<(usize, char)>,
    prev_char: Option<char>,
}

impl<'a> Lexer<'a> {
    pub fn new(input: &'a str) -> Self {
        let mut chars = input.char_indices();
        let current_char = chars.next();
        Self {
            input,
            chars,
            current_char,
            prev_char: None,
        }
    }

    /// Consumes the entire input and returns a vector of tokens.
    pub fn lex_all(mut self) -> Vec<Token> {
        let mut tokens = Vec::new();
        while let Some(token) = self.next_token() {
            tokens.push(token);
        }
        tokens
    }

    fn advance(&mut self) {
        self.prev_char = self.current_char.map(|(_, c)| c);
        self.current_char = self.chars.next();
    }

    fn peek_char(&self) -> Option<char> {
        self.current_char.map(|(_, c)| c)
    }

    fn current_pos(&self) -> usize {
        self.current_char.map(|(i, _)| i).unwrap_or(self.input.len())
    }

    fn starts_with(&self, prefix: &str) -> bool {
        self.input[self.current_pos()..].starts_with(prefix)
    }

    pub fn next_token(&mut self) -> Option<Token> {
        let (start, c) = self.current_char?;

        if c == '\n' || c == '\r' {
            return Some(self.lex_newline(start));
        }
        if c.is_whitespace() {
            return Some(self.lex_whitespace(start));
        }

        if c == '`' {
            if self.starts_with("```") {
                return Some(self.lex_code_block(start));
            } else {
                return Some(self.lex_inline_code(start));
            }
        }

        if "()[]{}<>".contains(c) {
            self.advance();
            return Some(self.create_token(TokenKind::Bracket, start, self.current_pos(), TokenFlags::NONE));
        }

        if ".,;:!?".contains(c) {
            self.advance();
            return Some(self.create_token(TokenKind::Punctuation, start, self.current_pos(), TokenFlags::NONE));
        }

        if c == '/' {
            if self.starts_with("//") {
                return Some(self.lex_line_comment(start));
            } else if self.starts_with("/*") {
                return Some(self.lex_block_comment(start));
            }
        }

        if "+-*/=~|&^%\\".contains(c) {
            self.advance();
            return Some(self.create_token(TokenKind::Operator, start, self.current_pos(), TokenFlags::NONE));
        }

        if c == '"' {
            return Some(self.lex_string(start, c));
        }

        if c == '\'' {
            let prev_is_alnum = self.prev_char.map_or(false, |pc| pc.is_alphanumeric());
            if prev_is_alnum {
                self.advance();
                return Some(self.create_token(TokenKind::Punctuation, start, self.current_pos(), TokenFlags::NONE));
            }
            return Some(self.lex_string(start, c));
        }

        if c.is_ascii_digit() {
            return Some(self.lex_number(start));
        }

        if c.is_alphabetic() || c == '_' {
            if self.starts_with("http://") || self.starts_with("https://") {
                return Some(self.lex_url(start));
            }
            return Some(self.lex_word(start));
        }

        self.advance();
        Some(self.create_token(TokenKind::Unknown, start, self.current_pos(), TokenFlags::NONE))
    }

    fn lex_newline(&mut self, start: usize) -> Token {
        while let Some(c) = self.peek_char() {
            if c == '\n' || c == '\r' {
                self.advance();
            } else {
                break;
            }
        }
        self.create_token(TokenKind::Newline, start, self.current_pos(), TokenFlags::NONE)
    }

    fn lex_whitespace(&mut self, start: usize) -> Token {
        while let Some(c) = self.peek_char() {
            if c.is_whitespace() && c != '\n' && c != '\r' {
                self.advance();
            } else {
                break;
            }
        }
        self.create_token(TokenKind::Whitespace, start, self.current_pos(), TokenFlags::NONE)
    }

    fn lex_code_block(&mut self, start: usize) -> Token {
        for _ in 0..3 { self.advance(); }
        self.create_token(TokenKind::CodeBlock, start, self.current_pos(), TokenFlags::NONE)
    }

    fn lex_inline_code(&mut self, start: usize) -> Token {
        self.advance();
        self.create_token(TokenKind::InlineCode, start, self.current_pos(), TokenFlags::NONE)
    }

    fn lex_line_comment(&mut self, start: usize) -> Token {
        while let Some(c) = self.peek_char() {
            if c == '\n' || c == '\r' { break; }
            self.advance();
        }
        self.create_token(TokenKind::Comment, start, self.current_pos(), TokenFlags::NONE)
    }

    fn lex_block_comment(&mut self, start: usize) -> Token {
        self.advance(); // consume '/'
        self.advance(); // consume '*'
        let mut prev_star = false;
        while let Some(c) = self.peek_char() {
            self.advance();
            if prev_star && c == '/' {
                break;
            }
            prev_star = c == '*';
        }
        self.create_token(TokenKind::Comment, start, self.current_pos(), TokenFlags::NONE)
    }

    fn lex_string(&mut self, start: usize, quote_type: char) -> Token {
        self.advance();
        let mut escaped = false;

        while let Some(c) = self.peek_char() {
            self.advance();
            if escaped {
                escaped = false;
                continue;
            }
            if c == '\\' {
                escaped = true;
            } else if c == quote_type {
                break;
            }
        }
        self.create_token(TokenKind::String, start, self.current_pos(), TokenFlags::NONE)
    }

    fn lex_number(&mut self, start: usize) -> Token {
        let mut has_decimal = false;
        while let Some(c) = self.peek_char() {
            if c.is_ascii_digit() {
                self.advance();
            } else if c == '.' && !has_decimal {
                let mut temp_chars = self.chars.clone();
                if let Some((_, next_c)) = temp_chars.next() {
                    if next_c.is_ascii_digit() {
                        has_decimal = true;
                        self.advance();
                        continue;
                    }
                }
                break;
            } else {
                break;
            }
        }
        self.create_token(TokenKind::Number, start, self.current_pos(), TokenFlags::NONE)
    }

    fn lex_url(&mut self, start: usize) -> Token {
        while let Some(c) = self.peek_char() {
            if c.is_whitespace() || "()[]{}<>\"'".contains(c) {
                break;
            }
            self.advance();
        }
        self.create_token(TokenKind::Url, start, self.current_pos(), TokenFlags::NONE)
    }

    fn lex_word(&mut self, start: usize) -> Token {
        let mut flags = TokenFlags::NONE;
        if let Some(c) = self.input[start..].chars().next() {
            if c.is_uppercase() {
                flags.insert(TokenFlags::CAPITALIZED);
            }
        }
        let mut all_caps = true;
        let mut has_numbers = false;

        while let Some(c) = self.peek_char() {
            if c.is_alphanumeric() || c == '_' || c == '-' || c == '\'' {
                if c.is_numeric() {
                    has_numbers = true;
                }
                if c.is_lowercase() {
                    all_caps = false;
                }
                self.advance();
            } else {
                break;
            }
        }

        if all_caps && (self.current_pos() - start > 1) {
            flags.insert(TokenFlags::ALL_CAPS);
        }
        if has_numbers {
            flags.insert(TokenFlags::HAS_NUMBERS);
        }

        self.create_token(TokenKind::Word, start, self.current_pos(), flags)
    }

    fn create_token(&self, kind: TokenKind, start: usize, end: usize, flags: TokenFlags) -> Token {
        Token {
            kind,
            text: self.input[start..end].to_string(),
            start,
            end,
            flags,
        }
    }
}
