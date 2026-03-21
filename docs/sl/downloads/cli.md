# Prenesite CLI Orb

CLI Orb (`orb`) je orodje ukazne vrstice za preverjanje, prevajanje in delo z .orb programi.

## Hitra namestitev

### Namestitvena skripta (priporoceno)

```bash
curl -fsSL https://orb.almadar.io/install.sh | sh
```

### npm

```bash
npm install -g @almadar/orb
```

### Homebrew (macOS/Linux)

```bash
brew install almadar/tap/orb
```

### Cargo (razvijalci Rust)

```bash
cargo install orb-cli
```

## Prenosi, specificni za platformo

### Linux

| Arhitektura | Format | Prenos |
|-------------|--------|--------|
| x86_64 | tar.gz | [orb-linux-x86_64.tar.gz](#) |
| x86_64 | deb | [orb_x86_64.deb](#) |
| x86_64 | rpm | [orb-x86_64.rpm](#) |
| ARM64 | tar.gz | [orb-linux-aarch64.tar.gz](#) |

**Namestitev (tar.gz):**

```bash
tar -xzf orb-linux-x86_64.tar.gz
sudo mv orb /usr/local/bin/
```

**Namestitev (deb):**

```bash
sudo dpkg -i orb_x86_64.deb
```

### macOS

| Arhitektura | Format | Prenos |
|-------------|--------|--------|
| Intel (x86_64) | tar.gz | [orb-macos-x86_64.tar.gz](#) |
| Apple Silicon (ARM64) | tar.gz | [orb-macos-aarch64.tar.gz](#) |
| Universal | pkg | [orb-macos.pkg](#) |

**Namestitev (tar.gz):**

```bash
tar -xzf orb-macos-aarch64.tar.gz
sudo mv orb /usr/local/bin/
```

### Windows

| Arhitektura | Format | Prenos |
|-------------|--------|--------|
| x86_64 | zip | [orb-windows-x86_64.zip](#) |
| x86_64 | msi | [orb-windows-x86_64.msi](#) |

**Namestitev (winget):**

```powershell
winget install Almadar.Orb
```

**Namestitev (zip):**

1. Razsirite `orb-windows-x86_64.zip`
2. Dodajte razsirjeno mapo v vaso PATH
3. Ponovno zazenite terminal

## Preverjanje namestitve

```bash
orb --version
# Orb CLI v1.0.0

orb --help
# Orb - The Physics of Software
#
# USAGE:
#     orb <COMMAND>
#
# COMMANDS:
#     validate   Preveri .orb program
#     compile    Prevedi program v ciljno lupino
#     format     Oblikuj .orb program
#     dev        Zazeni razvojni streznik
#     test       Zazeni teste avtomata stanj
#     new        Ustvari nov projekt
#     help       Izpisi to sporocilo
```

## Osnovna uporaba

### Preverjanje programa

```bash
orb validate my-app.orb
# ✓ Program je veljaven
# ✓ 3 Orbital enote, 5 lastnosti, 8 entitet
```

### Prevajanje v TypeScript

```bash
orb compile my-app.orb --shell typescript --output ./generated
# ✓ Generiranih 24 datotek
# ✓ Izhod: ./generated
```

### Zagon razvojnega streznika

```bash
orb dev my-app.orb
# Zaganjam Orb razvojni streznik...
# ✓ Program nalozen: my-app.orb
# ✓ Streznik: http://localhost:3000
# ✓ Odjemalec: http://localhost:5173
#
# Cakem na spremembe...
```

### Zagon testov

```bash
orb test my-app.orb
# Zaganjam teste avtomata stanj...
# ✓ TaskLifecycle: 12 prehodov testiranih
# ✓ UserAuth: 8 prehodov testiranih
# ✓ Vsi pogoji ovrednoteni
#
# Testi: 20 uspesnih, 0 neuspesnih
```

### Ustvarjanje novega projekta

```bash
orb new my-app
# ✓ Ustvarjeno my-app/
# ✓ Ustvarjeno my-app/schema.orb
# ✓ Ustvarjeno my-app/orb.config.json
#
# Zacnite:
#   cd my-app
#   orb dev
```

## Konfiguracija

Ustvarite `orb.config.json` v korenu vasega projekta:

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

Nato preprosto zazenite:

```bash
orb compile
# Uporabi nastavitve iz orb.config.json
```

## Podpora za jezike

Orb podpira vec jezikov za sporocila o napakah in vzdevke operatorjev:

```bash
# Anglescina (privzeto)
orb validate schema.orb --locale en

# Arabscina
orb validate schema.orb --locale ar
# ✓ المخطط صالح
# ✓ ٣ مدارات، ٥ سمات، ٨ كيانات
```

## Naslednji koraki

- [Zgradite upravljalnik nalog](/docs/tutorials/beginner/task-manager) - zgradite nekaj!
- [Referenca operatorjev](/docs/reference/operators/) - celotna referenca operatorjev
- [Pogoji in poslovna pravila](/docs/tutorials/intermediate/guards) - S-izrazi v praksi

---

## Odpravljanje tezav

### "Command not found"

Zagotovite, da je binarna datoteka na vasi PATH:

```bash
# Preverite, kje je orb namescen
which orb

# Dodajte v PATH, ce je potrebno (dodajte v ~/.bashrc ali ~/.zshrc)
export PATH="$PATH:/path/to/orb"
```

### Permission Denied (Linux/macOS)

```bash
chmod +x /usr/local/bin/orb
```

### Opozorilo Windows Defender

Binarna datoteka orb.exe je podpisana, a lahko sprozi Windows Defender ob prvem zagonu. Kliknite "More info" → "Run anyway" ali dodajte izjemo.

---

*Potrebujete pomoc? Priduzite se nasemu [Discord](https://discord.gg/almadar) ali odprite [tezavo](https://github.com/almadar-io/almadar/issues).*
