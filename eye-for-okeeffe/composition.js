// ============================================================
// composition.js
//
// VERSION 6
//
// Fast multi-scale composition analysis with:
//
// - luminance center-surround
// - color center-surround
// - local detail contrast
// - orientation diversity
// - directional convergence
// - angular support coverage
// - organized radial support
// - interior-vs-ring structure
// - explicit boundary-like penalty
// - MULTI-CUE CONSENSUS
// - agreement with independently calculated visual center
//
// Expensive calculations are performed only at a coarse
// candidate grid, so this remains practical in browser/p5.
//
// Detailed candidate logging is intentionally left enabled.
// ============================================================


function analyzeComposition(sourceImage) {

  const startTime =
    performance.now();


  // ==========================================================
  // ANALYSIS SIZE
  // ==========================================================

  const analysisWidth =
    150;


  const scaleFactor =
    analysisWidth /
    sourceImage.width;


  const analysisHeight =
    Math.max(
      1,
      Math.round(
        sourceImage.height *
        scaleFactor
      )
    );


  const img =
    sourceImage.get();


  img.resize(
    analysisWidth,
    analysisHeight
  );


  img.loadPixels();


  const w =
    img.width;


  const h =
    img.height;


  const n =
    w * h;


  const minDim =
    Math.min(
      w,
      h
    );


  // ==========================================================
  // PIXEL ARRAYS
  // ==========================================================

  const r =
    new Float32Array(n);


  const g =
    new Float32Array(n);


  const b =
    new Float32Array(n);


  const lum =
    new Float32Array(n);


  for (
    let i = 0;
    i < n;
    i++
  ) {

    const p =
      i * 4;


    const rr =
      img.pixels[p];


    const gg =
      img.pixels[p + 1];


    const bb =
      img.pixels[p + 2];


    r[i] = rr;
    g[i] = gg;
    b[i] = bb;


    lum[i] =
      0.2126 * rr +
      0.7152 * gg +
      0.0722 * bb;
  }


  // ==========================================================
  // SOBEL EDGE + ORIENTATION
  // ==========================================================

  const edgeMag =
    new Float32Array(n);


  const edgeAngle =
    new Float32Array(n);


  let maxEdge = 0;


  let horizontalEnergy = 0;

  let verticalEnergy = 0;

  let diagonalEnergyA = 0;

  let diagonalEnergyB = 0;


  for (
    let y = 1;
    y < h - 1;
    y++
  ) {

    for (
      let x = 1;
      x < w - 1;
      x++
    ) {

      const tl =
        lum[
          x - 1 +
          (y - 1) * w
        ];


      const tc =
        lum[
          x +
          (y - 1) * w
        ];


      const tr =
        lum[
          x + 1 +
          (y - 1) * w
        ];


      const ml =
        lum[
          x - 1 +
          y * w
        ];


      const mr =
        lum[
          x + 1 +
          y * w
        ];


      const bl =
        lum[
          x - 1 +
          (y + 1) * w
        ];


      const bc =
        lum[
          x +
          (y + 1) * w
        ];


      const br =
        lum[
          x + 1 +
          (y + 1) * w
        ];


      const gx =
        -tl +
        tr -
        2 * ml +
        2 * mr -
        bl +
        br;


      const gy =
        -tl -
        2 * tc -
        tr +
        bl +
        2 * bc +
        br;


      const magnitude =
        Math.sqrt(
          gx * gx +
          gy * gy
        );


      const index =
        x +
        y * w;


      edgeMag[index] =
        magnitude;


      if (
        magnitude >
        maxEdge
      ) {

        maxEdge =
          magnitude;
      }


      // ------------------------------------------------------
      // Visible line orientation
      // ------------------------------------------------------

      let angle =
        Math.atan2(
          gy,
          gx
        ) +
        Math.PI / 2;


      angle =
        normalizeLineAngle(
          angle
        );


      edgeAngle[index] =
        angle;


      const degrees =
        angle *
        180 /
        Math.PI;


      if (
        degrees < 22.5 ||
        degrees >= 157.5
      ) {

        horizontalEnergy +=
          magnitude;

      } else if (
        degrees < 67.5
      ) {

        // FIX (Oct 2026): canvas y runs downward, so a line at
        // 22.5–67.5° looks like "\" on screen, not "/".
        // Tested with striped images. A is now "/" (rising),
        // B is "\" (falling), matching the names below.
        diagonalEnergyB +=
          magnitude;

      } else if (
        degrees < 112.5
      ) {

        verticalEnergy +=
          magnitude;

      } else {

        diagonalEnergyA +=
          magnitude;
      }
    }
  }


  if (
    maxEdge <= 0
  ) {

    maxEdge = 1;
  }


  // ==========================================================
  // NORMALIZED EDGE MAP
  // ==========================================================

  const edgeNorm =
    new Float32Array(n);


  for (
    let i = 0;
    i < n;
    i++
  ) {

    edgeNorm[i] =
      Math.min(
        1,
        edgeMag[i] /
        maxEdge
      );
  }


  // ==========================================================
  // INTEGRAL IMAGES
  // ==========================================================

  const lumIntegral =
    buildIntegralImage(
      lum,
      w,
      h
    );


  const rIntegral =
    buildIntegralImage(
      r,
      w,
      h
    );


  const gIntegral =
    buildIntegralImage(
      g,
      w,
      h
    );


  const bIntegral =
    buildIntegralImage(
      b,
      w,
      h
    );


  const edgeIntegral =
    buildIntegralImage(
      edgeNorm,
      w,
      h
    );


  // ==========================================================
  // MULTISCALE PARAMETERS
  // ==========================================================

  const smallRadius =
    Math.max(
      2,
      Math.round(
        minDim * 0.025
      )
    );


  const mediumRadius =
    Math.max(
      4,
      Math.round(
        minDim * 0.07
      )
    );


  const largeRadius =
    Math.max(
      9,
      Math.round(
        minDim * 0.17
      )
    );


  // ==========================================================
  // VISUAL CENTER
  //
  // This is calculated independently from focal detection.
  //
  // It answers:
  //
  // Where is the overall visual activity centered?
  //
  // It does NOT mean "focal point."
  // ==========================================================

  let visualWeight = 0;

  let visualXSum = 0;

  let visualYSum = 0;


  for (
    let y = 0;
    y < h;
    y += 2
  ) {

    for (
      let x = 0;
      x < w;
      x += 2
    ) {

      const i =
        x +
        y * w;


      const localLum =
        boxAverage(
          lumIntegral,
          w,
          h,
          x,
          y,
          mediumRadius
        );


      const lumDifference =
        Math.abs(
          lum[i] -
          localLum
        ) /
        255;


      const localEdges =
        boxAverage(
          edgeIntegral,
          w,
          h,
          x,
          y,
          mediumRadius
        );


      const weight =
        lumDifference *
        0.40 +
        localEdges *
        0.60;


      visualWeight +=
        weight;


      visualXSum +=
        x *
        weight;


      visualYSum +=
        y *
        weight;
    }
  }


  let visualCenterX =
    0.5;


  let visualCenterY =
    0.5;


  if (
    visualWeight >
    0
  ) {

    visualCenterX =
      visualXSum /
      visualWeight /
      Math.max(
        1,
        w - 1
      );


    visualCenterY =
      visualYSum /
      visualWeight /
      Math.max(
        1,
        h - 1
      );
  }


  const balanceX =
    (
      visualCenterX -
      0.5
    ) *
    2;


  const balanceY =
    (
      visualCenterY -
      0.5
    ) *
    2;


  // ==========================================================
  // FOCAL CANDIDATE GRID
  // ==========================================================

  const candidateCols =
    15;


  const candidateRows =
    Math.max(
      10,
      Math.round(
        candidateCols *
        h /
        w
      )
    );


  const candidates = [];


  for (
    let gy = 0;
    gy < candidateRows;
    gy++
  ) {

    for (
      let gx = 0;
      gx < candidateCols;
      gx++
    ) {

      const nx =
        (
          gx +
          0.5
        ) /
        candidateCols;


      const ny =
        (
          gy +
          0.5
        ) /
        candidateRows;


      const x =
        Math.round(
          nx *
          (
            w - 1
          )
        );


      const y =
        Math.round(
          ny *
          (
            h - 1
          )
        );


      const result =
        scoreFocalCandidate(
          x,
          y,

          w,
          h,

          lumIntegral,

          rIntegral,
          gIntegral,
          bIntegral,

          edgeIntegral,

          edgeNorm,
          edgeAngle,

          smallRadius,
          mediumRadius,
          largeRadius,

          visualCenterX,
          visualCenterY
        );


      candidates.push({

        x,
        y,

        nx,
        ny,

        score:
          result.score,

        diagnostics:
          result.diagnostics

      });
    }
  }


  // ==========================================================
  // BEST CANDIDATE
  // ==========================================================

  candidates.sort(
    (a, b) =>
      b.score -
      a.score
  );


  const best =
    candidates[0];


  // ==========================================================
  // CENTROID OF NEARBY STRONG CANDIDATES
  // ==========================================================

  const threshold =
    best.score *
    0.88;


  const maxDistance =
    0.18;


  let focalWeight = 0;

  let focalXSum = 0;

  let focalYSum = 0;


  for (
    const candidate of
    candidates
  ) {

    if (
      candidate.score <
      threshold
    ) {
      continue;
    }


    const dx =
      candidate.nx -
      best.nx;


    const dy =
      candidate.ny -
      best.ny;


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (
      distance >
      maxDistance
    ) {
      continue;
    }


    focalWeight +=
      candidate.score;


    focalXSum +=
      candidate.nx *
      candidate.score;


    focalYSum +=
      candidate.ny *
      candidate.score;
  }


  let focalX =
    best.nx;


  let focalY =
    best.ny;


  if (
    focalWeight >
    0
  ) {

    focalX =
      focalXSum /
      focalWeight;


    focalY =
      focalYSum /
      focalWeight;
  }


  // ==========================================================
  // FOCAL STRENGTH
  // ==========================================================

  let averageCandidateScore =
    0;


  for (
    const candidate of
    candidates
  ) {

    averageCandidateScore +=
      candidate.score;
  }


  averageCandidateScore /=
    candidates.length;


  const focalStrength =
    averageCandidateScore > 0
      ? best.score /
        averageCandidateScore
      : 0;


  // ==========================================================
  // SYMMETRY
  // ==========================================================

  let symmetryDifference =
    0;


  let symmetrySamples =
    0;


  for (
    let y = 0;
    y < h;
    y += 2
  ) {

    for (
      let x = 0;
      x <
      Math.floor(
        w / 2
      );
      x += 2
    ) {

      const li =
        x +
        y * w;


      const ri =
        (
          w -
          1 -
          x
        ) +
        y * w;


      const lumDifference =
        Math.abs(
          lum[li] -
          lum[ri]
        ) /
        255;


      const edgeDifference =
        Math.abs(
          edgeNorm[li] -
          edgeNorm[ri]
        );


      symmetryDifference +=
        lumDifference *
        0.65 +
        edgeDifference *
        0.35;


      symmetrySamples++;
    }
  }


  let symmetry =
    1;


  if (
    symmetrySamples >
    0
  ) {

    symmetry =
      1 -
      symmetryDifference /
      symmetrySamples;
  }


  symmetry =
    constrainValue(
      symmetry,
      0,
      1
    );


  // ==========================================================
  // EDGE DENSITY
  // ==========================================================

  let strongEdges = 0;


  for (
    let i = 0;
    i < n;
    i++
  ) {

    if (
      edgeNorm[i] >
      0.10
    ) {

      strongEdges++;
    }
  }


  const edgeDensity =
    strongEdges /
    n;


  // ==========================================================
  // ORIENTATION TOTALS
  // ==========================================================

  const orientationTotal =

    horizontalEnergy +

    verticalEnergy +

    diagonalEnergyA +

    diagonalEnergyB;


  let horizontalScore = 0;

  let verticalScore = 0;

  let diagonalAScore = 0;

  let diagonalBScore = 0;


  if (
    orientationTotal >
    0
  ) {

    horizontalScore =
      horizontalEnergy /
      orientationTotal;


    verticalScore =
      verticalEnergy /
      orientationTotal;


    diagonalAScore =
      diagonalEnergyA /
      orientationTotal;


    diagonalBScore =
      diagonalEnergyB /
      orientationTotal;
  }


  const orientationScores = [

    {
      name:
        "horizontal",

      value:
        horizontalScore
    },

    {
      name:
        "vertical",

      value:
        verticalScore
    },

    {
      name:
        "diagonal /",

      value:
        diagonalAScore
    },

    {
      name:
        "diagonal \\",

      value:
        diagonalBScore
    }

  ];


  orientationScores.sort(
    (a, b) =>
      b.value -
      a.value
  );


  const dominantDirection =
    orientationScores[0].name;


  // ==========================================================
  // THIRDS
  // ==========================================================

  const thirdsPoints = [

    [
      1 / 3,
      1 / 3
    ],

    [
      2 / 3,
      1 / 3
    ],

    [
      1 / 3,
      2 / 3
    ],

    [
      2 / 3,
      2 / 3
    ]

  ];


  const thirdsDistance =
    nearestNormalizedDistance(
      focalX,
      focalY,
      thirdsPoints
    );


  const thirdsScore =
    constrainValue(
      1 -
      thirdsDistance /
      0.5,
      0,
      1
    );


  // ==========================================================
  // GOLDEN SECTION
  // ==========================================================

  const goldenA =
    0.382;


  const goldenB =
    0.618;


  const goldenPoints = [

    [
      goldenA,
      goldenA
    ],

    [
      goldenB,
      goldenA
    ],

    [
      goldenA,
      goldenB
    ],

    [
      goldenB,
      goldenB
    ]

  ];


  const goldenDistance =
    nearestNormalizedDistance(
      focalX,
      focalY,
      goldenPoints
    );


  const goldenScore =
    constrainValue(
      1 -
      goldenDistance /
      0.5,
      0,
      1
    );


  // ==========================================================
  // DEBUG
  // ==========================================================

  // Logging is now off by default because the page analyzes
  // every work in the background. Set COMPOSITION_DEBUG = true
  // in the console (or sketch.js) to see it again.
  if (typeof COMPOSITION_DEBUG !== "undefined" && COMPOSITION_DEBUG) {

    const elapsed =
      performance.now() -
      startTime;


    console.log(
      "Composition analysis:",
      Math.round(
        elapsed
      ),
      "ms"
    );


    console.log(
      "VISUAL CENTER:",
      {
        x:
          visualCenterX.toFixed(3),

        y:
          visualCenterY.toFixed(3)
      }
    );


    console.log(
      "Best focal candidate:",
      {
        x:
          focalX.toFixed(3),

        y:
          focalY.toFixed(3),

        score:
          best.score.toFixed(3),

        focalStrength:
          focalStrength.toFixed(2),

        diagnostics:
          best.diagnostics
      }
    );


    console.log(
      "TOP 5 FOCAL CANDIDATES:"
    );


    for (
      let i = 0;
      i <
      Math.min(
        5,
        candidates.length
      );
      i++
    ) {

      const c =
        candidates[i];


      console.log(
        "#" +
        (
          i + 1
        ),
        {
          x:
            c.nx.toFixed(3),

          y:
            c.ny.toFixed(3),

          score:
            c.score.toFixed(3),

          diagnostics:
            c.diagnostics
        }
      );
    }
  }


  // ==========================================================
  // RETURN
  // ==========================================================

  return {

    focalX,
    focalY,

    focalStrength,

    visualCenterX,
    visualCenterY,

    balanceX,
    balanceY,

    symmetry,

    edgeDensity,

    horizontalEnergy:
      horizontalScore,

    verticalEnergy:
      verticalScore,

    diagonalAEnergy:
      diagonalAScore,

    diagonalBEnergy:
      diagonalBScore,

    dominantDirection,

    thirdsScore,

    goldenScore

  };
}


