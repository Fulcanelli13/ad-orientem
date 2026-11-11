/**
 * Real-time audit of the UNCHANGED owner-supplied 3D choreography.
 * This runs in the isolated original sanctuary (not the LIVE source bridge).
 * Motion observed here is proof the prototype moves, NOT ceremonial
 * certification, nor permission to infer priest/Schola timing in production.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const shots=resolve(root,"artifacts/sanctuary-live");
await mkdir(shots,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".png":"image/png",".svg":"image/svg+xml",".webp":"image/webp",".json":"application/json"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];
 page.on("pageerror",e=>errors.push(String(e?.message??e)));
 await page.goto("http://127.0.0.1:"+server.address().port+
  "/assets/mass/live-sanctuary/index.html?aoSanctuary=1",
  {waitUntil:"domcontentloaded",timeout:60000});
 await page.waitForFunction(()=>Boolean(window.AO_SANCTUARY_EMBED_TEST
  ?.originalCardCount===65&&M3?.actors?.()?.P),null,{timeout:30000});
 const start=async({card,form="sung",inc=false,com="no",solemn=false})=>{
  await page.evaluate(input=>{
   st.form=input.form;st.inc=input.inc;st.com=input.com;
   st.solemn=input.solemn;rebuild();
   const c=D.cards.find(x=>x.id===input.card);
   if(!c)throw Error("ORIGINAL_SCENE_NOT_FOUND:"+input.card);
   M3.show(c,false);M3.show(c,true);
  },{card,form,inc,com,solemn});
 };
 const state=()=>page.evaluate(()=>{
  const actors=M3.actors();
  const simple=id=>{
   const a=actors[id];return !a?null:{
    visible:a.vis===true,pose:a.pose,prop:a.prop??null,
    x:a.x,z:a.z,waypoints:a.path?.pts?.map(p=>[...p])??[],
    moving:Boolean(a.path)
   };
  };
  const smoke=M3.eng.bbs.find(b=>b.el?.querySelector?.(".smk"));
  return {priest:simple("P"),server:simple("M"),deacon:simple("D"),
   subdeacon:simple("S"),thurifer:simple("T"),
   smokeVisible:smoke?.show===true,
   picture:M3.shot(),scene:M3.eng.vp?.className??null};
 });
 const record=async(name)=>page.screenshot({
  path:resolve(shots,"motion-"+name+".png"),animations:"allow"});
 // Use actual wall-clock playback: do not pretend a skipped timer proves
 // the procession, gait or direction of a moving figure.
 await start({card:"P1",form:"sung"});
 const aspergesStart=await state();
 assert.equal(aspergesStart.priest.pose,"kneel");
 await page.waitForTimeout(3150);
 const asperges=await state();
 assert.ok(asperges.priest.moving &&
  asperges.priest.waypoints.some(([x,z])=>z>=10),
  "Original Asperges priest did not start its nave-and-return walk");
 await record("asperges-walk");
 // Sprinkling motion is NOT present in original design: walk != sprinkling.
 console.log("AUDIT_ASPERGES_ROUTE_PRESENT_SPRINKLING_NOT_CERTIFIED");
 await start({card:"C13",form:"low"});
 await page.waitForTimeout(1700);
 const missal=await state();
 assert.ok(missal.server.visible&&missal.server.moving,
  "Original Low Mass server did not move with the Missal");
 assert.ok(missal.server.waypoints.length>=2,
  "Missal transfer lacked the intermediate route");
 await record("missal-transfer");
 await start({card:"C24",form:"sung",inc:true});
 await page.waitForTimeout(1800);
 const incense=await state();
 assert.ok(incense.priest.moving,
  "Original Offertory incensation priest did not start movement");
 assert.equal(incense.smokeVisible,true,
  "Original incense visual effect did not start");
 await record("offertory-incense");
 // Interrupt in the middle of the planned 16-second animation.
 await page.evaluate(()=>M3.show(D.cards.find(c=>c.id==="C25"),false));
 await page.waitForTimeout(200);
 const stopped=await state();
 assert.equal(stopped.smokeVisible,false,
  "Source cue exit must extinguish smoke in the original renderer");
 assert.equal(stopped.priest.moving,false,
  "Leaving ceremony must not leave the priest on a stale walking route");
 await start({card:"C57",form:"sung",com:"yes"});
 await page.waitForTimeout(1100);
 const communion=await state();
 assert.equal(communion.priest.pose,"host");
 assert.ok(communion.priest.moving&&communion.priest.waypoints.some(
  ([x,z])=>z>=4.3),
  "Original Communion walk must travel toward the Communion rail");
 await record("communion-walk");
 await start({card:"C08",form:"sung",solemn:true});
 const sedilia=await state();
 assert.equal(sedilia.priest.pose,"sit");
 assert.equal(sedilia.deacon.pose,"sit");
 assert.equal(sedilia.subdeacon.pose,"sit");
 await record("solemn-sedilia-review");
 console.log("AUDIT_SEDILIA_RECORDED_SEATED_SERVER_POSE_NOT_CERTIFIED");
 assert.deepEqual(errors,[],"Original renderer JavaScript errors");
 console.log("SANCTUARY_ORIGINAL_PLAYBACK_PASS="+JSON.stringify({
  scenes:["P1","C13","C24","C57","C08"],realTimers:true,
  verified:"source playback and interruption, not historical choreography",
  unresolved:["ASPERGES_SPRINKLING","SEATED_SERVER_POSE",
   "SOLEMN_MINISTER_POSITION_O_CONNELL","PROPER_CHANT_INDEPENDENCE"]
 }));
 await page.close();
}finally{
 await browser.close();
 await new Promise(ok=>server.close(ok));
}
