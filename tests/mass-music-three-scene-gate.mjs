// Research gate only: reconcile three proposed music scenes against the
// present, unchanged source-first and curated LIVE Mass card structures.
// This does not install a music clock or change runtime Schola behaviour.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildReaderModeModels} from "../src/mass/reader-mode-switch.js";

const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const gate=load("../data/research/mass-music-three-scene-gate-20261019.v1.json");
const data={
  sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
  canonSourceMap:load("../data/presentation/reader-canon-source-map.v1.json"),
  nuptialData:load("../data/presentation/reader-nuptial.v1.json"),
  frenchOrdinary:load("../data/presentation/reader-french-ordinary.v1.json"),
};
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",introit:t("Introitus","Introit"),
  collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),gradual:t("Graduale","Gradual"),
  alleluia_tract:t("Alleluia","Alleluia"),sequence:{lat:"",en:""},
  gospel:t("Evangelium","Gospel"),offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion")],
};
const prepared={
  session:{
    resolvedMass:{
      schema:"ao-resolved-mass-v2",date:"2026-10-04",
      form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE",
      actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Holy Rosary"},
      calendarCelebration:{id:"Tempora/Pent18-0",type:"CALENDAR"},
      explicitlySelectedCelebration:true,
      proper:{status:"READY",data:proper,sourcePath:"Sancti/10-07"},
      overlays:["VOTIVE_PROPER"],precedingRites:[],
      followingActions:[],distinctRite:null,
    },
    plan:{kind:"MASS",precedingGraphs:[],followingGraphs:[],
      overlayGraphs:["VOTIVE_PROPER"],normalLastGospel:true,blessingAllowed:true},
  },
  readerPreferences:{mode:"LIVE",language:"en",
    postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"},
};
const canonical=buildReaderModeModels({prepared,data,mode:"LIVE"});
const review=buildReaderModeModels({prepared,data,mode:"LIVE",reviewExpandedCards:true});
assert.equal(canonical.sourceModel.totalCards,39);
assert.equal(canonical.presentationModel.totalCards,48);
assert.equal(review.presentationModel.totalCards,64);
assert.equal(gate.schema,"ao-live-music-three-scene-research-v1");
assert.equal(gate.status,"RESEARCH_DESIGN_ONLY");
assert.equal(gate.canonicalCueMutation,false);
assert.equal(gate.readerCardMutation,false);
assert.equal(gate.scenes.length,3);
assert.ok(gate.constraints.includes("NO_MUSIC_PROGRESS_FROM_SCROLL_POSITION"));
assert.ok(gate.constraints.includes("NO_MUSIC_PROGRESS_FROM_TEXT_ANIMATION_TIMER"));
const blocks=new Map(data.sungCorpus.blocks.map(b=>[b.Block_ID,b]));
const sources=new Map(data.sungCorpus.blocks.flatMap(b=>
  (b.units??[]).map(u=>[u.cue_id,{cue:u,blockId:b.Block_ID}])));
assert.equal([...sources.keys()].filter(x=>/^AO[.]SM[.]C[0-9]{4}$/.test(x)).length,279);
for(const scene of gate.scenes){
  assert.ok(scene.authority?.length>0,scene.id+": missing norm");
  assert.ok(scene.steps?.length>0,scene.id+": no stages");
  for(const step of scene.steps){
    assert.ok(step.id && step.choir && step.choirAction && step.center && step.organ,scene.id+": incomplete step");
    assert.ok(step.sourceBlockIds?.length && step.sourceCueIds?.length && step.cardSourceSections?.length,
      scene.id+"/"+step.id+": no canonical source anchor");
    for(const id of step.sourceBlockIds){
      assert.ok(blocks.has(id),scene.id+"/"+step.id+" unknown block "+id);
      for(const presentation of [canonical.presentationModel,review.presentationModel]){
        const matches=presentation.cards.filter(card=>
          (card.blocks??[]).some(block=>block.blockId===id));
        assert.ok(matches.length>0,
          scene.id+"/"+step.id+": "+presentation.totalCards+"-card model missing "+id);
        // Canon cards carry their own 14-stage source-map identity; some
        // reader projections also retain the legacy 30-card parent identity.
        // Verify that identity against the canonical Canon map rather than
        // assuming all presentations expose the same sourceSectionId field.
        const canonIds=step.cardSourceSections.filter(x=>x.startsWith("AO.CANON."));
        if(canonIds.length){
          assert.ok(data.canonSourceMap.segments.some(seg=>
            canonIds.includes(seg.id)&&seg.blockIds.includes(id)),
            scene.id+"/"+step.id+": Canon map does not own "+id);
        }else{
          assert.ok(matches.some(card=>step.cardSourceSections.some(s=>
            s===card.sourceSectionId||s===card.sectionId)),
            scene.id+"/"+step.id+": ordinary section owner mismatch "+id);
        }
      }
    }
    for(const cueId of step.sourceCueIds){
      const source=sources.get(cueId);
      assert.ok(source,scene.id+"/"+step.id+" unknown cue "+cueId);
      assert.ok(step.sourceBlockIds.includes(source.blockId),
        scene.id+"/"+step.id+": "+cueId+" comes from "+source.blockId+" not linked");
    }
  }
}
const off=gate.scenes.find(x=>x.id==="MUS.SCENE.OFFERTORY_SECRET");
assert.ok(off.steps.find(x=>x.id==="OFFERTORY_INVITATION")?.sourceCueIds.includes("AO.SM.C0108"));
assert.ok(off.steps.find(x=>x.id==="SECRET_CONCLUSION")?.sourceCueIds.includes("AO.SM.C0135"));
assert.match(off.steps.find(x=>x.id==="SECRET_CONCLUSION")?.choirAction,/BOUNDARY_EXPIRED/,
  "Offertory cannot claim heard completion after Secret");
const sanctus=gate.scenes.find(x=>x.id==="MUS.SCENE.SANCTUS_CONSECRATION");
const consecration=sanctus.steps.filter(x=>x.display==="SILENCE_REQUIRED");
assert.deepEqual(consecration.map(x=>x.id),["CONSECRATION_HOST","CONSECRATION_CHALICE"]);
assert.ok(consecration.every(x=>x.choir==="NONE" && x.organ==="FORBIDDEN" &&
  x.choirAction==="SUPPRESS_ALL_SOUNDING_STATES_DURING_CONSECRATION"));
const after=sanctus.steps.find(x=>x.id==="POST_CHALICE");
assert.equal(after.condition,"POLYPHONIC_SETTING");
assert.equal(after.choirAction,"CAN_RELEASE_DELAYED_BENEDICTUS_ON_EXPLICIT_OBSERVATION");
assert.ok(sanctus.steps.find(x=>x.id==="GREGORIAN_BENEDICTUS").choirAction.includes("WITHOUT_BREAK"));
const canon14=review.presentationModel.cards.filter(c=>c.sourceSectionId==="AO.CANON.14");
assert.ok(canon14.some(c=>(c.blocks??[]).some(x=>x.blockId==="AO.SM.B061")),
  "The public Canon conclusion must remain owned by canonical Canon.14");
const kyrie=gate.scenes.find(x=>x.id==="MUS.SCENE.INTROIT_KYRIE");
assert.ok(kyrie.steps.find(x=>x.id==="ENTRANCE").choirAction.includes("EXPECTED"));
assert.ok(kyrie.steps.find(x=>x.id==="INTROIT_VISIBLE").choirAction.includes("NOT_SOUNDING_CLAIM"));
console.log("Three music-scene research gates PASS: 3 scenes, 21 steps, 39/48/64 card source ownership, no ceremonial mutation");
