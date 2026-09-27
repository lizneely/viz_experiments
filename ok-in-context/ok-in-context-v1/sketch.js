// Paste into editor.p5js.org (sketch.js). Fonts fall back to system faces unless you add the Google Fonts link to index.html:
// <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Public+Sans:wght@400;600&family=IBM+Plex+Mono&display=swap">

const RAW = `
6|1875-01-01||1875|h|Suffragettes begin campaigning for an amendment to the United States Constitution|Suffragettes redouble their efforts at franchising women as they begin campaigning for the addition of an amendment to the United States Constitution.|United States||
68|1882-01-01||1882|h|Jim Crow laws go into effect in the American South.|Jim Crow laws, legalizing segregation, go into effect in the American South.|United States||
7|1887-11-15||Nov 15, 1887|g|Georgia O'Keeffe is born near Sun Prairie, Wisconsin.|Georgia Totto O’Keeffe, the second of seven children born to Francis Calyxtus O’Keeffe and Ida Totto O’Keeffe near Sun Prairie, Wisconsin.|Sun Prairie, Wisconsin|Francis O’Keeffe, Ida Totto|
8|1891-01-01||1891|h|World's Columbian Exhibition|The World's Columbian Exhibition, honoring Christopher Columbus, opens in Chicago to wide acclaim.|Chicago||
9|1898-01-01||1898|g|Georgia O'Keeffe begins drawing lessons.|At the age of eleven, Georgia O'Keeffe begins private drawing lessons with her two younger sisters under the instruction of their primary school teacher, Sarah Mann. Later that year, she begins watercolor lessons.|Sacred Heart Academy, Madison, Wisconsin||
10|1899-01-01||1899|g|Georgia O'Keeffe decides to be a painter.|Georgia O'Keeffe announces to a childhood friend, “I am going to be a painter.” She later recalls: “I don’t really know where I got my artist idea . . . I only know that by that time it was settled in my mind.”|United States||
11|1901-01-01||1901|g|Georgia O'Keeffe begins formal art education at Sacred Heart Academy.|Georgia O'Keeffe begins receiving a formal art education at Sacred Heart Academy boarding school in Madison, Wisconsin, approximately twenty miles from Sun Prairie. Following a criticism of scale in one of her drawings, O’Keeffe decides, “I would never have that happen again. I would never, never, draw anything too small.”|Sacred Heart Academy, Madison, Wisconsin||
12|1902-01-01||1902|g|Georgia O'Keeffe's family moves to Williamsburg, Virginia.|Every member in Georgia O'Keeffe's family moves to Williamsburg, Virginia except herself. She stays with her aunt in Madison, Wisconsin.^O'Keeffe's second year of high school proves to be momentous. She recalls it as "the first time my attention was called to the outline and color of any growing thing with the idea of drawing or painting it.”|Williamsburg, Virginia; Madison, Wisconsin||
13|1903-01-01||1903|g|Georgia O'Keeffe joins family in Williamsburg, Virginia.|Georgia O'Keeffe joins her family in Williamsburg and enrolls as a boarding student at Chatham Episcopal Institute in Chatham, Virginia. She majors in art.|Williamsburg, Virginia; Chatham Episcopal Institute, Chatham, Virginia||
211|1903-01-01||1903|a|Alfred Stieglitz publishes the first issue of "Camera Work."|Alfred Stieglitz publishes the first issue of "Camera Work."|New York City|Alfred Stieglitz|
14|1905-01-01||1905|a|Alfred Stieglitz opens "291."|With the help of Edward Steichen, Alfred Stieglitz opens a gallery located on 291 Fifth Avenue in New York City. Eventually it became known as "291."|“291,” New York City|Alfred Stieglitz, Edward Steichen|
15|1905-01-01||1905|g|Georgia O'Keeffe graduates from high school.|Georgia O'Keeffe graduates from high school and in the fall starts attending the School of the art.|||
16|1905-01-02||Fall 1905|g|Georgia O'Keeffe starts attending the School of the Art Institute of Chicago.|Georgia O'Keeffe starts attending the School of the Art Institute of Chicago.|School of the Art Institute of Chicago||
17|1907-01-01||1907|g|Georgia O'Keeffe attends the Art Students League.|Georgia O'Keeffe attends the Art Students League in New York City and studies under William Merritt Chase.|Art Students League, New York City|William Merritt Chase|
18|1908-01-01||1908|g|Georgia O'Keeffe visits "291" to see drawings by Auguste Rodin.|Georgia O'Keeffe visits “291” to see the drawings of Auguste Rodin, the first exhibition of avant-garde European art in the United States.|“291,” New York City|Alfred Stieglitz|
19|1908-01-01||1908|g|Georgia O'Keeffe receives the Chase Award and attends Amitola, the Art Students League's outdoor school in Lake George, New York.|After receiving the esteemed Chase Award, Georgia O'Keeffe attends Amitola, the Art Students League's outdoor school in Lake George, New York for the summer.|Amitola, Lake George, New York||
20|1908-01-02||Fall 1908|g|Georgia O'Keeffe works as a freelance commercial artist.|Georgia O'Keeffe works as a freelance commercial artist for Little Dutch Girl Cleaner in Chicago.|Chicago||
21|1909-01-01||1909|a|Alfred Stieglitz presents his first exhibition of American painters at "291."|Alfred Stieglitz presents his first exhibition of American painters at "291," including John Marin and Marsden Hartley.|“291,” New York City|Alfred Stieglitz, Marsden Hartley, John Marin|
22|1910-01-01||1910|g|Georgia O'Keeffe moves to Charlottesville, Virginia.|Georgia O'Keeffe moves to Charlottesville, Virginia to join her mother and siblings, after contracting the measles.|Charlottesville, Virginia|Ida O'Keeffe|
23|1911-01-01||1911|a|Marius de Zayas organizes the first exhibition of Pablo Picasso's work in the United States at "291."|Marius de Zayas organizes the first exhibition of Pablo Picasso's work in the United States at “291” to criticism and acclaim.|“291,” New York City||
24|1911-01-01||1911|g|Georgia O'Keeffe takes her first teaching position at Chatham Episcopal Institute.|Georgia O'Keeffe takes her first teaching position at Chatham Episcopal Institute in Chatham, Virginia.|Chatham Episcopal Institute, Chatham, Virginia||
25|1912-01-01||Jan 1912|h|New Mexico becomes the forty-seventh state in the Union.|New Mexico becomes the forty-seventh state in the Union.|New Mexico||
26|1912-01-01||1912|a|"Camera Work" publishes excerpts from Wassily Kandinsky's book "Concerning the Spiritual in Art."|Camera Work publishes excerpts from Wassily Kandinsky’s 1911 book "Concerning the Spiritual in Art," which ignites an international discussion regarding the creation of art that does not depict an object.|United States|Alfred Stieglitz, Wassily Kandinsky|
27|1912-01-02||Summer 1912|g|Georgia O'Keeffe attends a class for art teachers at the University of Virginia.|Georgia O'Keeffe attends a summer-school class for art teachers at the University of Virginia taught by Professor Alon Bement from Teachers College, Columbia University in New York City. He introduces her to Arthur Wesley Dow's art practice, a teacher at Columbia University. O’Keeffe adapts her drawing practice to Dow's ideas of abstract and harmonious compositions.|University of Virginia, Charlottesville|Alon Bement, Arthur Wesley Dow|
28|1912-01-03|1914|1912–1914|g|Georgia O'Keeffe accepts a position as the head of the art department in Amarillo, Texas.|Georgia O'Keeffe accepts a position as the head of the art department in the Amarillo, Texas public school district.|Amarillo, Texas||
30|1913-01-01||1913|a|"The International Exhibition of Modern Art," known as the Armory Show, opens in New York City.|"The International Exhibition of Modern Art," known as the Armory Show opened in New York City, introduces American audiences to radical avant-garde art.|New York City||
31|1913-01-02|1916|1913–1916|g|Georgia O'Keeffe begins working as the teaching assistant for Alon Bement.|Georgia O'Keeffe begins a three-year stint working summers as the teaching assistant for Alon Bement at the University of Virginia.|University of Virginia, Charlottesville|Alon Bement|
32|1914-01-01||1914|h|Archduke Franz Ferdinand of Austria is assassinated.|Archduke Franz Ferdinand of Austria is assassinated along with his wife, Sophie, igniting a global crisis.|Austria||
33|1914-01-01|1918|1914–1918|h|Germany commences World War I.|German invasion of France and Belgium commences WWI.|Germany, France, Belgium||
34|1914-01-02||1914|g|Georgia O'Keeffe attends Arthur Wesley Dow's classes at Teachers College.|Georgia O'Keeffe attends Arthur Wesley Dow's classes at Teachers College, Columbia University, New York City.^ ^“This man had one dominating idea: to fill a space in a beautiful way—and that interested me.”-Georgia O'Keeffe|Columbia University, New York City|Arthur Wesley Dow|
35|1914-01-02|1915|1914–1915|g|Georgia O'Keeffe teaches art at Columbia College, South Carolina.|Georgia O'Keeffe teaches art at Columbia College, South Carolina.|Columbia College, Columbia, South Carolina||
36|1914-01-02||1914|g|Georgia O'Keeffe joins the National Woman's Party.|Georgia O'Keeffe joins the National Women’s Party on behalf of women’s suffrage and maintains her membership for many decades.|United States||
37|1915-02-04||Feb 4–25, 1915|g|Georgia O'Keeffe has the first public showing of her artwork.|Georgia O'Keeffe has the first public showing of her artwork. Her Painting Scarlet Sage is included in the annual exhibition of the American Water Color Society at the National Arts Club in New York City.|New York City||
38|1915-01-01||1915|g|Georgia O'Keeffe acquires Wassily Kandinsky's "Concerning the Spiritual in Art."|Georgia O'Keeffe acquires Wassily Kandinsky’s "Concerning the Spiritual in Art" (the first English translation was released in 1914).|United States|Wassily Kandinsky|
40|1916-01-01||1916|a|The "Forum Exhibition of Modern American Painters" opens at the Anderson Galleries.|The Forum Exhibition of Modern American Painters, curated by artist Willard Wright, opens at the Anderson Galleries in New York City as a rejoinder to the Armory Show and its emphasis on Modern European art.|New York City||
41|1916-01-01||Jan 1, 1916|g|Anita Pollitzer shows Alfred Stieglitz Georgia O'Keeffe's abstract drawings.|Anita Pollitzer, a friend of Georgia O'Keeffe, shows Alfred Stieglitz O’Keeffe’s abstract drawings. Stieglitz exhibits ten charcoal drawings on May 23 at "291."|New York City|Anita Pollitzer, Alfred Stieglitz|
43|1916-05-01||May 1, 1916|g|Ida O'Keeffe dies of tuberculosis.|Ida O'Keeffe, Georgia O’Keeffe’s mother, dies of tuberculosis.|United States|Ida O'Keeffe|
42|1916-05-23||May 23, 1916|g|Alfred Stieglitz exhibits ten of Georgia O'Keeffe's abstract drawings at "291."|Alfred Stieglitz exhibits ten of Georgia O'Keeffe's abstract drawings at "291."^ ^“Mr. Stieglitz: If you remember for a week—why you liked my charcoals that Anita Pollitzer showed you—and what they said to you—I would like to know if you want to tell me…. I ask because I wonder if I got over to anyone what I want to say.” - Georgia O'Keeffe|“291,” New York City|Alfred Stieglitz|
44|1916-08-01||Aug 1916|g|Georgia O'Keeffe moves to Canyon, Texas to become head of the art department at West Texas State Normal College.|Georgia O'Keeffe moves to Canyon, Texas to become head of the art department at West Texas State Normal College.|West Texas State Normal College, Canyon, Texas||
45|1916-08-01||Aug 1916|g|Georgia O'Keeffe and Alfred Stieglitz begin a personal correspondence.|Georgia O'Keeffe and Alfred Stieglitz begin a personal correspondence.|Canyon, Texas; New York|Alfred Stieglitz|
39|1916-08-25||Aug 25, 1916|h|The National Park Service is founded under President Woodrow Wilson.|The National Park Service is founded under President Woodrow Wilson. Yellowstone National Park becomes its first protected area.|United States||
48|1917-01-01||1917|g|Alfred Stieglitz begins his photographic portrait of Georgia O'Keeffe.|Alfred Stieglitz begins his photographic portrait of Georgia O'Keeffe.^ ^O’Keeffe to Stieglitz, April 14, 1917: “I really never had a nicer surprise in my life than the [installation] photographs [that arrived] this morning….It was almost like going to 291— ”|United States|Alfred Stieglitz|
47|1917-04-03||Apr 3, 1917|g|Georgia O'Keeffe has her first one-woman show at "291."|Georgia O'Keeffe has her first one-woman show at “291”; she travels to New York to see it. Her first sale is Train at Night in the Desert from 1916 ($400).|“291,” New York City|Alfred Stieglitz|
46|1917-04-06||Apr 6, 1917|h|The United States Congress declares war on Germany.|The United States Congress declares war on Germany.|United States, Germany||
49|1917-05-25||May 25 – Jun 1, 1917|g|Georgia O'Keeffe meets Paul Strand and the Stieglitz Circle.|Georgia O'Keeffe travels to New York City and meets Paul Strand and the Stieglitz circle.|New York City|Paul Strand, Alfred Stieglitz|
50|1917-08-01||Aug 1917|g|Georgia O'Keeffe and her sister Claudia stop in Santa Fe, NM en route to Colorado.|Georgia O'Keeffe and her sister Claudia stop briefly in Santa Fe, New Mexico en route to Colorado. This is Georgia O'Keeffe's first trip to the area.|Santa Fe, New Mexico; Colorado|Claudia O'Keeffe|
51|1918-01-01||1918|a|Gertrude Vanderbilt Whitney founds the Whitney Studio Club in New York City.|Gertrude Vanderbilt Whitney founds the Whitney Studio Club in New York City, which allows young artists to gather and sell work.|New York City|Gertrude Vanderbilt Whitney|
53|1918-01-01||1918|g|Georgia O'Keeffe moves to San Antonio, Texas.|Georgia O'Keeffe moves to San Antonio, Texas to recover from a respiratory illness.|San Antonio, Texas||
54|1918-06-01||Jun 1918|g|Georgia O'Keeffe accepts Alfred Stieglitz's invitation to paint in New York City for one year.|Georgia O’Keeffe accepts Stieglitz’s invitation to paint in New York City with his financial support for one year.|New York City|Alfred Stieglitz|
55|1918-08-01||Aug 1918|g|Georgia O'Keeffe makes her first visit to the Stieglitz family home in Lake George.|Georgia O'Keeffe makes her first visit to Stieglitz’s family home in Lake George, a site that inspires many paintings and a meeting place for artists, writers, and friends of the Stieglitz family.|Lake George, New York|Alfred Stieglitz|
52|1918-11-01||Nov 1918|h|Germany signs an armistice ending World War I.|Germany signs an armistice ending World War I.|Germany||
210|1918-11-06||Nov 6, 1918|g|Francis O'Keeffe, Georgia O'Keeffe's father, dies.|Francis O'Keeffe, Georgia O'Keeffe's father dies. She laments: “Everything is very uncertain today. Papa is dead - . . . and as if to make things more queer - . . .the town is yelling and screaming and ringing and whistling over the Peace news – Ive [sic] just wondered if a day could be much worse.”|United States|Francis O’Keeffe|
56|1919-01-01|1933|1919–1933|a|Walter Gropius founds the Bauhaus in Weimar, Germany.|Walter Gropius founds the Bauhaus in Weimar, Germany with the intent of uniting art and design under one curriculum. It closes under Nazi pressure in 1933.|Bauhaus, Weimar, Germany||
57|1919-01-02||1919|g|Georgia O'Keeffe begins painting cannas at Lake George.|At Lake George, Georgia O'Keeffe begins painting small-scale cannas with cropped and magnified compositions.|Lake George, New York|Alfred Stieglitz|L.1998.10.1 · Red Canna
59|1920-08-01||Aug 1920|g|Georgia O'Keeffe refurbishes a shed at Lake George to use as a studio.|Georgia O'Keeffe refurbishes a shed at Lake George to use as a studio.|Lake George, New York|Alfred Stieglitz|
58|1920-08-18||Aug 18, 1920|h|The Nineteenth Amendment to the U.S. Constitution is ratified, allowing women the right to vote.|The Nineteenth Amendment to the U.S. Constitution is ratified, allowing women the right to vote.|United States||
60|1921-02-01||Feb 1921|g|The Anderson Galleries presents its first exhibition of Alfred Stieglitz's photographs of Georgia O'Keeffe.|The Anderson Galleries presents its first exhibition of Alfred Stieglitz’s photographs of Georgia O’Keeffe.|Anderson Galleries, New York City|Alfred Stieglitz|
61|1922-10-01||Oct 1922|g|Paul Rosenfeld publishes an article on Georgia O'Keeffe's upcoming exhibition at Anderson Galleries in "Vanity Fair."|Paul Rosenfeld publishes an article on Georgia O’Keeffe’s upcoming exhibition at Anderson Galleries in Vanity Fair.|Anderson Galleries, New York City|Paul Rosenfeld|
62|1923-01-29|1946|Jan 29, 1923 – 1946|g|Alfred Stieglitz organizes the first annual solo exhibition of Georgia O'Keeffe's artwork at Anderson Galleries.|Alfred Stieglitz organizes the first annual solo exhibition of Georgia O’Keeffe’s artwork, and her second solo exhibition ever, at Anderson Galleries; this continues yearly until his death in 1946. The show includes over one hundred artworks.|Anderson Galleries, New York City|Alfred Stieglitz|
66|1924-01-01||1924|g|Georgia O'Keeffe begins to create large-scale flower paintings that become iconic.|Georgia O'Keeffe begins to create large-scale flower paintings that become iconic.|||1996.3.2 · Petunia No. 2
63|1924-03-01||Mar 1924|g|Georgia O'Keeffe and Alfred Stieglitz exhibit their work together at Anderson Galleries.|Georgia O’Keeffe and Alfred Stieglitz exhibit their work together at Anderson Galleries (O’Keeffe's exhibition comprises fifty-one paintings; Stieglitz’s exhibition comprises sixty-one photographs).|Anderson Galleries, New York City|Alfred Stieglitz|
64|1924-11-01||Nov 1924|g|Georgia O'Keeffe and Alfred Stieglitz move into their first home.|Georgia O’Keeffe and Alfred Stieglitz move into their first home, 35 East Fifty-eighth Street in New York City.|New York City|Alfred Stieglitz|
65|1924-12-11||Dec 11, 1924|g|Georgia O'Keeffe and Alfred Stieglitz are married.|Georgia O’Keeffe and Alfred Stieglitz are married by a justice of the peace in Cliffside Park, New Jersey.|Cliffside Park, New Jersey|Alfred Stieglitz|
67|1925-01-01||1925|a|F. Scott Fitzgerald publishes "The Great Gatsby."|F. Scott Fitzgerald publishes "The Great Gatsby."|United States||
213|1925-01-01||1925|a|Alain Locke publishes "The New Negro," a collection of writings by African Americans.|Alain Locke publishes, "The New Negro," a collection of writings by African Americans.|United States||
69|1925-03-09||Mar 9, 1925|a|Alfred Stieglitz's exhibition "Seven Americans" opens at Anderson Galleries.|Alfred Stieglitz’s exhibition "Seven Americans" opens at Anderson Galleries, with his photographs and work by Arthur Dove, Marsden Hartley, John Marin, Charles Demuth, Paul Strand and Georgia O’Keeffe.|Anderson Galleries, New York City|Alfred Stieglitz, Arthur Dove, Marsden Hartley, Paul Strand, John Marin, Charles Demuth|
70|1925-11-01||Nov 1925|g|Georgia O'Keeffe and Alfred Stieglitz move into the Shelton Hotel.|Georgia O'Keeffe and Alfred Stieglitz move into the Shelton Hotel, the first skyscraper residence in New York City. From her window perspective, O'Keeffe begins to paint images of the New York cityscape. Her first is "New York Street with Moon."|Shelton Hotel, New York City|Alfred Stieglitz|
71|1925-12-01||Dec 1925|a|Alfred Stieglitz opens the Intimate Gallery.|Alfred Stieglitz opens the Intimate Gallery, a space dedicated to American Modernism. Georgia O’Keeffe exhibits her works in annual shows. She also supervises all gallery installations.|Intimate Gallery, New York City|Alfred Stieglitz|
72|1926-02-01||Feb 1926|g|Georgia O'Keeffe addresses the National Woman's Party in Washington, D.C.|Georgia O'Keeffe addresses the National Women's Party in Washington, D.C.|Washington, D.C.||
73|1926-03-04||Mar 4, 1926|g|Constantin Brancusi praises Georgia O'Keeffe's paintings.|Constantin Brancusi praises Georgia O’Keeffe’s paintings: “There is no imitation of Europe here; it is a force, a liberating free force.”|||
74|1927-01-01||1927|a|Charles Sheeler is commissioned to photograph the Ford Motor Company's plant.|American artist and photographer Charles Sheeler is commissioned to photograph the Ford Motor Company’s plant.|Detroit, Michigan||
75|1927-06-01||Jun 1 – Sep 1, 1927|g|Georgia O'Keeffe's first museum exhibition opens at The Brooklyn Museum of Art, "Paintings by Georgia O'Keeffe."|Georgia O’Keeffe’s first museum exhibition opens at The Brooklyn Museum of Art, "Paintings by Georgia O’Keeffe."|Brooklyn Museum of Art, New York City||
76|1927-07-01||Jul 1927|g|Georgia O'Keeffe undergoes surgery for breast cancer.|Georgia O’Keeffe undergoes surgery for breast cancer, inspiring a unique composition titled, "Black Abstraction."^ ^“I was on a stretcher in a large room, two nurses hovering over me, a very large bright skylight above me…. As the skylight became a small white dot in a black room, I lifted my left arm over my head…. A few weeks later all this became the Black Abstraction.” - Georgia O'Keeffe|||
214|1929-01-01||1929|a|Alfred Stieglitz opens An American Place.|Alfred Stieglitz opens An American Place, where he focuses on showing American Modernists.|||
79|1929-04-01||Apr – Aug 1929|g|Georgia O'Keeffe travels to New Mexico, spending her first summer in Taos.|Georgia O’Keeffe travels to New Mexico with Rebecca Salisbury Strand, spending her first summer in Taos, New Mexico at the home of Mabel Dodge Luhan, instead of Lake George. This opens a new direction in her art and life.|Taos, New Mexico|Rebecca Salsbury James, Mabel Dodge Luhan|
77|1929-10-29||Oct 29, 1929|h|The American Stock Market crashes.|The American Stock Market crashes and precipitates a financial crisis.|United States||
78|1929-10-29||Oct 29, 1929|a|Alfred Stieglitz closes the Intimate Gallery.|Alfred Stieglitz closes the Intimate Gallery and soon after opens An American Place, where he focuses on a showing American Modernists.|Intimate Gallery; An American Place, New York City|Alfred Stieglitz|
80|1929-12-13||Dec 13, 1929|g|Georgia O'Keeffe participates in "Paintings by Nineteen Living Americans," the second exhibition at the Museum of Modern Art.|Five of Georgia O’Keeffe’s paintings are included in "Paintings by Nineteen Living Americans," the second exhibition at the Museum of Modern Art.|Museum of Modern Art, New York City||
81|1930-02-01||Feb – Mar 1930|g|Paintings from Georgia O'Keeffe's trip to New Mexico are exhibited for the first time at An American Place.|Paintings from Georgia O'Keeffe's trip to New Mexico are exhibited for the first time at An American Place gallery along with O’Keeffe’s urban and floral imagery.|An American Place, New York City|Alfred Stieglitz|
82|1930-06-01||Jun – Sep 1930|g|Georgia O'Keeffe returns to Taos for a second summer.|Georgia O’Keeffe returns to Taos for a second summer as a guest of Dodge Luhan.|Taos, New Mexico|Mabel Dodge Luhan|2007.1.22 · Bear Lake, New Mexico; 2006.5.112 and 2006.5.113 · Untitled (Dead Tree Bear Lake Taos)
212|1931-01-01||1931|g|Georgia O'Keeffe begins to paint skulls and bones.|Georgia O'Keeffe begins to paint skulls and bones, gathered in New Mexico, as isolated objects in the tradition of still-life painting.|New Mexico||
83|1931-04-01||Apr 1931|g|Georgia O'Keeffe visits New Mexico for the third time.|Georgia O’Keeffe visits New Mexico for the third time and rents a cottage in Alcalde at the H&M Ranch owned by Marie Tudor Garland; she begins to paint skulls and bones as isolated objects in the tradition of still-life painting.|Alcalde, New Mexico|Marie Tudor Garland|1997.6.38 · Back of Marie's No. 4
85|1932-01-01||1932|h|Amelia Earhart is the first woman to make a transcontinental flight.|Amelia Earhart is the first woman to make a transcontinental flight.|||
86|1932-01-02||Summer 1932|g|Georgia O'Keeffe stays at Lake George with Alfred Stieglitz instead of going to New Mexico.|Georgia O’Keeffe stays at Lake George with Alfred Stieglitz instead of going to New Mexico.|Lake George, New York|Alfred Stieglitz|
87|1932-08-01||Aug 1932|g|Georgia O'Keeffe travels to the Gaspé area of Canada.|Georgia O’Keeffe travels to the Gaspé area of Canada (eastern Quebec) and is inspired to paint landscapes, barns and crosses.|Gaspé, Quebec, Canada||1996.4.1 · Bleeding Heart
84|1932-11-01||Nov 1932|h|Franklin Delano Roosevelt is elected president.|Franklin Delano Roosevelt is elected president.|United States||
88|1933-01-01||1933|a|Bauhaus closes.|The Bauhaus closes under pressure from the German government.|Bauhaus, Weimar, Germany||
90|1933-01-02||1933|g|Georgia O'Keeffe is diagnosed with psychoneurosis.|Georgia O’Keeffe is diagnosed with psychoneurosis and spends two months at Doctor’s Hospital in New York. She recuperates with friends in Bermuda and spends the summer at Lake George.|New York||
89|1933-12-01||Dec 1933|h|President Roosevelt inaugurates the Public Works of Art Project.|President Roosevelt inaugurates the Public Works of Art Project, a federal relief program for artists.|United States||
92|1934-01-01||1934|a|The Metropolitan Museum of Art purchases its first Georgia O'Keeffe painting.|The Metropolitan Museum of Art purchases its first O’Keeffe painting, "Black Hollyhock, Blue Larkspur" from 1929.|The Metropolitan Museum of Art, New York City||
91|1934-01-02||1934|g|Georgia O'Keeffe returns to New Mexico for the first time since 1931.|Georgia O’Keeffe returns to New Mexico for the first time since 1931 and visits Ghost Ranch where she paints high desert land formations.|Ghost Ranch, New Mexico||
93|1935-01-01||1935|h|As part of President Roosevelt’s “New Deal,” the Works Progress Administration is established for visual artists, writers, and musicians.|As part of President Roosevelt’s “New Deal,” the Works Progress Administration is established for visual artists, writers, and musicians.|United States||
94|1935-01-02||1935|g|The Whitney Museum of American Art opens the exhibition "Abstract Painting in America."|The Whitney Museum of American Art opens the exhibition "Abstract Painting in America," which includes five paintings by Georgia O’Keeffe.|Whitney Museum of American Art, New York City||
95|1935-01-02||1935|g|Georgia O'Keeffe paints her first image combining bones, flowers, and the Ghost Ranch landscape.|Georgia O’Keeffe paints her first image combining bones, flowers, and the identifiable landscape of Ghost Ranch.|Ghost Ranch, New Mexico||
96|1936-01-01||1936|a|The Museum of Modern Art opens "Cubism and Abstract Art."|The Museum of Modern Art opens "Cubism and Abstract Art."|Museum of Modern Art, New York City||
98|1936-01-02||1936|g|Georgia O'Keeffe begins painting the "Black Place."|Georgia O’Keeffe begins painting 150 miles west of the Ghost Ranch at a site she calls the “Black Place,” otherwise known as the Bisti Badlands in the Navajo Nation. She later recalled, “It became one of my favorite places to work.”|Bisti Badlands, New Mexico||
97|1936-04-01||Apr 1936|g|Georgia O'Keeffe and Alfred Stieglitz move into an apartment on Fifty-Fourth Street.|Georgia O’Keeffe and Alfred Stieglitz move into an apartment on 405 East Fifty-fourth Street in New York City.|New York City|Alfred Stieglitz|
99|1937-01-01||1937|g|Georgia O'Keeffe stays at Ghost Ranch for the first time.|Georgia O’Keeffe stays for the first time in an adobe house, owned by Arthur Pack, at Ghost Ranch that she buys in 1940.|Ghost Ranch, New Mexico|Arthur Pack|
101|1938-01-01||1938|g|Georgia O'Keeffe receives an honorary Doctor of Fine Arts degree from the College of William and Mary.|Georgia O’Keeffe receives an honorary Doctor of Fine Arts degree from the College of William and Mary in Virginia, the first of many similar awards.|College of William and Mary, Williamsburg, Virginia||
102|1938-01-01||1938|g|Georgia O'Keeffe travels to Yosemite National Park.|Georgia O’Keeffe travels to Yosemite National Park in California with Ansel Adams, David McAlpin, and Godfrey and Helen Rockefeller.|Yosemite National Park, California|Ansel Adams|2006.6.658jj · Untitled (David McAlpin, Al Rhode, Godfrey Rockefeller, Georgia O'Keeffe, and Helen Rockefeller), Ansel Adams
100|1938-02-01||Feb 1938|a|"Life" magazine proclaims Georgia O'Keeffe one of the "country's most prosperous and talked-of painters."|"Life" magazine publishes a four-page spread with photographs by Ansel Adams proclaiming Georgia O’Keeffe as the “country’s most prosperous and talked-of painters.”|United States|Ansel Adams|
103|1939-01-01||1939|a|Pablo Picasso's painting "Guernica" travels to New York, Los Angeles, and Chicago.|Pablo Picasso’s painting Guernica (1937), about the violence of the Spanish Civil War (1936-39), travels to New York, Los Angeles, and Chicago.|New York, Los Angeles, Chicago||
104|1939-01-01||1939|h|Marian Anderson performs a free concert at the Lincoln Memorial after she was denied access to Constitution Hall by the Daughters of the American Revolution.|75,000 people attend African-American contralto Marian Anderson’s free concert at the Lincoln Memorial after she was denied access to Constitution Hall by the Daughters of the American Revolution.|Washington, D.C.||
105|1939-02-01||Feb 1939|g|The Dole Pineapple Company commissions Georgia O'Keeffe to travel to Hawaii and produce pictures of pineapples.|The Dole Pineapple Company commissions Georgia O’Keeffe to travel to Hawaii and produce pictures of pineapples. She later travels on her own to Maui to paint landscapes.|Hawaii; Maui||2009.2.1 · White Bird of Paradise
106|1939-04-01||Apr 1939|g|Georgia O'Keeffe is honored as one of the twelve most accomplished women of the last fifty years at the New York World's Fair, "Building the World of Tomorrow."|Georgia O’Keeffe is honored as one of the twelve most accomplished women of the last fifty years in the New York World’s Fair, "Building the World of Tomorrow."|New York||
107|1940-10-01||Oct 1940|g|Georgia O'Keeffe purchases her first property at Ghost Ranch.|Georgia O’Keeffe purchases her first property: Rancho de los Burros at Ghost Ranch, a home and seven acres where she had stayed every summer since 1936.|Ghost Ranch, New Mexico||1997.6.36 · Untitled (Red and Yellow Cliffs)
109|1941-01-01||1941|h|The Denver & Rio Grande rail line discontinues operation to Española.|The Denver Rio Grande rail line, also known as the Chili Line, which Georgia O’Keeffe used for shipping freight, discontinues operation to the nearby town of Española.|Española, New Mexico||
110|1941-01-02||1941|g|Georgia O'Keeffe takes her first trip by plane.|Georgia O’Keeffe takes the first of her many trips by air. “I am afraid to fly – but after the plane takes off I enjoy what I see from the air and forget the hazards.”|||
108|1941-12-07||Dec 7, 1941|h|The Empire of Japan attacks the U.S. Naval Airbase at Pearl Harbor in Hawaii.|The Empire of Japan attacks the U.S. Naval Airbase at Pearl Harbor in Hawaii. The next day, the United States declares war on Japan and enters World War II.|Pearl Harbor, Hawaii; Japan||
112|1942-01-01||1942|h|The U.S. Army Corps of Engineers and an international group of scientists create a laboratory in Los Alamos.|The U.S. Army Corps of Engineers and an international group of scientists create a laboratory in in Los Alamos, New Mexico to develop the atomic bomb. The site is sixty miles from Georgia O’Keeffe’s home at Ghost Ranch.|Los Alamos, New Mexico||
111|1942-01-02||Summer 1942|h|Alice Paul recruits Georgia O'Keeffe to campaign for an equal rights amendment to the U.S. Constitution.|Alice Paul recruits Georgia O’Keeffe to campaign for an equal rights amendment to the US Constitution that would allow for men and women to be treated equally in the workplace.|United States||
113|1943-01-01||1943|g|The first retrospective of Georgia O'Keeffe's art, "Georgia O'Keeffe's Paintings: 1915-1941," is held at the Art Institute of Chicago.|The first retrospective of Georgia O’Keeffe’s art, "Georgia O’Keeffe’s Paintings: 1915-1941," is held at The Art Institute of Chicago.|The Art Institute of Chicago||
114|1944-01-01||1944|g|Georgia O'Keeffe discovers a new compositional technique with bones.|Georgia O’Keeffe happens on another compositional technique that draws from her previous use of bones. “I had a whole pile of bones in the patio waiting to be painted, and then one day I just happened to hold one up—and there was the sky through the hole. That was enough to start me.”|New Mexico||1997.6.1 · Pelvis IV
117|1945-01-01||1945|a|The Peggy Guggenheim Gallery holds an exhibition featuring abstract expressionists.|The Peggy Guggenheim Gallery exhibit, "A Problem for Critics," includes the work of abstract expressionists Hans Hoffman, Jackson Pollock, Ashile Gorky, Adolph Gotlieb & Mark Rothko.|||
118|1945-01-02||1945|g|Georgia O'Keeffe purchases her second home, a hacienda on three acres of land in Abiquiú, New Mexico.|After many years of negotiating, Georgia O’Keeffe purchases an abandoned hacienda on three acres of land in Abiquiú, New Mexico from the Archdiocese of Santa Fe.^“When I first saw the Abiquiú house it was a ruin with an adobe wall around the garden . . . . a good-sized patio with a long wall with a door on one side. It took me ten years to get it-three more years to fix the house so I could live in it-and after that the wall with a door was painted many times.”^She tasks Maria Chabot with the home’s reconstruction.|Abiquiú, New Mexico|Maria Chabot|RC.2001.2.29a · On the Roof of the Abiquiu House Studio, Looking South, Maria Chabot
115|1945-08-06||Aug 6–9, 1945|h|The United States drops two atomic bombs.|The United States dropped two atomic bombs, the first on Hiroshima and the second on Nagasaki (August 6 and 9). The bombs had previously been tested in Southern New Mexico at the Trinity Site.|Hiroshima; Nagasaki; Trinity Site, New Mexico||
116|1945-09-02||Sep 2, 1945|h|World War II ends.|World War II ends.|||
119|1946-01-01||1946|h|The architect John Gaw Meem constructs the Presbyterian Hospital in Española, New Mexico.|The architect John Gaw Meem constructs the Presbyterian Hospital in Española, New Mexico, enabling the surrounding community’s access to healthcare. Georgia O’Keeffe and actress Greta Garbo are two well-known patients.|Española, New Mexico||
120|1946-05-14||May 14, 1946|g|The Museum of Modern Art honors Georgia O'Keeffe with the first retrospective of a woman.|The Museum of Modern Art honors Georgia O'Keeffe with the first retrospective of a woman.|Museum of Modern Art, New York City||
121|1946-07-13||Jul 13, 1946|g|Alfred Stieglitz dies.|Alfred Stieglitz dies. Georgia O’Keeffe spends the majority of the next two years in New York settling his estate.|New York|Alfred Stieglitz|
122|1947-01-01||1947|h|The House Committee on Un-American Activities blacklists Hollywood writers, directors, and actors.|House Committee on Un-American Activities black-lists Hollywood writers, directors, and actors.|Los Angeles, California||
123|1947-01-02||1947|g|Georgia O'Keeffe helps organize a special exhibition of Alfred Stieglitz's collection at the Museum of Modern Art traveling to the Art Institute of Chicago.|Georgia O’Keeffe helps organize a special exhibition of Alfred Stieglitz’s collection at the Museum of Modern Art traveling to the Art Institute of Chicago.|Museum of Modern Art, New York City; The Art Institute of Chicago|Alfred Stieglitz|
124|1947-01-02||1947|g|Georgia O'Keeffe visits Taliesin West, Frank Lloyd Wright's winter home and school in Scottsdale, Arizona.|Georgia O’Keeffe visits Taliesin West, Frank Lloyd Wright’s winter home and school, in Scottsdale, Arizona.|Taliesin West, Scottsdale, Arizona||
125|1948-01-01||1948|g|Georgia O'Keeffe paints the first abstractions centered on the salita (little room) door.|From the patio of her Abiquiú home, Georgia O’Keeffe paints the first abstractions centered on the salita (little room) door.|Abiquiú, New Mexico||2006.5.204 · In the Patio III
127|1949-01-01||1949|g|Georgia O'Keeffe leaves New York and makes New Mexico her permanent home.|After leaving New York, Georgia O’Keeffe makes New Mexico her permanent home, dividing her time between Abiquiú (winter and spring) and Ghost Ranch (summer and fall).|Abiquiú and Ghost Ranch, New Mexico||
128|1949-01-01||1949|g|Georgia O'Keeffe is elected to the National Institute of Arts and Letters in recognition of her outstanding contributions to the visual arts.|Georgia O’Keeffe is elected to the National Institute of Arts and Letters in recognition of her outstanding contributions to the visual arts.|United States||
126|1949-08-08||Aug 8, 1949|a|"Life" magazine publishes “Jackson Pollock: Is He the Greatest Living Painter in the United States?”|"Life" magazine publishes “Jackson Pollock: Is He the Greatest Living Painter in the United States?”|United States||
129|1950-01-01|1953|1950–1953|h|The United States enters the Korean War.|The United States enters the Korean War, fighting on behalf of South Korea. The conflict ends in 1953.|United States, Korea||
130|1951-01-01||1951|h|"Popular Science" lists its first advertisement for a bomb shelter.|Popular Science lists its first advertisement for a bomb shelter just two years after the Soviet Union successfully tested an atomic bomb. Georgia O’Keeffe later builds an underground shelter on her Abiquiú property.|United States; Abiquiú, New Mexico||
131|1951-01-02||1951|g|Georgia O'Keeffe begins to travel internationally.|Georgia O’Keeffe begins to travel internationally, first embarking to Mexico with writer Spud Johnson. In Mexico City, she meets famed muralist Diego Rivera and his wife and painter, Frida Kahlo, later traveling to the Yucatan with Rosa and Miguel Covarrubias.|Mexico City; Yucatán, Mexico|Miguel Covarrubias, Rose Covarrubias, Diego Rivera, Frida Kahlo|
132|1952-01-01||1952|a|Harold Rosenberg identifies the United States as leading the Abstract Expressionist Movement.|Harold Rosenberg publishes, “The American Action Painters,” in "Art News," identifying the United States as leading the Abstract Expressionist Movement.|United States||
133|1952-01-02||1952|g|Edith Halpert's Downtown Gallery hosts Georgia O'Keeffe's first solo exhibition in the space.|Edith Halpert’s Downtown Gallery hosts Georgia O’Keeffe’s first solo exhibition in the space.|New York City||
134|1953-01-01||1953|a|Robert Rauschenberg creates "Erased de Kooning Drawing."|Robert Rauschenberg creates "Erased de Kooning Drawing," an artwork he made by erasing the marks of its previous maker, Willem de Kooning.|United States||
135|1953-01-02||1953|g|Georgia O'Keeffe visits Europe for the first time.|Georgia O’Keeffe visits Europe for the first time and spends time in France, Germany, and Spain.|France, Germany, Spain||
136|1953-02-01||Feb 1953|g|A retrospective exhibition, "Georgia O'Keeffe: Paintings," opens at the Dallas Museum of Fine Arts.|A retrospective exhibition, "Georgia O’Keeffe: Paintings," opens at the Dallas Museum of Fine Arts.|Dallas Museum of Fine Arts, Dallas, Texas||
137|1954-01-01||1954|a|Jasper Johns paints "Flag."|Jasper Johns paints "Flag," an encaustic painting based on the American Flag.|United States||
138|1954-01-02||1954|g|Georgia O'Keeffe returns to Spain for three months.|Georgia O’Keeffe returns to Spain for three months.|Spain||
139|1954-01-02||1954|g|Alfred Barr, MoMA director, pronounces Georgia O'Keeffe's paintings "among the most memorable in American art."|Alfred Barr, MoMA director, pronounces: “Georgia O’Keeffe has produced few abstract paintings but they are among the most memorable in American art…she has the gift of isolating and intensifying the thing seen, or destroys its scale, until it loses its identity in an ambiguous but always precise beauty.”|Museum of Modern Art, New York City||
141|1955-01-01||1955|a|The Museum of Modern Art opens the photography exhibition "The Family of Man," curated by Edward Steichen.|The Museum of Modern Art opens the photography exhibition, "The Family of Man," curated by Edward Steichen and featuring more than 500 photographs from sixty-nine countries.|Museum of Modern Art, New York City|Edward Steichen|
140|1955-01-01|1975|1955–1975|h|The United States government initiates a conflict in Vietnam.|United States government initiates a conflict in Vietnam which lasted until 1975.|United States, Vietnam||
142|1956-01-01||1956|h|The U.S. Army Corps of Engineers begins construction of the Abiquiú Dam.|The U.S. Army Corp of Engineers embarks on the construction of the Abiquiú Dam, flooding 21,000 acres of land that once formed part of Arthur Pack’s Ghost Ranch property.|Abiquiú and Ghost Ranch, New Mexico|Arthur Pack|
143|1956-01-02||1956|g|Georgia O'Keeffe travels to Peru for three months.|Georgia O’Keeffe travels to Peru for three months where she is inspired to paint landscapes and closely cropped paintings of the wall of Sacsayhuamán in the city of Cusco.|Peru||2006.5.259 · Untitled (Sacsayhuaman)
144|1957-01-01||1957|h|Allen Ginsberg's poem "Howl" is seized at United States Customs.|Written in 1955, Allen Ginsberg’s poem "Howl," which is printed in England, is seized at U.S. customs, based upon the argument that it is too obscene for American audiences.|United States||
145|1957-10-01||Oct 1957|h|The Soviet Union launches the first artificial Earth satellite, "Sputnik."|The Soviet Union launches the first artificial Earth Satellite, Sputnik.|||
146|1959-01-01||Jan 1959|h|Fidel Castro overthrows the Cuban dictator, Fulgencio Batista.|Fidel Castro overthrows the Cuban dictator, Fulgencio Batista. The United States government imposes sanctions on the country for fear of communist uprisings.|Cuba, United States||
147|1959-01-02||1959|g|Georgia O'Keeffe makes the first of several trips around the world.|Georgia O’Keeffe makes the first of several trips around the world, visiting Japan, Hong Kong, India, Singapore, Southeast Asia, Egypt, Iran, Syria, Israel, and Rome. Of her trip, she observes: “By the time I get home I should have seen enough to satisfy me for the rest of my life.”^ ^She begins a series of paintings based on her view of the earth and sky from airplanes.|Japan, Hong Kong, India, Singapore, Southeast Asia, Egypt, Iran, Israel, Rome||
216|1959-01-02||1959|g|Georgia O'Keeffe travels to Southeast Asia, the Far East, India, the Middle East, and Italy.|Trip motivates numerous sketches and paintings of rivers, clouds, and landscape configurations as seen from the air.|||
148|1960-01-01||1960|h|John Fitzgerald Kennedy is elected the forty-fourth president of the United States.|John Fitzgerald Kennedy is elected the forty-fourth present of the United States.|United States||
149|1960-01-02||1960|g|Georgia O'Keeffe embarks on another long-term trip for six weeks.|Georgia O’Keeffe embarks on another long term trip, traveling for six-weeks to Japan, Taiwan, Hong-Kong, and other destinations in Asia and the Pacific Islands.|Japan, Taiwan, Hong Kong||
150|1961-01-01||1961|a|Andy Warhol creates "32 Campbell's Soup Cans."|Andy Warhol creates "32 Campbell’s Soup Cans."|United States|Andy Warhol|
151|1961-01-02||1961|g|Georgia O'Keeffe rafts the Colorado River at age 73.|At age 73, Georgia O’Keeffe rafts the Colorado River on a ten- day trip through Glen Canyon with Todd Webb, Eliot Porter, and other friends from New Mexico.|Glen Canyon, Arizona|Todd Webb, Eliot Porter|
152|1962-01-01||1962|h|John Glenn, Jr. is the first American to orbit the earth.|John Glenn, Jr. is the first American to orbit the earth.|United States||
153|1962-01-02||1962|g|The American Academy of Arts and Letters elects Georgia O'Keeffe as a member.|The American Academy of Arts and Letters, founded by the National Institute of Art and Letters, elects Georgia O’Keeffe as a member.|United States||
154|1963-01-01||1963|h|Betty Friedan publishes "The Feminine Mystique."|Betty Friedan publishes "The Feminine Mystique."|United States||
155|1963-01-01||1963|h|Congress passes the Equal Pay Act to decrease gender disparity.|Congress passes the Equal Pay Act to decrease gender disparity.|United States||
157|1963-01-02||1963|g|Georgia O'Keeffe travels to Greece, Egypt, and the Near East.|Georgia O’Keeffe travels to Greece, Egypt, and the Near East.|Greece, Egypt||
156|1963-11-01||Nov 1963|h|President Kennedy is assassinated in Dallas, Texas.|President Kennedy is assassinated in Dealey Plaza in Dallas, Texas.|Dallas, Texas||
158|1964-01-01||1964|h|The Civil Rights Act is signed into law by President Lyndon B. Johnson.|The Civil Rights Act of 1964 is signed into law by President Lyndon B. Johnson to outlaw discrimination based on race.|United States||
159|1964-01-01||1964|a|Yoko Ono performs "Cut Piece" in Kyoto.|Yoko Ono performs "Cut Piece" in Kyoto, where she invites audience members to cut a piece of her clothing off with scissors.|Kyoto, Japan||
160|1965-01-01||1965|a|Nam June Paik acquires his first portable video camera.|Nam June Paik acquires his first portable video camera.|||
161|1965-01-02||1965|g|Georgia O'Keeffe creates the largest painting of her career, "Sky Above the Clouds IV."|Georgia O’Keeffe creates the largest painting of her career in her garage at Ghost Ranch: "Sky Above the Clouds IV," 1965, 96 x 288 in. (Permanently on view at the Art Institute of Chicago).|Ghost Ranch, New Mexico||
162|1965-01-02||1965|g|The Art Museum at the University of New Mexico presents "Georgia O'Keeffe," the artist's first solo exhibition in her adopted state.|The Art Museum at the University of New Mexico in Albuquerque presents "Georgia O'Keeffe," the artist's first solo exhibition in her adopted state.|UNM Art Museum, Albuquerque, New Mexico||
163|1966-03-01||Mar 1966|g|The Amon Carter Museum of Western Art in Fort Worth, Texas presents "Georgia O'Keeffe: An Exhibition of the Work of the Artist from 1915-1966."|The Amon Carter Museum of Western Art in Fort Worth, Texas presents: "Georgia O’Keeffe: An Exhibition of the Work of the Artist from 1915-1966."|Amon Carter Museum, Fort Worth, Texas||
164|1967-01-01||1967|h|Heavyweight boxing champion of the world Muhammad Ali refuses the draft and is stripped of his title.|Heavyweight boxing champion of the world Muhammed Ali refuses the draft into the United States conflict in Vietnam and is stripped of his title.|United States||
165|1967-01-02||1967|g|"Vogue" magazine publishes an article about Georgia O'Keeffe describing her work as an antecedent to Color Field Abstraction.|"Vogue" magazine publishes an article about Georgia O’Keeffe describing her work as an antecedent to Color Field Abstraction. Cecil Beaton provides photographs for the spread, featuring O’Keeffe in a black kimono.|United States||
166|1967-01-02||1967|g|The School of the Art Institute of Chicago awards Georgia O'Keeffe an honorary doctorate.|The School of the Art Institute of Chicago awards Georgia O’Keeffe with an honorary doctorate.|School of the Art Institute of Chicago||
167|1968-01-01||1968|g|"Life" magazine features Georgia O'Keeffe on the cover, "Georgia O'Keeffe in New Mexico: Stark Visions of a Pioneer Painter."|"Life" magazine features Georgia O’Keeffe on the cover, “Georgia O’Keeffe in New Mexico: Stark Visions of a Pioneer Painter.”|United States||
168|1969-01-01||1969|h|Native American protesters begin an eighteen-month occupation of Alcatraz Island, establishing a precedent for Indian activism.|Native American protesters begin eighteen-month occupation of Alcatraz Island, establishing a precedent for Indian activism.|San Francisco, California||
169|1969-01-01||1969|h|Neil Armstrong becomes the first man to set foot on the moon.|Neil Armstrong and Buzz Aldrin land the lunar module, "Eagle," on the moon. Armstrong becomes the first man to set foot on the lunar surface.|United States||
170|1969-01-02||1969|g|Georgia O’Keeffe is named a Benjamin Franklin Fellow by the Royal Society for the Encouragement of Arts, Manufactures, and Commerce, London.|Georgia O’Keeffe is named a Benjamin Franklin Fellow by the Royal Society for the Encouragement of Arts, Manufactures, and Commerce, London.|London, England||
171|1969-01-02||1969|g|Georgia O'Keeffe travels to Austria.|Georgia O’Keeffe travels to Austria.|Austria||
172|1970-01-01||1970|a|Robert Smithson creates "Spiral Jetty," a land artwork located in the Great Salt Lake in Utah.|Robert Smithson creates "Spiral Jetty" a land artwork located in the Great Salt Lake in Utah.|Great Salt Lake, Utah||
174|1970-01-02||1970|g|The National Institute of Arts and Letters awards Georgia O'Keeffe a gold medal in painting.|The National Institute of Arts and Letters awards Georgia O’Keeffe a gold medal in painting.|United States||
175|1970-10-01||Oct 1970|g|Georgia O'Keeffe installs her retrospective, "Georgia O'Keeffe," at The Whitney Museum of American Art, New York City.|Georgia O’Keeffe installs her retrospective, "Georgia O’Keeffe," at The Whitney Museum of American Art.|Whitney Museum of American Art, New York City||
173|1971-01-01||1971|a|Willoughby Sharp and Liza Bear publish "Avalanche Magazine," an artist journal helmed in New York City.|Willoughby Sharp and Liza Bear publish "Avalanche Magazine," an artist journal helmed in New York City.|New York City||
176|1971-01-01||1971|h|The National Women’s Political Caucus is formed by Gloria Steinem, Bella Abzug, and Betty Friedan.|The National Women’s Political Caucus is formed by Gloria Steinem, Bella Abzug, and Betty Friedan.|United States||
177|1971-01-01||1971|a|The Feminist Art Program is established at California Institute of the Arts.|The Feminist Art Program is established at California Institute of the Arts.|California Institute of the Arts, Valencia||
178|1971-01-02||1971|g|Macular degeneration affects Georgia O’Keeffe’s central vision.|Macular degeneration affects Georgia O’Keeffe’s central vision. She can only see peripherally.|United States||
179|1972-01-01||1972|h|Gloria Steinem founds "Ms. Magazine."|Gloria Steinem founds "Ms. Magazine."|Virginia||
180|1972-01-02||1972|g|Georgia O’Keeffe completes her last unassisted oil painting, "The Beyond."|Georgia O’Keeffe completes her last unassisted oil painting, "The Beyond." Afterward, she stops painting for four years.|United States||2006.5.460 · The Beyond
181|1973-01-01||1973|h|The United States military leaves Vietnam.|The United States military leaves Vietnam.|United States, Vietnam||
182|1973-01-02||1973|g|Georgia O'Keeffe meets the sculptor Juan Hamilton who later becomes her friend, assistant, and representative.|Georgia O’Keeffe meets the sculptor Juan Hamilton who later becomes her friend, assistant, and representative.|United States|Juan Hamilton|
183|1974-01-02||1974|g|The Governor’s Gallery at the New Mexico State Capitol exhibits Georgia O’Keeffe’s paintings of New Mexico in her second solo exhibition in the state.|The Governor’s Gallery at the New Mexico State Capitol exhibits Georgia O’Keeffe’s paintings of New Mexico in her second solo exhibition in the state.|Santa Fe, New Mexico||
184|1974-01-02||1974|g|Georgia O’Keeffe’s agent Doris Bry edits "Some Memories of Drawings," published with O’Keeffe’s words by the University of New Mexico Press.|Georgia O’Keeffe’s agent Doris Bry edits "Some Memories of Drawings," a book of the artist's drawings from 1915-1963, published with O’Keeffe’s words by the University of New Mexico Press.|University of New Mexico Press, Albuquerque|Doris Bry|
185|1974-01-02||1974|g|Georgia O'Keeffe travels to Morocco.|Georgia O'Keeffe travels to Morocco.|Morocco||
186|1976-01-01||1976|a|Nancy Holt completes "Sun Tunnels," a large-scale land artwork oriented according to the summer solstice, in the Great Basin Desert, Utah.|Nancy Holt completes "Sun Tunnels," a large-scale land artwork oriented according to the Summer solstice, in the Great Basin Desert, Utah.|Great Basin Desert, Utah||
187|1976-01-02||1976|g|Georgia O’Keeffe begins painting again with assistance.|Georgia O’Keeffe begins painting again with assistance. Georgia O’Keeffe’s will to create did not diminish with her eyesight, as she declared at ninety: “I can see what I want to paint. The thing that makes you want to create is still there.”|United States||
188|1976-01-02||1976|g|The monograph "Georgia O’Keeffe" is published with 108 paintings and an autobiographical text.|Viking Press publishes the monograph, "Georgia O’Keeffe," with 108 paintings and an autobiographical text.|United States||
189|1976-01-02||1976|g|Georgia O'Keeffe travels to Antigua in the Caribbean.|Georgia O'Keeffe travels to Antigua in the Caribbean.|Antigua and Barbuda||
190|1977-01-01||1977|a|Walter De Maria installs "The Lightning Field" in Quemado, New Mexico.|Walter de Maria installs the "Lightning Field" in Quemado, New Mexico.|Quemado, New Mexico||
191|1977-01-02||1977|g|President Gerald R. Ford presents Georgia O’Keeffe with the Medal of Freedom.|President Gerald R. Ford presents Georgia O’Keeffe with the Medal of Freedom.|United States||
192|1977-01-02||1977|g|Perry Miller Adato’s film "Georgia O’Keeffe" is shown on National Public Television.|Perry Miller Adato’s film, "Georgia O’Keeffe" is shown on National Public Television.|United States||
193|1978-01-01||1978|a|Roger Shimomura creates "Minidoka Series #3," picturing his experience in the Minidoka Relocation Center.|Roger Shimomura creates "Minidoka Series #3," picturing his experience in the Minidoka Relocation Center|Minidoka Relocation Center, Jerome, Idaho||
194|1978-01-02||1978|g|"Georgia O’Keeffe: A Portrait by Alfred Stieglitz" opens at the Metropolitan Museum of Art.|"Georgia O’Keeffe: a Portrait by Alfred Stieglitz" opens at the Metropolitan Museum of Art. Georgia O’Keeffe writes the catalogue that includes images not previously published.|The Metropolitan Museum of Art, New York City|Alfred Stieglitz|
195|1979-01-02||1979|g|Georgia O'Keeffe travels to Costa Rica and Guatemala.|Georgia O'Keeffe travels to Costa Rica and Guatemala.|Costa Rica, Guatemala||
196|1980-01-01||1980|a|The Metropolitan Museum of Art opens the American Wing.|The Metropolitan Museum of Art opens the American Wing.|The Metropolitan Museum of Art, New York City||
197|1980-01-02||1980|g|Georgia O'Keeffe begins to create clay pots with encouragement from Juan Hamilton.|Georgia O'Keeffe begins to create clay pots with encouragement from Juan Hamilton.|United States|Juan Hamilton|
198|1980-01-02||1980|g|Laurie Lisle publishes "Portrait of an Artist: A Biography of Georgia O’Keeffe."|Laurie Lisle publishes "Portrait of an Artist: A Biography of Georgia O’Keeffe."|United States||
199|1981-01-01||1981|a|Jean-Michel Basquiat has his first solo exhibition at Annina Nosei Gallery in New York.|Jean-Michel Basquiat has his first solo exhibition at Annina Nosei Gallery, in New York.|New York||
200|1982-01-01||1982|a|Maya Lin completes the "Vietnam Veterans Memorial" in Washington, D.C.|Maya Lin completes the "Vietnam Veterans Memorial" in Washington, DC to both criticism and acclaim.|Washington, D.C.||
202|1982-01-02||1982|g|Georgia O’Keeffe creates her final abstract sculpture, 11 feet high, included in a show of American sculptors at the San Francisco Museum of Modern Art.|Georgia O’Keeffe creates her final abstract sculpture measuring 11-feet high, which is included in a show of American sculptors at the San Francisco Museum of Modern Art.|San Francisco Museum of Modern Art||
201|1982-05-01||May 1982|g|Georgia O'Keeffe returns to Hawaii.|Georgia O'Keeffe returns to Hawaii.|Hawaii||
203|1983-01-01||1983|g|Georgia O’Keeffe makes her last international trip, to Costa Rica.|At age 96, Georgia O’Keeffe makes her last international trip to Costa Rica.|Costa Rica||
204|1984-01-01||1984|g|Georgia O’Keeffe moves from Abiquiú to Santa Fe.|Georgia O’Keeffe moves from Abiquiú to Santa Fe.|Abiquiú; Santa Fe, New Mexico||
205|1985-01-01||1985|g|President Ronald Reagan presents Georgia O’Keeffe with the National Medal of Arts.|President Ronald Reagan presents Georgia O’Keeffe with the National Medal of Arts.|United States||
207|1986-03-06||Mar 6, 1986|g|Georgia O’Keeffe dies at St. Vincent's Hospital in Santa Fe.|Georgia O’Keeffe dies at St. Vincent's Hospital in Santa Fe. Her ashes are scattered over the landscape of northern New Mexico.|Santa Fe, New Mexico||
206|1986-06-01||1986|a|Keith Haring opens the “Pop Shop,” a store selling t-shirts, toys, magnets and posters with his images.|Artist Keith Haring opens the “Pop Shop,” a store selling t-shirts, toys, magnets and posters with his images.|New York City||
`;

