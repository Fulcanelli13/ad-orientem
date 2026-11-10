/**
 * Source-exact, self-hosted private Litany of the Saints witnesses.
 * Original transcriptions acquired from revision-pinned public-domain
 * Wikisource pages; never confuse 1883 EN or 1862 FR with the 1962 liturgical
 * procession / Easter Vigil / Forty Hours forms.
 */
import {paginateLitanyProper} from "./litany-source.js";

const SOURCES=Object.freeze({
 en:Object.freeze({file:"private-litany-of-saints-1883-en.v1.json",revisionId:12282621}),
 fr:Object.freeze({file:"private-litany-of-saints-1862-fr.v1.json",revisionId:14794744})
});
export const PRIVATE_LITANY_LOCAL_SCHEMA="ao.pray.private-litany.local-source.v1";
export function privateLitanyLocalUrl(language){
 const spec=SOURCES[language];
 return spec?new URL("../../data/pray/"+spec.file,import.meta.url).href:null;
}
async function digestText(text,cryptoProvider){
 if(!cryptoProvider?.subtle)throw Error("Private Litany source digest unavailable");
 const bytes=await cryptoProvider.subtle.digest("SHA-256",new TextEncoder().encode(text));
 return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,"0")).join("");
}
export async function loadPrivateLitanyLocal(language,{
 fetcher=globalThis.fetch?.bind(globalThis),cryptoProvider=globalThis.crypto
}={}){
 const spec=SOURCES[language],url=privateLitanyLocalUrl(language);
 if(!spec||typeof fetcher!=="function")throw Error("Invalid local historical Litany request");
 const result=await fetcher(url,{cache:"force-cache"});
 if(!result?.ok)throw Error("Original private Litany bundle not available");
 const obj=await result.json();
 if(obj?.schema!==PRIVATE_LITANY_LOCAL_SCHEMA||
   obj.language!==language||obj.sourceRevisionId!==spec.revisionId||
   obj.sourceStatus!=="HISTORICAL_TRANSCRIPTION_UNCOLLATED"||
   obj.liturgical1962Certified!==false||
   obj.sourceScope!=="PRIVATE_LITANY_PROPER_ONLY__OMITS_APPENDED_PSALM_AND_COLLECTS"||
   typeof obj.sourceUrl!=="string"||!obj.sourceUrl.startsWith("https://"+language+".wikisource.org/")||
   typeof obj.text!=="string"||obj.text.length<3000||
   !/^[a-f0-9]{64}$/.test(obj.sha256||"")||
   !Number.isInteger(obj.lineCount)||obj.lineCount<80||
   !Number.isInteger(obj.pages)||obj.pages<4)
   throw Error("Private Litany local source provenance/coverage rejected");
 const lines=obj.text.split(/\n+/).map(x=>x.trim()).filter(Boolean);
 if(lines.length!==obj.lineCount||paginateLitanyProper(obj.text,language).length!==obj.pages)
  throw Error("Private Litany local source line/page count mismatch");
 const anchors=language==="fr"
   ?[/Seigneur,\s*ayez pitié/i,/Sainte Marie,\s*priez pour nous/i,/Saint Pierre/i,/Agneau de Dieu/i]
   :[/Lord,\s*have mercy/i,/Holy Mary/i,/St\.? Peter/i,/Lamb of God/i];
 if(anchors.some(re=>!re.test(obj.text)))
  throw Error("Incomplete private Litany local source");
 if(await digestText(obj.text,cryptoProvider)!==obj.sha256)
  throw Error("Private Litany local text digest mismatch");
 return Object.freeze({language,edition:obj.historicalEdition,sourceUrl:obj.sourceUrl,
  sourceRevisionId:obj.sourceRevisionId,status:obj.sourceStatus,
  text:obj.text,lines:obj.lineCount,pages:obj.pages,sha256:obj.sha256});
}
