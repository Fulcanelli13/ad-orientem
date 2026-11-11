import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {COMMUNION_TREASURY_V383} from "../src/pray/traditional-pray-data.js";
import {prayerSourceFacesV1} from "../src/pray/prayer-source-faces.v1.js";

const rows=Object.entries(COMMUNION_TREASURY_V383).filter(([id])=>id!=="sources");
const englishOnlyIds=[
 "thanksgivingMyGoodJesus","eucharisticHeartAspiration",
 "holySpiritAugustineTraditional","ourLadyAfterCommunionTraditional",
 "mercifulJesusDying1911","sacredHeartIntercession1910"
];
assert.equal(rows.length,11,"The existing 11 Communion works must not be expanded or truncated");
const englishOnly=rows.filter(([,p])=>!!p.en&&!p.fr&&!p.la).map(([id])=>id);
assert.deepEqual(englishOnly,englishOnlyIds,"Review any change to the six historical English-only witnesses");
assert.equal(rows.filter(([,p])=>!!p.en&&!!p.fr&&!!p.la).length,5);
for(const [id,p] of rows){
 const french=prayerSourceFacesV1(p,"fr");
 const english=prayerSourceFacesV1(p,"en");
 assert.ok(english.vernacular.length>40,id+" must preserve original English body");
 assert.equal(english.vernacularLanguage,"en",id+" English reading face");
 assert.equal(english.fallback,false,id+" original English source is not a fallback");
 assert.ok(french.vernacular.length>40,id+" French UI must show an available source witness");
 if(englishOnlyIds.includes(id)){
  assert.equal(french.vernacularLanguage,"en",id+" must not claim invented French");
  assert.equal(french.fallback,true,id+" missing French requires disclosure");
  assert.equal(french.latin,"",id+" no new Latin");
  assert.ok(p.sourceUrl?.startsWith("https://"),id+" require source pointer");
 }else{
  assert.equal(french.vernacularLanguage,"fr",id+" must display actual French");
  assert.equal(french.fallback,false,id+" must not warn about an existing French prayer");
  assert.ok(french.latin.length>10,id+" must retain the Latin face");
 }
}
const runtime=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
assert.doesNotMatch(runtime,/retained only where the French Catholic tradition is also attested/);
assert.doesNotMatch(runtime,/retenues seulement lorsqu’elles sont également attestées dans la tradition catholique française/);
assert.match(runtime,/Some entries have only an English historical witness here/);
assert.match(runtime,/Certaines n’ont ici qu’un témoin anglais/);

function extract(start,end){
 const a=runtime.indexOf(start),b=runtime.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,"Cannot extract renderer "+start);
 return runtime.slice(a,b);
}
const warning=extract("function traditionalSourceFallbackNotice(face){","function prayerCard(");
const card=extract("function sourcedPrayerCard(item,label,{","const HEART_STAGES=");
function render(item,locale){
 const ctx={
  prayerSourceFacesV1,
  isFr:()=>locale==="fr",
  L:(en,fr)=>locale==="fr"?fr:en,
  esc:v=>String(v??""),
  nl:v=>String(v??""),
  existingLatinSwitch:()=>'',
  source:(title,url)=>'<a data-source="'+url+'">'+title+'</a>'
 };
 return vm.runInNewContext(warning+"\n"+card+"\nsourcedPrayerCard(item,'Test prayer',{focusParagraphs:false})",
  {...ctx,item},{timeout:1000});
}
for(const [id,item] of rows){
 const fr=render(item,"fr"),en=render(item,"en");
 if(englishOnlyIds.includes(id)){
  assert.match(fr,/data-tp381-source-language-fallback/,id+" silent fallback in French UI");
  assert.match(fr,/Texte source anglais affiché ; aucune traduction française n’est revendiquée/,id+" required French provenance notice");
  assert.match(fr,/lang="en"/,id+" original English body must carry English lang attribute");
  assert.ok(fr.includes('data-source="'+item.sourceUrl+'"'),id+" source URL omitted in actual reader");
 }else{
  assert.doesNotMatch(fr,/data-tp381-source-language-fallback/,id+" false fallback warning");
  assert.match(fr,/data-face-v lang="fr"/,id+" actual French body must display");
  assert.match(fr,/data-face-la lang="la"/,id+" available Latin face must remain switchable");
 }
 assert.doesNotMatch(en,/data-tp381-source-language-fallback/,id+" false notice for English original");
}
console.log("PASS Communion Treasury: all 11 source works retain complete bodies; 6 English-only prayers disclose French fallback and source URL; 5 trilingual prayers retain FR/Latin; guidance truthful.");
