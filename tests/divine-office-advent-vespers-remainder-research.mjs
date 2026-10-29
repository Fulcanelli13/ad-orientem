import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {OFFICE_PRECEDENCE_RULESET,OFFICE_PRECEDENCE_SOURCE,reviewOfficeOccurrence}
 from "../src/office/precedence-review.js";
import {reviewOfficeHourHandoff} from "../src/office/reviewed-hour-handoff.js";
import {reviewAdventFirstVespersSourceSequence}
 from "../src/office/advent-first-vespers-source-sequence.js";
import {reviewAdventVespersOrdinaryStructure,reviewAdventVespersVersicleAndMagnificat}
 from "../src/office/advent-vespers-remainder-research.js";

const langs=["la","en","fr"];
const proper="Tempora/Adv1-0";
const major="Psalterium/Special/Major Special";
const psalter="Psalterium/Psalmi/Psalmi major";
const pin=DIVINUM_OFFICIUM_PIN;
const ordinary=`(rubrica altovadensis) #Commemoratio officii parvi B.M.V.
#Incipit
(deinde dicuntur)
$Pater noster
&Deus_in_adjutorium
#Psalmi
#Capitulum Hymnus Versus
(sed rubrica Monastica nisi votiva C12 aut rubrica cisterciensis)
#Capitulum Responsorium Hymnus Versus
#Canticum: Magnificat
#Preces Feriales
(sed rubrica Monastica aut rubrica 1962 omittitur)
#Oratio
#Suffragium
(sed rubrica 196 aut rubrica 1955 omittitur)
(rubrica Barroux et post Octavam Paschæ) #Suffragium
#Conclusio
&Dominus_vobiscum
`;
function occurrence(date,id,kind,position,{first=false,second=true}={}){
 return reviewOfficeOccurrence({
  date,officeCalendarEvidence:"INDEPENDENT_OFFICE_CANDIDATES_RESEARCH",
  localCalendarStatus:"UNIVERSAL_ONLY",
  candidates:[{
   id,date,kind,tablePosition:position,
   class:position<=13?1:position<=21?2:position<=27?3:4,
   ruleset:OFFICE_PRECEDENCE_RULESET,calendarScope:"UNIVERSAL",
   witness:{rubricSource:OFFICE_PRECEDENCE_SOURCE,sourceId:"fixture:"+id},
   printedOfficeCertified:false,sourceTextApproved:false,
   hasFirstVespers:first,hasSecondVespers:second
  }]
 });
}
function handoff(){
 return reviewOfficeHourHandoff({
  civilDate:"2026-11-28",hour:"VESPERS",
  occurrence:occurrence("2026-11-28","saturday-bvm","SATURDAY_BVM",27,{second:false}),
  followingOccurrence:occurrence("2026-11-29","advent-i-2026-11-29","SUNDAY",6,
   {first:true,second:true}),
  selection:{
   date:"2026-11-29",hour:"VESPERS",officePart:"FIRST",
   officeKey:"advent-i-2026-11-29",status:"RESEARCH_SELECTION",
   edition:"ROMAN_1960",sourceRevision:pin,orderedSections:[
    {key:"collect",path:proper,section:"Oratio",role:"COLLECT"}
   ]
  }
 });
}
function fixture({change=()=>{}}={}){
 const calls=[];
 const readSource=async(path,language)=>{
  calls.push([path,language]);
  let map;
  if(path===proper){
   map=new Map([
    ["Ant Laudes",[1,2,3,4,5].map(i=>"Antiphon "+language+" "+i+" * Adventum.")],
    ["Ant 1",["Antiphon "+language+" for Magnificat."]]
   ]);
   if(language==="la"){
    map.set("Ant Vespera",[
     "@:Ant Laudes",
     "(sed rubrica tridentina aut rubrica praedicatorum omittuntur)"
    ]);
    map.set("Versum 1",["@Psalterium/Special/Major Special:Adv Versum 3"]);
   }
  }else if(path===psalter){
   map=new Map([["Day0 Vespera",
    [109,110,111,112,113].map(n=>"Dóminus * laudáte Dóminum.;;"+n)]]);
  }else if(path===major){
   map=new Map([["Adv Versum 3",[
    "V. "+language+" first Advent source versicle.",
    "R. "+language+" first Advent source response."
   ]]]);
  }else map=new Map();
  const doc={sourceRevision:pin,sourcePath:path,language,map};
  change(doc);
  return doc;
 };
 return {calls,readSource};
}
async function sequence(readSource){
 return reviewAdventFirstVespersSourceSequence({
  handoff:handoff(),readSource
 });
}
test("original Vespers Ordinary headings and conditionals are recorded without selecting variants",()=>{
 const r=reviewAdventVespersOrdinaryStructure({
  sourcePath:"Ordinarium/Vespera",sourceRevision:pin,sourceText:ordinary
 });
 assert.equal(r.status,"ORDINARY_ORDER_SOURCE_OBSERVED_CONDITIONAL_UNRESOLVED");
 assert.equal(r.headings.length,8);
 assert.equal(r.headings[3],"#Canticum: Magnificat");
 assert.equal(r.alternateChapterResponsoryHeading,true);
 assert.equal(r.twoSuffragiumSourceVariants,true);
 assert.ok(r.conditionalLineCount>=3);
 assert.equal(r.firstVespersOrdinaryAuthorized,false);
 assert.equal(r.completeHourVerified,false);
 assert.equal(r.publishable,false);
});
test("wrong Ordinary identity, missing source heading and lost variants fail closed",()=>{
 for(const x of [
  {sourceRevision:"0".repeat(40)},
  {sourcePath:"Ordinarium/Laudes"},
  {sourceText:ordinary.replace("#Canticum: Magnificat","")},
  {sourceText:ordinary.replace("#Capitulum Responsorium Hymnus Versus","")},
  {sourceText:ordinary.replaceAll("#Suffragium","#Different")},
  {sourceText:ordinary.replace(/^\([^)]*\)\s*/gm,"")}
 ]){
  const r=reviewAdventVespersOrdinaryStructure({
   sourcePath:"Ordinarium/Vespera",sourceRevision:pin,sourceText:ordinary,...x
  });
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.publishable,false);
 }
});
test("independently reviewed Advent I source research identifies the common versicle in LA EN FR",async()=>{
 const f=fixture(),sourceSequence=await sequence(f.readSource);
 assert.equal(sourceSequence.status,"SOURCE_SEQUENCE_COMPONENTS_MAPPED_UNVERIFIED");
 const r=await reviewAdventVespersVersicleAndMagnificat({
  sourceSequence,readSource:f.readSource
 });
 assert.equal(r.status,"VERSICLE_AND_MAGNIFICAT_ANTIPHON_SOURCES_IDENTIFIED");
 assert.equal(r.sourceSectionsVerified,6);
 assert.deepEqual(Object.keys(r.languages),langs);
 for(const lang of langs){
  assert.equal(r.languages[lang].versicleSourceId,
   "Psalterium/Special/Major Special#Adv Versum 3");
  assert.equal(r.languages[lang].antiphonSourceId,"Tempora/Adv1-0#Ant 1");
  assert.match(r.languages[lang].versicle[0],new RegExp(lang));
  assert.match(r.languages[lang].magnficatAntiphon,new RegExp(lang));
 }
 assert.equal(r.languages.la.latinProperRedirectWitness,"Tempora/Adv1-0#Versum 1");
 assert.equal(r.languages.fr.latinProperRedirectWitness,null);
 assert.equal(f.calls.length,12); // prior 2 sources + new 2, each x 3 locales
 assert.equal(r.completeHourVerified,false);
 assert.equal(r.printedEditionCertified,false);
 assert.equal(r.publishable,false);
});
test("French common Advent versicle may not silently fall back to Latin",async()=>{
 const f=fixture({change:doc=>{
  if(doc.sourcePath===major&&doc.language==="fr")doc.map.delete("Adv Versum 3");
 }});
 const r=await reviewAdventVespersVersicleAndMagnificat({
  sourceSequence:await sequence(f.readSource),readSource:f.readSource
 });
 assert.equal(r.reason,"OFFICE_ADVENT_VESPERS_PROPER_COMPONENTS_INCOMPLETE:fr");
 assert.equal(r.publishable,false);
});
test("changed Latin reference and new French variant must be editorially resolved",async()=>{
 for(const [lang,change,expected] of [
  ["la","wrong","OFFICE_ADVENT_VESPERS_LATIN_VERSICLE_REFERENCE_CHANGED"],
  ["fr","local","OFFICE_ADVENT_VESPERS_LOCAL_VERSICLE_VARIANT:fr"]
 ]){
  const f=fixture({change:doc=>{
   if(doc.sourcePath===proper&&doc.language===lang){
    doc.map.set("Versum 1",change==="wrong"?["@Commune/C1:Versum"]:[
     "Different unreviewed language-local proper verse"
    ]);
   }
  }});
  const r=await reviewAdventVespersVersicleAndMagnificat({
   sourceSequence:await sequence(f.readSource),readSource:f.readSource
  });
  assert.equal(r.reason,expected);
 }
});
test("forged research sequence or wrong pinned leaf identity cannot confer acceptance",async()=>{
 const f=fixture();
 const valid=await sequence(f.readSource);
 let calls=0;
 const rejected=await reviewAdventVespersVersicleAndMagnificat({
  sourceSequence:{...valid,appointedOfficeVerified:true},
  readSource:async()=>{calls++;return {}}
 });
 assert.equal(rejected.reason,"OFFICE_ADVENT_VESPERS_RESEARCH_SEQUENCE_REQUIRED");
 assert.equal(calls,0);
 const other=fixture({change:doc=>{
  if(doc.sourcePath===major&&doc.language==="en")doc.sourceRevision="0".repeat(40);
 }});
 const r=await reviewAdventVespersVersicleAndMagnificat({
  sourceSequence:await sequence(other.readSource),readSource:other.readSource
 });
 assert.equal(r.reason,"OFFICE_ADVENT_VESPERS_PINNED_SOURCE_IDENTITY_INVALID:en");
});
