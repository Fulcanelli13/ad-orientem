/* PRIVATE St Pius X generative research bench. No production route or source mutations. */
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export function readCorpus(html){
 const m=String(html).match(/<script type="application\/json" id="spxExpandedCorpus">([\s\S]*?)<\/script>/);
 if(!m)throw new Error('Missing original P6 corpus');
 const data=JSON.parse(m[1]);
 if(data.counts?.chapters!==106||data.counts?.allNodes!==423||data.approvals?.publishing!==false)
  throw new Error('Original research corpus or publication hold changed');
 const chapters=new Map(data.chapters.map(c=>[c.id,c]));
 if(chapters.size!==106)throw new Error('Duplicated subject IDs');
 return {data,chapters};
}
const held=(reason)=>({status:'held',reason,reply:null,publishingApproved:false,
 label:'NO GENERATED PAPAL SPEECH — PRIVATE RESEARCH'});
export function selectEvidence(store,input){
 const lang=input?.language,question=String(input?.question||'').trim();
 if(!['en','fr'].includes(lang)||question.length<4||question.length>240)return held('invalid_question');
 const c=store.chapters.get(input?.chapterId);
 if(!c)return held('unknown_subject');
 if(c.partial||c.sourceClass!=='PAPAL_DOCUMENT_ADAPTATION')return held('not_papal_primary_document_adaptation');
 if(/(?:absolve|confess my sins|grant absolution|am i in mortal sin|suicid|je veux me tuer|donnez moi l absolution)/i.test(question))
  return held('personal_sacramental_or_crisis_question');
 if(input?.nodeId && !c.nodes.some(n=>n.id===input.nodeId))return held('unknown_source_node');
 const selected=input?.nodeId?c.nodes.find(n=>n.id===input.nodeId):c.nodes[0];
 const nodes=[c.nodes[0],selected].filter((n,i,a)=>a.findIndex(x=>x.id===n.id)===i);
 const evidence=nodes.map(n=>({id:n.id,text:n.a[lang],question:n.q[lang],
  sourceUrl:n.source?.url||c.source.url,locus:n.source?.locus||c.source.locus,
  status:'UNVERIFIED_EDITORIAL_ADAPTATION_NOT_ORIGINAL_QUOTATION'}));
 if(evidence.some(x=>!x.text||!x.sourceUrl?.startsWith('https://')||!x.locus))
  return held('missing_editorial_witness_or_locator');
 const history=Array.isArray(input.history)?input.history.slice(-3).map(x=>({
  question:String(x.question||'').slice(0,240),response:String(x.response||'').slice(0,600)
 })).filter(x=>x.question&&x.response):[];
 return {status:'eligible',question,language:lang,evidence,history,chapterId:c.id};
}
const composerRules=[
 'Compose a PRIVATE, UNAPPROVED historical-character editorial demonstration, NOT a verified papal quotation.',
 'Use ONLY the supplied existing editorial text; the source URL is a locator, not verified passage evidence.',
 'No additional doctrine, history, biography, invented facts, recollections, or new examples.',
 'Respond to the actual question naturally using restrained period Catholic prose, without parody.',
 'No quotation marks or first-person historical memories. No absolution, confession, or individualized moral verdict.',
 'If the evidence does not support the requested answer, abstain.',
 'Output JSON ONLY: {"mode":"answer"|"abstain","text":"...","evidenceIds":["exact evidence ID"],"expression":"neutral"|"welcoming"|"explaining"|"thoughtful"|"grave"}.'
].join(' ');
const verifierRules=[
 'Independently test EVERY factual assertion in the candidate against the literal supplied editorial evidence.',
 'Evidence is NOT independently collated with the original work; source titles and locators cannot prove a claim.',
 'Reject any new assertion, unsupported inference, invented biographical detail, fabricated quotation, or individualized pastoral judgement.',
 'If unsure, reject. Output JSON ONLY: {"supported":true|false,"allClaimsSupported":true|false,"ids":["exact evidence ID"]}.'
].join(' ');
const parse=v=>typeof v==='string'?JSON.parse(v):v;
export async function composeDraft(store,input,model){
 const chosen=selectEvidence(store,input);if(chosen.status!=='eligible')return chosen;
 if(typeof model!=='function')return held('no_private_model_configured');
 try{
  const proposal=parse(await model('compose',[
   {role:'system',content:composerRules},
   {role:'user',content:JSON.stringify(chosen)}
  ]));
  if(proposal?.mode!=='answer')return held('out_of_covered_sources');
  const text=proposal.text;
  const ids=proposal.evidenceIds;
  if(typeof text!=='string'||text.trim().length<24||text.length>1200||
   /["“”«»]|<[^>]*>/.test(text)||
   /\b(?:I remember|I witnessed|I once met|in my childhood|I personally)\b/i.test(text)||
   !Array.isArray(ids)||ids.length<1||ids.some(x=>!chosen.evidence.some(e=>e.id===x)))
   return held('invalid_generated_content_or_reference');
  const candidate={text:text.trim(),ids};
  const review=parse(await model('verify',[
   {role:'system',content:verifierRules},
   {role:'user',content:JSON.stringify({candidate,evidence:chosen.evidence})}
  ]));
  if(review?.supported!==true||review?.allClaimsSupported!==true||
   !Array.isArray(review.ids)||ids.some(id=>!review.ids.includes(id)))
   return held('unsupported_or_unverified_generated_claim');
  const allowed=new Set(['neutral','welcoming','explaining','thoughtful','grave']);
  return {status:'draft',reply:candidate.text,
   expression:allowed.has(proposal.expression)?proposal.expression:'thoughtful',
   evidence:chosen.evidence.filter(e=>ids.includes(e.id)).map(e=>({
    id:e.id,sourceUrl:e.sourceUrl,locus:e.locus,status:e.status
   })),
   publishingApproved:false,originalTextCollated:false,
   label:'AI EDITORIAL DRAFT — NOT AN AUTHENTIC ST PIUS X QUOTATION OR APPROVED DOCTRINAL ANSWER'};
 }catch{return held('model_or_verifier_unavailable');}
}
export function configuredModel(env=process.env,fetchModel=fetch){
 if(!env.AO_SPX_MODEL_URL||!env.AO_SPX_MODEL)return null;
 const url=new URL(env.AO_SPX_MODEL_URL);
 const loopback=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 if(url.protocol!=='https:'&&!(url.protocol==='http:'&&loopback))
  throw new Error('Model endpoint must be HTTPS or localhost HTTP');
 return async(purpose,messages)=>{
  const control=new AbortController(),timer=setTimeout(()=>control.abort(),20000);
  try{
   const r=await fetchModel(url,{method:'POST',signal:control.signal,
    headers:{'content-type':'application/json',...(env.AO_SPX_MODEL_KEY?{authorization:'Bearer '+env.AO_SPX_MODEL_KEY}:{})},
    body:JSON.stringify({model:env.AO_SPX_MODEL,messages,stream:false,temperature:0.1,
     response_format:{type:'json_object'}})});
   if(!r.ok)throw new Error('model request failed');
   const value=await r.json();
   return parse(value.choices?.[0]?.message?.content);
  }finally{clearTimeout(timer);}
 };
}
export function makeReviewHTML(p6,client,css){
 readCorpus(p6);
 const anchor='$("spxc-main").innerHTML=conversationHTML();';
 if(p6.split(anchor).length!==2||p6.split('</body>').length!==2)throw new Error('Original scene owner changed');
 if(/<\/script/i.test(client)||/<\/style/i.test(css))throw new Error('Inline file contains forbidden end tag');
 const event='document.dispatchEvent(new CustomEvent("ao-spx-review-context",{detail:{chapterId:ui.id,nodeId:ui.selected.at(-1)||current()?.nodes[0]?.id||null,language:ui.lang}}));';
 return p6.replace(anchor,anchor+event).replace('</body>','<style>'+css+'</style><script>'+client+'</script></body>');
}
export function buildReviewHTML(){
 return makeReviewHTML(
  readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8'),
  readFileSync('previews/pius-x-study/spx-model-review-client.js','utf8'),
  readFileSync('previews/pius-x-study/spx-model-review-style.css','utf8')
 );
}
const readRequest=req=>new Promise((resolve,reject)=>{
 let s='';req.on('data',b=>{s+=b;if(s.length>5000){reject(new Error('Too large'));req.destroy();}});
 req.on('end',()=>{try{resolve(JSON.parse(s))}catch(e){reject(e)}});
 req.on('error',reject);
});
export function createReviewServer({html,model}){
 const store=readCorpus(html);let active=false;
 return createServer(async(req,res)=>{
  res.setHeader('cache-control','no-store');
  res.setHeader('x-content-type-options','nosniff');
  res.setHeader('referrer-policy','no-referrer');
  res.setHeader('content-security-policy',"default-src 'self' data: blob: 'unsafe-inline'; connect-src 'self'; img-src 'self' data: blob:; form-action 'self'; frame-ancestors 'none'");
  if(req.method==='GET'&&req.url==='/'){
   res.writeHead(200,{'content-type':'text/html; charset=utf-8'});res.end(html);return;
  }
  if(req.method==='POST'&&req.url==='/api/pius-x-review'){
   if(req.headers['x-ao-review']!=='1'||!String(req.headers['content-type']||'').startsWith('application/json')||
      (req.headers.origin&&req.headers.origin!=='http://'+req.headers.host)){
    res.writeHead(403,{'content-type':'application/json'});res.end(JSON.stringify(held('invalid_origin')));return;
   }
   if(active){res.writeHead(429,{'content-type':'application/json'});res.end(JSON.stringify(held('busy')));return;}
   active=true;
   try{
    const answer=await composeDraft(store,await readRequest(req),model);
    res.writeHead(answer.status==='held'?422:200,{'content-type':'application/json'});
    res.end(JSON.stringify(answer));
   }catch{
    res.writeHead(400,{'content-type':'application/json'});res.end(JSON.stringify(held('invalid_request')));
   }finally{active=false;}
   return;
  }
  res.writeHead(404);res.end('Not found');
 });
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 if(process.env.AO_SPX_REVIEW_MODE!=='1')throw new Error('Opt in with AO_SPX_REVIEW_MODE=1');
 const model=configuredModel();
 if(!model)throw new Error('Configure AO_SPX_MODEL_URL and AO_SPX_MODEL before starting');
 const port=Number(process.env.AO_SPX_REVIEW_PORT||8787);
 if(!Number.isSafeInteger(port)||port<1024||port>65535)throw new Error('Invalid port');
 const app=createReviewServer({html:buildReviewHTML(),model});
 app.listen(port,'127.0.0.1',()=>process.stdout.write('PRIVATE REVIEW http://127.0.0.1:'+port+' — not a verified papal transcript\n'));
}
