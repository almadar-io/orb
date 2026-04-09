# @almadar/orb

Orb CLI — compile .orb programs to full-stack applications.

## Installation

```bash
npm install -g @almadar/orb
```

Or use the curl installer:

```bash
curl -fsSL https://orb.almadar.io/install.sh | sh
```

## Usage

```bash
# Validate an .orb file (0 errors, 0 warnings required)
orbital validate app.orb

# Lower .lolo syntax to .orb JSON IR
orbital emit-orb app.orb

# Compile to TypeScript shell
orbital compile app.orb --shell typescript

# Start development server
orbital dev app.orb
```

## Quick Example

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
      CREATE -> creating
        (render-ui modal { type: "modal", isOpen: true, title: "New Task",
          children: [{ type: "form-section", entity: "Task", fields: ["title", "status"], mode: "create" }] })
    }
    state creating {
      SAVE -> browsing
        (persist create Task @payload.data)
        (render-ui modal null)
      CANCEL -> browsing
        (render-ui modal null)
    }
  }

  page "/tasks" -> TaskBrowser
}
```

## Commands

| Command | Description |
|---------|-------------|
| `orbital validate <file>` | Validate an .orb file |
| `orbital emit-orb <file>` | Lower .lolo to .orb JSON (stdout) |
| `orbital compile <file>` | Compile to generated code |
| `orbital dev <file>` | Start development server |
| `orbital new <name>` | Create a new project |

## Documentation

- [Getting Started](https://orb.almadar.io/docs/getting-started/introduction)
- [CLI Reference](https://orb.almadar.io/docs/reference/cli)
- [Language Reference](https://orb.almadar.io/docs/core-concepts/entities)

## License

BSL 1.1
