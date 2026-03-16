# Download Almadar CLI

The Almadar CLI (`almadar`) is the command-line tool for validating, compiling, and working with Almadar schemas.

## Quick Install

### npm (Recommended)

```bash
npm install -g @almadar/cli
```

### Homebrew (macOS/Linux)

```bash
brew install almadar/tap/almadar
```

### Cargo (Rust developers)

```bash
cargo install almadar-cli
```

## Platform-Specific Downloads

### Linux

| Architecture | Format | Download |
|-------------|--------|----------|
| x86_64 | tar.gz | [almadar-linux-x86_64.tar.gz](#) |
| x86_64 | deb | [almadar_x86_64.deb](#) |
| x86_64 | rpm | [almadar-x86_64.rpm](#) |
| ARM64 | tar.gz | [almadar-linux-aarch64.tar.gz](#) |

**Installation (tar.gz):**

```bash
tar -xzf almadar-linux-x86_64.tar.gz
sudo mv almadar /usr/local/bin/
```

**Installation (deb):**

```bash
sudo dpkg -i almadar_x86_64.deb
```

### macOS

| Architecture | Format | Download |
|-------------|--------|----------|
| Intel (x86_64) | tar.gz | [almadar-macos-x86_64.tar.gz](#) |
| Apple Silicon (ARM64) | tar.gz | [almadar-macos-aarch64.tar.gz](#) |
| Universal | pkg | [almadar-macos.pkg](#) |

**Installation (tar.gz):**

```bash
tar -xzf almadar-macos-aarch64.tar.gz
sudo mv almadar /usr/local/bin/
```

### Windows

| Architecture | Format | Download |
|-------------|--------|----------|
| x86_64 | zip | [almadar-windows-x86_64.zip](#) |
| x86_64 | msi | [almadar-windows-x86_64.msi](#) |

**Installation (winget):**

```powershell
winget install Almadar.CLI
```

**Installation (zip):**

1. Extract `almadar-windows-x86_64.zip`
2. Add the extracted folder to your PATH
3. Restart your terminal

## Verify Installation

```bash
almadar --version
# Almadar CLI v1.0.0

almadar --help
# Almadar - The Physics of Software
# 
# USAGE:
#     almadar <COMMAND>
# 
# COMMANDS:
#     validate   Validate an Almadar schema
#     compile    Compile schema to target shell
#     format     Format an Almadar schema
#     dev        Start development server
#     test       Run state machine tests
#     new        Create a new project
#     help       Print this message
```

## Basic Usage

### Validate a Schema

```bash
almadar validate my-app.orb
# ✓ Schema is valid
# ✓ 3 orbitals, 5 traits, 8 entities
```

### Compile to TypeScript

```bash
almadar compile my-app.orb --shell typescript --output ./generated
# ✓ Generated 24 files
# ✓ Output: ./generated
```

### Start Development Server

```bash
almadar dev my-app.orb
# Starting Almadar dev server...
# ✓ Schema loaded: my-app.orb
# ✓ Server: http://localhost:3000
# ✓ Client: http://localhost:5173
# 
# Watching for changes...
```

### Run Tests

```bash
almadar test my-app.orb
# Running state machine tests...
# ✓ TaskLifecycle: 12 transitions tested
# ✓ UserAuth: 8 transitions tested
# ✓ All guards evaluated
# 
# Tests: 20 passed, 0 failed
```

### Create New Project

```bash
almadar new my-app
# ✓ Created my-app/
# ✓ Created my-app/schema.orb
# ✓ Created my-app/almadar.config.json
# 
# Get started:
#   cd my-app
#   almadar dev
```

## Configuration

Create an `almadar.config.json` in your project root:

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
almadar compile
# Uses settings from almadar.config.json
```

## Locale Support

Almadar supports multiple languages for error messages and operator aliases:

```bash
# English (default)
almadar validate schema.orb --locale en

# Arabic
almadar validate schema.orb --locale ar
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
# Check where almadar is installed
which almadar

# Add to PATH if needed (add to ~/.bashrc or ~/.zshrc)
export PATH="$PATH:/path/to/almadar"
```

### Permission Denied (Linux/macOS)

```bash
chmod +x /usr/local/bin/almadar
```

### Windows Defender Warning

The almadar.exe binary is signed but may trigger Windows Defender on first run. Click "More info" → "Run anyway" or add an exception.

---

*Need help? Join our [Discord](https://discord.gg/almadar) or open an [issue](https://github.com/almadar-io/almadar/issues).*
