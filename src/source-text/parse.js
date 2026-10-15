import {SOURCE_TEXT_SCHEMA,validateSourceWork,slugLocator,normalizePassageText} from "./contracts.js";
const BLOCKS=new Set(["h1","h2","h3","p","li","blockquote"]);
const INLINE_TAGS=new Set(["em","strong","i","b","span","a","code"]);
const ENTITY=/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos|nbsp);/gi;
const ENTITIES={amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" "};
function decodeEntities(value){
 const decoded=value.replace(ENTITY,(_,code)=>{
  const name=code.toLowerCase();
  if(name[0]==="#"){
   const codepoint=name[1]==="x"?parseInt(name.slice(2),16):parseInt(name.slice(1),10);
   if(!Number.isInteger(codepoint)||codepoint===0||codepoint>0x10ffff||
      (codepoint>=0xd800&&codepoint<=0xdfff))throw new Error("SOURCE_HTML_ENTITY_INVALID");
   return String.fromCodePoint(codepoint);
  }
  return ENTITIES[name];
 });
 if(/&(?:#[a-z0-9]*|[a-z][a-z0-9]*);?/i.test(decoded))
  throw new Error("SOURCE_HTML_ENTITY_UNSUPPORTED");
 return decoded;
}
function safeInline(value){
 const opened=[];let text="",offset=0;
 for(const part of value.matchAll(/<([^<>]+)>/g)){
  text+=value.slice(offset,part.index);
  const tag=part[1].trim();
  if(/^br\s*\/?$/i.test(tag)){text+=" ";}
  else{
   const close=tag.match(/^\/([a-z]+)\s*$/i);
   const open=tag.match(/^([a-z]+)(?:\s+[^<>]*)?$/i);
   const name=(close??open)?.[1]?.toLowerCase();
   if(!name||!INLINE_TAGS.has(name))throw new Error("SOURCE_HTML_INLINE_UNSUPPORTED");
   if(close){
    if(opened.pop()!==name)throw new Error("SOURCE_HTML_INLINE_UNBALANCED");
   }else opened.push(name);
  }
  offset=part.index+part[0].length;
 }
 text+=value.slice(offset);
 if(opened.length||/[<>]/.test(text))throw new Error("SOURCE_HTML_MARKUP_UNBALANCED");
 return normalizePassageText(decodeEntities(text));
}
function buildDocument(work,blocks,format){
 validateSourceWork(work,{requireReproduction:true});
 if(!Array.isArray(blocks)||blocks.length===0)throw new Error("SOURCE_TEXT_NO_PASSAGES");
 const headings=[],headCount=new Map(),counts=new Map(),ids=new Set(),passages=[];
 for(const entry of blocks){
  if(entry.kind==="heading"){
   const level=entry.level;
   while(headings.length&&headings[headings.length-1].level>=level)headings.pop();
   const parent=headings.map(x=>x.slug).join("/");
   const slug=slugLocator(entry.text),key=parent+"/"+slug;
   const nth=(headCount.get(key)??0)+1;headCount.set(key,nth);
   headings.push({level,slug:slug+(nth>1?"-"+nth:""),title:entry.text});
   continue;
  }
  const section=headings.map(x=>x.slug).join("/")||"root";
  const serialKey=section+"/"+entry.kind;
  const nth=(counts.get(serialKey)??0)+1;counts.set(serialKey,nth);
  const localId=entry.anchor??(entry.kind+"-"+String(nth).padStart(3,"0"));
  if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(localId))
   throw new Error("SOURCE_TEXT_ANCHOR_INVALID");
  const id=work.id+"/"+section+"/"+localId;
  if(ids.has(id))throw new Error("SOURCE_TEXT_DUPLICATE_PASSAGE_ID");
  ids.add(id);
  passages.push(Object.freeze({id,workId:work.id,editionId:work.editionId,
   witnessId:work.witnessId,kind:entry.kind,section,
   heading:headings.length?headings[headings.length-1].title:work.title,
   ordinal:nth,locator:section+"#"+localId,text:normalizePassageText(entry.text)}));
  if(passages.length>10000)throw new Error("SOURCE_TEXT_TOO_MANY_PASSAGES");
 }
 if(!passages.length)throw new Error("SOURCE_TEXT_NO_PASSAGES");
 return Object.freeze({schema:SOURCE_TEXT_SCHEMA,format,
  work:Object.freeze({...work}),passages:Object.freeze(passages)});
}
export function parsePlainSource(work,plain){
 if(typeof plain!=="string"||plain.length>2000000)throw new Error("SOURCE_TEXT_INPUT_INVALID");
 const blocks=[];
 for(const raw of plain.replace(/\r\n?/g,"\n").trim().split(/\n[ \t]*\n+/)){
  const piece=raw.trim();if(!piece)continue;
  const heading=piece.match(/^(#{1,3})[ \t]+([^\n]+)$/);
  if(heading){blocks.push({kind:"heading",level:heading[1].length,text:heading[2].trim()});continue;}
  for(const line of piece.split("\n")){
   if(/^-[ \t]+/.test(line))blocks.push({kind:"list",text:line.replace(/^-[ \t]+/,"")});
   else if(/^>[ \t]+/.test(line))blocks.push({kind:"quotation",text:line.replace(/^>[ \t]+/,"")});
   else if(blocks.length&&blocks[blocks.length-1].kind==="paragraph"&&
     blocks[blocks.length-1].group===piece){blocks[blocks.length-1].text+=" "+line.trim();}
   else blocks.push({kind:"paragraph",text:line.trim(),group:piece});
  }
 }
 return buildDocument(work,blocks,"plain");
}
export function parseCleanHtmlSource(work,html){
 if(typeof html!=="string"||html.length>2000000)throw new Error("SOURCE_HTML_INPUT_INVALID");
 if(/<\s*\/?\s*(?:script|style|iframe|object|embed|form|svg|img|template|link|meta)\b/i.test(html)||
    /\bon[a-z]+\s*=/i.test(html)||/javascript\s*:/i.test(html))
  throw new Error("SOURCE_HTML_UNSAFE_OR_UNSUPPORTED");
 const source=html.replace(/<!--[\s\S]*?-->/g,"").trim();
 const pattern=/<(h[1-3]|p|li|blockquote)\b([^<>]*)>([\s\S]*?)<\/\1\s*>/gi;
 const blocks=[];let rem=source;
 for(const match of source.matchAll(pattern)){
  const tag=match[1].toLowerCase(),attrs=match[2],body=match[3];
  if(!BLOCKS.has(tag))throw new Error("SOURCE_HTML_BLOCK_UNSUPPORTED");
  const anchor=attrs.match(/\bdata-source-anchor\s*=\s*["']([a-zA-Z0-9][a-zA-Z0-9._-]{0,79})["']/i)?.[1];
  const text=safeInline(body);
  blocks.push(tag[0]==="h"?{kind:"heading",level:Number(tag[1]),text}:
   {kind:tag==="p"?"paragraph":tag==="li"?"list":"quotation",text,anchor});
 }
 rem=rem.replace(pattern,"").replace(/<\/?(?:body|main|article|section|div|ul|ol)\b[^<>]*>/gi,"").trim();
 if(rem||!blocks.length)throw new Error("SOURCE_HTML_STRUCTURE_UNSUPPORTED");
 return buildDocument(work,blocks,"clean-html");
}
