// Read-only source capture for the two revised Latin Palm psalm tones.
 // These are NOT supplements to the original 15 GABC files: they are edition alternatives.
import {createHash} from 'node:crypto';
const sources=[
 {id:19315,name:'PALM-PS23-TEXTUS-NOVUS',page:'143**',psalm:23},
 {id:19316,name:'PALM-PS46-TEXTUS-NOVUS',page:'144**',psalm:46}
];
let ok=0;
for(const spec of sources){
 const url='https://gregobase.selapa.net/download.php?id='+spec.id+'&format=gabc';
 try{
  const response=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'AdOrientemSourceAudit/1.0'}});
  if(!response.ok)throw Error('HTTP '+response.status);
  const bytes=Buffer.from(await response.arrayBuffer());
  const content=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  if(bytes.length<100||bytes.length>300000)throw Error('invalid size');
  const expectedBook='Graduale Romanum, 1961, p. '+spec.page;
  if(!content.includes(expectedBook)||!content.includes('office-part:Psalmus;')||!content.includes('%%'))
   throw Error('unexpected source/edition/score header');
  const checksum=createHash('sha256').update(bytes).digest('hex');
  console.log('AO_PSALTER_NOVUS_RECORD:'+Buffer.from(JSON.stringify({
   name:spec.name,psalm:spec.psalm,scoreId:spec.id,edition:'TEXTUS_NOVUS',
   printedSource:expectedBook,url,sha256:checksum,bytes:bytes.length,
   base64:bytes.toString('base64')
  })).toString('base64'));
  console.log('AO_PSALTER_NOVUS_SHA256:'+spec.id+':'+checksum+':'+bytes.length);
  ok++;
 }catch(e){console.error('AO_PSALTER_NOVUS_ERROR:'+spec.id+':'+String(e));}
}
console.log('AO_PSALTER_NOVUS_SUMMARY:'+JSON.stringify({success:ok,expected:sources.length,notationCertified:false,writePermission:false}));
if(ok!==sources.length)process.exitCode=1;
