/** Produce one research-only file:// atlas reviewer from original source-backed registry. */
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const parent=join(root,"previews/visible-mass-3d");
const atlas=JSON.parse(await readFile(join(parent,"M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json"),"utf8"));
if(atlas.status!=="RESEARCH_ONLY_NOT_PUBLICATION_APPROVED"||atlas.objects.length!==170||atlas.zones.length!==13)throw Error("Uncertified or incomplete atlas registry");
const template=await readFile(join(parent,"m6-atlas-review-template.html"),"utf8");
const marker="/*__M6_INLINE_DATA__*/null";
if(template.split(marker).length!==2)throw Error("M6 inline source ownership marker changed");
const safe=JSON.stringify(atlas).replace(/<\/script/gi,"<\\/script").replace(/<!--/g,"<\\!--").replace(/</g,"\\u003c");
const html=template.replace(marker,safe);
const output=join(root,"dist/visible-mass/The_Visible_Mass_M6_Photographic_Atlas_Review.html");
await mkdir(dirname(output),{recursive:true});await writeFile(output,html,"utf8");
console.log(JSON.stringify({output,bytes:Buffer.byteLength(html),objects:atlas.objects.length,images:atlas.images.length,zones:atlas.zones.length,published:false}));
