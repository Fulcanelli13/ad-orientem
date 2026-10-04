// R28 Good Friday distinct-rite reader.
// The 56-record GF graph is the choreography authority.
// Text is source-pinned separately; display grouping never mutates GF state identity.

const REQUIRED_COUNT=56;
const JEWISH_VARIANTS=new Set(["PRINTED_1962","HOLY_SEE_2008"]);
const VENERATION_MODES=new Set(["PERSONAL","CORPORATE_SILENT"]);

function freeze(v){return Object.freeze(v)}
function textRow(id,latin,kind="TEXT",sourceIds=[]){
  const value=String(latin??"").trim();
  if(!value)throw new Error("Good Friday text missing for "+id);
  return freeze({id,kind,latin:value,sourceIds:freeze([...sourceIds])});
}
function rows(prefix,values,sourceIds=[]){
  return freeze((values??[]).map((v,i)=>textRow(prefix+String(i+1),v,"TEXT",sourceIds)));
}
function prayerRows(prefix,intention,prayer,sourceIds=[]){
  return freeze([
    textRow(prefix+"-I",intention,"TEXT",sourceIds),
    textRow(prefix+"-O","Oremus.","VERSICLE",sourceIds),
    textRow(prefix+"-K","Flectamus genua.","VERSICLE",sourceIds),
    textRow(prefix+"-R","Levate.","RESPONSE",sourceIds),
    textRow(prefix+"-P",prayer,"TEXT",sourceIds),
  ]);
}
function recordMap(graph){return new Map(graph.map(x=>[x.id,x]))}

function validateGraph(graph){
  if(!Array.isArray(graph)||graph.length!==REQUIRED_COUNT)throw new Error("Certified 56-record Good Friday graph required");
  const seen=new Set();
  for(const row of graph){
    if(!/^GF-/.test(String(row?.id??"")))throw new Error("Invalid Good Friday record");
    if(seen.has(row.id))throw new Error("Duplicate Good Friday record "+row.id);
    seen.add(row.id);
  }
  for(const id of ["GF-PASS-320","GF-SOP-01-K","GF-SOP-09-R","GF-X-523","GF-VEN-620","GF-COM-830","GF-END-910"]){
    if(!seen.has(id))throw new Error("Good Friday graph missing "+id);
  }
}

function validatePayload(payload){
  if(payload?.schema!=="ao-r28-good-friday-payload-v1")throw new Error("Pinned Good Friday payload required");
  if((payload.solemnPrayers??[]).length!==9)throw new Error("Good Friday requires nine Solemn Prayers");
  if((payload.cross?.unveiling?.repetitions??0)!==3)throw new Error("Good Friday requires three Ecce lignum unveilings");
  if(!(payload.passion?.preDeath??[]).length || !(payload.passion?.postDeath??[]).length)throw new Error("Good Friday Passion split required");
  if(payload.passion?.deathCue!=="tradidit spiritum")throw new Error("Good Friday Passion death cue changed");
  if((payload.conclusion??[]).length!==3)throw new Error("Good Friday requires three concluding prayers");
  if(!payload.solemnPrayers?.find(x=>x.key==="CONVERSION_OF_JEWS")?.variants?.PRINTED_1962)throw new Error("Printed 1962 Jewish prayer variant missing");
}

function solemnPrayer(payload,key,jewishPrayerVariant){
  const item=payload.solemnPrayers.find(x=>x.key===key);
  if(!item)throw new Error("Unknown Good Friday solemn-prayer key "+key);
  if(key!=="CONVERSION_OF_JEWS")return item;
  const variant=item.variants?.[jewishPrayerVariant];
  if(!variant)throw new Error("Good Friday Jewish prayer variant unavailable: "+jewishPrayerVariant);
  return freeze({...item,...variant,variants:undefined});
}

