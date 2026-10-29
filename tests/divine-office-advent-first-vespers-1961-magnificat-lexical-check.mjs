import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";
import {reviewPrinted1961LatinMagnificat as review}
 from "../src/office/advent-first-vespers-1961-magnificat-lexical-check.js";
const witness=JSON.parse(readFileSync(new URL(
 "../data/office/research/advent-i-2026-1961-magnificat-print-hashes.json",
 import.meta.url),"utf8"));
const path="Psalterium/Psalmorum/Psalm232";
const raw=[
 "(Canticum B. Mariæ Virginis * Luc. 1:46-55)",
 "1:46 Magníficat + * ánima mea Dóminum.",
 "1:47 Et exsultávit spíritus meus: * in Deo, salutári meo.",
 "1:48 Quia respéxit humilitátem ancíllæ suæ: * ecce enim ex hoc beátam me dicent omnes generatiónes.",
 "1:49 Quia fecit mihi magna qui potens est: * et sanctum nomen ejus.",
 "1:50 Et misericórdia ejus, a progénie in progénies: * timéntibus eum.",
 "1:51 Fecit poténtiam in bráchio suo: * dispérsit supérbos mente cordis sui.",
 "1:52 Depósuit poténtes de sede: * et exaltávit húmiles.",
 "1:53 Esuriéntes implévit bonis: * et dívites dimísit inánes.",
 "1:54 Suscépit Israël púerum suum: * recordátus misericórdiæ suæ.",
 "1:55 Sicut locútus est ad patres nostros: * Ábraham, et sémini ejus in sǽcula."
];
const fixture=()=>({sourceRevision:PIN,sourcePath:path,language:"la",
 sourceBlobSha:"954dd48b23bd1a2da7c8c79dda64e4a50df57f38",
 text:raw.join("\n")});
test("all ten 1961 printed Magnificat verse lexemes match the pinned 1960 Office source",async()=>{
 const r=await review({witness,readCanticleSource:async()=>fixture()});
 assert.equal(r.status,"TEN_PRINTED_MAGNIFICAT_VERSES_LEXICALLY_EQUAL_LIMITED");
 assert.equal(r.printedVerseLexemesMatched,10);
 assert.deepEqual(r.verseReceipts.map(x=>x.verse),
  Array.from({length:10},(_,i)=>"Luke 1:"+(i+46)));
 assert.equal(r.lexicalCanticleWitnessAccepted,true);
 assert.equal(r.fullTypographicCollation,false);
 assert.equal(r.openingGloriaPatriVerified,false);
 assert.equal(r.psalmAntiphonAndDoxologyVerified,false);
 assert.equal(r.wholeHourLiturgicallyCertified,false);
 assert.equal(r.rightsApproved,false);
 assert.equal(r.publishable,false);
});
test("lexically different Magnificat wording must fail even if verse count remains ten",async()=>{
 const substitutions=[
  [4,"nomen ejus.","regnum ejus."],
  [10,"Ábraham,","Jacob,"],
  [2,"salutári","salutáris"],
 ];
 for(const [line,oldText,newText] of substitutions){
  const tampered=[...raw];tampered[line]=tampered[line].replace(oldText,newText);
  assert.notEqual(tampered[line],raw[line],"negative fixture must actually mutate the source");
  const r=await review({witness,readCanticleSource:async()=>({
   ...fixture(),text:tampered.join("\n")
  })});
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.printedVerseLexemesMatched,0);
 }
});
test("missing, reordered and extra canticle verse lines are all rejected",async()=>{
 for(const variant of [
  raw.slice(0,10),
  [raw[0],raw[2],raw[1],...raw.slice(3)],
  [...raw,raw[10]]
 ]){
  const r=await review({witness,readCanticleSource:async()=>({
   ...fixture(),text:variant.join("\n")
  })});
  assert.equal(r.status,"WITHHELD");
 }
});
test("pinned provenance and independent printed witness cannot be replaced",async()=>{
 for(const mutation of [
  x=>{x.sourceRevision="main"},
  x=>{x.sourcePath="Psalterium/Psalmorum/Psalm233"},
  x=>{x.language="fr"},
  x=>{x.sourceBlobSha="wrong"}
 ]){
  const source=fixture();mutation(source);
  assert.equal((await review({witness,readCanticleSource:async()=>source})).status,"WITHHELD");
 }
 for(const mutation of [
  x=>{x.fullHourTextCertified=true},
  x=>{x.fullTypographicCollation=true},
  x=>{x.witness.zeroBasedPdfPage=127},
  x=>{x.verseSha256[0]="f".repeat(64)},
  x=>{x.source.revision="unverified"}
 ]){
  const edited=structuredClone(witness);mutation(edited);
  assert.equal((await review({witness:edited,readCanticleSource:async()=>fixture()})).status,"WITHHELD");
 }
});
test("can run on a single caller-injected source; no annual or network reads",async()=>{
 let n=0;
 const r=await review({witness,readCanticleSource:async requested=>{
  n++;
  assert.equal(requested,path);
  return fixture();
 }});
 assert.equal(n,1);assert.equal(r.publishable,false);
});