// O'Keeffe in Context — p5.js timeline
// Expects a global RAW string: one event per line,
// id|dateEarliest|endYear|dateLabel|type(g/a/h)|title|text|place|people|object
//
// Controls: drag or trackpad-swipe to pan · scroll wheel or +/- to zoom
// click a dot to pin it · 1 2 3 toggle strands · 0 resets the view

const X0 = 1872, X1 = 1990;
const BORN = 1887 + 10.5 / 12, DIED = 1986 + 2.2 / 12;
const LABEL = { g: "O'Keeffe", a: "Arts events", h: "History & politics" };
const ORDER = ["g", "a", "h"];

let EV = [];
let on = { g: true, a: true, h: true };
let P;                       // current palette
let zoom = 1, pan = 0, tZoom = 1, tPan = 0;
let hover = null, pinned = null;
let dragging = false, dragStartX = 0, panStart = 0, moved = false;
let hits = [];               // clickable UI rectangles drawn on the canvas
let card, t0, reduceMotion = false;
let L = 118, R = 24, TOP = 64, H = 440;
const laneY = { g: 128, a: 275, h: 355 };

const PALETTES = {
  light: { ground: "#EEF0EE", paper: "#F8F9F7", ink: "#1D2226", ink2: "#4C555C", ink3: "#7C868D",
           rule: "#D5DAD8", life: "#E3E8E4", g: "#A3302A", a: "#2E5C88", h: "#6C6A3E" },
  dark:  { ground: "#15191B", paper: "#1C2124", ink: "#E6E9E8", ink2: "#B3BBBF", ink3: "#848E94",
           rule: "#33393D", life: "#22282B", g: "#E8746A", a: "#7FA8D6", h: "#BAB67E" }
};

