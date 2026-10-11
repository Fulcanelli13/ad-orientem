// Review-only, source-first fine-grained Ordinary LIVE card projection.
// The 48-card production model remains the default until cue/Schola/posture,
// navigation and handset acceptance are certified against this projection.
// No ritual event or canonical corpus mutation is permitted.

const STANZAS=Object.freeze({
  "AO.SM.B016":Object.freeze([
    Object.freeze({end:54,title:"Gloria · Celebrant's intonation"}),
    Object.freeze({end:59,title:"Gloria · Praise and thanksgiving"}),
    Object.freeze({end:62,title:"Gloria · Jesus Christ, Son of the Father"}),
    Object.freeze({end:65,title:"Gloria · Supplication"}),
    Object.freeze({end:69,title:"Gloria · Concluding doxology"}),
  ]),
  "AO.SM.B027":Object.freeze([
    Object.freeze({end:90,title:"Credo · Celebrant's intonation"}),
    Object.freeze({end:94,title:"Credo · Father and Son"}),
    Object.freeze({end:96,title:"Credo · Incarnation"}),
    Object.freeze({end:98,title:"Credo · Passion, Resurrection and return"}),
    Object.freeze({end:102,title:"Credo · Holy Spirit"}),
    Object.freeze({end:105,title:"Credo · Church and life everlasting"}),
  ]),
});

function cueNumber(cueId){
  const m=String(cueId??"").match(/^AO\.SM\.C(\d{4})$/);
  return m?Number(m[1]):null;
}
function rowsForBlock(card,meta){
  if(meta.firstParagraphIndex==null||!meta.paragraphCount)return [];
  return card.paragraphs.slice(meta.firstParagraphIndex,meta.firstParagraphIndex+meta.paragraphCount);
}
function splitStanzas(meta,rows){
  const stages=STANZAS[meta.blockId];
  if(!stages)return [{title:meta.title,rows}];
  const groups=stages.map(x=>({title:x.title,rows:[]}));
  for(const paragraph of rows){
    const nums=(paragraph.sourceCueIds??[]).map(cueNumber).filter(n=>n!==null);
    if(!nums.length)throw new Error(meta.blockId+": stanza paragraph without exact source cue");
    const groupIndexes=new Set(nums.map(n=>stages.findIndex(stage=>n<=stage.end)));
    if(groupIndexes.size!==1||groupIndexes.has(-1)){
      throw new Error(meta.blockId+": a stanza would split a canonical source paragraph: "+paragraph.id);
    }
    groups[[...groupIndexes][0]].rows.push(paragraph);
  }
  if(groups.some(g=>!g.rows.length))throw new Error(meta.blockId+": blank stanza group");
  return groups;
}
function freezeCard(c){
  return Object.freeze({...c,paragraphs:Object.freeze([...c.paragraphs]),blocks:Object.freeze([...c.blocks]),
    eventIds:Object.freeze([...c.eventIds]),sourceEventIds:Object.freeze([...c.sourceEventIds])});
}
export function projectExpandedOrdinaryLiveCards(model){
  if(!model||!Array.isArray(model.cards))throw new TypeError("source-first LIVE model required");
  if(String(model.presentationMode).toUpperCase()!=="LIVE"||String(model.corpusFamily).toUpperCase()!=="SUNG")
    return model;
  if(!String(model.structureOwner??"").includes("SOURCE_FIRST"))
    throw new Error("Expanded Ordinary requires source-first authority");
  // A special-day structure must be explicitly reviewed, not flattened.
  if(model.totalCards!==39)return model;

  const expanded=[];
  for(const card of model.cards){
    const chunks=[];
    let pending=[];
    for(const block of card.blocks??[]){
      const rows=rowsForBlock(card,block);
      if(!rows.length){pending.push({...block,firstParagraphIndex:null,paragraphCount:0});continue;}
      const groups=splitStanzas(block,rows);
      for(let i=0;i<groups.length;i++){
        const group=groups[i];
        const blockClone={...block,firstParagraphIndex:0,paragraphCount:group.rows.length};
        chunks.push({
          title:group.title||card.title,
          paragraphs:group.rows,
          blocks:i===0?[...pending,blockClone]:[blockClone],
          blockId:block.blockId,
          stanzaIndex:i+1,
        });
        pending=[];
      }
    }
    if(!chunks.length){expanded.push(freezeCard({...card,sourceEventIds:[...(card.eventIds??[])]}));continue;}
    if(pending.length)chunks[chunks.length-1].blocks.push(...pending);

    // No paragraph is dropped, duplicated or reordered, including the
    // full 14-block Canon and any extra rubric paragraph.
    const input=(card.paragraphs??[]).map(p=>String(p.id));
    const output=chunks.flatMap(x=>x.paragraphs.map(p=>String(p.id)));
    if(JSON.stringify(input)!==JSON.stringify(output))
      throw new Error(card.sectionId+": expanded boundary lost/reordered canonical paragraphs");

    for(const chunk of chunks){
      expanded.push(freezeCard({
        ...card,
        sectionId:"AO.LIVEFINE."+
          String(card.sectionId).replace(/^AO\.CARD\./,"").replace(/[^A-Za-z0-9.-]/g,"-")+
          "."+String(chunk.blockId).replace("AO.SM.","")+
          "."+String(chunk.stanzaIndex),
        title:chunk.title,
        paragraphs:chunk.paragraphs,
        blocks:chunk.blocks,
        guideSequence:card.guideSequence??card.sourceSequence??card.sequence,
        sourceSequence:card.sourceSequence??card.sequence,
        sourceSectionId:card.sourceSectionId??card.sectionId,
        // Canonical event ownership stays with the 39-card source model.
        sourceEventIds:[...(card.eventIds??[])],
        eventIds:[],
        expandedPresentationReview:true,
        provenance:Object.freeze({
          ...(card.provenance??{}),
          productPresentation:"SOURCE_FIRST_EXPANDED_REVIEW",
          canonicalTextMutation:false,
        }),
      }));
    }
  }
  if(expanded.length<=48)throw new Error("Expanded presentation did not increase granularity");
  const cards=Object.freeze(expanded.map((card,i)=>freezeCard({...card,sequence:i+1})));
  const byId=new Map(cards.map(card=>[card.sectionId,card]));
  if(byId.size!==cards.length)throw new Error("Expanded card IDs must be unique");
  const bySequence=n=>Number.isInteger(Number(n))?cards[Number(n)-1]??null:null;
  const neighbor=(id,delta)=>{
    const current=byId.get(String(id));
    return current?bySequence(current.sequence+delta):null;
  };
  return Object.freeze({
    ...model,
    schema:"ao-mass-reader-presentation-model-v1",
    structureOwner:"SOURCE_FIRST_LIVE_EXPANDED_REVIEW",
    sourceStructureOwner:model.structureOwner,
    sourceModelTotalCards:model.totalCards,
    productParity48:false,
    cards,totalCards:cards.length,
    cardBySequence:bySequence,
    previousCard:id=>neighbor(id,-1),
    nextCard:id=>neighbor(id,1),
    cardForEvent:undefined,
    sourceAuthorityModel:model,
    expandedPresentationReview:true,
  });
}

export const EXPANDED_ORDINARY_STANZAS=STANZAS;