// ============================================================
// SCORE ONE FOCAL CANDIDATE
// ============================================================

function scoreFocalCandidate(
  x,
  y,

  w,
  h,

  lumIntegral,

  rIntegral,
  gIntegral,
  bIntegral,

  edgeIntegral,

  edgeNorm,
  edgeAngle,

  smallRadius,
  mediumRadius,
  largeRadius,

  visualCenterX,
  visualCenterY
) {

  // ==========================================================
  // MULTISCALE LUMINANCE
  // ==========================================================

  const lumSmall =
    boxAverage(
      lumIntegral,
      w,
      h,
      x,
      y,
      smallRadius
    );


  const lumMedium =
    boxAverage(
      lumIntegral,
      w,
      h,
      x,
      y,
      mediumRadius
    );


  const lumLarge =
    boxAverage(
      lumIntegral,
      w,
      h,
      x,
      y,
      largeRadius
    );


  const luminanceContrast =

    Math.abs(
      lumSmall -
      lumMedium
    ) /
    255 *
    0.55

    +

    Math.abs(
      lumMedium -
      lumLarge
    ) /
    255 *
    0.45;


  // ==========================================================
  // MULTISCALE COLOR
  // ==========================================================

  const rs =
    boxAverage(
      rIntegral,
      w,
      h,
      x,
      y,
      smallRadius
    );


  const gs =
    boxAverage(
      gIntegral,
      w,
      h,
      x,
      y,
      smallRadius
    );


  const bs =
    boxAverage(
      bIntegral,
      w,
      h,
      x,
      y,
      smallRadius
    );


  const rm =
    boxAverage(
      rIntegral,
      w,
      h,
      x,
      y,
      mediumRadius
    );


  const gm =
    boxAverage(
      gIntegral,
      w,
      h,
      x,
      y,
      mediumRadius
    );


  const bm =
    boxAverage(
      bIntegral,
      w,
      h,
      x,
      y,
      mediumRadius
    );


  const rl =
    boxAverage(
      rIntegral,
      w,
      h,
      x,
      y,
      largeRadius
    );


  const gl =
    boxAverage(
      gIntegral,
      w,
      h,
      x,
      y,
      largeRadius
    );


  const bl =
    boxAverage(
      bIntegral,
      w,
      h,
      x,
      y,
      largeRadius
    );


  const colorContrast =

    rgbDistance(
      rs,
      gs,
      bs,

      rm,
      gm,
      bm
    ) *
    0.55

    +

    rgbDistance(
      rm,
      gm,
      bm,

      rl,
      gl,
      bl
    ) *
    0.45;


  // ==========================================================
  // DETAIL DENSITY
  // ==========================================================

  const edgeSmall =
    boxAverage(
      edgeIntegral,
      w,
      h,
      x,
      y,
      smallRadius
    );


  const edgeMedium =
    boxAverage(
      edgeIntegral,
      w,
      h,
      x,
      y,
      mediumRadius
    );


  const edgeLarge =
    boxAverage(
      edgeIntegral,
      w,
      h,
      x,
      y,
      largeRadius
    );


  const detailContrast =
    Math.max(
      0,
      edgeSmall -
      edgeLarge
    );


  const mediumDetail =
    Math.max(
      0,
      edgeMedium -
      edgeLarge
    );


  // ==========================================================
  // INTERIOR VS RING
  // ==========================================================

  const innerRadius =
    Math.max(
      2,
      Math.round(
        mediumRadius *
        0.55
      )
    );


  const ringOuterRadius =
    Math.max(
      innerRadius + 2,
      Math.round(
        mediumRadius *
        1.55
      )
    );


  const innerEdge =
    boxAverage(
      edgeIntegral,
      w,
      h,
      x,
      y,
      innerRadius
    );


  const outerEdge =
    boxAverage(
      edgeIntegral,
      w,
      h,
      x,
      y,
      ringOuterRadius
    );


  const innerArea =
    squareAreaWithinImage(
      x,
      y,
      innerRadius,
      w,
      h
    );


  const outerArea =
    squareAreaWithinImage(
      x,
      y,
      ringOuterRadius,
      w,
      h
    );


  let ringEdge =
    outerEdge;


  if (
    outerArea >
    innerArea
  ) {

    const outerSum =
      outerEdge *
      outerArea;


    const innerSum =
      innerEdge *
      innerArea;


    ringEdge =
      (
        outerSum -
        innerSum
      ) /
      (
        outerArea -
        innerArea
      );
  }


  const interiorStructure =
    constrainValue(
      (
        innerEdge -
        ringEdge +
        0.15
      ) /
      0.30,
      0,
      1
    );


  // ==========================================================
  // ORIENTATION DIVERSITY
  // ==========================================================

  const diversity =
    calculateOrientationDiversity(
      x,
      y,

      w,
      h,

      edgeNorm,
      edgeAngle,

      mediumRadius
    );


  // ==========================================================
  // CONVERGENCE
  // ==========================================================

  const convergence =
    calculateConvergence(
      x,
      y,

      w,
      h,

      edgeNorm,
      edgeAngle,

      largeRadius
    );


  // ==========================================================
  // ANGULAR SUPPORT
  // ==========================================================

  const angular =
    calculateAngularSupport(
      x,
      y,

      w,
      h,

      edgeNorm,
      edgeAngle,

      largeRadius
    );


  // ==========================================================
  // BOUNDARY-LIKE PENALTY
  // ==========================================================

  const localBoundaryStrength =
    Math.max(
      edgeSmall,
      edgeMedium
    );


  const boundaryLike =
    constrainValue(

      localBoundaryStrength *

      (
        0.55 *
        angular.oneSidedness +

        0.45 *
        (
          1 -
          interiorStructure
        )
      ),

      0,
      1
    );


  // ==========================================================
  // MULTI-CUE CONSENSUS
  //
  // Key change in Version 6.
  //
  // We normalize the four main independent perceptual cues
  // before combining them.
  //
  // A candidate does better when ALL are reasonably strong.
  //
  // A single huge structural measurement can no longer make
  // up as easily for weak color/contrast/detail evidence.
  // ==========================================================

  const lumCue =
    constrainValue(
      luminanceContrast *
      4.0,
      0,
      1
    );


  const colorCue =
    constrainValue(
      colorContrast *
      4.0,
      0,
      1
    );


  const detailCue =
    constrainValue(
      detailContrast *
      5.0,
      0,
      1
    );


  const diversityCue =
    constrainValue(
      diversity,
      0,
      1
    );


  // ----------------------------------------------------------
  // Geometric mean.
  //
  // If one cue is weak, consensus falls.
  // ----------------------------------------------------------

  const consensus =
    Math.pow(

      Math.max(
        0.001,
        lumCue
      ) *

      Math.max(
        0.001,
        colorCue
      ) *

      Math.max(
        0.001,
        detailCue
      ) *

      Math.max(
        0.001,
        diversityCue
      ),

      1 / 4
    );


  // ==========================================================
  // AGREEMENT WITH VISUAL CENTER
  //
  // IMPORTANT:
  //
  // This is NOT distance from canvas center.
  //
  // The visual center was independently calculated from image
  // activity.
  //
  // So an off-center composition can still receive full
  // support if its visual center is off-center too.
  // ==========================================================

  const candidateNX =
    x /
    Math.max(
      1,
      w - 1
    );


  const candidateNY =
    y /
    Math.max(
      1,
      h - 1
    );


  const visualDX =
    candidateNX -
    visualCenterX;


  const visualDY =
    candidateNY -
    visualCenterY;


  const visualDistance =
    Math.sqrt(
      visualDX *
      visualDX +
      visualDY *
      visualDY
    );


  // ----------------------------------------------------------
  // At distance 0 => 1.0
  //
  // At distance .45 or beyond => 0
  // ----------------------------------------------------------

  const visualCenterAgreement =
    constrainValue(
      1 -
      visualDistance /
      0.45,
      0,
      1
    );


  // ==========================================================
  // VERY MILD CANVAS CENTER PRIOR
  //
  // This remains deliberately weak.
  // ==========================================================

  const dx =
    candidateNX -
    0.5;


  const dy =
    candidateNY -
    0.5;


  const centerDistance =
    Math.sqrt(
      dx * dx +
      dy * dy
    ) /
    0.7071;


  const centerPrior =
    1 -
    centerDistance *
    0.05;


  // ==========================================================
  // IMAGE BORDER PENALTY
  // ==========================================================

  const borderDistance =
    Math.min(
      candidateNX,
      1 - candidateNX,
      candidateNY,
      1 - candidateNY
    );


  let borderFactor =
    1;


  if (
    borderDistance <
    0.07
  ) {

    borderFactor =
      0.50 +
      (
        borderDistance /
        0.07
      ) *
      0.50;
  }


  // ==========================================================
  // ORDINARY POSITIVE EVIDENCE
  //
  // Convergence is reduced from the previous version.
  //
  // The more independent cues are now handled separately
  // through consensus.
  // ==========================================================

  const ordinaryEvidence =

    luminanceContrast *
    0.16 +

    colorContrast *
    0.16 +

    detailContrast *
    0.17 +

    mediumDetail *
    0.06 +

    diversity *
    0.13 +

    convergence *
    0.07 +

    angular.coverage *
    0.10 +

    angular.organizedCoverage *
    0.07 +

    interiorStructure *
    0.08;


  // ==========================================================
  // FINAL POSITIVE SCORE
  //
  // ordinaryEvidence = what is happening locally
  //
  // consensus = do several independent cues agree?
  //
  // visualCenterAgreement = does this candidate agree with the
  // independently measured compositional activity?
  // ==========================================================

  const positiveScore =

    ordinaryEvidence *
    0.68 +

    consensus *
    0.20 +

    visualCenterAgreement *
    0.12;


  // ==========================================================
  // BOUNDARY PENALTY
  // ==========================================================

  const boundaryFactor =
    1 -
    boundaryLike *
    0.55;


  const score =
    positiveScore *
    boundaryFactor *
    centerPrior *
    borderFactor;


  return {

    score,

    diagnostics: {

      lum:
        roundDebug(
          luminanceContrast
        ),

      color:
        roundDebug(
          colorContrast
        ),

      detail:
        roundDebug(
          detailContrast
        ),

      mediumDetail:
        roundDebug(
          mediumDetail
        ),

      diversity:
        roundDebug(
          diversity
        ),

      convergence:
        roundDebug(
          convergence
        ),

      coverage:
        roundDebug(
          angular.coverage
        ),

      organized:
        roundDebug(
          angular.organizedCoverage
        ),

      oneSided:
        roundDebug(
          angular.oneSidedness
        ),

      interior:
        roundDebug(
          interiorStructure
        ),

      boundaryLike:
        roundDebug(
          boundaryLike
        ),

      lumCue:
        roundDebug(
          lumCue
        ),

      colorCue:
        roundDebug(
          colorCue
        ),

      detailCue:
        roundDebug(
          detailCue
        ),

      consensus:
        roundDebug(
          consensus
        ),

      visualAgree:
        roundDebug(
          visualCenterAgreement
        ),

      ordinary:
        roundDebug(
          ordinaryEvidence
        ),

      positive:
        roundDebug(
          positiveScore
        )

    }

  };
}


