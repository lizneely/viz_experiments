# Curate Your Own Gallery (O'Keeffe Experiments)

Drag this whole folder onto Netlify (or upload the files to the p5 web editor).

## Files

- `index.html`: page, styles, banner and footer snippet (v4)
- `colors.js`: Jonathan's ColorGrid color utilities, unchanged
- `works.js`: loads and normalizes `paintings.json` (adapted from ColorGrid's museum.js)
- `wall.js`: the p5 sketch: the wall, to-scale hanging, salon packing, dragging
- `ui.js`: the controls (color and subject picker, wall color, title wall, list of works)
- `paintings.json`: Jonathan's 500 search-index records, trimmed to the fields used

## Data

386 works are hung: 2D works with dimensions and an image. Sculpture, casts, stoneware,
sketchbooks, and works with known dimension conflicts are left out (see `works.js`).

To use more works, replace `paintings.json` with any file in the same search-index shape,
for example the 1,265-work best-images file from Eye for O'Keeffe. No code changes needed.

## Hanging rules (in `wall.js`)

- Eye level: centered 60 in from the floor (`CENTER`), 24 in apart (`GAP_LINE`); a work that
  would come within 10 in of the floor is raised.
- Salon: 3 in apart (`GAP_SALON`), largest works placed first, packed around the 60 in line.
- Wall is at least 12 ft high and grows for tall work. O'Keeffe's silhouette is 5 ft 5 in.

Images load from IIIF and are drawn straight onto the canvas (no CORS needed). If an image
can't load, the work shows as bands of its color tags at its true size.
