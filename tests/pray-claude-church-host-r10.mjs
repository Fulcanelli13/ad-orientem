import assert from "node:assert/strict";
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm} from "node:fs/promises";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {createChurchHost,churchPilotEnabled} from "../src/pray/church-host.v1.js";
import {stageClaudeChurchR8} from "../tools/pray/stage-claude-church-r8.mjs";

function fakeBrowser(){
 const messages=[],routes=[],listeners=new Map(),headCalls=[];
 let frame=null,removed=false;
 const body={style:{overflow:"auto"},appendChild(el){
   frame=el;queueMicrotask(()=>el.events?.load?.());return el;
 }};
 const win={
   location:{href:"https://example.org/ad-orientem/index.html?aoChurchPilot=1",
    origin:"https://example.org"},
   document:{body,createElement(tag){
     assert.equal(tag,"iframe");
     return {
      style:{},events:{},contentWindow:{postMessage(x,y){messages.push({x,y})}},
      addEventListener(name,fn){this.events[name]=fn},
      setAttribute(k,v){this[k]=v},
      removeAttribute(k){delete this[k]},
      focus(){this.focused=true},
      remove(){removed=true}
     };
   }},
   fetch:async(url,opts)=>{headCalls.push({url,opts});return{ok:true}},
   setTimeout:()=>1,addEventListener(n,fn){listeners.set(n,fn)},
   removeEventListener(n){listeners.delete(n)},
   AO_APP_SHELL_V1:{navigate:async route=>{routes.push(route);return{ok:true}}},
   console:{warn(){}}
 };
 return {win,messages,routes,listeners,headCalls,frame:()=>frame,removed:()=>removed};
}
assert.equal(churchPilotEnabled(fakeBrowser().win),true);
assert.equal(churchPilotEnabled({location:{href:"https://example.org/index.html"}}),false);
const f=fakeBrowser(),host=createChurchHost(f.win);
assert.equal(await host.open(),true);
assert.equal(host.active(),true);
assert.equal(f.win.document.body.style.overflow,"hidden");
assert.ok(f.headCalls[0].url.endsWith("/ad-orientem/assets/pray-church/prayers.html"));
assert.equal(f.headCalls[0].opts.method,"HEAD");
assert.equal(host.suspend(),true);assert.equal(host.paused(),true);
assert.equal(f.frame().style.visibility,"hidden");
assert.deepEqual(f.messages.at(-1).x,{aoChurchHost:1,type:"suspend"});
assert.equal(host.resume(),true);assert.equal(host.paused(),false);
assert.equal(f.frame().style.visibility,"visible");
const onMessage=f.listeners.get("message");
assert.equal(typeof onMessage,"function");
onMessage({source:{},origin:"https://example.org",data:{ao:1,type:"go",route:"today"}});
onMessage({source:f.frame().contentWindow,origin:"https://attacker.example",data:{ao:1,type:"go",route:"today"}});
assert.equal(f.routes.length,0,"Invalid iframe or origin should not navigate");
onMessage({source:f.frame().contentWindow,origin:"https://example.org",data:{ao:1,type:"go",route:"today"}});
assert.deepEqual(f.routes,["home"]);
host.close();assert.equal(host.active(),false);assert.equal(f.removed(),true);
assert.equal(f.win.document.body.style.overflow,"auto");
const unavailable=fakeBrowser();unavailable.win.fetch=async()=>({ok:false});
assert.equal(await createChurchHost(unavailable.win).open(),false);
assert.equal(unavailable.frame(),null,"Unavailable owner must fail closed");

const dir=await mkdtemp(join(tmpdir(),"ao-church-r10-"));
try{
 const source=join(dir,"source"),target=join(dir,"staged");
 await mkdir(join(source,"assets/img"),{recursive:true});
 await mkdir(join(source,"assets/icons"),{recursive:true});
 await mkdir(join(source,"assets/fonts"),{recursive:true});
 const html=`<!doctype html><html><body><img src="assets/img/example.webp"><script>
 function churchShow(){} function churchHide(){} function openLectern(){}
 function aoRestoreNovenaOrigin(){} function walkable(){}
 var AO_PRAY_APP_V1=true;
 function boot(){}
 boot();
 </script></body></html>`;
 await writeFile(join(source,"prayers.html"),html);
 await writeFile(join(source,"assets/ao.css"),"@font-face{font-family:'R8';src:url(assets/fonts/private.woff2)} body{font-family:Georgia,serif}");
 await writeFile(join(source,"assets/ao-embed.js"),"window.AO={};");
 await writeFile(join(source,"assets/img/example.webp"),"FAKE_IMAGE_FOR_CONTRACT_ONLY");
 await writeFile(join(source,"assets/fonts/private.woff2"),"NOT_EXPORTABLE");
 await writeFile(join(source,"assets/icons/example.svg"),"<svg/>");
 const staged=await stageClaudeChurchR8(source,target);
 assert.equal(staged.manifest.sourceArtworkCount,1);
 assert.equal(staged.manifest.fontsCopied,false);
 const newHtml=await readFile(join(target,"prayers.html"),"utf8");
 assert.ok(newHtml.includes("AO_CHURCH_HOST_R10_PAUSE_BRIDGE"));
 assert.ok(newHtml.includes("function churchShow(){}"),"Original renderer source changed");
 assert.ok(!(await readFile(join(target,"assets/ao.css"),"utf8")).includes("@font-face"));
 assert.ok(!(await readdir(join(target,"assets"))).includes("fonts"),"Do not redistribute font files");
 await assert.rejects(stageClaudeChurchR8(source,target),/Destination exists/);
}finally{await rm(dir,{recursive:true,force:true})}
console.log("R10 pilot host: same-origin, exit Home, pause/resume, missing assets fail-closed; original renderer staged without fonts.");
