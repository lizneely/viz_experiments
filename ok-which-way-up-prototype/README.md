# Which Way Is Up?

An O'Keeffe Experiments prototype. Visitors turn a work until it looks right, hang it, and see how the catalogue raisonné, and anyone who has disagreed with it, hangs the work.

## Files

- `index.html`: the page
- `style.css`: the styles (gallery-wall look)
- `game.js`: the game, in plain JavaScript (no p5 or other libraries)
- `disputes.js`: the 12 works with a recorded orientation dispute, with their notes
- `paintings.json`: **add this yourself.** Copy it from the Eye for O'Keeffe folder. It's the same file, with 1,265 works.

The only outside resources are the Schibsted Grotesk font (Google Fonts) and the images, which load from the Museum's IIIF server (iiif.okeeffemuseum.org).

## How a game is dealt

Six works per game: two from `disputes.js`, and four from `paintings.json`, with at most two drawings among those four. The settings are at the top of `game.js` (`ROUNDS`, `DISPUTED_PER_GAME`, `MAX_DRAWINGS`).

- For works from `paintings.json`, "up" is the best image as Access O'Keeffe shows it. The reveal shows the image description (alt text) and photo credit.
- If `paintings.json` is missing, the game plays only the 12 disputed works.
- If an image doesn't load, the game swaps in another work.

## Before hosting

Paste the shared banner and footer snippet (`okeeffe-experiments-snippet.html`, v4) just before `</body>`. The page has its own banner and footer built to match it, and the snippet's footer replaces the text in `footer .fine`.

The sources for every orientation note are in the project doc `which-way-is-up.md`.
