import {EASTER_VIGIL_PROPHECY_READINGS} from "./reader-easter-vigil-prophecy-index.js";

// R33 Easter Vigil composite distinct-rite reader.
// The recovered 38-record EV graph owns choreography and branch state.
// Recovered Ad Orientem donor text owns presentation copy; ordinary Mass
// identity begins only at the explicit Litany -> Kyrie handoff.

const REQUIRED_COUNT=38;
const FONT_MODES=new Set(["NONE","IN_CHURCH","SEPARATE_BAPTISTERY"]);
const OMITTED_MASS_SOURCE_SEQUENCES=new Set([1,21,30]);
const SUPPRESSED_MASS_EVENTS=new Set(["MC-COM-150","MC-COM-160","MC-END-010"]);

function freeze(v){return Object.freeze(v)}
function clean(v){const s=String(v??"").trim();return s||null}
function row(id,text,kind="TEXT",sourceIds=[]){
  const value=clean(text);
  if(!value)throw new Error("Easter Vigil text missing for "+id);
  return freeze({id,kind,latin:value,sourceIds:freeze([...sourceIds])});
}
function bilingualRows(prefix,text,sourceIds=[]){
  const latin=clean(text?.lat), en=clean(text?.en), fr=clean(text?.fr);
  if(!latin)throw new Error("Easter Vigil Latin donor missing for "+prefix);
  return freeze([freeze({id:prefix,kind:"TEXT",latin,vernacular:en,english:en,french:fr,sourceIds:freeze([...sourceIds])})]);
}

function validateGraph(graph){
  if(!Array.isArray(graph)||graph.length!==REQUIRED_COUNT)throw new Error("Certified 38-record Easter Vigil graph required");
  const ids=new Set();
  for(const r of graph){
    if(!/^EV-/.test(String(r?.id??"")))throw new Error("Invalid Easter Vigil record");
    if(ids.has(r.id))throw new Error("Duplicate Easter Vigil record "+r.id);
    ids.add(r.id);
  }
  for(const id of ["EV-FIRE-010","EV-LUM-110","EV-LUM-130","EV-EXS-200","EV-LESS-01-READ","EV-LESS-04-RISE","EV-LIT1-400","EV-FONT-410","EV-FONT-420","EV-FONT-440","EV-REN-500","EV-REN-540","EV-LIT2-600","EV-MASS-700"]){
    if(!ids.has(id))throw new Error("Easter Vigil graph missing "+id);
  }
}

function validatePayload(payload){
  if(payload?.schema!=="ao-r33-easter-vigil-payload-v1")throw new Error("Pinned Easter Vigil payload required");
  for(const key of ["newFire","paschalCandle","lumenChristi","exsultet","prophecies","fontOverview","lauds"]){
    if(!payload.donor?.[key]?.lat)throw new Error("Easter Vigil donor text missing "+key);
  }
  if(!payload.bridge?.litanyI?.lat||!payload.bridge?.litanyII?.lat||!payload.bridge?.renewal?.lat)throw new Error("Easter Vigil bridge payload incomplete");
  if(EASTER_VIGIL_PROPHECY_READINGS.length!==4)throw new Error("Exactly four source-pinned 1962 prophecies required");
  EASTER_VIGIL_PROPHECY_READINGS.forEach((p,index)=>{
    if(p.stateId!=="EV-LESS-"+String(index+1).padStart(2,"0")+"-READ"||
       !Array.isArray(p.latinParagraphs)||p.latinParagraphs.length<2||
       !p.latinParagraphs.every(x=>typeof x==="string"&&x.length>25)||
       p.latinParagraphs.join(" ").length<600||
       typeof p.collectLatin!=="string"||p.collectLatin.length<60)
      throw new Error("Unverified Easter Vigil full Latin prophecy corpus "+(index+1));
  });
}

function lumenPairs(payload){
  const chunks=String(payload.donor.lumenChristi.lat).split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
  if(chunks.length!==3)throw new Error("Recovered Lumen Christi donor must contain three stations");
  return chunks;
}

