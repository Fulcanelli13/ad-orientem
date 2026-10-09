// R22 native Palm Sunday payload/controller.
// Liturgical text is source-pinned; actor/object/personal-state semantics come
// from the recovered twelve-record PALM graph. Palm cards remain outside Mass identity.

function freeze(value){return Object.freeze(value)}
function clean(value){const s=String(value??"").trim();return s||null}

function row(id,kind,latin,sourceRecordId){
  const text=clean(latin);
  if(!text)throw new Error("Palm reader text missing for "+id);
  return freeze({id,kind,latin:text,sourceRecordId});
}

export function buildPalmPayload({graph,payload}={}){
  if(!Array.isArray(graph) || graph.length!==12)throw new Error("Certified twelve-record PALM graph required");
  if(payload?.schema!=="ao-r22-palm-payload-v1")throw new Error("Pinned Palm payload required");
  const ids=new Set(graph.map(x=>x.id));
  for(const id of [
    "PALM-BLS-010","PALM-BLS-020","PALM-DST-010","PALM-DST-020","PALM-DST-030",
    "PALM-GSP-010","PALM-GSP-020","PALM-PRC-010","PALM-PRC-020","PALM-RET-010",
    "PALM-MASS-010","PALM-MASS-020"
  ])if(!ids.has(id))throw new Error("Palm graph missing "+id);

  const t=payload.texts??{};
  return freeze({
    schema:"ao-r22-palm-reader-payload-v1",
    cards:freeze([
      freeze({
        id:"PALM-R01",title:"Blessing of Palms",
        sourceRecordIds:freeze(["PALM-BLS-010","PALM-BLS-020"]),
        actorScope:"FAITHFUL",posture:"STAND",
        paragraphs:freeze([
          row("PALM-R01-01","TEXT",t.openingAntiphon,"PALM-BLS-010"),
          row("PALM-R01-02","VERSICLE",t.versicle,"PALM-BLS-010"),
          row("PALM-R01-03","RESPONSE",t.response,"PALM-BLS-010"),
          row("PALM-R01-04","TEXT",t.oremus,"PALM-BLS-010"),
          row("PALM-R01-05","TEXT",t.blessingPrayer,"PALM-BLS-010"),
          row("PALM-R01-06","TEXT",t.conclusion,"PALM-BLS-010"),
          row("PALM-R01-07","RESPONSE",t.amen,"PALM-BLS-010"),
        ]),
        guide:"Stand for the blessing. Do not imitate celebrant-only ritual gestures."
      }),
      freeze({
        id:"PALM-R02",title:"Distribution of Palms",
        sourceRecordIds:freeze(["PALM-DST-010","PALM-DST-020","PALM-DST-030"]),
        actorScope:"PALM_RECIPIENT",posture:"LOCAL",
        paragraphs:freeze([
          row("PALM-R02-01","TEXT",t.puerI,"PALM-DST-010"),
          row("PALM-R02-02","TEXT",t.puerII,"PALM-DST-030"),
        ]),
        recipientStates:freeze({
          RECIPIENT_CALLED:freeze({posture:"STAND_WALK",action:"APPROACH_ALTAR_RAIL"}),
          RECEIVE_PALM:freeze({posture:"KNEEL",action:"RECEIVE_PALM"}),
          PALM_RECEIVED:freeze({posture:"STAND_WALK",action:"RETURN_HOLDING_PALM"}),
        }),
        guide:"Only the person currently receiving the palm follows the recipient posture."
      }),
      freeze({
        id:"PALM-R03",title:"Gospel before the Procession",
        sourceRecordIds:freeze(["PALM-GSP-010","PALM-GSP-020"]),
        actorScope:"FAITHFUL",posture:"STAND",gesture:"GOSPEL_CROSSES",
        paragraphs:freeze([
          row("PALM-R03-01","VERSICLE",t.gospelHeading,"PALM-GSP-010"),
          row("PALM-R03-02","RESPONSE",t.gospelResponse,"PALM-GSP-010"),
          row("PALM-R03-03","TEXT",t.gospel,"PALM-GSP-020"),
          row("PALM-R03-04","RESPONSE",t.gospelEnd,"PALM-GSP-020"),
        ]),
      }),
      freeze({
        id:"PALM-R04",title:"Procession",
        sourceRecordIds:freeze(["PALM-PRC-010","PALM-PRC-020"]),
        actorScope:"FAITHFUL_PARTICIPATING",posture:"PROCESSIONAL",
        paragraphs:freeze([
          row("PALM-R04-01","VERSICLE",t.procedamus,"PALM-PRC-010"),
          row("PALM-R04-02","RESPONSE",t.processionResponse,"PALM-PRC-010"),
          row("PALM-R04-03","TEXT",t.gloriaLaus,"PALM-PRC-020"),
        ]),
        guide:"If you are participating, walk in procession carrying the palm; otherwise retain the local posture."
      }),
      freeze({
        id:"PALM-R05",title:"Return to the Church",
        sourceRecordIds:freeze(["PALM-RET-010"]),
        actorScope:"FAITHFUL_PARTICIPATING",posture:"PROCESSIONAL_STAND",
        paragraphs:freeze([
          row("PALM-R05-01","TEXT",t.ingrediente,"PALM-RET-010"),
        ]),
      }),
      freeze({
        id:"PALM-R06",title:"Conclusion of the Procession",
        sourceRecordIds:freeze(["PALM-RET-010"]),
        actorScope:"ALL_FAITHFUL",posture:"STAND",
        paragraphs:freeze([
          row("PALM-R06-01","VERSICLE",t.versicle,"PALM-RET-010"),
          row("PALM-R06-02","RESPONSE",t.response,"PALM-RET-010"),
          row("PALM-R06-03","TEXT",t.oremus,"PALM-RET-010"),
          row("PALM-R06-04","TEXT",t.finalPrayer,"PALM-RET-010"),
          row("PALM-R06-05","TEXT",t.finalConclusion,"PALM-RET-010"),
          row("PALM-R06-06","RESPONSE",t.amen,"PALM-RET-010"),
        ]),
      }),
      freeze({
        id:"PALM-R07",title:"Mass begins at the Introit",
        sourceRecordIds:freeze(["PALM-MASS-010","PALM-MASS-020"]),
        actorScope:"ALL",posture:"ORDINARY_PROFILE",paragraphs:freeze([]),
        handoff:"INTROIT",ordinaryOpeningSuppressed:true,normalLastGospel:false,
        guide:"The Palm rite is complete. The Prayers at the Foot are omitted; Mass begins at the Introit."
      }),
    ])
  });
}

