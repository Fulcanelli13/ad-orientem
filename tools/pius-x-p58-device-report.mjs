/**
 * SPX P2.58 — private, shareable no-secrets PC report.
 *
 * DEFAULT: inspect local hardware only, with zero network access.
 * --benchmark: expressly requested actual LOCAL llama.cpp inference and
 * pre-existing owner opt-in. Neither branch uses a cloud provider.
 *
 * The report deliberately excludes any model prompt, papal draft answer,
 * computer username/hostname, serial number, local directory, environment
 * variable, credential or public IP address. It is locally saved in a
 * git-ignored folder and never uploaded by this script.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {inspectLocalHardware} from './pius-x-p57-device-readiness.mjs';
import {localPilotSettings,probeLocalModel,benchmarkLocal} from './pius-x-p56-local-pilot.mjs';

const REPORT_DIR='artifacts/pius-x-private-device-reports';
const REPORT_SCHEMA='AO_SPX_P58_PRIVATE_DEVICE_AND_LOCAL_MODEL_REPORT_V1';
const SAFE_LANG=new Set(['en','fr']);
const SAFE_OUTCOME=new Set(['draft','held']);
const SAFE_GATE=new Set([
 'INTERACTIVE_CANDIDATE_NEEDS_MORE_TESTING',
 'SLOW_PRIVATE_PREVIEW_ONLY','TOO_SLOW_FOR_LIVE_VISITOR_EXPERIENCE','NOT_MEASURED'
]);
const num=(v,min=0,max=1e7)=>Number.isFinite(v)&&v>=min&&v<=max?
 Math.round(v*10)/10:null;
const word=(v,max=110)=>String(v||'unknown').replace(/[^\p{L}\p{N}_+ .()-]/gu,'')
 .slice(0,max)||'unknown';
const reason=v=>/^[a-z][a-z0-9_]{0,80}$/.test(String(v||''))?v:null;

export function sanitizeP58Report({
 hardware,probe=null,benchmark=null,benchmarkFailure=null,
 requestedRealBenchmark=false,generatedAt='',
}={}){
 if(!hardware||typeof hardware!=='object')
  throw Error('P58 requires a locally inspected hardware record');
 const gpuList=Array.isArray(hardware.gpus)?hardware.gpus:[];
 const samples=Array.isArray(benchmark?.testSamples)?
  benchmark.testSamples.filter(x=>SAFE_LANG.has(x.language)).slice(0,2).map(x=>({
   language:x.language,
   outcome:SAFE_OUTCOME.has(x.status)?x.status:'unknown',
   holdReason:reason(x.reason),
   totalMs:num(x.elapsedMs),composerMs:num(x.composeMs),
   verifierMs:num(x.verifyMs),
   composerCalls:num(x.composeCalls,0,5),
   verifierCalls:num(x.verifyCalls,0,5),
   latencyClass:SAFE_GATE.has(x.interactivity)?x.interactivity:'NOT_MEASURED',
   published:false,independentPapalClaimApproval:false
  })):[];
 const observed=!!requestedRealBenchmark&&benchmark?.schema===
  'AO_SPX_P56_LOCAL_GPU_BENCHMARK_V1'&&samples.length===2;
 const ready=!!probe?.ready;
 let decision='HARDWARE_TRIAGE_ONLY';
 if(requestedRealBenchmark){
  if(benchmarkFailure)decision='BENCHMARK_ERROR_OFFLINE_FALLBACK';
  else if(!ready)decision='NO_LOCAL_7B_SERVICE_OFFLINE_FALLBACK';
  else if(!observed)decision='NO_COMPLETE_LOCAL_BENCHMARK';
  else if(samples.some(x=>x.outcome!=='draft'||
   x.latencyClass==='TOO_SLOW_FOR_LIVE_VISITOR_EXPERIENCE'))
   decision='NOT_READY_FOR_LIVE_VISITORS';
  else if(samples.every(x=>x.latencyClass==='INTERACTIVE_CANDIDATE_NEEDS_MORE_TESTING'))
   decision='EARLY_INTERACTIVE_CANDIDATE_NOT_CERTIFIED';
  else decision='SLOW_OWNER_PC_DEMO_ONLY';
 }
 return {
  schema:REPORT_SCHEMA,generatedUTC:generatedAt,
  reportCreatedLocally:true,uploadedToService:false,
  requestedActualModelBenchmark:!!requestedRealBenchmark,
  actualEndToEndModelBenchmarkObserved:observed,
  hardware:{
   operatingSystem:word(hardware.platform,16),
   architecture:word(hardware.architecture,16),
   systemRamGB:num(hardware.systemRamGB,0,2048),
   logicalCpuThreads:num(hardware.logicalCpuThreads,0,512),
   nvidiaGPUs:gpuList.slice(0,6).map(g=>({
    model:word(g.name,100),installedVramGB:num(g.vramGB,0,256)
   })),
   gpuClassification:word(hardware.category,90),
   hardwareAssessment:'TRIAGE_ONLY_NOT_MODEL_BENCHMARK',
   otherGpuTypesMayBePresent:true
  },
  localModel:{
   checked:!!requestedRealBenchmark,
   ready:!!requestedRealBenchmark&&ready,
   reportedAliasVerified:!!requestedRealBenchmark&&ready&&
    probe.verifiedModelIdentity==='SERVER_REPORTED_ALIAS_ONLY',
   endpoint:'127.0.0.1:8766_ONLY',
   weightHashVerifiedByThisCommand:false,
   failureReason:!!requestedRealBenchmark&&!ready?
    reason(probe?.reason)||'not_running':null
  },
  samples,decision,
  benchmarkFailure:benchmarkFailure?'local_benchmark_error':null,
  release:{sourceOwnerRecordsChanged:0,translationsCertified:0,
   authenticPapalQuotationsCertified:0,published:false,
   suitableFor20To50AndroidPhones:false},
  limitations:[
   'GPU details are local hardware triage, not a verified GPU-offload measurement.',
   'The local model alias alone cannot attest a GGUF weight file hash.',
   'Passing two source-limited calls never certifies theological accuracy or speed under multiple concurrent users.',
   'No phone-native 7B runtime or free shared public AI backend is established.'
  ]
 };
}

export function summarizeP58(report){
 const g=report.hardware;
 const lines=[
  'St Pius X / Ad Orientem — PRIVATE LOCAL TEST',
  'Device: '+g.operatingSystem+' '+g.architecture+', '+g.systemRamGB+' GB RAM',
  'GPU: '+(g.nvidiaGPUs.length?
   g.nvidiaGPUs.map(x=>x.model+' ('+x.installedVramGB+' GB)').join('; '):
   'No NVIDIA GPU detected (AMD/Intel not ruled out)'),
  'Hardware: '+g.gpuClassification,
  'Model benchmark: '+(report.actualEndToEndModelBenchmarkObserved?
   'real localhost compose/verify measured':'NOT MEASURED'),
  ...report.samples.map(x=>x.language.toUpperCase()+': '+x.outcome+
   ', total '+x.totalMs+' ms, compose '+(x.composerMs??'–')+
   ' ms, verify '+(x.verifierMs??'not reached')+' ms'),
  'Decision: '+report.decision,
  'Not a publication, theological approval or phone-readiness certificate.',
  'No private dialogue, credentials or host identifiers included.'
 ];
 return lines.join('\n');
}

export async function runP58({
 args=process.argv.slice(2),
 env=process.env,
 hardwareInspector=inspectLocalHardware,
 settingsBuilder=localPilotSettings,
 modelProber=probeLocalModel,
 benchmarkRunner=benchmarkLocal,
 now=()=>new Date(),
 dir=REPORT_DIR,
 io={mkdirSync,writeFileSync},
 print=console.log
}={}){
 const allowed=new Set(['--hardware','--benchmark']);
 if(args.some(a=>!allowed.has(a))||args.length>1)
  throw Error('Use no arguments (hardware-only) or --benchmark (actual local model, requires explicit local consent)');
 const benchmarkRequested=args.includes('--benchmark');
 const hardware=hardwareInspector();
 let probe=null,benchmark=null,benchmarkFailure=null;
 if(benchmarkRequested){
  // Never bypass P56's pinned localhost-only endpoint, exact alias, or
  // explicit local-model opt-in; do not silently contact a paid service.
  const settings=settingsBuilder(env);
  try{
   probe=await modelProber(settings);
   if(probe.ready)benchmark=await benchmarkRunner({settings,print:()=>{}});
  }catch{benchmarkFailure='local_benchmark_error';}
 }
 const time=now().toISOString();
 const report=sanitizeP58Report({hardware,probe,benchmark,benchmarkFailure,
  requestedRealBenchmark:benchmarkRequested,generatedAt:time});
 const name='SPX_P58_'+time.replace(/[:.]/g,'-');
 io.mkdirSync(dir,{recursive:true,mode:0o700});
 const jsonPath=join(dir,name+'.json');
 const textPath=join(dir,name+'.txt');
 // Local-only; Windows ACLs depend on the parent folder.
 io.writeFileSync(jsonPath,JSON.stringify(report,null,2)+'\n',
  {encoding:'utf8',mode:0o600,flag:'wx'});
 io.writeFileSync(textPath,summarizeP58(report)+'\n',
  {encoding:'utf8',mode:0o600,flag:'wx'});
 print(summarizeP58(report));
 print('Local-only report (not uploaded): '+resolve(textPath));
 print('Machine-readable report: '+resolve(jsonPath));
 return {report,jsonPath,textPath};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)
 runP58().catch(e=>{
  console.error('SPX device report refused: '+e.message);
  process.exitCode=1;
 });
