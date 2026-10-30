/**
 * P2.58 — no real GPU or model in CI.
 * Prove default no-network report, 2-stage EN/FR metrics, consent, useful
 * eligibility categories and no untrusted raw model texts in shareable output.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runP58,sanitizeP58Report,summarizeP58} from '../tools/pius-x-p58-device-report.mjs';

const PRIVATE='VERY_PRIVATE_DIALOGUE_API_KEY_HOSTNAME_PERSONAL_PATH';
const hardware={
 platform:'win32',architecture:'x64',systemRamGB:16,logicalCpuThreads:16,
 gpus:[{name:'NVIDIA RTX 3070',vramGB:8,vramMiB:8192}],
 category:'GPU_BENCHMARK_CANDIDATE',
 hostname:PRIVATE,serial:PRIVATE,devicePath:PRIVATE,username:PRIVATE
};
const benchmark={
 schema:'AO_SPX_P56_LOCAL_GPU_BENCHMARK_V1',
 viableForLiveVisitors:true,
 paidRequests:0,
 reply:PRIVATE,privateNotes:PRIVATE,
 testSamples:[
  {language:'en',status:'draft',reason:null,elapsedMs:10200,
   composeMs:6200,verifyMs:4000,composeCalls:1,verifyCalls:1,
   interactivity:'INTERACTIVE_CANDIDATE_NEEDS_MORE_TESTING',
   question:PRIVATE,response:PRIVATE,modelSecret:PRIVATE},
  {language:'fr',status:'draft',reason:null,elapsedMs:13300,
   composeMs:8200,verifyMs:5100,composeCalls:1,verifyCalls:1,
   interactivity:'INTERACTIVE_CANDIDATE_NEEDS_MORE_TESTING',
   question:PRIVATE,response:PRIVATE,modelSecret:PRIVATE}
 ]
};
const probe={ready:true,verifiedModelIdentity:'SERVER_REPORTED_ALIAS_ONLY',
 modelAuthorization:PRIVATE,modelWeightHashVerified:false};
const day='2026-10-24T18:10:00.000Z';
const r=sanitizeP58Report({hardware,probe,benchmark,
 requestedRealBenchmark:true,generatedAt:day});
assert.equal(r.schema,'AO_SPX_P58_PRIVATE_DEVICE_AND_LOCAL_MODEL_REPORT_V1');
assert.equal(r.decision,'EARLY_INTERACTIVE_CANDIDATE_NOT_CERTIFIED');
assert.equal(r.actualEndToEndModelBenchmarkObserved,true);
assert.equal(r.localModel.weightHashVerifiedByThisCommand,false);
assert.equal(r.localModel.reportedAliasVerified,true);
assert.equal(r.samples.length,2);
assert.equal(r.samples[0].composerMs,6200);
assert.equal(r.samples[1].verifierMs,5100);
assert.equal(r.release.published,false);
assert.equal(r.release.suitableFor20To50AndroidPhones,false);
assert.equal(JSON.stringify(r).includes(PRIVATE),false);
assert.equal(summarizeP58(r).includes(PRIVATE),false);
assert(!JSON.stringify(r).includes('hostname'));
assert(!JSON.stringify(r).includes('token'));
assert(!JSON.stringify(r).includes('question'));

const needsHw=sanitizeP58Report({hardware,generatedAt:day});
assert.equal(needsHw.decision,'HARDWARE_TRIAGE_ONLY');
assert.equal(needsHw.samples.length,0);
assert.equal(needsHw.localModel.checked,false);
assert.equal(needsHw.actualEndToEndModelBenchmarkObserved,false);

const unavailable=sanitizeP58Report({hardware,probe:{ready:false,reason:'local_model_not_running'},
 requestedRealBenchmark:true,generatedAt:day});
assert.equal(unavailable.decision,'NO_LOCAL_7B_SERVICE_OFFLINE_FALLBACK');
assert.equal(unavailable.samples.length,0);
assert.equal(unavailable.actualEndToEndModelBenchmarkObserved,false);

const tooSlow=sanitizeP58Report({hardware,probe,requestedRealBenchmark:true,
 benchmark:{...benchmark,testSamples:[
  {...benchmark.testSamples[0],elapsedMs:47000,
   interactivity:'TOO_SLOW_FOR_LIVE_VISITOR_EXPERIENCE'},
  benchmark.testSamples[1]]},generatedAt:day});
assert.equal(tooSlow.decision,'NOT_READY_FOR_LIVE_VISITORS');
const slow=sanitizeP58Report({hardware,probe,requestedRealBenchmark:true,
 benchmark:{...benchmark,testSamples:[
  {...benchmark.testSamples[0],elapsedMs:25000,
   interactivity:'SLOW_PRIVATE_PREVIEW_ONLY'},
  benchmark.testSamples[1]]},generatedAt:day});
assert.equal(slow.decision,'SLOW_OWNER_PC_DEMO_ONLY');
const held=sanitizeP58Report({hardware,probe,requestedRealBenchmark:true,
 benchmark:{...benchmark,testSamples:[
  {...benchmark.testSamples[0],status:'held',reason:'source_hold'},
  benchmark.testSamples[1]]},generatedAt:day});
assert.equal(held.decision,'NOT_READY_FOR_LIVE_VISITORS');
assert.equal(held.samples[0].holdReason,'source_hold');
const fail=sanitizeP58Report({hardware,probe,requestedRealBenchmark:true,
 benchmarkFailure:PRIVATE,generatedAt:day});
assert.equal(fail.decision,'BENCHMARK_ERROR_OFFLINE_FALLBACK');
assert.equal(JSON.stringify(fail).includes(PRIVATE),false);

const writes=new Map();
const io={
 mkdirSync(path,opts){
  assert.equal(path,'artifacts/pius-x-private-device-reports');
  assert.equal(opts.recursive,true);
 },
 writeFileSync(path,content,opts){
  assert.equal(opts.flag,'wx');
  assert.equal(opts.mode,0o600);
  assert(!writes.has(path));
  writes.set(path,content);
 }
};
let inspects=0,probes=0,benchmarks=0,settings=0;
const hardwareInspector=()=>{inspects++;return hardware;};
const settingsBuilder=(env)=>{
 settings++;
 assert.equal(env.AO_SPX_LOCAL_PILOT_MODE,'I_AM_RUNNING_A_PRIVATE_LOCAL_MODEL');
 return {AO_SPX_MODEL:'Qwen2.5-7B-Instruct-Q4_K_M'};
};
const modelProber=async()=>{
 probes++;return probe;
};
const benchmarkRunner=async()=>{
 benchmarks++;return benchmark;
};
const silent=()=>{};
const mkArgs=args=>({
 args,hardwareInspector,settingsBuilder,modelProber,benchmarkRunner,
 io,print:silent,now:()=>new Date(day)
});
const hw=await runP58(mkArgs([]));
assert.equal(inspects,1);
assert.equal(settings,0);
assert.equal(probes,0);
assert.equal(benchmarks,0);
assert.equal(hw.report.decision,'HARDWARE_TRIAGE_ONLY');
assert(writes.get(hw.jsonPath).includes('HARDWARE_TRIAGE_ONLY'));
assert(writes.get(hw.textPath).includes('PRIVATE LOCAL TEST'));
// Use an alternate timestamp for the second file in this deterministic test.
const nextDay='2026-10-24T18:10:00.100Z';
const real=await runP58({...mkArgs(['--benchmark']),
 env:{AO_SPX_LOCAL_PILOT_MODE:'I_AM_RUNNING_A_PRIVATE_LOCAL_MODEL'},
 now:()=>new Date(nextDay)});
assert.equal(inspects,2);assert.equal(settings,1);
assert.equal(probes,1);assert.equal(benchmarks,1);
assert.equal(real.report.decision,'EARLY_INTERACTIVE_CANDIDATE_NOT_CERTIFIED');
assert.equal(real.report.samples.length,2);
assert.deepEqual(real.report.samples.map(s=>s.language),['en','fr']);
assert.equal(writes.size,4);
for(const content of writes.values())assert.equal(content.includes(PRIVATE),false);
assert.throws(()=>sanitizeP58Report({hardware:null}),/requires a locally/);
await assert.rejects(runP58({...mkArgs(['--foo']),
 now:()=>new Date('2026-10-24T18:10:01.000Z')}),/Use no arguments/);
assert.match(readFileSync('tools/pius-x-p58-private-pc-check.cmd','utf8'),
 /node "tools\\pius-x-p58-device-report.mjs"/);
assert.match(readFileSync('.gitignore','utf8'),/pius-x-private-device-reports\//);
console.log('PASS SPX_P58_PRIVATE_PC_REPORT '+JSON.stringify({
 hardwareOnlyNoNetwork:true,explicitLocalModelOptIn:true,
 modelSimulationOnly:true,realUserGpuMeasurementHere:false,
 validEnglishFrenchSeparateTimings:true,safeShareableOutput:true,
 rawPapalDialogueExcluded:true,cloudKeysExcluded:true,
 decisionBranchesCovered:7,reportFilesGitIgnored:true,
 publicationApproved:false
}));