function pickPalette() {
  const attr = document.documentElement.getAttribute("data-theme");
  const dark = attr ? attr === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  P = dark ? PALETTES.dark : PALETTES.light;
  if (card) styleCard();
}

function parse(raw) {
  const out = raw.trim().split("\n").map(line => {
    const f = line.split("|");
    return { id: f[0], k: f[1], y: +f[1].slice(0, 4), x: f[2] ? +f[2] : null, d: f[3], c: f[4],
             t: f[5], s: f[6], p: f[7] || "", w: f[8] || "", o: f[9] || "" };
  }).sort((a, b) => a.k < b.k ? -1 : a.k > b.k ? 1 : a.id - b.id);
  // stack events that share a year and strand
  const groups = {};
  out.forEach(e => (groups[e.c + e.y] = groups[e.c + e.y] || []).push(e));
  Object.values(groups).forEach(g => g.forEach((e, i) => { e.slot = i; e.n = g.length; }));
  out.forEach((e, i) => e.order = i);
  return out;
}

function stageWidth() {
  const host = document.getElementById("stage");
  return Math.max(320, (host ? host.clientWidth : windowWidth - 32));
}

function setup() {
  EV = parse(RAW);
  pickPalette();
  const c = createCanvas(stageWidth(), H);
  if (document.getElementById("stage")) c.parent("stage");
  c.elt.setAttribute("role", "img");
  c.elt.setAttribute("aria-label", "Timeline of " + EV.length + " events from 1875 to 1986 in three strands: O'Keeffe, arts events, history and politics");
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", pickPalette);
  new MutationObserver(pickPalette).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  card = createDiv("");
  if (document.getElementById("stage")) card.parent(document.getElementById("stage").parentNode);
  card.id("card");
  styleCard();
  showCard(null);
  t0 = millis();
  textFont("Public Sans");
}

