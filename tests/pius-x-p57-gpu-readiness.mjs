import assert from 'node:assert/strict';
import {parseNvidiaSmi,classifyLocalHardware,inspectLocalHardware,formatReadiness}
 from '../tools/pius-x-p57-device-readiness.mjs';
import {pilotPerformanceGate,runP56} from '../tools/pius-x-p56-local-pilot.mjs';

const mebibyte=1024**2;
assert.deepEqual(parseNvidiaSmi('8192, NVIDIA GeForce RTX 3070\n'),[
 {vramMiB:8192,vramGB:8,name:'NVIDIA GeForce RTX 3070'}
]);
assert.deepEqual(parseNvidiaSmi('6144, NVIDIA RTX A2000\n12288, NVIDIA RTX 3060\n').map(x=>x.vramGB),
 [6,12]);
assert.deepEqual(parseNvidiaSmi('NVIDIA-SMI has failed because it could not communicate with the NVIDIA driver.'),[]);
assert.deepEqual(parseNvidiaSmi(''),[]);
assert.deepEqual(parseNvidiaSmi('garbled, GPU'),[]);
assert.equal(classifyLocalHardware({ramGB:16,gpus:[{vramGB:8}]}).category,'GPU_BENCHMARK_CANDIDATE');
assert.equal(classifyLocalHardware({ramGB:16,gpus:[{vramGB:6}]}).category,'MEASURE_BEFORE_JUDGING');
assert.equal(classifyLocalHardware({ramGB:8,gpus:[{vramGB:16}]}).category,'MEASURE_BEFORE_JUDGING');
assert.equal(classifyLocalHardware({ramGB:16,gpus:[]}).category,'GPU_NOT_DETECTED');
assert.equal(classifyLocalHardware({ramGB:0,gpus:[]}).category,'HARDWARE_UNKNOWN');
let calls=0;
const report=inspectLocalHardware({
 osPlatform:'win32',osArch:'x64',ramBytes:16*1024*mebibyte,
 cpuCount:16,
 exec(command,args,opts){
  calls++;
  assert.equal(command,'nvidia-smi');
  assert.deepEqual(args,['--query-gpu=memory.total,name','--format=csv,noheader,nounits']);
  assert.equal(opts.timeout,4500);
  return {status:0,stdout:'8192, NVIDIA GeForce RTX 3070\n'};
 }
});
assert.equal(calls,1);
assert.equal(report.category,'GPU_BENCHMARK_CANDIDATE');
assert.equal(report.platform,'win32');
assert.equal(report.architecture,'x64');
assert.equal(report.systemRamGB,16);
assert.equal(report.logicalCpuThreads,16);
assert.equal(report.assessedLocally,true);
assert.equal(report.networkCalls,0);
assert.equal(report.modelLoaded,false);
assert.equal(report.gpuBackendVerified,false);
assert.equal(report.publicationApproved,false);
assert.match(formatReadiness(report),/NVIDIA GeForce RTX 3070/);
assert.match(formatReadiness(report),/No actual GPU model-response speed has been measured/);
assert(!JSON.stringify(report).includes('serial'));
const noNvidia=inspectLocalHardware({
 osPlatform:'win32',osArch:'x64',ramBytes:16*1024*mebibyte,
 cpuCount:8,exec(){return {status:1,stdout:'',stderr:'nvidia-smi unavailable'};}
});
assert.equal(noNvidia.category,'GPU_NOT_DETECTED');
assert.match(formatReadiness(noNvidia),/AMD\/Intel GPUs not ruled out/);
// Hardware-only diagnostic does NOT require local model opt-in, server or key.
const diag=await runP56(['--hardware'],{
 AO_SPX_MODEL_URL:'https://this.example.net/v1/chat/completions',
 AO_SPX_MODEL_KEY:'SHOULD_NOT_BE_CONSUMED'
});
assert.equal(diag.mode,'hardware');
assert.equal(diag.networkCalls,0);
assert.equal(diag.published,false,undefined); // no fake production readiness assertion
assert.equal(pilotPerformanceGate(14999),'INTERACTIVE_CANDIDATE_NEEDS_MORE_TESTING');
assert.equal(pilotPerformanceGate(15001),'SLOW_PRIVATE_PREVIEW_ONLY');
assert.equal(pilotPerformanceGate(45001),'TOO_SLOW_FOR_LIVE_VISITOR_EXPERIENCE');
console.log('PASS SPX_P57_HARDWARE_PRECHECK '+JSON.stringify({
 syntheticWindowsGpu:1,syntheticNoGpu:1,networkCalls:0,
 actualGpuBenchmark:false,modelIdentityUnproven:true,
 expectedOfflineSourceOwners:423,published:false
}));
