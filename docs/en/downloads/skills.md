# Orb Skills

Enhance your development workflow with AI-powered skills for Orb schema generation.

## almadar-orbitals

The primary skill for generating Orb schemas from natural language descriptions.

### What It Does

- Generates complete OrbitalSchema (.orb) files from descriptions
- Creates entities with proper field types and relations
- Designs state machines with guards and effects
- Produces UI patterns and page layouts
- Follows Orb best practices

### Installation

```bash
# Via Orb CLI
orb skill install almadar-orbitals

# Or manual download
curl -O https://almadar.io/skills/almadar-orbitals.zip
unzip almadar-orbitals.zip -d ~/.almadar/skills/
```

### Usage

Once installed, invoke the skill in your session:

```
/almadar-orbitals Build a task management system with user authentication,
                  task assignment, and approval workflows
```

The skill will generate:

```json
{
  "name": "TaskManagementSystem",
  "orbitals": [
    {
      "name": "Users",
      "entity": { ... },
      "traits": [{ "ref": "UserAuth" }, { "ref": "UserProfile" }]
    },
    {
      "name": "Tasks",
      "entity": { ... },
      "traits": [{ "ref": "TaskLifecycle" }, { "ref": "TaskAssignment" }]
    },
    {
      "name": "Approvals",
      "entity": { ... },
      "traits": [{ "ref": "ApprovalWorkflow" }]
    }
  ]
}
```

### Included Content

| File | Description |
|------|-------------|
| `SKILL.md` | Skill instructions and capabilities |
| `examples/` | Reference schemas for common patterns |
| `validation/` | Error codes and validation rules |
| `patterns/` | UI pattern reference |
| `traits/` | Standard trait library reference |

### Best Practices

1. **Be specific** - More detail = better schemas
2. **Describe workflows** - "Users can submit → approve → publish"
3. **Mention roles** - "Admins can delete, users can only view"
4. **Specify persistence** - "Tasks are stored, game state is runtime"

### Example Prompts

**E-Commerce:**
```
Build an e-commerce platform with:
- Product catalog with categories
- Shopping cart (runtime state)
- Checkout flow with payment integration
- Order management with status tracking
- Admin dashboard for inventory
```

**SaaS Dashboard:**
```
Create a SaaS analytics dashboard:
- Multi-tenant with organizations
- User roles: admin, analyst, viewer
- Dashboard widgets (charts, tables)
- Report generation and scheduling
- Data source connections
```

**Game:**
```
Build a 2D platformer game with:
- Player with health, lives, score
- Enemies with patrol AI
- Collectibles and power-ups
- Level progression
- Leaderboard
```

---

## Skill Versions

| Version | Release Date | Notes |
|---------|--------------|-------|
| 1.0.0 | Jan 2026 | Initial release |

---

## Pro Skills (Paid)

### almadar-design

Advanced UI/UX design capabilities:

- Design system generation
- Component customization
- Responsive layouts
- Animation specifications

```bash
# Requires Pro subscription
orb skill install almadar-design --pro
```

### almadar-fixing

Automatic error resolution:

- Analyzes validation errors
- Suggests fixes with explanations
- Applies corrections automatically
- Learns from your patterns

```bash
# Requires Pro subscription
orb skill install almadar-fixing --pro
```

---

## Creating Custom Skills

Want to create your own Orb skills? Contact the team at support@almadar.io or visit the [community discussions](https://github.com/almadar-io/almadar/discussions) for guidance.

---

*Need help? Contact support@almadar.io*
