// Presentation-only structural whitespace for LIVE Mass.
// Derived from preserved canonical source-block offsets and proper prayer
// group identities; never inferred from punctuation, text length or speaker.
// A prayer's successive text paragraphs retain their compact original rhythm.
const groupOf=row=>String(row?.liturgicalGroup??"").trim();
const prayerGroup=group=>/^R17\.ORATION\.(?:COLLECT|POSTCOMMUNION)\.G\d+$/.test(group);

// Remove an omitted rite from the *display* card, never the canonical model.
// Rebase surviving source-block offsets to the surviving paragraph sequence;
// leaving original offsets would make LIVE focus misidentify the next prayer.
export function omitSourceBlockForPresentation(card,blockId){
  const source=Array.isArray(card?.paragraphs)?card.paragraphs:[];
  const blocks=Array.isArray(card?.blocks)?card.blocks:[];
  const removed=blocks.find(block=>block.blockId===blockId);
  if(!removed || removed.firstParagraphIndex==null || !removed.paragraphCount)
    return card; // Already source-omitted: no visible words or offset to remove.
  const start=removed.firstParagraphIndex;
  const count=removed.paragraphCount;
  const end=start+count;
  if(!Number.isInteger(start)||!Number.isInteger(count)||count<=0||
     start<0||end>source.length)
    throw new Error("Invalid source-block omission "+blockId);
  const surviving=blocks.filter(block=>block.blockId!==blockId).map(block=>{
    const first=block.firstParagraphIndex,n=block.paragraphCount;
    if(first==null||!Number.isInteger(n)||n<=0)return block;
    if(!Number.isInteger(first)||first<0||first+n>source.length)
      throw new Error("Invalid surviving source-block boundary "+block.blockId);
    if(first>=end)return {...block,firstParagraphIndex:first-count};
    if(first+n<=start)return block;
    throw new Error("Overlapping omitted source-block boundary "+block.blockId);
  });
  const paragraphs=source.filter((_,index)=>index<start||index>=end);
  if(!paragraphs.length&&!card.stateOnly)return null;
  return Object.freeze({...card,
    paragraphs:Object.freeze(paragraphs),
    blocks:Object.freeze(surviving),
    planFilteredBlocks:Object.freeze([...(card.planFilteredBlocks??[]),blockId]),
  });
}

export function withLiveReadingSections(card,paragraphs=card?.paragraphs??[],{mode="LIVE"}={}){
  // Missal columns retain their independent geometry.
  if(String(mode).toUpperCase()!=="LIVE")return paragraphs;
  const source=Array.isArray(card?.paragraphs)?card.paragraphs:[];
  if(!Array.isArray(paragraphs))throw new TypeError("Reader paragraphs required");
  if(source.length!==paragraphs.length)throw new Error("LIVE section projection changed source paragraph count");
  const owners=Array(source.length).fill(null);
  for(const block of card?.blocks??[]){
    if(block?.firstParagraphIndex==null||!Number.isInteger(block.paragraphCount)||block.paragraphCount<=0)continue;
    const start=block.firstParagraphIndex,end=start+block.paragraphCount;
    if(!Number.isInteger(start)||start<0||end>source.length)
      throw new Error("Invalid source-block reading boundary "+block.blockId);
    for(let index=start;index<end;index++){
      if(owners[index]!==null)throw new Error("Overlapping source-block ownership at "+index);
      owners[index]=block.blockId;
    }
  }
  return Object.freeze(paragraphs.map((row,index)=>{
    const previous=source[index-1],current=source[index];
    const previousGroup=groupOf(previous),currentGroup=groupOf(current);
    const sameNamedPrayer=Boolean(previousGroup&&currentGroup&&previousGroup===currentGroup);
    const blockChange=index>0&&owners[index]&&owners[index-1]&&
      owners[index]!==owners[index-1]&&!sameNamedPrayer;
    const orationChange=index>0&&previousGroup&&currentGroup&&
      previousGroup!==currentGroup&&prayerGroup(previousGroup)&&prayerGroup(currentGroup);
    const sectionBoundaryBefore=orationChange?"ORATION_GROUP":
      blockChange?"SOURCE_BLOCK":null;
    return Object.freeze({
      ...row,
      sourceBlockId:owners[index]??null,
      sectionBoundaryBefore,
    });
  }));
}
