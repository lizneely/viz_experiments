// ============================================================
// records.js
//
// Handles the structure of paintings.json.
//
// paintings.json is an Elasticsearch export.
// Each top-level item contains an _source object with the
// actual museum record.
// ============================================================


// ============================================================
// Main parser
// ============================================================

function parsePaintingRecords(rawData) {

  if (!rawData) {
    console.error("No museum JSON was loaded.");
    return [];
  }

  let rawRecords;

  if (Array.isArray(rawData)) {
    rawRecords = rawData;
  } else {
    // p5 may turn the top-level JSON array into an object
    // with numeric keys: {"0": {...}, "1": {...}}
    rawRecords = Object.values(rawData);
  }

  console.log(
    "Raw JSON records:",
    rawRecords.length
  );

  const parsed = [];

  for (let i = 0; i < rawRecords.length; i++) {

    const hit = rawRecords[i];

    if (!hit) {
      continue;
    }

    // Actual museum record lives inside _source.
    const source =
      hit._source || hit;

    if (!source) {
      continue;
    }

    const painting =
      parseOnePainting(
        source,
        hit,
        i
      );

    if (painting) {
      parsed.push(painting);
    }
  }

  console.log(
    "Parsed museum records:",
    parsed.length
  );

  return parsed;
}


// ============================================================
// Convert one museum record into a simpler object for sketch.js
// ============================================================

function parseOnePainting(
  source,
  hit,
  index
) {

  const representation =
    source.representation || null;

  const views =
    representation &&
    Array.isArray(representation.views)
      ? representation.views
      : [];

  const firstView =
    views.length > 0
      ? views[0]
      : null;

  const title =
    getPaintingTitle(source);

  let artist = "";

  if (
    Array.isArray(source.artist_label) &&
    source.artist_label.length > 0
  ) {
    artist =
      getLabelValue(
        source.artist_label[0]
      );
  }

  return {
    index: index,

    elasticId:
      hit && hit._id
        ? hit._id
        : null,

    id:
      source.id || null,

    crNumber:
      source.cr_number || null,

    title: title,
    artist: artist,

    accession:
      source.accession || [],

    dimensions:
      source.dimensions || null,

    timespan:
      source.timespan || null,

    caption:
      source.caption || null,

    colorFacets:
      Array.isArray(source.color_facets)
        ? source.color_facets
        : [],

    representation:
      representation,

    views:
      views,

    firstView:
      firstView,

    // Keep the original source available in case we need
    // more museum fields later.
    source:
      source
  };
}


// ============================================================
// Get a useful title
// ============================================================

function getPaintingTitle(source) {

  if (
    source.caption &&
    source.caption.title_date
  ) {

    const value =
      getLabelValue(
        source.caption.title_date
      );

    if (value) {
      return value;
    }
  }

  if (
    Array.isArray(source.label) &&
    source.label.length > 0
  ) {

    const value =
      getLabelValue(
        source.label[0]
      );

    if (value) {
      return value;
    }
  }

  if (source.alt_label) {

    const value =
      getLabelValue(
        source.alt_label
      );

    if (value) {
      return value;
    }
  }

  if (source.cr_number) {
    return "CR " + source.cr_number;
  }

  return "Untitled";
}


// ============================================================
// Some museum values may be strings, others objects with labels
// ============================================================

function getLabelValue(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {

    if (value.label) {
      return String(value.label);
    }

    if (value.value) {
      return String(value.value);
    }

    if (value.name) {
      return String(value.name);
    }
  }

  return "";
}


// ============================================================
// Does this record have an image view?
// ============================================================

function paintingHasImage(painting) {

  return !!(
    painting &&
    painting.firstView
  );
}


// ============================================================
// Debug one parsed painting
// ============================================================

function debugPaintingRecord(painting) {

  if (!painting) {
    console.log(
      "debugPaintingRecord: no painting"
    );
    return;
  }

  console.log(
    "=========================================="
  );

  console.log(
    "PARSED PAINTING"
  );

  console.log(
    "Title:",
    painting.title
  );

  console.log(
    "Artist:",
    painting.artist
  );

  console.log(
    "ID:",
    painting.id
  );

  console.log(
    "CR number:",
    painting.crNumber
  );

  console.log(
    "Representation:",
    painting.representation
  );

  if (painting.representation) {

    console.log(
      "Representation keys:",
      Object.keys(
        painting.representation
      )
    );
  }

  console.log(
    "Number of views:",
    painting.views.length
  );

  if (painting.firstView) {

    console.log(
      "FIRST VIEW:"
    );

    console.log(
      painting.firstView
    );

    console.log(
      "FIRST VIEW KEYS:"
    );

    console.log(
      Object.keys(
        painting.firstView
      )
    );

    console.log(
      "FIRST VIEW VALUES:"
    );

    for (
      const key of
      Object.keys(
        painting.firstView
      )
    ) {

      console.log(
        key,
        "=>",
        painting.firstView[key]
      );
    }

  } else {

    console.log(
      "This record has no representation.views[0]"
    );
  }

  console.log(
    "=========================================="
  );
}


// ============================================================
// Build IIIF image URL
// ============================================================

function getPaintingImageURL(
  painting,
  maxDimension = 900
) {

  if (
    !painting ||
    !painting.firstView
  ) {
    return null;
  }

  const view =
    painting.firstView;

  const dam =
    view.image_num ||
    view.dam ||
    view.image_id ||
    view.id ||
    view.identifier ||
    null;

  if (!dam) {

    console.warn(
      "Could not find image identifier in view:",
      view
    );

    return null;
  }

  let originalWidth =
    Number(view.width) ||
    Number(
      painting.representation &&
      painting.representation.width
    ) ||
    1000;

  let originalHeight =
    Number(view.height) ||
    Number(
      painting.representation &&
      painting.representation.height
    ) ||
    1000;

  if (
    !Number.isFinite(originalWidth) ||
    originalWidth <= 0
  ) {
    originalWidth = 1000;
  }

  if (
    !Number.isFinite(originalHeight) ||
    originalHeight <= 0
  ) {
    originalHeight = 1000;
  }

  let requestWidth;
  let requestHeight;

  if (
    originalWidth >=
    originalHeight
  ) {

    requestWidth =
      maxDimension;

    requestHeight =
      Math.round(
        originalHeight *
        (
          maxDimension /
          originalWidth
        )
      );

  } else {

    requestHeight =
      maxDimension;

    requestWidth =
      Math.round(
        originalWidth *
        (
          maxDimension /
          originalHeight
        )
      );
  }

  return (
    "https://iiif.okeeffemuseum.org/image/iiif/2/" +
    dam +
    "/full/!" +
    requestWidth +
    "," +
    requestHeight +
    "/0/default.jpg"
  );
}