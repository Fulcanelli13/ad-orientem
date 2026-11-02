import assert from "node:assert/strict";
import {analyzeSelectedPreGospelSource,SCHOLA_PREGOSPEL_BULK_SCHEMA}
 from "../src/mass/reader-schola-pre-gospel-source-boundary.js";
const source={
 "Tempora/Adv4-0":["[Graduale]","!Ps 144:18; 144:21",
 "Prope est Dóminus ómnibus invocántibus eum: ómnibus, qui ínvocant eum in veritáte.",
 "V. Laudem Dómini loquétur os meum: et benedícat omnis caro nomen sanctum ejus. Allelúja, allelúja,",
 "V. Veni, Dómine, et noli tardáre: reláxa facínora plebis tuæ Israël. Allelúja."].join("\n"),
 "Tempora/Pasc3-0":["[Graduale]","Allelúja, allelúja.","!Ps 110:9",
 "V. Redemptiónem misit Dóminus pópulo suo. Allelúja.","!Luc 24:46",
 "V. Oportébat pati Christum, et resúrgere a mórtuis: et ita intráre in glóriam suam. Allelúja."].join("\n"),
 "Tempora/Quad1-0":["[Graduale]","Angelis suis mandávit de te, ut custódiant te in ómnibus viis tuis.",
 "V. In mánibus portábunt te, ne umquam offéndas ad lápidem pedem tuum.",
 "[Tractus]","Qui hábitat in adiutório Altíssimi, in protectióne Dei cæli commorábitur.",
 "V. Dicet Dómino: Suscéptor meus es tu."].join("\n"),
 "Sancti/11-30":["[Graduale]","@Commune/C5:Graduale"].join("\n"),
 "Commune/C5":["[Graduale]","Nimis honoráti sunt amíci tui Deus, nimis confortátus est principátus eórum.",
 "V. Dinumerábo eos et super arénam multiplicabúntur."].join("\n")
};
const abc="abcdef".repeat(11);
const archive={schema:"ao-mass-1961-full-gabc-source-index-v1",count:1195,
 byRole:{
  gr:[{id:"GREGOBASE-1",sha256:abc,gregobaseId:1,normalizedScoreText:
      "Prope est Dominus omnibus invocantibus eum omnibus"},
      {id:"GREGOBASE-2",sha256:abc,gregobaseId:2,normalizedScoreText:
      "Angelis suis mandavit de te ut custodiant"},
      {id:"GREGOBASE-3",sha256:abc,gregobaseId:3,normalizedScoreText:
      "Nimis honorati sunt amici tui Deus nimis"}],
  al:[{id:"GREGOBASE-4",sha256:abc,gregobaseId:4,
       normalizedScoreText:"Veni Domine et noli tardare relaxa facinora"},
      {id:"GREGOBASE-5",sha256:abc,gregobaseId:5,
       normalizedScoreText:"Redemptionem misit Dominus populo suo"},
      {id:"GREGOBASE-6",sha256:abc,gregobaseId:6,
       normalizedScoreText:"Oportebat pati Christum et resurgere a mortuis"}],
  tr:[{id:"GREGOBASE-7",sha256:abc,gregobaseId:7,
       normalizedScoreText:"Qui habitat in adiutorio Altissimi in protectione"}],
  in:[],of:[],co:[]}};
const read=async path=>source[path]?{text:source[path],sha:"a".repeat(40)}:null;
const adv=await analyzeSelectedPreGospelSource({sourcePath:"Tempora/Adv4-0",
 selectedLatin:source["Tempora/Adv4-0"].replace("[Graduale]",""),
 fetchSource:read,archive});
assert.equal(adv.schema,SCHOLA_PREGOSPEL_BULK_SCHEMA);
assert.equal(adv.status,"SELECTED_SOURCE_ROLE_CANDIDATES");
assert.deepEqual(adv.pieces.map(x=>[x.role,x.candidateScoreIds[0]]),[
 ["gr","GREGOBASE-1"],["al","GREGOBASE-4"]]);
assert.equal(adv.approval.publicScores,0);
const pasc=await analyzeSelectedPreGospelSource({sourcePath:"Tempora/Pasc3-0",
 selectedLatin:source["Tempora/Pasc3-0"].replace("[Graduale]",""),fetchSource:read,archive});
assert.deepEqual(pasc.pieces.map(x=>[x.role,x.candidateScoreIds[0]]),[
 ["al","GREGOBASE-5"],["al","GREGOBASE-6"]]);
const lent=await analyzeSelectedPreGospelSource({sourcePath:"Tempora/Quad1-0",
 selectedLatin:source["Tempora/Quad1-0"].replace(/\[[^\]]+\]/g,""),fetchSource:read,archive});
assert.deepEqual(lent.pieces.map(x=>[x.role,x.candidateScoreIds[0]]),[
 ["gr","GREGOBASE-2"],["tr","GREGOBASE-7"]]);
assert.ok(lent.holds.some(x=>x.code==="NO_CERTIFIED_ALLELUIA_BOUNDARY"));
const inherited=await analyzeSelectedPreGospelSource({sourcePath:"Sancti/11-30",
 selectedLatin:source["Commune/C5"].replace("[Graduale]",""),fetchSource:read,archive});
assert.equal(inherited.pieces.length,1);
assert.equal(inherited.pieces[0].candidateScoreIds[0],"GREGOBASE-3");
assert.equal(inherited.pieces[0].sourceOwner,"Commune/C5");
const falseSeason=await analyzeSelectedPreGospelSource({sourcePath:"Tempora/Pasc3-0",
 selectedLatin:"Laudáte Dominum omnes gentes quóniam confirmáta est",fetchSource:read,archive});
assert.equal(falseSeason.pieces.length,0);
assert.ok(falseSeason.holds.some(x=>x.code==="SELECTED_GRADUAL_NOT_ANCHORED_IN_PINNED_SOURCE"));
const forbidden=await analyzeSelectedPreGospelSource({sourcePath:"Bad/File",
 selectedLatin:"Nimis honorati sunt amici tui Deus",fetchSource:read,archive});
assert.equal(forbidden.status,"INVALID_SELECTED_SOURCE");
console.log("PASS Schola source first named pre-Gospel role matching: Advent, Eastertide, Lent, inheritance, seasonal holds, zero publication");
