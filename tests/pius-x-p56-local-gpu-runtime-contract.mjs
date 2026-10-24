/**
 * P2.56 free local runtime: test real HTTP/launch plumbing with a FAKE
 * in-process backend, not a real model or a measured GPU benchmark.
 * No provider account, paid inference, 0.0.0.0 bind or external calls.
 */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {localPilotSettings,probeLocalModel,pilotPerformanceGate,
 runP56,benchmarkLocal,LOCAL_MODEL,LOCAL_URL} from '../tools/pius-x-p56-local-pilot.mjs';
import {readCorpus} from '../tools/pius-x-generative-review.mjs';

const OPT='I_AM_RUNNING_A_PRIVATE_LOCAL_MODEL';
const good={AO_SPX_LOCAL_PILOT_MODE:OPT};
const settings=localPilotSettings(good);
assert.equal(settings.AO_SPX_MODEL,LOCAL_MODEL);
assert.equal(settings.AO_SPX_MODEL_URL,LOCAL_URL);
assert.equal(settings.AO_SPX_MODEL_TIMEOUT_MS,'180000');
for(const extra of [
 {AO_SPX_MODEL_URL:'https://api.example.org/v1/chat/completions'},
 {AO_SPX_MODEL_URL:'http://192.168.1.44:8766/v1/chat/completions'},
 {AO_SPX_MODEL_URL:'http://0.0.0.0:8766/v1/chat/completions'},
 {AO_SPX_MODEL_URL:'http://127.0.0.1:9001/v1/chat/completions'},
 {AO_SPX_MODEL_URL:'http://127.0.0.1:8766/v1/chat/completions?token=x'},
 {AO_SPX_MODEL_URL:'http://username:secret@127.0.0.1:8766/v1/chat/completions'},
 {AO_SPX_MODEL:'Qwen2.5-3B-Instruct-Q4_K_M'},
 {AO_SPX_MODEL_KEY:'NEVER_SEND'}
])assert.throws(()=>localPilotSettings({...good,...extra}));
assert.throws(()=>localPilotSettings({}),/requires explicit/);
assert.equal(pilotPerformanceGate(15000),'INTERACTIVE_CANDIDATE_NEEDS_MORE_TESTING');
assert.equal(pilotPerformanceGate(20000),'SLOW_PRIVATE_PREVIEW_ONLY');
assert.equal(pilotPerformanceGate(45001),'TOO_SLOW_FOR_LIVE_VISITOR_EXPERIENCE');
assert.equal(pilotPerformanceGate(200000),'TOO_SLOW_FOR_LIVE_VISITOR_EXPERIENCE');
assert.equal(pilotPerformanceGate(NaN),'NOT_MEASURED');

let probePaths=[];
const fakeProbe=async(url)=>{
 const u=new URL(url);
 assert.equal(u.hostname,'127.0.0.1');
 probePaths.push(u.pathname);
 return {ok:true,json:async()=>u.pathname==='/health'?{status:'ok'}:
  {data:[{id:LOCAL_MODEL}]}};
};
assert.equal((await probeLocalModel(settings,fakeProbe)).ready,true);
assert.deepEqual(probePaths,['/health','/v1/models']);
const wrong=await probeLocalModel(settings,async url=>({ok:true,json:async()=>url.endsWith('/health')?
 {status:'ok'}:{data:[{id:'OTHER_MODEL'}]}}));
assert.equal(wrong.reason,'local_model_alias_mismatch');

