// R26 native Corpus Christi procession / Benediction following-action reader.
// Mass ending deltas remain plan-owned. This controller begins only when the
// explicit CORPUS_CHRISTI_PROCESSION following action is active.

function freeze(v){return Object.freeze(v)}
function clean(v){const s=String(v??"").trim();return s||null}
function row(id,kind,latin,sourceRecordId){
  const text=clean(latin);
  if(!text)throw new Error("Corpus Christi reader text missing for "+id);
  return freeze({id,kind,latin:text,sourceRecordId});
}

const REQUIRED=Object.freeze([
  "CORPUS-END-010","CORPUS-END-020","CORPUS-END-030",
  "CORPUS-EXP-010","CORPUS-PRC-010","CORPUS-RET-010",
  "CORPUS-BEN-010","CORPUS-BEN-020",
]);

export function buildCorpusChristiProcessionPayload({graph,payload}={}){
  if(!Array.isArray(graph)||graph.length!==8)throw new Error("Certified eight-record CORPUS graph required");
  if(payload?.schema!=="ao-r26-corpus-christi-procession-payload-v1")throw new Error("Pinned Corpus Christi procession payload required");
  const ids=new Set(graph.map(x=>x.id));
  for(const id of REQUIRED)if(!ids.has(id))throw new Error("Corpus Christi graph missing "+id);
  if((payload.pangeLingua??[]).length!==4)throw new Error("Corpus Christi procession requires four pre-Tantum Pange lingua stanzas");
  if((payload.tantumErgo??[]).length!==2)throw new Error("Corpus Christi Benediction requires two Tantum ergo stanzas");

  const cards=freeze([
    freeze({
      id:"CORPUS-R01",title:"Mass Ends for the Procession",
      sourceRecordIds:freeze(["CORPUS-END-010","CORPUS-END-020","CORPUS-END-030"]),
      actorScope:"ALL",posture:"INHERIT",paragraphs:freeze([]),
      guide:"The Eucharistic procession is an explicit following action. Benedicamus Domino replaces Ite; the final blessing and Last Gospel are omitted by the Mass plan."
    }),
    freeze({
      id:"CORPUS-R02",title:"Pange lingua",
      sourceRecordIds:freeze(["CORPUS-EXP-010"]),
      actorScope:"ALL_FAITHFUL",posture:"LOCAL_OR_INHERIT",
      objectState:"BLESSED_SACRAMENT_IN_PROCESSION",
      triggerState:"MONSTRANCE_PLACED_IN_CELEBRANT_HANDS",
      paragraphs:freeze(payload.pangeLingua.map((x,i)=>row("CORPUS-R02-"+String(i+1),"TEXT",x,"CORPUS-EXP-010"))),
      guide:"Begin Pange lingua when the monstrance is actually placed in the celebrant's hands; do not infer this from the calendar or a timer."
    }),
    freeze({
      id:"CORPUS-R03",title:"Eucharistic Procession",
      sourceRecordIds:freeze(["CORPUS-PRC-010"]),
      actorScope:"FAITHFUL_PARTICIPATING",posture:"PROCESSIONAL",
      objectState:"BLESSED_SACRAMENT_IN_PROCESSION",paragraphs:freeze([]),
      guide:"If participating, follow the procession and join the appointed Eucharistic hymns. Non-participants retain the local reverent posture."
    }),
    freeze({
      id:"CORPUS-R04",title:"Tantum ergo",
      sourceRecordIds:freeze(["CORPUS-RET-010"]),
      actorScope:"ALL_FAITHFUL",posture:"LOCAL_REVERENT",
      objectState:"BLESSED_SACRAMENT_EXPOSED_AT_ALTAR",
      triggerState:"BLESSED_SACRAMENT_REPLACED_ON_ALTAR",
      paragraphs:freeze(payload.tantumErgo.map((x,i)=>row("CORPUS-R04-"+String(i+1),"TEXT",x,"CORPUS-RET-010"))),
      guide:"Begin Tantum ergo when the Blessed Sacrament has actually been replaced on the altar."
    }),
    freeze({
      id:"CORPUS-R05",title:"Versicle and Prayer",
      sourceRecordIds:freeze(["CORPUS-BEN-010"]),
      actorScope:"ALL_FAITHFUL",posture:"LOCAL_REVERENT",
      objectState:"BLESSED_SACRAMENT_EXPOSED_AT_ALTAR",
      paragraphs:freeze([
        row("CORPUS-R05-V","VERSICLE",payload.benediction?.versicle,"CORPUS-BEN-010"),
        row("CORPUS-R05-R","RESPONSE",payload.benediction?.response,"CORPUS-BEN-010"),
        row("CORPUS-R05-O","TEXT",payload.benediction?.oremus,"CORPUS-BEN-010"),
        row("CORPUS-R05-P","TEXT",payload.benediction?.prayer,"CORPUS-BEN-010"),
        row("CORPUS-R05-A","RESPONSE",payload.benediction?.amen,"CORPUS-BEN-010"),
      ])
    }),
    freeze({
      id:"CORPUS-R06",title:"Benediction",
      sourceRecordIds:freeze(["CORPUS-BEN-020"]),
      actorScope:"ALL_FAITHFUL",posture:"LOCAL_REVERENT",
      objectState:"BLESSED_SACRAMENT_EXPOSED_AT_ALTAR",paragraphs:freeze([]),
      handoff:"POST_MASS_LIFECYCLE",
      guide:"Receive Benediction according to the local ceremonial. When the rite is complete, continue to the post-Mass lifecycle."
    }),
  ]);
  return freeze({schema:"ao-r26-corpus-christi-reader-payload-v1",readerPayloadComplete:true,cards});
}

