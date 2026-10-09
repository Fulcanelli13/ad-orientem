#!/usr/bin/env node
import {readFile,writeFile} from "node:fs/promises";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";

/**
 * Current CPDV publisher master is authoritative over the older, third-party JSON.
 * Apply ONLY individually verified, openly documented publisher errata, never guesses.
 * Result remains RESEARCH ONLY. Full edition collation must precede release.
 */
export const VERIFIED_ERRATA=Object.freeze([
 Object.freeze({
   book:"Philippians",chapter:3,verse:1,date:"2025-02-26",
   old:"but for you, it is not necessary.",corrected:"but for you, it is necessary.",
   master:"https://sacredbible.org/catholic/NT-11_Philippians.htm",
   errata:"https://sacredbible.org/errata.htm"
 }),
 Object.freeze({
   book:"2Maccabees",chapter:7,verse:34,date:"2022-08",
   old:"do be not be extolled",corrected:"do not be extolled",
   master:"https://sacredbible.org/catholic/OT-46_2-Maccabees.htm",
   errata:"https://sacredbible.org/errata.htm"
 })
]);

function asBook(data,book){
 const result=data?.books?.find(x=>x.id===book);
 if(!result)throw new Error("Missing Catholic book "+book);
 return result;
}
function locate(data,rule){
 const chapter=asBook(data,rule.book).chapters.find(x=>x.number===rule.chapter);
 const verse=chapter?.verses?.find(x=>x.number===rule.verse);
 if(!verse||typeof verse.text!=="string")throw new Error("Missing verse "+rule.book);
 return verse;
}
export function candidateErrataReport(data){
 if(data?.editionId!=="cpdv-2009")throw new Error("Wrong source edition");
 return VERIFIED_ERRATA.map(rule=>{
  const verse=locate(data,rule);
  const stale=verse.text.includes(rule.old);
  const corrected=verse.text.includes(rule.corrected);
  if(stale===corrected)throw new Error("Unrecognised upstream edition text in "+rule.book+" "+rule.chapter+":"+rule.verse);
  return Object.freeze({...rule,status:stale?"stale-original-source":"contains-publisher-correction",oldText:verse.text});
 });
}
function htmlPlain(raw){
 return raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ")
 .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ")
 .replace(/<[^>]+>/g," ")
 .replace(/&nbsp;|&#160;/gi," ")
 .replace(/&quot;|&#34;/gi,'"')
 .replace(/&rsquo;|&#8217;/gi,"'")
 .replace(/&ldquo;|&#8220;/gi,'"')
 .replace(/&rdquo;|&#8221;/gi,'"')
 .replace(/\s+/g," ");
}
async function checkPublisher(rule,fetcher){
 const response=await fetcher(rule.master,{signal:AbortSignal.timeout(20000)});
 if(!response?.ok)throw new Error("Publisher master unreachable "+rule.book);
 const html=await response.text();
 const text=htmlPlain(html);
 const heading="{"+rule.chapter+":"+rule.verse+"}";
 const nextHeading="{"+rule.chapter+":"+(rule.verse+1)+"}";
 const from=text.indexOf(heading);
 if(from<0)throw new Error("Master verse marker not found "+heading);
 const stop=text.indexOf(nextHeading,from+heading.length);
 if(stop<0)throw new Error("Publisher master next verse marker missing "+nextHeading);
 const extract=text.slice(from+heading.length,stop);
 if(!extract.includes(rule.corrected)||extract.includes(rule.old))
  throw new Error("Publisher master does not confirm "+rule.book+" "+rule.chapter+":"+rule.verse);
 return {url:rule.master,sha256:createHash("sha256").update(html).digest("hex"),verifiedCorrected:true,excerptSize:extract.length};
}
export async function verifyAndPatchAuthorErrata(data,{fetcher=globalThis.fetch}={}){
 const candidate=candidateErrataReport(data);
 const masterEvidence=[];
 for(const rule of VERIFIED_ERRATA)masterEvidence.push(await checkPublisher(rule,fetcher));
 const clone=structuredClone(data);
 const changes=[];
 for(const [i,rule] of VERIFIED_ERRATA.entries()){
   const verse=locate(clone,rule);
   if(verse.text.includes(rule.old)){
     verse.text=verse.text.replace(rule.old,rule.corrected);
     changes.push({book:rule.book,chapter:rule.chapter,verse:rule.verse,
       date:rule.date,fromThirdPartySource:true,authorMaster:rule.master,
       validatedMasterSha256:masterEvidence[i].sha256});
   }
 }
 clone.provenance={...clone.provenance,
   sourceReview:"source-errata-verified-partial-not-a-complete-collation",
   editionReview:"pending",versificationReview:"pending",
   reviewer:null,reviewDate:null};
 return {candidate,masterEvidence,changes,patchedResearchCandidate:clone};
}
const base=process.argv[2];
if(base){
 const root=resolve(base);
 const data=JSON.parse(await readFile(join(root,"CPDV-canonical-candidate.json"),"utf8"));
 const result=await verifyAndPatchAuthorErrata(data);
 await writeFile(join(root,"CPDV-errata-review.json"),JSON.stringify({
  schemaVersion:1,editionId:"cpdv-2009",
  upstreamCorrections:result.candidate.map(({oldText,...rest})=>rest),
  masterEvidence:result.masterEvidence,appliedChanges:result.changes,
  fullEditionCertified:false,theologyCertified:false,
  status:"RESEARCH_ONLY_NOT_PUBLISHABLE"},null,2)+"\n");
 await writeFile(join(root,"CPDV-current-corrections-research-only.json"),
  JSON.stringify(result.patchedResearchCandidate));
 console.log("CPDV publisher master corrections verified: "+result.masterEvidence.length+
  "; stale third-party verses patched: "+result.changes.length+
  "; full text remains UNAPPROVED.");
}
