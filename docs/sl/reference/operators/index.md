---
id: index
title: Referenca operatorjev
sidebar_label: Pregled
---

# Referenca operatorjev

Standardna knjiznica Orb zagotavlja 213+ vgrajenih operatorjev, organiziranih v 9 modulov.
Vsi operatorji so na voljo kot S-izrazi v pogojih in ucinkih.

## Moduli

| Modul | Predpona | Operatorji | Opis |
|-------|----------|------------|------|
| [Math](math) | `math/*` | 16 | Numericne operacije za izracune, zaokrozevanje, omejevanje in nakljucnost |
| [String](str) | `str/*` | 26 | Manipulacija besedila, vkljucno z oblikovanjem, razcepitvijo, obrezovanjem in predlogami |
| [Array](array) | `array/*` | 39 | Delo s seznami in polji, vkljucno s filtriranjem, preslikovanjem in agregacijo |
| [Object](object) | `object/*` | 18 | Varen dostop in manipulacija lastnosti objektov |
| [Time](time) | `time/*` | 25 | Delo z datumi, casi, trajanji in casovnimi zigi |
| [Validate](validate) | `validate/*` | 23 | Preverjanje uporabnisih vnosov s pogostimi vzorci, kot so e-posta, obvezno, preverjanje dolzine |
| [Format](format) | `format/*` | 9 | Oblikovanje prikaza za valute, stevilke, datume in velikosti datotek |
| [Async](async) | `async/*` | 8 | Nadzor casovnega poteka z zakasnitvami, debouncingom, ponovnimi poskusi in cakovnimi omejitvami |
| [Prob](prob) | `prob/*` | 16 | Vzorcenje distribucij, Bayesovo sklepanje, statisticni povzetki |

## Hitra referenca: osnovni operatorji

Ti operatorji delujejo brez predpone modula:

| Operator | Primer | Vrne |
|----------|--------|------|
| Aritmetika | `["+", 1, 2]` | number |
| Primerjava | `[">", "@entity.x", 5]` | boolean |
| Logika | `["and", true, false]` | boolean |
| `if` | `["if", cond, then, else]` | any |
| `do` | `["do", expr1, expr2]` | zadnja vrednost |
| `set` | `["set", "@entity.x", 42]` | void |
| `get` | `["get", "@entity.x"]` | any |
| `emit` | `["emit", "EVENT"]` | void |

Glej [Kljucni koncepti: Standardna knjiznica](/docs/sl/core-concepts/standard-library) za celoten seznam osnovnih operatorjev.
