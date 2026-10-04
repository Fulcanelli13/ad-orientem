// R24 native Candlemas payload/controller.
// Exact rite text is source-pinned; faithful/object-state semantics come from the
// recovered eleven-record CND graph. Candle state never mutates Mass posture.

function freeze(v){return Object.freeze(v)}
function clean(v){const s=String(v??"").trim();return s||null}
function row(id,kind,latin,sourceRecordId){
  const text=clean(latin);
  if(!text)throw new Error("Candlemas reader text missing for "+id);
  return freeze({id,kind,latin:text,sourceRecordId});
}

const REQUIRED_RECORDS=Object.freeze([
  "CND-BLS-010","CND-BLS-020",
  "CND-DST-010","CND-DST-020","CND-DST-030",
  "CND-PRC-010","CND-PRC-020",
  "CND-MASS-010","CND-MASS-020","CND-MASS-030","CND-MASS-040",
]);

function distributionRows(payload){
  const rows=[];
  const refrain=payload.distribution?.refrain;
  (payload.distribution?.verses??[]).forEach((verse,index)=>{
    rows.push(row("CND-R03-V"+String(index+1),"TEXT",verse,"CND-DST-030"));
    rows.push(row("CND-R03-A"+String(index+1),"TEXT",refrain,"CND-DST-030"));
  });
  return rows;
}

export function buildCandlemasPayload({graph,payload}={}){
  if(!Array.isArray(graph) || graph.length!==11)throw new Error("Certified eleven-record CND graph required");
  if(payload?.schema!=="ao-r24-candlemas-payload-v1")throw new Error("Pinned Candlemas payload required");
  const ids=new Set(graph.map(x=>x.id));
  for(const id of REQUIRED_RECORDS)if(!ids.has(id))throw new Error("Candlemas graph missing "+id);
  if((payload.blessingOrations??[]).length!==5)throw new Error("Candlemas requires five blessing orations");
  for(const prayer of payload.blessingOrations??[])if(!clean(prayer?.latin))throw new Error("Candlemas blessing text missing: "+(prayer?.id??"unknown"));

  const d=payload.dialogue??{};
  const cards=freeze([
    freeze({
      id:"CND-R01",title:"Blessing of Candles",
      sourceRecordIds:freeze(["CND-BLS-010","CND-BLS-020"]),
      actorScope:"FAITHFUL",posture:"STAND",
      paragraphs:freeze([
        row("CND-R01-V","VERSICLE",d.versicle,"CND-BLS-010"),
        row("CND-R01-R","RESPONSE",d.response,"CND-BLS-010"),
        ...payload.blessingOrations.flatMap((prayer,index)=>[
          row("CND-R01-O"+String(index+1)+"-INTRO","TEXT",d.oremus,"CND-BLS-020"),
          row("CND-R01-O"+String(index+1),"TEXT",prayer.latin,"CND-BLS-020"),
          row("CND-R01-O"+String(index+1)+"-AMEN","RESPONSE",d.amen,"CND-BLS-020"),
        ]),
      ]),
      guide:"Stand for the five blessing prayers and make the appointed responses."
    }),
    freeze({
      id:"CND-R02",title:"Blessing Action over the Candles",
      sourceRecordIds:freeze(["CND-BLS-020"]),
      actorScope:"FAITHFUL",posture:"STAND",paragraphs:freeze([]),
      faithfulGesture:null,
      guide:"The candles are sprinkled and incensed. Do not imitate celebrant-only ritual gestures."
    }),
    freeze({
      id:"CND-R03",title:"Distribution of Candles",
      sourceRecordIds:freeze(["CND-DST-010","CND-DST-020","CND-DST-030"]),
      actorScope:"CANDLE_RECIPIENT",posture:"LOCAL",
      paragraphs:freeze(distributionRows(payload)),
      recipientStates:freeze({
        RECIPIENT_CALLED:freeze({posture:"STAND_WALK",action:"APPROACH_ALTAR_RAIL",candle:"NONE"}),
        RECEIVE_CANDLE:freeze({posture:"KNEEL",action:"RECEIVE_CANDLE",candle:"BLESSED_CANDLE_RECEIVED"}),
        CANDLE_RECEIVED:freeze({posture:"STAND_WALK",action:"RETURN_HOLDING_CANDLE",candle:"BLESSED_CANDLE_RECEIVED"}),
      }),
      guide:"Only the person receiving a candle kneels; this is personal state, not a congregation posture."
    }),
    freeze({
      id:"CND-R04",title:"Prayer after Distribution",
      sourceRecordIds:freeze(["CND-DST-030"]),
      actorScope:"FAITHFUL",posture:"STAND",
      paragraphs:freeze([
        row("CND-R04-O","TEXT",d.oremus,"CND-DST-030"),
        row("CND-R04-P","TEXT",payload.distribution?.conclusion,"CND-DST-030"),
        row("CND-R04-A","RESPONSE",d.amen,"CND-DST-030"),
      ])
    }),
    freeze({
      id:"CND-R05",title:"Procession",
      sourceRecordIds:freeze(["CND-PRC-010","CND-PRC-020"]),
      actorScope:"FAITHFUL_WITH_CANDLE_PARTICIPATING",posture:"PROCESSIONAL",
      objectState:"CANDLE_LIT",
      paragraphs:freeze([
        row("CND-R05-V","VERSICLE",payload.procession?.procedamus,"CND-PRC-010"),
        row("CND-R05-R","RESPONSE",payload.procession?.response,"CND-PRC-010"),
        row("CND-R05-A1","TEXT",payload.procession?.adorna,"CND-PRC-020"),
        row("CND-R05-A2","TEXT",payload.procession?.responsum,"CND-PRC-020"),
        row("CND-R05-A2V","TEXT",payload.procession?.responsumVerse,"CND-PRC-020"),
      ]),
      guide:"If participating in the procession, carry the blessed candle lighted; otherwise retain the local posture."
    }),
    freeze({
      id:"CND-R06",title:"Return to the Church",
      sourceRecordIds:freeze(["CND-PRC-020"]),
      actorScope:"FAITHFUL_WITH_CANDLE_PARTICIPATING",posture:"PROCESSIONAL_STAND",
      objectState:"CANDLE_LIT",
      paragraphs:freeze([
        row("CND-R06-R","TEXT",payload.procession?.obtulerunt,"CND-PRC-020"),
        row("CND-R06-V","TEXT",payload.procession?.obtuleruntVerse,"CND-PRC-020"),
        row("CND-R06-G","TEXT",payload.procession?.gloria,"CND-PRC-020"),
      ])
    }),
    freeze({
      id:"CND-R07",title:"Mass begins at the Introit",
      sourceRecordIds:freeze(["CND-MASS-010"]),
      actorScope:"ALL",posture:"ORDINARY_PROFILE",paragraphs:freeze([]),
      handoff:"INTROIT",ordinaryOpeningSuppressed:true,
      guide:"The Candlemas rite is complete. The Prayers at the Foot are omitted; Mass begins at the Introit."
    }),
  ]);

  return freeze({
    schema:"ao-r24-candlemas-reader-payload-v1",
    readerPayloadComplete:true,
    cards,
    massCandlePolicy:freeze({...payload.massCandlePolicy}),
  });
}

