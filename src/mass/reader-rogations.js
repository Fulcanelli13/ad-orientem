// R30 native Rogations / Greater and Lesser Litanies reader.
// Full litany text is pinned to an exact Divinum Officium source revision.
// Calendar date never activates the rite; procession posture requires explicit rite + participant state.

function freeze(v){return Object.freeze(v)}
function clean(v){const s=String(v??"").trim();return s||null}

function normalizeRow(row,cardId,index){
  const latin=clean(row?.latin);
  if(!latin)throw new Error("Rogations reader text missing for "+cardId+" row "+(index+1));
  return freeze({
    id:clean(row.id)??cardId+"-"+String(index+1).padStart(3,"0"),
    kind:String(row.kind??"TEXT").toUpperCase(),
    latin,
    english:clean(row.english),
    sourceRecordId:clean(row.sourceRecordId),
  });
}

export function buildRogationsPayload({graph,payload}={}){
  if(!Array.isArray(graph) || graph.length!==6)throw new Error("Certified six-record ROG graph required");
  if(payload?.schema!=="ao-r25-rogations-payload-v1")throw new Error("Pinned Rogations payload required");
  if(Number(payload.graphRecordCount)!==6)throw new Error("Rogations payload graph denominator changed");

  const required=["ROG-LIT-010","ROG-LIT-020","ROG-PS-010","ROG-PRC-010","ROG-END-010","ROG-MASS-010"];
  const graphIds=new Set(graph.map(x=>x.id));
  for(const id of required)if(!graphIds.has(id))throw new Error("Rogations graph missing "+id);

  if(payload.source?.primaryCorpus?.blobSha!=="aa8197cca3cbca14e7da11004a2111d58d49cf82"){
    throw new Error("Rogations Litany source revision changed");
  }
  if(payload.source?.psalm69?.blobSha!=="0b2b3c64b1ccb8637107f3c71100d583e111df24"){
    throw new Error("Rogations Psalm 69 source revision changed");
  }
  if(payload.processionalRule?.calendarDateDoesNotActivateRite!==true){
    throw new Error("Rogations calendar activation safeguard changed");
  }
  if(Number(payload.processionalRule?.invocationResponseRepeat)!==2){
    throw new Error("Rogations response-repeat contract changed");
  }

  const cards=(payload.cards??[]).map((card,index)=>{
    const id=clean(card.id)??"ROG-R"+String(index+1).padStart(2,"0");
    const sourceRecordIds=freeze([...(card.sourceRecordIds??[])]);
    for(const sourceId of sourceRecordIds){
      if(!graphIds.has(sourceId))throw new Error(id+" references missing Rogations graph record "+sourceId);
    }
    return freeze({
      id,
      title:clean(card.title)??id,
      sourceRecordIds,
      actorScope:clean(card.actorScope),
      posture:clean(card.posture),
      action:clean(card.action),
      objectState:clean(card.objectState),
      handoff:clean(card.handoff),
      ordinaryOpeningSuppressed:Boolean(card.ordinaryOpeningSuppressed),
      guide:clean(card.guide),
      paragraphs:freeze((card.paragraphs??[]).map((row,i)=>normalizeRow(row,id,i))),
    });
  });

  if(cards.length!==8)throw new Error("Rogations reader must contain eight cards");
  const totalRows=cards.reduce((n,c)=>n+c.paragraphs.length,0);
  if(totalRows<170)throw new Error("Rogations payload is abridged");
  const allText=cards.flatMap(c=>c.paragraphs).map(r=>r.latin);
  if(!allText.some(x=>/Ut fructus terræ dare et conserváre dignéris/.test(x))){
    throw new Error("Rogations agricultural petition missing");
  }
  if(!allText.some(x=>/Sancte (Ioseph|Joseph), ora pro nobis/.test(x))){
    throw new Error("Rogations St Joseph invocation missing");
  }
  const last=cards.at(-1);
  if(last?.handoff!=="INTROIT" || last?.ordinaryOpeningSuppressed!==true){
    throw new Error("Rogations Introit handoff contract changed");
  }

  return freeze({
    schema:"ao-r30-rogations-reader-payload-v1",
    rite:"ROGATIONS",
    title:clean(payload.title)??"Rogations",
    source:freeze({...payload.source}),
    processionalRule:freeze({...payload.processionalRule}),
    totalRows,
    cards:freeze(cards),
  });
}

export function createRogationsReaderController(args={}){
  const built=buildRogationsPayload(args);
  let index=0;
  let processionActive=false;
  let processionParticipant=false;

  function state(){
    const card=built.cards[index]??null;
    const processional=Boolean(processionActive && processionParticipant && card?.id!=="ROG-R08");
    return freeze({
      schema:"ao-r30-rogations-reader-state-v1",
      supported:true,
      rite:"ROGATIONS",
      title:built.title,
      index,total:built.cards.length,
      atStart:index===0,atEnd:index===built.cards.length-1,
      card,
      processionActive,
      processionParticipant,
      faithfulPosture:processional ? built.processionalRule.participantPosture : null,
      handoff:card?.handoff??null,
      ordinaryOpeningSuppressed:Boolean(card?.ordinaryOpeningSuppressed),
    });
  }

  function next(){index=Math.min(index+1,built.cards.length-1);return state()}
  function previous(){index=Math.max(index-1,0);return state()}
  function goTo(cardId){const hit=built.cards.findIndex(x=>x.id===cardId);if(hit>=0)index=hit;return state()}
  function setProcessionActive(value=true){processionActive=Boolean(value);return state()}
  function setProcessionParticipant(value=true){processionParticipant=Boolean(value);return state()}

  return freeze({
    schema:"ao-r30-rogations-reader-controller-v1",
    supported:true,
    cards:built.cards,
    project:state,next,previous,goTo,setProcessionActive,setProcessionParticipant,
  });
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data || typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}

export async function loadRogationsReaderData({
  fetchImpl=globalThis.fetch,
  baseUrl=import.meta.url,
}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-rogations.v1.json",baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([
    readJson(fetchImpl,payloadUrl,"Rogations reader payload"),
    readJson(fetchImpl,extensionUrl,"special-days extension"),
  ]);
  const graph=extension?.graphs?.ROG;
  if(!Array.isArray(graph))throw new Error("Certified ROG graph unavailable");
  return freeze({
    payload,
    graph:freeze([...graph]),
    urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)}),
  });
}
