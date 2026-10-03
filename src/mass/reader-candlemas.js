// R23 native Candlemas payload/controller.
// Blessing/procession text is source-pinned; recipient and candle object state remain personal.

const freeze=value=>Object.freeze(value);
const clean=value=>{const s=String(value??"").trim();return s||null};
const row=(id,kind,latin,sourceRecordId)=>freeze({id,kind,latin:clean(latin),sourceRecordId});
const cueNumber=id=>Number(String(id??"").match(/C(\d+)$/)?.[1]??NaN);

export function buildCandlemasPayload({graph,payload}={}){
  if(!Array.isArray(graph)||graph.length!==11)throw new Error("Certified eleven-record CND graph required");
  if(payload?.schema!=="ao-r23-candlemas-payload-v1")throw new Error("Pinned Candlemas payload required");
  const ids=new Set(graph.map(x=>x.id));
  for(const id of ["CND-BLS-010","CND-BLS-020","CND-DST-010","CND-DST-020","CND-DST-030","CND-PRC-010","CND-PRC-020","CND-MASS-010","CND-MASS-020","CND-MASS-030","CND-MASS-040"]){
    if(!ids.has(id))throw new Error("Candlemas graph missing "+id);
  }
  const t=payload.texts??{};
  const prayers=(t.prayers??[]).map((latin,i)=>row("CND-R01-"+String(i+1).padStart(2,"0"),"TEXT",latin,"CND-BLS-020"));
  if(prayers.length!==5)throw new Error("Candlemas blessing must preserve five distinct orations");
  const distribution=[];
  for(let i=0;i<(t.nuncDimittis??[]).length;i++){
    distribution.push(row("CND-R02-V"+String(i+1).padStart(2,"0"),"TEXT",t.nuncDimittis[i],"CND-DST-010"));
    distribution.push(row("CND-R02-A"+String(i+1).padStart(2,"0"),"TEXT",t.lumenAntiphon,"CND-DST-010"));
  }
  distribution.push(row("CND-R02-O","TEXT",t.distributionPrayer,"CND-DST-010"));
  distribution.push(row("CND-R02-AM","RESPONSE",t.response,"CND-DST-010"));
  const procession=[
    row("CND-R03-V","VERSICLE",t.processionVersicle,"CND-PRC-010"),
    row("CND-R03-R","RESPONSE",t.processionResponse,"CND-PRC-010"),
    ...(t.procession??[]).map((latin,i)=>row("CND-R03-"+String(i+1).padStart(2,"0"),"TEXT",latin,"CND-PRC-020")),
  ];
  return freeze({
    schema:"ao-r23-candlemas-reader-payload-v1",
    massObjectState:freeze(payload.massObjectState??{}),
    cards:freeze([
      freeze({id:"CND-R01",title:"Blessing of Candles",sourceRecordIds:freeze(["CND-BLS-010","CND-BLS-020"]),actorScope:"FAITHFUL",posture:"STAND",paragraphs:freeze(prayers),guide:"The five blessing prayers remain distinct."}),
      freeze({id:"CND-R02",title:"Distribution of Candles",sourceRecordIds:freeze(["CND-DST-010","CND-DST-020","CND-DST-030"]),actorScope:"CANDLE_RECIPIENT",posture:"LOCAL",paragraphs:freeze(distribution),
        recipientStates:freeze({
          RECIPIENT_CALLED:freeze({posture:"STAND_WALK",action:"APPROACH_ALTAR_RAIL",hasBlessedCandle:false}),
          RECEIVE_CANDLE:freeze({posture:"KNEEL",action:"RECEIVE_CANDLE",hasBlessedCandle:true}),
          CANDLE_RECEIVED:freeze({posture:"STAND_WALK",action:"RETURN_HOLDING_CANDLE",hasBlessedCandle:true}),
        }),
        guide:"Only the person currently receiving a candle follows the recipient posture."
      }),
      freeze({id:"CND-R03",title:"Procession",sourceRecordIds:freeze(["CND-PRC-010","CND-PRC-020"]),actorScope:"FAITHFUL_WITH_CANDLE_PARTICIPATING",posture:"PROCESSIONAL",paragraphs:freeze(procession),objectState:"CANDLE_LIT",guide:"If participating, carry the blessed candle lighted in procession."}),
      freeze({id:"CND-R04",title:"Mass begins at the Introit",sourceRecordIds:freeze(["CND-MASS-010"]),actorScope:"ALL",posture:"ORDINARY_PROFILE",paragraphs:freeze([]),handoff:"INTROIT",ordinaryOpeningSuppressed:true,guide:"When this rite immediately precedes Mass, the Prayers at the Foot are omitted and Mass begins at the Introit."}),
    ])
  });
}