// ============================================================
// ANGULAR SUPPORT
// ============================================================

function calculateAngularSupport(
  centerX,
  centerY,

  w,
  h,

  edgeNorm,
  edgeAngle,

  radius
) {

  const sectorCount =
    8;


  const support =
    new Float32Array(
      sectorCount
    );


  const organized =
    new Float32Array(
      sectorCount
    );


  const x1 =
    Math.max(
      1,
      centerX -
      radius
    );


  const x2 =
    Math.min(
      w - 2,
      centerX +
      radius
    );


  const y1 =
    Math.max(
      1,
      centerY -
      radius
    );


  const y2 =
    Math.min(
      h - 2,
      centerY +
      radius
    );


  for (
    let y = y1;
    y <= y2;
    y += 3
  ) {

    for (
      let x = x1;
      x <= x2;
      x += 3
    ) {

      const index =
        x +
        y * w;


      const strength =
        edgeNorm[index];


      if (
        strength <
        0.09
      ) {
        continue;
      }


      const dx =
        x -
        centerX;


      const dy =
        y -
        centerY;


      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );


      if (
        distance < 3 ||
        distance > radius
      ) {
        continue;
      }


      let angle =
        Math.atan2(
          dy,
          dx
        );


      if (
        angle < 0
      ) {

        angle +=
          Math.PI *
          2;
      }


      let sector =
        Math.floor(
          angle /
          (
            Math.PI *
            2
          ) *
          sectorCount
        );


      sector =
        Math.max(
          0,
          Math.min(
            sectorCount -
            1,
            sector
          )
        );


      const distanceWeight =
        1 -
        distance /
        radius;


      const weight =
        strength *
        distanceWeight;


      support[sector] +=
        weight;


      // ------------------------------------------------------
      // Does line geometry relate to candidate?
      // ------------------------------------------------------

      const towardAngle =
        normalizeLineAngle(
          Math.atan2(
            centerY -
            y,
            centerX -
            x
          )
        );


      const lineAngle =
        edgeAngle[index];


      let difference =
        Math.abs(
          towardAngle -
          lineAngle
        );


      if (
        difference >
        Math.PI / 2
      ) {

        difference =
          Math.PI -
          difference;
      }


      const alignment =
        Math.max(
          0,
          Math.cos(
            difference
          )
        );


      organized[sector] +=
        weight *
        alignment;
    }
  }


  // ==========================================================
  // NORMALIZE SECTOR SUPPORT
  // ==========================================================

  let totalSupport =
    0;


  for (
    let i = 0;
    i < sectorCount;
    i++
  ) {

    totalSupport +=
      support[i];
  }


  if (
    totalSupport <= 0
  ) {

    return {

      coverage: 0,

      organizedCoverage: 0,

      oneSidedness: 1

    };
  }


  let activeSectors =
    0;


  let organizedSectors =
    0;


  const activationThreshold =
    totalSupport *
    0.08;


  for (
    let i = 0;
    i < sectorCount;
    i++
  ) {

    if (
      support[i] >=
      activationThreshold
    ) {

      activeSectors++;
    }


    if (
      organized[i] >=
      activationThreshold *
      0.55
    ) {

      organizedSectors++;
    }
  }


  const coverage =
    activeSectors /
    sectorCount;


  const organizedCoverage =
    organizedSectors /
    sectorCount;


  // ==========================================================
  // ONE-SIDEDNESS
  // ==========================================================

  let strongestHalf =
    0;


  for (
    let start = 0;
    start < sectorCount;
    start++
  ) {

    let halfSum =
      0;


    for (
      let offset = 0;
      offset <
      sectorCount / 2;
      offset++
    ) {

      const index =
        (
          start +
          offset
        ) %
        sectorCount;


      halfSum +=
        support[index];
    }


    strongestHalf =
      Math.max(
        strongestHalf,
        halfSum
      );
  }


  const halfRatio =
    strongestHalf /
    totalSupport;


  const oneSidedness =
    constrainValue(
      (
        halfRatio -
        0.5
      ) /
      0.5,
      0,
      1
    );


  return {

    coverage,

    organizedCoverage,

    oneSidedness

  };
}


