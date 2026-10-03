// R17 reader structural projection.
// Owns only presentation structure: mode, card identity, current section and navigation.
// It does not own Mass text, rubrics, rails, Schola, cinematics or canonical event mutation.
//
// MISSAL/SIMPLE retain the proven 30-macro presentation model. LIVE uses the
// certified source-first Canon segmentation rather than the historical v1.65
// 20-group donor or unrecovered v1.83 48-card archaeology.

import { validateCanonSourceMap } from "./reader-canon-source.js";

export const STRUCTURE_VERSION="r19-source-first-live-v1";
export const LIVE_STRUCTURE_STATUS="SOURCE_FIRST_FULL_MASS_CERTIFIED";

const BASE_CARDS=Object.freeze([
  ["M01","Introit & Preparatory Prayers","prep",["E01","E03","E04","E05","E06","E07","E08"]],
  ["M02","Kyrie","catechumens",["E09"]],
  ["M03","Gloria","catechumens",["E10"]],
  ["M04","Collect","catechumens",["E11"]],
  ["M05","Epistle / Lesson","catechumens",["E12"]],
  ["M06","Gradual · Alleluia / Tract / Sequence","catechumens",["E13","E14","E15"]],
  ["M07","Holy Gospel","catechumens",["E16","E18","E19"]],
  ["M08","Sermon / Homily","catechumens",[]],
  ["M09","Credo","catechumens",["E20","E21"]],
  ["M10","Offertory","offertory",["E22","E23","E24","E25","E26","E27","E28"]],
  ["M11","Orate fratres & Secret","offertory",["E29","E30"]],
  ["M12","Preface","offertory",["E31"]],
  ["M13","Sanctus · Benedictus","offertory",["E32","E33"]],
  ["M14","Canon before the Consecration","canon",["E34","E35","E36","E37"]],
  ["M15","Consecration of the Sacred Host","canon",["E38","E39","E40","E41"]],
  ["M16","Consecration of the Chalice","canon",["E42","E43","E44","E45"]],
  ["M17","Canon after the Consecration","canon",["E46","E47","E48"]],
  ["M18","Canon Conclusion · Minor Elevation","canon",["E49"]],
  ["M19","Pater noster","canon",["E50"]],
  ["M20","Libera nos · Fraction · Pax Domini","canon",["E51","E52","E53"]],
  ["M21","Agnus Dei","communion",["E54"]],
  ["M22","Prayers before Communion","communion",["E55","E56"]],
  ["M23","Communion of the Priest","communion",["E57","E58","E59"]],
  ["M24","Ecce Agnus Dei & Faithful Preparation","communion",["E60","E62","E63"]],
  ["M25","Communion of the Faithful","communion",["E64","E66"]],
  ["M26","Ablutions & Communion Antiphon","communion",["E65","E66"]],
  ["M27","Postcommunion","conclusion",["E67"]],
  ["M28","Dismissal","conclusion",["E68"]],
  ["M29","Placeat & Final Blessing","conclusion",["E69"]],
  ["M30","Last Gospel","conclusion",["E70","E71"]],
].map(([id,title,part,sourceMomentRefs],index)=>Object.freeze({
  id:`AO.R17.${id}`,
  donorId:`AO.SM.${id}`,
  order:index+1,
  title,
  part,
  sourceMomentRefs:Object.freeze(sourceMomentRefs),
  canonicalBacked:sourceMomentRefs.length>0,
})));

export const PARTS=Object.freeze([
  Object.freeze({id:"prep",title:"Preparatory Rites"}),
  Object.freeze({id:"catechumens",title:"Mass of the Catechumens"}),
  Object.freeze({id:"offertory",title:"Offertory & Preface"}),
  Object.freeze({id:"canon",title:"Canon of the Mass"}),
  Object.freeze({id:"communion",title:"Communion"}),
  Object.freeze({id:"conclusion",title:"Conclusion"}),
]);

const PART_MAP=new Map(PARTS.map(x=>[x.id,x]));
const BASE_MAP=new Map(BASE_CARDS.map(x=>[x.donorId,x]));

const HISTORICAL_LIVE20_STATUS="PROVISIONAL_V1_65_DONOR_ONLY__NON_AUTHORITATIVE";