export function createCandlemasReaderController(args={}){
  const built=buildCandlemasPayload(args);let index=0,recipientState=null,hasBlessedCandle=false;
  function state(){
    const card=built.cards[index]??null;
    const recipient=card?.recipientStates?.[recipientState]??null;
    return freeze({schema:"ao-r23-candlemas-reader-state-v1",supported:true,index,total:built.cards.length,atStart:index===0,atEnd:index===built.cards.length-1,card,recipientState,recipientPosture:recipient?.posture??null,recipientAction:recipient?.action??null,hasBlessedCandle,objectState:card?.objectState??null,handoff:card?.handoff??null,ordinaryOpeningSuppressed:Boolean(card?.ordinaryOpeningSuppressed)});
  }
  const next=()=>{index=Math.min(index+1,built.cards.length-1);recipientState=null;return state()};
  const previous=()=>{index=Math.max(index-1,0);recipientState=null;return state()};
  const goTo=cardId=>{const hit=built.cards.findIndex(x=>x.id===cardId);if(hit>=0){index=hit;recipientState=null;}return state()};
  function setRecipientState(value){
    const candidate=built.cards[index]?.recipientStates?.[value];
    if(!candidate)throw new Error("Unsupported Candlemas recipient state: "+value);
    recipientState=value;
    if(candidate.hasBlessedCandle===true)hasBlessedCandle=true;
    return state();
  }
  function setHasBlessedCandle(value=true){hasBlessedCandle=Boolean(value);return state()}
  function projectMassCue(cueId){
    if(!hasBlessedCandle)return freeze({cueId:String(cueId??""),objectState:null,owner:"R23_CANDLEMAS_NO_BLESSED_CANDLE"});
    const n=cueNumber(cueId);
    const gospel=built.massObjectState.gospel??{},canon=built.massObjectState.canon??{},after=built.massObjectState.afterPater??{};
    const inRange=(rule)=>Number.isFinite(n)&&n>=cueNumber(rule.startCue)&&n<=cueNumber(rule.endCue);
    if(inRange(gospel))return freeze({cueId:String(cueId),objectState:gospel.state,owner:"R23_CANDLEMAS_GOSPEL_CANDLE"});
    if(inRange(canon))return freeze({cueId:String(cueId),objectState:canon.state,owner:"R23_CANDLEMAS_CANON_CANDLE"});
    if(Number.isFinite(n)&&n>=cueNumber(after.startCue))return freeze({cueId:String(cueId),objectState:after.state,owner:"R23_CANDLEMAS_AFTER_PATER"});
    return freeze({cueId:String(cueId??""),objectState:null,owner:"R23_CANDLEMAS_EXACT_CUE_NONE"});
  }
  return freeze({schema:"ao-r23-candlemas-reader-controller-v1",supported:true,cards:built.cards,project:state,next,previous,goTo,setRecipientState,setHasBlessedCandle,projectMassCue});
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();if(!data||typeof data!=="object")throw new Error(label+" did not return JSON object");return data;
}
export async function loadCandlemasReaderData({fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-candlemas.v1.json",baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([readJson(fetchImpl,payloadUrl,"Candlemas reader payload"),readJson(fetchImpl,extensionUrl,"special-days extension")]);
  const graph=extension?.graphs?.CND;if(!Array.isArray(graph))throw new Error("Certified CND graph unavailable");
  return freeze({payload,graph:freeze([...graph]),urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)})});
}
