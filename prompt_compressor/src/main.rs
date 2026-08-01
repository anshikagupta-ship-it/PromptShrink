use clap::Parser;
use serde::Serialize;
use std::{
    fs,
    path::PathBuf,
    process,
};


#[derive(Parser, Debug)]
#[command(
    name = "prompt_compressor",
    version,
    about = "Prompt Compressor CLI",
    long_about = None,
)]
struct Cli {
    /// Input prompt file (.txt/.md)
    input: PathBuf,

    /// Output json file
    output: PathBuf,
}

#[derive(Serialize)]
struct Output {
    prompt: String,
}

fn main() {
    let cli = Cli::parse();


    let input = fs::read_to_string(&cli.input)
        .unwrap_or_else(|e| {
            eprintln!("Failed to read '{}': {}", cli.input.display(), e);
            process::exit(1);
        });

    let doc = prompt_compressor::extractor::Document::analyze(&input);

    let (compressed_prompt, _) = prompt_compressor::compressor::compress_prompt(&doc);

    let output = Output {
        prompt: compressed_prompt,
    };

    let json = serde_json::to_string_pretty(&output)
        .unwrap_or_else(|e| {
            eprintln!("Failed to serialize JSON: {}", e);
            process::exit(1);
        });

    fs::write(&cli.output, json)
        .unwrap_or_else(|e| {
            eprintln!("Failed to write '{}': {}", cli.output.display(), e);
            process::exit(1);
        });
}
