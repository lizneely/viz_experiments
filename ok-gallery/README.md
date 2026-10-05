# Curate Your Own Gallery (O'Keeffe Experiments)

Drag this whole folder onto Netlify (or upload the files to the p5 web editor).

## Files

- `index.html`: page, styles, banner and footer snippet (v4)
- `colors.js`: Jonathan's ColorGrid color utilities, unchanged
- `works.js`: loads and normalizes `paintings.json` (adapted from ColorGrid's museum.js)
- `wall.js`: the p5 sketch: the wall, to-scale hanging, salon packing, dragging
- `share.js`: Save as image (poster PNG), Copy checklist, and Copy link
- `ui.js`: the controls (color and subject picker, wall color, title wall, Exhibition Checklist)
- `paintings.json`: the 1,265 best-images records from Eye for O'Keeffe (search index plus the Museum's
  best image, alt text, and photo credit for each work), trimmed to the fields used

## Data

1,251 works can be hung: 2D works with dimensions and an image; 1,137 have color tags. Sculpture, casts, stoneware,
sketchbooks, and works with known dimension conflicts are left out (see `works.js`).

To use more works, replace `paintings.json` with any file in the same search-index shape,
for example an untrimmed export. No code changes needed.

## Hanging rules (in `wall.js`)

- Eye level: centered 60 in from the floor (`CENTER`), 24 in apart (`GAP_LINE`); a work that
  would come within 10 in of the floor is raised.
- Salon: 3 in apart (`GAP_SALON`), largest works placed first, packed around the 60 in line.
  With "Snap into place" off, works stay exactly where they're dropped and may overlap.
- Wall is at least 12 ft high and grows for tall work. O'Keeffe's silhouette is 5 ft 5 in.

Images load from IIIF and are drawn straight onto the canvas (no CORS needed). If an image
can't load, the work shows as bands of its color tags at its true size.

## Sharing

- Save as image: a 2400 px wide PNG (no 60 in guide line) with the title, introduction, the wall to scale with numbered
  works, and the Exhibition Checklist. IIIF images are loaded with CORS for this; any image that
  won't load that way is drawn as color bands.
- Copy checklist: plain text of the title, introduction, and checklist.
- Copy link: the whole exhibition is packed into `?wall=...` in the link. No server needed.
  Opening the link loads that exhibition; changes stay on the visitor's device.

## Starting over

The wall is remembered in the visitor's browser. "Start over" (above the wall, click twice to
confirm) takes every work down, clears the title wall, resets the wall color and hang, and
forgets the saved copy. "Clear the wall" in the Exhibition Checklist removes only the works.
