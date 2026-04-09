# Orb CLI

The command-line interface for Orb.

## Installation

```bash
# curl installer (recommended)
curl -fsSL https://orb.almadar.io/install.sh | sh

# npm
npm install -g @almadar/orb

# Or use npx
npx @almadar/orb validate app.orb

# Homebrew (macOS/Linux)
brew install almadar-io/tap/orb

# Windows PowerShell
irm https://orb.almadar.io/install.ps1 | iex
```

## Commands

| Command | Description |
|---------|-------------|
| `orbital new <name>` | Create a new project |
| `orbital validate <file>` | Validate an .orb file (0 errors, 0 warnings required) |
| `orbital compile <file>` | Compile to target shell |
| `orbital emit-orb <file>` | Lower .lolo source to .orb JSON (stdout) |
| `orbital dev <file>` | Start development server |
| `orbital test <file>` | Run state machine tests |

## Usage

```bash
# Create a new project
orbital new my-app
cd my-app

# Write your orbital in .lolo syntax
cat app.orb
```

```lolo
orbital TaskApp {
  entity Task [persistent: tasks] {
    id     : string!
    title  : string!
    status : string = "pending"
  }

  trait TaskBrowser -> Task [interaction] {
    state browsing {
      INIT -> browsing
        (fetch Task)
        (render-ui main { type: "entity-table", entity: "Task", fields: ["title", "status"] })
    }
  }

  page "/tasks" -> TaskBrowser
}
```

```bash
# Validate (must produce 0 errors, 0 warnings)
orbital validate app.orb

# Compile to TypeScript shell
orbital compile app.orb --shell typescript --output ./app

# Start dev server
orbital dev app.orb
```

## Project Structure

When you run `orbital new my-app`, you get:

```
my-app/
├── app.orb            # Your orbital (write in .lolo syntax)
├── package.json
└── README.md
```

## Documentation

See [orb.almadar.io/docs](https://orb.almadar.io/docs/getting-started/introduction) for full documentation.

## License

BSL 1.1 — See [LICENSE](../LICENSE) for details.
