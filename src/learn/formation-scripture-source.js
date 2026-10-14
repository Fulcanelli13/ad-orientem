import {parseScriptureContext} from "../scripture/context.js";
import {scriptureContextCapsule} from "../scripture/context.js";

/**
 * Citation-driven Bible handoff for research-only Formation dossiers.
 * An original Catholic Bible source URL AND an explicit single verse range
 * in its OWN source-registry locator must agree. No Scripture passage is
 * inferred from prose, module topic, an opponent's site or a source title.
 *
 * This module does not certify the source text, the exposition or its French
 * translation. It delegates all Bible rendering to the canonical reader.
 */
const URL_BOOKS=Object.freeze({
 acts:"Acts",ephesians:"Ephesians",exodus:"Exodus",genesis:"Genesis",
 hebrews:"Hebrews",james:"James",john:"John",luke:"Luke",
 matthew:"Matthew",revelation:"Revelation",romans:"Romans",
 "1corinthians":"1 Corinthians","1timothy":"1 Timothy",
 "2thessalonians":"2 Thessalonians","2maccabees":"2 Maccabees",
 "2kings":"2 Kings"
});
const BOOK_NAMES=Object.freeze(Object.values(URL_BOOKS));
const normalize=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"");
const numeric=s=>Number(s);
function witnessCoordinates(source){
 const input=String(source?.url??"");
 let url;
 try{url=new URL(input);}catch{return null;}
 if(url.protocol!=="https:"||url.host!=="bible.usccb.org"||
    url.username||url.password||url.search||url.hash)return null;
 const path=/^\/bible\/([a-z0-9]+)\/(\d{1,3})\/?$/.exec(url.pathname);
 if(!path)return null;
 const book=URL_BOOKS[path[1]],chapter=numeric(path[2]);
 if(!book||!Number.isInteger(chapter)||chapter<1)return null;
 return {book,chapter};
}
function explicitRange(locator,book,chapter){
 const text=String(locator??"").trim();
 if(!text)return null;
 // Source registries use "vv. 13–20", "v. 8" or an explicit "Book 4:14".
 // A separately listed verse group is not one contiguous canonical passage.
 if(/\b(?:and|et)\s+\d+\b/i.test(text)||
    /[,;]\s*\d+\s*[-–]\s*\d+\b/.test(text))return null;
 const parts=[];
 const range=/^vv?\.\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?(?=$|\s|[,;])/i.exec(text);
 if(range)parts.push([numeric(range[1]),numeric(range[2]??range[1])]);
 const explicit=/(?:^|\b)([1-3]?\s*[a-z]+(?:\s+[a-z]+)?)\s+(\d{1,3}):(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?/gi;
 for(const match of text.matchAll(explicit)){
  const proposedBook=normalize(match[1]);
  if(!BOOK_NAMES.some(name=>normalize(name)===proposedBook)||proposedBook!==normalize(book)||
     numeric(match[2])!==chapter)return null;
  parts.push([numeric(match[3]),numeric(match[4]??match[3])]);
 }
 // A witness may describe a chapter without identifying a verse; do NOT
 // open verse 1 and misrepresent that as the cited evidence.
 if(parts.length!==1)return null;
 const [start,end]=parts[0];
 if(!Number.isInteger(start)||!Number.isInteger(end)||end<start)return null;
 // Do not accept a locator containing another explicit verse group.
 const after=text.replace(/^vv?\.\s*\d{1,3}(?:\s*[-–]\s*\d{1,3})?/i,"").trim();
 if(range && /(?:^|[,;])\s*(?:vv?\.\s*)?\d+\s*[-–]\s*\d+/.test(after))return null;
 return {start,end};
}
export function formationSourceScriptureContext(source){
 const coordinates=witnessCoordinates(source);if(!coordinates)return null;
 const verses=explicitRange(source?.locator,coordinates.book,coordinates.chapter);
 if(!verses)return null;
 const reference=coordinates.book+" "+coordinates.chapter+":"+
  verses.start+(verses.end!==verses.start?"–"+verses.end:"");
 const parsed=parseScriptureContext(reference);
 if(!parsed)return null;
 return Object.freeze({reference,passage:parsed.passage,
   originalSourceUrl:String(source.url),
   state:"SOURCE_COORDINATES_ONLY_UNCOLLATED",
   interpretationCertified:false,editionCertified:false,
   sourceTitle:String(source.title??source.id??"")});
}

export function formationSourceBibleMarkup(source,{french=false}={}){
 const hit=formationSourceScriptureContext(source);
 if(!hit)return "";
 const scope=french
  ?"Passage original à lire en contexte. Source externe conservée ; commentaire et traduction non certifiés par ce lien."
  :"Read the source passage in context. Original external source retained; this link does not certify the argument or its translation.";
 return '<span class="rrBibleHandoff" data-formation-bible-source="'+
  String(source.id||"").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]))+
  '">'+scriptureContextCapsule(hit.reference,{french})+
  '<small>'+scope+'</small></span>';
}
