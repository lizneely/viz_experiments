# Eye for O'Keeffe (composition quiz)

A five-round quiz for O'Keeffe Experiments, built on Jonathan's composition analysis. Each round shows two works by Georgia O'Keeffe. The visitor decides whether they're composed **Alike** or **Different**. The page then animates the computer's marks onto both works and explains its read: where the eye lands, balance, lines, symmetry, and amount of detail. At the end, a score from 0 to 5 comes with an encouraging title.

## Files

| File | What it does |
|---|---|
| `paintings.json` | The works: an Elasticsearch export plus the best image and alt text for each (see below) |
| `records.js` | Parses the Elasticsearch export (Jonathan's, unchanged) |
| `composition.js` | Pixel analysis (Jonathan's v6, with the diagonal fix and logging behind `COMPOSITION_DEBUG`) |
| `compare.js` | Distances, alike/close/different judgments, and plain-language descriptions. Identical to the Composed Alike copy |
| `quiz.js` | Rounds, pair picking, answers, wording, and the result screen |
| `sketch.js` | p5: reads every work in the background, draws each pair, and animates the marks on the reveal |
| `index.html`, `style.css` | Layout and styles, matching the other prototypes |

## The works (updated October 5, 2026)

`paintings.json` holds the 1,265 works on the Museum's best-images list (`best-images.xlsx`, an export of the best image for each work, keyed by CR number). It replaces the earlier 500-record sample.

- **How it was made:** the CR numbers were sent as one `terms` query on `cr_number` to the `gokm` index. All 1,265 came back. `cr_data` and `_raw` were removed to keep the file small.
- **Best image first:** each record's best image (the sheet's Asset ID) is moved to the front of `representation.views`, which is the image the quiz shows and reads. For 52 works the best image wasn't on the record at all, so it was added, with its proportions taken from the work's dimensions.
- **Alt text:** each record carries `best_image` with `asset_id`, `alt_text`, and `credit` from the sheet. Fifteen works have two best images; the first listed is used.
- **Pool:** 1,262 works the quiz can use (870 on paper, 392 paintings). The three stoneware pieces are skipped, as before.

## Alt text

- While a visitor is deciding, the canvas's accessible label gives both works' alt text ("Left: … Right: …"). Titles stay hidden until the reveal, the same as for sighted visitors.
- On the reveal, each caption has an "Image description" toggle with the alt text.
- The thumbnails on the result screen use the alt text too.

## Color first, drawings for spice

About 560 of the works have color (paintings, watercolors, pastels) and about 700 are drawings (graphite, charcoal, ink, pen). So that games aren't mostly drawings:

- A game shows ten works, and **no more than three are drawings** (`MAX_DRAWINGS` in `quiz.js`).
- Most rounds start from a color work; 15 percent start from a drawing (`DRAWING_START_CHANCE`). The second work can be either kind, so drawing-and-painting pairs still come up.
- Works are read three color to one drawing, so even the first game has plenty of color.
- If the rule ever leaves no clear-cut pair, the quiz drops it for that round rather than show a weak pair.
- In a test of 300 games: about 2 to 3 drawings per game (never more than three), with roughly four in 10 rounds pairing a drawing with a color work.
- Whether a work counts as color comes from `isColorWork()` in `compare.js`: anything typed as a painting, or a medium that names oil, watercolor, pastel, gouache, tempera, acrylic, color, or crayon.

## How pairs are picked

- Each game has two or three "alike" pairs and two or three "different" pairs, in random order. No work appears twice in a game.
- **Alike:** the second work is one of the first work's six closest matches (Jonathan's overall distance), and the two agree on most aspects (alike = 1 point, close = ½ point, at least 3 points, and no more than one aspect "different").
- **Different:** the second work is among the farthest 35 percent from the first, and the two differ on at least three aspects and are alike on no more than one.
- These rules keep the computer's answer clear-cut, so the explanation always backs it up.
- Near-identical records (the same image catalogued twice) are skipped as "alike" pairs.

## Scoring

The score counts how often the visitor **agreed with the computer**. It's framed as agreement rather than right or wrong, since the computer sees only light, color, and edges.

| Score | Title |
|---|---|
| 5 | Eagle eye |
| 4 | Sharp eye |
| 3 | Good eye |
| 2 | Fresh eyes |
| 0–1 | Room to roam (an invitation to spend an afternoon in the galleries) |

## Loading

- The quiz can start once 80 works have been read, which took about two seconds in testing. Reading continues in the background, and results are cached in localStorage. The cache is dropped whenever `ANALYSIS_VERSION` in `compare.js` changes; it was bumped for the new image set.
- A `compositions.json` file made in Composed Alike (`downloadCompositions()`) also works here: put it next to `index.html`.

## Keys

- **A** answers Alike and **D** answers Different.
- **Enter** starts, goes to the next pair, and plays again.
- The shortcuts aren't shown on screen. They were taken out of the interface to keep it uncluttered, but the code still supports them (see the keydown handler in `quiz.js`).
