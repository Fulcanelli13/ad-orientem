// R31 native Holy Thursday post-Mass following-action reader.
// Translation/reposition and stripping remain outside canonical Mass identity.
// The controller activates only from the explicit HOLY_THURSDAY_POST following graph.

function freeze(v){return Object.freeze(v)}
function clean(v){const s=String(v??"").trim();return s||null}
function row(id,kind,latin,sourceRecordId){
  const text=clean(latin);
  if(!text)throw new Error("Holy Thursday post-Mass reader text missing for "+id);
  return freeze({id,kind,latin:text,sourceRecordId});
}

const REQUIRED=Object.freeze([
  "HT-TRN-010","HT-TRN-020","HT-TRN-030",
  "HT-TRN-040","HT-STRIP-010","HT-POST-900",
]);
const SOURCE_BLOB="fc4dd294c86b1f3e6dd6938615fc6ffbc868f10b";

export function buildHolyThursdayPostPayload({graph,payload}={}){
  if(!Array.isArray(graph)||graph.length!==6)throw new Error("Certified six-record HT_POST graph required");
  if(payload?.schema!=="ao-r31-holy-thursday-post-payload-v1")throw new Error("Pinned Holy Thursday post-Mass payload required");
  if(payload?.source?.blobSha!==SOURCE_BLOB)throw new Error("Holy Thursday post-Mass source revision changed");
  const ids=new Set(graph.map(x=>x.id));
  for(const id of REQUIRED)if(!ids.has(id))throw new Error("Holy Thursday post-Mass graph missing "+id);
  if((payload.pangeLingua??[]).length!==4)throw new Error("Holy Thursday translation requires four pre-Tantum Pange lingua stanzas");
  if((payload.tantumErgo??[]).length!==2)throw new Error("Holy Thursday reposition requires Tantum ergo and Genitori");
  if(!(payload.stripping?.psalm21??[]).length)throw new Error("Holy Thursday stripping requires Psalm 21");

  const cards=freeze([
    freeze({
      id:"HT-R01",title:"Translation · Pange lingua",
      sourceRecordIds:freeze(["HT-TRN-010"]),
      actorScope:"FAITHFUL",posture:"EVENT_DRIVEN",
      paragraphs:freeze(payload.pangeLingua.map((x,i)=>row("HT-R01-"+String(i+1),"TEXT",x,"HT-TRN-010"))),
      guide:"The Blessed Sacrament is carried to the altar of repose. Kneel when It passes your place; do not advance posture from the hymn alone."
    }),
    freeze({
      id:"HT-R02",title:"Follow the Translation",
      sourceRecordIds:freeze(["HT-TRN-020"]),
      actorScope:"FAITHFUL_JOINING",posture:"PERSONAL_STATE",
      paragraphs:freeze([]),
      guide:"If you are actually joining the translation, rise after the Blessed Sacrament has passed and follow behind. Otherwise remain with the local congregation."
    }),
    freeze({
      id:"HT-R03",title:"At the Altar of Repose · Tantum ergo",
      sourceRecordIds:freeze(["HT-TRN-030"]),
      actorScope:"FAITHFUL",posture:"KNEEL",
      paragraphs:freeze(payload.tantumErgo.map((x,i)=>row("HT-R03-"+String(i+1),"TEXT",x,"HT-TRN-030"))),
      guide:"Kneel at the altar of repose for the reposition and silent adoration."
    }),
    freeze({
      id:"HT-R04",title:"After Silent Adoration",
      sourceRecordIds:freeze(["HT-TRN-040"]),
      actorScope:"FAITHFUL_JOINING",posture:"PERSONAL_STATE",
      paragraphs:freeze([]),
      guide:"If you followed the translation and are leaving after the silent adoration, stand, make the appointed double-knee genuflection, then return."
    }),
    freeze({
      id:"HT-R05",title:"Stripping of the Altars",
      sourceRecordIds:freeze(["HT-STRIP-010"]),
      actorScope:"ALL_FAITHFUL",posture:"LOCAL_OR_INHERIT",
      paragraphs:freeze([
        row("HT-R05-A1","TEXT",payload.stripping.antiphon,"HT-STRIP-010"),
        ...payload.stripping.psalm21.map((x,i)=>row("HT-R05-P"+String(i+1).padStart(2,"0"),"TEXT",x,"HT-STRIP-010")),
        row("HT-R05-A2","TEXT",payload.stripping.antiphon,"HT-STRIP-010"),
      ]),
      guide:"Observe and pray during the stripping of the altars. No universal faithful kneel/stand posture is imposed here."
    }),
    freeze({
      id:"HT-R06",title:"Holy Thursday Post-Mass Rites Complete",
      sourceRecordIds:freeze(["HT-POST-900"]),
      actorScope:"ALL",posture:"LOCAL_OR_INHERIT",paragraphs:freeze([]),
      handoff:"POST_MASS_LIFECYCLE",
      guide:"The special post-Mass graph is complete. Continue to the post-Mass lifecycle; do not return to the Mass timeline."
    }),
  ]);
  return freeze({
    schema:"ao-r31-holy-thursday-post-reader-payload-v1",
    readerPayloadComplete:true,
    sourceBlobSha:SOURCE_BLOB,
    cards
  });
}

