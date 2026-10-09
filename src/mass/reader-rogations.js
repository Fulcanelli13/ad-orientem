// R25 native Rogations payload/controller.
// Preserves the recovered six-record ROG graph and the 1962 procession boundary:
// Exsurge Domine -> Litany begins -> procession begins at Sancta Maria ->
// post-Litany prayers -> Introit-only Mass handoff.

function freeze(v){return Object.freeze(v)}
function clean(v){const s=String(v??"").trim();return s||null}
function row(id,kind,latin,sourceRecordId){
  const text=clean(latin);
  if(!text)throw new Error("Rogations reader text missing for "+id);
  return freeze({id,kind,latin:text,sourceRecordId});
}
function pairRows(prefix,items,sourceRecordId){
  return items.map((item,index)=>row(prefix+String(index+1),item[0],item[1],sourceRecordId));
}
function textRows(prefix,items,sourceRecordId,kind="TEXT"){
  return items.map((value,index)=>row(prefix+String(index+1),kind,value,sourceRecordId));
}

const REQUIRED=freeze([
  "ROG-LIT-010","ROG-LIT-020","ROG-PS-010","ROG-PRC-010","ROG-END-010","ROG-MASS-010"
]);

export function buildRogationsPayload({graph,payload}={}){
  if(!Array.isArray(graph) || graph.length!==6)throw new Error("Certified six-record ROG graph required");
  if(payload?.schema!=="ao-r25-rogations-payload-v1")throw new Error("Pinned Rogations payload required");
  const ids=new Set(graph.map(x=>x.id));
  for(const id of REQUIRED)if(!ids.has(id))throw new Error("Rogations graph missing "+id);
  if(payload?.authority?.rule?.includes("not doubled")!==true)throw new Error("1962 non-duplicated Litany rule missing");
  if(!Array.isArray(payload.processionLitany) || payload.processionLitany.length<100)throw new Error("Full Rogation Litany corpus required");
  if(!Array.isArray(payload.postLitany?.orations) || payload.postLitany.orations.length!==10)throw new Error("Rogations requires ten concluding orations");

  const o=payload.opening??{};
  const p=payload.postLitany??{};
  const cards=freeze([
    freeze({
      id:"ROG-R01",title:"Exsurge Domine",
      sourceRecordIds:freeze(["ROG-LIT-010"]),
      actorScope:"ALL_FAITHFUL",posture:"STAND",
      paragraphs:freeze([
        row("ROG-R01-A1","TEXT",o.antiphon,"ROG-LIT-010"),
        row("ROG-R01-P","TEXT",o.psalm,"ROG-LIT-010"),
        row("ROG-R01-G","TEXT",o.gloria,"ROG-LIT-010"),
        row("ROG-R01-A2","TEXT",o.repeat,"ROG-LIT-010"),
      ]),
      guide:"Stand for Exsurge Domine. The Litany begins only after this antiphon."
    }),
    freeze({
      id:"ROG-R02",title:"Litany of the Saints — Beginning",
      sourceRecordIds:freeze(["ROG-LIT-010","ROG-LIT-020"]),
      actorScope:"ALL_FAITHFUL",posture:"KNEEL",
      paragraphs:freeze(pairRows("ROG-R02-",payload.litanyBeforeProcession??[],"ROG-LIT-020")),
      petitionsDuplicated:false,
      guide:"Kneel for the beginning of the Litany. In the 1962 rite the petitions are not doubled."
    }),
    freeze({
      id:"ROG-R03",title:"Procession · Litany of the Saints",
      sourceRecordIds:freeze(["ROG-LIT-020","ROG-PRC-010"]),
      actorScope:"FAITHFUL_PARTICIPATING",posture:"PROCESSIONAL",
      processionBeginsAt:"Sancta Maria",
      paragraphs:freeze(textRows("ROG-R03-",payload.processionLitany??[],"ROG-PRC-010")),
      guide:"Rise at Sancta Maria. If you are participating, walk in procession while continuing the Litany; otherwise retain the local posture."
    }),
    freeze({
      id:"ROG-R04",title:"Psalm and Suffrages after the Litany",
      sourceRecordIds:freeze(["ROG-PS-010"]),
      actorScope:"ALL_FAITHFUL",posture:"LOCAL_OR_STAND",
      paragraphs:freeze([
        row("ROG-R04-PN","TEXT",p.pater,"ROG-PS-010"),
        row("ROG-R04-V","VERSICLE",p.versicle,"ROG-PS-010"),
        row("ROG-R04-R","RESPONSE",p.response,"ROG-PS-010"),
        ...textRows("ROG-R04-PS",p.psalm69??[],"ROG-PS-010"),
        ...pairRows("ROG-R04-S",p.suffrages??[],"ROG-PS-010"),
      ]),
      guide:"Join the responses according to the rite; posture follows the local processional arrangement."
    }),
    freeze({
      id:"ROG-R05",title:"Concluding Prayers",
      sourceRecordIds:freeze(["ROG-END-010"]),
      actorScope:"ALL_FAITHFUL",posture:"STAND_OR_LOCAL",
      paragraphs:freeze([
        ...textRows("ROG-R05-O",p.orations??[],"ROG-END-010"),
        ...pairRows("ROG-R05-F",p.final??[],"ROG-END-010"),
      ]),
      guide:"Complete the appointed prayers before the Mass handoff."
    }),
    freeze({
      id:"ROG-R06",title:"Mass begins at the Introit",
      sourceRecordIds:freeze(["ROG-MASS-010"]),
      actorScope:"ALL",posture:"ORDINARY_PROFILE",paragraphs:freeze([]),
      handoff:"INTROIT",ordinaryOpeningSuppressed:true,
      guide:"When Mass follows immediately, the preparatory prayers are omitted and Mass begins at the Introit."
    }),
  ]);

  return freeze({
    schema:"ao-r25-rogations-reader-payload-v1",
    cards,
    readerPayloadComplete:true,
    petitionsDuplicated:false,
  });
}

