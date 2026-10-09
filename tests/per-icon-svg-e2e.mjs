import assert from "node:assert/strict";
import http from "node:http";
import { readFile, readFileSync } from "node:fs";
import { readFile as load } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { inflateSync } from "node:zlib";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));

// Compare decoded RGB pixels, not PNG compressed byte streams: Chromium may
// produce slightly different compression for identical SVG rasterizations.
function pngRgb(buffer){
  let offset=8,width=0,height=0,depth=0,color=0;
  const parts=[];
  while(offset<buffer.length){
    const n=buffer.readUInt32BE(offset),type=buffer.toString("ascii",offset+4,offset+8);
    const body=buffer.subarray(offset+8,offset+8+n);
    if(type==="IHDR"){width=body.readUInt32BE(0);height=body.readUInt32BE(4);depth=body[8];color=body[9];}
    if(type==="IDAT")parts.push(body);
    offset+=12+n;
    if(type==="IEND")break;
  }
  assert.equal(depth,8,"Screenshot PNG depth changed");
  assert.equal(color,2,"Screenshot PNG RGB format changed");
  const data=inflateSync(Buffer.concat(parts));
  const stride=width*3,rgb=Buffer.alloc(stride*height);
  let pos=0;
  for(let y=0;y<height;y++){
    const filter=data[pos++],row=y*stride;
    for(let x=0;x<stride;x++){
      const val=data[pos++],left=x>=3?rgb[row+x-3]:0;
      const above=y?rgb[row-stride+x]:0;
      const upperLeft=y&&x>=3?rgb[row-stride+x-3]:0;
      let predict=0;
      if(filter===1)predict=left;
      else if(filter===2)predict=above;
      else if(filter===3)predict=Math.floor((left+above)/2);
      else if(filter===4){
        const p=left+above-upperLeft,da=Math.abs(p-left),db=Math.abs(p-above),dc=Math.abs(p-upperLeft);
        predict=da<=db&&da<=dc?left:db<=dc?above:upperLeft;
      }else if(filter!==0)throw Error("Unsupported PNG row filter "+filter);
      rgb[row+x]=(val+predict)&255;
    }
  }
  return {width,height,rgb};
}
function iconDiff(a,b){
  const first=pngRgb(a),second=pngRgb(b);
  assert.equal(first.width,second.width);
  assert.equal(first.height,second.height);
  let badPixels=0,totalError=0;
  for(let i=0;i<first.rgb.length;i+=3){
    let err=0;
    for(let c=0;c<3;c++)err+=Math.abs(first.rgb[i+c]-second.rgb[i+c]);
    totalError+=err;
    if(err>0)badPixels++;
  }
  return {pixels:first.width*first.height,badPixels,meanError:totalError/first.rgb.length};
}
const manifest=JSON.parse(readFileSync(resolve(root,"data/presentation/startup-per-icon-report.v1.json"),"utf8"));
const oldBundles=new Set(manifest.icons.map(x=>"/ad-orientem/"+x.sourceBundle));
const newIcons=new Set(manifest.icons.map(x=>"/ad-orientem/"+x.path));
const requests=[];
const mime={".html":"text/html; charset=utf-8",".svg":"image/svg+xml",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".webp":"image/webp",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
  try{
    let urlPath=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    if(!urlPath.startsWith("/ad-orientem/")){res.writeHead(404);res.end("wrong prefix");return;}
    const path=urlPath.slice("/ad-orientem".length);
    const local=resolve(root,"."+path);
    if(local!==root&&!local.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await load(local);
    requests.push({path:urlPath,bytes:data.length});
    res.writeHead(200,{"content-type":mime[extname(local)]??"application/octet-stream","cache-control":"public, max-age=86400"});
    res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(4194,"127.0.0.1",yes)});
let browser;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:430,height:844},deviceScaleFactor:1});
  await page.goto("http://127.0.0.1:4194/ad-orientem/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:20000});
  await page.waitForTimeout(400);
  const cold=requests.slice();
  assert.equal(cold.filter(x=>oldBundles.has(x.path)).length,0,"Home still requests a monolithic original SVG sprite");
  const loadedIcons=cold.filter(x=>newIcons.has(x.path)).length;
  assert.ok(loadedIcons<manifest.icons.length,"Home eagerly loaded all twenty refined icon images");
  const symbols=manifest.icons.map(x=>({
    id:x.id,old:"./"+x.sourceBundle+"#"+x.id,
    path:x.path
  }));
  for(const sym of symbols){
    assert.equal(await page.locator('[id="'+sym.id+'"]').count(),1,"Original local ID missing: "+sym.id);
    await page.evaluate(({id,old})=>{
      document.getElementById("ao-pericon-qa")?.remove();
      const parent=document.getElementById(id);
      const baseline=document.createElementNS("http://www.w3.org/2000/svg","symbol");
      baseline.id="qa-original-"+id;
      baseline.setAttribute("viewBox",parent.getAttribute("viewBox")??"0 0 128 128");
      const use=document.createElementNS("http://www.w3.org/2000/svg","use");
      use.setAttribute("href",old);use.setAttribute("width","100%");use.setAttribute("height","100%");
      baseline.append(use);parent.parentElement.append(baseline);
      const host=document.createElement("div");host.id="ao-pericon-qa";
      host.style.cssText="position:fixed;z-index:2147483647;left:0;top:0;padding:8px;background:white;display:flex;gap:8px";
      for(const kind of ["new","old","blank"]){
        const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
        svg.setAttribute("width","128");svg.setAttribute("height","128");
        svg.setAttribute("viewBox",parent.getAttribute("viewBox")??"0 0 128 128");
        svg.setAttribute("data-probe",kind);svg.style.color="#123449";
        if(kind!=="blank"){
          const nested=document.createElementNS("http://www.w3.org/2000/svg","use");
          nested.setAttribute("href","#"+(kind==="new"?id:"qa-original-"+id));
          svg.append(nested);
        }
        host.append(svg);
      }
      document.body.append(host);
    },sym);
    await page.waitForTimeout(1000);
    const newer=await page.locator('[data-probe="new"]').screenshot();
    const older=await page.locator('[data-probe="old"]').screenshot();
    const blank=await page.locator('[data-probe="blank"]').screenshot();
    assert.notDeepEqual(newer,blank,"Individual icon renders blank: "+sym.id);
    assert.notDeepEqual(older,blank,"Original bundled icon rendered blank (likely not yet loaded): "+sym.id);
    const difference=iconDiff(newer,older);
    if(difference.badPixels/difference.pixels>0.005 || difference.meanError>0.6){
      console.error("SVG_PARITY_DIAGNOSTIC="+JSON.stringify({icon:sym.id,...difference}));
      throw Error("Substantive refined icon pixel mismatch: "+sym.id);
    }

  }
  const data={
    coldRequests:cold.length,
    coldBytesServed:cold.reduce((n,x)=>n+x.bytes,0),
    coldOriginalBundleRequests:cold.filter(x=>oldBundles.has(x.path)).length,
    coldIndividualIconRequests:loadedIcons,
    lazyRegistry:await page.evaluate(()=>globalThis.AO_LAZY_REFINED_ICONS_V1?.status?.()??null),
    totalIconsParityChecked:symbols.length,
  };
  console.log("PASS all 20 refined icon visuals identical to original sprite assets, including GitHub Pages project-prefix URLs.");
  console.log("ICON_LOAD_OBSERVATION="+JSON.stringify(data));
}finally{
  await browser?.close();
  await new Promise(yes=>server.close(yes));
}