export function createHolyThursdayPostReaderController(args={}){
  const built=buildHolyThursdayPostPayload(args);
  let index=0;
  let joining=false;
  let riteState=null;

  function state(){
    const card=built.cards[index]??null;
    let posture=null;
    let personalAction=null;
    if(card?.id==="HT-R01" && riteState==="SSMM_PASSES_PEWS")posture="KNEEL";
    else if(card?.id==="HT-R02" && joining && riteState==="SSMM_HAS_PASSED"){
      posture="STAND_WALK"; personalAction="FOLLOW_BEHIND";
    }else if(card?.id==="HT-R03")posture="KNEEL";
    else if(card?.id==="HT-R04" && joining && riteState==="SILENT_ADORATION_COMPLETE"){
      posture="STAND_DOUBLE_KNEE_GENUFLECTION_STAND"; personalAction="RETURN_AFTER_ADORATION";
    }else if(card?.posture && !["EVENT_DRIVEN","PERSONAL_STATE","LOCAL_OR_INHERIT"].includes(card.posture))posture=card.posture;

    return freeze({
      schema:"ao-r31-holy-thursday-post-reader-state-v1",
      supported:true,index,total:built.cards.length,
      atStart:index===0,atEnd:index===built.cards.length-1,
      card,joining,riteState,
      posture,personalAction,
      handoff:card?.handoff??null,
    });
  }
  function next(){index=Math.min(index+1,built.cards.length-1);return state()}
  function previous(){index=Math.max(0,index-1);return state()}
  function goTo(cardId){const hit=built.cards.findIndex(x=>x.id===String(cardId));if(hit>=0)index=hit;return state()}
  function setJoining(value=true){joining=Boolean(value);return state()}
  function setRiteState(value){
    const next=String(value??"").toUpperCase();
    const allowed=new Set([
      "SSMM_PASSES_PEWS","SSMM_HAS_PASSED","ARRIVE_ALTAR_OF_REPOSE",
      "SSMM_RESERVED","SILENT_ADORATION_COMPLETE",
      "STRIPPING_OF_ALTARS_BEGINS","STRIPPING_COMPLETE"
    ]);
    if(!allowed.has(next))throw new Error("Unsupported Holy Thursday post-Mass state: "+value);
    riteState=next;
    if(next==="SSMM_PASSES_PEWS")index=0;
    if(next==="SSMM_HAS_PASSED")index=1;
    if(next==="ARRIVE_ALTAR_OF_REPOSE"||next==="SSMM_RESERVED")index=2;
    if(next==="SILENT_ADORATION_COMPLETE")index=3;
    if(next==="STRIPPING_OF_ALTARS_BEGINS")index=4;
    if(next==="STRIPPING_COMPLETE")index=5;
    return state();
  }
  return freeze({
    schema:"ao-r31-holy-thursday-post-reader-controller-v1",supported:true,cards:built.cards,
    project:state,next,previous,goTo,setJoining,setRiteState
  });
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data||typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}

export async function loadHolyThursdayPostReaderData({fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-holy-thursday-post.v1.json",baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([
    readJson(fetchImpl,payloadUrl,"Holy Thursday post-Mass payload"),
    readJson(fetchImpl,extensionUrl,"special-days extension"),
  ]);
  const graph=extension?.graphs?.HT_POST;
  if(!Array.isArray(graph))throw new Error("Certified HT_POST graph unavailable");
  return freeze({payload,graph:freeze([...graph]),urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)})});
}
