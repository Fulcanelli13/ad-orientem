import { createAspergesReaderController, loadAspergesReaderData } from "./reader-asperges.js";
import { createPalmReaderController, loadPalmReaderData } from "./reader-palm.js";
import { createAshReaderController, loadAshReaderData } from "./reader-ash.js";

const SUPPORTED=Object.freeze(["ASPERGES","PALM","ASH"]);
const END_CARD=Object.freeze({ASPERGES:"ASP-R05",PALM:"PALM-R07",ASH:"ASH-R05"});

function freeze(value){return Object.freeze(value)}
function preceding(prepared){
  return [...(prepared?.session?.plan?.precedingGraphs??[])].map(String);
}
function moment(kind,state){
  const card=state?.card;
  if(!card)return null;
  const recipientPosture=state?.recipientPosture??null;
  return freeze({
    id:card.id,
    sectionTitle:kind==="ASPERGES"?"Asperges":kind==="PALM"?"Palm Sunday":"Ash Wednesday",
    cardTitle:card.title,
    cardUpdate:true,
    paragraphs:freeze((card.paragraphs??[]).map(row=>freeze({
      id:row.id,
      kind:row.kind,
      primary:row.latin,
      secondary:null,
      alternate:null,
      replaceOnToggle:false,
      active:false,
      sourceCueIds:freeze([row.sourceRecordId].filter(Boolean)),
    }))),
    progress:String(state.index+1)+" / "+String(state.total)+" · "+(kind==="ASPERGES"?"Asperges":kind==="PALM"?"Palm Rite":"Ash Rite"),
    posture:recipientPosture
      ? freeze({label:recipientPosture})
      : card.posture && !["LOCAL","ORDINARY_PROFILE","INHERIT"].includes(card.posture)
        ? freeze({label:card.posture})
        : null,
    gesture:state.faithfulGesture
      ? freeze({label:state.faithfulGesture})
      : card.gesture
        ? freeze({label:card.gesture})
        : null,
    response:null,
    bell:null,
    cinematic:null,
    priestPosition:null,
    priestVoice:null,
    schola:null,
    guide:card.guide ? freeze({registryAvailable:true,text:card.guide,detail:null}) : null,
    specialRite:kind,
    handoff:state.handoff??card.handoff??null,
  });
}

export async function createNativePreludeRuntime({
  prepared,
  aspergesData=null,
  palmData=null,
  ashData=null,
  loadAspergesData=loadAspergesReaderData,
  loadPalmData=loadPalmReaderData,
  loadAshData=loadAshReaderData,
  aspergesRiteContext=null,
}={}){
  const active=preceding(prepared).filter(id=>SUPPORTED.includes(id));
  const unsupported=preceding(prepared).filter(id=>!SUPPORTED.includes(id));
  if(unsupported.length)throw new Error("Unsupported native prelude: "+unsupported.join(", "));
  if(active.length===0)return null;
  if(active.length>1)throw new Error("Multiple native preludes are not yet composable");

  const kind=active[0];
  let controller;
  if(kind==="ASPERGES"){
    const data=aspergesData ?? await loadAspergesData(prepared);
    controller=createAspergesReaderController({
      graph:data?.graph,payload:data?.payload,riteContext:aspergesRiteContext??{}
    });
  }else if(kind==="PALM"){
    const data=palmData ?? await loadPalmData(prepared);
    controller=createPalmReaderController({graph:data?.graph,payload:data?.payload});
  }else{
    const data=ashData ?? await loadAshData(prepared);
    controller=createAshReaderController({graph:data?.graph,payload:data?.payload});
  }

  function project(){return controller.project()}
  function renderMoment(){return moment(kind,project())}
  function next(){controller.next();return renderMoment()}
  function previous(){controller.previous();return renderMoment()}
  function goToEnd(){controller.goTo(END_CARD[kind]);return renderMoment()}
  function markActuallySprinkled(){
    if(kind!=="ASPERGES")return project();
    controller.setActuallySprinkled(true);
    return renderMoment();
  }
  function setRecipientState(value){
    if(kind==="PALM" || kind==="ASH"){
      controller.setRecipientState(value);
      return renderMoment();
    }
    return project();
  }

  return freeze({
    schema:"ao-release-native-prelude-runtime-v1",
    kind,controller,
    project,renderMoment,next,previous,goToEnd,
    markActuallySprinkled,setRecipientState,
    get handoff(){return project()?.handoff??project()?.card?.handoff??null},
    get atStart(){return Boolean(project()?.atStart)},
    get atEnd(){return Boolean(project()?.atEnd)},
  });
}