// ============================================================
// LOCAL ORIENTATION DIVERSITY
// ============================================================

function calculateOrientationDiversity(
  centerX,
  centerY,

  w,
  h,

  edgeNorm,
  edgeAngle,

  radius
) {

  const bins =
    new Float32Array(8);


  let total =
    0;


  const x1 =
    Math.max(
      1,
      centerX -
      radius
    );


  const x2 =
    Math.min(
      w - 2,
      centerX +
      radius
    );


  const y1 =
    Math.max(
      1,
      centerY -
      radius
    );


  const y2 =
    Math.min(
      h - 2,
      centerY +
      radius
    );


  for (
    let y = y1;
    y <= y2;
    y += 2
  ) {

    for (
      let x = x1;
      x <= x2;
      x += 2
    ) {

      const index =
        x +
        y * w;


      const strength =
        edgeNorm[index];


      if (
        strength <
        0.08
      ) {

        continue;
      }


      const angle =
        edgeAngle[index];


      let bin =
        Math.floor(
          angle /
          Math.PI *
          8
        );


      bin =
        Math.max(
          0,
          Math.min(
            7,
            bin
          )
        );


      bins[bin] +=
        strength;


      total +=
        strength;
    }
  }


  if (
    total <= 0
  ) {

    return 0;
  }


  let entropy =
    0;


  for (
    let i = 0;
    i < bins.length;
    i++
  ) {

    if (
      bins[i] <= 0
    ) {
      continue;
    }


    const probability =
      bins[i] /
      total;


    entropy -=
      probability *
      Math.log(
        probability
      );
  }


  return (
    entropy /
    Math.log(8)
  );
}


