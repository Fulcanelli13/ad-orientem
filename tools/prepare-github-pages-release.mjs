// Finalize the existing static Ad Orientem release for GitHub Pages.
// This only edits build output; canonical source and approved media remain unchanged.
import {readFile,writeFile,readdir,stat,lstat} from "node:fs/promises";
import {resolve,join,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const output=resolve(root,"dist/web-preview");
const entry=join(output,"index.html");
const manifest=join(output,"Ad-Orientem-v43.19.webmanifest");
const serviceWorker=join(output,"sw.js");
const forbiddenTop=new Set([".github","docs","tests","tools","research","review","reviews","legacy","node_modules","package.json","vercel.json",".git"]);
const fail=message=>{throw Error("GITHUB_PAGES_RELEASE: "+message);};

const index=await readFile(entry,"utf8");
const pwa=JSON.parse(await readFile(manifest,"utf8"));
const sw=await readFile(serviceWorker,"utf8");
if(!index.startsWith("<!doctype html>")||!/<html\b/i.test(index))fail("missing HTML entrypoint");
if(/<base\s+[^>]*href=["']\//i.test(index))fail("root-absolute base breaks GitHub project URL");
if(/(?:src|href)=["']\/(?!\/)/i.test(index))fail("root-absolute entrypoint asset path breaks project URL");
if(pwa.start_url!=="./"||pwa.scope!=="./"||pwa.id!=="./")fail("PWA manifest is not Pages subpath-relative");
if(!sw.includes('new URL(self.registration.scope)'))fail("service worker lost containing-scope routing");
const all=await readdir(output);
for(const name of all)if(forbiddenTop.has(name))fail("source/internal asset accidentally published: "+name);

// Vercel provided X-Robots-Tag; GitHub Pages has no equivalent configurable
// HTTP headers. Preserve the explicit non-indexing intent in the built HTML.
const robots='<meta name="robots" content="noindex,nofollow,noarchive">';
const html=/<meta\s+name=["']robots["']/i.test(index)?index:index.replace(/<head>/i,"<head>"+robots);
if(!html.includes(robots))fail("unable to install robots directive");
await writeFile(entry,html);
await writeFile(join(output,"404.html"),html);
await writeFile(join(output,".nojekyll"),"");
const robotsTxt=await readFile(join(output,"robots.txt"),"utf8");
if(!/Disallow:\s*\//.test(robotsTxt))fail("robots.txt lost crawler exclusion");

// GitHub Pages has a 1GB published-site ceiling. Abort before uploading an
// oversized artifact rather than silently stripping required application data.
let bytes=0,files=0;
async function inspect(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const filepath=join(dir,entry.name);
  const fs=lstat(filepath);
  const item=await fs;
  if(item.isSymbolicLink())fail("symbolic link in release: "+filepath);
  if(item.isDirectory())await inspect(filepath);
  else if(item.isFile()){bytes+=item.size;files++;}
  else fail("non-file/non-directory release entry: "+filepath);
 }
}
await inspect(output);
if(bytes>1_000_000_000)fail("site exceeds GitHub Pages 1GB limit: "+bytes+" bytes");
if(files<100)fail("unexpectedly small site output, refusing partial release: "+files+" files");
console.log(JSON.stringify({
 host:"GitHub Pages",root:"dist/web-preview",files,bytes,
 pagesMaxBytes:1_000_000_000,
 safeForProjectSubpath:true,
 noindexPreserved:true,
 approvedMediaUnchanged:true,
 canonicalResearchExcluded:true
}));
