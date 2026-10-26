import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,rmSync,readFileSync,readdirSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {EXPECTED_GABC,EXPECTED_COUNT,verifyCaptureLog,materializeVerifiedCapture}
  from '../tools/research/processionale-gabc-import.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const records=[];
for(const [scoreId,component,count] of EXPECTED_GABC){
  for(let element=1;element<=count;element++){
    const gabc='name:Sample '+scoreId+';\noffice-part:Antiphona;\nbook:Graduale Romanum, 1961 & The Liber Usualis, 1961;\ntranscriber:Source QA test;\n%%\n(c4) KY(g)ri(h)e.(i) (::)\n';
    const bytes=Buffer.from(gabc,'utf8');
    records.push({
      component,scoreId,element,
      url:'https://gregobase.selapa.net/download.php?id='+scoreId+'&elem='+element+'&format=gabc',
      byteLength:bytes.length,sha256:hash(bytes),base64:bytes.toString('base64')
    });
  }
}
assert.equal(records.length,15);
assert.equal(EXPECTED_COUNT,15);
const line=r=>'AO_GABC_RECORD:'+Buffer.from(JSON.stringify(r),'utf8').toString('base64');
const log=records.map(line).join('\n');
assert.equal(verifyCaptureLog(log).count,15);
assert.throws(()=>verifyCaptureLog(records.slice(1).map(line).join('\n')),/Incomplete capture/);
assert.throws(()=>verifyCaptureLog([...records.slice(0,-1),records[0]].map(line).join('\n')),/Duplicate/);
assert.throws(()=>verifyCaptureLog(records.map((r,i)=>i===0?line({...r,sha256:'0'.repeat(64)}):line(r)).join('\n')),/mismatch/);
assert.throws(()=>verifyCaptureLog(records.map((r,i)=>i===0?line({...r,scoreId:9999}):line(r)).join('\n')),/Unapproved/);
const root=mkdtempSync(join(tmpdir(),'ao-gabc-'));
try{
  const dest=join(root,'verified');
  const result=materializeVerifiedCapture(log,dest);
  assert.equal(result.itemCount,15);
  assert.equal(result.roman1962MelodiesApproved,0);
  assert.equal(result.original1888Verified,false);
  assert.equal(readdirSync(dest).length,16);
  for(const item of result.items){
    const bytes=readFileSync(join(dest,item.filename));
    assert.equal(hash(bytes),item.sha256);
    assert.equal(bytes.length,item.byteLength);
  }
  const saved=JSON.parse(readFileSync(join(dest,'sha256-manifest.json'),'utf8'));
  assert.equal(saved.items.length,15);
  const incompleteDest=join(root,'incomplete');
  assert.throws(()=>materializeVerifiedCapture(records.slice(1).map(line).join('\n'),incompleteDest),/Incomplete/);
  assert.equal(existsSync(incompleteDest),false,'Do not materialize partial source sets');
}finally{rmSync(root,{recursive:true,force:true});}
console.log('Processionale GABC source intake PASS — 15 byte-verified files, fail-closed incomplete/hash/identity gates');
