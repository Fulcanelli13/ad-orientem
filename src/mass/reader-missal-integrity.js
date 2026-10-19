// Fail-closed audit of Missal *presentation* pagination. This does not
// certify the historical accuracy/completeness of the upstream Proper or
// special-rite witness; it certifies that pagination has not changed it.
function fail(message){throw new Error("MISSAL_PAGE_INTEGRITY:"+message)}
function rows(card){return card?.paragraphs??[]}
function blocks(card){return card?.blocks??[]}
function key(card){return String(card?.posturePageSourceCardId??card?.sectionId??"")}

/**
 * Verify exact paragraph identity (and therefore Latin, translation, rubric
 * metadata, source cues and word boundaries), card order, unique navigation IDs
 * and local source-block ownership across every generated page.
 */
export function auditMissalPageIntegrity(original,presented){
  if(!Array.isArray(original?.cards)||!Array.isArray(presented?.cards))
    throw new TypeError("Both source and presentation models required");
  const existing=new Set();
  let cursor=0,splitSourceCards=0,fragments=0,paragraphCount=0,blockCount=0;
  for(const card of original.cards){
    const outputs=[];
    while(cursor<presented.cards.length &&
      key(presented.cards[cursor])===String(card.sectionId)){
      const output=presented.cards[cursor++];
      if(existing.has(output.sectionId))fail("DUPLICATE_NAV_ID:"+output.sectionId);
      existing.add(output.sectionId);
      outputs.push(output);
    }
    if(outputs.length===0)fail("MISSING_CARD:"+card.sectionId);
    if(outputs.length>1)splitSourceCards++;
    fragments+=outputs.length-1;
    const a=rows(card),b=outputs.flatMap(rows);
    if(a.length!==b.length)fail("PARAGRAPH_COUNT:"+card.sectionId);
    for(let i=0;i<a.length;i++){
      if(a[i]!==b[i])fail("PARAGRAPH_CONTENT_OR_ORDER:"+card.sectionId+":"+i);
      paragraphCount++;
    }
    const expected=blocks(card),actual=outputs.flatMap(blocks);
    const owners=expected.map(b=>String(b.blockId));
    const ordinal=new Map(owners.map((id,i)=>[id,i]));
    if(ordinal.size!==owners.length)fail("SOURCE_DUPLICATE_BLOCK:"+card.sectionId);
    let lastIndex=-1;
    for(const block of actual){
      const index=ordinal.get(String(block.blockId));
      if(index==null)fail("UNKNOWN_BLOCK:"+card.sectionId+":"+block.blockId);
      if(index<lastIndex)fail("BLOCK_REORDERED:"+card.sectionId+":"+block.blockId);
      lastIndex=index;
    }
    for(const sourceBlock of expected){
      const parts=actual.filter(b=>b.blockId===sourceBlock.blockId);
      if(!parts.length)fail("BLOCK_LOST:"+card.sectionId+":"+sourceBlock.blockId);
      const sourceCount=sourceBlock.paragraphCount??0;
      if(parts.reduce((n,p)=>n+(p.paragraphCount??0),0)!==sourceCount)
        fail("BLOCK_PARAGRAPHS_LOST_OR_DUPLICATED:"+card.sectionId+":"+sourceBlock.blockId);
      if(sourceCount===0 && parts.length!==1)
        fail("EMPTY_SOURCE_BLOCK_DUPLICATED:"+card.sectionId+":"+sourceBlock.blockId);
      blockCount++;
    }
    for(const page of outputs){
      const pageRows=rows(page);
      for(const block of blocks(page)){
        if(!(block.paragraphCount>0))continue;
        const start=block.firstParagraphIndex;
        if(!Number.isInteger(start)||start<0||
          start+block.paragraphCount>pageRows.length)
          fail("BLOCK_OUT_OF_BOUNDS:"+page.sectionId+":"+block.blockId);
      }
      if(page.sourceParagraphStart!=null){
        const sourceSlice=a.slice(page.sourceParagraphStart,page.sourceParagraphEnd);
        if(sourceSlice.length!==pageRows.length ||
           sourceSlice.some((p,i)=>p!==pageRows[i]))
          fail("SOURCE_SEGMENT_SPAN:"+page.sectionId);
      }
    }
  }
  if(cursor!==presented.cards.length)fail("UNKNOWN_PRESENTATION_PAGE:"+key(presented.cards[cursor]));
  for(let i=0;i<presented.cards.length;i++){
    const card=presented.cards[i];
    if(card.sequence!==i+1)fail("NONCONTIGUOUS_SEQUENCE:"+card.sectionId);
    if(presented.cardBySequence?.(i+1)!==card)fail("SEQUENCE_LOOKUP:"+card.sectionId);
    if(i+1<presented.cards.length &&
       presented.nextCard?.(card.sectionId)!==presented.cards[i+1])
       fail("NEXT_LOOKUP:"+card.sectionId);
    if(i>0 && presented.previousCard?.(card.sectionId)!==presented.cards[i-1])
       fail("PREVIOUS_LOOKUP:"+card.sectionId);
  }
  return Object.freeze({verified:true,sourceCards:original.cards.length,
    presentationCards:presented.cards.length,splitSourceCards,fragments,
    paragraphs:paragraphCount,sourceBlocks:blockCount,
    textWitnessOwner:"UNMODIFIED_ORIGINAL_PARAGRAPH_REFERENCES",
    originalSourceAuthority:original.sourceAuthorityModel??null});
}
