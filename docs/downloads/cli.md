# Download Orb CLI

The Orb CLI (`orb`) is the command-line tool for validating, compiling, and working with .orb schemas.

## Quick Install

### Install Script (Recommended)

```bash
curl -fsSL https://orb.almadar.io/install.sh | sh
```

### npm

```bash
npm install -g @almadar/orb
```

### Homebrew (macOS/Linux)

```bash
brew install almadar/tap/orb
```

### Cargo (Rust developers)

```bash
cargo install orb-cli
```

## Platform-Specific Downloads

### Linux

| Architecture | Format | Download |
|-------------|--------|----------|
| x86_64 | tar.gz | [orb-linux-x86_64.tar.gz](#) |
| x86_64 | deb | [orb_x86_64.deb](#) |
| x86_64 | rpm | [orb-x86_64.rpm](#) |
| ARM64 | tar.gz | [orb-linux-aarch64.tar.gz](#) |

**Installation (tar.gz):**

```bash
tar -xzf orb-linux-x86_64.tar.gz
sudo mv orb /usr/local/bin/
```

**Installation (deb):**

```bash
sudo dpkg -i orb_x86_64.deb
```

### macOS

| Architecture | Format | Download |
|-------------|--------|----------|
| Intel (x86_64) | tar.gz | [orb-macos-x86_64.tar.gz](#) |
| Apple Silicon (ARM64) | tar.gz | [orb-macos-aarch64.tar.gz](#) |
| Universal | pkg | [orb-macos.pkg](#) |

**Installation (tar.gz):**

```bash
tar -xzf orb-macos-aarch64.tar.gz
sudo mv orb /usr/local/bin/
```

### Windows

| Architecture | Format | Download |
|-------------|--------|----------|
| x86_64 | zip | [orb-windows-x86_64.zip](#) |
| x86_64 | msi | [orb-windows-x86_64.msi](#) |

**Installation (winget):**

```powershell
winget install Almadar.Orb
```

**Installation (zip):**

1. Extract `orb-windows-x86_64.zip`
2. Add the extracted folder to your PATH
3. Restart your terminal

## Verify Installation

```bash
orb --version
# Orb CLI v1.0.0

orb --help
# Orb - The Physics of Software
#
# USAGE:
#     orb <COMMAND>
#
# COMMANDS:
#     validate   Validate an .orb schema
#     compile    Compile schema to target shell
#     serve      Compile and serve (zero-install)
#     format     Format an .orb schema
#     dev        Start development server
#     test       Run state machine tests
#     new        Create a new project
#     help       Print this message
```

## Basic Usage

### Validate a Schema

```bash
orb validate my-app.orb
# ✓ Schema is valid
# ✓ 3 orbitals, 5 traits, 8 entities
```

### Compile to TypeScript

```bash
orb compile my-app.orb --shell typescript --output ./generated
# ✓ Generated 24 files
# ✓ Output: ./generated
```

By default, the compiled app uses an Express backend. To generate a Hono backend instead, pass the `--server hono` flag:

```bash
orb compile my-app.orb --shell typescript --server hono --output ./generated
```

### Serve (Zero-Install)

Compile and serve a full-stack app from a `.orb` file with zero dependencies. Compiles with a Hono backend, builds the client with Vite, and serves everything on a single port using the bundled Bun runtime.

```bash
orb serve my-app.orb              # Serve on port 3030
orb serve my-app.orb --port 8080  # Custom port
orb serve my-app.orb --open       # Open browser after start
orb serve my-app.orb --no-build   # Skip rebuild, serve existing
```

No Node.js, no package manager, no installation steps. The `orb` binary includes Bun and the Hono shell template. One command from `.orb` to running app.

### Start Development Server

```bash
orb dev my-app.orb
# Starting Orb dev server...
# ✓ Schema loaded: my-app.orb
# ✓ Server: http://localhost:3000
# ✓ Client: http://localhost:5173
#
# Watching for changes...
```

### Run Tests

```bash
orb test my-app.orb
# Running state machine tests...
# ✓ TaskLifecycle: 12 transitions tested
# ✓ UserAuth: 8 transitions tested
# ✓ All guards evaluated
#
# Tests: 20 passed, 0 failed
```

### Create New Project

```bash
orb new my-app
# ✓ Created my-app/
# ✓ Created my-app/schema.orb
# ✓ Created my-app/orb.config.json
#
# Get started:
#   cd my-app
#   orb dev
```

## Configuration

Create an `orb.config.json` in your project root:

```json
{
  "$schema": "https://almadar.io/schemas/config.json",
  "schema": "./schema/my-app.orb",
  "output": "./src/generated",
  "shell": "typescript",
  "locale": "en",
  "features": {
    "hotReload": true,
    "generateTypes": true,
    "generateDocs": true
  }
}
```

Then simply run:

```bash
orb compile
# Uses settings from orb.config.json
```

## Locale Support

Orb supports multiple languages for error messages and operator aliases:

```bash
# English (default)
orb validate schema.orb --locale en

# Arabic
orb validate schema.orb --locale ar
# ✓ المخطط صالح
# ✓ ٣ مدارات، ٥ سمات، ٨ كيانات
```

## Next Steps

- [Build a Task Manager](/docs/tutorials/beginner/task-manager) - Build something!
- [Operator Reference](/docs/reference/operators/) - Complete operator reference
- [Guards & Business Rules](/docs/tutorials/intermediate/guards) - S-expressions in practice

---

## Troubleshooting

### "Command not found"

Ensure the binary is in your PATH:

```bash
# Check where orb is installed
which orb

# Add to PATH if needed (add to ~/.bashrc or ~/.zshrc)
export PATH="$PATH:/path/to/orb"
```

### Permission Denied (Linux/macOS)

```bash
chmod +x /usr/local/bin/orb
```

### Windows Defender Warning

The orb.exe binary is signed but may trigger Windows Defender on first run. Click "More info" → "Run anyway" or add an exception.

---

*Need help? Join our [Discord](https://discord.gg/almadar) or open an [issue](https://github.com/almadar-io/orb/issues).*
