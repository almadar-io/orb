# Vescerine Orb

Izboljsajte svoj razvojni delovni tok z vescerinami, ki jih poganja UI, za generiranje programov Orb.

## almadar-orbitals

Primarna vescerini za generiranje programov Orb iz opisov v naravnem jeziku.

### Kaj pocne

- Generira celotne datoteke OrbitalSchema (.orb) iz opisov
- Ustvarja entitete s pravilnimi tipi polj in relacijami
- Oblikuje avtomate stanj s pogoji in ucinki
- Proizvaja vzorce UI in postavitve strani
- Sledi najboljsim praksam Orb

### Namestitev

```bash
# Prek CLI Orb
orb skill install almadar-orbitals

# Ali rocni prenos
curl -O https://almadar.io/skills/almadar-orbitals.zip
unzip almadar-orbitals.zip -d ~/.almadar/skills/
```

### Uporaba

Ko je namescena, poklicite vescerino v svoji seji:

```
/almadar-orbitals Build a task management system with user authentication,
                  task assignment, and approval workflows
```

Vescerini bo generirala:

```orb
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

### Vkljucena vsebina

| Datoteka | Opis |
|----------|------|
| `SKILL.md` | Navodila in zmoznosti vescerine |
| `examples/` | Referencni programi za pogoste vzorce |
| `validation/` | Kode napak in pravila preverjanja |
| `patterns/` | Referenca vzorcev UI |
| `traits/` | Referenca standardne knjiznice lastnosti |

### Najboljse prakse

1. **Bodite specificni** - vec podrobnosti = boljsi programi
2. **Opisite delovne tokove** - "Uporabniki lahko oddajo → odobrijo → objavijo"
3. **Omenite vloge** - "Administratorji lahko brisejo, uporabniki lahko samo gledajo"
4. **Dolocite trajnost** - "Naloge so shranjene, stanje igre je v izvajalnem okolju"

### Primeri pozivov

**E-trgovina:**
```
Build an e-commerce platform with:
- Product catalog with categories
- Shopping cart (runtime state)
- Checkout flow with payment integration
- Order management with status tracking
- Admin dashboard for inventory
```

**SaaS pregledna plosca:**
```
Create a SaaS analytics dashboard:
- Multi-tenant with organizations
- User roles: admin, analyst, viewer
- Dashboard widgets (charts, tables)
- Report generation and scheduling
- Data source connections
```

**Igra:**
```
Build a 2D platformer game with:
- Player with health, lives, score
- Enemies with patrol AI
- Collectibles and power-ups
- Level progression
- Leaderboard
```

---

## Razlicice vescerin

| Razlicica | Datum izdaje | Opombe |
|-----------|-------------|--------|
| 1.0.0 | Jan 2026 | Zacetna izdaja |

---

## Pro vescerine (placljive)

### almadar-design

Napredne zmoznosti oblikovanja UI/UX:

- Generiranje sistema oblikovanja
- Prilagoditev komponent
- Odzivne postavitve
- Specifikacije animacij

```bash
# Zahteva Pro narocnino
orb skill install almadar-design --pro
```

### almadar-fixing

Samodejno razresevanje napak:

- Analizira napake preverjanja
- Predlaga popravke s pojasnili
- Samodejno uporabi popravke
- Uci se iz vasih vzorcev

```bash
# Zahteva Pro narocnino
orb skill install almadar-fixing --pro
```

---

## Ustvarjanje prilagojenih vescerin

Zelite ustvariti lastne vescerine Orb? Kontaktirajte ekipo na support@almadar.io ali obisCite [razprave skupnosti](https://github.com/almadar-io/orb/discussions) za vodenje.

---

*Potrebujete pomoc? Kontaktirajte support@almadar.io*
