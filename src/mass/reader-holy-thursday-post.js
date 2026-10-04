// R27 native Holy Thursday post-Mass reader.
// Owns only the explicit HOLY_THURSDAY_POST following-action surface.
// Mass ending deltas remain plan-owned and the recovered HT_POST graph owns state.

function freeze(v){return Object.freeze(v)}
function clean(v){const s=String(v??"").trim();return s||null}
function row(id,kind,latin,sourceRecordId){
  const text=clean(latin);
  if(!text)throw new Error("Holy Thursday post-Mass reader text missing for "+id);
  return freeze({id,kind,latin:text,sourceRecordId});
}
const REQUIRED=freeze(["HT-TRN-010","HT-TRN-020","HT-TRN-030","HT-TRN-040","HT-STRIP-010","HT-POST-900"]);

export function buildHolyThursdayPostPayload({graph,payload}={}){
  if(!Array.isArray(graph)||graph.length!==6)throw new Error("Certified six-record HT_POST graph required");
  if(payload?.schema!=="ao-r27-holy-thursday-post-payload-v1")throw new Error("Pinned Holy Thursday post-Mass payload required");
  const ids=new Set(graph.map(x=>x.id));
  for(const id of REQUIRED)if(!ids.has(id))throw new Error("Holy Thursday post-Mass graph missing "+id);
  if((payload.pangeLingua??[]).length!==4)throw new Error("Holy Thursday requires four pre-Tantum Pange lingua stanzas");
  if((payload.tantumErgo??[]).length!==2)throw new Error("Holy Thursday requires Tantum ergo and Genitori");
  if((payload.stripping?.psalm21Pian??[]).length<10)throw new Error("Holy Thursday Pian Psalm 21 corpus is incomplete");

  const cards=freeze([
    freeze({
      id:"HT-R01",title:"Translation of the Blessed Sacrament",
      sourceRecordIds:freeze(["HT-TRN-010"]),
      actorScope:"ALL_FAITHFUL",posture:"KNEEL",
      paragraphs:freeze(payload.pangeLingua.map((x,i)=>row("HT-R01-"+String(i+1),"TEXT",x,"HT-TRN-010"))),
      guide:"Kneel as the Blessed Sacrament passes. Pange lingua accompanies the translation to the altar of repose."
    }),
    freeze({
      id:"HT-R02",title:"Follow to the Altar of Repose",
      sourceRecordIds:freeze(["HT-TRN-020"]),
      actorScope:"FAITHFUL_JOINING",posture:"LOCAL_OR_INHERIT",paragraphs:freeze([]),
      joiningState:freeze({
        WAITING:freeze({posture:"KNEEL",action:"WAIT_WHILE_BLESSED_SACRAMENT_PASSES"}),
        JOINING:freeze({posture:"STAND_WALK",action:"FOLLOW_BEHIND"}),
        NOT_JOINING:freeze({posture:"LOCAL_OR_INHERIT",action:"REMAIN_LOCAL"}),
      }),
      guide:"If joining the procession, stand only after the Blessed Sacrament has passed and follow behind. Otherwise retain the local posture."
    }),
    freeze({
      id:"HT-R03",title:"At the Altar of Repose",
      sourceRecordIds:freeze(["HT-TRN-030"]),
      actorScope:"ALL_FAITHFUL",posture:"KNEEL",
      paragraphs:freeze(payload.tantumErgo.map((x,i)=>row("HT-R03-"+String(i+1),"TEXT",x,"HT-TRN-030"))),
      guide:"At the altar of repose, kneel while Tantum ergo and Genitori are sung."
    }),
    freeze({
      id:"HT-R04",title:"After the Reservation",
      sourceRecordIds:freeze(["HT-TRN-040"]),
      actorScope:"FAITHFUL_JOINING",posture:"LOCAL_OR_INHERIT",paragraphs:freeze([]),
      joiningAction:"STAND_DOUBLE_KNEE_GENUFLECTION_STAND_RETURN",
      guide:"If you followed the procession, stand, make the appointed double-knee genuflection, and return. This is not imposed on those who did not join."
    }),
    freeze({
      id:"HT-R05",title:"Stripping of the Altars",
      sourceRecordIds:freeze(["HT-STRIP-010"]),
      actorScope:"ALL_FAITHFUL",posture:"LOCAL_OR_INHERIT",
      paragraphs:freeze([
        row("HT-R05-A1","TEXT",payload.stripping?.antiphon,"HT-STRIP-010"),
        ...(payload.stripping?.psalm21Pian??[]).map((x,i)=>row("HT-R05-P"+String(i+1),"TEXT",x,"HT-STRIP-010")),
        row("HT-R05-A2","TEXT",payload.stripping?.repeatAntiphon,"HT-STRIP-010"),
      ]),
      guide:"Observe and pray during the stripping of the altars. No universal faithful posture is imposed by the recovered 1962 source."
    }),
    freeze({
      id:"HT-R06",title:"Holy Thursday Rites Complete",
      sourceRecordIds:freeze(["HT-POST-900"]),
      actorScope:"ALL",posture:"LOCAL_OR_INHERIT",paragraphs:freeze([]),
      handoff:"POST_MASS_LIFECYCLE",
      guide:"The post-Mass rite is complete. Continue to the post-Mass lifecycle."
    }),
  ]);
  return freeze({schema:"ao-r27-holy-thursday-post-reader-payload-v1",readerPayloadComplete:true,cards});
}

export function createHolyThursdayPostReaderController(args={}){
  const built=buildHolyThursdayPostPayload(args);
  let index=0;
  let joiningState="WAITING";
  function state(){
    const card=built.cards[index]??null;
    const personal=card?.joiningState?.[joiningState]??null;
    return freeze({
      schema:"ao-r27-holy-thursday-post-reader-state-v1",
      supported:true,index,total:built.cards.length,
      atStart:index===0,atEnd:index===built.cards.length-1,
      card,joiningState,
      posture:personal?.posture??card?.posture??null,
      action:personal?.action??card?.joiningAction??null,
      handoff:card?.handoff??null,
    });
  }
  function next(){index=Math.min(index+1,built.cards.length-1);return state()}
  function previous(){index=Math.max(0,index-1);return state()}
  function goTo(cardId){const hit=built.cards.findIndex(x=>x.id===String(cardId));if(hit>=0)index=hit;return state()}
  function setJoiningState(value){
    const next=String(value??"").toUpperCase();
    if(!["WAITING","JOINING","NOT_JOINING"].includes(next))throw new Error("Unsupported Holy Thursday joining state: "+value);
    joiningState=next;return state();
  }
  return freeze({
    schema:"ao-r27-holy-thursday-post-reader-controller-v1",supported:true,cards:built.cards,
    project:state,next,previous,goTo,setJoiningState
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
