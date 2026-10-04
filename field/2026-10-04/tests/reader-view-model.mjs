import { resolveReaderPreferences } from "../src/mass/reader-state.js";
import { buildReaderFrameModel } from "../src/mass/reader-view-model.js";

const expect=(x,m)=>{if(!x)throw new Error(m)};

const prefs=resolveReaderPreferences({
  mode:"live",
  postureProfile:"MY_LOCAL",
  gestureProfile:"GUIDED_1962",
  language:"vernacular",
});

const frame=buildReaderFrameModel({
  preferences:prefs,
  localPostureOverride:"STAND",
  moment:{
    id:"INCARNATUS",
    section:"Credo",
    title:"Credo",
    semantic:"INCARNATUS",
    posture:{value:"KNEEL"},
    priestPosition:"ALTAR",
    priestVoice:"AUDIBLE",
    schola:"CREDO",
    lines:[
      {kind:"VERSICLE",lat:"Et incarnatus est",vernacular:"And was incarnate"},
      {kind:"RESPONSE",lat:"Amen.",vernacular:"Amen."},
      {kind:"TEXT",lat:"Latin body",vernacular:"Vernacular body"},
    ],
  },
});

expect(frame.mode==="LIVE","reader mode normalization lost");
expect(frame.leftRail.gesture?.type==="GENUFLECT","Incarnatus genuflection lost");
expect(frame.leftRail.posture.value==="STAND","local posture projection lost");
expect(frame.ownership==="INCARNATUS_GENUFLECT","Incarnatus ownership changed");
expect(frame.lines[0].policy.primary==="LATIN","versicle is no longer Latin-first");
expect(frame.lines[1].policy.primary==="LATIN","response is no longer Latin-first");
expect(frame.lines[2].policy.primary==="VERNACULAR","ordinary text is no longer vernacular-first");
expect(frame.topState.guide.failClosed===true,"missing Guide registry did not fail closed");

const guide=buildReaderFrameModel({
  preferences:prefs,
  guideRegistryAvailable:true,
  guideRubric:{id:"R1",text:"Sourced rubric"},
  moment:{section:"Offertory",lines:[]},
});
expect(guide.topState.guide.failClosed===false,"available Guide registry remained blocked");
expect(guide.topState.guide.rubric.id==="R1","Guide rubric lost");

console.log("Reader view-model PASS: ribbons/rails/language/state ownership/Guide guards.");
