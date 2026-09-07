# Contributing to Orb

Welcome to the Almadar community! We're excited to have you contribute.

## Ways to Contribute

### Documentation

- Fix typos and improve clarity
- Translate content to Arabic or other languages
- Write tutorials and guides
- Add examples and use cases

### Standard Library

- Propose new operators
- Improve existing implementations
- Add tests and benchmarks

### Patterns & Traits

- Submit new UI patterns
- Create reusable traits
- Document best practices

### Community

- Answer questions on Discord
- Write blog posts
- Create video tutorials
- Give talks at meetups

## Contribution Process

### 1. For Documentation

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/almadar.git

# Create a branch
git checkout -b docs/improve-getting-started

# Make your changes
# ...

# Submit a pull request
```

### 2. For Code (Std Library, Patterns)

1. **Open an RFC** - For significant changes, start a discussion
2. **Get feedback** - Wait for community input
3. **Implement** - Once approved, submit a PR
4. **Review** - Address feedback from maintainers
5. **Merge** - Celebrate!

### 3. For Translations

We use a translation workflow:

```bash
# Arabic translations go in /ar/ directory
docs/
├── en/
│   └── getting-started/
│       └── introduction.md      # Source
└── ar/
    └── getting-started/
        └── introduction.md      # Translation
```

**Translation guidelines:**
- Keep technical terms consistent (see glossary)
- Preserve code blocks in original language
- Use RTL-aware formatting
- Test rendering before submitting

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for everyone, regardless of:

- Background or experience level
- Gender identity or expression
- Geographic location
- Language
- Religion

### Expected Behavior

- Be respectful and inclusive
- Welcome newcomers
- Give constructive feedback
- Focus on the issue, not the person

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing others' private information
- Other conduct deemed inappropriate

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report issues to: conduct@almadar.io

## Recognition

Contributors are recognized in:

- `CONTRIBUTORS.md` in the repository
- Monthly community highlights
- Annual contributor awards

### Contributor Levels

| Level | Criteria |
|-------|----------|
| **Contributor** | 1+ merged PRs |
| **Regular** | 5+ merged PRs |
| **Core** | Significant ongoing contributions |
| **Maintainer** | Trusted with merge access |

## Getting Help

- **Discord**: [Join our server](https://discord.gg/almadar)
- **GitHub Discussions**: [Ask questions](https://github.com/almadar-io/orb/discussions)
- **Email**: community@almadar.io

---

*Thank you for being part of the Almadar community!*