// ============================================================
// DIRECTIONAL CONVERGENCE
// ============================================================

function calculateConvergence(
  centerX,
  centerY,

  w,
  h,

  edgeNorm,
  edgeAngle,

  radius
) {

  let support =
    0;


  let totalWeight =
    0;


  const x1 =
    Math.max(
      1,
      centerX -
      radius
    );


  const x2 =
    Math.min(
      w - 2,
      centerX +
      radius
    );


  const y1 =
    Math.max(
      1,
      centerY -
      radius
    );


  const y2 =
    Math.min(
      h - 2,
      centerY +
      radius
    );


  for (
    let y = y1;
    y <= y2;
    y += 4
  ) {

    for (
      let x = x1;
      x <= x2;
      x += 4
    ) {

      const index =
        x +
        y * w;


      const edgeStrength =
        edgeNorm[index];


      if (
        edgeStrength <
        0.10
      ) {

        continue;
      }


      const vx =
        centerX -
        x;


      const vy =
        centerY -
        y;


      const distance =
        Math.sqrt(
          vx * vx +
          vy * vy
        );


      if (
        distance < 3 ||
        distance > radius
      ) {

        continue;
      }


      const towardAngle =
        normalizeLineAngle(
          Math.atan2(
            vy,
            vx
          )
        );


      const lineAngle =
        edgeAngle[index];


      let difference =
        Math.abs(
          towardAngle -
          lineAngle
        );


      if (
        difference >
        Math.PI / 2
      ) {

        difference =
          Math.PI -
          difference;
      }


      const alignment =
        Math.max(
          0,
          Math.cos(
            difference
          )
        );


      const distanceWeight =
        1 -
        distance /
        radius;


      const weight =
        edgeStrength *
        distanceWeight;


      support +=
        alignment *
        weight;


      totalWeight +=
        weight;
    }
  }


  if (
    totalWeight <= 0
  ) {

    return 0;
  }


  return (
    support /
    totalWeight
  );
}


