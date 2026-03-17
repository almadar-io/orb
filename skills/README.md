# Almadar Skills

Claude Code skills for generating Almadar applications.

## Available Skills

| Skill | Description |
|-------|-------------|
| `almadar-orbitals` | Generate Almadar schemas using the Orbitals composition model |

## Installation

### Option 1: Global Installation (Recommended)

Copy skills to your Claude Code skills directory:

```bash
# Create skills directory if it doesn't exist
mkdir -p ~/.claude/skills

# Copy almadar skills
cp -r skills/almadar-orbitals ~/.claude/skills/
```

### Option 2: Project-Local Installation

Copy skills to your project's `.claude/skills` directory:

```bash
mkdir -p .claude/skills
cp -r skills/almadar-orbitals .claude/skills/
```

## Usage

Once installed, Claude Code will automatically use these skills when generating Almadar applications.

### Example Prompts

- "Create a task management app with Almadar"
- "Generate an e-commerce schema with products and orders"
- "Build a blog platform with posts and comments"

## Skill Structure

Each skill contains a `SKILL.md` file with:

- **Frontmatter**: Skill metadata (name, description, allowed tools)
- **Architecture Guide**: How Orbitals work
- **Type Reference**: Available patterns, bindings, operators
- **Behavior Templates**: Standard state machines to copy
- **Examples**: Working code patterns

## License

BSL 1.1 - See [LICENSE](./LICENSE)
