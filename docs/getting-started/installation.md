---
id: installation
title: Installation
sidebar_label: Installation
---

# Installation

The Orb CLI (`orb`) is a native binary compiled from Rust. It runs on Linux, macOS, and Windows without any runtime dependencies. The generated applications require Node.js, but the compiler itself does not.

## System Requirements

| Requirement | Purpose |
|-------------|---------|
| **Any OS** (Linux, macOS, Windows) | The `orb` binary is available for all major platforms |
| **Node.js 18+** | Required for running generated apps (`orb compile` outputs TypeScript/React projects) |
| **npm** or **pnpm** | Package manager for installing generated app dependencies |

The `orb` binary itself has zero runtime dependencies. Node.js is only needed when you compile a `.orb` program and want to run the generated application.

## Install via Script (macOS / Linux)

The fastest way to install:

```bash
curl -fsSL https://orb.almadar.io/install.sh | sh
```

This script:
1. Detects your OS and CPU architecture
2. Downloads the correct native binary from GitHub releases
3. Places it in `~/.orb/bin/`
4. Adds `~/.orb/bin` to your `PATH` (updating your shell profile)

After installation, open a new terminal (or `source` your profile) and verify:

```bash
orb --version
```

## Install via npm (Any Platform)

If you already have Node.js installed:

```bash
npm install -g @almadar/orb
```

The npm package includes a `postinstall` script that downloads the correct native binary for your platform. The package itself is a thin wrapper: all compilation work is done by the native binary, not by Node.js.

This method works on all platforms including Windows, where the shell script is not available.

## Install via Homebrew (macOS)

```bash
brew tap almadar-io/tap
brew install orb
```

Homebrew handles updates automatically with `brew upgrade orb`.

## Manual Download

Download a prebuilt binary directly from the [GitHub Releases page](https://github.com/almadar-io/orb/releases).

| Platform | Architecture | Asset Name |
|----------|-------------|------------|
| Linux | x86_64 | `orb-linux-x64` |
| Linux | ARM64 | `orb-linux-arm64` |
| macOS | Intel | `orb-darwin-x64` |
| macOS | Apple Silicon | `orb-darwin-arm64` |
| Windows | x86_64 | `orb-windows-x64.exe` |

After downloading:

```bash
# macOS / Linux
chmod +x orb-*
mv orb-* /usr/local/bin/orb

# Verify
orb --version
```

On Windows, place the `.exe` in a directory that is on your `PATH`, or add its location to `PATH` via System Settings.

## Verify Installation

Run the following to confirm everything is working:

```bash
orb --version
```

You should see output like `orb 0.x.y` with the version number.

To confirm the compiler can generate code, you can also run:

```bash
orb --help
```

This prints all available commands: `validate`, `compile`, `dev`, `format`, and others.

## About the Shell Template

When you run `orb compile`, the compiler generates a full-stack TypeScript application (React frontend, Express backend, shared types). This generated project needs Node.js and npm to install dependencies and run.

The relationship:

```
your-app.orb          (source: your Orb program)
      |
  orb compile          (native binary, no Node.js needed)
      |
  my-app/              (generated TypeScript project)
    packages/client/   (React + Vite, needs Node.js)
    packages/server/   (Express, needs Node.js)
    packages/shared/   (shared types)
```

The compiler is a native binary. The output is a Node.js project. These are separate concerns: you can compile on a machine without Node.js, then deploy the generated code elsewhere.

## Next Steps

With the CLI installed, move on to the [Quickstart](./quickstart.md) to build and run your first Orb application in under 5 minutes.
