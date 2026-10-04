# Eye for O'Keeffe (composition quiz)

A five-round quiz for O'Keeffe Experiments, built on Jonathan's composition analysis. Each round shows two works by Georgia O'Keeffe. The visitor decides whether they're composed **Alike** or **Different**. The page then animates the computer's marks onto both works and explains its read: where the eye lands, balance, lines, symmetry, and amount of detail. At the end, a score from 0 to 5 comes with an encouraging title.

## Files

| File | What it does |
|---|---|
| `records.js` | Parses the Elasticsearch export (Jonathan's, unchanged) |
| `composition.js` | Pixel analysis (Jonathan's v6, with the diagonal fix and logging behind `COMPOSITION_DEBUG`) |
| `compare.js` | Distances, alike/close/different judgments, and plain-language descriptions. Identical to the Composed Alike copy |
| `quiz.js` | Rounds, pair picking, answers, wording, and the result screen |
| `sketch.js` | p5: reads every work in the background, draws each pair, and animates the marks on the reveal |
| `index.html`, `style.css` | Layout and styles, matching the other prototypes |

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

- The quiz can start once 80 works have been read, which took about two seconds in testing. Reading continues in the background, and results are cached in localStorage.
- A `compositions.json` file made in Composed Alike (`downloadCompositions()`) also works here: put it next to `index.html`.

## Keys

- **A** answers Alike and **D** answers Different.
- **Enter** starts, goes to the next pair, and plays again.
- The shortcuts aren't shown on screen. They were taken out of the interface to keep it uncluttered, but the code still supports them (see the keydown handler in `quiz.js`).
