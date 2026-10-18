// Liturgical acceptance gate for the curated Ordinary Sung LIVE projection.
// This is a source/behavior audit, not certification of local ceremonial
// customs or of actual choir timing at a physical Mass.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildReaderModeModels} from "../src/mass/reader-mode-switch.js";
import {
  createReaderCueStateController,conditionPasses,
} from "../src/mass/reader-cue-state.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const data={
  sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
  canonSourceMap:load("../data/presentation/reader-canon-source-map.v1.json"),
  nuptialData:load("../data/presentation/reader-nuptial.v1.json"),
  frenchOrdinary:load("../data/presentation/reader-french-ordinary.v1.json"),
};
const registries={
  gestures:load("../data/presentation/reader-gestures.v1.json"),
  responses:load("../data/presentation/reader-responses.v1.json"),
  postures:load("../data/presentation/reader-postures.v1.json"),
  positions:load("../data/presentation/reader-priest-positions.v1.json"),
  voices:load("../data/presentation/reader-priest-voices.v1.json"),
  actions:load("../data/presentation/reader-priest-actions.v1.json"),
};
const gestureMatrix=load("../data/mass/gesture-matrix.v1.json");
const speakerAudit=load("../data/mass/ordinary-sung-speaker-audit.v1.json");
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("Introitus","Introit"),collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),gradual:t("Graduale","Gradual"),
  alleluia_tract:t("Alleluia","Alleluia"),sequence:{lat:"",en:""},
  gospel:t("Evangelium","Gospel"),offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion")],
};
function prepared(form="MISSA_CANTATA_INCENSE",secondConfiteor=false){
  return {
    session:{
      resolvedMass:{
        schema:"ao-resolved-mass-v2",date:"2026-10-04",form,
        presentationMode:"LIVE",
        actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Holy Rosary"},
        calendarCelebration:{id:"Tempora/Pent18-0",type:"CALENDAR"},
        explicitlySelectedCelebration:true,
        proper:{status:"READY",data:proper,sourcePath:"Sancti/10-07"},
        overlays:["VOTIVE_PROPER"],
        precedingRites:[],followingActions:[],distinctRite:null,
      },
      plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],
        overlayGraphs:["VOTIVE_PROPER"],normalLastGospel:true,blessingAllowed:true},
    },
    readerPreferences:{mode:"LIVE",language:"en",secondConfiteor,
      postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"},
  };
}
const p=prepared();
const {sourceModel,presentationModel:model}=buildReaderModeModels({
  prepared:p,data,mode:"LIVE",reviewExpandedCards:true,
});
assert.equal(sourceModel.totalCards,39);
assert.equal(model.totalCards,64);
assert.equal(model.cards.filter(card=>card.sourceSectionId==='AO.CARD.013').length,1);
assert.equal(model.cards.find(card=>card.sourceSectionId==='AO.CARD.013')?.title,'Sanctus — Benedictus');
const sourceUnits=data.sungCorpus.blocks.flatMap(b=>b.units.map(u=>({
  ...u,blockId:b.Block_ID,
})));
assert.equal(sourceUnits.length,280);
const canonicalUnits=sourceUnits.filter(u=>/^AO\.SM\.C\d{4}$/.test(u.cue_id));
assert.equal(canonicalUnits.length,279);
const syntheticUnits=sourceUnits.filter(u=>!/^AO\.SM\.C\d{4}$/.test(u.cue_id));
assert.deepEqual(syntheticUnits.map(u=>u.cue_id),["AO.SM.B096.SYN"],
  "Additional source-editorial cues must be reviewed, not silently treated as spoken");
const sourceCueIds=canonicalUnits.map(u=>u.cue_id);
assert.equal(new Set(sourceCueIds).size,279);

