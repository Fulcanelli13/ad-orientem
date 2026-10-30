/**
 * SPX P2.56 — explicitly local, €0 PRIVATE desktop preview.
 * No GitHub-hosted CPU "server", paid provider, cloud secret, LAN exposure,
 * model download, listening on a public interface or publication.
 *
 * The operator starts a GPU-capable llama.cpp server on loopback first.
 * This script probes /health, optionally builds the ORIGINAL standalone
 * scene, serves source-gated model review on 127.0.0.1, and measures real
 * end-to-end EN/FR compose + verify performance on opt-in --benchmark.
 * Without a local model it does NOT silently substitute an external API.
 */
import {existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {buildReviewHTML,configuredModel,createReviewServer,readCorpus,
 composeDraft} from './pius-x-generative-review.mjs';
import {inspectLocalHardware,formatReadiness} from './pius-x-p57-device-readiness.mjs';

export const LOCAL_MODEL='Qwen2.5-7B-Instruct-Q4_K_M';
export const LOCAL_URL='http://127.0.0.1:8766/v1/chat/completions';
const BUDGET=180000;
const SCENE='artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html';
export function pilotPerformanceGate(ms){
 if(!Number.isFinite(ms)||ms<0)return 'NOT_MEASURED';
 if(ms<=15000)return 'INTERACTIVE_CANDIDATE_NEEDS_MORE_TESTING';
 if(ms<=45000)return 'SLOW_PRIVATE_PREVIEW_ONLY';
 return 'TOO_SLOW_FOR_LIVE_VISITOR_EXPERIENCE';
}
export function localPilotSettings(env=process.env){
 const model=env.AO_SPX_MODEL||LOCAL_MODEL;
 const selected=env.AO_SPX_MODEL_URL||LOCAL_URL;
 let url;
 try{url=new URL(selected)}catch{throw Error('Model URL is not valid');}
 if(url.protocol!=='http:'||url.hostname!=='127.0.0.1'||
    url.pathname!=='/v1/chat/completions'||url.port!== '8766'||
    url.username||url.password||url.search||url.hash)
  throw Error('P56 pilot REFUSES remote, paid, custom-port and LAN model endpoints');
 if(model!==LOCAL_MODEL)
  throw Error('P56 is pinned to the tested local Qwen 7B model alias');
 if(env.AO_SPX_MODEL_KEY)
  throw Error('P56 uses no provider key; remove AO_SPX_MODEL_KEY');
 if(env.AO_SPX_LOCAL_PILOT_MODE!=='I_AM_RUNNING_A_PRIVATE_LOCAL_MODEL')
  throw Error('P56 requires explicit AO_SPX_LOCAL_PILOT_MODE opt-in');
 return {
  AO_SPX_MODEL_URL:LOCAL_URL,AO_SPX_MODEL:LOCAL_MODEL,
  AO_SPX_MODEL_TIMEOUT_MS:String(BUDGET),AO_SPX_REVIEW_MODE:'1'
 };
}
export async function probeLocalModel(settings,fetchLocal=fetch){
 const url=new URL(settings.AO_SPX_MODEL_URL);
 const health=new URL('/health',url);
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),3500);
 try{
  const resp=await fetchLocal(health.toString(),{
   signal:controller.signal,redirect:'error',cache:'no-store'
  });
  if(!resp.ok)return {ready:false,reason:'local_model_not_ready',http:resp.status};
  const json=await resp.json().catch(()=>({}));
  if(json.status!=='ok')return {ready:false,reason:'local_model_not_loaded'};
  // An arbitrary healthy local server may expose a different model. Pin the
  // exact alias expected by the documentary source gates before serving.
  const models=await fetchLocal(new URL('/v1/models',url).toString(),{
   signal:controller.signal,redirect:'error',cache:'no-store'
  });
  if(!models.ok)return {ready:false,reason:'local_model_identity_unavailable'};
  const catalog=await models.json().catch(()=>({}));
  const ids=(Array.isArray(catalog.data)?catalog.data:[]).map(x=>x.id);
  if(!ids.includes(settings.AO_SPX_MODEL))
   return {ready:false,reason:'local_model_alias_mismatch',
    expectedAlias:settings.AO_SPX_MODEL};
  return {ready:true,reason:'LOCAL_7B_ALIAS_RUNNING',endpoint:'127.0.0.1:8766',
   verifiedModelIdentity:'SERVER_REPORTED_ALIAS_ONLY',paidServiceRequests:0};
 }catch{
  return {ready:false,reason:'local_model_not_running'};
 }finally{clearTimeout(timer);}
}
function prepareScene(){
 const steps=[
  'tools/build-pius-x-expanded-standalone.mjs',
  'tools/build-pius-x-next12-dialogues.mjs',
  'tools/build-pius-x-next12-pastoral-dialogues.mjs',
  'tools/build-pius-x-earlier-94-p6.mjs',
  'tools/build-pius-x-p26-offline-replay.mjs'
 ];
 for(const script of steps){
  const run=spawnSync(process.execPath,[script],{cwd:resolve('.'),stdio:'inherit'});
  if(run.status!==0)throw Error('Original source build failed: '+script);
 }
 if(!existsSync(SCENE))throw Error('Original source owner scene is missing');
}
function assertScene(){
 if(!existsSync(SCENE))
  throw Error('Missing original P6 scene; run --prepare first (requires the existing repo build scripts)');
}
export async function benchmarkLocal({settings,fetchModel,print=console.log}={}){
 assertScene();
 const {readFileSync}=await import('node:fs');
 const corpus=readCorpus(readFileSync(SCENE,'utf8'));
 const configured=configuredModel(settings,fetchModel);
 if(!configured)throw Error('No local model configured');
 const chapter=corpus.chapters.get('SPX-PILOT-01'),samples=[];
 let currentStages;
 const model=async(stage,messages)=>{
  const start=performance.now();
  try{return await configured(stage,messages)}
  finally{
   if(currentStages&&['compose','verify'].includes(stage))
    currentStages[stage].push(Math.round(performance.now()-start));
  }
 };
 for(const lang of ['en','fr']){
  const node=chapter.nodes[0],question=node.q[lang];
  currentStages={compose:[],verify:[]};
  const started=performance.now();
  const reply=await composeDraft(corpus,{
   chapterId:chapter.id,nodeId:node.id,language:lang,
   question,voiceMode:'historical',
   experimentalComposerProfile:'P53_ATOMIC_CLAIM_CUES'
  },model);
  const elapsedMs=Math.round(performance.now()-started);
  const status=pilotPerformanceGate(elapsedMs);
  const composeMs=currentStages.compose[0]??null;
  const verifyMs=currentStages.verify[0]??null;
  samples.push({language:lang,status:reply.status,
   reason:reply.reason||null,sourceNodeId:node.id,elapsedMs,
   composeMs,verifyMs,
   composeCalls:currentStages.compose.length,verifyCalls:currentStages.verify.length,
   interactivity:status,modelClaimsApproved:false,publishingApproved:false});
  print('SPX LOCAL REAL '+lang+' '+elapsedMs+'ms (composer '+composeMs+
   'ms, verifier '+(verifyMs??'not reached')+'ms) '+reply.status+' '+status);
 }
 return {
  schema:'AO_SPX_P56_LOCAL_GPU_BENCHMARK_V1',
  localOnly:true,independentSourceCertification:false,
  testSamples:samples,acceptedReplies:samples.filter(x=>x.status==='draft').length,
  viableForLiveVisitors:samples.every(x=>
   x.status==='draft'&&x.interactivity==='INTERACTIVE_CANDIDATE_NEEDS_MORE_TESTING'),
  paidRequests:0,sourceOwnerRecordsChanged:0,published:false
 };
}
export async function runP56(argv=process.argv.slice(2),env=process.env){
 const choice=argv[0]||'--help';
 if(!['--help','--hardware','--prepare','--diagnose','--serve','--benchmark'].includes(choice))
  throw Error('Use --hardware, --prepare, --diagnose, --serve, --benchmark or --help');
 if(choice==='--help'){
  console.log('SPX P56 LOCAL ONLY. First start llama-server on 127.0.0.1:8766 with Qwen2.5 7B Q4_K_M, GPU offload enabled.');
  console.log('Set AO_SPX_LOCAL_PILOT_MODE=I_AM_RUNNING_A_PRIVATE_LOCAL_MODEL.');
  console.log('Run --hardware to inspect your existing PC WITHOUT model setup or opt-in, --prepare for the offline scene, --diagnose to check the model, --benchmark to measure English/French composer/verifier latency, or --serve to open private local review.');
  console.log('This does not deliver a shared public mobile inference service; offline visual novel remains the fallback.');
  return {mode:'help'};
 }
 if(choice==='--hardware'){
  const report=inspectLocalHardware();
  console.log(formatReadiness(report));
  return {mode:'hardware',...report};
 }
 if(choice==='--prepare'){
  prepareScene();
  return {mode:'prepared',offline:'artifacts/pius-x-study-expanded/SPX_P26_Offline_Source_Dialogue_Demo.html'};
 }
 const settings=localPilotSettings(env);
 const probe=await probeLocalModel(settings);
 if(!probe.ready){
  console.log('NO LOCAL AI SERVICE: '+probe.reason+'. Offline source dialogue remains available after --prepare.');
  if(choice==='--diagnose')return {mode:'diagnose',...probe};
  throw Error('Start local llama-server with GPU acceleration; no remote fallback exists');
 }
 if(choice==='--diagnose'){
  console.log('LOCAL MODEL SERVER RESPONDS; model alias and GPU speed are NOT yet verified.');
  return {mode:'diagnose',...probe};
 }
 if(choice==='--benchmark'){
  return benchmarkLocal({settings});
 }
 assertScene();
 const port=Number(env.AO_SPX_REVIEW_PORT||8787);
 if(!Number.isSafeInteger(port)||port<1024||port>65535)
  throw Error('Invalid review port');
 const ordinary=buildReviewHTML();
 if(!ordinary.includes('</head>'))throw Error('Original study head is missing');
 const localHTML=ordinary.replace('</head>',
  '<meta name="ao-spx-p56-local" content="P53_ATOMIC_CLAIM_CUES"></head>');
 const server=createReviewServer({html:localHTML,model:configuredModel(settings)});
 await new Promise((resolve,reject)=>{
  server.once('error',reject);
  server.listen(port,'127.0.0.1',resolve);
 });
 console.log('PRIVATE SPX visual novel: http://127.0.0.1:'+port);
 console.log('Not exposed to phones over LAN, the public internet or an app store.');
 console.log('Before pilot expansion, benchmark. Four 7B CPU answers previously took 163–236 seconds each INCLUDING verification.');
 return {mode:'serve',server,port};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 runP56().catch(error=>{
  console.error('SPX local pilot refused: '+error.message);
  process.exitCode=1;
 });
}
