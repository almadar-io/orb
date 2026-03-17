# @almadar/cli

Almadar CLI - Compile Almadar schemas to full-stack applications.

## Installation

```bash
npm install -g @almadar/cli
```

## Usage

```bash
# Validate a schema
almadar validate schema.orb

# Compile to TypeScript (React + Express)
almadar compile schema.orb --shell typescript

# Compile to Python (FastAPI + PyTorch)
almadar compile schema.orb --shell python

# Start development server
almadar dev schema.orb
```

## Commands

| Command | Description |
|---------|-------------|
| `almadar validate <file>` | Validate an Almadar schema |
| `almadar parse <file>` | Parse and display schema information |
| `almadar compile <file>` | Compile schema to generated code |
| `almadar serve <file>` | Start the Almadar server runtime |
| `almadar gui <file>` | Start the Almadar desktop GUI |
| `almadar dev <file>` | Start both server and client (dev mode) |

## Documentation

- [Getting Started](https://almadar.io/docs/en/getting-started)
- [CLI Reference](https://almadar.io/docs/en/reference/cli)

## License

MIT
