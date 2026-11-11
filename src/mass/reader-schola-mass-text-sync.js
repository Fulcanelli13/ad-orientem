// One source syllable coordinate for the vertical Mass text and horizontal
// Schola strip. This is a visual follow surface, not an observed choir or
// priest clock. A production caller MUST first pass the approved-score gate.
import {scholaGabcSyllables,scholaKyrieSourceOccurrences} from "./reader-schola-notation-follow.js";

export function normalizeScholaLatin(value){
 return String(value??"").normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"")
  .replace(/[æÆœŒ]/g,c=>({æ:"ae",Æ:"ae",œ:"oe",Œ:"oe"})[c])
  .replace(/j/gi,"i").toLowerCase().replace(/[^a-z]/g,"");
}

/** Exact whole-paragraph, in-order Latin reconciliation. No fuzzy lyrics,
 * time interpolation, title matching, or inferred music setting. */
export function scholaMassTextAnchors(gabc,paragraphs=[],{trackId=null}={}){
 const syllables=trackId==="KYRIE"
   ?scholaKyrieSourceOccurrences(gabc):scholaGabcSyllables(gabc);
 if(!syllables.length||!Array.isArray(paragraphs))return Object.freeze({syllables:[],anchors:[]});
 const offsets=[];let joined="";
 for(const syllable of syllables){
  offsets.push(joined.length);joined+=normalizeScholaLatin(syllable.label);
 }
 const anchors=[];let cursor=0;
 for(const item of paragraphs){
  const text=normalizeScholaLatin(item?.latin);
  if(!item?.id||text.length<7)continue;
  const at=joined.indexOf(text,cursor);
  if(at<0)continue;
  // A repeated full phrase (e.g. Iesu Christe, twice in Gloria VIII) is
  // unambiguous only after a prior exact phrase established its position.
  // On an isolated, unanchored reader card, do not guess which repeat it is.
  const ninefold=trackId==="KYRIE" &&
    syllables.some(s=>Number.isInteger(s.sourceIndex)) &&
    paragraphs.filter(p=>["kyrieeleison","christeeleison"].includes(
      normalizeScholaLatin(p?.latin))).length===9;
  if(!anchors.length&&joined.indexOf(text,at+1)>=0&&!ninefold)continue;
  anchors.push(Object.freeze({id:String(item.id),start:at,end:at+text.length,
   latin:text,sourceSyllableOffset:offsets.findIndex(x=>x>=at)}));
  cursor=at+text.length;
 }
 return Object.freeze({syllables,offsets:Object.freeze(offsets),
  anchors:Object.freeze(anchors)});
}

function textNodes(element,out=[]){
 if(!element)return out;
 if(element.nodeType===3){out.push(element);return out;}
 for(const child of element.childNodes??[])textNodes(child,out);
 return out;
}
function characterAt(element,index){
 let n=0;
 for(const node of textNodes(element)){
  const source=node.textContent??"";
  for(let raw=0;raw<source.length;){
   const code=source.codePointAt(raw),glyph=String.fromCodePoint(code);
   const latin=normalizeScholaLatin(glyph);
   for(let i=0;i<latin.length;i++){
    if(n===index)return {node,offset:raw,length:glyph.length};
    n++;
   }
   raw+=glyph.length;
  }
 }
 return null;
}

export function createScholaMassTextSynchronizer({
 reader,gabc,trackId=null,enabled=()=>true
}={}){
 if(!reader?.querySelectorAll)throw new TypeError("Mass text scroller required");
 const syllables=trackId==="KYRIE"?scholaKyrieSourceOccurrences(gabc):scholaGabcSyllables(gabc);
 let cachedBody=null,cachedRows=[],cachedAnchors=null,cachedSignature=null;
 function read(){
  const body=reader.querySelector('[data-role="paragraphs"]');
  const rows=[...(body?.querySelectorAll?.(".ao-reader-paragraph")??[])];
  // Paragraph nodes can survive an in-place Latin/translation toggle.
  // A stale mapping must never scroll the reader against new visible text.
  const signature=rows.map(node=>String(node.dataset?.paragraphId??"")+":"+
    [...(node.querySelectorAll?.(".ao-line-primary,.ao-line-secondary")??[])]
      .map(line=>line.textContent??"").join("|")).join("\n");
  if(body===cachedBody&&rows.length===cachedRows.length&&
     rows.every((node,i)=>node===cachedRows[i])&&
     signature===cachedSignature&&cachedAnchors)
   return cachedAnchors;
  cachedBody=body;cachedRows=rows;cachedSignature=signature;
  const paragraphs=[];
  for(const node of rows){
   if(node.hidden||node.dataset?.kind==="RUBRIC")continue;
   const candidates=[...node.querySelectorAll(".ao-line-primary,.ao-line-secondary")];
   for(const element of candidates){
    if(!element?.textContent)continue;
    paragraphs.push({id:node.dataset.paragraphId,latin:element.textContent,node,element});
   }
  }
  const planned=scholaMassTextAnchors(gabc,paragraphs,{trackId});
  // Preserve actual DOM targets, not guessed selectors or fabricated text.
  const matched=[];
  let cursor=0;
  for(const anchor of planned.anchors){
   const source=paragraphs.find((row,i)=>i>=cursor && row.id===anchor.id &&
     normalizeScholaLatin(row.latin)===anchor.latin);
   if(!source)continue;
   cursor=paragraphs.indexOf(source)+1;
   matched.push({...anchor,node:source.node,element:source.element});
  }
  cachedAnchors={...planned,anchors:matched};
  return cachedAnchors;
 }
 function follow(index){
  if(!enabled())return false;
  if(!Number.isInteger(index)||index<0||index>=syllables.length)return false;
  const plan=read();
  const point=plan.offsets[index];
  const anchor=plan.anchors.find(a=>point>=a.start&&point<a.end);
  if(!anchor||!anchor.node?.isConnected||!anchor.element?.getBoundingClientRect)
   return false;
  const relative=point-anchor.start;
  const char=characterAt(anchor.element,relative);
  const doc=reader.ownerDocument;
  let rect=null;
  if(char&&typeof doc?.createRange==="function"){
   const range=doc.createRange();
   range.setStart(char.node,char.offset);
   range.setEnd(char.node,Math.min(char.node.textContent.length,char.offset+char.length));
   rect=range.getBoundingClientRect();
  }
  const target=rect?.height>0?rect:anchor.element.getBoundingClientRect();
  const parent=reader.getBoundingClientRect();
  if(!target||!parent)return false;
  reader.scrollTop+=(target.top-parent.top)-reader.clientHeight*.39;
  reader.dataset.scholaTextFollowIndex=String(index);
  reader.dataset.scholaTextFollowParagraph=anchor.id;
  return true;
 }
 function destroy(){
  cachedBody=null;cachedRows=[];cachedAnchors=null;cachedSignature=null;
  delete reader.dataset.scholaTextFollowIndex;
  delete reader.dataset.scholaTextFollowParagraph;
 }
 return Object.freeze({follow,destroy,inspect:read});
}
