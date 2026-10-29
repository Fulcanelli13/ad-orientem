import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";
import {reviewAdventIPrintedLatinProper as review}
 from "../src/office/advent-i-2026-proper-printed-latin.js";
const properPath="Tempora/Adv1-0",ordinaryPath="Psalterium/Special/Major Special";
const witness=JSON.parse(readFileSync(new URL(
 "../data/office/research/advent-i-2026-proper-full-2009-print.json",import.meta.url),"utf8"));
const hymnStanzas=[
 ["{:H-VespAdv:}v. Creátor alme síderum,","Ætérna lux credéntium,",
  "Jesu, Redémptor ómnium,","Inténde votis súpplicum."],
 ["Qui dǽmonis ne fráudibus","Períret orbis, ímpetu",
  "Amóris actus, lánguidi","Mundi medéla factus es."],
 ["Commúne qui mundi nefas","Ut expiáres, ad crucem",
  "E Vírginis sacrário","Intácta prodis víctima."],
 ["Cujus potéstas glóriæ","Noménque cum primum sonat,",
  "Et cǽlites et ínferi","Treménte curvántur genu."],
 ["Te deprecámur últimæ","Magnum diéi Júdicem,",
  "Armis supérnæ grátiæ","Defénde nos ab hóstibus."],
 ["Virtus, honor, laus, glória","Deo Patri cum Fílio,",
  "Sancto simul Paráclito,","In sæculórum sǽcula.","Amen."]
];
const stanzas=hymnStanzas.flatMap((stanza,i)=>i===0?stanza:["_",...stanza]);
function fixture(){
 const sourceRevision=PIN,language="la";
 return {
  [properPath]:{sourceRevision,language,sourcePath:properPath,
   sourceBlobSha:witness.pinnedLatinSourceBlobs[properPath],
   map:new Map([
    ["Ant Vespera",["@:Ant Laudes",
      "(sed rubrica tridentina aut rubrica praedicatorum omittuntur)"]],
    ["Ant Laudes",[
     "In illa die * stillábunt montes dulcédinem, et colles fluent lac et mel, allelúja.",
     "Jucundáre, * fília Sion, et exsúlta satis, fília Jerúsalem, allelúja.",
     "Ecce Dóminus véniet, * et omnes Sancti ejus cum eo: et erit in die illa lux magna, allelúja.",
     "Omnes sitiéntes, * veníte ad aquas: quǽrite Dóminum, dum inveníri potest, allelúja.",
     "Ecce véniet * Prophéta magnus, et ipse renovábit Jerúsalem, allelúja."
    ]],
    ["Capitulum Laudes",["!Rom 13:11",
     "v. Fratres: Hora est jam nos de somno súrgere: nunc enim própior est nostra salus, quam cum credídimus.",
     "$Deo gratias."]],
    ["Ant 1",["Ecce nomen Dómini * venit de longínquo, et cláritas ejus replet orbem terrárum."]],
    ["Oratio",["Excita, quǽsumus, Dómine, poténtiam tuam, et veni: ut ab imminéntibus peccatórum nostrórum perículis, te mereámur protegénte éripi, te liberánte salvári:",
      "$Qui vivis"]],
    ["Versum 1",["@Psalterium/Special/Major Special:Adv Versum 3"]]
   ])},
  [ordinaryPath]:{sourceRevision,language,sourcePath:ordinaryPath,
   sourceBlobSha:witness.pinnedLatinSourceBlobs[ordinaryPath],
   map:new Map([
    ["Hymnus Adv Vespera",stanzas],
    ["Adv Versum 3",[
     "V. Roráte, cæli, désuper, et nubes pluant justum.",
     "R. Aperiátur terra, et gérminet Salvatórem."
    ]]
   ])}
 };
}
const read=(docs,fn=()=>{})=>async(path,language)=>{
 fn(path,language);return docs[path];
};
test("all sixteen full Latin printed text units match secondary witness, no typica or publication",async()=>{
 const docs=fixture(),calls=[];
 const r=await review({witness,readSource:read(docs,(...v)=>calls.push(v))});
 assert.equal(r.status,"SIXTEEN_LATIN_UNITS_MATCH_SECONDARY_PRINT_NOT_1961_TYPICA");
 assert.equal(r.sourceDocumentsRead,2);
 assert.deepEqual(calls,[[properPath,"la"],[ordinaryPath,"la"]]);
 assert.equal(r.completePrintedLatinTextUnitsCompared,16);
 assert.equal(r.completeLatinPsalmAntiphonTexts,5);
 assert.equal(r.fullHymnStanzas,6);
 assert.equal(r.completeMagnificatAntiphonTexts,1);
 assert.equal(r.completeVersicleLines,2);
 assert.equal(r.collectBodyTextsWithoutConclusion,1);
 assert.equal(r.full1961PrimaryPrintedCollation,false);
 assert.equal(r.fullCollectEndingCollated,false);
 assert.equal(r.completeHourCertified,false);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
});
test("meaningful Latin word changes are rejected even with pinned revision metadata",async()=>{
 for(const alter of [
  d=>d[properPath].map.get("Ant Laudes")[4]=
   d[properPath].map.get("Ant Laudes")[4].replace("renovábit","destruet"),
  d=>d[properPath].map.get("Capitulum Laudes")[1]=
   d[properPath].map.get("Capitulum Laudes")[1].replace("credídimus","dormívimus"),
  d=>d[properPath].map.get("Oratio")[0]=
   d[properPath].map.get("Oratio")[0].replace("protegénte","permitténte"),
  d=>d[ordinaryPath].map.get("Hymnus Adv Vespera")[14]=
   d[ordinaryPath].map.get("Hymnus Adv Vespera")[14].replace("Cujus","Hujus"),
  d=>d[ordinaryPath].map.get("Adv Versum 3")[1]=
   d[ordinaryPath].map.get("Adv Versum 3")[1].replace("Salvatórem","Redemptórem")
 ]){
  const d=fixture(),before=JSON.stringify([...d[properPath].map,...d[ordinaryPath].map]);
  alter(d);
  assert.notEqual(JSON.stringify([...d[properPath].map,...d[ordinaryPath].map]),before);
  const r=await review({witness,readSource:read(d)});
  assert.equal(r.status,"WITHHELD");
  assert.match(r.reason,/MISMATCH/);
  assert.equal(r.publishable,false);
 }
});
test("unresolved macro, wrong First Vespers alias, dropped stanza and wrong chapter refuse collation",async()=>{
 for(const edit of [
  d=>d[properPath].map.set("Ant Vespera",["@:Ant 3"]),
  d=>d[properPath].map.set("Capitulum Laudes",["!Rom 13:12",
   "v. Fratres: Hora est jam nos de somno súrgere: nunc enim própior est nostra salus, quam cum credídimus.","$Deo gratias."]),
  d=>d[ordinaryPath].map.get("Hymnus Adv Vespera").splice(4,1),
  d=>d[ordinaryPath].map.get("Hymnus Adv Vespera")[0]="@:OtherHymn",
  d=>d[properPath].map.get("Oratio")[1]="$OtherMacro",
  d=>d[properPath].map.get("Ant Laudes").pop()
 ]){
  const d=fixture();edit(d);
  const r=await review({witness,readSource:read(d)});
  assert.equal(r.status,"WITHHELD");assert.equal(r.publishable,false);
 }
});
test("cannot forge 1961 typica, rights, year, language, source or a complete collect ending",async()=>{
 for(const edit of [
  w=>w.full1961PrimaryPrintedCollation=true,
  w=>w.collectEndingCertified=true,
  w=>w.rightsApproved=true,
  w=>w.witness.type="1961_TYPICA",
  w=>w.officeDate="2026-11-28",
  w=>w.lexicalSha256.hymn1="f".repeat(64),
  w=>w.comparedCompleteLatinTextUnits=17
 ]){
  const wrong=structuredClone(witness);edit(wrong);
  const r=await review({witness:wrong,readSource:read(fixture())});
  assert.equal(r.status,"WITHHELD");assert.equal(r.publishable,false);
 }
 for(const edit of [
  d=>d[properPath].sourceRevision="main",
  d=>d[ordinaryPath].language="fr",
  d=>d[ordinaryPath].sourceBlobSha="wrong"
 ]){
  const d=fixture();edit(d);
  assert.equal((await review({witness,readSource:read(d)})).status,"WITHHELD");
 }
});
