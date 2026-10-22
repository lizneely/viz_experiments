# O'Keeffe in Tree Rings (p5.js)

O'Keeffe Experiments prototype, Georgia O'Keeffe Museum, October 2026.

## Files

- `index.html` loads p5.js 1.9.4, the O'Keeffe Experiments banner, the intro, the About the data section, and the shared banner and footer snippet (v4).
- `sketch.js` is the whole interactive piece: the tree-ring cross-section, the year label, the year-by-year chart, the subject filters, and "Rings to look at."
- `nm593.csv` holds the ring widths, 1880–1986: `age_CE` (year), `trsgi` (ring-width index, 1.0 = an average year), `numsamp` (samples). From ITRDB NM593, Woodhouse, Echo Amphitheater, Douglas-fir: https://www.ncei.noaa.gov/access/paleo-search/study/22319
- `works.json` holds 1,265 works from Access O'Keeffe (the Curate Your Own Gallery set): id, title, date, start and end year, subjects, IIIF image id, color tags, medium.

## p5 web editor

Upload `sketch.js`, `works.json`, and `nm593.csv`, and replace the editor's index.html with this one. The data loads in `preload()` with `loadTable()` and `loadJSON()`.

## Netlify

Drag the folder (or this zip) onto Netlify. Everything is relative, so it works from any address.

## Notes

- Works dated to a span (540 of 1,265) are open circles placed somewhere in their span on the disc. In the chart, each counts as a share of every year in its span.
- Life events were written from general knowledge and still need checking against the Museum's chronology.
- Thumbnails come from the Museum's IIIF server. Where images can't load, each work is drawn as bands of its color tags.
