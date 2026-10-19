import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve1962OrganPermission,resolveRiteMusicScene} from "../src/mass/reader-rite-music-authority.js";
import {buildAspergesPayload} from "../src/mass/reader-asperges.js";
import {buildPalmPayload} from "../src/mass/reader-palm.js";
import {buildCandlemasPayload} from "../src/mass/reader-candlemas.js";
import {buildRogationsPayload} from "../src/mass/reader-rogations.js";
import {buildCorpusChristiProcessionPayload} from "../src/mass/reader-corpus-christi.js";
import {buildHolyThursdayPostPayload} from "../src/mass/reader-holy-thursday-post.js";
import {buildRequiemAbsolutionPayload} from "../src/mass/reader-requiem-absolution.js";
import {buildGenericProcessionReader} from "../src/mass/reader-generic-procession.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const reg=load("../data/research/mass-special-rite-music-events-20261019.v1.json");
const graph=load("../data/mass/special-days-extension.v1.3.json").graphs;
const native={
  ASPERGES:{graph:"ASP",build:buildAspergesPayload},
  PALM:{graph:"PALM",build:buildPalmPayload},
  CANDLEMAS:{graph:"CND",build:buildCandlemasPayload},
  ROGATIONS:{graph:"ROG",build:buildRogationsPayload},
  CORPUS_CHRISTI:{graph:"CORPUS",build:buildCorpusChristiProcessionPayload},
  HOLY_THURSDAY_POST:{graph:"HT_POST",build:buildHolyThursdayPostPayload},
  REQUIEM_ABSOLUTION:{graph:"ABS",build:buildRequiemAbsolutionPayload},
  GENERIC_PROCESSION:{graph:"PROC",build:buildGenericProcessionReader},
};
assert.equal(reg.schema,"ao-mass-special-rite-music-events-v1");
assert.equal(reg.rites.length,8);
assert.equal(reg.rites.reduce((count,rite)=>count+rite.events.length,0),24);
assert.equal(reg.policy.noSyntheticChant,true);
assert.equal(reg.policy.expectedNotHeard,true);
const seen=new Set();
for(const rite of reg.rites){
  const owner=native[rite.id];
  assert.ok(owner,"Unknown ceremony "+rite.id);
  const payload=load("../"+rite.sourceFile);
  const result=owner.build({graph:graph[owner.graph],payload,
    bodyPresent:true,burialProcession:true});
  const cards=result.cards??result.surfaces??result.readerSurfaces??[];
  assert.ok(cards.length>0,rite.id+" native card payload absent");
  const byId=new Map(cards.map(card=>[card.id,card]));
  for(const e of rite.events){
    assert.ok(!seen.has(e.id),"Duplicate music event ID "+e.id);
    seen.add(e.id);
    const card=byId.get(e.stageId);
    assert.ok(card,rite.id+" music stage absent from source reader: "+e.stageId);
    assert.equal(e.sourceOwner,"EXISTING_NATIVE_RITE");
    assert.ok(["EXPECTED_NOT_OBSERVED"].includes(e.musicStatus));
    if(e.kind!=="SOURCE_HOLD")assert.ok(e.sourcePaths.length>0,
      rite.id+" "+e.id+" has no pinned chant source");
    if(e.kind==="SOURCE_HOLD")assert.deepEqual(e.sourcePaths,[]);
    for(const path of e.sourcePaths){
      const value=path.split(".").reduce((x,key)=>x?.[key],payload);
      assert.ok(value!==undefined && value!==null,rite.id+" lacks "+path);
      assert.ok(typeof value==="string"||typeof value==="object",
        rite.id+" source text is not a known corpus field: "+path);
    }
    const projected=resolveRiteMusicScene({
      registry:reg,riteId:rite.id,stageId:e.stageId,sourcePayload:payload,
      condition:e.condition
    });
    assert.ok(["EXPECTED_NOT_OBSERVED","NOT_SPECIFIED"].includes(projected.status));
    assert.ok(projected.events.some(x=>x.id===e.id),rite.id+" projected event omitted");
    assert.ok(projected.events.every(x=>x.actuallySinging==="UNKNOWN"&&
      x.sourceFile===rite.sourceFile));
  }
}
// A single Asperges rite must never show the Easter chant and ordinary
// formula simultaneously; the present calendar/source determines the formula.
const asp=load("../data/presentation/reader-asperges.v1.json");
const paschal=resolveRiteMusicScene({registry:reg,riteId:"ASPERGES",stageId:"ASP-R02",
  sourcePayload:asp,condition:"PASCHAL"});