const byCue=new Map();
for(const card of model.cards){
  assert.ok(card.paragraphs.length || card.sourceSectionId,
    "Blank LIVE review card without an explicit state owner "+card.title);
  for(const paragraph of card.paragraphs){
    const ids=paragraph.sourceCueIds??[];
    for(const cueId of ids){
      if(!/^AO\.SM\.C\d{4}$/.test(cueId))continue;
      assert.equal(byCue.has(cueId),false,
        cueId+": one canonical utterance appears on two visible prayer cards");
      byCue.set(cueId,{card,paragraph});
    }
  }
}
// These donor IDs are NOT missing prayers. Fourteen PRIEST_ACTION
// placeholders are replaced by the actual, date-resolved Proper texts;
// four private-recitation state markers have no displayed spoken paragraph.
// All 18 remain in the canonical donor and the source audit.
const properReplacements=Object.freeze({
  "AO.SM.B014":["AO.SM.C0042","AO.SM.C0043"],
  "AO.SM.B019":["AO.SM.C0073"],
  "AO.SM.B020":["AO.SM.C0075"],
  "AO.SM.B021":["AO.SM.C0077"],
  "AO.SM.B022":["AO.SM.C0078"],
  "AO.SM.B026":["AO.SM.C0086"],
  "AO.SM.B030":["AO.SM.C0109"],
  "AO.SM.B040":["AO.SM.C0134"],
  "AO.SM.B045":["AO.SM.C0144"],
  "AO.SM.B085":["AO.SM.C0249","AO.SM.C0250"],
  "AO.SM.B088":["AO.SM.C0254","AO.SM.C0256"],
});
const privateStateMarkers=new Set([
  "AO.SM.C0276","AO.SM.C0277","AO.SM.C0278","AO.SM.C0279",
]);
const properPlaceholderIds=new Set(Object.values(properReplacements).flat());
assert.equal(properPlaceholderIds.size,14);
const nonDisplay=new Set([...properPlaceholderIds,...privateStateMarkers]);
assert.equal(nonDisplay.size,18);
for(const unit of canonicalUnits){
  if(!nonDisplay.has(unit.cue_id))continue;
  if(privateStateMarkers.has(unit.cue_id)){
    assert.equal(unit.type,"state",unit.cue_id+": private recitation marker became a spoken donor");
    continue;
  }
  assert.equal(unit.type,"text",unit.cue_id+": Proper placeholder unexpectedly changed type");
  assert.equal(unit.clock,"PRIEST_ACTION",
    unit.cue_id+": Proper placeholder unexpectedly contains independent spoken prayer");
  const block=Object.entries(properReplacements).find(([,ids])=>ids.includes(unit.cue_id))?.[0];
  assert.equal(unit.blockId,block,unit.cue_id+": excluded source no longer belongs to its Proper");
  const owners=model.cards.flatMap(card=>(card.blocks??[])
    .filter(meta=>meta.blockId===block&&meta.paragraphCount>0)
    .map(meta=>({card,meta})));
  const slot=data.sungCorpus.blocks.find(b=>b.Block_ID===block)?.Proper_Slot;
  const status=sourceModel.properSlots?.slots?.[slot]?.status;
  if(status==="NOT_APPLICABLE"){
    assert.equal(owners.length,0,block+": not-applicable sequence must not invent a second chant");
  }else{
    assert.equal(status,"READY",block+": Proper block has no ready source envelope");
    assert.equal(owners.length,1,block+": actual resolved Proper has no unique reading-stage owner");
    assert.ok(owners[0].card.paragraphs.slice(
      owners[0].meta.firstParagraphIndex,
      owners[0].meta.firstParagraphIndex+owners[0].meta.paragraphCount).length,
      block+": resolved Proper has no prayer text");
  }
}
assert.deepEqual([...byCue.keys()].sort(),
  sourceCueIds.filter(id=>!nonDisplay.has(id)).sort(),
  "The 65-card presentation lost a real cue, or a Proper replacement lost its distinct owner");
assert.equal(byCue.size,261,
  "Expected 261 displayed canonical utterances plus 14 Proper replacements and four state markers");
