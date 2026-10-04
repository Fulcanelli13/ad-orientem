// R31 source-order Ember / extended-reading reader insertion.
// Presentation-only wrapper: canonical MC event identity is untouched.
// Numeric L-suffix pairing is forbidden; Proper Manifest source order is authoritative.

import { assertPreGospelSourceOrderProof } from "./pre-gospel-sequence.js";
import { projectResolvedReaderText } from "./reader-projection.js";

function freeze(value){return Object.freeze(value)}
function clean(value){const s=String(value??"").trim();return s||null}

function manifest(resolvedMass){
  const p=resolvedMass?.proper?.data??resolvedMass?.proper??null;
  return p?.schema==="ao-proper-manifest-v2" ? p : null;
}

function lookupPayload(m,node){
  if(node?.textLat || node?.bodyLat || node?.paragraphs)return node;
  const ref=clean(node?.payloadRef);
  if(!ref)return null;
  const pools=[
    m?.preGospelPayloads,
    m?.payloads,
    m?.containers,
    m?.slots?.preGospelPayloads,
    m?.slots?.payloads,
  ];
  for(const pool of pools){
    if(pool && typeof pool==="object" && pool[ref]!=null)return pool[ref];
  }
  return null;
}

function normalizedParagraphs(node,payload){
  if(Array.isArray(payload?.paragraphs) && payload.paragraphs.length){
    return payload.paragraphs.map((p,index)=>({
      id:p.id??node.id+"."+String(index+1).padStart(2,"0"),
      kind:p.kind??"TEXT",
      latin:p.latin??p.lat??p.textLat??null,
      vernacular:p.vernacular??p.english??p.en??p.textEn??null,
      sourceCueIds:[],
    }));
  }
  const rows=[];
  const bodyLat=clean(payload?.bodyLat), bodyEn=clean(payload?.bodyEn??payload?.bodyEnglish);
  if(bodyLat)rows.push({id:node.id+".BODY",kind:"TEXT",latin:bodyLat,vernacular:bodyEn,sourceCueIds:[]});
  const conclusionLat=clean(payload?.conclusionLat), conclusionEn=clean(payload?.conclusionEn??payload?.conclusionEnglish);
  if(conclusionLat)rows.push({id:node.id+".CONCLUSION",kind:"TEXT",latin:conclusionLat,vernacular:conclusionEn,sourceCueIds:[]});
  if(rows.length)return rows;
  const latin=clean(payload?.textLat??payload?.latin??payload?.lat);
  const vernacular=clean(payload?.textEn??payload?.english??payload?.en??payload?.vernacular);
  if(latin)return [{id:node.id+".TEXT",kind:"TEXT",latin,vernacular,sourceCueIds:[]}];
  return [];
}

function resolveNodeParagraphs(node,m){
  const payload=lookupPayload(m,node);
  if(!payload)throw new Error(node.id+": pre-Gospel payloadRef is unresolved");
  const rows=normalizedParagraphs(node,payload);
  if(!rows.length)throw new Error(node.id+": pre-Gospel payload contains no renderable text");
  // The reader's standing language contract is vernacular-primary / Latin-toggle
  // for non-response text, so production Ember payloads must be bilingual.
  for(const row of rows){
    if(!clean(row.latin) || !clean(row.vernacular)){
      throw new Error(node.id+": pre-Gospel reader payload requires Latin and vernacular text");
    }
  }
  return projectResolvedReaderText({status:"READY",paragraphs:rows});
}

function exactFormulaStates(paragraphs){
  const latin=paragraphs.map(p=>String(p.alternate??p.primary??"")).join("\n");
  const states=[];
  if(/Flect[aá]mus\s+g[eé]nua/i.test(latin)){
    states.push(freeze({formula:"FLECTAMUS_GENUA",posture:"KNEEL",action:"SILENT_PRAYER",sourceRecordId:"LECT-INS-020"}));
  }
  if(/\bLev[aá]te\b/i.test(latin)){
    states.push(freeze({formula:"LEVATE",posture:"STAND",action:"RISE",sourceRecordId:"LECT-INS-030"}));
  }
  return freeze(states);
}

