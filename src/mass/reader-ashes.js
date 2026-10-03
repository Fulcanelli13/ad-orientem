// R23 native Ash Wednesday payload/controller.
// Rite text is source-pinned; recipient posture remains personal state.

const freeze=value=>Object.freeze(value);
const clean=value=>{const s=String(value??"").trim();return s||null};
const row=(id,kind,latin,sourceRecordId)=>freeze({id,kind,latin:clean(latin),sourceRecordId});

export function buildAshesPayload({graph,payload}={}){
  if(!Array.isArray(graph)||graph.length!==8)throw new Error("Certified eight-record ASH graph required");
  if(payload?.schema!=="ao-r23-ashes-payload-v1")throw new Error("Pinned Ash Wednesday payload required");
  const ids=new Set(graph.map(x=>x.id));
  for(const id of ["ASH-BLS-010","ASH-BLS-020","ASH-BLS-030","ASH-DST-010","ASH-DST-020","ASH-DST-030","ASH-END-010","ASH-MASS-010"]){
    if(!ids.has(id))throw new Error("Ash graph missing "+id);
  }
  const t=payload.texts??{};
  const blessing=[
    row("ASH-R01-A","TEXT",t.openingAntiphon,"ASH-BLS-010"),
    row("ASH-R01-P","TEXT",t.openingPsalm,"ASH-BLS-010"),
    row("ASH-R01-G","TEXT",t.gloria,"ASH-BLS-010"),
    row("ASH-R01-R","TEXT",t.openingAntiphon,"ASH-BLS-010"),
  ];
  const prayers=(t.prayers??[]).map((latin,i)=>row("ASH-R02-"+String(i+1).padStart(2,"0"),"TEXT",latin,"ASH-BLS-020"));
  if(prayers.length!==4)throw new Error("Ash blessing must preserve four distinct orations");
  const distribution=(t.distribution??[]).map((latin,i)=>row("ASH-R04-"+String(i+1).padStart(2,"0"),"TEXT",latin,"ASH-DST-010"));
  distribution.push(row("ASH-R04-F","TEXT",t.imposition,"ASH-DST-020"));
  return freeze({
    schema:"ao-r23-ashes-reader-payload-v1",
    cards:freeze([
      freeze({id:"ASH-R01",title:"Blessing of Ashes",sourceRecordIds:freeze(["ASH-BLS-010"]),actorScope:"FAITHFUL",posture:"STAND",paragraphs:freeze(blessing)}),
      freeze({id:"ASH-R02",title:"Four Blessing Prayers",sourceRecordIds:freeze(["ASH-BLS-020"]),actorScope:"FAITHFUL",posture:"STAND",paragraphs:freeze(prayers),guide:"The four prayers remain distinct even when shown on one card."}),
      freeze({id:"ASH-R03",title:"Ashes sprinkled and incensed",sourceRecordIds:freeze(["ASH-BLS-030"]),actorScope:"FAITHFUL",posture:"STAND",paragraphs:freeze([]),ministerOnly:true,guide:"Observe. The Asperges me here belongs to the blessing of the ashes; it is not the Sunday sprinkling rite."}),
      freeze({id:"ASH-R04",title:"Imposition of Ashes",sourceRecordIds:freeze(["ASH-DST-010","ASH-DST-020","ASH-DST-030"]),actorScope:"ASH_RECIPIENT",posture:"LOCAL",paragraphs:freeze(distribution),
        recipientStates:freeze({
          RECIPIENT_CALLED:freeze({posture:"STAND_WALK",action:"APPROACH_ALTAR_RAIL"}),
          RECEIVE_ASHES:freeze({posture:"KNEEL",action:"RECEIVE_ASHES"}),
          ASHES_RECEIVED:freeze({posture:"STAND_WALK",action:"RISE_AND_RETURN"}),
        }),
        guide:"Only the person currently receiving ashes follows the recipient posture."
      }),
      freeze({id:"ASH-R05",title:"Concluding Prayer",sourceRecordIds:freeze(["ASH-END-010"]),actorScope:"FAITHFUL",posture:"STAND",paragraphs:freeze([
        row("ASH-R05-V","VERSICLE","Dóminus vobíscum.","ASH-END-010"),
        row("ASH-R05-R","RESPONSE","Et cum spíritu tuo.","ASH-END-010"),
        row("ASH-R05-O","TEXT",t.conclusion,"ASH-END-010"),
        row("ASH-R05-A","RESPONSE",t.response,"ASH-END-010"),
      ])}),
      freeze({id:"ASH-R06",title:"Mass begins at the Introit",sourceRecordIds:freeze(["ASH-MASS-010"]),actorScope:"ALL",posture:"ORDINARY_PROFILE",paragraphs:freeze([]),handoff:"INTROIT",ordinaryOpeningSuppressed:true,guide:"When this rite immediately precedes Mass, the Prayers at the Foot are omitted and Mass begins at the Introit."}),
    ])
  });
}

export function createAshesReaderController(args={}){
  const built=buildAshesPayload(args); let index=0,recipientState=null;
  function state(){
    const card=built.cards[index]??null;
    const recipient=card?.recipientStates?.[recipientState]??null;
    return freeze({schema:"ao-r23-ashes-reader-state-v1",supported:true,index,total:built.cards.length,atStart:index===0,atEnd:index===built.cards.length-1,card,recipientState,recipientPosture:recipient?.posture??null,recipientAction:recipient?.action??null,handoff:card?.handoff??null,ordinaryOpeningSuppressed:Boolean(card?.ordinaryOpeningSuppressed)});
  }
  const next=()=>{index=Math.min(index+1,built.cards.length-1);recipientState=null;return state()};
  const previous=()=>{index=Math.max(index-1,0);recipientState=null;return state()};
  const goTo=cardId=>{const hit=built.cards.findIndex(x=>x.id===cardId);if(hit>=0){index=hit;recipientState=null;}return state()};
  const setRecipientState=value=>{if(!built.cards[index]?.recipientStates?.[value])throw new Error("Unsupported Ash recipient state: "+value);recipientState=value;return state()};
  return freeze({schema:"ao-r23-ashes-reader-controller-v1",supported:true,cards:built.cards,project:state,next,previous,goTo,setRecipientState});
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json(); if(!data||typeof data!=="object")throw new Error(label+" did not return JSON object"); return data;
}
export async function loadAshesReaderData({fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-ashes.v1.json",baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([readJson(fetchImpl,payloadUrl,"Ash Wednesday reader payload"),readJson(fetchImpl,extensionUrl,"special-days extension")]);
  const graph=extension?.graphs?.ASH;if(!Array.isArray(graph))throw new Error("Certified ASH graph unavailable");
  return freeze({payload,graph:freeze([...graph]),urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)})});
}
