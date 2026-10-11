import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=name=>JSON.parse(readFileSync(new URL("../data/"+name,import.meta.url),"utf8"));
const audit=read("mass/ritus-1962-verified-ceremonial-batch01.v1.json");
const sung=read("presentation/reader-text-sung.v1.json");
const low=read("presentation/reader-text-low.v1.json");
const rows=(c)=>c.blocks.flatMap(b=>(b.units||[]).map(u=>({cue:u.cue_id,macro:b.Macro_ID,branch:b.Branch_Status,clock:u.clock})));
const s=rows(sung),l=rows(low);
const sMap=new Map(s.map(x=>[x.cue,x])),lMap=new Map(l.map(x=>[x.cue,x]));
assert.equal(audit.schema,"ao-ritus-1962-ceremonial-evidence-batch-v1");
assert.equal(audit.status,"SOURCE_CHECKED_ENGLISH_TRANSLATION_NOT_LATIN_AND_NOT_RUNTIME_CERTIFIED");
assert.equal(audit.events.length,44);
assert.equal(sMap.size,279);
assert.equal(lMap.size,275);
assert.equal(audit.invariants.noRuntimeImport,true);
assert.equal(audit.invariants.faithfulPostureNotInferredFromPriest,true);
assert.equal(audit.invariants.secondConfiteorExcludedFromNormative1962,true);
assert.equal(audit.invariants.lowMassIncenseForbidden,true);
assert.equal(sMap.get("AO.SM.C0196").macro,"AO.SM.M17");
assert.equal(sMap.get("AO.SM.C0200").macro,"AO.SM.M17");
assert.equal(sMap.get("AO.SM.C0041").macro,"AO.SM.M01");
assert.equal(sMap.get("AO.SM.C0235").macro,"AO.SM.M24");
assert.equal(lMap.get("AO.SM.C0235").macro,"AO.SM.M24");
const second=Array.from({length:7},(_,i)=>"AO.SM.C"+String(235+i).padStart(4,"0"));
for(const cue of second){
 assert.equal(sMap.get(cue)?.branch,"LOCAL_CUSTOM_PRE1960_SURVIVAL",cue+" sung not historical");
 assert.equal(lMap.get(cue)?.branch,"LOCAL_CUSTOM_PRE1960_SURVIVAL",cue+" low not historical");
 assert(!audit.events.some(e=>e.cueId===cue),cue+" accidentally promoted to 1962");
}
const ids=new Set(),forms=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
for(const e of audit.events){
 assert(!ids.has(e.id),"duplicate event "+e.id);ids.add(e.id);
 assert(sMap.has(e.cueId),"source cue absent "+e.id+" "+e.cueId);
 assert.equal(e.runtimeApproved,false,"unreviewed runtime export "+e.id);
 assert.match(e.section,/^(III|IV|VI|VII|VIII|IX|X|XI|XII|XIII)\\./,e.id+" source section");
 assert.match(e.sourceUrl,/\\/download\\/#page=\\d+$/,e.id+" source page");
 assert(e.forms.length && e.forms.every(x=>forms.has(x)),"invalid form "+e.id);
 assert(e.condition,"unscoped ceremonial candidate "+e.id);
}
for(const e of audit.events.filter(x=>x.action.includes("INCENSE")||x.action.includes("INCENSATION")))
 assert(!e.forms.includes("LOW"),"incense was mapped to Low Mass");
for(const cue of ["AO.SM.C0174","AO.SM.C0181"]){
 const seq=audit.events.filter(x=>x.cueId===cue&&x.actor==="PRIEST"&&Number.isInteger(x.microOrder))
   .sort((a,b)=>a.microOrder-b.microOrder).map(x=>x.microOrder);
 assert.deepEqual(seq,[1,2,3,4],"incomplete elevation subevents "+cue);
}
const req=(action,actor,form)=>assert(audit.events.some(e=>e.action===action&&e.actor===actor&&e.forms.includes(form)),action);
req("SING_EPISTLE_SOLEMN","SUBDEACON","SOLEMN");
req("SING_GOSPEL_SOLEMN","DEACON","SOLEMN");
req("SING_DISMISSAL_IN_SOLEMN","DEACON","SOLEMN");
req("SING_DISMISSAL_IN_MISSA_CANTATA","PRIEST","MISSA_CANTATA_SIMPLE");
const corr=Object.fromEntries(audit.researchCorrections.filter(x=>x.pinpoints).flatMap(x=>x.pinpoints.map(p=>[p,x])));
assert.equal(corr["MR62.057"].correctMacro,"AO.SM.M17");
assert.equal(corr["MR62.058"].correctMacro,"AO.SM.M17");
assert.equal(corr["MR62.086"].correctMacro,"AO.SM.M24");
assert.equal(corr["MR62.091"].correctMacro,"AO.SM.M01");
console.log("PASS source-backed ceremonial batch: 44 separate events, 31 cue anchors, exact-identity and form gates");
