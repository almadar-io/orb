---
title: Namestitev
sidebar_label: Namestitev
---

# Namestitev

CLI Orb (`orb`) je izvorna binarna datoteka, prevedena iz Rust. Deluje na Linux, macOS in Windows brez kakrsnihkoli izvajalnih odvisnosti. Generirane aplikacije zahtevajo Node.js, a sam prevajalnik ga ne potrebuje.

## Sistemske zahteve

| Zahteva | Namen |
|---------|-------|
| **Katerikoli OS** (Linux, macOS, Windows) | Binarna datoteka `orb` je na voljo za vse glavne platforme |
| **Node.js 18+** | Potreben za zagon generiranih aplikacij (`orb compile` izpise TypeScript/React projekte) |
| **npm** ali **pnpm** | Upravitelj paketov za namescanje odvisnosti generiranih aplikacij |

Binarna datoteka `orb` sama nima nobenih izvajalnih odvisnosti. Node.js je potreben samo, ko prevedete `.orb` program in zelite zagnati generirano aplikacijo.

## Namestitev prek skripte (macOS / Linux)

Najhitrejsi nacin namestitve:

```bash
curl -fsSL https://orb.almadar.io/install.sh | sh
```

Ta skripta:
1. Zazna vas OS in arhitekturo CPE
2. Prenese pravilno izvorno binarno datoteko iz izdaj na GitHub
3. Jo namesti v `~/.orb/bin/`
4. Doda `~/.orb/bin` v vaso spremenljivko `PATH` (posodobitev profila lupine)

Po namestitvi odprite nov terminal (ali `source` vas profil) in preverite:

```bash
orb --version
```

## Namestitev prek npm (katerakoli platforma)

Ce ze imate nameščen Node.js:

```bash
npm install -g @almadar/orb
```

Paket npm vkljucuje skripto `postinstall`, ki prenese pravilno izvorno binarno datoteko za vaso platformo. Paket sam je tanka ovojnica: vse delo prevajanja opravi izvorna binarna datoteka, ne Node.js.

Ta nacin deluje na vseh platformah, vkljucno z Windows, kjer lupinska skripta ni na voljo.

## Namestitev prek Homebrew (macOS)

```bash
brew tap almadar-io/tap
brew install orb
```

Homebrew samodejno upravlja posodobitve z `brew upgrade orb`.

## Rocni prenos

Prenesite vnaprej pripravljeno binarno datoteko neposredno s [strani izdaj na GitHub](https://github.com/almadar-io/orb/releases).

| Platforma | Arhitektura | Ime datoteke |
|-----------|-------------|--------------|
| Linux | x86_64 | `orb-linux-x64` |
| Linux | ARM64 | `orb-linux-arm64` |
| macOS | Intel | `orb-darwin-x64` |
| macOS | Apple Silicon | `orb-darwin-arm64` |
| Windows | x86_64 | `orb-windows-x64.exe` |

Po prenosu:

```bash
# macOS / Linux
chmod +x orb-*
mv orb-* /usr/local/bin/orb

# Preverite
orb --version
```

Na Windows postavite `.exe` v mapo, ki je na vasi `PATH`, ali dodajte njeno lokacijo v `PATH` prek Sistemskih nastavitev.

## Preverjanje namestitve

Zazenite naslednje za potrditev, da vse deluje:

```bash
orb --version
```

Videli bi morali izpis, kot je `orb 0.x.y` s stevilko razlicice.

Za potrditev, da prevajalnik lahko generira kodo, lahko zazenete tudi:

```bash
orb --help
```

To izpise vse razpolozljive ukaze: `validate`, `compile`, `dev`, `format` in druge.

## O predlogi lupine

Ko zazenete `orb compile`, prevajalnik generira celostezno TypeScript aplikacijo (React sprednji del, Express zaledni del, deljeni tipi). Ta generiran projekt potrebuje Node.js in npm za namescanje odvisnosti in zagon.

Razmerje:

```
your-app.orb          (vir: vas Orb program)
      |
  orb compile          (izvorna binarna datoteka, Node.js ni potreben)
      |
  my-app/              (generiran TypeScript projekt)
    packages/client/   (React + Vite, potrebuje Node.js)
    packages/server/   (Express, potrebuje Node.js)
    packages/shared/   (deljeni tipi)
```

Prevajalnik je izvorna binarna datoteka. Izhod je Node.js projekt. To sta loceni zadevi: prevajate lahko na napravi brez Node.js, nato namestite generirano kodo drugje.

## Naslednji koraki

Z namescenim CLI nadaljujte na [Hitri zacetek](./quickstart.md) za gradnjo in zagon vase prve Orb aplikacije v manj kot 5 minutah.