// ============================================================
// AREA OF SQUARE NEIGHBORHOOD INSIDE IMAGE
// ============================================================

function squareAreaWithinImage(
  centerX,
  centerY,
  radius,
  width,
  height
) {

  const x1 =
    Math.max(
      0,
      centerX -
      radius
    );


  const x2 =
    Math.min(
      width - 1,
      centerX +
      radius
    );


  const y1 =
    Math.max(
      0,
      centerY -
      radius
    );


  const y2 =
    Math.min(
      height - 1,
      centerY +
      radius
    );


  return (
    x2 -
    x1 +
    1
  ) *
  (
    y2 -
    y1 +
    1
  );
}


// ============================================================
// RGB DISTANCE
// ============================================================

function rgbDistance(
  r1,
  g1,
  b1,

  r2,
  g2,
  b2
) {

  const dr =
    r1 -
    r2;


  const dg =
    g1 -
    g2;


  const db =
    b1 -
    b2;


  return (
    Math.sqrt(
      dr * dr +
      dg * dg +
      db * db
    ) /
    441.67295593
  );
}


// ============================================================
// NORMALIZE LINE ANGLE TO 0..PI
// ============================================================

function normalizeLineAngle(
  angle
) {

  while (
    angle < 0
  ) {

    angle +=
      Math.PI;
  }


  while (
    angle >=
    Math.PI
  ) {

    angle -=
      Math.PI;
  }


  return angle;
}


