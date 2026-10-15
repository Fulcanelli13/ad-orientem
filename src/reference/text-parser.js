/**
 * Source-text parser for already permitted, pinned local transcriptions.
 * Editorial input only: no remote HTML fetching, OCR, speculative references
 * or alteration of the Mass/Prayer/Bible canonical text owners.
 *
 * Parses (1) blank-line paragraphs with # headings; (2) Divinum Officium
 * [Section] witnesses. Literal unresolved macros are preserved and blocked,
 * NEVER presented as a complete prayer or liturgical reading.
 */
const ID=/^[a-z0-9][a-z0-9._-]{1,100}$/i;
const SOURCES=new Set(["plain-paragraphs","divinum-sections"]);
const directive=line=>/^\s*(?:!|\$|&|@:|\+|\{)/.test(line)||line.includes(";;")||
 /\b(?:rubrica|versio)\s+\d{4}\b/i.test(line);
const escapeControl=t=>t.replace(/\r\n?/g,"\n").replace(/\u0000/g,"");
export function parsePinnedSourceText({
 text,workId,witnessId,revision,language="la",format="plain-paragraphs",
 rights="UNREVIEWED",maxChars=500000
}={}){
 if(!ID.test(workId||"")||!ID.test(witnessId||"")||!ID.test(revision||""))
   throw new Error("PINNED_SOURCE_ID_REQUIRED");
 if(!SOURCES.has(format)||!["la","en","fr"].includes(language))
   throw new Error("UNSUPPORTED_PINNED_SOURCE_FORMAT");
 if(typeof text!=="string"||!text.trim()||text.length>maxChars)
   throw new Error("PINNED_SOURCE_TEXT_MISSING_OR_TOO_LARGE");
 const source=escapeControl(text);
 const sections=[];let current=null,buffer=[],bufferStart=null,blocked=0;
 const addSection=(label)=>{
   current={id:witnessId+":s"+String(sections.length+1).padStart(3,"0"),
     title:String(label||"Text").trim(),paragraphs:[]};
   sections.push(current);
 };
 const flush=()=>{
   if(!buffer.length)return;
   if(!current)addSection("Text");
   const lines=buffer.splice(0),unresolved=lines.some(directive);
   const sourceLine=bufferStart;bufferStart=null;
   const position=current.paragraphs.length+1;
   current.paragraphs.push(Object.freeze({
      id:current.id+":p"+String(position).padStart(3,"0"),
      text:lines.join("\n").trim(),
      unresolved,
      sourceLine
   }));
   if(unresolved)blocked++;
 };
 const lines=source.split("\n");
 for(let i=0;i<lines.length;i++){
   const raw=lines[i],line=raw.trim();
   const divinum=format==="divinum-sections"?/^\[([^\]\n]+)\](?:\s.*)?$/.exec(line):null;
   const plain=format==="plain-paragraphs"?/^#{1,3}\s+(.+)$/.exec(line):null;
   if(divinum||plain){flush();addSection((divinum||plain)[1]);continue}
   if(!line){flush();continue}
   if(buffer.length===0)bufferStart=i+1;
   buffer.push(line);
 }
 flush();
 if(sections.length===0)throw new Error("EMPTY_PINNED_SOURCE");
 return Object.freeze({
   schema:"ao.pinned-source-paragraphs.v1",workId,witnessId,revision,language,format,rights,
   status:rights==="CLEARED"&&blocked===0?"ELIGIBLE_FOR_READING":"EDITORIAL_REVIEW_REQUIRED",
   unresolvedParagraphs:blocked,
   sections:Object.freeze(sections.map(s=>Object.freeze({
     id:s.id,title:s.title,
     paragraphs:Object.freeze(s.paragraphs)
   })))
 });
}
export function sourcePassage(document,passageId){
 if(document?.schema!=="ao.pinned-source-paragraphs.v1"||!ID.test(document.witnessId||""))return null;
 for(const section of document.sections||[]){
   if(section.id===passageId)return Object.freeze({section,paragraphs:section.paragraphs});
   const para=section.paragraphs.find(p=>p.id===passageId);
   if(para)return Object.freeze({section,paragraphs:[para]});
 }
 return null;
}
export function sourceCanDisplay(document,passageId){
 if(document?.status!=="ELIGIBLE_FOR_READING"||document?.rights!=="CLEARED")return false;
 const target=sourcePassage(document,passageId);
 return Boolean(target&&target.paragraphs.length&&target.paragraphs.every(p=>!p.unresolved));
}
