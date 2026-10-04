// R29 native Generic Procession following-action reader.
// The generic contract owns structure only. Feast/procession proper text is never
// synthesized here and must be supplied by a dedicated profile when available.

function freeze(value){return Object.freeze(value)}

const REQUIRED=Object.freeze([
  "PROC-000-010","PROC-000-020","PROC-000-030","PROC-000-040",
  "PROC-100-010","PROC-100-020","PROC-100-030"
]);

export function buildGenericProcessionReader({graph,payload,participating=false}={}){
  if(!Array.isArray(graph) || graph.length!==7)throw new Error("Certified seven-record PROC graph required");
  if(payload?.schema!=="ao-r29-generic-procession-payload-v1")throw new Error("Generic Procession structural payload required");
  const byId=new Map(graph.map(row=>[row.id,row]));
  for(const id of REQUIRED)if(!byId.has(id))throw new Error("Generic Procession graph missing "+id);

  const endingRecords=payload.massEndingRecords??[];
  if(JSON.stringify(endingRecords)!==JSON.stringify(REQUIRED.slice(0,4))){
    throw new Error("Generic Procession Mass-ending record contract changed");
  }

  const surfaces=(payload.readerSurfaces??[]).map((surface,index)=>{
    const record=byId.get(surface.recordId);
    if(!record || !String(record.id).startsWith("PROC-100-")){
      throw new Error("Generic Procession surface must bind a PROC-100 reader record");
    }
    const participant=Boolean(participating);
    const posture=record.id==="PROC-100-020"
      ? (participant ? "PROCESSIONAL" : "LOCAL")
      : record.posture_state?.replace("PROCESSIONAL / LOCAL",participant?"PROCESSIONAL":"LOCAL")??null;
    return freeze({
      id:surface.id,
      index,
      title:String(surface.title),
      recordId:record.id,
      actorScope:record.actor_scope,
      posture,
      action:record.action_state??null,
      triggerKey:record.trigger_key,
      guide:String(surface.guide??""),
      paragraphs:freeze([]),
      structuralOnly:true,
    });
  });

  if(surfaces.length!==3)throw new Error("Generic Procession reader must contain exactly three following-action surfaces");

  return freeze({
    schema:"ao-r29-generic-procession-reader-v1",
    status:"CERTIFIED_STRUCTURAL_FOLLOWING_ACTION",
    sourceRecordCount:graph.length,
    massEndingRecordCount:4,
    readerRecordCount:3,
    participating:Boolean(participating),
    feastSpecificTextOwned:false,
    surfaces:freeze(surfaces),
  });
}

export function createGenericProcessionReaderController(args={}){
  let participating=Boolean(args.participating);
  let built=buildGenericProcessionReader({...args,participating});
  let index=0;

  function snapshot(){
    const card=built.surfaces[index]??null;
    return freeze({
      schema:"ao-r29-generic-procession-state-v1",
      supported:true,
      index,total:built.surfaces.length,
      atStart:index===0,atEnd:index===built.surfaces.length-1,
      card,
      participating,
      posture:card?.posture??null,
      action:card?.action??null,
      handoff:card?.recordId==="PROC-100-030"?"POST_MASS_LIFECYCLE":null,
    });
  }
  function rebuild(){
    built=buildGenericProcessionReader({...args,participating});
  }
  function next(){index=Math.min(index+1,built.surfaces.length-1);return snapshot()}
  function previous(){index=Math.max(index-1,0);return snapshot()}
  function goTo(cardId){
    const hit=built.surfaces.findIndex(x=>x.id===cardId||x.recordId===cardId);
    if(hit>=0)index=hit;
    return snapshot();
  }
  function setParticipating(value=true){
    participating=Boolean(value);
    rebuild();
    return snapshot();
  }

  return freeze({
    schema:"ao-r29-generic-procession-controller-v1",
    supported:true,
    project:snapshot,next,previous,goTo,setParticipating,
  });
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data || typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}

export async function loadGenericProcessionReaderData({
  fetchImpl=globalThis.fetch,
  baseUrl=import.meta.url,
}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-generic-procession.v1.json",baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([
    readJson(fetchImpl,payloadUrl,"Generic Procession reader payload"),
    readJson(fetchImpl,extensionUrl,"special-days extension"),
  ]);
  const graph=extension?.graphs?.PROC;
  if(!Array.isArray(graph))throw new Error("Certified PROC graph unavailable");
  return freeze({
    payload,
    graph:freeze([...graph]),
    urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)}),
  });
}
