// Package an offline, single-file 3D viewer. No third-party church mesh is bundled.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const preview=join(root,'previews/visible-mass-3d');
const html=await readFile(join(preview,'index.html'),'utf8');
const js=await readFile(join(preview,'viewer.js'),'utf8');
const files=['concepts-001-150.v1.json','concepts-151-300.v1.json','concepts-301-450.v1.json'];
const ids=new Set(['G079','G080','G184','G187','G188','G190','G191','G194','G211','G212','G213','G214','G215','G404']);
const entries=[];
for(const file of files){
  const data=JSON.parse(await readFile(join(root,'data/glossary',file),'utf8'));
  entries.push(...data.entries.filter(e=>ids.has(e.id)));
}
if(entries.length!==ids.size)throw new Error('Missing canonical entries: '+[...ids].filter(id=>!entries.some(e=>e.id===id)).join(','));
const vendor=process.env.AO_BABYLON_VENDOR_DIR;
if(!vendor)throw new Error('AO_BABYLON_VENDOR_DIR must point to node_modules with Babylon.js and its GLB loader');
const engine=await readFile(join(vendor,'babylonjs','babylon.js'),'utf8');
const loaders=await readFile(join(vendor,'babylonjs-loaders','babylonjs.loaders.min.js'),'utf8');
const safe=s=>s.replace(/<\/script/gi,'<\\/script').replace(/<!--/g,'<\\!--');
let out=html
 .replace('<script src="https://cdn.babylonjs.com/babylon.js"></script>','<script>\n'+safe(engine)+'\n</script>')
 .replace('<script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>','<script>\n'+safe(loaders)+'\n</script>');
if(out.includes('<script src="https://cdn.babylonjs.com/'))throw new Error('External 3D engine script remains');
const tag='<script type="module" src="./viewer.js"></script>';
if(!out.includes(tag))throw new Error('Unknown viewer entrypoint');
out=out.replace(tag,
 '<script type="application/json" id="ao-glossary-entries">'+safe(JSON.stringify(entries))+'</script>\n'+
 '<script type="module">\n'+safe(js)+'\n</script>');
const dir=join(root,'dist','visible-mass');await mkdir(dir,{recursive:true});
const dest=join(dir,'The_Visible_Mass_P0_Offline.html');
await writeFile(dest,out);
console.log(JSON.stringify({file:dest,bytes:Buffer.byteLength(out),glossaryEntries:entries.length,modelBundled:false,standalone3DEngine:true}));
