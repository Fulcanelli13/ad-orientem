import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectRiteMusicBadge,loadRiteMusicRegistry} from "../src/mass/reader-rite-music-presentation.js";
import {normalizeReaderMoment,buildReaderShellMarkup} from "../src/mass/reader-dom.js";
import {project1962ReaderOrganNote} from "../src/mass/reader-organ-permission-presentation.js";
import {EASTER_VIGIL_PROPHECY_READINGS} from "../src/mass/reader-easter-vigil-prophecy-index.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const registry=load("../data/research/mass-special-rite-music-events-20261019.v1.json");
assert.equal(registry.rites.length,10);
assert.equal(registry.rites.reduce((n,x)=>n+x.events.length,0),47);
const data=new Map(registry.rites.map(r=>[r.id,
  r.id==="EASTER_VIGIL" ? {
    ...load("../"+r.sourceFile),prophecyCanticles:EASTER_VIGIL_PROPHECY_READINGS,
  } : load("../"+r.sourceFile)
]));
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
assert.equal(project("GOOD_FRIDAY","GF-PASS-320"),null,"The Passion death pause must never suggest audible music");
assert.equal(project("GOOD_FRIDAY","GF-LESS-110").category,"SCHOLA");
assert.match(project("GOOD_FRIDAY","GF-LESS-110").description,/Responsory following first lesson/);
assert.equal(project("GOOD_FRIDAY","GF-X-521").category,"SUNG RESPONSES");
assert.equal(project("EASTER_VIGIL","EV-FONT-450","FONT_MODE=SEPARATE_BAPTISTERY"),null,
  "Return from a separate baptistery is silent");
assert.ok(project("EASTER_VIGIL","EV-FONT-450","FONT_MODE=IN_CHURCH"));
assert.ok(project("EASTER_VIGIL","EV-FONT-440","FONT_MODE=SEPARATE_BAPTISTERY"));
assert.equal(project("EASTER_VIGIL","EV-FONT-440","FONT_MODE=IN_CHURCH"),null);
assert.equal(project("EASTER_VIGIL","EV-MASS-700","FONT_MODE=IN_CHURCH"),null,
  "Easter Mass must use the independent Ordinary Schola, not a rite badge");

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
const explicitSilence=normalizeReaderMoment({
  id:"GF-PASS-320",cardUpdate:false,riteMusic:null,
},original);
assert.equal(explicitSilence.riteMusic,null,
  "Explicit silent distinct-rite stage must clear music despite unchanged text");
