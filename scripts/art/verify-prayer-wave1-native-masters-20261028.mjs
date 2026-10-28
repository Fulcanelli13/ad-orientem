/**
 * Read-only Wave 1 master verification, 28 October 2026.
 * Downloads only known existing GitHub research-branch assets.
 * Git SHA-1 is distinct from byte-level SHA-256. No photo is licensed or approved by this test.
 * No new archive, edit, expense, publication or image substitution.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const file='data/calendar/prayer-hero-wave1-release-manifest-20261028.v1.json';
const manifest=JSON.parse(readFileSync(file,'utf8'));
assert.equal(manifest.modules.length,6,'must retain the six editor-approved heroes');
const order=['morning','evening','angelus','rosary','confession','seven-sorrows'];
assert.deepEqual(manifest.modules.map(x=>x.section),order);
const targets=manifest.modules.filter(x=>x.photo.source_repo_file);
assert.equal(targets.length,5);
assert.ok(manifest.modules.find(x=>x.section==='evening').photo.source_repo_file===null);
const lowerHex=(v,n)=>typeof v==='string'&&new RegExp('^[0-9a-f]{'+n+'}$').test(v);
for (const h of targets) {
  const f=h.photo.source_repo_file;
  assert.equal(f.repository,'Fulcanelli13/ad-orientem');
  assert.ok(f.ref.startsWith('research/'));
  assert.ok(f.path.startsWith('assets/staged/'));
  assert.ok(lowerHex(f.git_blob_sha,40));
  assert.ok(lowerHex(f.previously_reported_sha256,64));
  assert.ok(f.repo_listing_bytes>100000 && f.repo_listing_bytes<13000000);
  assert.equal(f.git_path_verified,'YES_BY_DIRECTORY_LISTING');
  assert.equal(h.code_activated,false);
  assert.equal(h.photo.app_release,'BLOCKED');
}
assert.equal(manifest.photo_source_evidence_update.cost_eur,0);
assert.equal(manifest.photo_source_evidence_update.photography_cleared_for_production_in_this_update,0);
const online=process.argv.includes('--verify-online');
if (!online) {
  console.log(JSON.stringify({result:'PASS_OFFLINE_RESEARCH_GUARDS',listedMasters:targets.length,
    eveningHeld:true,allAppPhotosBlocked:true,byteChecksNotPerformed:true}));
  process.exit(0);
}
function hash(buf,algorithm){return createHash(algorithm).update(buf).digest('hex')}
function gitBlobSha(buf){
  const head=Buffer.concat([Buffer.from('blob '+buf.length,'utf8'),Buffer.from([0])]);
  return createHash('sha1').update(head).update(buf).digest('hex');
}
function jpegDimensions(b){
  if(b.length<12 || b[0]!==0xff || b[1]!==0xd8)throw Error('Not a JPEG');
  let i=2;
  while(i<b.length-10){
    while(i<b.length && b[i]!==0xff)i++;
    while(i<b.length && b[i]===0xff)i++;
    if(i>=b.length)break;
    const marker=b[i++];
    if(marker===0xd9 || marker===0xda)break;
    if(marker===0x00 || marker===0x01 || (marker>=0xd0 && marker<=0xd8))continue;
    if(i+2>b.length)break;
    const len=b.readUInt16BE(i);
    if(len<2 || i+len>b.length)throw Error('Malformed JPEG marker');
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){
      if(len<7)throw Error('Malformed SOF');
      return [b.readUInt16BE(i+5),b.readUInt16BE(i+3)];
    }
    i+=len;
  }
  throw Error('JPEG dimensions not found');
}
const results=[];
for(const h of targets){
  const f=h.photo.source_repo_file;
  const url='https://raw.githubusercontent.com/'+f.repository+'/'+f.ref+'/'+f.path;
  try{
    const response=await fetch(url,{signal:AbortSignal.timeout(30000),redirect:'follow',
      headers:{'User-Agent':'AdOrientem-Research-NativeVerifier/1.0'}});
    if(!response.ok)throw Error('HTTP_'+response.status);
    const sizeHeader=Number(response.headers.get('content-length')||0);
    if(sizeHeader>13000000)throw Error('TOO_LARGE');
    const b=Buffer.from(await response.arrayBuffer());
    if(b.length>13000000)throw Error('TOO_LARGE');
    const record={
      module:h.section,ref:f.ref,path:f.path,bytes:b.length,
      git_blob_sha:gitBlobSha(b),sha256:hash(b,'sha256'),jpeg_dimensions:jpegDimensions(b)
    };
    record.size_matches_listing=record.bytes===f.repo_listing_bytes;
    record.git_blob_matches_listing=record.git_blob_sha===f.git_blob_sha;
    record.sha256_matches_prior=record.sha256===f.previously_reported_sha256;
    record.dimensions_match_prior= !f.previously_reported_dimensions ||
      JSON.stringify(record.jpeg_dimensions)===JSON.stringify(f.previously_reported_dimensions);
    record.byte_integrity_pass=record.size_matches_listing&&record.git_blob_matches_listing&&
      record.sha256_matches_prior&&record.dimensions_match_prior;
    record.photographic_quality_certified=false;
    record.rights_clearance_by_script=false;
    results.push(record);
  }catch(e){
    results.push({module:h.section,byte_integrity_pass:false,error:String(e?.message||e)});
  }
}
const all=results.every(r=>r.byte_integrity_pass);
const report={schema:'AO_PRAYER_WAVE1_READ_ONLY_BYTE_QA_V1',asOf:'2026-10-28',
  verdict:all?'PASS_BYTES_ONLY':'HOLD_BYTE_OR_RETRIEVAL_FAILURE',
  production_images_released:0,editorial_approvals_changed:0,expense_eur:0,results,
  caveat:'Even PASS_BYTES_ONLY does not certify painted borders, photography, rights, focal crops or production.'};
console.log(JSON.stringify(report,null,2));
if(process.env.GITHUB_STEP_SUMMARY){
  const {appendFileSync}=await import('node:fs');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    '## Prayer Wave 1 — native photo bytes\n'+
    '| Module | Native bytes | File integrity |\n|---|---:|---|\n'+
    results.map(r=>'| '+r.module+' | '+(r.bytes??'–')+' | '+(r.byte_integrity_pass?'PASS':'HOLD')+' |').join('\n')+
    '\n\n**No photographic release or rights clearance is implied.**\n');
}
if(!all)process.exitCode=1;
