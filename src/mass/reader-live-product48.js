// Source-first 48-step LIVE presentation projection.
//
// This is a PRODUCT PRESENTATION layer only.
// It does not claim recovery of the lost historical v1.83 C01-C48 identifiers,
// does not mutate canonical Mass events, and does not replace the 39-step source model.
//
// The projection combines:
// - the certified 39-step source-first LIVE model (including 14 Canon blocks), and
// - recovered v1.83 semantic decompression boundaries outside the Canon,
// using canonical source blocks wherever historical adjacent-block ownership is
// incomplete. The result is exactly 48 presentation steps for ordinary Sung LIVE.

const TARGETS=Object.freeze({
  "AO.CARD.010":Object.freeze({
    groups:Object.freeze([
      Object.freeze({suffix:"A",title:"Offertory · Bread and Chalice preparation",blocks:Object.freeze(["AO.SM.B028","AO.SM.B029","AO.SM.B030","AO.SM.B031","AO.SM.B032"])}),
      Object.freeze({suffix:"B",title:"Offerimus tibi · Incensation",blocks:Object.freeze(["AO.SM.B033","AO.SM.B034","AO.SM.B035","AO.SM.B036"])}),
      Object.freeze({suffix:"C",title:"Lavabo · Suscipe sancta Trinitas",blocks:Object.freeze(["AO.SM.B037","AO.SM.B038"])}),
    ]),
    evidence:"RECOVERED_V181_B032_B033_AND_B036_B037",
  }),
  "AO.CARD.020":Object.freeze({
    groups:Object.freeze([
      Object.freeze({suffix:"A",title:"Libera nos",blocks:Object.freeze(["AO.SM.B064"])}),
      Object.freeze({suffix:"B",title:"Libera nos · Conclusion",blocks:Object.freeze(["AO.SM.B065"])}),
      Object.freeze({suffix:"C",title:"Pax Domini",blocks:Object.freeze(["AO.SM.B066"])}),
      Object.freeze({suffix:"D",title:"Haec commixtio",blocks:Object.freeze(["AO.SM.B067"])}),
    ]),
    evidence:"SOURCE_FIRST_BLOCKS_AROUND_RECOVERED_V181_B064_B066_BOUNDARY",
  }),
  "AO.CARD.022":Object.freeze({
    groups:Object.freeze([
      Object.freeze({suffix:"A",title:"Prayers before Communion · Panem caelestem",blocks:Object.freeze(["AO.SM.B069","AO.SM.B070","AO.SM.B071","AO.SM.B072"])}),
      Object.freeze({suffix:"B",title:"Domine, non sum dignus · Priest",blocks:Object.freeze(["AO.SM.B073"])}),
    ]),
    evidence:"RECOVERED_FROZEN_LIVE_B072_B073_BOUNDARY",
  }),
  "AO.CARD.023":Object.freeze({
    groups:Object.freeze([
      Object.freeze({suffix:"A",title:"Communion of the Priest · Sacred Host",blocks:Object.freeze(["AO.SM.B074"])}),
      Object.freeze({suffix:"B",title:"Quid retribuam Domino",blocks:Object.freeze(["AO.SM.B075"])}),
      Object.freeze({suffix:"C",title:"Communion of the Priest · Precious Blood",blocks:Object.freeze(["AO.SM.B076"])}),
    ]),
    evidence:"SOURCE_FIRST_BLOCKS_AROUND_RECOVERED_V181_B074_B076_BOUNDARY",
  }),
  "AO.CARD.029":Object.freeze({
    groups:Object.freeze([
      Object.freeze({suffix:"A",title:"Placeat tibi, sancta Trinitas",blocks:Object.freeze(["AO.SM.B091"])}),
      Object.freeze({suffix:"B",title:"Final Blessing",blocks:Object.freeze(["AO.SM.B092"])}),
    ]),
    evidence:"RECOVERED_FROZEN_LIVE_B091_B092_BOUNDARY",
  }),
});

function sourceSectionId(card){
  return String(card?.sourceSectionId??card?.sectionId??"");
}

function freezeCard(card){
  return Object.freeze({
    ...card,
    paragraphs:Object.freeze([...(card.paragraphs??[])]),
    blocks:Object.freeze([...(card.blocks??[])]),
    eventIds:Object.freeze([...(card.eventIds??[])]),
  });
}

function paragraphRangeForBlock(card,meta){
  if(meta?.firstParagraphIndex==null || !meta?.paragraphCount)return [];
  return card.paragraphs.slice(meta.firstParagraphIndex,meta.firstParagraphIndex+meta.paragraphCount);
}

