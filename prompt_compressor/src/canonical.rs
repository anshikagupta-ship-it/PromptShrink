use aho_corasick::{AhoCorasick, MatchKind};
use once_cell::sync::Lazy;

pub static RULES: &[(&str, &str)] = &[

    // ==========================================================
    // Greetings
    // ==========================================================
    ("hello there", ""),
    ("hello everyone", ""),
    ("good morning", ""),
    ("good afternoon", ""),
    ("good evening", ""),
    ("hope you're doing well", ""),
    ("hope you are doing well", ""),
    ("hope you're having a great day", ""),
    ("hope you're having a good day", ""),
    ("hope this finds you well", ""),
    ("thanks in advance", ""),
    ("thank you in advance", ""),
    ("thank you very much", ""),
    ("thank you so much", ""),
    ("many thanks", ""),
    ("really appreciate it", ""),
    ("i would appreciate it", ""),
    ("i'd appreciate it", ""),
    ("i would really appreciate", ""),
    ("i'd really appreciate", ""),

    // ==========================================================
    // Introductions
    // ==========================================================
    ("i'm working on", ""),
    ("i am working on", ""),
    ("i've been working on", ""),
    ("i have been working on", ""),
    ("i'm building", ""),
    ("i am building", ""),
    ("i'm creating", ""),
    ("i am creating", ""),
    ("i'm developing", ""),
    ("i am developing", ""),
    ("i'm implementing", ""),
    ("i am implementing", ""),
    ("i'm trying to", ""),
    ("i am trying to", ""),
    ("i've been trying to", ""),
    ("i have been trying to", ""),
    ("i'm attempting to", ""),
    ("i am attempting to", ""),
    ("currently i'm", ""),
    ("currently i am", ""),
    ("right now i'm", ""),
    ("at the moment i'm", ""),
    ("for the past few days", ""),
    ("for the last few days", ""),
    ("for the past few hours", ""),
    ("after spending hours", ""),
    ("after spending days", ""),

    // ==========================================================
    // Boilerplate
    // ==========================================================
    ("the problem is that", ""),
    ("the issue is that", ""),
    ("the main issue is", ""),
    ("what's happening is", ""),
    ("what is happening is", ""),
    ("it seems that", ""),
    ("it appears that", ""),
    ("i noticed that", ""),
    ("i realized that", ""),
    ("i've noticed that", ""),
    ("i have noticed that", ""),
    ("the thing is", ""),
    ("basically", ""),
    ("to be honest", ""),
    ("honestly speaking", ""),
    ("to be completely honest", ""),
    ("in my opinion", ""),
    ("as you can see", ""),
    ("as shown below", ""),
    ("as shown above", ""),

    // ==========================================================
    // Headers
    // ==========================================================
    ("here's the parser", "Parser:"),
    ("here is the parser", "Parser:"),
    ("here's my parser", "Parser:"),
    ("here is my parser", "Parser:"),

    ("here's the code", "Code:"),
    ("here is the code", "Code:"),
    ("here's my code", "Code:"),
    ("here is my code", "Code:"),

    ("here's the implementation", "Code:"),
    ("here is the implementation", "Code:"),

    ("here's the function", "Function:"),
    ("here is the function", "Function:"),

    ("here's the configuration", "Config:"),
    ("here is the configuration", "Config:"),
    ("configuration file", "Config"),
    ("the configuration file", "Config"),
    ("configuration looks like", "Config:"),

    ("here's the output", "Output:"),
    ("here is the output", "Output:"),
    ("the output is", "Output:"),
    ("output looks like", "Output:"),

    ("here's the error", "Error:"),
    ("here is the error", "Error:"),
    ("error message", "Error:"),

    ("the panic is", "Panic:"),
    ("the panic looks like", "Panic:"),
    ("panic looks like", "Panic:"),

    ("stack trace", "Stacktrace:"),
    ("stacktrace", "Stacktrace:"),
    ("back trace", "Backtrace:"),

    ("the logs look like this", "Logs:"),
    ("the logs are", "Logs:"),
    ("here are the logs", "Logs:"),
    ("the logs show", "Logs:"),

    ("the repository is", "Repo:"),
    ("repository link", "Repo:"),
    ("github repository", "Repo:"),

    // ==========================================================
    // Execution
    // ==========================================================
    ("i'm running", "Run:"),
    ("i am running", "Run:"),
    ("when i run", "Run:"),
    ("after running", "Run:"),
    ("running the application", "Run:"),
    ("running the project", "Run:"),
    ("executing the application", "Run:"),
    ("executing the program", "Run:"),
    ("when executing", "Run:"),

    // ==========================================================
    // Attempts
    // ==========================================================
    ("i have already tried", "Tried:"),
    ("i've already tried", "Tried:"),
    ("i also tried", "Tried:"),
    ("i tried", "Tried:"),
    ("i attempted", "Tried:"),
    ("none of them worked", ""),
    ("none of this worked", ""),
    ("nothing worked", ""),
    ("without success", ""),

    // ==========================================================
    // Requests
    // ==========================================================
    ("what i'm hoping you can do is", "Tasks:"),
    ("what i'm hoping", "Tasks:"),
    ("could you please", ""),
    ("can you please", ""),
    ("would you please", ""),
    ("if possible", ""),
    ("if you can", ""),
    ("would it be possible to", ""),
    ("can you help me", ""),
    ("help me understand", "Explain"),
    ("please explain", "Explain"),
    ("could you explain", "Explain"),
    ("can you explain", "Explain"),
    ("walk me through", "Explain"),
    ("step by step", "Step-by-step"),

    // ==========================================================
    // Closings
    // ==========================================================
    ("i'm still learning", ""),
    ("i am still learning", ""),
    ("because i'm still learning", ""),
    ("because i am still learning", ""),
    ("i don't want a complete rewrite", "No rewrite."),
    ("avoid rewriting the whole project", "No rewrite."),
    ("preserve the current architecture", "Preserve architecture."),
    ("keep the current architecture", "Preserve architecture."),
    ("without changing the architecture", "Preserve architecture."),
];

pub static AC: Lazy<AhoCorasick> = Lazy::new(|| {
    let patterns: Vec<&str> = RULES.iter().map(|(a, _)| *a).collect();

    AhoCorasick::builder()
        .ascii_case_insensitive(true)
        .match_kind(MatchKind::LeftmostLongest)
        .build(patterns)
        .unwrap()
});

pub fn canonicalize(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut last = 0;

    for mat in AC.find_iter(text) {
        out.push_str(&text[last..mat.start()]);
        out.push_str(RULES[mat.pattern().as_usize()].1);
        last = mat.end();
    }

    out.push_str(&text[last..]);
    out
}
