import assert from "node:assert/strict";
import {projectIcrspNov06ProPapaOrations,ICRSP_NOV06_PRO_PAPA_SOURCE} from "../src/mass/icrsp-nov06-pro-papa-orations.js";
import {selectIcrspFirstFridayLowMass,isExplicitIcrspFirstFridaySelection} from "../src/mass/icrsp-first-friday-entry.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import {composeProperReaderParagraphs} from "../src/mass/proper-reader-composition.js";

const text={lat:"Principal source prayer. Per Dóminum.",en:"Principal source prayer. Through our Lord.",fr:"Prière principale de source. Par Jésus-Christ."};
const proper={sourcePath:"Votive/Pent02-5",introit:text,collects:[text],epistle:text,
 gradual:text,gospel:text,offertory:text,secrets:[text],preface:text,
 communion:text,postcommunions:[text]};
const input={proper,date:"2026-11-06",form:"LOW",
 actualCelebrationId:"sacred_heart",votiveBasis:"first_friday",
 explicitInstituteSelection:true};
const decision=projectIcrspNov06ProPapaOrations(input);
assert.equal(decision.status,"APPLIED",JSON.stringify(decision));
assert.equal(decision.decision.additionalPrayer,"PRO_PAPA");
assert.equal(decision.proper.sourcePath,proper.sourcePath);
assert.equal(proper.collects.length,1,"Source Proper must not be mutated");
for(const group of ["collects","secrets","postcommunions"]){
 const rows=decision.proper[group];
 assert.equal(rows.length,2,group+" must carry principal plus Pro Papa");
 assert.strictEqual(rows[0],proper[group][0],"The principal Mass prayer must not be replaced");
 assert.equal(rows[1].sourcePath,ICRSP_NOV06_PRO_PAPA_SOURCE.prayerPath);
 for(const language of ["lat","en","fr"])assert.ok(rows[1][language].length>60,group+" missing "+language);
}
for(const lang of ["en","fr"]){
 const slot=properToReaderSlots(decision.proper,{language:lang});
 assert.equal(slot.ready,true,"Source-ready "+lang+": "+JSON.stringify(slot.missing));
 for(const key of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"])
  assert.equal(slot.slots[key].data.paragraphs.length,2,key+" "+lang);
 for(const [block,key,kind] of [
  ["AO.SM.B019","COLLECT_SET","COLLECT"],
  ["AO.SM.B088","POSTCOMMUNION_SET","POSTCOMMUNION"]
 ]){
  const paragraphs=composeProperReaderParagraphs(block,slot.slots[key].data.paragraphs,{form:"LOW",language:lang});
  assert.equal(paragraphs.filter(row=>row.prayerRole==="ADDITIONAL_ORATION").length,1,
   kind+" second prayer missing");
  assert.equal(paragraphs.filter(row=>row.prayerRole==="ORATION_INVITATION").length,1,
   kind+" missing second Oremus");
  assert.equal(paragraphs.filter(row=>row.prayerRole==="ORATION_RESPONSE").length,1,
   kind+" missing intermediate Amen");
 }
}
for(const patch of [
 {explicitInstituteSelection:false},{date:"2026-11-07"},
 {form:"SOLEMN"},{form:"MISSA_CANTATA_SIMPLE"},
 {actualCelebrationId:"mass_of_day"},{votiveBasis:"ordinary"},
]){
 const out=projectIcrspNov06ProPapaOrations({...input,...patch});
 assert.equal(out.status,"NOT_APPLICABLE",JSON.stringify(patch));
 assert.strictEqual(out.proper,proper);
}
for(const p of [
 {...proper,sourcePath:"Tempora/Pent23-5"},
 {...proper,postcommunions:[]},
 {...proper,collects:[text,text]},
 {...proper,secrets:[{lat:"Only Latin",en:"",fr:""}]}
]){
 const out=projectIcrspNov06ProPapaOrations({...input,proper:p});
 assert.equal(out.status,"UNVERIFIED","Missing/incorrect source must not be silently admitted");
}
const win={AO_RUNTIME_V8:{store:{getState:()=>({selectedDate:"2026-11-06"})}},
 AO_CELEBRATION_ARCH_V1:{actualCelebration:null,votiveBasis:null,readiness:{loading:false},resolvedProper:proper},
 AO_CELEBRATION_CATALOGUE:{sacred_heart:{type:"votive",path:"Votive/Pent02-5"}},
 AO_CELEBRATION_API:{
  select(id){win.AO_CELEBRATION_ARCH_V1.actualCelebration={id}},
  setVotiveBasis(basis){win.AO_CELEBRATION_ARCH_V1.votiveBasis=basis;return {votiveClass:3,gloria:true,credo:false,status:"permitted"}}
 },AO_R17_BROWSER_ENTRY:{selectTodayOption:(_k,v)=>v==="LOW"}};
assert.equal(isExplicitIcrspFirstFridaySelection({win,dateIso:"2026-11-06"}),false);
assert.equal(selectIcrspFirstFridayLowMass({win,dateIso:"2026-11-06"}).ok,true);
assert.equal(isExplicitIcrspFirstFridaySelection({win,dateIso:"2026-11-06"}),true);
assert.equal(isExplicitIcrspFirstFridaySelection({win,dateIso:"2026-11-07"}),false);
win.AO_CELEBRATION_ARCH_V1.actualCelebration={id:"mass_of_day"};
assert.equal(isExplicitIcrspFirstFridaySelection({win,dateIso:"2026-11-06"}),false);
console.log("PASS: ICRSP 6 Nov exact Pro Papa threefold Ordo; two orations per group EN/FR, second Oremus/Amen, fail-closed other dates and forms");