function surfaceFor(record,payload,jewishPrayerVariant){
  const id=record.id;
  if(id.startsWith("GF-OPEN-"))return freeze({
    key:"OPENING",title:"Opening · Prostration and Prayer",
    paragraphs:rows("GF-OPEN-",[payload.opening.collect],["GF-OPEN-040"])
  });
  if(id==="GF-LESS-110")return freeze({
    key:"FIRST_LESSON",title:"First Lesson · Osee",
    paragraphs:freeze([
      textRow("GF-L1-T",payload.firstLesson.text,"TEXT",["GF-LESS-110"]),
      ...rows("GF-L1-R",payload.firstLesson.responsory,["GF-LESS-110"])
    ])
  });
  if(["GF-LESS-120","GF-LESS-130","GF-LESS-140"].includes(id))return freeze({
    key:"FIRST_ORATION",title:"Prayer after the First Lesson",
    paragraphs:freeze([
      textRow("GF-L1-O","Oremus.","VERSICLE",["GF-LESS-120"]),
      textRow("GF-L1-K","Flectamus genua.","VERSICLE",["GF-LESS-130"]),
      textRow("GF-L1-L","Levate.","RESPONSE",["GF-LESS-140"]),
      textRow("GF-L1-C",payload.firstLesson.collect,"TEXT",["GF-LESS-140"]),
    ])
  });
  if(id==="GF-LESS-210")return freeze({
    key:"SECOND_LESSON",title:"Second Lesson · Exodus",
    paragraphs:freeze([
      textRow("GF-L2-T",payload.secondLesson.text,"TEXT",["GF-LESS-210"]),
      ...rows("GF-L2-R",payload.secondLesson.responsory,["GF-LESS-210"])
    ])
  });
  if(id==="GF-PASS-310"||id==="GF-PASS-320")return freeze({
    key:"PASSION_BEFORE_DEATH",title:"Passion according to St John",
    paragraphs:rows("GF-PASS-A",payload.passion.preDeath,["GF-PASS-310","GF-PASS-320"])
  });
  if(id==="GF-PASS-330")return freeze({
    key:"PASSION_AFTER_DEATH",title:"Passion according to St John · Continued",
    paragraphs:rows("GF-PASS-B",payload.passion.postDeath,["GF-PASS-330"])
  });
  if(id==="GF-SOP-400")return freeze({
    key:"SOLEMN_PRAYERS_PREP",title:"The Solemn Prayers",
    paragraphs:freeze([textRow("GF-SOP-PREP","Orationes solemnes.","TEXT",["GF-SOP-400"])])
  });
  if(id==="GF-SOP-410")return freeze({
    key:"SOLEMN_PRAYERS_BEGIN",title:"The Solemn Prayers",
    paragraphs:freeze([textRow("GF-SOP-BEGIN","Oremus.","VERSICLE",["GF-SOP-410"])])
  });
  const sop=id.match(/^GF-SOP-(\d\d)-[KR]$/);
  if(sop){
    const n=Number(sop[1]);
    const base=payload.solemnPrayers[n-1];
    if(!base)throw new Error("Good Friday solemn prayer index missing "+n);
    const item=solemnPrayer(payload,base.key,jewishPrayerVariant);
    return freeze({
      key:"SOLEMN_PRAYER_"+sop[1],title:(n+". "+item.title),
      paragraphs:prayerRows("GF-SOP-"+sop[1],item.intention,item.prayer,[id])
    });
  }
  if(id==="GF-XPREP-500")return freeze({
    key:"CROSS_PREP",title:"Adoration of the Cross",
    paragraphs:freeze([textRow("GF-XPREP","The Cross is prepared for the solemn unveiling.","RUBRIC",["GF-XPREP-500"])])
  });
  if(id==="GF-X-510")return freeze({
    key:"UNVEILING_PREP",title:"Unveiling of the Cross",
    paragraphs:freeze([
      textRow("GF-X-V",payload.cross.unveiling.versicle,"VERSICLE",["GF-X-510"]),
      textRow("GF-X-R",payload.cross.unveiling.response,"RESPONSE",["GF-X-510"])
    ])
  });
  const unveiling=id.match(/^GF-X-5([23])([123])$/);
  if(unveiling){
    const isKneel=unveiling[1]==="2";
    const count=Number(unveiling[2]);
    return freeze({
      key:"UNVEILING_"+count,title:"Unveiling of the Cross · "+count+" / 3",
      paragraphs:freeze([
        textRow("GF-X-"+count+"-V",payload.cross.unveiling.versicle,"VERSICLE",[id]),
        textRow("GF-X-"+count+"-R",payload.cross.unveiling.response,"RESPONSE",[id]),
        ...(isKneel?[textRow("GF-X-"+count+"-S","Adoratio in silentio.","RUBRIC",[id])]:[])
      ])
    });
  }
  if(id.startsWith("GF-VEN-"))return freeze({
    key:"CROSS_VENERATION",title:"Veneration of the Cross",
    paragraphs:freeze([
      ...rows("GF-IMP-",payload.cross.improperia,["GF-VEN-600"]),
      ...rows("GF-CRUCEM-",payload.cross.crucemTuam,["GF-VEN-600"]),
      ...rows("GF-CRUX-",payload.cross.cruxFidelis,["GF-VEN-600"])
    ])
  });
  if(id==="GF-X-700")return freeze({
    key:"CROSS_REPLACED",title:"The Cross is Replaced on the Altar",
    paragraphs:freeze([textRow("GF-X-700-T","Crux super altare collocatur.","RUBRIC",["GF-X-700"])])
  });
  if(id==="GF-COM-800")return freeze({
    key:"COMMUNION_PREP",title:"Communion of the Presanctified",
    paragraphs:freeze([textRow("GF-COM-800-T","Praeparatio ad Communionem.","RUBRIC",["GF-COM-800"])])
  });
  if(id==="GF-COM-810")return freeze({
    key:"SACRAMENT_RETURN",title:"Return of the Blessed Sacrament",
    paragraphs:rows("GF-COM-810-",payload.cross.returnAntiphons,["GF-COM-810"])
  });
  if(id==="GF-COM-820"||id==="GF-COM-830")return freeze({
    key:"PATER_LIBERA",title:"Pater noster · Libera nos",
    paragraphs:freeze([
      textRow("GF-COM-P-I",payload.communion.paterIntro,"TEXT",["GF-COM-830"]),
      textRow("GF-COM-P",payload.communion.pater,"TEXT",["GF-COM-830"]),
      textRow("GF-COM-L",payload.communion.libera,"TEXT",["GF-COM-830"]),
      textRow("GF-COM-A",payload.communion.amen,"RESPONSE",["GF-COM-830"])
    ])
  });
  if(id==="GF-COM-840")return freeze({
    key:"IMMEDIATE_COMMUNION_PREP",title:"Preparation for Holy Communion",
    paragraphs:freeze([
      textRow("GF-COM-PER",payload.communion.perceptio,"TEXT",["GF-COM-840"]),
      textRow("GF-COM-DNSD",payload.communion.priestDomineNonSumDignus,"TEXT",["GF-COM-840"]),
      textRow("GF-COM-CORP",payload.communion.priestCommunion,"TEXT",["GF-COM-840"]),
      textRow("GF-COM-MIS",payload.communion.misereatur,"TEXT",["GF-COM-840"]),
      textRow("GF-COM-IND",payload.communion.indulgentiam,"TEXT",["GF-COM-840"]),
      textRow("GF-COM-ECCE",payload.communion.ecce,"TEXT",["GF-COM-840"]),
      textRow("GF-COM-FDNSD",payload.communion.faithfulDomineNonSumDignus,"TEXT",["GF-COM-840"])
    ])
  });
  if(id==="GF-COM-850")return freeze({
    key:"PERSONAL_COMMUNION",title:"Holy Communion",
    paragraphs:freeze([
      textRow("GF-COM-850-E",payload.communion.ecce,"TEXT",["GF-COM-850"]),
      textRow("GF-COM-850-D",payload.communion.faithfulDomineNonSumDignus,"TEXT",["GF-COM-850"])
    ])
  });
  if(id==="GF-COM-860")return freeze({
    key:"COMMUNION_COMPLETE",title:"After Holy Communion",
    paragraphs:freeze([textRow("GF-COM-860-T","Communio expleta.","RUBRIC",["GF-COM-860"])])
  });
  if(id==="GF-END-900")return freeze({
    key:"CONCLUSION",title:"Concluding Prayers",
    paragraphs:rows("GF-END-",payload.conclusion,["GF-END-900"])
  });
  if(id==="GF-END-910")return freeze({
    key:"DEPARTURE",title:"Good Friday Rites Complete",
    paragraphs:freeze([textRow("GF-END-910-T","Ministri discedunt in silentio.","RUBRIC",["GF-END-910"])])
  });
  throw new Error("No Good Friday reader surface for "+id);
}