function styleCard() {
  card.style("max-width", "760px");
  card.style("min-height", "170px");
  card.style("padding", "14px 0 8px");
  card.style("color", P.ink2);
  card.style("font-family", "'Public Sans', system-ui, sans-serif");
  card.style("font-size", "15px");
  card.style("line-height", "1.55");
}

function windowResized() { resizeCanvas(stageWidth(), H); clampPan(); }

// ---------- scales ----------
function plotW() { return width - L - R; }
function xOf(yr, z = zoom, p = pan) { return L + ((yr - X0) / (X1 - X0)) * plotW() * z + p; }
function yrOf(px, z = tZoom, p = tPan) { return X0 + ((px - L - p) / (plotW() * z)) * (X1 - X0); }
function clampPan() {
  const minP = plotW() - plotW() * tZoom;
  tPan = constrain(tPan, minP, 0);
}
function dotR() { return constrain(3.2 + (zoom - 1) * 0.9, 3.2, 8); }
function yOf(e) {
  const r = dotR(), gap = r * 2 + 2.5;
  if (e.c === "g") return laneY.g + 52 - e.slot * gap;          // O'Keeffe stacks upward
  return laneY[e.c] - ((e.n - 1) / 2 - e.slot) * gap;             // others stack around the lane
}

// ---------- draw ----------
function draw() {
  zoom += (tZoom - zoom) * 0.18;
  pan += (tPan - pan) * 0.18;
  background(P.ground);
  hits = [];

  const top = TOP, bottom = H - 34;

  // lifetime band
  noStroke(); fill(P.life);
  const bx0 = max(L, xOf(BORN)), bx1 = min(width - R, xOf(DIED));
  if (bx1 > bx0) rect(bx0, top, bx1 - bx0, bottom - top);

  // grid + axis labels
  const step = zoom > 5 ? 1 : zoom > 2.2 ? 5 : 10;
  textFont("IBM Plex Mono"); textSize(11); textAlign(CENTER, TOP);
  for (let yr = 1870; yr <= 1990; yr += step) {
    const x = xOf(yr);
    if (x < L - 1 || x > width - R + 1) continue;
    const major = yr % 10 === 0;
    stroke(P.rule); strokeWeight(major ? 1 : 0.5);
    line(x, top, x, bottom);
    noStroke(); fill(major ? P.ink3 : P.rule);
    if (major || step < 10) text(yr, x, bottom + 8);
  }

  // life labels
  textFont("IBM Plex Mono"); textSize(10.5); fill(P.ink3); noStroke();
  if (xOf(BORN) > L && xOf(BORN) < width - R - 60) { textAlign(LEFT, TOP); text("born 1887", xOf(BORN) + 5, top + 6); }
  if (xOf(DIED) > L + 60 && xOf(DIED) < width - R) { textAlign(RIGHT, TOP); text("died 1986", xOf(DIED) - 5, top + 6); }

  // lane labels
  textFont("Public Sans"); textStyle(BOLD); textSize(12); textAlign(RIGHT, CENTER);
  ORDER.forEach(c => {
    fill(on[c] ? P[c] : P.ink3);
    const ly = c === "g" ? laneY.g + 52 : laneY[c];
    text(c === "g" ? "O'Keeffe" : c === "a" ? "Arts" : "History", L - 14, ly);
    stroke(P.rule); strokeWeight(1); drawingContext.setLineDash([2, 4]);
    line(L, ly, width - R, ly); drawingContext.setLineDash([]); noStroke();
  });
  textStyle(NORMAL);

  // events
  const el = millis() - t0, r = dotR();
  let best = null, bestD = 1e9;
  drawingContext.save();
  drawingContext.beginPath(); drawingContext.rect(L - 10, top - 10, plotW() + 20, bottom - top + 20); drawingContext.clip();
  EV.forEach(e => {
    if (!on[e.c]) return;
    const appear = reduceMotion ? 1 : constrain((el - e.order * 7) / 350, 0, 1);
    if (appear <= 0) return;
    const x = xOf(e.y + 0.5), y = yOf(e);
    if (x < L - 20 || x > width - R + 20) return;
    const col = color(P[e.c]);
    if (e.x) {                                   // multi-year span
      col.setAlpha(90); stroke(col); strokeWeight(2.5);
      line(xOf(e.y + 0.5), y, xOf(e.x + 0.5), y); noStroke();
    }
    const isOn = e === hover || e === pinned;
    col.setAlpha(255); fill(col); noStroke();
    const rr = r * easeOutBack(appear) * (isOn ? 1.7 : 1);
    if (e.c === "g") circle(x, y, rr * 2);
    else if (e.c === "a") { push(); translate(x, y); rotate(QUARTER_PI); rectMode(CENTER); rect(0, 0, rr * 1.6, rr * 1.6); pop(); }
    else { rectMode(CENTER); rect(x, y, rr * 1.7, rr * 1.7); rectMode(CORNER); }
    if (e === pinned) { noFill(); stroke(P.ink); strokeWeight(1.5); circle(x, y, rr * 2 + 8); noStroke(); }
    const d = dist(mouseX, mouseY, x, y);
    if (d < max(r + 4, 7) && d < bestD) { best = e; bestD = d; }
  });
  drawingContext.restore();

  if (!dragging) {
    if (best !== hover) { hover = best; showCard(pinned || hover); }
    cursor(hover ? HAND : (mouseY > top && mouseY < bottom && mouseX > L ? MOVE : ARROW));
  }

  // hover label near the dot
  if (hover && hover !== pinned) {
    const x = xOf(hover.y + 0.5), y = yOf(hover);
    const label = hover.d + "  " + clipText(hover.t, 64);
    textFont("Public Sans"); textSize(12.5);
    const w = textWidth(label) + 16;
    let bx = constrain(x - w / 2, 6, width - w - 6), by = y - 36;
    if (by < 4) by = y + 14;
    fill(P.paper); stroke(P.rule); strokeWeight(1); rect(bx, by, w, 24, 4); noStroke();
    fill(P.ink); textAlign(LEFT, CENTER); text(label, bx + 8, by + 12);
  }

  drawControls();
}

