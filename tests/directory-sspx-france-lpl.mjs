import assert from "node:assert/strict";
import {parseLplArchive,parseLplDetail} from "../tools/directory/acquire-sspx-france-lpl.mjs";
const base="https://laportelatine.org";
const archive=parseLplArchive({
  text:'{"query":{"post_type":"lieux"},"found_posts":254,"max_num_pages":11}',
  page:1,
  anchors:[
    {href:base+"/lieux/paris-consolation",text:"Notre-Dame de Consolation"},
    {href:base+"/lieux/villepreux",text:"Prieuré de Villepreux"},
    {href:base+"/lieux/paris-consolation",text:"Duplicate"},
    {href:base+"/lieux/page/2/",text:"Next page"},
    {href:"https://unrelated.test/lieux/fake",text:"Unrelated"},
  ],
});
assert.equal(archive.total,254);
assert.equal(archive.pages,11);
assert.equal(archive.items.length,2);
assert.equal(archive.items[0].slug,"paris-consolation");
assert.equal(parseLplArchive({text:"",page:1,anchors:[]}).total,254);
assert.throws(()=>parseLplArchive({text:'{"found_posts":120,"max_num_pages":4}',page:1,anchors:[]}),/implausible/);
const venue=parseLplDetail({slug:"paris-consolation",url:base+"/lieux/paris-consolation",
  title:"Notre-Dame de Consolation",text:`Notre-Dame de Consolation
Paris 8e
FSSPX District de France
Adresse
23 rue Jean Goujon 75008 Paris
+33 1 43 80 46 93
Messe Dimanche & Fêtes
9h00 (crypte)
10h15 (chapelle)
Messe en Semaine
du lundi au vendredi: 7h45 et 18h30
Télécharger les annonces
`});
assert.equal(venue.issuer_is_sspx_france,true);
assert.equal(venue.mass_candidate,true);
assert.equal(venue.publishable,false);
assert.equal(venue.address_evidence[0],"23 rue Jean Goujon 75008 Paris");
assert.equal(venue.sunday_schedule_evidence[0],"9h00 (crypte)");
const summer=parseLplDetail({slug:"ile-de-re",title:"Summer Chapel",text:`FSSPX District de France
Adresse
Chemin du Grand-Bois 17580 Le Bois-Plage-en-Ré
Messe Dimanche & Fêtes
12h30 messe lue
Seulement en période estivale, tous les dimanches du 19 juillet au 30 août 2026.
Messe en Semaine
`});
assert.equal(summer.mass_candidate,false);
assert.equal(summer.conditional_candidate,true);
assert.equal(summer.review_state,"SEASONAL_OR_DATE_SPECIFIC_HOLD");
const school=parseLplDetail({slug:"school",title:"École",text:`École
FSSPX District de France
Adresse
5 rue du Lycée, 75012 Paris
`});
assert.equal(school.mass_candidate,false);
assert.equal(school.review_state,"NO_PUBLISHED_MASS_SECTION");
const friend=parseLplDetail({slug:"friend",title:"Friend chapel",text:`Fraternité de la Transfiguration
Adresse
6 rue Exemple 75001 Paris
Messe Dimanche & Fêtes
10h00
`});
assert.equal(friend.issuer_is_sspx_france,false);
assert.equal(friend.mass_candidate,false);
assert.equal(friend.review_state,"OTHER_COMMUNITY_OR_OUTSIDE_DISTRICT");
console.log("SSPX France bulk source-parsing safeguards: PASS");
