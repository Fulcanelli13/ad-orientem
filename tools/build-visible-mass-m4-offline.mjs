/** Review-only original-photograph M4 offline single HTML.
 * This packages the SAME integrated pilot controller and authentic, licensed
 * photographed pixels, not the old separate P0 Babylon GLB viewer.
 * All 134 original questions remain research-only; no publication is implied.
 */
import {readFile,writeFile,mkdir,stat} from "node:fs/promises";
import {join,resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {build} from "esbuild";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const preview=join(root,"previews/visible-mass-3d");
const assetDir=join(root,"dist/visible-mass/panorama-sources");
const originalHtml=await readFile(join(preview,"sanctuary-hotspot-pilot.html"),"utf8");
const scriptStart="<script>\n(function(){",scriptEnd="\n})();\n</script>";
if(!originalHtml.includes(scriptStart)||!originalHtml.includes(scriptEnd))throw Error("The source viewer controller boundary changed");
const start=originalHtml.indexOf(scriptStart),end=originalHtml.lastIndexOf(scriptEnd);
const inline=originalHtml.slice(start+"<script>".length,end+scriptEnd.indexOf("</script>"));
const virtual=await build({stdin:{contents:inline,resolveDir:preview,sourcefile:"m4-visitor-inline.js",loader:"js"},
 bundle:true,format:"iife",platform:"browser",target:"es2020",write:false,logLevel:"warning",
 // The production Mass Explorer runtime has no ownership inside a standalone
 // photograph reviewer. Preserve only the actual published route ID; real app
 // navigation remains explicitly unavailable without the native AO shell.
 plugins:[{name:"no-duplicate-production-module",setup(buildContext){
  buildContext.onResolve({filter:/mass-explorer[.]js$/},args=>({path:args.path,namespace:"m4-production-route-only"}));
  buildContext.onLoad({filter:/.*/,namespace:"m4-production-route-only"},()=>({
   contents:'export const MASS_EXPLORER_ROUTE="learn.mass_explorer";',loader:"js"}));
 }}]});
if(virtual.outputFiles.length!==1)throw Error("Expected exactly one bundled visitor script");
const safe=str=>str.replace(/<\/script/gi,"<\\/script").replace(/<!--/g,"<\\!--");
const jsonFiles=[
 "GUIDED_TRAIL_GRAPH_RESEARCH_20261018.v1.json",
 "PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json",
 "sanctuary-inspection-sources-20261017.v1.json",
 "LITURGICAL_SOURCE_TO_SUBJECT_CROSSWALK_20261017.v1.json",
 "LITURGICAL_EXPLANATIONS_P1_5_FIRST20_20261017.v1.json",
 "HISTORICAL_SYMBOLIC_ANSWERS_20261017.v1.json",
 "HISTORICAL_FUNCTIONAL_ANSWERS_NEXT_20261017.v1.json",
 "VMQ_FRENCH_EDITORIAL_OVERLAY_20261018.v1.json"
];
const data={};
for(const name of jsonFiles)data[name]=JSON.parse(await readFile(join(preview,name),"utf8"));
for(const name of ["concepts-001-150.v1.json","concepts-151-300.v1.json","concepts-301-450.v1.json"])
 data[name]=JSON.parse(await readFile(join(root,"data/glossary",name),"utf8"));
const metadata=JSON.parse(await readFile(join(assetDir,"metadata.json"),"utf8"));
const expected=[
 ["brompton360","BROMPTON_PANO","CC BY-SA 3.0"],
 ["newman360","NEWMAN_360","CC BY-SA 3.0"],
 ["brompton_still","still","CC BY-SA 2.0"],
 ["newman_altar1","NEWMAN_ALTAR_1","CC BY 4.0"],
 ["newman_altar2","NEWMAN_ALTAR_2","CC BY 4.0"],
 ["newman_apse","NEWMAN_APSE","CC BY 4.0"],
 ["newman_pulpit","NEWMAN_PULPIT","CC BY 4.0"],
 ["newman_altar3","NEWMAN_ALTAR_3","CC BY 4.0"],
 ["brompton_altar1","BROMPTON_ALTAR_1","CC BY-SA 4.0"],
 ["brompton_altar2","BROMPTON_ALTAR_2","CC BY-SA 4.0"],
 ["brompton_lady","BROMPTON_LADY_ALTAR","CC BY-SA 4.0"],
 ["brompton_heart","BROMPTON_SACRED_HEART","CC BY-SA 4.0"]
];
const photoData={};
for(const [key,id,license] of expected){
 const info=metadata[key];
 if(!info||info.license!==license||!info.commons_page?.startsWith("https://commons.wikimedia.org/wiki/File:"))
  throw Error("Original photographer or Commons source provenance missing: "+key);
 if(key.startsWith("brompton_")&&key!=="brompton_still"&&!key.endsWith("360")&&!info.artist?.toLowerCase().includes("andyscott"))
  throw Error("Unverified original P6 Brompton photograph creator: "+key);
 if(key.startsWith("newman_")&&!key.endsWith("360")&&!info.artist?.toLowerCase().includes("zairon"))
  throw Error("Unverified independently photographed Dublin detail creator: "+key);
 const path=join(assetDir,key.endsWith("360")?key+"-review.jpg":info.file);
 const bytes=await readFile(path),source=await stat(path);
 if(source.size<80000||source.size>12_000_000||bytes[0]!==0xff||bytes[1]!==0xd8)
  throw Error("Bundled licensed photograph missing/invalid: "+key);
 photoData[id]="data:image/jpeg;base64,"+bytes.toString("base64");
}
let html=originalHtml;
const tag='src="https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c1/The_High_Altar_-_geograph.org.uk_-_6213275.jpg/1280px-The_High_Altar_-_geograph.org.uk_-_6213275.jpg"';
if(!html.includes(tag))throw Error("Original high altar still source changed: recheck provenance before bundling");
html=html.replace(tag,'src="'+photoData.still+'"');
const init=`<script>
/* Review-only: preserve source-owned canonical text and exact ID datasets. */
window.__AO_M4_OFFLINE_PHOTOS__=${JSON.stringify({BROMPTON_PANO:photoData.BROMPTON_PANO,NEWMAN_360:photoData.NEWMAN_360})};
window.__AO_M5_OFFLINE_PHOTOS__=${JSON.stringify({NEWMAN_ALTAR_1:photoData.NEWMAN_ALTAR_1,NEWMAN_ALTAR_2:photoData.NEWMAN_ALTAR_2,NEWMAN_APSE:photoData.NEWMAN_APSE,NEWMAN_PULPIT:photoData.NEWMAN_PULPIT,
 NEWMAN_ALTAR_3:photoData.NEWMAN_ALTAR_3,
 BROMPTON_ALTAR_1:photoData.BROMPTON_ALTAR_1,BROMPTON_ALTAR_2:photoData.BROMPTON_ALTAR_2,
 BROMPTON_LADY_ALTAR:photoData.BROMPTON_LADY_ALTAR,BROMPTON_SACRED_HEART:photoData.BROMPTON_SACRED_HEART})};
const AO_M4_RESEARCH_DATA=${safe(JSON.stringify(data))};
const AO_M4_REMOTE_FETCH=window.fetch.bind(window);
window.fetch=(url,options)=>{
 const ref=typeof url==="string"?url:url?.url||"";
 const name=ref.split(/[?#]/)[0].split("/").pop();
 return Object.hasOwn(AO_M4_RESEARCH_DATA,name)
  ?Promise.resolve(new Response(JSON.stringify(AO_M4_RESEARCH_DATA[name]),{status:200,headers:{"content-type":"application/json"}}))
  :AO_M4_REMOTE_FETCH(url,options);
};
</script>`;
const chunk=originalHtml.slice(start,end+scriptEnd.length);
if(!chunk.startsWith(scriptStart))throw Error("Controller IIFE not found");
const replacement=init+"\n<script>\n"+safe(virtual.outputFiles[0].text)+"\n</script>";
html=html.replace(chunk,replacement);
const note='<div role="note" style="font:11px/1.5 system-ui,sans-serif;color:#abaaa5;padding:7px 12px;border-bottom:1px solid #38434c">M5 combined photographic review · two genuine 360° panoramas, Brompton six-object still, four Brompton close views and five independent Dublin close views embedded · research drafts only, not a public release · additional inspection references may require internet.</div>';
html=html.replace('<body>','<body>\n'+note);
const output=join(root,"dist/visible-mass/The_Visible_Mass_M5_Combined_Photographic_Review_Offline.html");
await mkdir(dirname(output),{recursive:true});await writeFile(output,html,"utf8");
await writeFile(join(dirname(output),"The_Visible_Mass_M4_Photographic_Review_Offline.html"),html,"utf8");
console.log(JSON.stringify({output,bytes:Buffer.byteLength(html),originalPhotos:expected.map(([k])=>k),
 originalQuestions:134,sourceFiles:jsonFiles.length+3,singleFile:true,appProductionDeployment:false}));