function prophecySurface(id,payload){
  const n=Number(id.match(/EV-LESS-(\d\d)-/)?.[1]??0);
  const names=["","First Prophecy · Genesis","Second Prophecy · Exodus","Third Prophecy · Isaias","Fourth Prophecy · Deuteronomy"];
  const source=EASTER_VIGIL_PROPHECY_READINGS[n-1];
  if(!source||source.stateId!=="EV-LESS-"+String(n).padStart(2,"0")+"-READ")
    throw new Error("Easter Vigil source-owned prophecy missing for "+id);
  // Source text is a 1962 liturgical lesson, not an approved local Bible edition.
  // Canticles follow their appointed lesson without contaminating its Scripture
  // reference. The short legacy donor summary is never rendered as a lesson.
  if(id.endsWith("-READ")){
    const lines=source.latinParagraphs.map((text,i)=>
      row("EV-PROP-"+n+"-T"+(i+1),text,"TEXT",[id]));
    if(source.canticle){
      lines.push(row("EV-PROP-"+n+"-CIT",
        "Canticum · "+source.canticle.reference,"RUBRIC",[id]));
      source.canticle.latin.forEach((text,i)=>
        lines.push(row("EV-PROP-"+n+"-CANT"+(i+1),text,"CANTICLE",[id])));
    }
    return freeze({key:"PROPHECY_"+n,title:names[n],paragraphs:freeze(lines)});
  }
  if(id.endsWith("-OREM"))return freeze({key:"PROPHECY_"+n+"_PRAYER",title:"Prayer after "+names[n],paragraphs:freeze([row("EV-PROP-"+n+"-O","Oremus.","VERSICLE",[id])])});
  if(id.endsWith("-KNEEL"))return freeze({key:"PROPHECY_"+n+"_PRAYER",title:"Prayer after "+names[n],paragraphs:freeze([row("EV-PROP-"+n+"-K","Flectamus genua.","VERSICLE",[id])])});
  if(id.endsWith("-RISE"))return freeze({key:"PROPHECY_"+n+"_PRAYER",title:"Prayer after "+names[n],paragraphs:freeze([
    row("EV-PROP-"+n+"-R","Levate.","RESPONSE",[id]),
    row("EV-PROP-"+n+"-COLLECT",source.collectLatin,"COLLECT",[id])
  ])});
  throw new Error("Unknown Easter Vigil prophecy state "+id);
}

function surfaceFor(record,payload){
  const id=record.id;
  if(id==="EV-FIRE-010")return freeze({key:"NEW_FIRE",title:"Blessing of the New Fire",paragraphs:bilingualRows("EV-FIRE",payload.donor.newFire,[id])});
  if(id==="EV-FIRE-020")return freeze({key:"PASCHAL_CANDLE",title:"Preparation of the Paschal Candle",paragraphs:bilingualRows("EV-CANDLE",payload.donor.paschalCandle,[id])});
  if(id==="EV-PROC-100")return freeze({key:"PROCESSION_BEGIN",title:"Procession into the Church",paragraphs:freeze([row("EV-PROC","Processio cum Cereo paschali incipit.","RUBRIC",[id])])});
  if(/^EV-LUM-1[123]0$/.test(id)){
    const index={"EV-LUM-110":0,"EV-LUM-120":1,"EV-LUM-130":2}[id];
    return freeze({key:"LUMEN_"+(index+1),title:"Lumen Christi · "+(index+1)+" / 3",paragraphs:freeze([row("EV-LUM-"+(index+1),lumenPairs(payload)[index],"TEXT",[id])])});
  }
  if(id==="EV-EXS-200"||id==="EV-EXS-210")return freeze({key:"EXSULTET",title:"Exsultet",paragraphs:bilingualRows("EV-EXSULTET",payload.donor.exsultet,["EV-EXS-200","EV-EXS-210"])});
  if(id.startsWith("EV-LESS-"))return prophecySurface(id,payload);
  if(id==="EV-LIT1-400")return freeze({key:"LITANY_I",title:"Litany of the Saints · I",paragraphs:bilingualRows("EV-LIT1",payload.bridge.litanyI,[id])});
  if(id==="EV-FONT-410")return freeze({key:"NO_FONT",title:"No Baptismal Font Branch",paragraphs:bilingualRows("EV-NOFONT",payload.bridge.noFont,[id])});
  if(id==="EV-FONT-420")return freeze({key:"FONT_BLESSING",title:"Blessing of the Baptismal Font",paragraphs:freeze([...bilingualRows("EV-FONT",payload.bridge.font,[id]),...bilingualRows("EV-FONT-OVERVIEW",payload.donor.fontOverview,[id])])});
  if(id==="EV-BAPT-430")return freeze({key:"BAPTISMS",title:"Baptisms · if any",paragraphs:bilingualRows("EV-BAPT",payload.bridge.baptisms,[id])});
  if(id==="EV-FONT-440")return freeze({key:"BAPTISTERY",title:"Ministers at a Separate Baptistery",paragraphs:bilingualRows("EV-BAPTISTERY",payload.donor.fontOverview,[id])});
  if(id==="EV-FONT-450")return freeze({key:"FONT_RETURN",title:"Return from the Font",paragraphs:bilingualRows("EV-FONT-RETURN",payload.donor.fontOverview,[id])});
  if(id==="EV-REN-490")return freeze({key:"RENEWAL_PREP",title:"Prepare for the Baptismal Promises",paragraphs:bilingualRows("EV-REN-PREP",payload.bridge.renewal,[id])});
  if(id==="EV-REN-500")return freeze({key:"RENEWAL",title:"Renewal of Baptismal Promises",paragraphs:bilingualRows("EV-REN",payload.bridge.renewal,[id])});
  if(id==="EV-REN-510")return freeze({key:"RENUNCIATIONS",title:"Renunciations",paragraphs:bilingualRows("EV-REN-A",payload.bridge.renunciations,[id])});
  if(id==="EV-REN-520")return freeze({key:"PROFESSION",title:"Profession of Faith",paragraphs:bilingualRows("EV-REN-C",payload.bridge.professions,[id])});
  if(id==="EV-REN-530")return freeze({key:"RENEWAL_PATER",title:"Pater noster",paragraphs:bilingualRows("EV-REN-P",payload.bridge.pater,[id])});
  if(id==="EV-REN-540")return freeze({key:"RENEWAL_ASPERSION",title:"Aspersion after the Promises",paragraphs:bilingualRows("EV-REN-S",payload.bridge.aspersion,[id])});
  if(id==="EV-LIT2-600")return freeze({key:"LITANY_II",title:"Litany of the Saints · II",paragraphs:bilingualRows("EV-LIT2",payload.bridge.litanyII,[id])});
  if(id==="EV-MASS-700")return freeze({key:"MASS_HANDOFF",title:"Mass begins with the Kyrie",paragraphs:freeze([row("EV-MASS-HANDOFF","Kýrie eléison.","TEXT",[id])])});
  throw new Error("No Easter Vigil reader surface for "+id);
}

