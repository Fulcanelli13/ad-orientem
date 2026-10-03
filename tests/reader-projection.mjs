import { projectCanonicalEventToReaderMoment, projectResolvedReaderText } from "../src/mass/reader-projection.js";

const expect=(x,m)=>{if(!x)throw new Error(m)};

const introitEvent={
  id:"MC-INT-020",
  phase:"INTROIT",
  title:"Priest recites Introit",
  actor:"PRIEST",
  contentRef:"proper.introit",
  sourceMomentRefs:["E08"],
  voice:{speechAudibility:"LOW_VOICE"}
};
const introit=projectCanonicalEventToReaderMoment({
  event:introitEvent,
  resolvedText:{
    status:"READY",
    title:"Introit",
    paragraphs:[{kind:"TEXT",latin:"Gaudeamus omnes",vernacular:"Let us all rejoice"}]
  },
  route:{priestPosition:{label:"EPISTLE SIDE"}},
  participation:{posture:{label:"STAND"}},
});
expect(introit.cardUpdate===true,"text-bearing event did not update card");
expect(introit.paragraphs[0].primary==="Let us all rejoice","ordinary text did not default vernacular");
expect(introit.paragraphs[0].alternate==="Gaudeamus omnes","Latin replacement text missing");
expect(introit.paragraphs[0].replaceOnToggle===true,"ordinary text did not expose replace-on-toggle");
expect(introit.priestVoice.label==="LOW VOICE","priest voice projection missing");

const dialogue=projectResolvedReaderText({
  status:"READY",
  paragraphs:[{kind:"RESPONSE",latin:"Et cum spiritu tuo.",vernacular:"And with thy spirit."}]
});
expect(dialogue[0].primary==="Et cum spiritu tuo.","response did not default Latin");
expect(dialogue[0].secondary==="And with thy spirit.","response vernacular-under missing");
expect(dialogue[0].replaceOnToggle===false,"response incorrectly became replace-on-toggle");

const action=projectCanonicalEventToReaderMoment({
  event:{
    id:"MC-ALT-010",
    phase:"ALTAR",
    title:"Priest ascends altar",
    actor:"PRIEST",
    contentRef:null,
    sourceMomentRefs:["E06"],
    voice:{speechAudibility:"NONE"}
  },
  route:{priestPosition:{label:"ASCENDING STEPS"}},
  participation:{gesture:{label:"ASCEND"}},
});
expect(action.cardUpdate===false,"action-only event tried to replace prayer card");
expect(action.paragraphs===undefined,"action-only event fabricated paragraphs");
expect(action.priestPosition.label==="ASCENDING STEPS","action-only route state was lost");

let blankBlocked=false;
try{projectCanonicalEventToReaderMoment({event:introitEvent});}catch(error){
  blankBlocked=/refusing blank reader card/.test(String(error.message));
}
expect(blankBlocked,"unresolved text-bearing event did not fail closed");

let unsourcedGuideBlocked=false;
try{
  projectCanonicalEventToReaderMoment({
    event:{...introitEvent,contentRef:null},
    guide:{registryAvailable:false,rubric:{text:"Invented rubric"}}
  });
}catch{unsourcedGuideBlocked=true}
expect(unsourcedGuideBlocked,"unsourced Guide rubric did not fail closed");

const incarnatus=projectCanonicalEventToReaderMoment({
  event:{...introitEvent,id:"INCARNATUS",contentRef:null},
  participation:{posture:{value:"KNEEL"},gesture:{type:"BOW"}},
  presentation:{semantic:"INCARNATUS"}
});
expect(incarnatus.posture===null,"Incarnatus leaked persistent kneeling");
expect(incarnatus.gesture?.type==="GENUFLECT" && incarnatus.gesture?.transient===true,"Incarnatus genuflection guard lost");

console.log("Reader projection PASS: no blank cards, language policy, state-only persistence contract, Guide fail-closed, Incarnatus guard.");
