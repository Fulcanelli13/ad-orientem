// Canonical Gospel pericope-to-iconographic-scene correspondence for Sacred Art.
// The same registry is used by the full-year association builder and Sunday
// review: do not retype pericopes into a second independent art calendar.
// Source readings are supplied by the production 1962 DayResolver.
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
export const gospelEpisodes=[
 ["john-baptist-preaching","Luke",3,1,6],
 ["annunciation","Luke",1,26,38],["visitation","Luke",1,39,56],
 ["nativity-john-baptist","Luke",1,57,66],["presentation-jesus","Luke",2,22,38],
 ["adoration-magi","Matthew",2,1,12],["flight-egypt","Matthew",2,13,23],
 ["baptism-christ","Matthew",3,13,17],["baptism-christ","Mark",1,9,11],
 ["baptism-christ","Luke",3,21,22],["good-samaritan","Luke",10,25,37],
 ["woman-at-well","John",4,5,42],["transfiguration","Matthew",17,1,9],
 ["transfiguration","Mark",9,2,10],["transfiguration","Luke",9,28,36],
 ["calling-matthew","Matthew",9,9,13],["calling-matthew","Mark",2,13,17],
 ["calling-matthew","Luke",5,27,32],["agony-garden","Matthew",26,36,46],
 ["agony-garden","Mark",14,32,42],["agony-garden","Luke",22,39,46],
 ["supper-emmaus","Luke",24,13,35],
 ["raising-lazarus","John",11,1,45],
 ["miraculous-catch","Luke",5,1,11],
 ["presentation-jesus","Luke",2,22,38],
 ["nativity","Luke",2,15,20],
 ["adoration-shepherds","Luke",2,15,20],
 ["finding-jesus-temple","Luke",2,42,52],
 ["wise-foolish-virgins","Matthew",25,1,13],
 ["talents","Matthew",25,14,23],
 ["last-judgment","Matthew",25,31,46],
 ["keys-to-peter","Matthew",16,13,19],
 ["raising-widows-son","Luke",7,11,16],
 ["tribute-money","Matthew",22,15,21],
 ["healing-paralytic","Matthew",9,1,8],
 ["lost-sheep","Luke",15,1,7],
 ["great-supper","Luke",14,16,24],
 ["wedding-feast","Matthew",22,1,14],
 ["unforgiving-servant","Matthew",18,23,35],
 ["publican-pharisee","Luke",18,9,14],
 ["laborers-vineyard","Matthew",20,1,16],
 ["parable-sower","Luke",8,4,15],
 ["centurion-servant","Matthew",8,5,13],
 ["raising-jairus","Matthew",9,18,26],
 ["christ-and-children","Matthew",18,1,5],
 ["ten-lepers-scene","Luke",17,11,19],
 ["canaanite-woman","Matthew",15,21,28],
 ["anointing-bethany","John",12,1,9],
 ["exorcism-mute","Luke",11,14,28],
 ["peter-denial","Matthew",26,69,75],
 ["peter-denial","Mark",14,66,72],
 ["peter-denial","Luke",22,54,62],
 ["peter-denial","John",18,15,27],
 ["cleansing-temple","Luke",19,45,46],
 ["parable-vine","John",15,1,7],
 ["healing-deaf-mute","Mark",7,31,37],
 ["healing-leper","Matthew",8,1,4],
 ["feeding-four-thousand","Mark",8,1,9],
 ["feeding-five-thousand","John",6,1,15],
 ["feeding-five-thousand","Matthew",14,13,21],
 ["good-shepherd","John",10,11,16],
 ["wedding-cana","John",2,1,11],
 ["doubting-thomas","John",20,24,29],
 ["raising-jairus-daughter","Mark",5,21,43],
 ["noli-me-tangere","John",20,11,18]
];
const books={mt:"Matthew",matthew:"Matthew",mk:"Mark",mark:"Mark",mc:"Mark",
 lk:"Luke",luke:"Luke",lc:"Luke",jn:"John",joh:"John",john:"John"};
export const matchesGospelEpisode=(p,row)=>p&&books[norm(p.book).replaceAll(" ","")]===row[1]
 &&Number(p.chapter)===row[2]&&Number(p.verseStart)<=row[4]&&Number(p.verseEnd)>=row[3];

export const gospelSceneKeys=passage=>[...new Set(gospelEpisodes.filter(e=>matchesGospelEpisode(passage,e)).map(e=>e[0]))];
