import { createCanonSourceResolver } from "./reader-canon-source.js";

function freezeCard(card){
  return Object.freeze({
    ...card,
    paragraphs:Object.freeze([...(card.paragraphs??[])]),
    blocks:Object.freeze([...(card.blocks??[])]),
    eventIds:Object.freeze([...(card.eventIds??[])]),
  });
}

function canonCardFromBlock(baseCard,segment,sequence){
  // Canon conclusion spans B060 (minor elevation) and B061 (Per omnia / Amen).
  // Keep both source blocks on the existing 14th Canon presentation card:
  // no extra LIVE card, no duplicated response on Pater noster.
  const sourceBlocks=segment.blockIds.map(blockId=>{
    const meta=(baseCard.blocks??[]).find(block=>block.blockId===blockId);
    if(!meta)throw new Error(segment.id+": source block "+blockId+" not found in base reader model");
    if(meta.firstParagraphIndex==null || !meta.paragraphCount){
      throw new Error(segment.id+": source block "+blockId+" has no reader paragraphs");
    }
    return meta;
  });
  const paragraphs=[];
  const blocks=[];
  for(const meta of sourceBlocks){
    const rows=baseCard.paragraphs.slice(meta.firstParagraphIndex,meta.firstParagraphIndex+meta.paragraphCount);
    blocks.push(Object.freeze({...meta,firstParagraphIndex:paragraphs.length,paragraphCount:rows.length}));
    paragraphs.push(...rows);
  }
  if(!paragraphs.length)throw new Error(segment.id+": source block projected blank");
  const sourceCueIds=new Set(paragraphs.flatMap(p=>p.sourceCueIds??[]).map(String));
  if(!sourceCueIds.has(segment.cueStart) || !sourceCueIds.has(segment.cueEnd)){
    throw new Error(segment.id+": projected block lost certified cue boundary");
  }
  return freezeCard({
    ...baseCard,
    sectionId:segment.id,
    sequence,
    title:segment.title,
    guideSequence:baseCard.sequence,
    sourceSequence:baseCard.sequence,
    sourceSectionId:baseCard.sectionId,
    paragraphs,
    blocks,
    eventIds:segment.eventIds,
    cueStart:segment.cueStart,
    cueEnd:segment.cueEnd,
    liveSourceSegment:true,
    provenance:Object.freeze({
      ...(baseCard.provenance??{}),
      liveStructure:"SOURCE_FIRST_CANON",
      canonSegmentId:segment.id,
      sourceBlockId:segment.blockIds[0],
      sourceBlockIds:Object.freeze([...segment.blockIds]),
      canonicalTextMutation:false,
    }),
  });
}

function retainedCard(card,sequence){
  return freezeCard({
    ...card,
    sequence,
    guideSequence:card.sequence,
    sourceSequence:card.sequence,
    sourceSectionId:card.sectionId,
    liveSourceSegment:false,
    provenance:Object.freeze({
      ...(card.provenance??{}),
      liveStructure:"BASE_MACRO_RETAINED",
      canonicalTextMutation:false,
    }),
  });
}

export function projectSourceFirstLiveModel(baseModel,canonSourceMap){
  if(!baseModel || baseModel.totalCards!==30)throw new TypeError("30-card base reader model required");
  const resolver=createCanonSourceResolver(canonSourceMap);
  const canonBase=baseModel.cards.filter(card=>card.sequence>=14&&card.sequence<=18);
  const blockOwner=new Map();
  for(const card of canonBase){
    for(const block of card.blocks??[]){
      if(blockOwner.has(block.blockId))throw new Error("Duplicate LIVE source block owner "+block.blockId);
      blockOwner.set(block.blockId,card);
    }
  }

  const cards=[];
  for(const card of baseModel.cards.filter(x=>x.sequence<=13)){
    cards.push(retainedCard(card,cards.length+1));
  }
  for(const segment of resolver.segments){
    const owner=blockOwner.get(segment.blockIds[0]);
    if(!owner)throw new Error(segment.id+": certified Canon block has no base-card owner");
    for(const blockId of segment.blockIds){
      if(blockOwner.get(blockId)!==owner)throw new Error(segment.id+": Canon source blocks must share their base-macro owner: "+blockId);
    }
    cards.push(canonCardFromBlock(owner,segment,cards.length+1));
  }
  for(const card of baseModel.cards.filter(x=>x.sequence>=19)){
    cards.push(retainedCard(card,cards.length+1));
  }

  if(cards.length!==39)throw new Error("Source-first LIVE must contain exactly 39 presentation steps");
  const frozen=Object.freeze(cards);
  const bySection=new Map(frozen.map(card=>[card.sectionId,card]));
  const bySourceSection=new Map(
    frozen.filter(card=>!card.liveSourceSegment).map(card=>[card.sourceSectionId,card])
  );
  const byCanonEvent=new Map();
  for(const card of frozen.filter(card=>card.liveSourceSegment)){
    for(const eventId of card.eventIds)byCanonEvent.set(eventId,card);
  }

  function cardBySequence(sequence){
    const n=Number(sequence);
    return Number.isInteger(n)&&n>=1&&n<=frozen.length ? frozen[n-1] : null;
  }
  function cardForEvent(eventId){
    const id=String(eventId??"");
    const canon=byCanonEvent.get(id);
    if(canon)return Object.freeze({
      canonicalEventId:id,
      section:Object.freeze({
        sectionId:canon.sectionId,
        sequence:canon.sequence,
        name:canon.title,
        eventIds:canon.eventIds,
        canonicalAuthority:false,
      }),
      card:canon,
      progress:Object.freeze({index:canon.sequence,total:frozen.length,label:canon.sequence+" / "+frozen.length}),
    });
    const baseHit=baseModel.cardForEvent(id);
    if(!baseHit)return null;
    const card=bySourceSection.get(baseHit.card.sectionId);
    if(!card)return null;
    return Object.freeze({
      canonicalEventId:id,
      section:baseHit.section,
      card,
      progress:Object.freeze({index:card.sequence,total:frozen.length,label:card.sequence+" / "+frozen.length}),
    });
  }
  function neighbor(sectionId,direction){
    const card=bySection.get(String(sectionId));
    if(!card)return null;
    const delta=direction==="previous"?-1:direction==="next"?1:0;
    return delta?cardBySequence(card.sequence+delta):card;
  }

  return Object.freeze({
    ...baseModel,
    schema:"ao-mass-reader-model-v1",
    presentationMode:"LIVE",
    structureOwner:"SOURCE_FIRST_LIVE",
    canonSourceStatus:resolver.status,
    historical48Required:resolver.historical48Required,
    cards:frozen,
    totalCards:frozen.length,
    cardBySequence,
    cardForEvent,
    previousCard:sectionId=>neighbor(sectionId,"previous"),
    nextCard:sectionId=>neighbor(sectionId,"next"),
  });
}
