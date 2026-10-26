// Research-only capture of source-specific Gregorian notation.
 // Fetch from GregoBase, compute exact raw SHA256, and emit recoverable
 // base64 records to this CI job's logs. No repository writes or publication.
 // Source permissions: GregoBase transcriptions CC0; images separate.
import {createHash} from 'node:crypto';
import {TextDecoder} from 'node:util';

const base='https://gregobase.selapa.net/download.php';
const items=[
  {scoreId:2897,component:'CND-LUMEN',elements:1},
  {scoreId:1311,component:'CND-ADORNA',elements:1},
  {scoreId:46,component:'CND-RESPONSUM',elements:1},
  {scoreId:513,component:'CND-OBTULERUNT',elements:1},
  {scoreId:1215,component:'PALM-PUERI-PORTANTES',elements:1},
  {scoreId:288,component:'PALM-PSALM-23',elements:1},
  {scoreId:1155,component:'PALM-PUERI-VESTIMENTA',elements:1},
  {scoreId:435,component:'PALM-PSALM-46',elements:1},
  {scoreId:259,component:'PALM-GLORIA-LAUS',elements:6},
  {scoreId:606,component:'PALM-INGREDIENTE',elements:1}
];
const expectedCount=items.reduce((s,x)=>s+x.elements,0);
const strictUtf8=new TextDecoder('utf-8',{fatal:true,ignoreBOM:false});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function capture(item,element){
  const params=new URLSearchParams({id:String(item.scoreId),elem:String(element),format:'gabc'});
  const url=base+'?'+params;
  let lastError;
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const response=await fetch(url,{redirect:'follow',signal:AbortSignal.timeout(25000),headers:{'User-Agent':'AdOrientemSourceAudit/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'}});
      if(!response.ok)throw new Error('HTTP '+response.status);
      const bytes=Buffer.from(await response.arrayBuffer());
      if(bytes.length<100||bytes.length>300000)throw new Error('unexpected byte size: '+bytes.length);
      const gabc=strictUtf8.decode(bytes);
      const header=gabc.split(/\r?\n%%\r?\n/)[0];
      if(!/\bname:\s*[^;]+;/i.test(header)||!/\boffice-part:/i.test(header)||!/\bbook:/i.test(header))
        throw new Error('missing GABC title/genre/book header');
      if(!header.includes('1961')||!header.includes('Liber Usualis'))throw new Error('not an identified 1961 source');
      if(!gabc.includes('%%')||!gabc.includes('(::'))throw new Error('invalid or truncated GABC');
      const checksum=createHash('sha256').update(bytes).digest('hex');
      const record={
        component:item.component,scoreId:item.scoreId,element,url,
        byteLength:bytes.length,sha256:checksum,
        sourceContentType:response.headers.get('content-type'),
        // Used only as ephemeral transfer; no text in source manifests before local confirmation.
        base64:bytes.toString('base64')
      };
      console.log('AO_GABC_RECORD:'+Buffer.from(JSON.stringify(record)).toString('base64'));
      console.log('AO_GABC_SHA256:'+item.scoreId+':'+element+':'+checksum+':'+bytes.length);
      return true;
    }catch(e){lastError=e; if(attempt<3)await pause(500*attempt);}
  }
  console.error('AO_GABC_ERROR:'+item.scoreId+':'+element+':'+String(lastError?.message||lastError));
  return false;
}
let succeeded=0;
for(const item of items){
  for(let element=1;element<=item.elements;element++){
    if(await capture(item,element))succeeded++;
  }
}
console.log('AO_GABC_SUMMARY:'+JSON.stringify({succeeded,expected:expectedCount,edition:'LU1961',notationCertified:false,repositoryWrite:false}));
if(succeeded!==expectedCount)process.exitCode=1;
