import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {NOVENA_CORPUS_V4} from "../src/pray/novena-corpus-v4.js";
import {ICKSP_DIVINE_INFANT_KING_NOVENA_V1} from "../src/pray/icksp-divine-infant-king-novena.v1.js";
import {ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1} from "../src/pray/icksp-immaculate-conception-novena.v1.js";
import {NOVENA_HOLY_FACE_1887_B25} from "../src/pray/holy-face-janvier-1887-b25.js";
import {novenaSourceWitnessFaceV1} from "../src/pray/novena-source-witness-face.v1.js";
import {novenaTextSlotsV1} from "../src/pray/prayer-language-coverage.v1.js";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {PRIESTLY_INTERCESSIONS_B19,PRIESTLY_INTERCESSION_PURPOSES_B19,priestlyIntercessionFor} from "../src/pray/priestly-intercessions-b19.js";
import {OCCASIONAL_INTERCESSIONS_B20,OCCASIONAL_PURPOSES_B20,occasionalIntercessionFor} from "../src/pray/occasional-intercessions-b20.js";
import {OCCASIONAL_INTERCESSIONS_B21,OCCASIONAL_PURPOSES_ALL_B21,occasionalIntercessionB21For} from "../src/pray/occasional-intercessions-b21.js";

const filled=v=>typeof v==="string"&&v.trim().length>0;
const known={...NOVENA_CORPUS_V4,
 [ICKSP_DIVINE_INFANT_KING_NOVENA_V1.id]:ICKSP_DIVINE_INFANT_KING_NOVENA_V1,
 [ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1.id]:ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1,
 [NOVENA_HOLY_FACE_1887_B25.id]:NOVENA_HOLY_FACE_1887_B25};
assert.equal(Object.keys(known).length,19,"Novena corpus must retain exactly 19 programmes");
let dayOccasions=0,sourceWitnesses=0,frenchWitnesses=0,visibleFrenchFallbacks=0;
const check=(text,tag)=>{
 const source=typeof text==="string"?{en:text}:text||{};
 assert.ok(["en","fr","la"].some(k=>filled(source[k])),tag+" lacks every source witness");
 const en=novenaSourceWitnessFaceV1(text,"en");
 const fr=novenaSourceWitnessFaceV1(text,"fr");
 for(const [name,face] of [["en",en],["fr",fr]]){
  assert.ok(face.language&&filled(face.text),tag+" invisible in "+name+" UI");
  assert.equal(face.text,source[face.language],tag+" source modified in "+name+" UI");
  assert.equal(face.requestedUnavailable,!filled(source[name]),tag+" locale gap misreported");
 }
 if(filled(source.fr)){
  frenchWitnesses++;
  assert.equal(fr.language,"fr",tag+" must keep attested French text");
 }else{
  visibleFrenchFallbacks++;
  assert.ok(fr.language==="en"||fr.language==="la",tag+" true witness absent");
  assert.equal(fr.fallback,true);
  assert.equal(fr.canToggleEnglish,false,"No false toggle for missing French");
 }
 if(filled(source.en)&&filled(source.fr)){
  assert.equal(fr.canToggleEnglish,true);
  const toggle=novenaSourceWitnessFaceV1(text,"fr",true);
  assert.equal(toggle.language,"en",tag+" English source toggle not reversible");
  assert.equal(toggle.text,source.en,tag+" toggled English source changed");
  assert.equal(novenaSourceWitnessFaceV1(text,"fr",false).text,source.fr,tag+" French return changed");
 }
 sourceWitnesses++;
};
for(const [id,n] of Object.entries(known)){
 assert.equal(n.days.length,9,id+" must retain nine prayer occasions");
 for(let i=0;i<9;i++){
  const text=n.form==="REPEAT_FORM"?n.repeatText:n.days[i].text;
  check(text,id+" day "+(i+1));
  dayOccasions++;
 }
 for(const slot of novenaTextSlotsV1(n)){
  const day=/^days\[(\d+)\]\.text$/.exec(slot.path);
  const value=day?n.days[Number(day[1])-1].text:n[slot.path];
  check(value,id+" "+slot.path);
 }
}
assert.equal(dayOccasions,171);
const holy=known.holy_face_1887;
for(let i=0;i<9;i++){
 const original=holy.days[i].text;
 assert.ok(filled(original.en)&&!filled(original.fr),"Holy Face 1887 remains original English only");
 const face=novenaSourceWitnessFaceV1(original,"fr");
 assert.equal(face.language,"en");
 assert.equal(face.text,original.en);
 assert.equal(face.requestedUnavailable,true);
}
assert.deepEqual(novenaSourceWitnessFaceV1({fr:"Témoin français"},"en"),{
 text:"Témoin français",language:"fr",fallback:true,requestedUnavailable:true,canToggleEnglish:false
});
assert.deepEqual(novenaSourceWitnessFaceV1({la:"Oratio"},"fr"),{
 text:"Oratio",language:"la",fallback:true,requestedUnavailable:true,canToggleEnglish:false
});
assert.equal(novenaSourceWitnessFaceV1({},"fr").language,null);