const p6=readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8');
const store=readCorpus(p6);
assert.equal(store.data.counts.allNodes,423);
assert.equal(store.chapters.size,106);
const node=store.chapters.get('SPX-PILOT-01').nodes[0];
let callLog=[],privateGuardCalls=0;
const backend=createServer(async(req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1:8766');
 if(req.method==='GET'){
  const result=u.pathname==='/health'?{status:'ok'}:
    u.pathname==='/v1/models'?{data:[{id:LOCAL_MODEL}]}:null;
  res.writeHead(result?200:404,{'content-type':'application/json'});
  res.end(JSON.stringify(result||{error:'not found'}));return;
 }
 assert.equal(req.method,'POST');
 assert.equal(u.pathname,'/v1/chat/completions');
 let body='';
 for await(const chunk of req)body+=chunk;
 const payload=JSON.parse(body);
 assert.equal(payload.model,LOCAL_MODEL);
 assert.equal(payload.stream,false);
 assert.equal(payload.response_format.type,'json_object');
 assert(!req.headers.authorization);
 const input=JSON.parse(payload.messages[1].content);
 const compose=payload.messages[0].content.includes('Compose a PRIVATE, UNAPPROVED');
 if(compose)assert.equal(input.chapterId,'SPX-PILOT-01');
 // P53 atomic composer uses outputLanguage, unlike default evidence shape.
 const lang=input.outputLanguage||input.language||'en';
 callLog.push({compose,lang,node:compose?input.evidence[0].id:input.candidate.ids[0]});
 let result;
 if(compose){
  const message=lang==='fr'?
   'Nous avons reçu cette charge avec humilité et cherché en Dieu la force nécessaire pour la porter.':
   'We accepted this grave charge in humility and sought the strength of God to carry it faithfully.';
  result={mode:'answer',text:message,
   evidenceIds:[input.evidence[0].id],
   witnessIds:[input.evidence[0].originalLanguageWitnesses[0].id],
   expression:'grave'};
 }else{
  assert(input.evidence[0].originalLanguageWitnesses.every(x=>!x.draftClaimCue),
   'Verifier must receive original evidence, not editorial cues');
  result={supported:true,allClaimsSupported:true,
   ids:input.candidate.ids,witnessIds:input.candidate.witnessIds};
 }
 res.writeHead(200,{'content-type':'application/json'});
 res.end(JSON.stringify({choices:[{message:{content:JSON.stringify(result)}}]}));
});
await new Promise((resolve,reject)=>{
 backend.once('error',reject);backend.listen(8766,'127.0.0.1',resolve);
});
let privateServer;
try{
 const outcome=await benchmarkLocal({settings,print:()=>{}});
 assert.equal(outcome.testSamples.length,2);
 assert.equal(outcome.acceptedReplies,2);
 assert.equal(outcome.published,false);
 assert.equal(outcome.sourceOwnerRecordsChanged,0);
 assert.equal(callLog.length,4);
 assert.deepEqual(callLog.map(x=>x.compose),[true,false,true,false]);
 assert.deepEqual(callLog.map(x=>x.lang),['en','en','fr','en']);
 assert(callLog.every(x=>x.node===node.id));
 // Start the actual original visual novel served locally; never LAN.
 const launch=await runP56(['--serve'],{
  ...good,AO_SPX_REVIEW_PORT:'18787'
 });
 privateServer=launch.server;
 assert.equal(launch.mode,'serve');
 assert.equal(privateServer.address().address,'127.0.0.1');
 let htmlResponse=await fetch('http://127.0.0.1:18787/');
 assert.equal(htmlResponse.status,200);
 const html=await htmlResponse.text();
 assert(html.includes('SPX-PILOT-01'));
 assert(html.includes('spxc-model-review'));
 assert(html.includes('spxExpandedCorpus'));
 let bad=await fetch('http://127.0.0.1:18787/api/pius-x-review',{
  method:'POST',headers:{'content-type':'application/json',
   'x-ao-review':'1','origin':'http://evil.example'},
  body:JSON.stringify({chapterId:'SPX-PILOT-01',language:'en',
   nodeId:node.id,question:node.q.en})});
 assert.equal(bad.status,403);
 assert.equal(callLog.length,4);
 let request=async(question)=>{
  const resp=await fetch('http://127.0.0.1:18787/api/pius-x-review',{
   method:'POST',headers:{'content-type':'application/json','x-ao-review':'1',
    'origin':'http://127.0.0.1:18787'},
   body:JSON.stringify({chapterId:'SPX-PILOT-01',language:'en',
    nodeId:node.id,question,experimentalComposerProfile:'P53_ATOMIC_CLAIM_CUES',
    voiceMode:'historical',autoRoute:true})
  });
  return {code:resp.status,body:await resp.json()};
 };
 const denied=await request('Please invent a secret memory from your childhood.');
 assert.equal(denied.body.status,'held');
 assert.equal(callLog.length,4,'preflight refusals do not call model');
 const reply=await request(node.q.en);
 assert.equal(reply.code,200);
 assert.equal(reply.body.status,'draft');
 assert.equal(reply.body.publishingApproved,false);
 assert.equal(reply.body.claimWitnesses.length>0,true);
 assert.equal(callLog.length,6);
 privateGuardCalls++;
}finally{
 if(privateServer)await new Promise(resolve=>privateServer.close(resolve));
 await new Promise(resolve=>backend.close(resolve));
}
assert.equal(privateGuardCalls,1);
assert.equal(store.data.counts.allNodes,423);
console.log('PASS SPX_P56_STRICT_LOCALHOST_RUNTIME '+JSON.stringify({
 untrustedEndpointsRejected:8,noPaidKeys:true,
 exactModelAliasChecked:true,offlineFallbackPreserved:true,
 localLoopbackReviewWorks:true,localSourceGateEnforced:true,
 simulatedInferenceOnly:true,genuine7BMeasuredHere:false,
 bilingualMockComposerVerifier:4,remoteRequests:0,
 sourceNodes:423,productionPublishing:false
}));