// Shared presentation projection for the same 1962 Litany source.
// Public supplications do not involve a walking procession. Keep the
// canonical six-record graph intact; change labels/posture instructions only.
export function contextualRogationCard(card,{observance=null,selectedService=null}={}){
  if(!card)return null;
  const major=observance==="MAJOR";
  const supplications=selectedService==="ORDINARY_AUTHORIZED_SUPPLICATIONS";
  if(!major&&!supplications)return card;
  const processionStep=card.id==="ROG-R03";
  return freeze({
    ...card,
    title:processionStep&&supplications?"Litany of the Saints · Public Supplications":
      processionStep&&major?"Greater Litanies · Public Procession":card.title,
    posture:processionStep&&supplications?"LOCAL_OR_STAND":card.posture,
    guide:processionStep&&supplications?
      "The Litany continues in the Ordinary-authorized public supplications. Follow local posture; do not walk in a procession that is not being held.":
      card.guide
  });
}

export function createRogationsReaderController(args={}){
  const built=buildRogationsPayload(args);
  let index=0;
  function state(){
    const card=built.cards[index]??null;
    return freeze({
      schema:"ao-r25-rogations-reader-state-v1",
      supported:true,index,total:built.cards.length,
      atStart:index===0,atEnd:index===built.cards.length-1,
      card,
      handoff:card?.handoff??null,
      ordinaryOpeningSuppressed:Boolean(card?.ordinaryOpeningSuppressed),
      processionActive:card?.id==="ROG-R03",
      petitionsDuplicated:false,
    });
  }
  function next(){index=Math.min(index+1,built.cards.length-1);return state()}
  function previous(){index=Math.max(index-1,0);return state()}
  function goTo(cardId){const hit=built.cards.findIndex(x=>x.id===cardId);if(hit>=0)index=hit;return state()}
  return freeze({schema:"ao-r25-rogations-reader-controller-v1",supported:true,cards:built.cards,project:state,next,previous,goTo});
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
  return freeze({payload,graph:freeze([...graph]),urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)})});
}
