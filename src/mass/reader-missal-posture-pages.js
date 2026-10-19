// Posture-aware MISSAL pagination is a presentation-only overlay.
// Source cue timing comes exclusively from the existing R17 posture controller.
// A card swipe does not itself assert an observed congregation movement.
const SUSTAINED=new Set(["STAND","SIT","KNEEL"]);
const CUE=/^AO\.SM\.C\d{4}$/;

function transitionAt(paragraph,cueState,preferences){
  if(!cueState?.supported)return null;
  // MY_LOCAL without a separately confirmed local timeline must not pretend
  // that the generic Sung source register describes this congregation.
  if(String(preferences?.postureProfile??"").toUpperCase()==="MY_LOCAL")return null;
  const ids=(paragraph?.sourceCueIds??[]).map(String).filter(id=>CUE.test(id));
  // Never split inside one bilingual paragraph containing multiple cue IDs.
  if(ids.length!==1)return null;
  const cueId=ids[0],source=cueState.project(cueId);
  const value=source?.posture?.value??source?.posture?.label;
  if(source?.supported!==true || source.postureTransition!==true ||
    !source.posture?.persistent || !SUSTAINED.has(value))return null;
  return Object.freeze({
    cueId,value,sourcePostureId:source.posture.sourcePostureId??null,
    owner:"R17_SUNG_SOURCE_POSTURE_TRANSITION",
    advisory:String(preferences?.postureProfile??"FOLLOW_CONGREGATION").toUpperCase()==="FOLLOW_CONGREGATION",
  });
}

function slicedBlocks(card,start,end){
  const out=[];
  for(const block of card.blocks??[]){
    const at=block.firstParagraphIndex,count=block.paragraphCount??0;
    if(at==null||count===0){
      if(start===0)out.push(block);
      continue;
    }
    const from=Math.max(start,at),until=Math.min(end,at+count);
    if(until<=from)continue;
    out.push(Object.freeze({
      ...block,firstParagraphIndex:from-start,paragraphCount:until-from,
      ...(from!==at||until!==at+count
        ? {displayFragment:true,sourceBlockOffset:from-at} : {}),
    }));
  }
  return Object.freeze(out);
}

function splitCard(card,cueState,preferences){
  const paragraphs=card.paragraphs??[];
  if(paragraphs.length===0)return [{...card,postureEntry:null}];
  const boundaries=[];
  for(let i=0;i<paragraphs.length;i++){
    const entry=transitionAt(paragraphs[i],cueState,preferences);
    if(entry)boundaries.push({index:i,entry});
  }
  const atStart=boundaries.find(b=>b.index===0)?.entry??null;
  const cuts=boundaries.filter(b=>b.index>0);
  if(!cuts.length)return [{...card,postureEntry:atStart}];
  const positions=[{index:0,entry:atStart},...cuts,{index:paragraphs.length,entry:null}];
  const pieces=[];
  for(let i=0;i<positions.length-1;i++){
    const start=positions[i].index,end=positions[i+1].index;
    if(end<=start)throw new Error("MISSAL_POSTURE_EMPTY_PAGE:"+card.sectionId);
    const part=i===0?"":".p"+String(i+1);
    pieces.push(Object.freeze({
      ...card,
      sectionId:String(card.sectionId)+part,
      title:i===0?card.title:String(card.title)+" · continued",
      paragraphs:Object.freeze(paragraphs.slice(start,end)),
      blocks:slicedBlocks(card,start,end),
      sourceParagraphStart:start,sourceParagraphEnd:end,
      postureEntry:positions[i].entry,
      posturePage:true,
      eventIds:Object.freeze([]),
      provenance:Object.freeze({...card.provenance,displayOnly:true,canonicalTextMutation:false}),
    }));
  }
  return pieces;
}

/**
 * Split at a verified sustained R17 posture transition that begins a source
 * paragraph. Preserve every paragraph, paired translation, source cue and
 * canonical block owner. Brief gestures and unresolved observational anchors
 * can never create a page. No clock advance and no LIVE card mutation.
 */
export function projectPostureAwareMissalCards(model,{cueState=null,preferences=null}={}){
  if(!model||!Array.isArray(model.cards))throw new TypeError("MISSAL model required");
  if(String(model.presentationMode??"").toUpperCase()!=="MISSAL"||
     !cueState?.supported)return model;
  const pieces=model.cards.flatMap(card=>splitCard(card,cueState,preferences));
  // The next physical posture is an advisory reading cue, not an observed
  // event. The user controls when to turn each bilingual page.
  const final=Object.freeze(pieces.map((card,i)=>Object.freeze({
    ...card,sequence:i+1,nextPosture:pieces[i+1]?.postureEntry??null,
  })));
  const byId=new Map(final.map(card=>[card.sectionId,card]));
  const neighbor=(id,delta)=>{
    const card=byId.get(String(id));
    return card?final[card.sequence-1+delta]??null:null;
  };
  return Object.freeze({
    ...model,
    schema:"ao-mass-reader-presentation-model-v1",
    structureOwner:"CANONICAL_MISSAL_POSTURE_AWARE_PRAYER_PAGES",
    sourceStructureOwner:model.structureOwner,
    sourceModelTotalCards:model.sourceModelTotalCards??model.totalCards,
    cards:final,totalCards:final.length,
    cardBySequence:n=>Number.isInteger(Number(n))?final[Number(n)-1]??null:null,
    previousCard:id=>neighbor(id,-1),nextCard:id=>neighbor(id,1),
    cardForEvent:undefined,
    posturePageProjection:true,
  });
}
