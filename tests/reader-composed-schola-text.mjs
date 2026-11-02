import assert from "node:assert/strict";
import {createComposedScholaTextController,eligibleComposedScholaWork,composedScholaRoute}
 from "../src/mass/reader-composed-schola-text.js";
import {readScholaLocalProgramme,updateScholaLocalProgramme,normalizeScholaLocalProgramme}
 from "../src/mass/reader-schola-local-programme.js";
import {readFile} from "node:fs/promises";
const requiem={session:{resolvedMass:{form:"MISSA_CANTATA_SIMPLE",provenance:{isRequiem:true}}},readerPreferences:{language:"en"}};
const ordinary={session:{resolvedMass:{form:"MISSA_CANTATA_SIMPLE",provenance:{isRequiem:false}}}};
const low={session:{resolvedMass:{form:"LOW",provenance:{isRequiem:true}}}};
const mock=(trackId)=>Object.freeze({supported:true,trackId,ownership:"R17_NATIVE_SCHOLA",schola:Object.freeze({
 trackId,index:0,total:100,latin:"Gregorian original",english:"Gregorian translation",
 segmentId:"AO.CUE",cueId:"AO.SM.C0001",musicStatus:"EXPECTED_NOT_OBSERVED"})});
const ctl=createComposedScholaTextController({prepared:requiem});
const source=mock("INTROIT");
assert.ok(eligibleComposedScholaWork({workId:"faure-requiem-op48",prepared:requiem,native:source}));
assert.ok(!eligibleComposedScholaWork({workId:"faure-requiem-op48",prepared:ordinary,native:source}));
assert.ok(!eligibleComposedScholaWork({workId:"faure-requiem-op48",prepared:low,native:source}));
assert.ok(!eligibleComposedScholaWork({workId:"not-real",prepared:requiem,native:source}));
assert.equal(ctl.project(source,""),source,"Default Gregorian source must pass through verbatim");
assert.equal(ctl.project(source,"faure-requiem-op48").schola.latin,"Requiem aeternam dona eis, Domine.");
assert.equal(ctl.project(source,"faure-requiem-op48").schola.total,6);
assert.equal(ctl.project(source,"faure-requiem-op48").schola.english,"Grant them eternal rest, O Lord.");
ctl.next(source,"faure-requiem-op48");assert.equal(ctl.project(source,"faure-requiem-op48").schola.index,1);
assert.equal(source.schola.latin,"Gregorian original","Never mutate native Gregorian source text");
for(let i=0;i<5;i++)ctl.next(source,"faure-requiem-op48");
assert.equal(ctl.project(source,"faure-requiem-op48").schola.complete,true,"Final phrase requires explicit FINISH");
ctl.previous(source,"faure-requiem-op48");
assert.equal(ctl.project(source,"faure-requiem-op48").schola.complete,false);
assert.equal(ctl.project(mock("KYRIE"),"faure-requiem-op48").schola.total,3,"Split Fauré Introit and Kyrie");
assert.match(ctl.project(mock("KYRIE"),"faure-requiem-op48").schola.latin,/Kyrie/);
assert.equal(ctl.project(mock("OFFERTORY"),"faure-requiem-op48").schola.total,14);
assert.equal(ctl.project(mock("SANCTUS_BENEDICTUS"),"faure-requiem-op48").schola.total,4);
assert.equal(ctl.project(mock("SANCTUS_BENEDICTUS"),"faure-requiem-op48").schola.benedictusHold,false);
assert.equal(ctl.project(mock("AGNUS_DEI"),"faure-requiem-op48").schola.total,4);
const communion=ctl.project(mock("COMMUNION"),"faure-requiem-op48","fr");
assert.equal(communion.schola.total,4,"Agnus and Communion texts are distinct 4-line ranges");
assert.match(communion.schola.english,/lumière éternelle/);
assert.equal(ctl.project(mock("GRADUAL"),"faure-requiem-op48").schola.latin,"Gregorian original",
 "Fauré has no appointed Gregorian Gradual substitution");
assert.equal(ctl.project(mock("ALLELUIA_TRACT_SEQUENCE"),"faure-requiem-op48").schola.latin,
 "Gregorian original","Fauré Pie Jesu cannot replace the complete Dies irae");
assert.equal(composedScholaRoute("GRADUAL"),null);
const off=createComposedScholaTextController({prepared:ordinary});
assert.equal(off.project(source,"faure-requiem-op48"),source,"Ordinary Mass must never inherit Requiem text");
const noLow=createComposedScholaTextController({prepared:low});
assert.equal(noLow.project(source,"faure-requiem-op48"),source,"Low Mass has no native Schola");
const storage=new Map();
const store={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)};
let plan=readScholaLocalProgramme(store);
assert.equal(plan.composedScholaWorkId,"");
plan=updateScholaLocalProgramme(plan,{kind:"composedScholaWork",value:"faure-requiem-op48"},store);
assert.equal(plan.composedScholaWorkId,"faure-requiem-op48");
assert.equal(readScholaLocalProgramme(store).composedScholaWorkId,"faure-requiem-op48",
 "Composer setting must persist in personal profile");
const unchanged=updateScholaLocalProgramme(plan,{kind:"composedScholaWork",value:"unverified-setting"},store);
assert.equal(unchanged.composedScholaWorkId,"faure-requiem-op48","Unverified scores forbidden");
plan=updateScholaLocalProgramme(plan,{kind:"profileCreate",value:"St Kevin's"},store);
assert.equal(plan.composedScholaWorkId,"","New profile must not inherit work");
plan=updateScholaLocalProgramme(plan,{kind:"profileSelect",value:"p1"},store);
assert.equal(plan.composedScholaWorkId,"faure-requiem-op48");
assert.equal(normalizeScholaLocalProgramme({}).composedScholaWorkId,"");
const dom=await readFile(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const native=await readFile(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.match(dom,/data-schola-music-setting/);
assert.match(dom,/ao-schola-inline-translation/,"Translation must render directly beneath Latin");
assert.match(native,/projectComposedSchola\(\)/,"The existing reader must use composer projection");
assert.match(native,/composedScholaText\.next/,"Existing Schola NEXT must advance selected words");
assert.match(native,/composedScholaText\.previous/,"Existing Schola PREVIOUS must advance selected words");
console.log("PASS native Schola Fauré 6 mapped windows, fallback, profile persistence, manual arrows");
