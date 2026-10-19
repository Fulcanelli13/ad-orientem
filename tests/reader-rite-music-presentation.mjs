import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectRiteMusicBadge,loadRiteMusicRegistry} from "../src/mass/reader-rite-music-presentation.js";
import {normalizeReaderMoment,buildReaderShellMarkup} from "../src/mass/reader-dom.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const registry=load("../data/research/mass-special-rite-music-events-20261019.v1.json");
assert.equal(registry.rites.length,8);
assert.equal(registry.rites.reduce((n,x)=>n+x.events.length,0),24);
const data=new Map(registry.rites.map(r=>[r.id,load("../"+r.sourceFile)]));
const project=(riteId,stageId,condition)=>projectRiteMusicBadge({
  registry,riteId,stageId,sourcePayload:data.get(riteId),condition,
});
const asp=project("ASPERGES","ASP-R02","ORDINARY");
const vidi=project("ASPERGES","ASP-R02","PASCHAL");
assert.deepEqual(asp.eventIds,["AO.MUS.ASP.ME"]);
assert.deepEqual(vidi.eventIds,["AO.MUS.ASP.VIDI"]);
assert.equal(asp.label,"EXPECTED · SCHOLA");
assert.equal(asp.actuallySinging,"UNKNOWN");
assert.equal(asp.sourceOwner,"EXISTING_NATIVE_RITE");
assert.equal(asp.latin,undefined,"Special music presentation must use existing card Latin, not duplicate");
assert.equal(project("ASPERGES","ASP-R02"),null,"Missing seasonal formula must fail closed");
assert.equal(project("ASPERGES","ASP-R05"),null,"Mass handoff must drop prelude music indicator");
assert.equal(project("ASPERGES","ASP-R04").category,"SUNG RESPONSES");
for(const rite of registry.rites){
  for(const event of rite.events){
    const condition=event.condition==="ANY"?null:event.condition;
    const label=project(rite.id,event.stageId,condition);
    if(event.kind==="SOURCE_HOLD")assert.equal(label,null);
    else{
      assert.ok(label,rite.id+":"+event.stageId+" source-backed music label missing");
      assert.ok(label.eventIds.includes(event.id));
      assert.equal(label.actuallySinging,"UNKNOWN");
      assert.ok(!("latin" in label),"Badge may not rewrite the source prayer/chant");
      assert.ok(!("tempo" in label),"Badge may not duplicate the Schola ticker");
    }
  }
}
assert.equal(project("REQUIEM_ABSOLUTION","ABS-R05"),null,
  "In paradisum must not be inferred without explicit following burial procession");
assert.equal(project("NON_EXISTENT","ASP-R02"),null);
assert.deepEqual(project("ASPERGES","ASP-R02","ORDINARY"),asp);

// The existing Mass reader has one central Latin surface. A music badge
// is an informative prelude scene, not a real-time heard performance or rail.
const original=normalizeReaderMoment({
  id:"ASP-R02",sectionTitle:"Asperges me",cardUpdate:true,
  paragraphs:[{id:"s",primary:"Asperges me, Dómine"}],schola:null,
  riteMusic:asp,
});
assert.equal(original.schola,null);
assert.equal(original.riteMusic.eventIds[0],"AO.MUS.ASP.ME");
assert.equal(normalizeReaderMoment({id:"ASP-R02",cardUpdate:false,schola:null},original).riteMusic.eventIds[0],
  "AO.MUS.ASP.ME",
  "A posture update in the same ceremony must not erase music metadata");
const handoff=normalizeReaderMoment({
  id:"AO.CARD.001",sectionTitle:"Mass",cardUpdate:true,schola:null
},original);
assert.equal(handoff.riteMusic,null,"Mass handoff retained stale prelude music label");
const markup=buildReaderShellMarkup({session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE"}}});
assert.ok(markup.includes('data-role="rite-music" hidden'),
  "Visible rite-music label should be hidden by default");

// Loader consumes the actual already-indexed research registry. Strictly
// refuse corrupt schemas; a missing fetch may never synthesize a chant.
const loaded=await loadRiteMusicRegistry({fetchImpl:async()=>({ok:true,json:async()=>registry})});
assert.equal(loaded.schema,registry.schema);
await assert.rejects(()=>loadRiteMusicRegistry({fetchImpl:async()=>({
  ok:true,json:async()=>({schema:"unknown"})
})}),/RITE_MUSIC_REGISTRY_SCHEMA_MISMATCH/);
await assert.rejects(()=>loadRiteMusicRegistry({fetchImpl:async()=>({ok:false})}),
  /RITE_MUSIC_REGISTRY_UNAVAILABLE/);
console.log("Special rite music-card bridge PASS: 24 indexed events, mutually exclusive Asperges, no imagined music, source text and Schola clocks unchanged");
