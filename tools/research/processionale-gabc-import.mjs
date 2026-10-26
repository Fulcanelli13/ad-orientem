// Archival intake for the GABC read-only research capture job.
// This script reads a LOCAL job-log copy; it never fetches, publishes, or mutates Mass data.
// Only a complete, checksum-verified, edition-pinned set may be materialized.
import {createHash} from 'node:crypto';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {pathToFileURL} from 'node:url';

export const EXPECTED_GABC=Object.freeze([
 [2897,'CND-LUMEN',1],
 [1311,'CND-ADORNA',1],
 [46,'CND-RESPONSUM',1],
 [513,'CND-OBTULERUNT',1],
 [1215,'PALM-PUERI-PORTANTES',1],
 [288,'PALM-PSALM-23',1],
 [1155,'PALM-PUERI-VESTIMENTA',1],
 [435,'PALM-PSALM-46',1],
 [259,'PALM-GLORIA-LAUS',6],
 [606,'PALM-INGREDIENTE',1]
]);
const wanted=new Map(EXPECTED_GABC.flatMap(([id,component,count])=>
  Array.from({length:count},(_,i)=>[id+':'+(i+1),component])));
export const EXPECTED_COUNT=wanted.size;
const sha256=b=>createHash('sha256').update(b).digest('hex');
const validateUtf8=b=>{
  const txt=b.toString('utf8');
  if(!Buffer.from(txt,'utf8').equals(b))throw new Error('GABC not strict UTF-8');
  return txt;
};
export function verifyCaptureLog(log){
  const matches=[...String(log).matchAll(/AO_GABC_RECORD:([A-Za-z0-9+/=]+)/g)];
  if(matches.length!==EXPECTED_COUNT)
    throw new Error('Incomplete capture: '+matches.length+'/'+EXPECTED_COUNT+' records');
  const found=new Map();
  for(const [,encoded] of matches){
    const envelope=Buffer.from(encoded,'base64');
    if(envelope.toString('base64')!==encoded)throw new Error('Noncanonical record base64');
    const record=JSON.parse(validateUtf8(envelope));
    const key=record.scoreId+':'+record.element;
    if(!wanted.has(key))throw new Error('Unapproved source component '+key);
    if(found.has(key))throw new Error('Duplicate source component '+key);
    if(record.component!==wanted.get(key))throw new Error('Wrong component label '+key);
    if(record.url!=='https://gregobase.selapa.net/download.php?id='+record.scoreId+'&elem='+record.element+'&format=gabc')
      throw new Error('Unexpected source endpoint '+key);
    if(!/^[A-Fa-f0-9]{64}$/.test(record.sha256))throw new Error('Invalid SHA256 '+key);
    if(typeof record.base64!=='string')throw new Error('Missing bytes '+key);
    const bytes=Buffer.from(record.base64,'base64');
    if(bytes.toString('base64')!==record.base64)throw new Error('Noncanonical GABC base64 '+key);
    if(bytes.length!==record.byteLength||sha256(bytes)!==record.sha256.toLowerCase())
      throw new Error('Byte length/hash mismatch '+key);
    if(bytes.length<100||bytes.length>300000)throw new Error('Source size outside boundary '+key);
    const gabc=validateUtf8(bytes);
    const header=gabc.split(/\r?\n%%\r?\n/)[0];
    if(!/\bname:\s*[^;]+;/i.test(header)||!/\boffice-part:/i.test(header)
      ||!/\bbook:/i.test(header)||!header.includes('1961')||!header.includes('Liber Usualis'))
      throw new Error('Missing edition-anchored GABC headers '+key);
    if(!gabc.includes('%%')||!gabc.includes('(::'))
      throw new Error('Missing GABC notation or final bar '+key);
    found.set(key,{record,bytes});
  }
  if(found.size!==EXPECTED_COUNT)throw new Error('Incomplete GABC record set');
  const items=[...found].sort((a,b)=>{
    const [aid,aelem]=a[0].split(':').map(Number);
    const [bid,belem]=b[0].split(':').map(Number);
    return aid-bid||aelem-belem;
  }).map(([key,{record,bytes}])=>({
    component:record.component,scoreId:record.scoreId,element:record.element,
    sourceUrl:record.url,sha256:sha256(bytes),byteLength:bytes.length,
    filename:'gregobase-'+record.scoreId+'-e'+record.element+'.gabc',
    bytes
  }));
  return {items,count:items.length};
}
export function materializeVerifiedCapture(log,outDir){
  // Validate everything before writing a single source file.
  const result=verifyCaptureLog(log);
  const folder=resolve(outDir);
  mkdirSync(folder,{recursive:true});
  const manifest={
    schema:'ao-processionale-source-bytes-v1',
    status:'RAW_CC0_TRANSCRIPTION_NOT_MELODY_CERTIFIED_NOT_PUBLISHED',
    edition:'1961_LIBER_USUALIS_REFERENCE',
    source:'https://gregobase.selapa.net/',
    licence:'GREGOBASE_TRANSCRIPTION_CC0_SCANNED_BOOK_IMAGES_NOT_INCLUDED',
    original1888Verified:false,roman1962MelodiesApproved:0,
    itemCount:result.count,
    items:result.items.map(({bytes,...metadata})=>metadata)
  };
  for(const item of result.items)writeFileSync(join(folder,item.filename),item.bytes,{flag:'wx'});
  writeFileSync(join(folder,'sha256-manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
  return manifest;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const [input,out]=process.argv.slice(2);
  if(!input||!out){
    console.error('Usage: node tools/research/processionale-gabc-import.mjs JOB_LOG.txt OUTPUT_DIR');
    process.exitCode=2;
  }else{
    try{
      const manifest=materializeVerifiedCapture(readFileSync(input,'utf8'),out);
      console.log('Verified '+manifest.itemCount+' raw GABC source records with SHA256. Not melody certified.');
    }catch(error){console.error(String(error?.message||error));process.exitCode=1;}
  }
}
