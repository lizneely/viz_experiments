/*
==================================================
COLOR UTILITIES
==================================================
*/


function normalizeHex(hex) {

  if (!hex) {
    return null;
  }


  let value =
    String(hex)
      .trim()
      .toLowerCase();


  if (
    !value.startsWith("#")
  ) {

    value =
      "#" + value;

  }


  if (
    value.length === 4
  ) {

    value =
      "#" +
      value[1] + value[1] +
      value[2] + value[2] +
      value[3] + value[3];

  }


  if (
    !/^#[0-9a-f]{6}$/.test(value)
  ) {

    return null;

  }


  return value;

}



function hexToRgb(hex) {

  const normalized =
    normalizeHex(hex);


  if (!normalized) {

    return null;

  }


  const value =
    normalized.substring(1);


  const number =
    parseInt(
      value,
      16
    );


  return {

    r:
      (number >> 16) & 255,

    g:
      (number >> 8) & 255,

    b:
      number & 255

  };

}



/*
RGB 0-255

returns

h: 0-360
s: 0-100
b: 0-100
*/
function rgbToHsb(rgb) {

  const r =
    rgb.r / 255;


  const g =
    rgb.g / 255;


  const b =
    rgb.b / 255;


  const max =
    Math.max(
      r,
      g,
      b
    );


  const min =
    Math.min(
      r,
      g,
      b
    );


  const delta =
    max - min;


  let h =
    0;


  if (
    delta !== 0
  ) {

    if (
      max === r
    ) {

      h =
        60 *
        (
          (
            (
              g - b
            ) /
            delta
          ) % 6
        );

    }


    else if (
      max === g
    ) {

      h =
        60 *
        (
          (
            b - r
          ) /
          delta +
          2
        );

    }


    else {

      h =
        60 *
        (
          (
            r - g
          ) /
          delta +
          4
        );

    }

  }


  if (
    h < 0
  ) {

    h += 360;

  }


  const saturation =
    max === 0
      ? 0
      : delta / max;


  return {

    h:
      h,

    s:
      saturation * 100,

    b:
      max * 100

  };

}



/*
==================================================
COLOR SORTING
==================================================

Colorful colors:

red
orange
yellow
green
cyan
blue
purple

Neutrals are placed after the chromatic colors.

Within each hue, stronger saturation comes first.
==================================================
*/


function sortColorsForDisplay(
  a,
  b
) {

  const neutralThreshold =
    12;


  const aNeutral =
    a.hsb.s <
    neutralThreshold;


  const bNeutral =
    b.hsb.s <
    neutralThreshold;



  /*
  Chromatic colors first.
  */
  if (
    aNeutral &&
    !bNeutral
  ) {

    return 1;

  }


  if (
    !aNeutral &&
    bNeutral
  ) {

    return -1;

  }



  /*
  Neutrals:
  dark -> light
  */
  if (
    aNeutral &&
    bNeutral
  ) {

    return (
      a.hsb.b -
      b.hsb.b
    );

  }



  /*
  Primary sort:
  actual hue.
  */
  if (
    a.hsb.h !==
    b.hsb.h
  ) {

    return (
      a.hsb.h -
      b.hsb.h
    );

  }



  /*
  Same hue:
  saturated -> muted
  */
  if (
    a.hsb.s !==
    b.hsb.s
  ) {

    return (
      b.hsb.s -
      a.hsb.s
    );

  }



  /*
  Then bright -> dark.
  */
  return (
    b.hsb.b -
    a.hsb.b
  );

}