export function createPalmReaderController(args={}){
  const built=buildPalmPayload(args);
  let index=0;
  let recipientState=null;
  let processionParticipant=false;

  function state(){
    const card=built.cards[index]??null;
    const recipient=card?.recipientStates?.[recipientState]??null;
    return freeze({
      schema:"ao-r22-palm-reader-state-v1",
      supported:true,index,total:built.cards.length,
      atStart:index===0,atEnd:index===built.cards.length-1,
      card,
      recipientState,
      recipientPosture:recipient?.posture??null,
      recipientAction:recipient?.action??null,
      processionParticipant,
      // PROCESSIONAL applies to those actually following the procession,
      // not everybody standing in the church or holding a blessed palm.
      posture:card?.actorScope==="FAITHFUL_PARTICIPATING" && !processionParticipant
        ? null : card?.posture??null,
      handoff:card?.handoff??null,
      ordinaryOpeningSuppressed:Boolean(card?.ordinaryOpeningSuppressed),
      normalLastGospel:card?.normalLastGospel!==false,
    });
  }
  function next(){index=Math.min(index+1,built.cards.length-1);recipientState=null;return state()}
  function previous(){index=Math.max(index-1,0);recipientState=null;return state()}
  function goTo(cardId){const hit=built.cards.findIndex(x=>x.id===cardId);if(hit>=0){index=hit;recipientState=null;}return state()}
  function setRecipientState(value){
    if(!built.cards[index]?.recipientStates?.[value])throw new Error("Unsupported Palm recipient state: "+value);
    recipientState=value;return state();
  }
  function setProcessionParticipant(value){processionParticipant=Boolean(value);return state()}
  return freeze({schema:"ao-r22-palm-reader-controller-v1",supported:true,cards:built.cards,project:state,next,previous,goTo,setRecipientState,setProcessionParticipant});
}


async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data || typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}

export async function loadPalmReaderData({
  fetchImpl=globalThis.fetch,
  baseUrl=import.meta.url,
}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-palm.v1.json",baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([
    readJson(fetchImpl,payloadUrl,"Palm reader payload"),
    readJson(fetchImpl,extensionUrl,"special-days extension"),
  ]);
  const graph=extension?.graphs?.PALM;
  if(!Array.isArray(graph))throw new Error("Certified PALM graph unavailable");
  return freeze({
    payload,
    graph:freeze([...graph]),
    urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)}),
  });
}
