// Presentation only: a position within a reader, never a prayer completion
// marker, progress score or inference that a devotion has been performed.
export const READING_POSITION_VERSION="reading-position-v1";
const escapeMarkup=value=>String(value??"").replace(/[&<>"']/g,x=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;",
})[x]);
export function readingPosition({step=0,total=0,label="",title=""}={}){
 const size=Math.max(0,Math.trunc(Number(total)||0));
 const index=size?Math.max(0,Math.min(size-1,Math.trunc(Number(step)||0))):0;
 return Object.freeze({index,total:size,number:size?index+1:0,label:String(label||""),title:String(title||"")});
}
export function readingPositionMarkup(options={}){
 const pos=readingPosition(options);
 if(!pos.total)return "";
 const count=pos.number+" / "+pos.total,heading=pos.title;
 const value=Math.round(pos.number*100/pos.total);
 return `<div class="aoReaderStageIndicator aoReadingPosition" data-ao-reading-position="${escapeMarkup(pos.index)}" data-ao-reading-total="${escapeMarkup(pos.total)}" aria-label="${escapeMarkup(pos.label||"Current section")}">
  <span class="aoReaderStageNumber">${escapeMarkup(count)}</span>
  <strong class="aoReaderStageTitle">${escapeMarkup(heading)}</strong>
  <span class="aoReaderStageTrack" role="progressbar" aria-valuemin="0" aria-valuemax="${pos.total}" aria-valuenow="${pos.number}" aria-label="${escapeMarkup(pos.label||"Current section")}"><i style="width:${value}%"></i></span>
 </div>`;
}
