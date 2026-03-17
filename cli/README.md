# Almadar CLI

The command-line interface for Almadar.

## Installation

```bash
# npm (recommended)
npm install -g @almadar/cli

# Or use npx
npx @almadar/cli validate schema.orb

# Homebrew (macOS/Linux)
brew install almadar/tap/almadar

# Cargo (Rust developers)
cargo install almadar-cli

# Windows
winget install Almadar.CLI
```

## Commands

| Command | Description |
|---------|-------------|
| `almadar new <name>` | Create a new project with @almadar/* dependencies |
| `almadar validate <file>` | Validate a schema |
| `almadar compile <file>` | Compile to target shell |
| `almadar dev <file>` | Start development server |
| `almadar test <file>` | Run state machine tests |
| `almadar format <file>` | Format a schema |

## Usage

```bash
# Create a new project (sets up package.json with @almadar/* dependencies)
almadar new my-app
cd my-app
npm install

# Validate a schema
almadar validate schema.orb

# Compile to TypeScript
almadar compile schema.orb --shell typescript --output ./generated

# Start dev server
almadar dev schema.orb
```

## Project Structure

When you run `almadar new my-app`, you get:

```
my-app/
├── package.json       # Has @almadar/* dependencies
├── schema.orb         # Your schema file
└── README.md
```

After `npm install`, all @almadar/* packages are available:
- `@almadar/core` - Core types
- `@almadar/std` - Standard library operators
- `@almadar/patterns` - UI patterns
- `@almadar/validation` - Schema validation

## Documentation

See [CLI Reference](https://almadar.io/docs/en/reference/cli) for full documentation.

## License

BSL 1.1 - See [LICENSE](../LICENSE) for details.
