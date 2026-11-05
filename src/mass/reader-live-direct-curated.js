// Direct 30-source-macro -> curated 65-family LIVE presentation.
// Unlike the historical production chain, this path never allocates a
// navigable 39-card reader model. Canon segments are consumed and split as
// source-verified stream entries. This module is opt-in until parity gates
// certify ordinary Mass, exceptional insertions, and real phone behaviour.
import { iterateVerifiedSourceFirstLiveCards } from "./reader-live-source.js";
import { curatedSourceCardCuts, CURATED_LIVE_GROUPS } from "./reader-live-curated-cards.js";
import { ORDINARY_SUNG_SOURCE_ONLY_CUES } from "./reader-source-only-cues.js";

const freeze=Object.freeze;
const canonicalId=c=>String(c.sourceSectionId??c.sectionId);

function directCard(source,chunk,sequence){
  const id=String(source.sectionId);
  const rows=source.paragraphs??[];
  const independentInsertion=source.nuptialInsertion===true || source.emberInsertion===true;
  return freeze({
    ...source,
    sectionId:independentInsertion ? id :
      "AO.LIVECURATED."+id.replace(/[^A-Za-z0-9.-]/g,"-")+"."+chunk.ordinal,
    title:chunk.title,
    sequence,
    paragraphs:freeze([...chunk.paragraphs]),
    blocks:freeze([...chunk.blocks]),
    eventIds:freeze([]),
    sourceEventIds:freeze([...(source.eventIds??[])]),
    stateOnly:chunk.stateOnly===true ||
      (chunk.paragraphs.length===0 && source.stateOnly===true),
    omittedByRite:chunk.omittedByRite??null,
    sourceSectionId:canonicalId(source),
    sourceSequence:independentInsertion ? null :
      (source.sourceSequence??source.guideSequence??source.sequence),
    guideSequence:independentInsertion ? null :
      (source.guideSequence??source.sourceSequence??source.sequence),
    curatedPresentationReview:true,
    provenance:freeze({
      ...(source.provenance??{}),
      productPresentation:"SOURCE_FIRST_CURATED_65_REVIEW",
      canonicalTextMutation:false,
    }),
  });
}

/**
 * Direct source-backed ordinary LIVE model. The only stored source model
 * is the original 30 macro cards; the logical 39 canonical source units
 * are never turned into an intermediate 39-card model/renderer.
 *
 * Exceptional insertions are deliberately not admitted here yet. They
 * retain their verified published production path until equivalence tests
 * are expanded to those overlays and rite-specific omissions.
 */
export function projectDirectOrdinaryCuratedLiveCards(baseModel,canonSourceMap){
  if(!baseModel || baseModel.totalCards!==30 ||
     baseModel.structureOwner!=="BASE_30_MACROS")
    throw new TypeError("DIRECT_CURATED_LIVE_REQUIRES_SOURCE_MACROS");
  if(!["LOW","SUNG"].includes(String(baseModel.corpusFamily).toUpperCase()))
    throw new Error("DIRECT_CURATED_LIVE_SOURCE_FAMILY_UNSUPPORTED");
  const cards=[],visited=new Set();
  let sourceUnits=0;
  for(const source of iterateVerifiedSourceFirstLiveCards(baseModel,canonSourceMap)){
    sourceUnits++;
    const id=String(source.sectionId);
    if(visited.has(id))throw new Error("DIRECT_CURATED_DUPLICATE_SOURCE_SECTION:"+id);
    visited.add(id);
    const chunks=source.paragraphs?.length
      ? curatedSourceCardCuts(source,baseModel.corpusFamily)
      : [{title:source.title,paragraphs:[],blocks:source.blocks,ordinal:1}];
    if(JSON.stringify(chunks.flatMap(c=>c.paragraphs.map(p=>p.id)))!==
       JSON.stringify((source.paragraphs??[]).map(p=>p.id)))
      throw new Error("DIRECT_CURATED_SOURCE_PARAGRAPH_DRIFT:"+id);
    for(const chunk of chunks)cards.push(directCard(source,chunk,cards.length+1));
  }
  if(sourceUnits!==39)throw new Error("DIRECT_CURATED_CANONICAL_SOURCE_UNITS_UNEXPECTED");
  for(const id of Object.keys(CURATED_LIVE_GROUPS)){
    if(!visited.has(id))throw new Error("DIRECT_CURATED_SOURCE_SECTION_MISSING:"+id);
  }
  const preGospel=cards.filter(c=>c.sourceSectionId==="AO.CARD.006").length;
  if(preGospel<1||preGospel>3)
    throw new Error("DIRECT_CURATED_PRE_GOSPEL_CARD_COUNT_UNCERTIFIED");
  const expected=65+(preGospel-1);
  if(cards.length!==expected)
    throw new Error("DIRECT_CURATED_CARD_COUNT_EXPECTED_"+expected+"_ACTUAL_"+cards.length);
  const unique=new Set(cards.map(c=>c.sectionId));
  if(unique.size!==cards.length)throw new Error("DIRECT_CURATED_DUPLICATE_CARD_ID");
  const immutable=freeze(cards);
  const byId=new Map(immutable.map(c=>[c.sectionId,c]));
  const bySequence=n=>Number.isInteger(Number(n))?immutable[Number(n)-1]??null:null;
  const neighbor=(id,delta)=>{
    const c=byId.get(String(id));
    return c?bySequence(c.sequence+delta):null;
  };
  return freeze({
    ...baseModel,
    schema:"ao-mass-reader-presentation-model-v1",
    presentationMode:"LIVE",
    structureOwner:"SOURCE_FIRST_LIVE_CURATED_65_REVIEW",
    sourceStructureOwner:"SOURCE_FIRST_LIVE",
    sourceModelTotalCards:39,
    directSourceMacroCount:30,
    directCanonicalSourceUnitCount:sourceUnits,
    directSourceToCurated:true,
    productParity48:false,
    cards:immutable,
    totalCards:immutable.length,
    cardBySequence:bySequence,
    previousCard:id=>neighbor(id,-1),
    nextCard:id=>neighbor(id,1),
    cardForEvent:undefined,
    sourceAuthorityModel:baseModel,
    sourceOnlyCueRegister:String(baseModel.corpusFamily).toUpperCase()==="SUNG"
      ? ORDINARY_SUNG_SOURCE_ONLY_CUES:null,
    curatedPresentationReview:true,
  });
}
