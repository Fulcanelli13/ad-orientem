/**
 * SPX P2.57 — €0 local GPU hardware/readiness check.
 * Does not upload identifiers, contact a network address, download weights,
 * invent machine specifications, or certify model performance.
 *
 * GPU memory estimates are advisory; shared memory and many Intel/AMD GPUs
 * are not reliably exposed by NVIDIA tools. A real llama.cpp benchmark is
 * the only meaningful performance test on the owner's hardware.
 */
import {totalmem,platform,arch,cpus} from 'node:os';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';

const minRamGB=12;
const candidateVramGB=8;
const GB=1024**3;
export function parseNvidiaSmi(text){
 const data=String(text||'').trim();
 if(!data||/^NVIDIA-SMI has failed/i.test(data))return [];
 return data.split(/\r?\n/).filter(Boolean).flatMap(line=>{
  // nvidia-smi --query-gpu=memory.total,name --format=csv,noheader,nounits
  // Values are in MiB. GPU names may contain a comma; parse the first field.
  const m=line.match(/^\s*(\d+)\s*,\s*(.+?)\s*$/);
  if(!m)return [];
  const mb=Number(m[1]);
  if(!Number.isFinite(mb)||mb<=0)return [];
  return [{vramMiB:mb,vramGB:Math.round(mb/1024*10)/10,
   // Hardware device names come from a local process; no serial numbers.
   name:m[2].replace(/[^\p{L}\p{N}\s.,+()_-]/gu,'').slice(0,100)}];
 });
}
export function classifyLocalHardware({ramGB,gpus=[]}={}){
 if(!Number.isFinite(ramGB)||ramGB<=0)
  return {category:'HARDWARE_UNKNOWN',gpuReady:false,reason:'ram_unknown'};
 if(gpus.some(x=>x.vramGB>=candidateVramGB)&&ramGB>=minRamGB)
  return {category:'GPU_BENCHMARK_CANDIDATE',gpuReady:true,
   reason:'nvidia_gpu_memory_and_system_ram_sufficient_for_first_test'};
 if(gpus.length>0)
  return {category:'MEASURE_BEFORE_JUDGING',gpuReady:false,
   reason:gpus.every(x=>x.vramGB<candidateVramGB)?
    'nvidia_vram_below_initial_8gb_target':
    'system_ram_below_12gb_initial_target'};
 return {category:'GPU_NOT_DETECTED',gpuReady:false,
  reason:'nvidia_smi_does_not_assess_amd_intel_or_apple_acceleration'};
}
export function inspectLocalHardware({
 osPlatform=platform(),osArch=arch(),ramBytes=totalmem(),
 cpuCount=cpus().length,exec=spawnSync
}={}){
 const args=['--query-gpu=memory.total,name','--format=csv,noheader,nounits'];
 const result=exec('nvidia-smi',args,{timeout:4500,encoding:'utf8',
  windowsHide:true,maxBuffer:1024*64});
 const gpus=result?.status===0?parseNvidiaSmi(result.stdout):[];
 const ramGB=Math.round(ramBytes/GB*10)/10;
 return {
  schema:'AO_SPX_P57_PRIVATE_DEVICE_READINESS_V1',
  assessedLocally:true,networkCalls:0,
  platform:osPlatform,architecture:osArch,
  systemRamGB:ramGB,logicalCpuThreads:Number(cpuCount)||null,
  nvidiaGpuDetected:gpus.length>0,
  gpus,
  gpuBackendVerified:false,modelLoaded:false,
  sourceOwnerModified:false,publicationApproved:false,
  ...classifyLocalHardware({ramGB,gpus}),
  caveats:[
   'A detection result is not a real llama.cpp GPU benchmark.',
   'NVIDIA-SMI cannot detect many AMD/Intel/Apple GPUs.',
   'Reported VRAM is installed memory, not necessarily free model memory.',
   'No GPU speed, phone feasibility, or 20-50-user service capacity is established.'
  ]
 };
}
export function formatReadiness(report){
 return [
  'SPX P2.57 private hardware preflight — no internet or upload',
  'Platform: '+report.platform+' '+report.arch,
  'System RAM: '+report.systemRamGB+' GB',
  'Logical CPU threads: '+(report.logicalCpuThreads??'unknown'),
  'NVIDIA GPU: '+(report.gpus.length?
   report.gpus.map(g=>g.name+' ('+g.vramGB+' GB VRAM)').join('; '):
   'Not detected by NVIDIA-SMI (AMD/Intel GPUs not ruled out)'),
  'Readiness: '+report.category+' — '+report.reason,
  'No actual GPU model-response speed has been measured.',
  'For real speed: start llama-server bound to 127.0.0.1 and run --benchmark.'
 ].join('\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const report=inspectLocalHardware();
 console.log(formatReadiness(report));
 if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
}
