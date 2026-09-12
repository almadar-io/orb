# Orb logo brief

## What the mark has to say

Orb is a language where a thing's lifecycle is the primitive. Three ideas carry that:

- **The orb.** A whole, self-contained unit. An orbital is entity + traits + pages, closed and complete.
- **The circuit.** Event → guard → transition → effects → UI → event. A loop with no loose ends.
- **Warmth.** The language is for people first. The mark should feel like something you could hold, not a diagram from a physics textbook.

The current icon (`static/img/orb-icon-transparent.svg`) is a wireframe s-orbital: six thin ellipse pairs forming a sphere, a dot in the middle. It says "orbital" correctly, but it reads as cold and technical, and it was drawn in pure black so it vanished on the dark theme. The dark-mode problem is fixed separately (light-ink and dark-ink variants, wired through the navbar's `srcDark`). This brief is about the redesign.

## Constraints every option must meet

- One color. It will be rendered as a single-ink SVG so it can follow the theme (`currentColor`), with an optional second tone for the nucleus.
- Legible at 24 px in the navbar and at 512 px as an app icon. No hairlines, no fine crosshatching.
- Works on warm paper (`#faf6ef`, ink `#2b2420`) and on warm dark (`#1b1714`, ink `#f2eae0`).
- Rounded stroke ends. Consistent stroke weight. Slight asymmetry is welcome; perfect geometry is what made the current one feel distant.
- Still an orb. Round, or built around a round nucleus.

## Prompts

Each option has a concept, a prompt written for an image model (Midjourney, Ideogram, or DALL·E), and what to look for in the results. Generate several, then trace the winner as an SVG by hand.

### Option 1 — The closed loop

**Concept.** A single continuous stroke that starts and ends at the same point, drawn as a slightly imperfect circle with one small rounded gap and an implied direction. The orb is the loop. The gap says "one step away from complete" until you look again and see it closes.

**Prompt.**
```
minimal logo mark, a single continuous hand-drawn circle stroke that closes on itself with a tiny rounded notch suggesting motion around the ring, thick uniform line weight, rounded line ends, warm charcoal ink on cream paper, flat vector, no gradients, no text, centered, generous negative space, friendly and calm
```

**Look for.** A loop whose direction you can feel without an arrowhead. Reject anything that becomes a refresh icon.

### Option 2 — Three lobes, one nucleus

**Concept.** The current s-orbital reduced to its essence: three soft petal-like lobes around a warm dot, like a clover seen from above or a trefoil knot. Three lobes for entity, trait, page. Keeps continuity with the existing mark while removing the wireframe cage.

**Prompt.**
```
minimal logo mark, three soft rounded lobes arranged around a small solid dot, like a simplified trefoil or three-petal seed, drawn as one flowing stroke with rounded ends, thick even line, warm charcoal on cream, flat vector illustration, no gradients, no text, balanced, gentle and organic
```

**Look for.** The lobes should overlap slightly at the center so the nucleus sits inside them, not on top of them.

### Option 3 — The pebble

**Concept.** An orb that is a smooth river stone with a single ring inscribed around it, the way a state has one boundary. Solid fill with a lighter ring. Warm, tactile, the most "cozy" of the set.

**Prompt.**
```
minimal logo mark, a smooth rounded pebble shape, slightly asymmetric, solid warm charcoal fill, one thin cream ring inscribed around its middle like a band, flat vector, no shading, no gradients, no text, soft and tactile, the kind of stone you would keep on a desk
```

**Look for.** Asymmetry that still reads as round at 24 px. The band should be a full ring, not a stripe.

### Option 4 — Orbit and seed

**Concept.** One elliptical orbit tilted like a hat brim around a solid seed. The classic "orbit" glyph but reduced to a single ring, drawn thick and rounded so it feels like a piece of jewelry rather than an atom diagram.

**Prompt.**
```
minimal logo mark, a solid round seed with a single thick elliptical ring orbiting it at a gentle tilt, ring passes in front at the bottom and behind at the top, uniform rounded stroke, warm charcoal on cream, flat vector, no gradients, no text, calm and complete
```

**Look for.** The front/back overlap of the ring is what gives it depth. Reject anything with two or more rings; that is the current logo again.

### Option 5 — The lantern

**Concept.** A round glow held in a soft, rounded enclosure, like a paper lantern or a cupped hand around a light. The orb as something kept warm. This is the option that leans hardest into "cozy" and least into "orbital".

**Prompt.**
```
minimal logo mark, a soft round glow inside a gently rounded open enclosure, like a paper lantern or two cupped hands holding a small light, single thick stroke with rounded ends, warm charcoal on cream with the glow as negative space, flat vector, no gradients, no text, quiet and welcoming
```

**Look for.** The enclosure must stay open on one side or it becomes a padlock.

### Option 6 — Ink orbital

**Concept.** Keep the current geometry but redraw it with a brush: two or three overlapping ellipses in a thick, slightly variable stroke, like a quick ink sketch of a sphere. Continuity with today, warmth from the hand.

**Prompt.**
```
minimal logo mark, a sphere suggested by three overlapping ellipses drawn with a thick ink brush, slightly variable stroke width, rounded ends, a small solid dot at the center, warm charcoal on cream, flat vector, no gradients, no text, loose and confident, one gesture
```

**Look for.** Three ellipses, never six. The variable stroke is the whole point; if it comes back mechanical, regenerate.

## Wordmark

Set "Orb" in Source Serif 4 semibold, tight tracking, the same ink as the mark. The site already loads the face for headings, so the wordmark and the page share a voice. Do not put the wordmark inside the mark.

## Deliverables once an option wins

- `static/img/orb-mark.svg`, single path, `fill="currentColor"` or `stroke="currentColor"`, viewBox 0 0 100 100.
- `static/img/orb-icon-light.svg` and `orb-icon-dark.svg` regenerated from it with the theme inks baked in, for the navbar `src` and `srcDark`.
- A 512 px PNG for the favicon and social card.
