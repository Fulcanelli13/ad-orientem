import {parsePinnedSourceText} from "./text-parser.js";

// Deliberately accepts a small, well-formed TEXTUAL HTML subset.
// It is not a general-purpose web scraper or an HTML sanitizer.
// Unsafe/unknown markup fails closed; output is plain text only.
const CONTAINERS=new Set(["article","section","div","blockquote","ul","ol"]);
const BLOCKS=new Set(["p","li","h1","h2","h3"]);
const INLINE=new Set(["a","span","em","strong","b","i","cite","sup","sub"]);
const VOID=new Set(["br"]);
const ALLOWED=new Set([...CONTAINERS,...BLOCKS,...INLINE,...VOID]);
const ENTITIES=Object.freeze({
 amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" ",
 ndash:"–",mdash:"—",lsquo:"‘",rsquo:"’",ldquo:"“",rdquo:"”",
 hellip:"…",laquo:"«",raquo:"»",aelig:"æ",oelig:"œ"
});
const ANCHOR=/^[A-Za-z][A-Za-z0-9_.:-]{0,100}$/;
function decodeEntities(value){
 return String(value).replace(/&(#x[0-9a-f]+|#[0-9]+|[A-Za-z][A-Za-z0-9]+);/gi,(_match,key)=>{
  if(key[0]==="#"){
   const cp=key[1]?.toLowerCase()==="x"?parseInt(key.slice(2),16):parseInt(key.slice(1),10);
   if(cp<32&&cp!==10&&cp!==13&&cp!==9||cp>0x10ffff||cp>=0xd800&&cp<=0xdfff)
    throw new Error("PINNED_HTML_UNSAFE_ENTITY");
   return String.fromCodePoint(cp);
  }
  if(!Object.hasOwn(ENTITIES,key.toLowerCase()))
   throw new Error("PINNED_HTML_UNKNOWN_ENTITY_"+key);
  return ENTITIES[key.toLowerCase()];
 });
}
function attributes(raw){
 const values={};
 const pattern=/([A-Za-z][\w-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
 let pos=0,match;
 while((match=pattern.exec(raw))){
  if(raw.slice(pos,match.index).trim())throw new Error("PINNED_HTML_INVALID_ATTRIBUTES");
  const key=match[1].toLowerCase();
  if(!["id","class","lang","title","href"].includes(key)||Object.hasOwn(values,key))
   throw new Error("PINNED_HTML_FORBIDDEN_ATTRIBUTE");
  values[key]=decodeEntities(match[2]??match[3]??"");
  if(key==="href"&&!/^(https:\/\/|#[A-Za-z][\w.:-]*)/i.test(values[key]))
   throw new Error("PINNED_HTML_UNSAFE_LINK");
  pos=pattern.lastIndex;
 }
 if(raw.slice(pos).trim())throw new Error("PINNED_HTML_INVALID_ATTRIBUTES");
 if(values.id&&!ANCHOR.test(values.id))throw new Error("PINNED_HTML_INVALID_ANCHOR");
 return values;
}
const lineAt=(s,i)=>1+(s.slice(0,i).match(/\n/g)||[]).length;
function plainText(s){
 return decodeEntities(s).replace(/[\t\f\v ]+/g," ").replace(/\r\n?/g,"\n");
}

/**
 * Parse only clean, explicitly licensed/pinned HTML already supplied by an
 * owning editorial pipeline. No remote fetch, DOM execution, link following,
 * or implicit licence approval. Unknown tags, scripts and malformed HTML fail.
 * Anchor IDs and original input line locators survive as additional metadata.
 */
export function parsePinnedSourceHtml({text,...meta}={}){
 if(typeof text!=="string"||!text.trim()||text.length>500000)
  throw new Error("PINNED_HTML_TEXT_MISSING_OR_TOO_LARGE");
 const input=text.replace(/\r\n?/g,"\n");
 const pattern=/<[^>]*>|[^<]+/g,stack=[],blocks=[],usedAnchors=new Set();
 let pos=0,active=null,match;
 while((match=pattern.exec(input))){
  if(match.index!==pos)throw new Error("PINNED_HTML_MALFORMED_MARKUP");
  pos=pattern.lastIndex;
  const token=match[0];
  if(!token.startsWith("<")){
   if(!active){
    if(token.trim())throw new Error("PINNED_HTML_TEXT_OUTSIDE_PARAGRAPH");
   }else active.text+=plainText(token);
   continue;
  }
  const tag=/^<\s*(\/?)\s*([A-Za-z][\w-]*)([\s\S]*?)\s*(\/?)>$/.exec(token);
  if(!tag)throw new Error("PINNED_HTML_UNSUPPORTED_MARKUP");
  const closing=Boolean(tag[1]),name=tag[2].toLowerCase(),selfClosing=Boolean(tag[4]);
  if(!ALLOWED.has(name))throw new Error("PINNED_HTML_FORBIDDEN_TAG_"+name);
  if(selfClosing&&!VOID.has(name))throw new Error("PINNED_HTML_INVALID_SELF_CLOSE");
  if(VOID.has(name)){
   if(closing)throw new Error("PINNED_HTML_INVALID_VOID");
   attributes(tag[3]);
   if(!active)throw new Error("PINNED_HTML_BR_OUTSIDE_PARAGRAPH");
   active.text+="\n";
   continue;
  }
  if(closing){
   if(tag[3].trim()||selfClosing||stack.pop()!==name)
    throw new Error("PINNED_HTML_NESTING_MISMATCH");
   if(BLOCKS.has(name)){
    if(active?.tag!==name)throw new Error("PINNED_HTML_NESTING_MISMATCH");
    const text=active.text.trim().replace(/ *\n */g,"\n");
    if(!text)throw new Error("PINNED_HTML_EMPTY_BLOCK");
    if(/^#{1,3}\s/.test(text))throw new Error("PINNED_HTML_MARKDOWN_AMBIGUOUS");
    blocks.push({...active,text});
    active=null;
   }
   continue;
  }
  const attrs=attributes(tag[3]);
  if(attrs.id){
   if(usedAnchors.has(attrs.id))throw new Error("PINNED_HTML_DUPLICATE_ANCHOR");
   usedAnchors.add(attrs.id);
  }
  if(BLOCKS.has(name)){
   if(active)throw new Error("PINNED_HTML_NESTED_PARAGRAPH");
   active={tag:name,text:"",sourceLine:lineAt(input,match.index),sourceAnchor:attrs.id??null};
  }else if(INLINE.has(name)&&!active)throw new Error("PINNED_HTML_INLINE_OUTSIDE_PARAGRAPH");
  stack.push(name);
 }
 if(pos!==input.length||stack.length||active)
  throw new Error("PINNED_HTML_UNCLOSED_MARKUP");
 if(!blocks.length)throw new Error("PINNED_HTML_EMPTY_SOURCE");
 const markup=blocks.map(b=>/^h[1-3]$/.test(b.tag)?"# "+b.text:b.text).join("\n\n");
 const parsed=parsePinnedSourceText({...meta,text:markup,format:"plain-paragraphs"});
 const headings=blocks.filter(b=>/^h[1-3]$/.test(b.tag));
 const paragraphs=blocks.filter(b=>!/^h[1-3]$/.test(b.tag));
 let paragraphIndex=0;
 const sections=parsed.sections.map((section,i)=>{
  const mapped=section.paragraphs.map(p=>{
   const b=paragraphs[paragraphIndex++];
   if(!b||b.text!==p.text)throw new Error("PINNED_HTML_LOSSY_CONVERSION");
   return Object.freeze({...p,sourceLine:b.sourceLine,sourceAnchor:b.sourceAnchor});
  });
  return Object.freeze({...section,sourceAnchor:headings[i]?.sourceAnchor??null,
   paragraphs:Object.freeze(mapped)});
 });
 if(paragraphIndex!==paragraphs.length)throw new Error("PINNED_HTML_LOSSY_CONVERSION");
 return Object.freeze({...parsed,format:"clean-html",sections:Object.freeze(sections)});
}
