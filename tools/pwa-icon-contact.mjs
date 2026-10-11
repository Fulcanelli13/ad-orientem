import {readdir,readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const folder=join(root,"assets/generated-inline");
const names=(await readdir(folder)).filter(x=>x.endsWith(".png")).sort();
const good=[];
for(const name of names){
 const content=await readFile(join(folder,name));
 if(content.length<24||content.subarray(0,8).toString("hex")!=="89504e470d0a1a0a")continue;
 const w=content.readUInt32BE(16),h=content.readUInt32BE(20);
 if(w===h&&w>=192)good.push({name,w,src:"data:image/png;base64,"+content.toString("base64")});
}
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1390,height:880},deviceScaleFactor:1});
 const cards=good.map(x=>'<article><img src="'+x.src+'"><small>'+x.w+' · '+x.name+'</small></article>').join('');
 await page.setContent('<html><head><style>body{margin:0;padding:14px;background:#eee;color:#111;font:12px system-ui}h1{font-size:22px}section{display:grid;grid-template-columns:repeat(7,1fr);gap:12px}article{display:grid;place-items:center;gap:5px;padding:8px;background:#fff;border:1px solid #ddd;min-height:160px}img{width:130px;height:130px;object-fit:contain}small{max-width:160px;overflow-wrap:anywhere}</style></head><body><h1>Existing approved app favicon and 512px candidates</h1><section>'+cards+'</section></body></html>');
 const out=join(root,"artifacts/pwa-icon-review");await mkdir(out,{recursive:true});
 await page.screenshot({path:join(out,"contact-sheet.png"),fullPage:true});
 // Derive the 512px install icon from the already-approved 192px app favicon.
 // Avoid substituting any of the unrelated 512px module illustrations.
 const original=await readFile(join(folder,"art-4f9962f074ca9166a7d6.png"));
 const highResolution=await page.evaluate(async source=>{
   const icon=new Image();icon.src="data:image/png;base64,"+source;
   await icon.decode();
   const canvas=document.createElement("canvas");canvas.width=canvas.height=512;
   const cx=canvas.getContext("2d");cx.imageSmoothingEnabled=true;cx.imageSmoothingQuality="high";
   cx.drawImage(icon,0,0,512,512);
   return canvas.toDataURL("image/png").split(",")[1];
 },original.toString("base64"));
 const png=Buffer.from(highResolution,"base64");
 await writeFile(join(out,"approved-favicon-512.png"),png);
 console.log("PWA_512_ICON_BASE64_START"+highResolution+"PWA_512_ICON_BASE64_END");
 console.log("PWA_512_ICON_BYTES="+png.byteLength);

 console.log("PWA_ICON_CONTACT_SHEET="+good.length);
}finally{await browser.close()}