// All three distinct priestly intercession source families retain period wording.
// The EN/LA selector must truly change the printed source in French UI.
assert.equal(PRIESTLY_INTERCESSION_PURPOSES_B19.length,3);
for(const w of PRIESTLY_INTERCESSIONS_B19){
 for(const ui of ["en","fr"])for(const toggle of [false,true]){
  const face=priestlyIntercessionFor(w.purpose,ui,toggle);
  assert.ok(face&&filled(face.text),w.id+" missing face");
  assert.equal(face.language,w.la?(ui==="fr"?(toggle?"en":"la"):(toggle?"la":"en")):"en");
  assert.equal(face.text,w[face.language]||(face.language==="en"?w.text:null),w.id+" source text differs");
  assert.equal(face.labelOriginal,ui==="fr"&&face.language==="en");
 }
}
for(const purpose of ["vocations","perseverance"]){
 const original=priestlyIntercessionFor(purpose,"fr",false);
 const alternate=priestlyIntercessionFor(purpose,"fr",true);
 assert.equal(original.language,"la");
 assert.equal(alternate.language,"en");
 assert.notEqual(original.text,alternate.text,"French button must not be inert");
}

// The six occasional purposes never invent French/Latin for the 1910–1911
// historical intercessions. Canonical Ad te is reused for difficulties.
assert.equal(OCCASIONAL_PURPOSES_ALL_B21.length,6);
assert.equal(OCCASIONAL_INTERCESSIONS_B20.length,2);
assert.equal(OCCASIONAL_INTERCESSIONS_B21.length,3);
const stJoseph=PRAY_CANONICAL_DATA_V435930.prayers.devotion_ad_te_beate_ioseph;
for(const purpose of OCCASIONAL_PURPOSES_ALL_B21){
 for(const ui of ["en","fr"])for(const alternate of [false,true]){
  const result=OCCASIONAL_PURPOSES_B20.includes(purpose)
   ?occasionalIntercessionFor(purpose,ui,alternate,stJoseph)
   :occasionalIntercessionB21For(purpose,ui,alternate,stJoseph);
  assert.ok(result&&filled(result.text),purpose+" "+ui+" "+alternate+" empty");
  const source=purpose==="difficulties"?stJoseph:
   [...OCCASIONAL_INTERCESSIONS_B20,...OCCASIONAL_INTERCESSIONS_B21].find(x=>x.purpose===purpose);
  assert.ok(source&&filled(source[result.language]),purpose+" used unattested "+result.language);
  assert.equal(result.text,source[result.language],purpose+" source changed");
  if(!source.fr&&ui==="fr"&&result.language==="en")assert.equal(result.labelOriginal,true);
 }
}
assert.equal(occasionalIntercessionB21For("peace","fr",false,stJoseph).language,"la");
assert.equal(occasionalIntercessionB21For("peace","fr",true,stJoseph).language,"en");

const novenaRuntime=readFileSync(new URL("../src/pray/novena-runtime.js",import.meta.url),"utf8");
const sourceRenderer=novenaRuntime.slice(novenaRuntime.indexOf("function sourceWitness(text,label){"),novenaRuntime.indexOf("function canonicalPrayer(id,count=1){"));
assert.ok(sourceRenderer.includes("novenaSourceWitnessFaceV1(text,isFr()?'fr':'en',N.showEnglish)"));
assert.ok(sourceRenderer.includes("data-n1-source-language"));
assert.ok(sourceRenderer.includes("data-n1-proper-source-fallback"));
assert.ok(sourceRenderer.includes("novenaParagraphs(face.text)"));
assert.ok(sourceRenderer.includes("face.canToggleEnglish"));
assert.ok(!sourceRenderer.includes("if(isFr()&&!N.showEnglish&&!fr)"),"Source-only English must not be hidden in French UI");
const presentation=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const priest= presentation.slice(presentation.indexOf("function renderPriestIntercessions(){"),presentation.indexOf("function renderMontfortHistoricalB27(id){"));
assert.ok(priest.includes("p.language==='la'?L('ENGLISH','ANGLAIS')"),"Priests language button must show its actual destination");
assert.ok(priest.includes("lang=\"\'+p.language+\'\""),"Priest source witness language must come from the resolved historical text");
console.log("PASS · "+dayOccasions+" Novena day occasions, "+sourceWitnesses+" source slots, "+frenchWitnesses+" actual French witnesses, "+visibleFrenchFallbacks+" source-labelled gaps; three priestly and six occasional intentions preserve exact originals");
