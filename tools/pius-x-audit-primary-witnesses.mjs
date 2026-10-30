/**
 * Primary-source excerpt presence audit for the private Pius X evidence annexes.
 * Offline CI checks independent manually transcribed context fixtures.
 * Live Vatican requests are separately opt-in and never used by normal CI.
 * A matching substring establishes presence, not speaker interpretation,
 * translation accuracy, complete passage collation or publishing approval.
 */
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {loadPrimaryWitnessAnnexes} from './pius-x-generative-review.mjs';

const namedEntities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',
 agrave:'à',egrave:'è',eacute:'é',ograve:'ò',ugrave:'ù',igrave:'ì',uuml:'ü',
 ldquo:'“',rdquo:'”',lsquo:'‘',rsquo:'’',aelig:'æ',mdash:'—',ndash:'–'};
function decodeHtmlEntities(s){
 return String(s).replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[A-Za-z]+);/g,(m,e)=>{
  if(e[0]==='#'){
   const hex=e[1]?.toLowerCase()==='x';
   const n=parseInt(e.slice(hex?2:1),hex?16:10);
   return Number.isInteger(n)&&n>0&&n<=0x10ffff?String.fromCodePoint(n):m;
  }
  return namedEntities[e]??m;
 });
}
export function canonicalSourceText(html){
 const source=String(html??'')
  .replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,' ')
  .replace(/<!--[\s\S]*?-->/g,' ')
  .replace(/<[^>]*>/g,' ');
 return decodeHtmlEntities(source).normalize('NFC')
  .replace(/[\u00a0\u2000-\u200a\u202f]/g,' ').replace(/\s+/g,' ').trim();
}
export function auditWitnessPages(annexes,pageByChapter){
 const details=[];
 for(const [chapterId,annex] of annexes){
  const sourceUrl=annex.document.sites.original||annex.document.sites.la;
  if(!/^https:\/\/www\.vatican\.va\/content\/pius-x\/(?:la|it)\//.test(sourceUrl))
   throw new Error('Original witness requires canonical Vatican Pius X page: '+chapterId);
  const raw=pageByChapter.get(chapterId);
  const text=raw?canonicalSourceText(raw):'';
  for(const w of annex.sourceWitnesses){
   const excerpt=w.text||w.latin;
   const expected=canonicalSourceText(excerpt);
   const matched=!!text&&text.includes(expected);
   details.push({chapterId,witnessId:w.id,sourceUrl,
    originalLanguage:annex.document.languageOfOriginal,
    sourcePageLine:w.webTextVerification?.sourcePageLine??null,
    status:matched?'EXACT_SOURCE_TEXT_PRESENT':'NOT_CONFIRMED_OR_MISSING',
    ...(matched?{}:{reason:!raw?'missing_source_page':'exact_excerpt_not_found'})});
  }
 }
 const matched=details.filter(x=>x.status==='EXACT_SOURCE_TEXT_PRESENT').length;
 return {schema:'AO_SPX_PRIMARY_WITNESS_WEBTEXT_AUDIT_V1',
  status:matched===details.length?'ALL_EXACT_SUBSTRINGS_PRESENT':'INCOMPLETE_DO_NOT_USE_AS_VALIDATED',
  documentCount:annexes.size,anchorsChecked:details.length,matched,unmatched:details.length-matched,
  originalSourceTextFullyCollated:false,claimLevelInterpretationApproved:false,
  translationsApproved:false,publishingApproved:false,details};
}
export async function fetchOfficialWitnessPages(annexes,{fetchImpl=fetch,timeoutMs=15000}={}){
 const pages=new Map();
 for(const [chapterId,annex] of annexes){
  const url=annex.document.sites.original||annex.document.sites.la;
  const expected=new URL(url);
  if(expected.protocol!=='https:'||expected.hostname!=='www.vatican.va'||
     !expected.pathname.startsWith('/content/pius-x/'))throw new Error('Vatican host/path required');
  const control=new AbortController(),timer=setTimeout(()=>control.abort(),timeoutMs);
  try{
   const resp=await fetchImpl(url,{signal:control.signal,redirect:'follow',
    headers:{accept:'text/html'}});
   if(!resp.ok||!resp.headers.get('content-type')?.includes('html'))throw new Error('Source HTTP response invalid');
   if(new URL(resp.url).hostname!=='www.vatican.va')throw new Error('Untrusted source redirect');
   const body=await resp.text();
   if(body.length>1500000)throw new Error('Source response exceeds audit size');
   pages.set(chapterId,body);
  }finally{clearTimeout(timer);}
 }
 return pages;
}
export async function runLiveAudit(){
 if(process.env.AO_SPX_AUDIT_VATICAN_LIVE!=='I_WANT_TO_VERIFY_ORIGINAL_TEXT')
  throw new Error('Explicitly opt in with AO_SPX_AUDIT_VATICAN_LIVE=I_WANT_TO_VERIFY_ORIGINAL_TEXT');
 const annexes=loadPrimaryWitnessAnnexes();
 const pages=await fetchOfficialWitnessPages(annexes);
 const result=auditWitnessPages(annexes,pages);
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.unmatched)process.exitCode=1;
 return result;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))
 await runLiveAudit();