const sourceRoles=new Map(speakerAudit.records.map(r=>[r.cueId,r]));
assert.equal(sourceRoles.size,280);
// The frozen Sung source audit retains conditional minister ownership;
// the selected MISSA_CANTATA_INCENSE presentation resolves that ownership
// to the celebrant at its specific Gospel/dismissal moments.
const selectedFormActors=Object.freeze({
  "AO.SM.C0082":"PRIEST",
  "AO.SM.C0084":"PRIEST",
  "AO.SM.C0259":"PRIEST",
});
for(const unit of canonicalUnits){
  if(nonDisplay.has(unit.cue_id))continue;
  const hit=byCue.get(unit.cue_id);
  assert.ok(hit,unit.cue_id+": missing rendered source cue");
  const audited=sourceRoles.get(unit.cue_id)?.role;
  if(selectedFormActors[unit.cue_id]){
    assert.ok(["GOSPEL_PROCLAIMER","DISMISSAL_MINISTER"].includes(audited),
      unit.cue_id+": historical source audit no longer preserves conditional ministry");
  }
  assert.equal(hit.paragraph.speakerRole,selectedFormActors[unit.cue_id]??audited,
    unit.cue_id+": selected-form performer no longer follows the historical source audit");
}
const find=id=>byCue.get(id);
const card=id=>find(id)?.card;
const role=id=>find(id)?.paragraph?.speakerRole;
const distinct=(first,second,label)=>assert.notEqual(
  card(first)?.sectionId,card(second)?.sectionId,label);

// Speaker/chant turns: celebrant intones only the true incipit; the
// servers' private prayers and every ordinary congregational Amen remain
// visibly separate paragraphs without adding short-response swipe cards.
assert.equal(role("AO.SM.C0053"),"PRIEST");
assert.equal(role("AO.SM.C0054"),"PRIEST");
assert.equal(role("AO.SM.C0055"),"SCHOLA");
assert.equal(role("AO.SM.C0089"),"PRIEST");
assert.equal(role("AO.SM.C0090"),"PRIEST");
assert.equal(role("AO.SM.C0091"),"SCHOLA");
assert.equal(card("AO.SM.C0053"),card("AO.SM.C0054"));
assert.equal(card("AO.SM.C0089"),card("AO.SM.C0090"));
distinct("AO.SM.C0054","AO.SM.C0055","Gloria Schola begins after celebrant's full intonation");
distinct("AO.SM.C0090","AO.SM.C0091","Credo Schola begins after celebrant's full intonation");
assert.equal(role("AO.SM.C0020"),"PRIEST");
assert.equal(role("AO.SM.C0025"),"MINISTERS");
assert.equal(role("AO.SM.C0027"),"MINISTERS");
assert.equal(card("AO.SM.C0131"),card("AO.SM.C0132"),
  "Orate fratres and Suscipiat response must share their navigable prayer card");

