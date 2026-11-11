import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
import {buildOrdinaryScholaCardFollowMap} from "../src/mass/reader-schola-card-follow.js";

// Model source paragraphs, not fabricated Latin: use the verified 1962
// Sung donor and its exact curated 65-card Gloria/Credo cue boundaries.
const corpus=JSON.parse(readFileSync(new URL(
 "../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const specs=[
 {track:"KYRIE",section:"AO.CARD.002",block:"AO.SM.B015",setting:"MASS_08",
  groups:[9],expectedSyllables:60,expectedCards:1},
 {track:"GLORIA",section:"AO.CARD.003",block:"AO.SM.B016",setting:"MASS_08",
  groups:[0,11,4],expectedSyllables:196,expectedCards:3},
 {track:"CREDO",section:"AO.CARD.009",block:"AO.SM.B027",setting:"CREDO_03",
  groups:[0,4,4,7],expectedSyllables:366,expectedCards:4},
];
function construct(spec){
 const units=corpus.blocks.find(block=>block.Block_ID===spec.block)?.units
  .filter(unit=>["SCHOLA_PUBLIC","PUBLIC_TEXT"].includes(unit.clock));
 assert.ok(units?.length,spec.block);
 const opening=spec.track==="KYRIE"?[]:[
  {latin:units[0].latin+" "+units[1].latin,
   sourceCueIds:[units[0].cue_id,units[1].cue_id]}
 ];
 const sung=spec.track==="KYRIE"?units:units.slice(2);
 let from=0;
 return spec.groups.map((count,i)=>{
  const chunks=sung.slice(from,from+count);from+=count;
  return {sectionId:spec.section+".CURATED."+i,sourceSectionId:spec.section,
   sequence:i+1,paragraphs:(i===0?opening:[]).concat(chunks.map(u=>({
     latin:u.latin,sourceCueIds:[u.cue_id]
   }))).map((p,j)=>({id:"P"+i+"."+j,kind:"TEXT",
     sourceCueIds:p.sourceCueIds,primary:p.latin}))};
 });
}
for(const spec of specs){
 const score=offlineKyrialeResearchScore(spec.track,spec.setting);
 assert.ok(score?.gabc,spec.track+" original 1961 GABC missing");
 const cards=construct(spec),map=buildOrdinaryScholaCardFollowMap({
  gabc:score.gabc,trackId:spec.track,cards
 });
 assert.equal(map.supported,true,spec.track+" "+map.reason);
 assert.equal(map.anchors.length,spec.track==="KYRIE"?9:16);
 assert.equal(map.count,spec.expectedSyllables);
 const destinations=new Set(map.anchors.map(a=>a.sectionId));
 assert.equal(destinations.size,spec.expectedCards);
 assert.equal(map.cardForIndex(-1),null);
 assert.equal(map.cardForIndex(map.count),null);
 assert.equal(map.cardForIndex(0)?.sectionId,cards[0].sectionId);
 assert.equal(map.cardForIndex(map.count-1)?.sectionId,cards.at(-1).sectionId);
 const cut=cards.slice(0,-1);
 assert.equal(buildOrdinaryScholaCardFollowMap({
   gabc:score.gabc,trackId:spec.track,cards:cut
 }).supported,false,"Missing curated source card must fail closed");
 const tampered=cards.map((card,i)=>i===0?{
   ...card,paragraphs:card.paragraphs.map((p,j)=>j===0
     ?{...p,primary:p.primary+" ALTERED"}:p)
  }:card);
 assert.equal(buildOrdinaryScholaCardFollowMap({
   gabc:score.gabc,trackId:spec.track,cards:tampered
 }).supported,false,"Altered source words must not direct visual reader");
 if(spec.track!=="KYRIE"){
  // The GABC includes the priest's intonation; source card one remains
  // distinct from the choir's actual first Gregorian phrase.
  const choir=corpus.blocks.find(b=>b.Block_ID===spec.block).units
    .find(u=>u.clock==="SCHOLA_PUBLIC" &&
      !["AO.SM.C0054","AO.SM.C0090"].includes(u.cue_id));
  assert.ok(choir?.cue_id);
  const choirCard=cards.find(c=>c.paragraphs.some(p=>p.sourceCueIds.includes(choir.cue_id)));
  assert.equal(choirCard.sectionId,cards[1].sectionId);
 }
 console.log("SCHOLA_CURATED_CARD_SOURCE_MAP_PASS "+spec.track+" "+
  JSON.stringify({cards:destinations.size,syllables:map.count,anchors:map.anchors.length}));
}
