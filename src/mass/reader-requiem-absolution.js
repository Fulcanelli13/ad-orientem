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
// Rituale Romanum 1952, De Exsequiis; 1962 Missal General Rubrics §401.
// Book directions, not user-observed minister actions or source-clocks.
export const ABSOLUTION_RITUALE_SOURCE="https://laudatedominum.net/burial_of_adults.php";
export const ABSOLUTION_CEREMONY_CLOCK="PRESCRIBED_SOURCE_ONLY_NOT_OBSERVED";

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
    // Ritus XIII.3 is a conditional transition after Mass, not a new
    // Absolution prayer/card or an observed sermon/candle event.
    guide:"If there is a sermon, it is given after Mass and before this Absolution. If candles were distributed, they are lit for the Absolution. The celebrant takes a black cope. Deacon and subdeacon assist only after Solemn Mass; otherwise servers assist. Follow local directions; no universal lay posture is imposed.",
    guideFr:"S’il y a une prédication, elle a lieu après la messe et avant cette absoute. Si des cierges ont été distribués, on les allume pour l’absoute. Le célébrant revêt une chape noire. Le diacre et le sous-diacre n’assistent que si la messe précédente était solennelle ; autrement, des servants l’assistent. Suivez les usages locaux ; aucune posture universelle des fidèles n’est imposée.",
    guideSourceUrl:"https://usus-antiquior.github.io/ritus-servandus.html#XIII",
    ceremonialSourceUrl:ABSOLUTION_RITUALE_SOURCE,
    ceremonialObservation:ABSOLUTION_CEREMONY_CLOCK
  }));

  if(bodyPresent){
    cards.push(freeze({
      id:"ABS-R02",title:"Non intres in judicium",
      sourceRecordIds:freeze(["ABS-020"]),
      actorScope:"ALL_FAITHFUL",posture:"LOCAL_OR_INHERIT",
      paragraphs:freeze([
        row("ABS-R02-P","TEXT",payload.nonIntres?.latin,"ABS-020"),
        row("ABS-R02-A","RESPONSE",payload.nonIntres?.response,"ABS-020"),
      ]),
      guide:"With the body present, the celebrant says Non intres before the choir begins Libera me. This prayer is omitted if the body is absent.",
      guideFr:"Le corps étant présent, le célébrant dit Non intres avant que le chœur commence Libera me. Cette oraison est omise en l’absence du corps.",
      guideSourceUrl:ABSOLUTION_RITUALE_SOURCE,
      ceremonialObservation:ABSOLUTION_CEREMONY_CLOCK
    }));
  }

  cards.push(freeze({
    id:"ABS-R03",title:"Libera me, Domine",
    sourceRecordIds:freeze(["ABS-030"]),
    actorScope:"ALL_FAITHFUL",posture:"LOCAL_OR_INHERIT",
    paragraphs:freeze((payload.liberaMe??[]).map((x,i)=>row("ABS-R03-"+String(i+1),x.kind,x.latin,"ABS-030"))),
    guide:"The choir chants Libera me. Toward the end of the responsory, incense is prepared for the Absolution; the reader does not infer its actual timing.",
    guideFr:"Le chœur chante Libera me. Vers la fin du répons, on prépare l’encens pour l’absoute ; le lecteur ne présume pas du moment effectivement observé.",
    guideSourceUrl:ABSOLUTION_RITUALE_SOURCE,
    ceremonialObservation:ABSOLUTION_CEREMONY_CLOCK
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
    guide:"After the Kyrie, the celebrant begins Pater noster aloud and continues silently. During it he first sprinkles the coffin or catafalque with holy water, then goes around it again to incense it, reverencing the processional cross as he passes. The versicles and the body-present or body-absent prayer follow. These actions are prescribed, not observed by the reader; no faithful imitation gesture is created.",
    guideFr:"Après le Kyrie, le célébrant commence Pater noster à haute voix et poursuit en silence. Il asperge d’abord le cercueil ou le catafalque d’eau bénite, puis en fait de nouveau le tour pour l’encenser, saluant la croix de procession lorsqu’il passe devant elle. Suivent les versets et l’oraison propre à la présence ou à l’absence du corps. Le lecteur décrit les gestes prescrits sans prétendre les observer et n’impose aucun geste d’imitation aux fidèles.",
    guideSourceUrl:ABSOLUTION_RITUALE_SOURCE,
    ceremonialObservation:ABSOLUTION_CEREMONY_CLOCK
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
      handoff:"BURIAL_PROCESSION",
      guide:"In paradisum accompanies the departure of the body toward burial. A processional posture applies only to those actually joining that procession.",
      guideFr:"In paradisum accompagne le départ du corps vers la sépulture. La posture processionnelle ne concerne que les personnes qui suivent effectivement cette procession.",
      guideSourceUrl:ABSOLUTION_RITUALE_SOURCE,
      ceremonialObservation:ABSOLUTION_CEREMONY_CLOCK
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
