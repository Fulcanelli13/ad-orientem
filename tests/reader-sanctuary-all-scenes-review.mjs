/**
 * Complete, reviewable sanctuary acceptance GALLERY.
 * Capture the preserved owner's renderer, not synthetic/surrogate artwork.
 * All 65 original C-cards are visited in LOW, simple/ incensed SUNG,
 * ordinary SOLEMN and SOLEMN REQUIEM.  This is STATIC stage comparison;
 * the separate native LIVE browser suites validate source choreography.
 *
 * Source and original motion are not liturgical accuracy approvals.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile,copyFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/sanctuary-review");
await mkdir(output,{recursive:true});
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".png":"image/png",
 ".svg":"image/svg+xml",".webp":"image/webp",".json":"application/json"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){
   res.writeHead(403);res.end("Forbidden");return;
  }
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":MIME[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);
  res.end(String(error?.message??error));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));

const forms=[
 {id:"low",name:"Low Mass",protocol:"LOW",requiem:false},
 {id:"sung",name:"Simple Sung",protocol:"MISSA_CANTATA_SIMPLE",requiem:false},
 {id:"incense",name:"Incense Sung",protocol:"MISSA_CANTATA_INCENSE",requiem:false},
 {id:"solemn",name:"Solemn Mass",protocol:"SOLEMN",requiem:false},
 {id:"requiem",name:"Solemn Requiem",protocol:"SOLEMN",requiem:true}
];
// Not a blanket 1962 omission list: only cases explicitly supported by
// the pre-existing 1962 canonical conditions / Requiem corrections.
const requiemOmissions=new Set([
 "C07","C08","C09", // Gloria absent
 "C16","C17","C18","C19", // Credo absent
 "C63"  // final blessing omitted
]);
const holds={
 C01:["REQUIEM_BRANCH","Foot prayers and Requiem omissions require branch-specific assessment"],
 C03:["OPTIONAL_CONFITEOR","Optional second Confiteor varies by authorised 1962 branch"],
 C08:["SEDILIA_POSE","Server seating sprite not final; existing actor cannot sit faithfully"],
 C11:["EPISTOLARIUM","Solemn subdeacon book is static; actual route/genuflection not certified"],
 C13:["MISSAL_TRANSFER","Solemn subdeacon arrival is source-specific; full route still held"],
 C14:["MINISTER_POSITIONS","Deacon/subdeacon/acolyte procession positions need O'Connell review"],
 C24:["INCENSATION_REQUIEM","Ordinary incense scene must not be run in Requiem"],
 C36:["ELEVATION_INCENSE","Elevation thurifer cadence and positions are illustrative"],
 C38:["ELEVATION_INCENSE","Elevation thurifer cadence and positions are illustrative"],
 C56:["COMMUNION_START","After third Domine non sum dignus, but no observed altar-departure event"],
 C57:["COMMUNION_APPROACH","Priest begins at rail; approach unbound; optional observed return only"],
 C58:["ABLUTIONS","Minister and chalice purification poses require detailed ceremonial review"],
 C59:["MISSAL_BACK_TRANSFER","Epistle-side transfer departure/arrival clock not independently certified"],
 C63:["REQUIEM_BLESSING","Omit final blessing at Requiem; ordinary prototype stage must not display there"],
 C64:["LAST_GOSPEL_POSITION","Final-right and Gospel-side minister positions require inspection"],
 C65:["LAST_GOSPEL_KNEEL","Exact Et Verbum caro genuflection awaits source-event timing"]
};
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>
 ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rows=[],errors=[];
let cards=null;
const browser=await chromium.launch({headless:true});
try{
 for(const form of forms){
  await mkdir(resolve(output,"images",form.id),{recursive:true});
  const page=await browser.newPage({
   viewport:{width:520,height:370},deviceScaleFactor:1,
   reducedMotion:"reduce"
  });
  page.on("pageerror",error=>errors.push({form:form.id,error:String(error.message)}));
  await page.goto("http://127.0.0.1:"+server.address().port+
   "/assets/mass/live-sanctuary/index.html?aoSanctuary=1",
   {waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForFunction(()=>Boolean(
   window.AO_SANCTUARY_EMBED_TEST?.originalCardCount===65&&
   M3?.actors?.()?.P
  ),null,{timeout:30000});
  const found=await page.evaluate(()=>D.cards.filter(c=>/^C\d{2}$/.test(c.id))
   .map(c=>({id:c.id,title:c.title,macro:c.macro,section:c.section,
    forms:c.forms,optional:c.optional,station:c.station,cue:c.cue})));
  assert.equal(found.length,65);
  assert.deepEqual(found.map(c=>c.id),Array.from({length:65},
   (_,i)=>"C"+String(i+1).padStart(2,"0")));
  if(cards)assert.deepEqual(found,cards,"Original source scenes mutated across forms");
  else cards=found;

  for(const c of found){
   // Requiem omitted scenes remain indexed in the 65-scene matrix, but
   // no screenshot should incorrectly present them as a celebrated rite.
   const excluded=c.id==="C24"&&
     ["LOW","MISSA_CANTATA_SIMPLE"].includes(form.protocol);
   const requiemOmitted=form.requiem&&requiemOmissions.has(c.id);
   const omitted=requiemOmitted||excluded;
   const section="AO.CARD."+String(Number(c.macro.slice(-2))).padStart(3,"0");
   let result=null,actors=null,cameraShot=null,imageName=null;
   if(!omitted){
    ({result,actors,cameraShot}=await page.evaluate(payload=>{
      const r=window.AO_SANCTUARY_EMBED_TEST.present({
        type:"AO_SANCTUARY_CUE_V1",version:1,
        form:payload.protocol,requiem:payload.requiem,
        cardTitle:payload.cardTitle,
        sourceSectionId:payload.section,
        sourceCueId:null,certifiedSourceFocus:false,scholaOnly:false
      });
      // This is a STATIC comparison atlas, not a film of transitions.
      // The original M3 camera interpolates from the previous card; an
      // immediate screenshot otherwise shows the previous camera (notably
      // C57 Communion rail appears cropped behind the C56 altar view).
      // Use M3's EXISTING snap to the owner-chosen shot; never modify
      // owner camera logic, keyframes or source cue timings.
      M3.snap();
      const A=M3.actors();
      const state=id=>{
        const a=A?.[id];
        if(!a)return null;
        return {visible:a.vis===true,
          x:Number(a.x.toFixed(3)),z:Number(a.z.toFixed(3)),
          face:Number(a.face.toFixed(1)),
          pose:a.pose??null,prop:a.prop??null,moving:Boolean(a.path)};
      };
      return {result:r,cameraShot:M3.shot(),actors:{priest:state("P"),server:state("M"),
        deacon:state("D"),subdeacon:state("S"),
        thurifer:state("T"),acolyte1:state("A1"),
        acolyte2:state("A2")}};
    },{protocol:form.protocol,requiem:form.requiem,cardTitle:c.title,
      section}));
    assert.equal(result.ok,true,c.id+" "+form.id+" "+result.code);
    assert.equal(result.card,c.id,c.id+" incorrectly mapped in "+form.id);
    assert.equal(result.choreography,"STATIC_STAGE",
      "Static visual audit must not start a synthetic priest motion");
    assert.equal(actors.priest?.moving,false,
      "Static scene retains a moving priest: "+c.id+" "+form.id);
    if(c.id==="C57")assert.equal(cameraShot,"rail",
      "Static C57 screenshots must use the owner's rail camera");
    if(c.id==="C08"&&form.protocol!=="LOW"){
      assert.equal(cameraShot,"sedilia",
        "Gloria seated stages must use owner's sedilia camera");
      assert.equal(result.sediliaStage,"DONOR_SEDILIA_REVIEW_HOLD",
        "The owner rejected the grafted legs; this is NOT approved art");
      assert.equal(actors.priest.pose,"sit");
      assert.equal(actors.priest.x,3.71,
        "Current donor placeholder is at front lip; final model is held");
      if(form.protocol==="SOLEMN"){
        assert.equal(actors.deacon.x,3.71);
        assert.equal(actors.subdeacon.x,3.71);
      }else{
        assert.equal(actors.server.pose,"stand");
        assert.equal(actors.server.x,2.36,
          "Server must stand outside celebrant's seated silhouette");
      }
    }
    const need=holds[c.id]??[];
    imageName="images/"+form.id+"/"+c.id+".png";
    // A pair of paint frames lets the original M3 actor keyframe settle,
    // without pretending to advance the liturgical clock.
    await page.evaluate(()=>new Promise(done=>requestAnimationFrame(
      ()=>requestAnimationFrame(done))));
    await page.screenshot({path:resolve(output,imageName),animations:"disabled"});
   }
   const issues=holds[c.id]?[holds[c.id][0]]:[];
   if(excluded)issues.push("1962_FORM_NO_INCENSE");
   if(requiemOmitted)issues.push("REQUIEM_OMITTED");
   rows.push({form:form.id,formName:form.name,id:c.id,title:c.title,
    section:c.section,sourceSectionId:section,sourceMacro:c.macro,
    originalStation:form.protocol==="LOW"?c.station?.low:c.station?.sung,
    originalCameraShot:cameraShot,
    renderedOwnerScene:omitted?null:c.id,
    sediliaStage:result?.sediliaStage??null,
    capture:excluded?"OMITTED_NO_INCENSE":
      requiemOmitted?"OMITTED_REQUIEM":"STILL",
    evidence:"PROTOTYPE_STATIC_NOT_CEREMONIAL_CERTIFICATION",
    visualReview:issues.length?"REVIEW_REQUIRED":"AWAITING_OWNER_VISUAL_REVIEW",
    holds:issues,image:imageName,actors});
  }
  await page.close();
  console.log("SANCTUARY_REVIEW_VARIANT_CAPTURED="+form.id);
 }
 assert.deepEqual(errors,[],"Original 3-D renderer raised browser errors");
 assert.equal(rows.length,65*forms.length);
 const images=rows.filter(r=>r.image).length;
 assert.equal(images,65*5-requiemOmissions.size-2);
 await writeFile(resolve(output,"scene-matrix.json"),JSON.stringify({
  schema:"ao-live-sanctuary-scene-review-v1",source:"UNMODIFIED_OWNER_M3",
  capturedRows:rows.length,capturedImages:images,
  counts:{originalCards:65,formVariants:5,omittedRequiem:requiemOmissions.size,
    omittedNoIncense:2},
  distinction:"Images are static preview stages, not certified live priest or minister observations.",
  forms,rows
 },null,2));
 const headers=["id","title","form","sourceSectionId","capture","visualReview",
  "holds","priestX","priestZ","priestPose","serverPose","deaconPose",
  "subdeaconPose","image"];
 const csvCell=x=>'"'+String(x??"").replace(/"/g,'""')+'"';
 const csv=[headers.join(","),...rows.map(r=>[
  r.id,r.title,r.form,r.sourceSectionId,r.capture,r.visualReview,
  r.holds.join("|"),r.actors?.priest?.x,r.actors?.priest?.z,
  r.actors?.priest?.pose,r.actors?.server?.pose,
  r.actors?.deacon?.pose,r.actors?.subdeacon?.pose,r.image
 ].map(csvCell).join(","))].join("\n");
 await writeFile(resolve(output,"scene-matrix.csv"),csv+"\n");
 const htmlCards=cards.map(c=>{
   const issue=holds[c.id]??null;
   return '<article class="scene" data-id="'+c.id+
    '" data-search="'+escapeHtml((c.id+" "+c.title+" "+c.macro+
     " "+(issue?issue.join(" "):"")).toLowerCase())+'">'+
    '<header><div><span class="mono">'+c.id+'</span><h2>'+escapeHtml(c.title)+
    '</h2><small>'+escapeHtml(c.macro)+" · "+escapeHtml(c.cue)+
    '</small></div><span class="status '+(issue?"held":"pending")+'">'+
    (issue?"SOURCE/POSE HOLD":"REVIEW STILL")+'</span></header>'+
    (issue?'<p class="issue">'+escapeHtml(issue[1])+
    '</p>':'')+
    '<div class="compare">'+forms.map(f=>{
     const row=rows.find(r=>r.id===c.id&&r.form===f.id);
     return '<figure data-form="'+f.id+'"><figcaption>'+escapeHtml(f.name)+
      '</figcaption>'+(row.image?'<a href="'+row.image+'" target="_blank">'+
      '<img loading="lazy" src="'+row.image+'" alt="'+escapeHtml(c.title+
        ", "+f.name+" static sanctuary scene")+'"></a>':
      '<div class="omitted">'+(row.capture==="OMITTED_NO_INCENSE"
         ?"NO INCENSATION · C23 → C25":"OMITTED IN REQUIEM")+'</div>')+
      '<div class="caption">'+escapeHtml(row.capture)+
       (row.actors?.priest?(" · Priest ("+row.actors.priest.x+", "+
        row.actors.priest.z+"), "+row.actors.priest.pose):"")+
      '</div></figure>';
    }).join("")+'</div></article>';
 }).join("\n");
 const gallery=String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ad Orientem · All 65 Sanctuary Scenes — Review Gallery</title>
<style>
:root{color-scheme:dark;font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;color:#eee9dc;background:#0a1018}
*{box-sizing:border-box}body{margin:0}header.top{padding:32px max(18px,calc((100vw - 1350px)/2));background:linear-gradient(120deg,#1c2936,#0c131d);border-bottom:1px solid #334252}
h1{font:500 clamp(28px,4vw,47px)/1.08 Georgia,serif;letter-spacing:-.025em;margin:8px 0 12px}h2{font:500 21px/1.2 Georgia,serif;margin:0 0 4px}
p{margin:8px 0}.muted,small{color:#aeb9c0}.intro{max-width:1000px}.metrics{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0}.metric{padding:12px 16px;background:#233242;border:1px solid #44505f;border-radius:10px}.metric b{font-size:19px}
.controls{position:sticky;top:0;z-index:12;padding:12px max(18px,calc((100vw - 1350px)/2));display:flex;flex-wrap:wrap;gap:10px;align-items:center;background:#111e2beF;border-bottom:1px solid #364454;backdrop-filter:blur(12px)}
input,select{padding:10px 12px;border-radius:7px;background:#0a131d;border:1px solid #516373;color:inherit;min-width:190px}
button{cursor:pointer;background:#172635;border:1px solid #60717f;color:#eee9dc;padding:9px 11px;border-radius:6px}button[aria-pressed=true]{background:#b7a070;color:#141a21;border-color:#b7a070}
a{color:#dfc792}main{max-width:1420px;margin:auto;padding:18px 20px 60px}
.scene{border:1px solid #334452;background:#111b26;border-radius:12px;margin:18px 0;padding:18px;content-visibility:auto;contain-intrinsic-size:auto 350px}
.scene>header{display:flex;align-items:start;justify-content:space-between;gap:12px;margin-bottom:12px}.mono{color:#dbbe8c;font-size:13px;letter-spacing:.15em}
.status{white-space:nowrap;font:600 10px/1.1 system-ui;letter-spacing:.07em;padding:6px 8px;border:1px solid #5e7182;border-radius:4px;color:#b3c9d6}.status.held{border-color:#a48b5c;color:#dfc28b}.issue{background:#2a261d;color:#e7d1a8;padding:9px;border-left:2px solid #af8e52;margin:12px 0}
.compare{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px}
figure{margin:0;background:#09131b;border:1px solid #273847;min-width:0}figure img{display:block;width:100%;aspect-ratio:520/370;object-fit:contain;background:#080e16}
figcaption{padding:8px 10px;font-weight:600;color:#f0e5ce;border-bottom:1px solid #263c4b}.caption{font-size:11px;color:#9eaeb9;padding:6px 9px}.omitted{aspect-ratio:520/370;display:grid;place-items:center;color:#a3adbc;font-size:11px;letter-spacing:.1em}
.hidden{display:none!important}.footer{color:#aeb9c0;max-width:850px;padding:30px 0}#count{font-size:12px;color:#d9c594}
@media(max-width:600px){header.top{padding:26px 16px}.controls{padding:10px 16px}.scene{padding:12px}.scene>header{flex-direction:column}}
</style></head>
<body><header class="top"><div class="muted">AD ORIENTEM · INTERNAL ART AND CEREMONY REVIEW</div>
<h1>LIVE Sanctuary · 65 scenes</h1>
<p class="intro">A complete visual contact gallery of the original Claude sanctuary, captured from the preserved M3 renderer through the source bridge. The pictures are <b>static prototype stages</b>, not real-time observations, historical approval or a replacement for the source-linked 65-card LIVE reader.</p>
<div class="metrics"><div class="metric"><b>65</b> original scenes</div><div class="metric"><b>5</b> Mass variants</div><div class="metric"><b>${images}</b> actual screenshots</div><div class="metric"><b>${Object.keys(holds).length}</b> flagged scene families</div><div class="metric">Original source untouched</div></div>
<p><a href="original-interactive/index.html">Open the owner's original interactive prototype</a> ·
<a href="scene-matrix.csv">Download actor/pose audit CSV</a> ·
<a href="scene-matrix.json">Inspect full scene matrix JSON</a></p>
<p class="muted">The Requiem comparison labels omitted Gloria, Credo and final blessing scenes instead of depicting ceremonies that should not occur. Asperges is a separate special rite, not one of the 65 original Mass cards. Source-triggered animation, independent Schola, Requiem restrictions, and real native LIVE card geometry are checked by separate CI tests.</p></header>
<nav class="controls"><input id="search" type="search" aria-label="Find scene" placeholder="Search prayer, card, hold…">
<select id="form" aria-label="Filter Mass form"><option value="all">Compare all five forms</option>
${forms.map(f=>'<option value="'+f.id+'">'+f.name+'</option>').join('')}
</select><button id="holds" aria-pressed="false">Only flagged scenes</button><span id="count"></span></nav>
<main id="gallery">${htmlCards}
<p class="footer">This is a review deliverable, not a release certificate. For motion, use the original interactive prototype or the real browser acceptance runs. Do not infer priest departures, Schola timing, precise ceremonial gestures or rites from the pictures. The draft PR remains unmerged until visual editorial review is complete.</p></main>
<script>
const input=document.getElementById("search"),form=document.getElementById("form"),
flag=document.getElementById("holds"),count=document.getElementById("count");
function refresh(){
 const q=input.value.toLowerCase().trim(),f=form.value,only=flag.getAttribute("aria-pressed")==="true";
 let shown=0;
 document.querySelectorAll(".scene").forEach(card=>{
  const match=card.dataset.search.includes(q)&&(!only||card.querySelector(".status.held"));
  card.classList.toggle("hidden",!match);
  if(match)shown++;
  card.querySelectorAll("figure").forEach(fig=>fig.classList.toggle("hidden",f!=="all"&&fig.dataset.form!==f));
 });
 count.textContent=shown+" / 65 scenes";
}
input.addEventListener("input",refresh);form.addEventListener("change",refresh);
flag.addEventListener("click",()=>{flag.setAttribute("aria-pressed",
 flag.getAttribute("aria-pressed")==="true"?"false":"true");refresh()});
refresh();
</script></body></html>`;
 await writeFile(resolve(output,"index.html"),gallery);
 // Audit the generated OFFLINE review UI itself. Before release the gallery
 // must actually contain all 65 cards, every form comparison, clickable
 // stills and working search/filter controls; a successfully written ZIP is
 // not evidence that its index page renders.
 const galleryPage=await browser.newPage({viewport:{width:1250,height:820}});
 await galleryPage.goto("http://127.0.0.1:"+server.address().port+
  "/artifacts/sanctuary-review/index.html",
  {waitUntil:"domcontentloaded",timeout:30000});
 assert.equal(await galleryPage.locator(".scene").count(),65);
 assert.equal(await galleryPage.locator("figure").count(),325);
 assert.equal(await galleryPage.locator("figure img").count(),315);
 assert.equal(await galleryPage.locator(".omitted").count(),10);
 await galleryPage.locator(".scene img").first().scrollIntoViewIfNeeded();
 await galleryPage.waitForFunction(()=>{
  const image=document.querySelector(".scene img");
  return image?.complete&&image.naturalWidth>0;
 },null,{timeout:15000});
 await galleryPage.selectOption("#form","requiem");
 assert.equal(await galleryPage.locator("figure:not(.hidden)").count(),65,
  "Requiem filter must show one valid/omitted comparison for every scene");
 await galleryPage.fill("#search","Communion of the Faithful");
 assert.equal(await galleryPage.locator(".scene:not(.hidden)").count(),1);
 await galleryPage.locator("#holds").click();
 assert.equal(await galleryPage.locator(".scene:not(.hidden)").count(),1,
  "The Communion scene must stay visible in the flagged-scenes filter");
 await galleryPage.close();
 const readme=[
  "AD ORIENTEM — LIVE SANCTUARY — 65-SCENE ACCEPTANCE REVIEW",
  "",
  "Open index.html in a browser. Search and compare all 65 original scenes across",
  "Low, simple Sung, incense Sung, Solemn and Solemn Requiem.",
  "",
  "The gallery captures source-static scenes, not observed ceremonial clocking.",
  "Flagged source/actor issues require visual and 1962 ceremonial approval.",
  "The original prototype is included in original-interactive/index.html.",
  "The original source and icon bank must remain byte-for-byte unchanged.",
  "See scene-matrix.csv (actor positions) and scene-matrix.json (full records).",
  "The separate browser CI runs test native LIVE, animated scenes and Asperges.",
  "Do not merge the draft PR or publish until the owner approves the visuals."
 ].join("\n");
 await writeFile(resolve(output,"README.txt"),readme+"\n");
 console.log("SANCTUARY_65_SCENE_REVIEW_PASS="+JSON.stringify({
  sourceScenes:cards.length,variants:forms.length,rows:rows.length,
  images,flaggedSceneFamilies:Object.keys(holds).length,
  reviewIndex:"artifacts/sanctuary-review/index.html",
  approvals:"NOT_CEREMONIAL_CERTIFICATION"
 }));
}finally{
 await browser.close();
 await new Promise(ok=>server.close(ok));
}