function activeGraph(graph,{venerationMode,willReceiveCommunion}){
  return freeze(graph.filter(row=>{
    if(row.id==="GF-VEN-650")return venerationMode==="CORPORATE_SILENT";
    if(/^GF-VEN-6[1-4]0$/.test(row.id)||row.id==="GF-VEN-600")return venerationMode==="PERSONAL";
    if(row.id==="GF-COM-850")return willReceiveCommunion;
    return true;
  }));
}

export function buildGoodFridayReader({
  graph,payload,
  jewishPrayerVariant="PRINTED_1962",
  venerationMode="PERSONAL",
  willReceiveCommunion=false,
}={}){
  validateGraph(graph);
  validatePayload(payload);
  if(!JEWISH_VARIANTS.has(jewishPrayerVariant))throw new Error("Unsupported Jewish-prayer variant");
  if(!VENERATION_MODES.has(venerationMode))throw new Error("Unsupported Cross-veneration mode");
  const active=activeGraph(graph,{venerationMode,willReceiveCommunion});
  const steps=freeze(active.map((record,index)=>{
    const surface=surfaceFor(record,payload,jewishPrayerVariant);
    const previous=index?surfaceFor(active[index-1],payload,jewishPrayerVariant):null;
    const personal=record.actor_scope==="ORDINARY_FAITHFUL"||record.actor_scope==="COMMUNICANT";
    return freeze({
      index,total:active.length,
      recordId:record.id,phase:record.phase,triggerKey:record.trigger_key,
      actorScope:record.actor_scope,personalState:record.personal_state??null,
      branchCondition:record.branch_condition??null,objectState:record.object_state??null,
      posture:record.posture_state??null,
      action:record.action_state??null,
      personalOnly:personal,
      surfaceKey:surface.key,title:surface.title,paragraphs:surface.paragraphs,
      cardUpdate:!previous||previous.key!==surface.key,
    });
  }));
  return freeze({
    schema:"ao-r28-good-friday-reader-v1",
    ordinaryMassGraphActive:false,
    sourceRecordCount:graph.length,
    activeStepCount:steps.length,
    jewishPrayerVariant,venerationMode,willReceiveCommunion,
    steps,
  });
}

