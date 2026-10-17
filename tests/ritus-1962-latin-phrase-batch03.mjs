import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../data/"+p,import.meta.url),"utf8"));
const a=read("mass/ritus-1962-latin-phrase-audit-batch03.v1.json");
const b=read("mass/ritus-1962-verified-ceremonial-batch01.v1.json");
const c=read("mass/ritus-1962-solemn-ministers-batch02.v1.json");
const sung=read("presentation/reader-text-sung.v1.json");
const map=new Map(sung.blocks.flatMap(bl=>bl.units.filter(u=>/^AO\.SM\.C\d{4}$/.test(u.cue_id)).map(u=>[u.cue_id,{latin:u.latin,macro:bl.Macro_ID}])));
const compact=x=>String(x??"").replace(/[æÆ]/g,"ae").replace(/[✠+]/g,"").normalize("NFD").replace(/\p{M}/gu,"").toLowerCase().replace(/[^a-z]/g,"");
assert.equal(map.size,279);
assert.equal(a.items.length,36);
assert.equal(a.rubricPresentationPolicy.priestOnly,true);
assert.equal(b.events.length,46);
assert.equal(c.events.length,68); // The new Latin VII.9 water-pour record is research-only.
assert.equal(a.invariants.runtimeImportAllowed,false);
assert.equal(a.invariants.faithfulPostureMandateAllowed,false);
const ids=new Set();
for(const item of a.items){
 assert(!ids.has(item.id),item.id+" duplicate");ids.add(item.id);
 assert(map.has(item.cueId),item.id+" unknown cue");
 assert.equal(item.macroId,map.get(item.cueId).macro,item.id+" macro differs");
 assert(compact(map.get(item.cueId).latin).includes(compact(item.latinTrigger)),
  item.id+" incorrect phrase: "+item.latinTrigger);
 assert.equal(item.facsimileReviewed,false);
 assert.equal(item.liveEnabled,false);
 assert.equal(item.frenchEditorialReviewed,false);
 assert(item.rubricFrShort?.length>10,item.id+" missing French short rubric");
 assert(item.rubricFrDetail?.length>30,item.id+" missing French detailed rubric");
 assert(!item.actionKey.startsWith("FAITHFUL_"),"rubrical priest act misattributed to lay faithful");
}
const find=action=>a.items.find(x=>x.actionKey===action);
assert.equal(find("JOIN_HANDS_NO_CROSSES_YET").cueId,"AO.SM.C0163");
assert.equal(find("TRIPLE_CROSSES_QUAM_OBLATIONEM").cueId,"AO.SM.C0164");
assert.equal(find("HOST_ONLY_CROSS").cueId,"AO.SM.C0165");
assert.equal(find("CHALICE_ONLY_CROSS").cueId,"AO.SM.C0166");
assert.equal(b.events.find(x=>x.id==="B01-019").cueId,"AO.SM.C0164");
const agnus=["AO.SM.C0222","AO.SM.C0223","AO.SM.C0224"];
assert.deepEqual(a.items.filter(x=>x.actionKey.startsWith("BREAST_STRIKE_AGNUS_")).map(x=>x.cueId),agnus);
assert(a.items.filter(x=>x.actionKey.startsWith("BREAST_STRIKE_AGNUS_")).every(x=>x.condition==="NOT_REQUIEM"));
assert.equal(find("DEACON_MOVE_TO_RIGHT").condition,"SOLEMN_ONLY");
assert.equal(find("DEACON_MOVE_TO_RIGHT").triggerType,"WITHIN");
assert.equal(find("BLESS_WATER").condition,"NOT_REQUIEM");
assert.equal(find("LAVABO_GLORIA_INCLUSION").condition,"NOT_REQUIEM_AND_NOT_PASSIONTIDE");
console.log("PASS Latin phrase research: 36 validated cue/trigger spans; Quam oblationem, Requiem and triple Agnus safeguards.");