function activeGraph(graph,{fontMode,baptismPresent}){
  return freeze(graph.filter(r=>{
    if(r.branch_condition==="FONT_MODE=NONE")return fontMode==="NONE";
    if(r.branch_condition==="FONT_MODE=IN_CHURCH")return fontMode==="IN_CHURCH";
    if(r.branch_condition==="FONT_MODE=SEPARATE_BAPTISTERY")return fontMode==="SEPARATE_BAPTISTERY";
    if(r.branch_condition==="FONT_MODE!=NONE")return fontMode!=="NONE";
    if(r.branch_condition==="BAPTISM_PRESENT=true")return baptismPresent;
    return true;
  }));
}

export function buildEasterVigilReader({graph,payload,fontMode="IN_CHURCH",baptismPresent=false}={}){
  validateGraph(graph);validatePayload(payload);
  if(!FONT_MODES.has(fontMode))throw new Error("Unsupported Easter Vigil font mode: "+fontMode);
  const active=activeGraph(graph,{fontMode,baptismPresent:Boolean(baptismPresent)});
  const steps=freeze(active.map((record,index)=>{
    const surface=surfaceFor(record,payload);
    const previous=index?surfaceFor(active[index-1],payload):null;
    return freeze({
      index,total:active.length,recordId:record.id,phase:record.phase,triggerKey:record.trigger_key,
      actorScope:record.actor_scope,posture:record.posture_state??null,action:record.action_state??null,
      objectState:record.object_state??null,branchCondition:record.branch_condition??null,
      surfaceKey:surface.key,title:surface.title,paragraphs:surface.paragraphs,
      cardUpdate:!previous||previous.key!==surface.key,
      handoffToMass:record.id==="EV-MASS-700",
    });
  }));
  return freeze({
    schema:"ao-r33-easter-vigil-reader-v1",ordinaryMassGraphActive:false,
    sourceRecordCount:graph.length,activeStepCount:steps.length,fontMode,baptismPresent:Boolean(baptismPresent),steps
  });
}

export function createEasterVigilReaderController(args={}){
  const built=buildEasterVigilReader(args);let index=0;
  function project(){
    const step=built.steps[index]??null;
    return freeze({
      schema:"ao-r33-easter-vigil-reader-state-v1",supported:true,stage:"VIGIL",
      index,total:built.steps.length,atStart:index===0,atEnd:index===built.steps.length-1,
      step,posture:step?.posture??null,action:step?.action??null,objectState:step?.objectState??null,
      handoffToMass:Boolean(step?.handoffToMass),
      card:step?freeze({id:step.surfaceKey,title:step.title,paragraphs:step.paragraphs,cardUpdate:step.cardUpdate}):null
    });
  }
  function next(){index=Math.min(index+1,built.steps.length-1);return project()}
  function previous(){index=Math.max(index-1,0);return project()}
  function goToRecord(id){const hit=built.steps.findIndex(x=>x.recordId===id);if(hit>=0)index=hit;return project()}
  return freeze({schema:"ao-r33-easter-vigil-reader-controller-v1",built,project,next,previous,goToRecord});
}