// Certify exact response/gesture/position/posture ownership against every
// canonical utterance, not only a handpicked sequence of screenshots.
const ctrl=createReaderCueStateController({
  registries,sungCorpus:data.sungCorpus,prepared:p,gestureMatrix,
});
assert.equal(ctrl.supported,true);
const conditions=new Set([
  ...ctrl.conditions??[],
  "AO_DEFAULT_1962_SUNG","DEFAULT_SUNG_PROFILE","PROCESSION_ACTIVE",
  "PUBLIC_KYRIE","COLLECT_SEQUENCE","PUBLIC_GOSPEL","OFFERTORY_GREETING",
  "PREFACE_DIALOGUE","CANON_START","COMMUNION_PREPARATION",
  "POSTCOMMUNION_GREETING","GLORIA_APPOINTED","CREDO_APPOINTED",
  "AGNUS_DEI_PUBLIC","LAST_GOSPEL_PRESENT",
  "SECOND_CONFITEOR_LOCAL_CUSTOM_ENABLED",
  "PERSONALLY_SINGING_OR_PROFILE_STAND",
  "LOCAL_PROFILE_KNEEL_FOR_BLESSING",
  "POST_CONSECRATION_STAND_PROFILE","LOCAL_PROFILE_SIT_AFTER_COMMUNION",
]);
const conditional=(items,cueId)=>items.find(i=>i.cueId===cueId)??null;
for(const unit of canonicalUnits){
  const id=unit.cue_id;
  const source=ctrl.project(id,{conditions:[...conditions]});
  assert.equal(source.supported,true,id+": cue projection falsely unsupported");
  assert.equal(source.reason,null,id+": source resolved to a synthetic fallback");
  const response=conditional(registries.responses.items,id);
  assert.equal(source.response?.text??null,response?.text??null,
    id+": exact response leaked onto another prayer or disappeared");
  const action=conditional(registries.actions.items,id);
  if(action && conditionPasses(action.condition,conditions)){
    assert.equal(source.priestAction?.label,action.label,
      id+": canonical priest action missing or misidentified");
  }
  const voice=source.priestVoice;
  assert.ok(voice?.cueId || id==="AO.SM.C0001",
    id+": missing persistent priest voice indication");
  assert.ok(source.priestPosition?.cueId,id+": missing persistent priest station");
}
assert.equal(registries.responses.items.length,23);
for(const item of registries.responses.items){
  assert.equal(role(item.cueId),"RESPONDERS",
    item.cueId+": response prompt attributed to a celebrant or to the Schola");
  assert.ok(find(item.cueId),item.cueId+": response text missing in model");
}
const optionalTitle="Second Confiteor · Optional Local Custom";
const optional=model.cards.filter(c=>c.title===optionalTitle);
assert.equal(optional.length,1,"Local custom must have one dedicated opt-in prayer card");
for(const id of ["AO.SM.C0239","AO.SM.C0241"]){
  assert.equal(card(id),optional[0],
    id+": conditional Communion response escaped its optional prayer card");
  assert.equal(ctrl.project(id).response,null,
    id+": pre-1960 local response became mandatory in 1962");
}
assert.ok(ctrl.project("AO.SM.C0239",{conditions:[...conditions]}).response);
assert.ok(ctrl.project("AO.SM.C0241",{conditions:[...conditions]}).response);

// Distinguish the priest's silent formula from the actual elevation and
// prevent a false consecration gesture on his words.
distinct("AO.SM.C0172","AO.SM.C0173","Host formula is a distinct stage");
distinct("AO.SM.C0178","AO.SM.C0179","Chalice formula is a distinct stage");
assert.equal(card("AO.SM.C0173"),card("AO.SM.C0174"),
  "Elevation of the Host must stay in the exact words card");
assert.equal(card("AO.SM.C0179"),card("AO.SM.C0181"),
  "Elevation of the Chalice must stay in the exact words card");
for(const id of ["AO.SM.C0173","AO.SM.C0179","AO.SM.C0180"]){
  assert.equal(ctrl.project(id).gesture,null,id+": premature elevation gesture");
}
for(const [cueId,fragment] of [
  ["AO.SM.C0174","HOST"],["AO.SM.C0181","CHALICE"],
]){
  assert.match(ctrl.project(cueId).priestAction?.label??"",new RegExp(fragment));
  assert.match(ctrl.project(cueId).gesture?.action??"",/Sacred Host|Chalice/);
}
assert.match(ctrl.project("AO.SM.C0273").gesture?.action??"",/Genuflect/i,
  "Last Gospel genuflection lost its exact Et Verbum cue");

// Sang profile is explicit; Low Mass must never inherit this Sung gesture
// matrix, source response clock or a false choir track.
const low=createReaderCueStateController({
  registries,sungCorpus:data.sungCorpus,prepared:prepared("LOW"),
});
assert.equal(low.supported,false);
assert.equal(low.project("AO.SM.C0174").priestAction,null);

console.log("Liturgical LIVE gate PASS — 280 donor records, 279 canonical cues + 1 editorial, 64 source-owned cards, all response/action/station/voice gates, conditional Communion Confiteor, double elevations, Gloria/Credo roles.");
