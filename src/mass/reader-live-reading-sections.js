// Presentation-only structural whitespace for LIVE Mass.
// Derived from preserved canonical source-block offsets and proper prayer
// group identities; never inferred from punctuation, text length or speaker.
// A prayer's successive text paragraphs retain their compact original rhythm.
const groupOf=row=>String(row?.liturgicalGroup??"").trim();
const prayerGroup=group=>/^R17\.ORATION\.(?:COLLECT|POSTCOMMUNION)\.G\d+$/.test(group);

export function withLiveReadingSections(card,paragraphs=card?.paragraphs??[]){
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