const handoff=normalizeReaderMoment({
  id:"AO.CARD.001",sectionTitle:"Mass",cardUpdate:true,schola:null
},original);
assert.equal(handoff.riteMusic,null,"Mass handoff retained stale prelude music label");
const markup=buildReaderShellMarkup({session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE"}}});
assert.ok(markup.includes('data-role="rite-music" hidden'),
  "Visible rite-music label should be hidden by default");
assert.ok(markup.includes('data-role="organ-permission" hidden'),
  "Organ permission is not a live instrument monitor");

const organ=(args)=>project1962ReaderOrganNote(args);
for(const id of ["GF-OPEN-010","GF-LESS-110","GF-PASS-320","GF-VEN-600","GF-END-910"]){
  const note=organ({riteId:"GOOD_FRIDAY",stageId:id});
  assert.equal(note.status,"SILENT",id+" lost the complete Triduum ban");
  assert.equal(note.solo,"FORBIDDEN");
  assert.equal(note.accompaniment,"FORBIDDEN");
  assert.equal(note.actuallyPlaying,"UNKNOWN");
  assert.equal(note.notAnObservation,true);
}
assert.equal(organ({riteId:"GOOD_FRIDAY",stageId:"AO.CARD.003"}),null,
  "Good Friday organ rule leaked into ordinary Mass");
for(const id of ["EV-LUM-110","EV-EXS-200","EV-LESS-02-READ","EV-LIT2-600","EV-MASS-700"]){
  assert.equal(organ({riteId:"EASTER_VIGIL",stageId:id}).status,"SILENT");
}
const massCards=[
  {sectionId:"AO.CARD.002",sequence:1,title:"Kyrie"},
  {sectionId:"AO.CARD.003",sequence:2,title:"Gloria"},
  {sectionId:"AO.CARD.004",sequence:3,title:"Collect"},
].map(Object.freeze);
const vigilModel=Object.freeze({easterVigil:true,cards:Object.freeze(massCards)});
assert.equal(organ({riteId:"EASTER_VIGIL_MASS",massCard:massCards[0],massModel:vigilModel}).status,"SILENT");
for(const card of massCards.slice(1)){
  const norm=organ({riteId:"EASTER_VIGIL_MASS",massCard:card,massModel:vigilModel});
  assert.equal(norm.status,"PERMITTED","Gloria is the exact 1958 end boundary");
  assert.equal(norm.actuallyPlaying,"UNKNOWN");
}
assert.equal(organ({riteId:"EASTER_VIGIL_MASS",massCard:massCards[0],
  massModel:{...vigilModel,easterVigil:false}}),null,
  "Uncertified Easter Mass projection cannot imply an organ permission");
assert.equal(organ({riteId:"EASTER_VIGIL_MASS",massCard:massCards[1],
  massModel:{easterVigil:true,cards:[massCards[1]]}})?.status,"PERMITTED");
assert.equal(organ({riteId:"EASTER_VIGIL_MASS",massCard:massCards[0],
  massModel:{easterVigil:true,cards:[massCards[0]]}}),null,
  "Missing source-owned Gloria boundary must fail closed");
assert.equal(organ({riteId:"HOLY_THURSDAY_POST",stageId:"HT-R05"}).status,"SILENT");
assert.equal(organ({riteId:"REQUIEM_ABSOLUTION",stageId:"ABS-R03"}).status,"SILENT");
assert.equal(organ({riteId:"CORPUS_CHRISTI_PROCESSION",stageId:"CORPUS-R02"}),null,
  "Generic processional organ status requires evidence");
assert.equal(organ({riteId:"CORPUS_CHRISTI_PROCESSION",stageId:"CORPUS-R05"}).status,"PERMITTED",
  "Benediction retains its distinct 1958 instrument exception");
assert.equal(organ({riteId:"GENERIC_PROCESSION",stageId:"PROC-R02"}),null);
assert.equal(organ({massCard:{sectionId:"AO.CANON.02",
  blocks:[{blockId:"AO.SM.B052"}]}}).status,"SILENT",
  "Universal Consecration silence must not depend on calendar guessing");
assert.equal(organ({massCard:{sectionId:"AO.CANON.04",
  blocks:[{blockId:"AO.SM.B053"}]}}).status,"SILENT");
const holyThursday={overlays:[],provenance:{organ1962:{
  verified:true,source:"LITURGICAL_PLAN_1962",season:"LENT",
  triduum:true,holyThursdayMass:true,
}}};
assert.equal(organ({massCard:massCards[0],resolvedMass:holyThursday}).status,"SILENT");
assert.equal(organ({massCard:massCards[1],resolvedMass:holyThursday}).status,"PERMITTED",
  "Holy Thursday exception must belong to Gloria only");
assert.equal(organ({massCard:massCards[2],resolvedMass:holyThursday}).status,"SILENT",
  "Holy Thursday organ continued past the Gloria exception");
const requiem={overlays:["REQUIEM"],provenance:null};
assert.equal(organ({massCard:massCards[1],resolvedMass:requiem}).status,"ACCOMPANIMENT_ONLY");
assert.equal(organ({massCard:massCards[1],resolvedMass:{overlays:[]}}),null,
  "Civil date and card title cannot imply a liturgical season");
const verified={overlays:[],provenance:{organ1962:{
  verified:true,source:"LITURGICAL_PLAN_1962",season:"ADVENT",
}}};
assert.equal(organ({massCard:massCards[1],resolvedMass:verified}).status,"ACCOMPANIMENT_ONLY");
assert.equal(organ({massCard:massCards[1],resolvedMass:{
  ...verified,provenance:{organ1962:{...verified.provenance.organ1962,verified:false}},
}}),null);
const normalized=normalizeReaderMoment({
  id:"GF-LESS-110",cardUpdate:true,organPermission:organ({riteId:"GOOD_FRIDAY",stageId:"GF-LESS-110"}),
});
assert.equal(normalized.organPermission.status,"SILENT");
assert.equal(normalizeReaderMoment({id:"GF-PASS-320",cardUpdate:false,organPermission:null},normalized).organPermission,null,
  "Explicitly absent organ context must clear without swapping the source card");
assert.equal(normalizeReaderMoment({id:"AO.CARD.002",cardUpdate:true},normalized).organPermission,null,
  "Reader must drop old rite organ norm on a Mass handoff");

// Loader consumes the actual already-indexed research registry. Strictly
// refuse corrupt schemas; a missing fetch may never synthesize a chant.
const loaded=await loadRiteMusicRegistry({fetchImpl:async()=>({ok:true,json:async()=>registry})});
assert.equal(loaded.schema,registry.schema);
await assert.rejects(()=>loadRiteMusicRegistry({fetchImpl:async()=>({
  ok:true,json:async()=>({schema:"unknown"})
})}),/RITE_MUSIC_REGISTRY_SCHEMA_MISMATCH/);
await assert.rejects(()=>loadRiteMusicRegistry({fetchImpl:async()=>({ok:false})}),
  /RITE_MUSIC_REGISTRY_UNAVAILABLE/);
console.log("Special rite music-card bridge PASS: 47 indexed events, Good Friday death and Easter Vigil font branches, no imagined music, source text and Schola clocks unchanged");
