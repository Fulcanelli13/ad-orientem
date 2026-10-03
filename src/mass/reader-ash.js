// R23 Ash Wednesday native state/payload controller.
// The eight-record recovered ASH graph owns posture/personal-state semantics.
// Long blessing-orations remain source-pinned and fail closed until exact text hydration.

function freeze(v){return Object.freeze(v)}
function clean(v){const s=String(v??"").trim();return s||null}

export function buildAshPayload({graph,payload}={}){
  if(!Array.isArray(graph) || graph.length!==8)throw new Error("Certified eight-record ASH graph required");
  if(payload?.schema!=="ao-r23-ash-payload-v1")throw new Error("Pinned Ash payload required");

  const required=[
    "ASH-BLS-010","ASH-BLS-020","ASH-BLS-030",
    "ASH-DST-010","ASH-DST-020","ASH-DST-030",
    "ASH-END-010","ASH-MASS-010"
  ];
  const ids=new Set(graph.map(x=>x.id));
  for(const id of required)if(!ids.has(id))throw new Error("Ash graph missing "+id);

  const missingOrations=(payload.blessingOrations??[]).filter(x=>!clean(x.fullText));
  const cards=freeze([
    freeze({
      id:"ASH-R01",title:"Opening and Blessing of Ashes",
      sourceRecordIds:freeze(["ASH-BLS-010","ASH-BLS-020"]),
      actorScope:"FAITHFUL",posture:"STAND",
      paragraphs:freeze([
        freeze({id:"ASH-R01-A",kind:"TEXT",latin:clean(payload.opening?.antiphon),sourceRecordId:"ASH-BLS-010"}),
        freeze({id:"ASH-R01-P",kind:"TEXT",latin:clean(payload.opening?.psalm),sourceRecordId:"ASH-BLS-010"}),
        ...(payload.blessingOrations??[]).flatMap((oratio,index)=>[
          freeze({id:"ASH-R01-O"+String(index+1)+"-INTRO",kind:"TEXT",latin:"Orémus.",sourceRecordId:"ASH-BLS-020"}),
          freeze({id:"ASH-R01-O"+String(index+1),kind:"TEXT",latin:clean(oratio.fullText),sourceRecordId:"ASH-BLS-020"}),
          freeze({id:"ASH-R01-O"+String(index+1)+"-AMEN",kind:"RESPONSE",latin:"Amen.",sourceRecordId:"ASH-BLS-020"}),
        ]),
      ]),
      blessingOrations:freeze((payload.blessingOrations??[]).map(x=>freeze({...x}))),
      complete:missingOrations.length===0,
      guide:"Stand for the blessing. Four distinct blessing orations follow."
    }),
    freeze({
      id:"ASH-R02",title:"Blessing Action over the Ashes",
      sourceRecordIds:freeze(["ASH-BLS-030"]),
      actorScope:"FAITHFUL",posture:"STAND",paragraphs:freeze([]),
      faithfulGesture:null,
      guide:"The ashes are sprinkled and incensed. Do not infer a faithful Sign-of-the-Cross cue."
    }),
    freeze({
      id:"ASH-R03",title:"Distribution of Ashes",
      sourceRecordIds:freeze(["ASH-DST-010","ASH-DST-020","ASH-DST-030"]),
      actorScope:"ASH_RECIPIENT",posture:"LOCAL",
      paragraphs:freeze([
        freeze({id:"ASH-R03-F",kind:"TEXT",latin:clean(payload.distribution?.formula),sourceRecordId:"ASH-DST-020"}),
        ...freeze((payload.distribution?.antiphons??[]).map((latin,index)=>freeze({
          id:"ASH-R03-A"+String(index+1),
          kind:"TEXT",latin:clean(latin),sourceRecordId:"ASH-DST-030"
        })))
      ]),
      recipientStates:freeze({
        RECIPIENT_CALLED:freeze({posture:"STAND_WALK",action:"APPROACH_ALTAR_RAIL"}),
        RECEIVE_ASHES:freeze({posture:"KNEEL",action:"RECEIVE_ASHES"}),
        ASHES_RECEIVED:freeze({posture:"STAND_WALK",action:"RISE_AND_RETURN"}),
      }),
      guide:"Recipient posture is personal state only; it never changes the congregation globally."
    }),
    freeze({
      id:"ASH-R04",title:"Concluding Prayer",
      sourceRecordIds:freeze(["ASH-END-010"]),
      actorScope:"FAITHFUL",posture:"STAND",
      paragraphs:freeze([
        freeze({id:"ASH-R04-V",kind:"VERSICLE",latin:clean(payload.conclusion?.versicle),sourceRecordId:"ASH-END-010"}),
        freeze({id:"ASH-R04-R",kind:"RESPONSE",latin:clean(payload.conclusion?.response),sourceRecordId:"ASH-END-010"}),
        freeze({id:"ASH-R04-O",kind:"TEXT",latin:clean(payload.conclusion?.oremus),sourceRecordId:"ASH-END-010"}),
        freeze({id:"ASH-R04-P",kind:"TEXT",latin:clean(payload.conclusion?.prayer),sourceRecordId:"ASH-END-010"}),
        freeze({id:"ASH-R04-E",kind:"TEXT",latin:clean(payload.conclusion?.ending),sourceRecordId:"ASH-END-010"}),
        freeze({id:"ASH-R04-A",kind:"RESPONSE",latin:clean(payload.conclusion?.amen),sourceRecordId:"ASH-END-010"}),
      ])
    }),
    freeze({
      id:"ASH-R05",title:"Mass begins at the Introit",
      sourceRecordIds:freeze(["ASH-MASS-010"]),
      actorScope:"ALL",posture:"ORDINARY_PROFILE",paragraphs:freeze([]),
      handoff:"INTROIT",ordinaryOpeningSuppressed:true,
      guide:"The ash rite is complete. The Prayers at the Foot are omitted; Mass begins at the Introit."
    })
  ]);

  return freeze({
    schema:"ao-r23-ash-reader-payload-v1",
    status:missingOrations.length ? "TEXT_HYDRATION_REQUIRED" : "READY",
    missingOrationIds:freeze(missingOrations.map(x=>x.id)),
    readerPayloadComplete:missingOrations.length===0,
    cards
  });
}

