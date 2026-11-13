import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4} from "../src/pray/novena-corpus-v4.js";
import {prayerSourceFacesV1} from "../src/pray/prayer-source-faces.v1.js";
import {novenaSourceWitnessFaceV1} from "../src/pray/novena-source-witness-face.v1.js";
import {ESSENTIAL_HOLY_CARD_IDS_V1} from "../src/pray/essential-holy-card-parts.js";

const canonical=PRAY_CANONICAL_DATA_V435930.prayers;
const records=Object.values(canonical);
assert.equal(records.length,48,"Core Prayer Library count must remain 48");
assert.equal(new Set(records.map(p=>p.id)).size,48,"Canonical IDs must be unique");
const missing={en:[],fr:[],la:[]};
for(const p of records){
 for(const language of ["en","fr","la"])if(!p[language]?.trim())missing[language].push(p.id);
 const en=prayerSourceFacesV1(p,"en");
 const fr=prayerSourceFacesV1(p,"fr");
 assert.ok(en.vernacular?.trim(),"Every canonical prayer needs an existing language text: "+p.id);
 assert.ok(fr.vernacular?.trim(),"French UI must show an existing witness or honest source fallback: "+p.id);
 assert.equal(en.vernacularLanguage,"en",p.id+" wrong English reading face");
 if(p.fr?.trim()){
  assert.equal(fr.vernacularLanguage,"fr",p.id+" available French not selected");
  assert.equal(fr.fallback,false);
 }else{
  assert.equal(fr.vernacularLanguage,"en",p.id+" fallback must preserve English original");
  assert.equal(fr.fallback,true,p.id+" missing French must be disclosed");
 }
}
assert.deepEqual(missing,{en:[],fr:["marian_consecration_immaculate_heart"],la:["marian_consecration_immaculate_heart"]},
 "Do not invent or silently drop source-held Immaculate Heart language faces");

assert.equal(Object.keys(NOVENA_CORPUS_V4).length,16,"Original 16 novenas must remain separate from supplements");
let english=0,french=0;
for(const [id,n] of Object.entries(NOVENA_CORPUS_V4)){
 assert.equal(n.days.length,9,id+" must have nine occasions");
 for(let i=0;i<9;i++){
  const text=n.form==="REPEAT_FORM"?n.repeatText:n.days[i].text;
  const en=novenaSourceWitnessFaceV1(text,"en");
  const fr=novenaSourceWitnessFaceV1(text,"fr");
  assert.equal(en.language,"en",id+" day "+(i+1)+" English source missing");
  assert.equal(fr.language,"fr",id+" day "+(i+1)+" French reader source missing");
  assert.ok(en.text.trim()&&fr.text.trim(),id+" day "+(i+1)+" empty prayer body");
  english++;french++;
 }
}
assert.equal(english,144);
assert.equal(french,144);

const source=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const start=source.indexOf("function renderPrayerOnly(id)");
const end=source.indexOf("let prayerReturnView=null",start);
assert.ok(start>=0&&end>start,"Standalone reader function must remain extractable");
const standalone=source.slice(start,end);
assert.ok(standalone.includes("const missingUi=p&&!p[lang()]?callout("),
 "Standalone reader must disclose absent UI-language body even when Holy Card returns early");
assert.ok(standalone.includes("${missingUi}${editorialCover}"),
 "Standalone warning must render before the prayer card");
assert.ok(source.includes("const missing=['en','fr','la'].filter(k=>!p[k]),hasUi=!!p[lang()]"),
 "Full Library missing-language disclosure must remain active");
assert.ok(!source.includes("Each opens its verified canonical text."),
 "Text ownership is not independent original-print edition certification");
assert.ok(!source.includes("Chaque carte ouvre son texte canonique vérifié."),
 "French copy must not imply an unsupported full edition certificate");
assert.ok(source.includes("Each opens the existing Prayer Library text, with its source and translation notes."));
assert.ok(source.includes("Chaque carte ouvre le texte existant du Livre de prières, avec les précisions sur la source et les traductions."));

function standaloneHtml(id,ui){
 const ctx={
  P:key=>canonical[key]??null,
  ESSENTIAL_HOLY_CARD_IDS_V1,
  prayerEditorialArtworkMarkup:()=>"",
  head:()=>"",
  prayerReturnView:null,
  PRAYER_READER_PILOT_ENABLED:false,
  // The extracted standalone reader runs without the opt-in A3 integration.
  // Stub its new optional owner so source-language contracts test the default reader.
  paintingA3Prayer:()=>"",
  pilotFocusButton:()=>"",
  esc:String,
  callout:(copy)=>'<aside class="aoP435930Callout rubric">'+copy+'</aside>',
  isFr:()=>ui==="fr",
  L:(en,fr)=>ui==="fr"?fr:en,
  lang:()=>ui,
  prayerBlock:()=>'<article class="aoP435930Prayer"></article>',
  libraryContextMarkup:()=>""
 };
 return vm.runInNewContext(standalone+"\nrenderPrayerOnly("+JSON.stringify(id)+")",ctx,{timeout:1000});
}
const frHeld=standaloneHtml("marian_consecration_immaculate_heart","fr");
assert.match(frHeld,/Aucune traduction vernaculaire n’est disponible/);
assert.match(frHeld,/sans fabriquer de traduction de substitution/);
assert.match(frHeld,/aoP435930Prayer/,"Warning must not replace available prayer body");
assert.doesNotMatch(standaloneHtml("marian_consecration_immaculate_heart","en"),
 /No vernacular translation is available/,"English original needs no false missing-language notice");
assert.doesNotMatch(standaloneHtml("foundations_our_father","fr"),
 /Aucune traduction vernaculaire n’est disponible/,"Do not warn when French is actually present");

console.log("PASS Prayer core reader: 48 EN, 47 FR, 47 LA; French-only-source hold disclosed on standalone Holy Card; 16 original novenas x nine days = 144 EN and 144 FR proper prayer bodies; reader copy never claims print certification.");
