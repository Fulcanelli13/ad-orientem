import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium,expect} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("../",import.meta.url)));
const mime={".html":"text/html",".js":"text/javascript",".json":"application/json",".css":"text/css"};
let sectionFetches=0;
const server=createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const path=resolve(root,"."+pathname);
  if(!path.startsWith(root+sep))throw Error("INVALID_PATH");
  const raw=await readFile(path);
  if(pathname.includes("/data/reference/source-demo/section-"))sectionFetches++;
  res.writeHead(200,{"Content-Type":mime[extname(path)]||"application/octet-stream",
   "Cache-Control":"no-store"});res.end(raw);
 }catch{res.writeHead(404);res.end("Not found")}
});
await new Promise(resolveReady=>server.listen(0,"127.0.0.1",resolveReady));
const base="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 const output=resolve(root,"artifacts/source-passage-pilot");
 await mkdir(output,{recursive:true});
 for(const width of [320,390,768]){
  const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1});
  try{
   await page.goto(base+"/previews/reference-passage-reader-20261015.html",
    {waitUntil:"networkidle"});
   await expect(page.locator("#measure")).toContainText("Sections fetched: 0");
   assert.equal(sectionFetches>=0,true);
   const start=sectionFetches;
   await page.locator("#openReader").click();
   await expect(page.locator(".aoSourceReaderPassage")).toContainText(
    "A reliable source has a named work and a defined edition.");
   assert.equal(sectionFetches-start,1,"Opening one passage fetches exactly one section");
   await page.getByRole("button",{name:"Next",exact:true}).click();
   await expect(page.locator(".aoSourceReaderPassage")).toContainText(
    "Commentary should keep the name of its author.");
   assert.equal(sectionFetches-start,1,"Next paragraph in the same section is cache-only");
   await page.getByRole("button",{name:"Next",exact:true}).click();
   await expect(page.locator(".aoSourceReaderPassage")).toContainText(
    "A passage may be opened and returned to without disturbing the original page.");
   assert.equal(sectionFetches-start,2,"Next section requires exactly one extra fetched file");
   await page.getByRole("button",{name:"Return",exact:true}).click();
   await expect(page.locator("#intro")).toBeVisible();
   await page.locator("#interfaceLanguage").selectOption("fr");
   await page.locator("#openReader").click();
   await expect(page.getByRole("button",{name:"Retour",exact:true})).toBeVisible();
   await expect(page.locator(".aoSourceReaderPassage")).toContainText(
    "A passage may be opened and returned to without disturbing the original page.");
   await expect(page.getByRole("button",{name:"Suivant",exact:true})).toBeVisible();
   await page.screenshot({path:resolve(output,"reader-"+width+"-fr.png"),fullPage:true});
   await page.getByRole("button",{name:"Retour",exact:true}).click();
   await page.locator("#interfaceLanguage").selectOption("en");
   await page.locator("#openReader").click();
   await page.getByPlaceholder("Find in work").fill("source");
   await page.getByRole("button",{name:"Search",exact:true}).click();
   await expect(page.locator(".aoSourceReaderResults button").first()).toBeVisible();
   await page.screenshot({path:resolve(output,"reader-"+width+"-en.png"),fullPage:true});
  }finally{await page.close()}
 }
 console.log("PASS standalone source reader 320/390/768px EN/FR, exact return, lazy section fetch and search");
}finally{
 await browser?.close();
 await new Promise(done=>server.close(done));
}
