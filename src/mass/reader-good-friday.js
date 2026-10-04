// R32 native Good Friday distinct-rite reader.
// Good Friday is not projected through the ordinary Mass graph or form lifecycle.
// Card navigation is presentation-only; posture/action/object/personal state is owned
// exclusively by the recovered 56-record GF event graph.

function freeze(v){return Object.freeze(v)}
function clean(v){const s=String(v??"").trim();return s||null}
const SOURCE_BLOB="608809d88d3b0d587e20e53d8ab22d4bde0c865e";

function eventCardId(record){
  const id=String(record?.id??"");
  if(id.startsWith("GF-OPEN-"))return "GF-R01";
  if(id==="GF-LESS-210")return "GF-R02";
  if(id.startsWith("GF-LESS-"))return "GF-R01";
  if(id.startsWith("GF-PASS-"))return "GF-R03";
  if(id.startsWith("GF-SOP-"))return "GF-R04";
  if(id==="GF-XPREP-500")return "GF-R05";
  if(id==="GF-X-700")return "GF-R06";
  if(id.startsWith("GF-X-"))return "GF-R05";
  if(id.startsWith("GF-VEN-"))return "GF-R06";
  if(id==="GF-COM-800"||id==="GF-COM-810")return "GF-R07";
  if(id.startsWith("GF-COM-"))return "GF-R08";
  if(id.startsWith("GF-END-"))return "GF-R09";
  return null;
}

function normalizeParagraph(row){
  return freeze({
    id:String(row.id),
    kind:String(row.kind??"TEXT").toUpperCase(),
    latin:clean(row.latin),
    sourceLine:Number(row.sourceLine),
  });
}

export function buildGoodFridayPayload({graph,payload}={}){
  if(!Array.isArray(graph)||graph.length!==56)throw new Error("Certified 56-record GF graph required");
  if(payload?.schema!=="ao-r32-good-friday-payload-v1")throw new Error("Pinned Good Friday payload required");
  if(payload?.source?.blobSha!==SOURCE_BLOB)throw new Error("Good Friday source revision changed");
  if(payload?.invariants?.distinctRite!==true||payload?.invariants?.ordinaryMassGraphActive!==false){
    throw new Error("Good Friday distinct-rite invariant changed");
  }
  const graphIds=new Set(graph.map(x=>x.id));
  for(const id of ["GF-PASS-320","GF-VEN-600","GF-VEN-630","GF-COM-830","GF-END-910"]){
    if(!graphIds.has(id))throw new Error("Good Friday graph missing "+id);
  }
  const cards=freeze((payload.cards??[]).map(card=>freeze({
    id:String(card.id),title:String(card.title),
    sourceLines:freeze([...(card.sourceLines??[])]),
    graphPhases:freeze([...(card.graphPhases??[])]),
    paragraphs:freeze((card.paragraphs??[]).map(normalizeParagraph)),
  })));
  if(cards.length!==9)throw new Error("Good Friday reader requires nine source surfaces");
  const cardIds=new Set(cards.map(x=>x.id));
  for(const record of graph){
    const cardId=eventCardId(record);
    if(!cardId||!cardIds.has(cardId))throw new Error("Good Friday event has no reader surface: "+record.id);
  }
  if(!cards[2].paragraphs.some(x=>String(x.latin).includes("trádidit spíritum"))){
    throw new Error("Good Friday Passion death text anchor missing");
  }
  if(!cards[4].paragraphs.some(x=>/Ecce lignum Crucis/.test(String(x.latin)))){
    throw new Error("Good Friday Cross unveiling text missing");
  }
  if(!cards[5].paragraphs.some(x=>/Pópule meus/.test(String(x.latin)))){
    throw new Error("Good Friday Improperia corpus missing");
  }
  if(!cards[7].paragraphs.some(x=>/Pater noster/.test(String(x.latin)))){
    throw new Error("Good Friday Communion Pater missing");
  }
  return freeze({schema:"ao-r32-good-friday-reader-payload-v1",readerPayloadComplete:true,sourceBlobSha:SOURCE_BLOB,cards});
}

export function createGoodFridayReaderController({graph,payload}={}){
  const built=buildGoodFridayPayload({graph,payload});
  const byId=new Map(graph.map(x=>[x.id,x]));
  const cardIndex=new Map(built.cards.map((x,i)=>[x.id,i]));
  let index=0;
  let activeEventId="GF-OPEN-010";

  function state(){
    const card=built.cards[index]??null;
    const event=activeEventId?byId.get(activeEventId)??null:null;
    return freeze({
      schema:"ao-r32-good-friday-reader-state-v1",
      supported:true,rite:"GOOD_FRIDAY",
      index,total:built.cards.length,
      atStart:index===0,atEnd:index===built.cards.length-1,
      card,
      activeEventId:event?.id??null,
      phase:event?.phase??null,
      posture:clean(event?.posture_state),
      action:clean(event?.action_state),
      objectState:clean(event?.object_state),
      personalState:clean(event?.personal_state),
      actorScope:clean(event?.actor_scope),
      branchCondition:clean(event?.branch_condition),
      eventOwned:Boolean(event),
      ordinaryMassGraphActive:false,
    });
  }
  function clearEvent(){activeEventId=null}
  function next(){index=Math.min(index+1,built.cards.length-1);clearEvent();return state()}
  function previous(){index=Math.max(0,index-1);clearEvent();return state()}
  function goTo(cardId){const hit=cardIndex.get(String(cardId));if(hit!=null){index=hit;clearEvent();}return state()}
  function setEvent(recordId){
    const record=byId.get(String(recordId));
    if(!record)throw new Error("Unknown Good Friday event: "+recordId);
    const cardId=eventCardId(record);
    const hit=cardIndex.get(cardId);
    if(hit==null)throw new Error("Good Friday event surface missing: "+record.id);
    index=hit;
    activeEventId=record.id;
    return state();
  }
  return freeze({
    schema:"ao-r32-good-friday-reader-controller-v1",
    supported:true,cards:built.cards,
    project:state,next,previous,goTo,setEvent,
  });
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data||typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}

export async function loadGoodFridayReaderData({fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-good-friday.v1.json",baseUrl);
  const coreUrl=new URL("../../data/mass/special-days-core.v1.1.json",baseUrl);
  const [payload,core]=await Promise.all([
    readJson(fetchImpl,payloadUrl,"Good Friday reader payload"),
    readJson(fetchImpl,coreUrl,"special-days core"),
  ]);
  const graph=core?.graphs?.GF;
  if(!Array.isArray(graph))throw new Error("Certified GF graph unavailable");
  return freeze({payload,graph:freeze([...graph]),urls:freeze({payload:String(payloadUrl),core:String(coreUrl)})});
}
