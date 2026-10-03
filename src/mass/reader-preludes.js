// R24 native Ash Wednesday / Candlemas prelude readers.
// Liturgical text is pinned in data/presentation payloads; posture/object/personal
// semantics are validated against the recovered 1962 special-day graph.

function freeze(value){return Object.freeze(value)}
function clean(value){const s=String(value??"").trim();return s||null}

function row(value,cardId,index){
  const latin=clean(value?.latin);
  if(!latin)throw new Error("Prelude reader text missing for "+cardId+" row "+(index+1));
  return freeze({
    id:clean(value.id)??cardId+"-"+String(index+1).padStart(2,"0"),
    kind:String(value.kind??"TEXT").toUpperCase(),
    latin,
    english:clean(value.english),
    sourceRecordId:clean(value.sourceRecordId),
  });
}

export function buildPreludePayload({graph,payload}={}){
  if(!Array.isArray(graph))throw new Error("Recovered prelude graph required");
  if(payload?.schema!=="ao-r24-prelude-payload-v1")throw new Error("Pinned R24 prelude payload required");
  if(Number(payload.graphRecordCount)!==graph.length)throw new Error(payload.rite+" graph count mismatch");
  const graphIds=new Set(graph.map(x=>x.id));
  const cards=(payload.cards??[]).map((card,index)=>{
    const id=clean(card.id)??payload.rite+"-R"+String(index+1).padStart(2,"0");
    const sourceRecordIds=freeze([...(card.sourceRecordIds??[])]);
    for(const sourceId of sourceRecordIds){
      if(!graphIds.has(sourceId))throw new Error(payload.rite+" card "+id+" references missing graph record "+sourceId);
    }
    const personalStates={};
    for(const [key,value] of Object.entries(card.personalStates??{})){
      personalStates[key]=freeze({
        posture:clean(value.posture),
        action:clean(value.action),
        objectState:clean(value.objectState),
      });
    }
    return freeze({
      id,
      title:clean(card.title)??id,
      sourceRecordIds,
      actorScope:clean(card.actorScope),
      posture:clean(card.posture),
      gesture:clean(card.gesture),
      action:clean(card.action),
      objectState:clean(card.objectState),
      guide:clean(card.guide),
      handoff:clean(card.handoff),
      ordinaryOpeningSuppressed:Boolean(card.ordinaryOpeningSuppressed),
      paragraphs:freeze((card.paragraphs??[]).map((x,i)=>row(x,id,i))),
      personalStates:freeze(personalStates),
    });
  });
  if(!cards.length)throw new Error(payload.rite+" reader payload contains no cards");
  return freeze({
    schema:"ao-r24-prelude-reader-payload-v1",
    rite:payload.rite,
    title:payload.title,
    source:freeze({...payload.source}),
    cards:freeze(cards),
    massObjectStates:freeze([...(payload.massObjectStates??[])]),
  });
}

export function createPreludeReaderController(args={}){
  const built=buildPreludePayload(args);
  let index=0;
  let personalState=null;

  function state(){
    const card=built.cards[index]??null;
    const personal=personalState ? card?.personalStates?.[personalState]??null : null;
    return freeze({
      schema:"ao-r24-prelude-reader-state-v1",
      supported:true,
      rite:built.rite,
      title:built.title,
      index,
      total:built.cards.length,
      atStart:index===0,
      atEnd:index===built.cards.length-1,
      card,
      personalState,
      personalPosture:personal?.posture??null,
      personalAction:personal?.action??null,
      personalObjectState:personal?.objectState??null,
      handoff:card?.handoff??null,
      ordinaryOpeningSuppressed:Boolean(card?.ordinaryOpeningSuppressed),
      massObjectStates:built.massObjectStates,
    });
  }
  function clearPersonal(){personalState=null}
  function next(){index=Math.min(index+1,built.cards.length-1);clearPersonal();return state()}
  function previous(){index=Math.max(index-1,0);clearPersonal();return state()}
  function goTo(cardId){const hit=built.cards.findIndex(x=>x.id===cardId);if(hit>=0){index=hit;clearPersonal();}return state()}
  function setPersonalState(value){
    if(!built.cards[index]?.personalStates?.[value])throw new Error("Unsupported "+built.rite+" personal state: "+value);
    personalState=value;
    return state();
  }
  return freeze({
    schema:"ao-r24-prelude-reader-controller-v1",
    supported:true,
    rite:built.rite,
    cards:built.cards,
    project:state,next,previous,goTo,setPersonalState,
  });
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data || typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}

const CONFIG=freeze({
  ASH:freeze({file:"reader-ash.v1.json",graphKey:"ASH"}),
  CANDLEMAS:freeze({file:"reader-candlemas.v1.json",graphKey:"CND"}),
});

export async function loadPreludeReaderData({
  rite,
  fetchImpl=globalThis.fetch,
  baseUrl=import.meta.url,
}={}){
  const key=String(rite??"").toUpperCase();
  const config=CONFIG[key];
  if(!config)throw new Error("Unsupported native prelude "+rite);
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/"+config.file,baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([
    readJson(fetchImpl,payloadUrl,key+" reader payload"),
    readJson(fetchImpl,extensionUrl,"special-days extension"),
  ]);
  const graph=extension?.graphs?.[config.graphKey];
  if(!Array.isArray(graph))throw new Error("Recovered "+key+" graph unavailable");
  return freeze({payload,graph:freeze([...graph]),urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)})});
}