export function createCorpusChristiProcessionReaderController(args={}){
  const built=buildCorpusChristiProcessionPayload(args);
  let index=0;
  let processionParticipant=false;
  let sacramentalState=null;

  function state(){
    const card=built.cards[index]??null;
    return freeze({
      schema:"ao-r26-corpus-christi-reader-state-v1",
      supported:true,index,total:built.cards.length,
      atStart:index===0,atEnd:index===built.cards.length-1,
      card,processionParticipant,sacramentalState,
      posture:card?.posture==="PROCESSIONAL" && !processionParticipant ? "LOCAL_REVERENT" : card?.posture??null,
      objectState:card?.objectState??null,
      handoff:card?.handoff??null,
    });
  }
  function next(){index=Math.min(index+1,built.cards.length-1);return state()}
  function previous(){index=Math.max(0,index-1);return state()}
  function goTo(cardId){const hit=built.cards.findIndex(x=>x.id===String(cardId));if(hit>=0)index=hit;return state()}
  function setProcessionParticipant(value){processionParticipant=Boolean(value);return state()}
  function setSacramentalState(value){
    const next=String(value??"").toUpperCase();
    const allowed=new Set(["MONSTRANCE_PLACED_IN_CELEBRANT_HANDS","PROCESSION_ACTIVE","BLESSED_SACRAMENT_REPLACED_ON_ALTAR","BENEDICTION_COMPLETE"]);
    if(!allowed.has(next))throw new Error("Unsupported Corpus Christi sacramental state: "+value);
    sacramentalState=next;
    if(next==="MONSTRANCE_PLACED_IN_CELEBRANT_HANDS")index=1;
    if(next==="PROCESSION_ACTIVE")index=2;
    if(next==="BLESSED_SACRAMENT_REPLACED_ON_ALTAR")index=3;
    if(next==="BENEDICTION_COMPLETE")index=5;
    return state();
  }
  return freeze({
    schema:"ao-r26-corpus-christi-reader-controller-v1",supported:true,cards:built.cards,
    project:state,next,previous,goTo,setProcessionParticipant,setSacramentalState
  });
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data||typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}
export async function loadCorpusChristiProcessionReaderData({fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-corpus-christi.v1.json",baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([
    readJson(fetchImpl,payloadUrl,"Corpus Christi procession payload"),
    readJson(fetchImpl,extensionUrl,"special-days extension"),
  ]);
  const graph=extension?.graphs?.CORPUS;
  if(!Array.isArray(graph))throw new Error("Certified CORPUS graph unavailable");
  return freeze({payload,graph:freeze([...graph]),urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)})});
}
