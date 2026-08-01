use std::io::{self, Read};
pub mod lexer;
fn main() {
    let mut input = String::new();

    io::stdin()
        .read_to_string(&mut input)
        .expect("Failed to read stdin");

    let lexer = lexer::Lexer::new(&input);
    let tokens = lexer.lex_all();

    for token in tokens {
        println!("{:?}", token);
    }
}
