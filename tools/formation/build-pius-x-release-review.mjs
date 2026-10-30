import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../..',import.meta.url)));
const dataPath=resolve(root,'data/learn/research/pius-x-100answer-editorial-release-triage-20261020.v1.json');
const template=resolve(root,'previews/visible-mass-3d/pius-x-batch-release-editorial-review.html');
const auditPath=resolve(root,'data/learn/research/pius-x-first40-claim-italian-witness-review-20261020.v1.json');
const output=resolve(process.argv[2]||resolve(root,'artifacts/pius-x-release-review/SPX_40_Answer_Editorial_Batch_Review.html'));
const data=JSON.parse(await readFile(dataPath,'utf8'));
const audit=JSON.parse(await readFile(auditPath,'utf8'));
if(audit.schema!=='AO_SPX_40_SOURCE_CLAIM_AUDIT_V1'||audit.records?.length!==40||
 audit.counts?.eligibleForPublication!==0||audit.counts?.independentlySignedOff!==0||
 audit.records.some(x=>x.attestation?.published!==false||x.attestation?.humanBilingualApproval!==false||
 x.attestation?.humanTheologyApproval!==false))throw Error('Refusing unapproved changed source review');
if(data.schema!=='AO_SPX_100ANSWER_EDITORIAL_RELEASE_TRIAGE_V1'||
 data.records.length!==100||data.waves.length!==4||
 data.waves.some(x=>x.count!==10)||data.counts.firstWave!==40||
 data.counts.published!==0||
 data.records.some(x=>x.published!==false||x.denzingerRequired!==false||
 Object.values(x.approval).some(v=>v!=='NOT_SIGNED_OFF')))
 throw Error('Blocked: uncertified research data may not be promoted to standalone reviewer');
let html=await readFile(template,'utf8');
const marker='const EMBEDDED=null;';
if(!html.includes(marker))throw Error('Review UI embed contract changed');
const safe=JSON.stringify(data).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
html=html.replace(marker,'const EMBEDDED='+safe+';');
const auditMarker='const EMBEDDED_AUDIT=null;';
if(!html.includes(auditMarker))throw Error('Claim audit embed contract changed');
const auditSafe=JSON.stringify(audit).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
html=html.replace(auditMarker,'const EMBEDDED_AUDIT='+auditSafe+';');
if(html.includes(marker)||html.includes('const EMBEDDED=null')||html.includes(auditMarker))throw Error('Offline payload absent');
await mkdir(dirname(output),{recursive:true});await writeFile(output,html,'utf8');
console.log(JSON.stringify({output,bytes:Buffer.byteLength(html,'utf8'),answers:data.records.length,waves:data.waves.length,
 firstWave:data.counts.firstWave,italianSourceAudited:audit.counts.audited,sourceTightenings:audit.counts.sourceTighteningsProposed,certified:0,published:0}));