function drawControls() {
  textFont("Public Sans"); textSize(13); textAlign(LEFT, CENTER);
  let x = 0; const y = 14, h = 30;
  const counts = { g: 0, a: 0, h: 0 }; EV.forEach(e => counts[e.c]++);
  ORDER.forEach((c, i) => {
    const label = LABEL[c] + "  " + counts[c];
    const w = textWidth(label) + 40;
    if (x + w > width) return;
    const col = color(P[c]);
    stroke(on[c] ? col : color(P.rule)); strokeWeight(1);
    const bg = color(P[c]); bg.setAlpha(on[c] ? 34 : 0);
    fill(P.paper); rect(x, y, w, h, h / 2); fill(bg); rect(x, y, w, h, h / 2);
    noStroke();
    if (on[c]) { fill(col); } else { noFill(); stroke(col); strokeWeight(1.5); }
    circle(x + 16, y + h / 2, 9); noStroke();
    fill(on[c] ? P.ink : P.ink3); text(label, x + 28, y + h / 2 + 1);
    hits.push({ x, y, w, h, fn: () => toggle(c), key: String(i + 1) });
    x += w + 8;
  });
  // zoom buttons on the right
  const btns = [["−", () => zoomAt(width / 2, 1 / 1.6)], ["+", () => zoomAt(width / 2, 1.6)], ["Reset", resetView]];
  let rx = width;
  for (let i = btns.length - 1; i >= 0; i--) {
    const [lab, fn] = btns[i];
    const w = lab.length > 1 ? textWidth(lab) + 24 : 32;
    rx -= w;
    if (rx < x + 4) break;
    fill(P.paper); stroke(P.rule); strokeWeight(1); rect(rx, y, w, h, 6); noStroke();
    fill(P.ink2); textAlign(CENTER, CENTER); text(lab, rx + w / 2, y + h / 2 + 1);
    hits.push({ x: rx, y, w, h, fn });
    rx -= 6;
  }
  textAlign(LEFT, CENTER);
}

