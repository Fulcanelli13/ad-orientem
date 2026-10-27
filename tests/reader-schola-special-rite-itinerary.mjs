import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildAspergesPayload,createAspergesReaderController} from "../src/mass/reader-asperges.js";
import {buildPalmPayload} from "../src/mass/reader-palm.js";
import {buildCandlemasPayload} from "../src/mass/reader-candlemas.js";
import {buildRogationsPayload} from "../src/mass/reader-rogations.js";
import {buildCorpusChristiProcessionPayload} from "../src/mass/reader-corpus-christi.js";
import {buildHolyThursdayPostPayload} from "../src/mass/reader-holy-thursday-post.js";
import {buildRequiemAbsolutionPayload} from "../src/mass/reader-requiem-absolution.js";
import {buildGenericProcessionReader} from "../src/mass/reader-generic-procession.js";
import {buildGoodFridayReader,createGoodFridayReaderController} from "../src/mass/reader-good-friday.js";
import {buildEasterVigilReader} from "../src/mass/reader-easter-vigil.js";
import {EASTER_VIGIL_PROPHECY_READINGS} from "../src/mass/reader-easter-vigil-prophecy-index.js";
import {nativeRiteStageOrder,projectSpecialRiteMusicItinerary,
 projectNativeRiteMusicItinerary} from "../src/mass/reader-schola-special-rite-itinerary.js";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const registry=load("data/research/mass-special-rite-music-events-20261019.v1.json");
const graphs=load("data/mass/special-days-extension.v1.3.json").graphs;
const core=load("data/mass/special-days-core.v1.1.json").graphs;
const sources={
 ASPERGES:[buildAspergesPayload,graphs.ASP],
 PALM:[buildPalmPayload,graphs.PALM],
 CANDLEMAS:[buildCandlemasPayload,graphs.CND],
 ROGATIONS:[buildRogationsPayload,graphs.ROG],
 CORPUS_CHRISTI:[buildCorpusChristiProcessionPayload,graphs.CORPUS],
 HOLY_THURSDAY_POST:[buildHolyThursdayPostPayload,graphs.HT_POST],
 REQUIEM_ABSOLUTION:[buildRequiemAbsolutionPayload,graphs.ABS],
 GENERIC_PROCESSION:[buildGenericProcessionReader,graphs.PROC],
 GOOD_FRIDAY:[buildGoodFridayReader,core.GF],
 EASTER_VIGIL:[buildEasterVigilReader,core.EV],
};
let witnessed=0,checks=0;
for(const rite of registry.rites){
 const [build,graph]=sources[rite.id];
 assert.ok(build&&Array.isArray(graph),"Native reader missing: "+rite.id);
 const payload=load(rite.sourceFile);
 const original=rite.id==="EASTER_VIGIL"
  ?{...payload,prophecyCanticles:EASTER_VIGIL_PROPHECY_READINGS}:payload;
 const branches=rite.id==="EASTER_VIGIL"
  ?["FONT_MODE=IN_CHURCH","FONT_MODE=SEPARATE_BAPTISTERY"]:
  rite.id==="ASPERGES"?["ORDINARY","PASCHAL"]:
  rite.id==="REQUIEM_ABSOLUTION"?[null,"OPTIONAL_BURIAL_FOLLOWING_ACTION"]:[null];
 for(const condition of branches){
  const built=build({graph,payload,
   fontMode:condition==="FONT_MODE=SEPARATE_BAPTISTERY"?"SEPARATE_BAPTISTERY":"IN_CHURCH",
   bodyPresent:true,burialProcession:condition==="OPTIONAL_BURIAL_FOLLOWING_ACTION",
   willReceiveCommunion:true});
  const native=built.cards??built.steps??built.surfaces;
  assert.ok(Array.isArray(native)&&native.length,rite.id+" has no native stages");
  const order=native.map(x=>x.recordId??x.id);
  assert.equal(new Set(order).size,order.length,rite.id+" has ambiguous native stages");
  const eligible=rite.events.filter(e=>e.condition==="ANY"||
    (condition!=null&&e.condition===condition));
  for(const e of eligible)assert.ok(order.includes(e.stageId),
   rite.id+":"+e.id+" is not a native stage");
  for(const stageId of order){
   const projection=projectSpecialRiteMusicItinerary({
    registry,riteId:rite.id,stageId,sourcePayload:original,
    condition,stageOrder:order});
   assert.equal(projection.supported,true,rite.id+":"+stageId+" "+projection.reason);
   assert.equal(projection.stageId,stageId);
   assert.equal(projection.actuallySinging,"UNKNOWN");
   assert.equal(projection.independentFromMassSchola,true);
   assert.ok(projection.events.every(e=>!e.latin&&!e.gabc&&!e.notes&&!e.audioUrl),
    "No copied chant text or facsimile");
   for(const e of eligible.filter(e=>e.stageId===stageId&&e.kind!=="SOURCE_HOLD")){
    assert.ok(projection.current.some(x=>x.id===e.id),
      "Missing exact source event "+e.id+" at "+stageId);
    const projected=projection.current.find(x=>x.id===e.id);
    assert.deepEqual([...projected.sourcePaths],e.sourcePaths);
    assert.equal(projected.sourceOwner,"EXISTING_NATIVE_RITE");
    witnessed++;
   }
   checks++;
  }
 }
}
assert.ok(witnessed>=46,"Expected distinct ceremony branches not screened");
const aspPayload=load("data/presentation/reader-asperges.v1.json");
const aspControl=createAspergesReaderController({graph:graphs.ASP,payload:aspPayload});
assert.deepEqual(nativeRiteStageOrder(aspControl),aspControl.cards.map(x=>x.id));
aspControl.goTo("ASP-R02");
const ordinary=projectNativeRiteMusicItinerary({
 registry,riteId:"ASPERGES",controller:aspControl,
 sourcePayload:aspPayload,condition:"ORDINARY"});