function splitCard(card,config){
  const byId=new Map((card.blocks??[]).map(meta=>[meta.blockId,meta]));
  const expected=(card.blocks??[]).map(meta=>meta.blockId);
  const declared=config.groups.flatMap(group=>group.blocks);
  if(JSON.stringify(expected)!==JSON.stringify(declared)){
    throw new Error(sourceSectionId(card)+": SOURCE_FIRST_48 block coverage changed: expected "+expected.join(",")+" got "+declared.join(","));
  }

  return config.groups.map(group=>{
    const paragraphs=[];
    const blocks=[];
    for(const blockId of group.blocks){
      const meta=byId.get(blockId);
      if(!meta)throw new Error(sourceSectionId(card)+": SOURCE_FIRST_48 missing block "+blockId);
      const rows=paragraphRangeForBlock(card,meta);
      const firstParagraphIndex=rows.length?paragraphs.length:null;
      paragraphs.push(...rows);
      blocks.push(Object.freeze({...meta,firstParagraphIndex,paragraphCount:rows.length}));
    }
    if(!paragraphs.length && !blocks.some(x=>x.stateOnly)){
      throw new Error(sourceSectionId(card)+": SOURCE_FIRST_48 refusing blank presentation step "+group.suffix);
    }
    const sourceId=sourceSectionId(card);
    return freezeCard({
      ...card,
      sectionId:"AO.LIVE48."+sourceId.replace("AO.CARD.","")+"."+group.suffix,
      title:group.title,
      sequence:null,
      sourceSequence:card.sourceSequence??card.sequence,
      guideSequence:card.guideSequence??card.sourceSequence??card.sequence,
      sourceSectionId:sourceId,
      paragraphs,
      blocks,
      productPresentation48:true,
      historicalV183CardId:null,
      historicalV183IdentityClaim:false,
      presentationEvidence:config.evidence,
      provenance:Object.freeze({
        ...(card.provenance??{}),
        productPresentation:"SOURCE_FIRST_48_STEP",
        historicalV183IdentityClaim:false,
        canonicalTextMutation:false,
      }),
    });
  });
}

export function projectSourceFirst48Presentation(model){
  if(!model || !Array.isArray(model.cards))throw new TypeError("Source-first reader model required");
  if(String(model.presentationMode??"").toUpperCase()!=="LIVE" || String(model.corpusFamily??"").toUpperCase()!=="SUNG"){
    return model;
  }
  if(!String(model.structureOwner??"").includes("SOURCE_FIRST")){
    throw new Error("SOURCE_FIRST_48 requires certified source-first LIVE model");
  }

  const seenTargets=new Set();
  const expanded=[];
  for(const card of model.cards){
    const sourceId=sourceSectionId(card);
    const config=TARGETS[sourceId];
    if(!config){
      expanded.push(freezeCard(card));
      continue;
    }
    if(seenTargets.has(sourceId))throw new Error("SOURCE_FIRST_48 duplicate target "+sourceId);
    seenTargets.add(sourceId);
    expanded.push(...splitCard(card,config));
  }
  for(const id of Object.keys(TARGETS)){
    if(!seenTargets.has(id))throw new Error("SOURCE_FIRST_48 target absent from model: "+id);
  }

  const cards=Object.freeze(expanded.map((card,index)=>freezeCard({...card,sequence:index+1})));
  const ordinarySourceCount=39;
  const ordinaryPresentationCount=48;
  if(model.totalCards===ordinarySourceCount && cards.length!==ordinaryPresentationCount){
    throw new Error("Ordinary Sung LIVE SOURCE_FIRST_48 must contain exactly 48 presentation steps; got "+cards.length);
  }
  if(cards.length!==model.totalCards+9){
    throw new Error("SOURCE_FIRST_48 projection must add exactly nine presentation steps");
  }

  const byId=new Map(cards.map(card=>[card.sectionId,card]));
  function cardBySequence(sequence){
    const n=Number(sequence);
    return Number.isInteger(n)&&n>=1&&n<=cards.length?cards[n-1]:null;
  }
  function neighbor(sectionId,direction){
    const current=byId.get(String(sectionId));
    if(!current)return null;
    const delta=direction==="previous"?-1:direction==="next"?1:0;
    return delta?cardBySequence(current.sequence+delta):current;
  }

  return Object.freeze({
    ...model,
    schema:"ao-mass-reader-presentation-model-v1",
    structureOwner:"SOURCE_FIRST_LIVE_PRODUCT_48",
    sourceStructureOwner:model.structureOwner,
    sourceModelTotalCards:model.totalCards,
    historicalV183ExpectedCards:48,
    historicalV183IdentityClaim:false,
    productParity48:true,
    cards,
    totalCards:cards.length,
    cardBySequence,
    previousCard:sectionId=>neighbor(sectionId,"previous"),
    nextCard:sectionId=>neighbor(sectionId,"next"),
    sourceAuthorityModel:model,
  });
}

export const SOURCE_FIRST_48_TARGETS=TARGETS;