// ---------- detail card (HTML under the canvas) ----------
function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function showCard(e) {
  if (!card) return;
  if (!e) {
    card.html(`<div style="font-family:'IBM Plex Mono',monospace;font-size:12.5px;color:${P.ink3}">${EV.length} events · hover a mark to preview · click to pin · drag to pan · scroll or + / − to zoom · keys 1 2 3 toggle strands</div>`);
    return;
  }
  const parts = e.s.split(/\^\s*\^|\^/).map(s => s.trim()).filter(Boolean);
  const body = parts.map((p, i) => i > 0 && /^[“"]/.test(p)
    ? `<p style="margin:10px 0 0;font-family:'Newsreader',Georgia,serif;font-style:italic;font-size:17px;color:${P.ink};border-left:2px solid ${P[e.c]};padding-left:12px">${esc(p)}</p>`
    : `<p style="margin:6px 0 0">${esc(p)}</p>`).join("");
  const meta = [e.p && `<span><b style="font-weight:500;color:${P.ink2}">Place</b> ${esc(e.p)}</span>`,
                e.w && `<span><b style="font-weight:500;color:${P.ink2}">People</b> ${esc(e.w)}</span>`,
                e.o && `<span><b style="font-weight:500;color:${P.ink2}">Object</b> ${esc(e.o)}</span>`].filter(Boolean).join("");
  card.html(`
    <div style="display:flex;gap:12px;align-items:baseline;flex-wrap:wrap">
      <span style="font-family:'IBM Plex Mono',monospace;font-size:13px;color:${P.ink2}">${esc(e.d)}</span>
      <span style="font-size:11px;letter-spacing:.07em;text-transform:uppercase;font-weight:600;color:${P[e.c]}">${LABEL[e.c]}</span>
      ${e === pinned ? `<span style="font-size:12px;color:${P.ink3}">pinned · click empty space to release</span>` : ""}
    </div>
    <div style="font-family:'Newsreader',Georgia,serif;font-size:23px;line-height:1.2;color:${P.ink};margin-top:4px;text-wrap:balance">${esc(e.t)}</div>
    ${body}
    ${meta ? `<div style="display:flex;flex-wrap:wrap;gap:4px 16px;margin-top:10px;font-size:12.5px;color:${P.ink3}">${meta}</div>` : ""}`);
}

// ---------- interaction ----------
function inPlot() { return mouseX > L && mouseX < width - R && mouseY > TOP && mouseY < H - 30; }
function onCanvas() { return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height; }

function mousePressed() {
  if (!onCanvas()) return;
  for (const b of hits) if (mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h) { b.fn(); return false; }
  dragging = true; moved = false; dragStartX = mouseX; panStart = tPan;
}
function mouseDragged() {
  if (!dragging) return;
  if (abs(mouseX - dragStartX) > 3) moved = true;
  tPan = panStart + (mouseX - dragStartX); clampPan(); pan = tPan;
  return false;
}
function mouseReleased() {
  if (!dragging) return;
  dragging = false;
  if (!moved && onCanvas()) {
    pinned = (hover && hover !== pinned) ? hover : null;
    showCard(pinned || hover);
  }
}
function mouseWheel(ev) {
  if (!onCanvas() || !inPlot()) return;
  if (abs(ev.deltaX) > abs(ev.deltaY)) { tPan -= ev.deltaX; clampPan(); }
  else zoomAt(mouseX, ev.deltaY < 0 ? 1.12 : 1 / 1.12);
  return false;
}
function zoomAt(px, f) {
  const yr = yrOf(px);
  tZoom = constrain(tZoom * f, 1, 14);
  tPan = px - L - ((yr - X0) / (X1 - X0)) * plotW() * tZoom;
  clampPan();
}
function resetView() { tZoom = 1; tPan = 0; pinned = null; showCard(null); }
function toggle(c) {
  on[c] = !on[c];
  if (pinned && !on[pinned.c]) { pinned = null; showCard(null); }
}
function keyPressed() {
  if (document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if (key === "1") toggle("g");
  else if (key === "2") toggle("a");
  else if (key === "3") toggle("h");
  else if (key === "+" || key === "=") zoomAt(width / 2, 1.6);
  else if (key === "-" || key === "_") zoomAt(width / 2, 1 / 1.6);
  else if (key === "0") resetView();
  else if (keyCode === LEFT_ARROW) { tPan += 80; clampPan(); }
  else if (keyCode === RIGHT_ARROW) { tPan -= 80; clampPan(); }
  else if (keyCode === ESCAPE) { pinned = null; showCard(hover); }
  else return;
  return false;
}

// ---------- helpers ----------
function clipText(s, n) { return s.length > n ? s.slice(0, n - 1).trim() + "…" : s; }
function easeOutBack(t) { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * pow(t - 1, 3) + c1 * pow(t - 1, 2); }