import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 compileOfficeDeadVespers1960,OFFICE_DEAD_VESPERS_1960_PSALMS,
 OFFICE_DEAD_VESPERS_1960_SOURCE_COMMIT,OFFICE_DEAD_VESPERS_1960_CONTEXT
} from "../src/pray/office-dead-vespers-1960.js";

const load=file=>JSON.parse(readFileSync(new URL("../data/research/office-dead-1960/"+file,import.meta.url),"utf8"));
const proper=load("proper-source-leaves.v1.json");
const psalms=load("vespers-psalm-source-leaves.v1.json");
const supplemental=load("vespers-supplemental-source-leaves.v1.json");
const sources={proper,psalms,supplemental};
const model=compileOfficeDeadVespers1960(sources);
assert.equal(model.schema,"ao.office-dead.1960-votive-vespers-source-assembly.v1");
assert.equal(model.context,OFFICE_DEAD_VESPERS_1960_CONTEXT);
assert.equal(model.sourceCommit,OFFICE_DEAD_VESPERS_1960_SOURCE_COMMIT);
assert.deepEqual(model.psalmOrder,OFFICE_DEAD_VESPERS_1960_PSALMS);
assert.deepEqual(model.locales,["la","en","fr"]);
assert.deepEqual(model.stageIds,["V.P114","V.P119","V.P120","V.P129","V.P137","V.VERSICLE","V.MAGNIFICAT","V.PATER","V.PRECES","V.COLLECT","V.CONCLUSION"]);
const flags=model.flags;
assert.equal(flags.sourceDerivedHourComplete,true);
for(const k of ["criticalBreviaryPrintCertified","allSoulsProperCertified","independentLanguageEditionsCertified","publicReaderRouteReleased"])
 assert.equal(flags[k],false);
assert.equal(flags.psalm145OmittedIn1960,true);
assert.equal(flags.needsBrowserTest,true);
const section=(raw,key)=>{
 const markers=[...raw.matchAll(/^\[([^\]\n]+)\][^\n]*\r?\n/gm)];
 const i=markers.findIndex(x=>x[1]===key);
 assert.ok(i>=0,key);
 return raw.slice(markers[i].index+markers[i][0].length,markers[i+1]?.index??raw.length).trim();
};
const locs=["la","en","fr"];
for(const locale of locs){
 const cards=model.byLocale[locale];
 assert.equal(cards.length,11);
 assert.deepEqual(cards.map(x=>x.id),model.stageIds);
 const sourceC9=proper.files.find(x=>x.locale===locale&&x.leaf==="C9").raw;
 const ordinary=supplemental.files.find(x=>x.locale===locale&&x.part==="ORDINARY").raw;
 const doxology=section(ordinary,"Requiem").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 for(let i=0;i<5;i++){
  const p=OFFICE_DEAD_VESPERS_1960_PSALMS[i],card=cards[i];
  const body=psalms.files.find(x=>x.locale===locale&&x.psalm===p).raw.trim().split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  assert.equal(card.psalm,p);
  assert.equal(card.kind,"PSALM");
  assert.deepEqual(card.verses,body,"Source psalm words or verse boundaries altered "+locale+p);
  assert.deepEqual(card.requiem,doxology);
  assert.match(card.antiphonBefore,/\*/,"The 1960 antiphon should include its original intonation cue");
  assert.ok(!card.antiphonAfter.includes("*"));
  assert.equal(card.antiphonAfter,card.antiphonBefore.replace(/\s*\*\s*/g," ").replace(/\s+/g," ").trim());
 }
 const cant=cards.find(x=>x.id==="V.MAGNIFICAT");
 const magnSource=supplemental.files.find(x=>x.locale===locale&&x.part==="MAGNIFICAT").raw;
 assert.equal(cant.verses.length,10);
 for(const v of cant.verses)assert.ok(magnSource.includes(v),"Magnificat source mismatch "+locale);
 assert.deepEqual(cant.requiem,doxology);
 const pater=cards.find(x=>x.id==="V.PATER");
 assert.ok(pater.lines.length>=3);
 assert.ok(!pater.lines.some(s=>/\bAmen\b/i.test(s)),"Pater noster Et must not invent an Amen");
 const preces=cards.find(x=>x.id==="V.PRECES");
 assert.equal(preces.lines.length,6);
 const actualAPorta=section(ordinary,"Aportainferi").split(/\r?\n/).filter(Boolean);
 assert.deepEqual(preces.lines.slice(0,2),actualAPorta);
 assert.equal(preces.lines.filter(s=>/vobis|with you|avec vous/i.test(s)).length,0,
  "Do not insert common Dominus vobiscum into source-owned Vespers preces");
 const coll=cards.find(x=>x.id==="V.COLLECT");
 assert.equal(coll.proper,"FIDELIUM_FOR_ALL_DEPARTED");
 assert.equal(coll.lines.length,4);
 assert.ok(coll.lines[1].startsWith("v."));
 assert.ok(section(sourceC9,"Oratio_Fid").includes(coll.lines[1]));
 const close=cards.find(x=>x.id==="V.CONCLUSION");
 assert.deepEqual(close.lines,section(sourceC9,"Conclusio").split(/\r?\n/).map(x=>x.trim()).filter(Boolean));
 for(const step of cards){
  const s=JSON.stringify(step);
  assert.ok(!/Gloria Patri|Glória Patri|Gloria Patri|Glória Patri/i.test(s),"Office of the Dead uses Requiem instead of Gloria");
  assert.ok(!/^\s*[@$&]/m.test(JSON.stringify(step.lines??[])),"No unresolved source macros");
  assert.ok(!/Psalm 145|Psalmus 145|P145/.test(step.id+" "+s),"1960 mode must not include Psalm 145");
 }
 assert.equal(cards.filter(x=>x.requiem).length,6,"5 psalms and Magnificat each require Requiem");
 assert.equal(cards.filter(x=>x.kind==="COLLECT").length,1);
}
for(const context of ["ALL_SOULS_NOV_2","VOTIVE_INDIVIDUAL","OLDER_RUBRICS","VOTIVE_1954"]){
 assert.throws(()=>compileOfficeDeadVespers1960({...sources,context}),/require separately certified/);
}
assert.throws(()=>compileOfficeDeadVespers1960({...sources,proper:{...proper,sourceCommit:"unverified"}}),/revision mismatch/);
const edited=structuredClone(proper);
edited.files=edited.files.filter(f=>!(f.locale==="fr"&&f.leaf==="C9"));
assert.throws(()=>compileOfficeDeadVespers1960({...sources,proper:edited}),/uniqueness failed/);
const localApp=readFileSync(new URL("../src/pray/prayer-design-pilot.js",import.meta.url),"utf8");
assert.ok(!localApp.includes('"pray.office_dead"'));
assert.ok(!localApp.includes('"pray.office_of_dead"'));
console.log("Office Dead Vespers 1960 PASS: 11 source-derived stages × 3 languages, six Requiem responses each, exact Psalter verses, source-specific votive collect, 1960 P145 omission, no unauthorized public/All Souls routes.");
