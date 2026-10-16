// Portable demonstration builder. Uses source-owned glossary entries and app viewer code.
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const preview=join(root,"previews/visible-mass-3d");
const html=await readFile(join(preview,"index.html"),"utf8");
const js=await readFile(join(preview,"viewer.js"),"utf8");
const volumes=["concepts-001-150.v1.json","concepts-151-300.v1.json","concepts-301-450.v1.json"];
const ids=new Set(["G079","G080","G184","G187","G188","G190","G191","G194","G211","G212","G213","G214","G215","G404"]);
const entries=[];
for(const file of volumes){
  const data=JSON.parse(await readFile(join(root,"data/glossary",file),"utf8"));
  entries.push(...data.entries.filter(e=>ids.has(e.id)));
}
if(entries.length!==ids.size)throw new Error("Missing canonical entries: "+[...ids].filter(id=>!entries.some(e=>e.id===id)).join(","));
if(!html.includes('<script type="module" src="./viewer.js"></script>'))throw new Error("Unknown viewer entrypoint");
const safeText=s=>s.replace(/<\/script/gi,"<\\/script").replace(/<!--/g,"<\\!--");
const joined=html.replace('<script type="module" src="./viewer.js"></script>',
  '<script type="application/json" id="ao-glossary-entries">'+safeText(JSON.stringify(entries))+'</script>\n'+
  '<script type="module">\n'+safeText(js)+'\n</script>');
const dist=join(root,"dist","visible-mass");
await mkdir(dist,{recursive:true});
await writeFile(join(dist,"The_Visible_Mass_P0.html"),joined);
console.log(JSON.stringify({path:join(dist,"The_Visible_Mass_P0.html"),entries:entries.length,bytes:Buffer.byteLength(joined),externalChurchBundled:false}));
