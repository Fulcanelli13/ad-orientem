// R32 Nuptial reader insertion.
// Recovered from the v43.74/v16 MATRIMONIUM reader contract.
// Adds presentation-only prayer cards at the two 1962 Missal insertion points.

function freeze(value){return Object.freeze(value)}

function paragraph(raw){
  if(!raw?.lat || !raw?.en)throw new Error("Nuptial payload requires Latin and English text");
  return freeze({
    id:String(raw.id),
    kind:String(raw.kind??"TEXT"),
    primary:String(raw.en),
    secondary:null,
    alternate:String(raw.lat),
    replaceOnToggle:true,
    active:false,
    sourceCueIds:freeze([]),
    french:raw.fr?String(raw.fr):null,
    sourceDirective:raw.sourceDirective??null,
  });
}

export function validateNuptialReaderPayload(data){
  if(data?.schema!=="ao-r32-reader-nuptial-v1")throw new Error("Unexpected Nuptial reader payload schema");
  if(data?.status!=="SOURCE_RECOVERED")throw new Error("Nuptial reader payload is not source-recovered");
  if(!Array.isArray(data.cards)||data.cards.length!==3)throw new Error("Nuptial reader requires exactly three recovered insertions");
  const ids=new Set();
  for(const card of data.cards){
    if(ids.has(card.id))throw new Error("Duplicate Nuptial reader card "+card.id);
    ids.add(card.id);
    if(!card.insertionId)throw new Error(card.id+": insertionId required");
    if(!Array.isArray(card.paragraphs)||!card.paragraphs.length)throw new Error(card.id+": prayer text required");
    if(card.faithfulPosture!=null)throw new Error(card.id+": spouse posture leaked into faithful posture");
    if(card.faithfulGesture!=null)throw new Error(card.id+": spouse action leaked into faithful gesture");
  }
  const expected=[
    "FIRST_NUPTIAL_BLESSING_AFTER_PATER",
    "DEUS_QUI_POTESTATE_NUPTIAL_BLESSING",
    "FINAL_BLESSING_OVER_SPOUSES",
  ];
  if(expected.some((id,i)=>data.cards[i]?.insertionId!==id))throw new Error("Nuptial insertion order changed");
  return true;
}

function makeCard(raw){
  return freeze({
    schema:"ao-r32-nuptial-reader-card-v1",
    sectionId:String(raw.id),
    title:String(raw.title),
    part:raw.id==="AO.NUPTIAL.03"?"Conclusion":"Canon of the Mass",
    sourceSequence:null,
    sourceSectionId:null,
    nuptialInsertion:true,
    insertionId:String(raw.insertionId),
    actor:raw.actor??"PRIEST",
    spouseState:raw.spouseState??null,
    faithfulPosture:null,
    faithfulGesture:null,
    followingActorAction:raw.followingActorAction??null,
    admonitionTextPolicy:raw.admonitionTextPolicy??null,
    paragraphs:freeze(raw.paragraphs.map(paragraph)),
    blocks:freeze([]),
    provenance:freeze({
      displayOnly:true,
      owner:"NUPTIAL_SOURCE_INSERTION",
      canonicalEventMutation:false,
      sourceAuthority:"MR62-NUP",
    }),
  });
}

function findBySource(cards,sectionId){
  return cards.findIndex(card=>card.sectionId===sectionId || card.sourceSectionId===sectionId);
}

function rebuild(model,cards){
  const normalized=freeze(cards.map((card,index)=>freeze({
    ...card,
    sourceSequence:card.nuptialInsertion?null:(card.sourceSequence??card.sequence),
    sequence:index+1,
  })));
  const byId=new Map(normalized.map(card=>[card.sectionId,card]));
  function cardBySequence(sequence){
    const n=Number(sequence);
    return Number.isInteger(n)&&n>=1&&n<=normalized.length?normalized[n-1]:null;
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
      normalized.find(x=>x.sourceSectionId===hit.card.sectionId);
    if(!card)return hit;
    return freeze({
      ...hit,
      card,
      progress:freeze({index:card.sequence,total:normalized.length,label:card.sequence+" / "+normalized.length}),
    });
  }
  return freeze({
    ...model,
    structureOwner:model.structureOwner+"+NUPTIAL_INSERTIONS",
    cards:normalized,
    totalCards:normalized.length,
    nuptialInsertionCount:3,
    cardBySequence,
    cardForEvent,
    previousCard:sectionId=>neighbor(sectionId,"previous"),
    nextCard:sectionId=>neighbor(sectionId,"next"),
  });
}

export function projectNuptialInsertionModel(model,resolvedMass,nuptialData){
  if(!model?.cards || !Array.isArray(model.cards))throw new TypeError("Reader model required");
  const active=Boolean(resolvedMass?.overlays?.includes("NUPTIAL"));
  if(!active)return model;
  if(!nuptialData)throw new Error("NUPTIAL_READER_PAYLOAD_REQUIRED");
  validateNuptialReaderPayload(nuptialData);

  const [firstRaw,secondRaw,finalRaw]=nuptialData.cards;
  const first=makeCard(firstRaw),second=makeCard(secondRaw),final=makeCard(finalRaw);
  const cards=[...model.cards];

  const paterIndex=findBySource(cards,"AO.CARD.019");
  if(paterIndex<0)throw new Error("Nuptial insertion target Pater noster unavailable");
  cards.splice(paterIndex+1,0,first,second);

  const dismissalIndex=findBySource(cards,"AO.CARD.028");
  if(dismissalIndex<0)throw new Error("Nuptial insertion target Dismissal unavailable");
  cards.splice(dismissalIndex+1,0,final);

  return rebuild(model,cards);
}