function nodeTitle(node,index){
  const n=index+1;
  switch(String(node.type??"").toUpperCase()){
    case "ORATION": return "Prayer · "+n;
    case "LESSON": return "Lesson · "+n;
    case "GRADUAL": return "Gradual";
    case "TRACT": return "Tract";
    case "ALLELUIA": return "Alleluia";
    case "SEQUENCE": return "Sequence";
    default: return "Preparatory reading";
  }
}

function nodePosture(node){
  return String(node.type??"").toUpperCase()==="LESSON" ? "SIT" : "STAND_OR_SOURCE_FORMULA";
}

export function buildEmberInsertionCards(resolvedMass){
  const m=manifest(resolvedMass);
  if(!m)return freeze([]);
  const sequence=m.preGospelSequence??m.interlectionSequence??null;
  if(!sequence?.length)return freeze([]);
  assertPreGospelSourceOrderProof(sequence,m.preGospelSequenceProvenance);
  return freeze(sequence.map((node,index)=>{
    const paragraphs=resolveNodeParagraphs(node,m);
    return freeze({
      schema:"ao-r31-ember-insertion-card-v1",
      sectionId:"AO.EMBER."+String(index+1).padStart(2,"0"),
      title:nodeTitle(node,index),
      part:"Mass of the Catechumens",
      sourceSequence:null,
      sourceSectionId:null,
      emberInsertion:true,
      emberNodeId:String(node.id),
      emberNodeType:String(node.type).toUpperCase(),
      sourceSectionKey:String(node.sourceSectionId),
      sourceOrderIndex:Number(node.sourceOrderIndex),
      sourceRef:String(node.sourceRef),
      posture:nodePosture(node),
      formulaStates:exactFormulaStates(paragraphs),
      paragraphs:freeze([...paragraphs]),
      blocks:freeze([]),
      provenance:freeze({
        displayOnly:true,
        orderAuthority:"SOURCE_ORDER",
        canonicalEventMutation:false,
        sourceRef:String(node.sourceRef),
      }),
    });
  }));
}

export function projectEmberInsertionModel(model,resolvedMass){
  if(!model?.cards || !Array.isArray(model.cards))throw new TypeError("Reader model required");
  const m=manifest(resolvedMass);
  const required=Boolean(
    resolvedMass?.overlays?.includes("EMBER_LESSONS") ||
    m?.requirements?.preGospelSequence===true
  );
  const inserts=buildEmberInsertionCards(resolvedMass);
  if(!required && inserts.length===0)return model;
  if(required && inserts.length===0)throw new Error("EMBER_LESSONS requires a resolved source-ordered preGospelSequence");

  const epistleIndex=model.cards.findIndex(card=>
    card.sectionId==="AO.CARD.005" || card.sourceSectionId==="AO.CARD.005"
  );
  if(epistleIndex<0)throw new Error("Ordinary Epistle card unavailable for Ember insertion");

  const raw=[...model.cards.slice(0,epistleIndex),...inserts,...model.cards.slice(epistleIndex)];
  const cards=freeze(raw.map((card,index)=>freeze({...card,sequence:index+1})));
  const byId=new Map(cards.map(card=>[card.sectionId,card]));

  function cardBySequence(sequence){
    const n=Number(sequence);
    return Number.isInteger(n)&&n>=1&&n<=cards.length?cards[n-1]:null;
  }
  function neighbor(sectionId,direction){
    const card=byId.get(String(sectionId));
    if(!card)return null;
    const delta=direction==="previous"?-1:direction==="next"?1:0;
    return delta?cardBySequence(card.sequence+delta):card;
  }
  function cardForEvent(eventId){
    const hit=model.cardForEvent(eventId);
    if(!hit)return null;
    const card=byId.get(hit.card.sectionId) ??
      cards.find(x=>x.sourceSectionId===hit.card.sectionId);
    if(!card)return hit;
    return freeze({
      ...hit,
      card,
      progress:freeze({index:card.sequence,total:cards.length,label:card.sequence+" / "+cards.length}),
    });
  }

  return freeze({
    ...model,
    structureOwner:model.structureOwner+"+SOURCE_ORDER_PRE_GOSPEL",
    cards,
    totalCards:cards.length,
    emberInsertionCount:inserts.length,
    emberSourceOrder:freeze(inserts.map(x=>x.sourceSectionKey)),
    cardBySequence,
    cardForEvent,
    previousCard:sectionId=>neighbor(sectionId,"previous"),
    nextCard:sectionId=>neighbor(sectionId,"next"),
  });
}
