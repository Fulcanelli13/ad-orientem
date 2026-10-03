// R23 native Rogation/Litany payload/controller.
// Full rite text is source-pinned. Processional posture remains actor-scoped;
// the Mass bridge exists only when the compiled plan explicitly contains ROGATIONS.

const freeze=value=>Object.freeze(value);
const clean=value=>{const s=String(value??"").trim();return s||null};
const row=(id,kind,latin,sourceRecordId)=>freeze({id,kind,latin:clean(latin),sourceRecordId});

export function buildRogationsPayload({graph,payload}={}){
  if(!Array.isArray(graph)||graph.length!==6)throw new Error("Certified six-record ROG graph required");
  if(payload?.schema!=="ao-r23-rogations-payload-v1")throw new Error("Pinned Rogation payload required");
  const ids=new Set(graph.map(x=>x.id));
  for(const id of ["ROG-LIT-010","ROG-LIT-020","ROG-PS-010","ROG-PRC-010","ROG-END-010","ROG-MASS-010"]){
    if(!ids.has(id))throw new Error("Rogation graph missing "+id);
  }
  const t=payload.texts??{};
  const litanyProcession=[
    ...(t.saints??[]).map((latin,i)=>row("ROG-R03-S"+String(i+1).padStart(2,"0"),"TEXT",latin,"ROG-LIT-020")),
    ...(t.deprecations??[]).map((latin,i)=>row("ROG-R03-D"+String(i+1).padStart(2,"0"),"TEXT",latin,"ROG-LIT-020")),
    ...(t.petitions??[]).map((latin,i)=>row("ROG-R03-P"+String(i+1).padStart(2,"0"),"TEXT",latin,"ROG-LIT-020")),
    row("ROG-R03-E","TEXT",t.litanyEnding,"ROG-LIT-020"),
  ];
  if(litanyProcession.length<10)throw new Error("Rogation Litany corpus appears truncated");
  const supplication=[
    row("ROG-R04-PS","TEXT",t.psalm69,"ROG-PS-010"),
    row("ROG-R04-V","TEXT",t.versicles,"ROG-PS-010"),
    ...(t.prayers??[]).map((latin,i)=>row("ROG-R04-O"+String(i+1).padStart(2,"0"),"TEXT",latin,"ROG-PS-010")),
    row("ROG-R04-F","TEXT",t.finalVersicles,"ROG-END-010"),
  ];
  if((t.prayers??[]).length!==10)throw new Error("Rogation conclusion must preserve ten prayers");

  return freeze({
    schema:"ao-r23-rogations-reader-payload-v1",
    cards:freeze([
      freeze({
        id:"ROG-R01",title:"Rogation Supplication",
        sourceRecordIds:freeze(["ROG-LIT-010"]),
        actorScope:"FAITHFUL",posture:"STAND",
        paragraphs:freeze([row("ROG-R01-A","TEXT",t.openingAntiphon,"ROG-LIT-010")]),
        guide:"Stand for the opening antiphon before the Litany."
      }),
      freeze({
        id:"ROG-R02",title:"Litany begins",
        sourceRecordIds:freeze(["ROG-LIT-010","ROG-LIT-020"]),
        actorScope:"FAITHFUL",posture:"KNEEL",
        paragraphs:freeze([row("ROG-R02-L","TEXT",t.litanyOpening,"ROG-LIT-020")]),
        guide:"The Litany begins kneeling. The processional movement begins with Sancta Maria."
      }),
      freeze({
        id:"ROG-R03",title:"Litany and Procession",
        sourceRecordIds:freeze(["ROG-LIT-020","ROG-PRC-010"]),
        actorScope:"FAITHFUL",
        posture:"LOCAL",
        paragraphs:freeze(litanyProcession),
        processionalStates:freeze({
          PARTICIPATING:freeze({posture:"PROCESSIONAL",action:"WALK_IN_PROCESSION"}),
          NOT_PARTICIPATING:freeze({posture:"LOCAL",action:null}),
        }),
        processionTrigger:"SANCTA_MARIA",
        guide:"At Sancta Maria the participating procession rises and begins. If you are not processing, follow local posture."
      }),
      freeze({
        id:"ROG-R04",title:"Psalm and Concluding Prayers",
        sourceRecordIds:freeze(["ROG-PS-010","ROG-END-010"]),
        actorScope:"FAITHFUL",posture:"LOCAL",
        paragraphs:freeze(supplication),
        guide:"Follow the Psalm, versicles and appointed concluding prayers."
      }),
      freeze({
        id:"ROG-R05",title:"Mass begins at the Introit",
        sourceRecordIds:freeze(["ROG-MASS-010"]),
        actorScope:"ALL",posture:"ORDINARY_PROFILE",paragraphs:freeze([]),
        handoff:"INTROIT",ordinaryOpeningSuppressed:true,
        guide:"When the Rogation rite immediately precedes Mass, the Prayers at the Foot are omitted and Mass begins at the Introit."
      }),
    ])
  });
}

export function createRogationsReaderController(args={}){
  const built=buildRogationsPayload(args);
  let index=0,processionalState=null;
  function state(){
    const card=built.cards[index]??null;
    const processional=card?.processionalStates?.[processionalState]??null;
    return freeze({
      schema:"ao-r23-rogations-reader-state-v1",
      supported:true,index,total:built.cards.length,
      atStart:index===0,atEnd:index===built.cards.length-1,
      card,processionalState,
      participantPosture:processional?.posture??null,
      participantAction:processional?.action??null,
      processionTrigger:card?.processionTrigger??null,
      handoff:card?.handoff??null,
      ordinaryOpeningSuppressed:Boolean(card?.ordinaryOpeningSuppressed),
    });
  }
  const next=()=>{index=Math.min(index+1,built.cards.length-1);processionalState=null;return state()};
  const previous=()=>{index=Math.max(index-1,0);processionalState=null;return state()};
  const goTo=cardId=>{const hit=built.cards.findIndex(x=>x.id===cardId);if(hit>=0){index=hit;processionalState=null;}return state()};
  const setProcessionalState=value=>{
    if(!built.cards[index]?.processionalStates?.[value])throw new Error("Unsupported Rogation processional state: "+value);
    processionalState=value;return state();
  };
  return freeze({schema:"ao-r23-rogations-reader-controller-v1",supported:true,cards:built.cards,project:state,next,previous,goTo,setProcessionalState});
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();if(!data||typeof data!=="object")throw new Error(label+" did not return JSON object");return data;
}
export async function loadRogationsReaderData({fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-rogations.v1.json",baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([
    readJson(fetchImpl,payloadUrl,"Rogation reader payload"),
    readJson(fetchImpl,extensionUrl,"special-days extension")
  ]);
  const graph=extension?.graphs?.ROG;if(!Array.isArray(graph))throw new Error("Certified ROG graph unavailable");
  return freeze({payload,graph:freeze([...graph]),urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)})});
}