function blockSlice(card,blockId){
  const meta=(card.blocks??[]).find(x=>x.blockId===blockId);
  if(!meta||meta.firstParagraphIndex==null||!meta.paragraphCount)return [];
  return card.paragraphs.slice(meta.firstParagraphIndex,meta.firstParagraphIndex+meta.paragraphCount);
}
function removeBlock(card,blockId){
  const paragraphs=card.paragraphs.filter(p=>!blockSlice(card,blockId).includes(p));
  const blocks=(card.blocks??[]).filter(b=>b.blockId!==blockId);
  return freeze({...card,paragraphs:freeze(paragraphs),blocks:freeze(blocks)});
}
function renumber(cards){
  return freeze(cards.map((card,i)=>freeze({...card,sequence:i+1})));
}

export function projectEasterVigilMassModel(baseModel,payload){
  validatePayload(payload);
  if(!baseModel?.cards?.length)throw new TypeError("Base Mass reader model required");
  const cards=[];
  for(const original of baseModel.cards){
    const sourceSeq=original.sourceSequence??original.sequence;
    if(OMITTED_MASS_SOURCE_SEQUENCES.has(sourceSeq))continue;
    let card=original;
    if(sourceSeq===22)card=removeBlock(card,"AO.SM.B069");
    if(sourceSeq===26){
      card=removeBlock(card,"AO.SM.B085");
      cards.push(card);
      cards.push(freeze({
        schema:"ao-reader-section-card-v1",sectionId:"SP.EASTER_VIGIL.15",sequence:0,
        title:"Lauds after Ablutions",part:"Communion Rite",rubricKey:"SP.EASTER_VIGIL.15",
        macroId:"EV.LAuds",paragraphs:bilingualRows("EV-LAUDS",payload.donor.lauds,[]),
        stateOnly:false,blocks:freeze([]),sourceSequence:26,liveSourceSegment:false,
        provenance:freeze({displayOnly:true,easterVigil:"LAUDS_REPLACES_COMMUNION_ANTIPHON"})
      }));
      continue;
    }
    cards.push(card);
  }
  const finalCards=renumber(cards);
  const byId=new Map(finalCards.map(x=>[x.sectionId,x]));
  const bySource=new Map();
  for(const card of finalCards){
    const key=card.sourceSectionId??(String(card.sectionId).startsWith("AO.CARD.")?card.sectionId:null);
    if(key&&!bySource.has(key))bySource.set(key,card);
  }
  function cardBySequence(n){n=Number(n);return Number.isInteger(n)&&n>=1&&n<=finalCards.length?finalCards[n-1]:null}
  function neighbor(id,dir){const c=byId.get(String(id));if(!c)return null;return cardBySequence(c.sequence+(dir==="previous"?-1:1))}
  function cardForEvent(eventId){
    if(SUPPRESSED_MASS_EVENTS.has(String(eventId)))return null;
    const hit=baseModel.cardForEvent(eventId);if(!hit)return null;
    const sourceSeq=hit.card.sourceSequence??hit.card.sequence;
    if(OMITTED_MASS_SOURCE_SEQUENCES.has(sourceSeq))return null;
    const card=bySource.get(hit.card.sectionId)??finalCards.find(x=>(x.sourceSectionId??x.sectionId)===hit.card.sectionId);
    if(!card)return null;
    return freeze({...hit,card,progress:freeze({index:card.sequence,total:finalCards.length,label:card.sequence+" / "+finalCards.length})});
  }
  return freeze({
    ...baseModel,presentationMode:baseModel.presentationMode,structureOwner:"EASTER_VIGIL_COMPOSITE_MASS",
    cards:finalCards,totalCards:finalCards.length,easterVigil:true,
    massEntry:"KYRIE",laudsSectionId:"SP.EASTER_VIGIL.15",
    suppressedMassSourceSequences:freeze([...OMITTED_MASS_SOURCE_SEQUENCES]),
    suppressedCanonicalEvents:freeze([...SUPPRESSED_MASS_EVENTS]),
    cardBySequence,cardForEvent,
    previousCard:id=>neighbor(id,"previous"),nextCard:id=>neighbor(id,"next")
  });
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data||typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}
export async function loadEasterVigilReaderData({fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-easter-vigil.v1.json",baseUrl);
  const coreUrl=new URL("../../data/mass/special-days-core.v1.1.json",baseUrl);
  const [payload,core]=await Promise.all([readJson(fetchImpl,payloadUrl,"Easter Vigil payload"),readJson(fetchImpl,coreUrl,"special-days core")]);
  const graph=core?.graphs?.EV;if(!Array.isArray(graph))throw new Error("Certified Easter Vigil graph unavailable");
  return freeze({payload,graph:freeze([...graph]),urls:freeze({payload:String(payloadUrl),core:String(coreUrl)})});
}
