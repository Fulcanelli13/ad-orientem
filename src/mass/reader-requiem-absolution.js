// R25 native Requiem Absolution / funeral following-action reader.
// This controller begins only after the Mass lifecycle hands off the explicit
// REQUIEM_ABSOLUTION graph. It never mutates the preceding Requiem Mass.

function freeze(v){return Object.freeze(v)}
function clean(v){const s=String(v??"").trim();return s||null}
function row(id,kind,latin,sourceRecordId){
  const text=clean(latin);
  if(!text)throw new Error("Requiem Absolution text missing for "+id);
  return freeze({id,kind,latin:text,sourceRecordId});
}
const REQUIRED=Object.freeze(["ABS-010","ABS-020","ABS-030","ABS-040","ABS-050"]);

export function buildRequiemAbsolutionPayload({graph,payload,bodyPresent=false,burialProcession=false}={}){
  if(!Array.isArray(graph)||graph.length!==5)throw new Error("Certified five-record ABS graph required");
  if(payload?.schema!=="ao-r25-requiem-absolution-payload-v1")throw new Error("Pinned Requiem Absolution payload required");
  const ids=new Set(graph.map(x=>x.id));
  for(const id of REQUIRED)if(!ids.has(id))throw new Error("Requiem Absolution graph missing "+id);

  const cards=[];
  cards.push(freeze({
    id:"ABS-R01",title:"At the Bier or Catafalque",
    sourceRecordIds:freeze(["ABS-010"]),
    actorScope:"ALL_FAITHFUL",posture:"LOCAL_OR_INHERIT",
    paragraphs:freeze([]),
    guide:"Move or remain as directed locally; no universal lay posture is imposed."
  }));

  if(bodyPresent){
    cards.push(freeze({
      id:"ABS-R02",title:"Non intres in judicium",
      sourceRecordIds:freeze(["ABS-020"]),
      actorScope:"ALL_FAITHFUL",posture:"LOCAL_OR_INHERIT",
      paragraphs:freeze([
        row("ABS-R02-P","TEXT",payload.nonIntres?.latin,"ABS-020"),
        row("ABS-R02-A","RESPONSE",payload.nonIntres?.response,"ABS-020"),
      ])
    }));
  }

  cards.push(freeze({
    id:"ABS-R03",title:"Libera me, Domine",
    sourceRecordIds:freeze(["ABS-030"]),
    actorScope:"ALL_FAITHFUL",posture:"LOCAL_OR_INHERIT",
    paragraphs:freeze((payload.liberaMe??[]).map((x,i)=>row("ABS-R03-"+String(i+1),x.kind,x.latin,"ABS-030")))
  }));

  const kp=payload.kyriePaterVersicles??{};
  cards.push(freeze({
    id:"ABS-R04",title:"Kyrie · Pater noster · Versicles",
    sourceRecordIds:freeze(["ABS-040"]),
    actorScope:"ALL_FAITHFUL",posture:"LOCAL_OR_INHERIT",
    faithfulGesture:null,
    paragraphs:freeze([
      ...(kp.kyrie??[]).map((x,i)=>row("ABS-R04-K"+String(i+1),i===1?"RESPONSE":"VERSICLE",x,"ABS-040")),
      row("ABS-R04-PN","TEXT",kp.pater,"ABS-040"),
      ...(kp.versicles??[]).map((x,i)=>row("ABS-R04-V"+String(i+1),x.kind,x.latin,"ABS-040")),
      row("ABS-R04-O","TEXT",bodyPresent?kp.prayerBodyPresent:kp.prayerBodyAbsent,"ABS-040"),
      row("ABS-R04-A","RESPONSE",kp.response,"ABS-040"),
    ]),
    guide:"During the silent Pater noster the celebrant performs the appointed aspersion/incensation; no faithful imitation gesture is created."
  }));

  if(bodyPresent&&burialProcession){
    cards.push(freeze({
      id:"ABS-R05",title:"In paradisum",
      sourceRecordIds:freeze(["ABS-050"]),
      actorScope:"FAITHFUL_PARTICIPATING",posture:"PROCESSIONAL",
      paragraphs:freeze([
        row("ABS-R05-I","TEXT",payload.departure?.inParadisum,"ABS-050"),
        row("ABS-R05-C","TEXT",payload.departure?.chorusAngelorum,"ABS-050"),
      ]),
      handoff:"BURIAL_PROCESSION"
    }));
  }

  return freeze({
    schema:"ao-r25-requiem-absolution-reader-payload-v1",
    readerPayloadComplete:true,
    bodyPresent:Boolean(bodyPresent),
    burialProcession:Boolean(bodyPresent&&burialProcession),
    cards:freeze(cards),
  });
}

export function createRequiemAbsolutionReaderController(args={}){
  const built=buildRequiemAbsolutionPayload(args);
  let index=0;
  let burialParticipant=false;
  function state(){
    const card=built.cards[index]??null;
    return freeze({
      schema:"ao-r25-requiem-absolution-reader-state-v1",
      supported:true,index,total:built.cards.length,
      atStart:index===0,atEnd:index===built.cards.length-1,
      card,
      bodyPresent:built.bodyPresent,
      burialProcession:built.burialProcession,
      burialParticipant,
      // The source authorizes a processional posture for those joining;
      // a body/burial flag alone never establishes personal participation.
      posture:card?.actorScope==="FAITHFUL_PARTICIPATING" && !burialParticipant
        ? null : card?.posture??null,
      handoff:card?.handoff??null,
    });
  }
  function next(){index=Math.min(index+1,built.cards.length-1);return state()}
  function previous(){index=Math.max(0,index-1);return state()}
  function goTo(cardId){const hit=built.cards.findIndex(x=>x.id===String(cardId));if(hit>=0)index=hit;return state()}
  function setBurialParticipant(value){burialParticipant=Boolean(value);return state()}
  return freeze({schema:"ao-r25-requiem-absolution-reader-controller-v1",supported:true,cards:built.cards,project:state,next,previous,goTo,setBurialParticipant});
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data||typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}
export async function loadRequiemAbsolutionReaderData({fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-requiem-absolution.v1.json",baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([
    readJson(fetchImpl,payloadUrl,"Requiem Absolution payload"),
    readJson(fetchImpl,extensionUrl,"special-days extension"),
  ]);
  const graph=extension?.graphs?.ABS;
  if(!Array.isArray(graph))throw new Error("Certified ABS graph unavailable");
  return freeze({payload,graph:freeze([...graph]),urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)})});
}
