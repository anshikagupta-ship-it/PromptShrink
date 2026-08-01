use std::io::Read;

use prompt_compressor::extractor::Document;


fn main() {
    let mut input = String::new();
    std::io::stdin().read_to_string(&mut input).expect("Input Failed");
    let doc = Document::analyze(&input);
    println!("blocks found: {}", doc.blocks().len());
    for (i, b) in doc.blocks().iter().enumerate() {
        println!("  block {i} (score={:.2}, context={:?}):\n{}", b.score, b.context, doc.block_text(i));
    }
    println!();

    let (compressed_text, stats) = prompt_compressor::compressor::compress_prompt(&doc);

    println!("=== ADAPTIVE COMPRESSION REPORT ===");
    println!("Original Tokens:      {}", stats.original_tokens);
    println!("Removable Tokens:     {} (Est.)", stats.removable_tokens);
    println!("Compressed Tokens:    {}", stats.compressed_tokens);
    println!("Target Compressible:  {:.1}%", stats.theoretical_max_ratio * 100.0);
    println!("Actual Compression:   {:.1}%", stats.compression_ratio * 100.0);

    let efficiency = if stats.removable_tokens > 0 {
        let removed = stats.original_tokens.saturating_sub(stats.compressed_tokens);
        (removed as f32 / stats.removable_tokens as f32) * 100.0
    } else {
        100.0
    };

    println!("Pipeline Efficiency:  {:.1}% of removable content purged.\n", efficiency.clamp(0.0, 100.0));

    println!("=== COMPRESSED PROMPT ===");
    println!("{}", compressed_text);

}