assert.equal(paschal.events.length,1);
assert.equal(paschal.events[0].id,"AO.MUS.ASP.VIDI");
assert.equal(resolveRiteMusicScene({registry:reg,riteId:"ASPERGES",stageId:"ASP-R02",
  sourcePayload:asp}).status,"REQUIRES_CONTEXT");
const req=load("../data/presentation/reader-requiem-absolution.v1.json");
assert.equal(resolveRiteMusicScene({registry:reg,riteId:"REQUIEM_ABSOLUTION",stageId:"ABS-R05",
  sourcePayload:req}).status,"REQUIRES_CONTEXT");
assert.equal(resolveRiteMusicScene({registry:reg,riteId:"GENERIC_PROCESSION",stageId:"PROC-R02",
  sourcePayload:load("../data/presentation/reader-generic-procession.v1.json")}).status,"NOT_SPECIFIED");
assert.equal(resolveRiteMusicScene({registry:reg,riteId:"NON_EXISTENT",stageId:"x"}).status,"UNAVAILABLE");
const policy=(args)=>resolve1962OrganPermission(args);
const status=(args,x)=>assert.equal(policy(args).status,x,JSON.stringify(args));
status({season:"ORDINARY",kind:"SOLO"},"PERMITTED_NOT_OBSERVED");
status({season:"ORDINARY",kind:"ACCOMPANY_CHANT"},"PERMITTED_NOT_OBSERVED");
status({season:"ADVENT",kind:"SOLO"},"FORBIDDEN");
status({season:"ADVENT",kind:"ACCOMPANY_CHANT"},"ACCOMPANIMENT_ONLY_NOT_OBSERVED");
status({season:"LENT",kind:"SOLO"},"FORBIDDEN");
status({season:"PASSIONTIDE",kind:"OTHER_INSTRUMENTS"},"FORBIDDEN");
status({season:"LENT",kind:"SOLO",exceptionalFeastConfirmed:true},"PERMITTED_NOT_OBSERVED");
status({season:"ORDINARY",septEmberFerial:true,kind:"SOLO"},"FORBIDDEN");
status({season:"ORDINARY",requiem:true,kind:"SOLO"},"FORBIDDEN");
status({season:"ORDINARY",requiem:true,kind:"ACCOMPANY_CHANT"},"ACCOMPANIMENT_ONLY_NOT_OBSERVED");
status({season:"ORDINARY",requiem:true,exceptionalFeastConfirmed:true,kind:"SOLO"},"FORBIDDEN");
status({season:"SEPTUAGESIMA",kind:"OTHER_INSTRUMENTS"},"FORBIDDEN");
status({season:"SEPTUAGESIMA",kind:"SOLO"},"PERMITTED_NOT_OBSERVED");
status({season:"LENT",triduum:true,holyThursdayGloria:true,kind:"SOLO"},"PERMITTED_NOT_OBSERVED");
status({season:"LENT",triduum:true,holyThursdayChrism:true,kind:"SOLO"},"PERMITTED_NOT_OBSERVED");
status({season:"LENT",triduum:true,kind:"SOLO"},"FORBIDDEN");
status({season:"LENT",triduum:true,kind:"ACCOMPANY_CHANT"},"FORBIDDEN");
status({season:"LENT",triduum:true,easterVigilGloriaReached:true,kind:"SOLO"},"PERMITTED_NOT_OBSERVED");
status({season:"ORDINARY",kind:"SOLO",moment:"CONSECRATION"},"FORBIDDEN");
status({season:"ORDINARY",kind:"SOLO",moment:"PRIEST_CHANT"},"FORBIDDEN");
status({season:"ORDINARY",kind:"SOLO",moment:"PRIEST_RESPONSE"},"FORBIDDEN");
status({season:"ORDINARY",kind:"SOLO",moment:"FINAL_BLESSING"},"FORBIDDEN");
status({season:"ADVENT",kind:"SOLO",office:"BENEDICTION"},"PERMITTED_NOT_OBSERVED");
status({kind:"SOLO"},"REQUIRES_CONTEXT");
assert.equal(policy({season:"ORDINARY"}).actuallyPlaying,"UNKNOWN");
assert.ok(policy({season:"ORDINARY"}).notAnObservation);
console.log("Mass rite music/organ authority PASS: 24 source-indexed events, eight native rite owners, conditional Asperges, organ §§16/27/80–85 fail-closed.");