export function createGoodFridayReaderController(args={}){
  const built=buildGoodFridayReader(args);
  let index=0;
  function project(){
    const step=built.steps[index]??null;
    return freeze({
      schema:"ao-r28-good-friday-reader-state-v1",
      supported:true,ordinaryMassGraphActive:false,
      index,total:built.steps.length,
      atStart:index===0,atEnd:index===built.steps.length-1,
      step,
      card:step?freeze({
        id:step.surfaceKey,title:step.title,paragraphs:step.paragraphs,
        cardUpdate:step.cardUpdate,
      }):null,
      posture:step?.posture??null,
      action:step?.action??null,
      personalOnly:Boolean(step?.personalOnly),
      personalState:step?.personalState??null,
      objectState:step?.objectState??null,
    });
  }
  function next(){index=Math.min(index+1,built.steps.length-1);return project()}
  function previous(){index=Math.max(index-1,0);return project()}
  function goToRecord(id){const hit=built.steps.findIndex(x=>x.recordId===id);if(hit>=0)index=hit;return project()}
  return freeze({schema:"ao-r28-good-friday-reader-controller-v1",built,project,next,previous,goToRecord});
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data||typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}

export async function loadGoodFridayReaderData({fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-good-friday.v1.json",baseUrl);
  const coreUrl=new URL("../../data/mass/special-days-core.v1.1.json",baseUrl);
  const [payload,core]=await Promise.all([
    readJson(fetchImpl,payloadUrl,"Good Friday payload"),
    readJson(fetchImpl,coreUrl,"special-days core"),
  ]);
  const graph=core?.graphs?.GF;
  if(!Array.isArray(graph))throw new Error("Certified Good Friday graph unavailable");
  return freeze({payload,graph:freeze([...graph]),urls:freeze({payload:String(payloadUrl),core:String(coreUrl)})});
}