function canonBaseId(blockId){
  const n=Number(String(blockId??"").match(/B(\d+)$/)?.[1]??NaN);
  if(n>=47&&n<=51)return "AO.SM.M14";
  if(n===52)return "AO.SM.M15";
  if(n===53)return "AO.SM.M16";
  if(n>=54&&n<=58)return "AO.SM.M17";
  if(n>=59&&n<=60)return "AO.SM.M18";
  throw new Error("Unexpected certified Canon block "+blockId);
}

function liveCardsFromSource(canonSourceMap){
  const audit=validateCanonSourceMap(canonSourceMap);
  const cards=[];
  for(const card of BASE_CARDS.filter(x=>x.order<=13)){
    cards.push(Object.freeze({
      id:"AO.R19.LIVE."+card.donorId.split(".").pop(),
      title:card.title,
      part:card.part,
      baseIds:Object.freeze([card.donorId]),
      sourceMomentRefs:card.sourceMomentRefs,
      sourceFirst:false,
    }));
  }
  for(const segment of audit.segments){
    cards.push(Object.freeze({
      id:segment.id,
      title:segment.title,
      part:"canon",
      baseIds:Object.freeze([canonBaseId(segment.blockIds[0])]),
      sourceMomentRefs:Object.freeze([]),
      sourceFirst:true,
      blockIds:segment.blockIds,
      eventIds:segment.eventIds,
      cueStart:segment.cueStart,
      cueEnd:segment.cueEnd,
    }));
  }
  for(const card of BASE_CARDS.filter(x=>x.order>=19)){
    cards.push(Object.freeze({
      id:"AO.R19.LIVE."+card.donorId.split(".").pop(),
      title:card.title,
      part:card.part,
      baseIds:Object.freeze([card.donorId]),
      sourceMomentRefs:card.sourceMomentRefs,
      sourceFirst:false,
    }));
  }
  if(cards.length!==39)throw new Error("Source-first LIVE structure must contain 39 steps");
  return Object.freeze(cards);
}

export const READER_PRESENTATION_MODES=Object.freeze(["MISSAL","SIMPLE","LIVE"]);

function normalizeMode(value){
  const raw=String(value??"LIVE").toUpperCase();
  if(raw==="READ")return "MISSAL";
  if(!READER_PRESENTATION_MODES.includes(raw))throw new Error("Unsupported reader presentation mode: "+value);
  return raw;
}

export function structureSupport(prepared,modeOverride=null){
  const plan=prepared?.session?.plan;
  const resolved=prepared?.session?.resolvedMass;
  if(!plan||!resolved)return Object.freeze({supported:false,reason:"MISSING_R17_SESSION"});
  if(plan.kind!=="MASS")return Object.freeze({supported:false,reason:"DISTINCT_RITE_REQUIRES_NATIVE_RITE_PROJECTION"});
  const preceding=[...(plan.precedingGraphs??[])];
  const unsupportedPreceding=preceding.filter(x=>!["ASPERGES","PALM"].includes(x));
  if(unsupportedPreceding.length)return Object.freeze({supported:false,reason:"PRECEDING_RITE_PROJECTION_PENDING"});
  if((plan.followingGraphs??[]).length)return Object.freeze({supported:false,reason:"FOLLOWING_ACTION_PROJECTION_PENDING"});
  const structuralOverlays=(plan.overlayGraphs??[]).filter(x=>x!=="VOTIVE_PROPER");
  if(structuralOverlays.length)return Object.freeze({supported:false,reason:"STRUCTURAL_OVERLAY_PROJECTION_PENDING"});
  const mode=normalizeMode(modeOverride??prepared?.readerPreferences?.mode??resolved?.presentationMode??"LIVE");
  if(mode==="LIVE")return Object.freeze({
    supported:true,
    reason:null,
    donorStatus:LIVE_STRUCTURE_STATUS,
    historicalDonorStatus:HISTORICAL_LIVE20_STATUS,
  });
  return Object.freeze({supported:true,reason:null,donorStatus:null});
}

