# Migrating Backend from Rust CLI to Python CLI

This guide explains how to replace the Rust CLI with the Python CLI while keeping the frontend and API unchanged.

---

# Current Architecture

```
Frontend
    │
    ▼
Backend (Node/Express)
    │
    ▼
Rust CLI
    │
    ▼
Output JSON
```

Current invocation:

```bash
./promptcompress <input_file> <output_file>
```

---

# New Architecture

```
Frontend
    │
    ▼
Backend (Node/Express)
    │
    ▼
Python CLI
    │
    ▼
main.py
    │
    ▼
Output JSON
```

The frontend does **not** need any changes.

---

# Python CLI Interface

The Python CLI accepts exactly **two positional arguments**.

```
python3 main.py <input_file> <output_file>
```

Windows:

```
python main.py <input_file> <output_file>
```

Example:

```
python3 main.py uploads/input.txt uploads/output.json
```

---

# Backend Changes

## Old Rust Invocation

```javascript
const { spawn } = require("child_process");

const child = spawn("./promptcompress", [
    inputFile,
    outputFile
]);
```

---

## New Python Invocation

Linux/macOS

```javascript
const { spawn } = require("child_process");

const child = spawn("python3", [
    "python/main.py",
    inputFile,
    outputFile
]);
```

Windows

```javascript
const child = spawn("python", [
    "python/main.py",
    inputFile,
    outputFile
]);
```

---

# Cross Platform Version

Instead of hardcoding the interpreter, use an environment variable.

```
PYTHON_EXECUTABLE=python3
```

Windows

```
PYTHON_EXECUTABLE=python
```

Backend:

```javascript
const { spawn } = require("child_process");

const python =
    process.env.PYTHON_EXECUTABLE || "python3";

const child = spawn(python, [
    "python/main.py",
    inputFile,
    outputFile
]);
```

---

# Waiting for Completion

Since the Python CLI writes directly to the output file, the backend only needs to wait until the process exits.

```javascript
child.on("close", (code) => {

    if (code !== 0) {
        return res.status(500).json({
            error: "Compression failed."
        });
    }

    // Read output.json here
});
```

---

# Python CLI Responsibilities

The CLI should:

1. Read the input file.
2. Compress the prompt.
3. Write the JSON result to the output file.
4. Exit with status code 0.

Example:

```
Input
↓

Canonicalization

↓

Compression

↓

Grouping

↓

Graph Reduction

↓

JSON Serialization

↓

Write output.json
```

---

# Output Format

Example `output.json`

```json
{
    "prompt": "Compressed prompt..."
}
```

or

```json
{
    "prompt": "Compressed prompt...",
    "stats": {
        "original_tokens": 681,
        "compressed_tokens": 400,
        "compression_ratio": 0.412
    }
}
```

---

# Error Handling

If compression fails:

- Print the error to **stderr**.
- Exit with a non-zero exit code.

Example:

```python
import traceback
import sys

try:
    ...
except Exception:
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)
```

The backend should only check the exit code.

---

# Final Execution Flow

```
Frontend
        │
        ▼
Backend
        │
spawn("python3")
        │
        ▼
main.py
        │
Read input.txt
        │
Canonicalize
        │
Compress
        │
Group Information
        │
Serialize
        │
Write output.json
        │
Exit(0)
        │
Backend reads output.json
        │
Return response to frontend
```

---

# Command Summary

Linux/macOS

```bash
python3 main.py <input_file> <output_file>
```

Windows

```bash
python main.py <input_file> <output_file>
```

Example

```bash
python3 main.py ./uploads/input.txt ./uploads/output.json
```
