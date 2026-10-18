import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname, join, sep } from "node:path";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const manifest=JSON.parse(await readFile(join(root,"Ad-Orientem-v43.19.webmanifest"),"utf8"));
const iconDir=join(root,"assets/generated-inline");
const candidates=[];
for(const name of await readdir(iconDir)){
 if(!name.endsWith(".png"))continue;
 const bytes=await readFile(join(iconDir,name));
 if(bytes.length<24||bytes.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")continue;
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 if(width===height&&width>=192)candidates.push({path:"assets/generated-inline/"+name,size:width});
}
candidates.sort((a,b)=>a.size-b.size||a.path.localeCompare(b.path));
console.log("PWA_ICON_CANDIDATES="+JSON.stringify(candidates));
assert.equal(manifest.display,"standalone","Installed PWA must open without browser chrome");
assert.equal(manifest.start_url,"./","PWA start URL must remain project-scope-relative");
assert.equal(manifest.scope,"./","PWA scope must remain project-relative");
assert.ok(Array.isArray(manifest.icons),"Installed-PWA manifest requires an icons array");
for(const size of [192,512]){
 const declared=manifest.icons.find(x=>x.sizes===size+"x"+size&&x.type==="image/png");
 assert.ok(declared,"Missing "+size+"px installed-PWA PNG icon");
 const resolved=resolve(root,dirname("Ad-Orientem-v43.19.webmanifest"),declared.src);
 assert.ok(resolved.startsWith(root+sep),"Icon escaped repository project scope");
 const bytes=await readFile(resolved);
 assert.equal(bytes.subarray(0,8).toString("hex"),"89504e470d0a1a0a","Manifest icon not a PNG");
 assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],[size,size],
  "Manifest icon physical dimensions do not match "+declared.sizes);
}
const workerSource=await readFile(join(root,"sw.js"),"utf8");
assert.match(workerSource,/self\.addEventListener\("install",event=>event\.waitUntil\(self\.skipWaiting\(\)\)\)/,
 "Replacement service worker must activate while an old installed app is open");
assert.match(workerSource,/async function useSnapshot\(version,clientId=null\)/,
 "Snapshot promotion remains a separate, consented operation");
console.log("PASS PWA manifest installability and safe replacement-worker activation");