const paschal=projectNativeRiteMusicItinerary({
 registry,riteId:"ASPERGES",controller:aspControl,
 sourcePayload:aspPayload,condition:"PASCHAL"});
assert.deepEqual(ordinary.current.map(x=>x.id),["AO.MUS.ASP.ME"]);
assert.deepEqual(paschal.current.map(x=>x.id),["AO.MUS.ASP.VIDI"]);
assert.equal(projectNativeRiteMusicItinerary({
 registry,riteId:"ASPERGES",controller:aspControl,sourcePayload:aspPayload
}).current.length,0,"Absent seasonal formula must fail closed");
aspControl.goTo("ASP-R05");
const handed=projectNativeRiteMusicItinerary({
 registry,riteId:"ASPERGES",controller:aspControl,
 sourcePayload:aspPayload,condition:"ORDINARY"});
assert.equal(handed.current.length,0);
assert.equal(handed.upcoming,null,"No leftover Asperges music on Mass handoff");
const gfPayload=load("data/presentation/reader-good-friday.v1.json");
const gfControl=createGoodFridayReaderController({
 graph:core.GF,payload:gfPayload,willReceiveCommunion:true});
gfControl.goToRecord("GF-PASS-320");
const silence=projectNativeRiteMusicItinerary({
 registry,riteId:"GOOD_FRIDAY",controller:gfControl,sourcePayload:gfPayload});
assert.equal(silence.silentStage,true);
assert.equal(silence.current.length,0);
assert.equal(silence.upcoming,null,"Passion death pause cannot show 'NEXT' music");
const reqPayload=load("data/presentation/reader-requiem-absolution.v1.json");
const reqBuilt=buildRequiemAbsolutionPayload({graph:graphs.ABS,payload:reqPayload,
 bodyPresent:true,burialProcession:true});
const reqStages=reqBuilt.cards.map(x=>x.id);
const absent=projectSpecialRiteMusicItinerary({registry,riteId:"REQUIEM_ABSOLUTION",
 stageId:"ABS-R05",sourcePayload:reqPayload,stageOrder:reqStages});
const permitted=projectSpecialRiteMusicItinerary({registry,riteId:"REQUIEM_ABSOLUTION",
 stageId:"ABS-R05",sourcePayload:reqPayload,stageOrder:reqStages,
 condition:"OPTIONAL_BURIAL_FOLLOWING_ACTION"});
assert.equal(absent.current.length,0);
assert.deepEqual(permitted.current.map(x=>x.id),["AO.MUS.REQ.IN_PARADISUM"]);
assert.equal(projectSpecialRiteMusicItinerary({
 registry,riteId:"GOOD_FRIDAY",stageId:"GF-PASS-320",
 sourcePayload:gfPayload,stageOrder:["OTHER"]}).supported,false);
assert.equal(projectSpecialRiteMusicItinerary({registry,riteId:"ASPERGES",
 stageId:"ASP-R02",sourcePayload:aspPayload,condition:"ORDINARY",
 stageOrder:["ASP-R02","ASP-R02"]}).supported,false);
const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const native=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.match(dom,/data-role="schola-special-current"/);
assert.match(dom,/data-role="schola-special-next"/);
assert.match(dom,/special\.stageId===current\?\.id/);
assert.match(native,/specialRiteMusicItinerary:\(\)=>projectNativeRiteMusicItinerary/);
assert.match(native,/inAsperges\?\["ASPERGES"/);
assert.match(native,/inHolyThursdayPost\?\["HOLY_THURSDAY_POST"/);
assert.match(native,/riteId:"GOOD_FRIDAY"/);
assert.match(native,/riteId:"EASTER_VIGIL"/);
console.log("PASS special rite music source stages="+checks+
 " expected source-event occurrences="+witnessed+
 "; branches, silence and handoff; no duplicated chant text or clock");