export function createAshReaderController(args={}){
  const built=buildAshPayload(args);
  if(!built.readerPayloadComplete)throw new Error("ASH_FULL_TEXT_HYDRATION_REQUIRED:"+built.missingOrationIds.join(","));
  let index=0;
  let recipientState=null;
  function state(){
    const card=built.cards[index]??null;
    const recipient=card?.recipientStates?.[recipientState]??null;
    return freeze({
      schema:"ao-r23-ash-reader-state-v1",
      supported:true,index,total:built.cards.length,
      atStart:index===0,atEnd:index===built.cards.length-1,
      card,recipientState,
      recipientPosture:recipient?.posture??null,
      recipientAction:recipient?.action??null,
      handoff:card?.handoff??null,
      ordinaryOpeningSuppressed:Boolean(card?.ordinaryOpeningSuppressed),
    });
  }
  function next(){index=Math.min(index+1,built.cards.length-1);recipientState=null;return state()}
  function previous(){index=Math.max(index-1,0);recipientState=null;return state()}
  function goTo(cardId){const hit=built.cards.findIndex(x=>x.id===cardId);if(hit>=0){index=hit;recipientState=null;}return state()}
  function setRecipientState(value){
    if(!built.cards[index]?.recipientStates?.[value])throw new Error("Unsupported Ash recipient state: "+value);
    recipientState=value;return state();
  }
  return freeze({schema:"ao-r23-ash-reader-controller-v1",supported:true,cards:built.cards,project:state,next,previous,goTo,setRecipientState});
}


async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data || typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}

export async function loadAshReaderData({
  fetchImpl=globalThis.fetch,
  baseUrl=import.meta.url,
}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-ash.v1.json",baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([
    readJson(fetchImpl,payloadUrl,"Ash reader payload"),
    readJson(fetchImpl,extensionUrl,"special-days extension"),
  ]);
  const graph=extension?.graphs?.ASH;
  if(!Array.isArray(graph))throw new Error("Certified ASH graph unavailable");
  return freeze({
    payload,
    graph:freeze([...graph]),
    urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)}),
  });
}
