/**
 * Review-only M4 visitor server. No deployment, authentication, upload, tracking,
 * external writes, or publication. Serves only explicit static project trees.
 *
 * Local Windows/Edge: node tools/serve-visible-mass-review.mjs
 * Trusted-Wi-Fi Android: node tools/serve-visible-mass-review.mjs --lan
 */
import {createServer} from "node:http";
import {readFile,stat} from "node:fs/promises";
import {resolve,relative,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
const repo=resolve(fileURLToPath(new URL("..",import.meta.url)));
const allow=["previews/visible-mass-3d/","data/","src/","assets/"];
const types={".html":"text/html; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".txt":"text/plain; charset=utf-8"};
const arg=process.argv.find(v=>v.startsWith("--port="));
const port=arg?Number(arg.slice(7)):8765;
if(!Number.isInteger(port)||port<0||port>65535)throw Error("Invalid --port. Use 0-65535.");
const lan=process.argv.includes("--lan"),hostname=lan?"0.0.0.0":"127.0.0.1";
const route="/previews/visible-mass-3d/sanctuary-hotspot-pilot.html";
const server=createServer(async(req,res)=>{
 const done=(status,message,headers={})=>{res.writeHead(status,{"content-type":"text/plain; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff",...headers});res.end(message);};
 if(req.method!=="GET"&&req.method!=="HEAD")return done(405,"Read-only viewer; GET and HEAD only");
 let pathname;
 try{pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);}
 catch{return done(400,"Invalid URL");}
 if(pathname==="/"){res.writeHead(302,{location:route,"cache-control":"no-store"});return res.end();}
 if(pathname.includes("\\")||pathname.split("/").some(part=>part.startsWith(".")))return done(403,"No access to hidden files or non-preview paths");
 const normalized=pathname.replace(/^\/+/, "");
 if(!allow.some(prefix=>normalized.startsWith(prefix)))return done(403,"Not part of the review-only public-data trees");
 const full=resolve(repo,normalized);
 const rel=relative(repo,full);
 if(rel.startsWith(".."+sep)||rel===".."||rel.startsWith(sep))return done(403,"Path escape blocked");
 try{
  const ext=extname(full).toLowerCase(),type=types[ext];
  if(!type)return done(403,"Unsupported review asset");
  const fileStat=await stat(full);
  if(!fileStat.isFile())return done(404,"Not an asset");
  const bytes=await readFile(full);
  res.writeHead(200,{"content-type":type,"cache-control":"no-store","x-content-type-options":"nosniff","content-length":bytes.length});
  res.end(req.method==="HEAD"?undefined:bytes);
 }catch(error){done(error.code==="ENOENT"?404:500,error.code==="ENOENT"?"File not found":"Review server could not read asset");}
});
server.listen(port,hostname,()=>{
 const active=server.address().port;
 console.log("Visible Mass M4 REVIEW ONLY — not published or approved");
 console.log("Open: http://127.0.0.1:"+active+route);
 if(lan)console.log("LAN review mode: on the same trusted Wi-Fi, use http://<Windows IPv4>:"+active+route);
 console.log("External Commons photographic previews require internet. Stop with Ctrl+C.");
});
