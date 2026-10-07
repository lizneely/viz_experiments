/* Which Way Is Up? — works with a recorded orientation dispute.
   key = IIIF image ID (checked by eye); obj = Access O'Keeffe object number.
   Degrees are clockwise turns of that IIIF image (0 = as Access O'Keeffe shows it).
   record: true marks an orientation the Museum's record treats as right.
   deg: null means a source hung or printed it differently without saying which way.
   Sources for every note: project doc which-way-is-up.md. */
(function(){
const CR = "Catalogue raisonné";
const NB = "O'Keeffe's Abiquiú Notebooks";
window.CR_LABEL = CR; window.NB_LABEL = NB;
window.DISPUTED = [
  { key:870000, obj:8740, title:"D. H. Lawrence Pine Tree", aka:"Called The Lawrence Tree by the Wadsworth", date:"1929", holder:"Wadsworth Atheneum Museum of Art, Hartford",
    kind:"disputed",
    story:"O'Keeffe painted it lying on a bench under the tree, looking up past the trunk into the branches and the night sky. That leaves no ground to tell you which way is down.",
    orients:[
      {deg:[0], src:"O'Keeffe and the catalogue raisonné", who:"O'Keeffe", note:"In a 1931 letter she wrote, \"That tree should stand on its head.\" A 1930 Stieglitz photograph shows it this way, and the Wadsworth says it now shows the painting in keeping with her preference.", record:true},
      {deg:[270], src:"Creative Art magazine, 1931", who:"Creative Art's 1931 printing", note:"Printed it as a vertical. O'Keeffe objected that the bottom edge as printed should be the left side."},
      {deg:[180], src:"The Wadsworth, at times (published accounts)", who:"the Wadsworth in some past installations", note:"Accounts of the painting's history say it has hung with the trunk rising from the bottom edge, the way a tree usually stands."}
    ]},
  { key:713868, obj:8664, title:"Oriental Poppies", date:"1927", holder:"Weisman Art Museum, University of Minnesota",
    kind:"disputed",
    story:"The catalogue raisonné calls its orientation \"subject of debate.\" It has been exhibited both as a horizontal and as a vertical.",
    orients:[
      {deg:[0], src:"Horizontal, as the Weisman lists it", who:"the Weisman", note:"The Weisman gives the size as 30 3/16 × 40 3/16 inches, wider than tall. It's also how Access O'Keeffe shows it.", record:true},
      {deg:[90,270], src:"Vertical, by the stretcher marking", who:"the \"Top\" marked on the stretcher", note:"The backing and the canvas edge on the 30-inch stretcher bar are marked \"Top,\" which points to a vertical. The record doesn't say which long side that is, so either quarter turn counts."}
    ]},
  { key:794526, obj:1056, title:"On the River I", date:"ca. 1965", holder:"Georgia O'Keeffe Museum",
    kind:"both",
    story:"O'Keeffe often said a good abstraction could hang as either a horizontal or a vertical. This one may prove her point.",
    orients:[
      {deg:[90,270], src:"Horizontal, O'Keeffe's documented preference", note:"The Museum's record lists it as 30 1/8 × 40 1/16 inches. Which long edge goes on top isn't recorded, so either quarter turn counts.", record:true},
      {deg:[0], src:"Vertical, as the Museum also shows it", note:"Conservators found hanging hardware on every stretcher bar, a sign it may once have hung as a vertical. The Museum displays it both ways.", record:true}
    ]},
  { key:713826, obj:8564, title:"Grey and White", date:"1925", holder:"Private collection",
    kind:"settled",
    story:"Two records disagree, and an unlikely witness settles it: a silk company's advertising.",
    orients:[
      {deg:[0], src:CR, note:"Confirmed by Cheney Silks, which reproduced the painting in an advertisement in the 1920s.", record:true},
      {deg:[180], src:NB, note:"The notebook photograph shows it upside down."}
    ]},
  { key:794096, obj:8730, title:"White Flower", date:"1929", holder:"Cleveland Museum of Art",
    kind:"settled",
    story:"Seen this close, a flower has no stem to tell you which way is up.",
    orients:[
      {deg:[0], src:CR, note:"The orientation used in the catalogue raisonné.", record:true},
      {deg:[0,180], src:NB, note:"The notebooks record it both this way and upside down."}
    ]},
  { key:793872, obj:8871, title:"Pink Spotted Lily", date:"1936", holder:"Private collection",
    kind:"settled",
    story:"A single lily, nearly symmetrical, floating on a pale ground.",
    orients:[
      {deg:[0], src:CR, note:"The orientation used in the catalogue raisonné. The painting isn't signed, so there's no signature to check.", record:true},
      {deg:[0,180], src:NB, note:"The notebooks orient it both this way and upside down."}
    ]},
  { key:884932, obj:8629, title:"Black Iris", date:"1926", holder:"The Metropolitan Museum of Art",
    kind:"settled",
    story:"Even the museum that owns it has printed it upside down.",
    orients:[
      {deg:[0], src:CR, note:"The orientation used in the catalogue raisonné.", record:true},
      {deg:[180], src:"Two publications, 1973 and 1975", who:"The Met's own 1975 catalogue of acquisitions", note:"Printed upside down in a 1973 survey of 20th-century American art, and in The Met's own Notable Acquisitions, 1965–1975."}
    ]},
  { key:884914, obj:8644, title:"Black Abstraction", date:"1927", holder:"The Metropolitan Museum of Art",
    kind:"settled",
    story:"O'Keeffe described it as the memory of a skylight that whirled and shrank into a black space.",
    orients:[
      {deg:[0], src:CR, note:"The orientation used in the catalogue raisonné.", record:true},
      {deg:null, src:"A 2005 book on O'Keeffe", note:"The catalogue raisonné notes the book printed it in an incorrect orientation, without saying which."}
    ]},
  { key:884917, obj:8261, title:"Blue Lines", date:"1916", holder:"The Metropolitan Museum of Art",
    kind:"settled",
    story:"Two lines and a pool of blue. A few strokes are all there is to go on.",
    orients:[
      {deg:[0], src:CR, note:"The orientation used in the catalogue raisonné.", record:true},
      {deg:null, src:"A 1991 monograph", note:"The catalogue raisonné notes the book printed it in an erroneous orientation, without saying which."}
    ]},
  { key:793888, obj:8910, title:"Lilac, Carnation, Tulip", date:"1938", holder:"Private collection",
    kind:"disputed",
    story:"A small still life. Her own photographic record and the catalogue raisonné turn it different ways.",
    orients:[
      {deg:[0], src:CR, note:"Chosen \"on the basis of image characteristics,\" the record says, rather than from documents.", record:true},
      {deg:[90], src:NB, note:"The notebooks show it with the tulip at lower right."}
    ]},
  { key:862554, obj:8474, title:"Purple Leaves", date:"1922", holder:"Dayton Art Institute",
    kind:"disputed",
    story:"Oak leaves pressed close to the picture plane, with no horizon anywhere.",
    orients:[
      {deg:[0], src:CR, note:"The orientation used in the catalogue raisonné. The back carries O'Keeffe's initials and a star.", record:true},
      {deg:null, src:"Stieglitz's 1924 installation", note:"A photograph of Alfred Stieglitz's 1924 exhibition of her work at the Anderson Galleries in New York shows it hung another way."}
    ]},
  { key:713892, obj:8711, title:"At the Rodeo, New Mexico", date:"1929", holder:"Private collection",
    kind:"disputed",
    story:"Rings of color around a bright center. Even the record that agrees with the catalogue raisonné isn't sure.",
    orients:[
      {deg:[0], src:CR + " and the notebooks", who:"the catalogue raisonné and the notebooks", note:"The Abiquiú Notebooks agree, but someone wrote a question mark on the back of the notebook photograph.", record:true},
      {deg:null, src:"An installation photograph", note:"Shows the painting hung differently, without a note on which way."}
    ]}
];
})();