function candleRequiredForEvent(eventId,policy){
  const id=String(eventId??"");
  if(!id)return false;
  if((policy.gospelEventIds??[]).includes(id))return true;
  if(/^MC-(SAN|CAN|CNS)-/.test(id))return true;
  if(/^MC-COM-(010|020|030)$/.test(id))return true;
  return false;
}

export function createCandlemasReaderController(args={}){
  const built=buildCandlemasPayload(args);
  let index=0;
  let recipientState=null;
  let hasBlessedCandle=false;
  let processionParticipant=false;

  function state(){
    const card=built.cards[index]??null;
    const recipient=card?.recipientStates?.[recipientState]??null;
    const processionalLit=Boolean(
      hasBlessedCandle && processionParticipant &&
      ["CND-R05","CND-R06"].includes(card?.id)
    );
    return freeze({
      schema:"ao-r24-candlemas-reader-state-v1",
      supported:true,index,total:built.cards.length,
      atStart:index===0,atEnd:index===built.cards.length-1,
      card,recipientState,
      recipientPosture:recipient?.posture??null,
      recipientAction:recipient?.action??null,
      hasBlessedCandle,
      processionParticipant,
      candleState:processionalLit ? "CANDLE_LIT" : (hasBlessedCandle ? "BLESSED_CANDLE_HELD" : null),
      handoff:card?.handoff??null,
      ordinaryOpeningSuppressed:Boolean(card?.ordinaryOpeningSuppressed),
    });
  }
  function next(){index=Math.min(index+1,built.cards.length-1);recipientState=null;return state()}
  function previous(){index=Math.max(index-1,0);recipientState=null;return state()}
  function goTo(cardId){const hit=built.cards.findIndex(x=>x.id===cardId);if(hit>=0){index=hit;recipientState=null;}return state()}
  function setRecipientState(value){
    const recipient=built.cards[index]?.recipientStates?.[value];
    if(!recipient)throw new Error("Unsupported Candlemas recipient state: "+value);
    recipientState=value;
    if(value==="RECEIVE_CANDLE"||value==="CANDLE_RECEIVED")hasBlessedCandle=true;
    return state();
  }
  function setHasBlessedCandle(value){hasBlessedCandle=Boolean(value);return state()}
  function setProcessionParticipant(value){processionParticipant=Boolean(value);return state()}
  function massCandleState(eventId){
    if(!hasBlessedCandle)return freeze({eventId:String(eventId??""),required:false,state:null,owner:"CND_NO_BLESSED_CANDLE"});
    const required=candleRequiredForEvent(eventId,built.massCandlePolicy);
    return freeze({
      eventId:String(eventId??""),
      required,
      state:required ? "CANDLE_LIT" : null,
      owner:required ? "CND_1962_OBJECT_STATE" : "CND_AFTER_PATER_OR_OUTSIDE_REQUIRED_WINDOWS",
      postureOverride:null,
    });
  }
  return freeze({
    schema:"ao-r24-candlemas-reader-controller-v1",supported:true,cards:built.cards,
    project:state,next,previous,goTo,setRecipientState,setHasBlessedCandle,setProcessionParticipant,massCandleState
  });
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data || typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}

export async function loadCandlemasReaderData({
  fetchImpl=globalThis.fetch,
  baseUrl=import.meta.url,
}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-candlemas.v1.json",baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([
    readJson(fetchImpl,payloadUrl,"Candlemas reader payload"),
    readJson(fetchImpl,extensionUrl,"special-days extension"),
  ]);
  const graph=extension?.graphs?.CND;
  if(!Array.isArray(graph))throw new Error("Certified CND graph unavailable");
  return freeze({payload,graph:freeze([...graph]),urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)})});
}