function cardsForMode(mode,canonSourceMap=null){
  if(normalizeMode(mode)==="LIVE"){
    if(!canonSourceMap)throw new Error("SOURCE_FIRST_LIVE_CANON_MAP_REQUIRED");
    return liveCardsFromSource(canonSourceMap);
  }
  return BASE_CARDS.map(card=>Object.freeze({
    id:`AO.R17.${normalizeMode(mode)}.${card.donorId.split(".").pop()}`,
    title:card.title,
    part:card.part,
    baseIds:Object.freeze([card.donorId]),
    sourceMomentRefs:card.sourceMomentRefs,
  }));
}

function decorate(cards){
  const totals=new Map();
  for(const c of cards)totals.set(c.part,(totals.get(c.part)??0)+1);
  const seen=new Map();
  return Object.freeze(cards.map((card,index)=>{
    const localIndex=(seen.get(card.part)??0)+1;
    seen.set(card.part,localIndex);
    const part=PART_MAP.get(card.part);
    return Object.freeze({
      ...card,
      globalIndex:index,
      globalTotal:cards.length,
      localIndex,
      localTotal:totals.get(card.part)??1,
      sectionId:card.part,
      sectionTitle:part?.title??card.part,
    });
  }));
}

export function makeStructureCards(mode,canonSourceMap=null){
  return decorate(cardsForMode(mode,canonSourceMap));
}

function cardContainsBase(card,baseId){
  return card?.baseIds?.includes(baseId);
}

export function createReaderStructureController(prepared,{canonSourceMap=null}={}){
  let mode=normalizeMode(prepared?.readerPreferences?.mode??prepared?.session?.resolvedMass?.presentationMode??"LIVE");
  let support=structureSupport(prepared,mode);
  let cards=[];
  try{cards=makeStructureCards(mode,canonSourceMap)}
  catch(error){support=Object.freeze({supported:false,reason:String(error.message),donorStatus:LIVE_STRUCTURE_STATUS});}
  let index=0;
  let anchorBaseId=cards[0]?.baseIds?.[0]??"AO.SM.M01";

  function current(){return cards[index]??null}

  function snapshot(){
    const card=current();
    return Object.freeze({
      schema:"ao-r17-reader-structure-state-v1",
      version:STRUCTURE_VERSION,
      supported:support.supported,
      reason:support.reason,
      mode,
      cardId:card?.id??null,
      title:card?.title??null,
      sectionId:card?.sectionId??null,
      sectionTitle:card?.sectionTitle??null,
      index,
      total:cards.length,
      localIndex:card?.localIndex??0,
      localTotal:card?.localTotal??0,
      atStart:index===0,
      atEnd:index>=cards.length-1,
      sourceMomentRefs:card?.sourceMomentRefs??Object.freeze([]),
      baseIds:card?.baseIds??Object.freeze([]),
      anchorBaseId,
      form:prepared?.session?.resolvedMass?.form??null,
    });
  }

  function go(nextIndex){
    if(!support.supported)return snapshot();
    index=Math.max(0,Math.min(Number(nextIndex)||0,cards.length-1));
    anchorBaseId=current()?.baseIds?.[0]??anchorBaseId;
    return snapshot();
  }

  function next(){return go(index+1)}
  function previous(){return go(index-1)}

  function setMode(nextMode){
    const candidateMode=normalizeMode(nextMode);
    const candidateSupport=structureSupport(prepared,candidateMode);
    if(!candidateSupport.supported){
      support=candidateSupport;
      return snapshot();
    }
    const priorAnchor=anchorBaseId||current()?.baseIds?.[0];
    mode=candidateMode;
    support=candidateSupport;
    cards=makeStructureCards(mode,canonSourceMap);
    const found=cards.findIndex(card=>cardContainsBase(card,priorAnchor));
    index=found>=0?found:Math.min(index,cards.length-1);
    anchorBaseId=priorAnchor??current()?.baseIds?.[0]??"AO.SM.M01";
    return snapshot();
  }

  function goToBase(baseId){
    if(!support.supported)return snapshot();
    const found=cards.findIndex(card=>cardContainsBase(card,baseId));
    if(found>=0){
      index=found;
      anchorBaseId=baseId;
    }
    return snapshot();
  }

  return Object.freeze({
    supported:support.supported,
    reason:support.reason,
    snapshot,
    next,
    previous,
    setMode,
    goToBase,
    cards:()=>cards,
  });
}