// ============================================================
// INTEGRAL IMAGE
// ============================================================

function buildIntegralImage(
  values,
  width,
  height
) {

  const integralWidth =
    width +
    1;


  const integral =
    new Float64Array(
      (
        width +
        1
      ) *
      (
        height +
        1
      )
    );


  for (
    let y = 1;
    y <= height;
    y++
  ) {

    let rowSum =
      0;


    for (
      let x = 1;
      x <= width;
      x++
    ) {

      rowSum +=
        values[
          x -
          1 +
          (
            y -
            1
          ) *
          width
        ];


      integral[
        x +
        y *
        integralWidth
      ] =
        integral[
          x +
          (
            y -
            1
          ) *
          integralWidth
        ] +
        rowSum;
    }
  }


  return integral;
}


// ============================================================
// BOX AVERAGE
// ============================================================

function boxAverage(
  integral,
  width,
  height,

  centerX,
  centerY,

  radius
) {

  const x1 =
    Math.max(
      0,
      centerX -
      radius
    );


  const y1 =
    Math.max(
      0,
      centerY -
      radius
    );


  const x2 =
    Math.min(
      width -
      1,
      centerX +
      radius
    );


  const y2 =
    Math.min(
      height -
      1,
      centerY +
      radius
    );


  const integralWidth =
    width +
    1;


  const ax =
    x1;


  const ay =
    y1;


  const bx =
    x2 +
    1;


  const by =
    y2 +
    1;


  const sum =

    integral[
      bx +
      by *
      integralWidth
    ]

    -

    integral[
      ax +
      by *
      integralWidth
    ]

    -

    integral[
      bx +
      ay *
      integralWidth
    ]

    +

    integral[
      ax +
      ay *
      integralWidth
    ];


  const count =
    (
      x2 -
      x1 +
      1
    ) *
    (
      y2 -
      y1 +
      1
    );


  return (
    count >
    0
  )
    ? sum /
      count

    : 0;
}


// ============================================================
// NEAREST COMPOSITION POINT
// ============================================================

function nearestNormalizedDistance(
  x,
  y,
  points
) {

  let best =
    Infinity;


  for (
    const point of
    points
  ) {

    const dx =
      x -
      point[0];


    const dy =
      y -
      point[1];


    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (
      distance <
      best
    ) {

      best =
        distance;
    }
  }


  return best;
}


// ============================================================
// DEBUG ROUNDING
// ============================================================

function roundDebug(value) {

  return Number(
    value.toFixed(3)
  );
}


// ============================================================
// CLAMP
// ============================================================

function constrainValue(
  value,
  minimum,
  maximum
) {

  return Math.max(
    minimum,
    Math.min(
      maximum,
      value
    )
  );
}