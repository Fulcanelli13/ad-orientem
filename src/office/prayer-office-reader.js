/**
 * An actual Prayer navigation owner for the Roman Divine Office.
 * Honest launch surface: until release gates are met, no pilot text can be
 * advertised as a complete public Hour. Tenebrae retains its existing owner.
 */
import {ROMAN_OFFICE_HOURS,officeRouteState} from "./office-route-state.js";
import {officePrivateSourceReviewAllowed} from "./office-private-preview-gate.js";
import {installOfficeShortcut} from "../pray/browser-entry.js";
import {latinComplineReleaseEligibility} from "./latin-compline-public-release.js";
const STYLE=`
/* The legacy Prayer header is positioned above the mount even with hidden
   set by its donor. Suppress it only while the native Office is in the DOM. */
#aoPray435930:has(.aoOfficeReader) .aoP435930Head{display:none!important;pointer-events:none!important}
.aoOfficeReader{max-width:900px;margin:0 auto;min-height:70vh;padding:18px 14px 42px;background:#080c12;color:#e9e4d9}
.aoOfficeReader *{box-sizing:border-box}.aoOfficeReader .aoOfKicker{font:500 11px/1.4 system-ui;letter-spacing:.16em;text-transform:uppercase;color:#c9ad78}
.aoOfficeReader h1{font:400 clamp(29px,6vw,46px)/1.12 Georgia,serif;margin:8px 0 12px}
.aoOfficeReader p{font:400 15px/1.55 Georgia,serif;color:#bfc5cc}
.aoOfficeReader .aoOfBar{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.aoOfficeReader button,.aoOfficeReader input,.aoOfficeReader .aoOfBar select{min-height:44px;background:#101821;color:#e9e4d9;border:1px solid #5f5547;border-radius:9px;padding:9px 12px;font:500 14px/1.3 system-ui}
.aoOfficeReader button:focus-visible,.aoOfficeReader input:focus-visible{outline:2px solid #c9ad78;outline-offset:2px}
.aoOfficeReader .aoOfHours{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:19px 0}
@media(min-width:680px){.aoOfficeReader .aoOfHours{grid-template-columns:repeat(4,minmax(0,1fr))}}
.aoOfficeReader button[aria-pressed="true"]{border-color:#c9ad78;background:#252519;color:#ead8aa}
.aoOfficeReader .aoOfStatus{border:1px solid #5f5547;border-radius:12px;padding:17px;background:#101821}
.aoOfficeReader .aoOfStatus strong{font:500 20px/1.3 Georgia,serif}
.aoOfficeReader .aoOfStatus small{display:block;font:12px/1.5 system-ui;color:#bfc5cc;margin-top:12px}
.aoOfficeReader .aoOfPrivateReview{border:1px solid #5f5547;border-radius:12px;padding:10px;margin:14px 0;min-width:0;overflow-wrap:anywhere}
.aoOfficeReader .aoOfPrivateReviewNotice{font:12px/1.5 system-ui;color:#c9ad78}
.aoOfficeReader .aoOfPrivateReview select{min-height:44px;background:#101821;color:#e9e4d9;border:1px solid #5f5547;border-radius:9px;padding:9px 12px}
.aoOfficeReader .aoOfPrivateReview .aoOfOptions{display:flex;flex-wrap:wrap;gap:8px;min-width:0;max-width:100%}
.aoOfficeReader .aoOfPrivateReview .aoOfOptions>*{min-width:0;max-width:100%}
@media(max-width:480px){.aoOfficeReader .aoOfPrivateReview .aoOfOptions select{width:100%}}
.aoOfficeReader .aoOfPublicLatin label{display:block;max-width:100%;margin:8px 0}
.aoOfficeReader .aoOfPublicLatin select{max-width:100%;min-width:0}
.aoOfficeReader .aoOfPrivateReview .aoOfFrame{border:1px solid #5f5547;border-radius:12px;padding:15px;margin:12px 0}
.aoOfficeReader .aoOfPrivateReview .aoOfColumns{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:15px}
.aoOfficeReader .aoOfPrivateReview .aoOfLanguage{min-width:0;overflow-wrap:anywhere}
.aoOfficeReader .aoOfPrivateReview .aoOfLanguage p{white-space:pre-wrap;overflow-wrap:anywhere}
.aoOfficeReader .aoOfPrivateReview .aoOfFrameControls{display:flex;justify-content:space-between;align-items:center;gap:8px}
.aoOfficeReader .aoOfPrivateReview .aoOfFrameTop{display:flex;justify-content:space-between;gap:8px}
.aoOfficeReader .aoOfPrivateReview .aoOfProvenance{display:block;font:11px/1.4 system-ui;overflow-wrap:anywhere}
.aoOfficeReader .aoOfPublicLatin{border:1px solid #5f5547;border-radius:12px;padding:13px;margin:14px 0;min-width:0}
.aoOfficeReader .aoOfPublicLatin select{min-height:44px;background:#101821;color:#e9e4d9;border:1px solid #5f5547;border-radius:9px;padding:9px 12px}
.aoOfficeReader .aoOfPublicLatin .aoOfFrame{padding:14px 2px;overflow-wrap:anywhere}
.aoOfficeReader .aoOfPublicLatin .aoOfFrameControls{display:flex;align-items:center;justify-content:space-between;gap:8px}
.aoOfficeReader .aoOfPublicLatin .aoOfProvenance{display:block;font:11px/1.45 system-ui;color:#c9ad78;overflow-wrap:anywhere}
.aoOfficeReader .aoOfPublicLatin .aoOfSourceLine{margin:12px 0;font:400 18px/1.65 Georgia,serif;color:#e9e4d9}

`;
function todayLocal(){
 const d=new Date();const offset=d.getTimezoneOffset()*60000;
 return new Date(d.getTime()-offset).toISOString().slice(0,10);
}
export function openDivineOfficeReader(win=globalThis,{date=todayLocal()}={}){
 const d=win?.document,api=win?.AO_PRAY_V435930;
 if(!d||typeof api?.open!=="function")return false;
 const opened=api.open("pray.hub");
 if(opened!==true&&opened?.ok!==true)return false;
 const mount=d.querySelector("#aoPray435930 .aoP435930Mount");
 if(!mount)return false;
 // Snapshot the donor's original DOM attributes BEFORE suppressing them.
 // An earlier implementation set display:none!important, then overwrote it
 // with an ordinary inline display assignment. Legacy !important CSS
 // consequently exposed the invisible Back header as a pointer overlay.
 const previous=[...mount.children].map(node=>({
   node,hidden:node.hidden,style:node.getAttribute("style"),
   inert:node.hasAttribute("inert")
 }));
 const legacyHeader=d.querySelector("#aoPray435930 .aoP435930Head");
 const headerInPrevious=previous.some(({node})=>
   node===legacyHeader||node.contains(legacyHeader));
 const headerExtra=legacyHeader&&!headerInPrevious?{
   node:legacyHeader,hidden:legacyHeader.hidden,
   style:legacyHeader.getAttribute("style"),inert:legacyHeader.hasAttribute("inert")
 }:null;
 const disableBackground=node=>{
   node.hidden=true;
   node.setAttribute("inert","");
   node.style.setProperty("display","none","important");
   node.style.setProperty("visibility","hidden","important");
   node.style.setProperty("pointer-events","none","important");
 };
 previous.forEach(({node})=>disableBackground(node));
 if(headerExtra)disableBackground(headerExtra.node);
 let restored=false;
 const restoreBackground=()=>{
   if(restored)return;
   restored=true;
   for(const {node,hidden,style,inert} of [...previous,...(headerExtra?[headerExtra]:[])]){
     node.hidden=hidden;
     if(style===null)node.removeAttribute("style");
     else node.setAttribute("style",style);
     if(inert)node.setAttribute("inert","");
     else node.removeAttribute("inert");
   }
 };
 const host=d.createElement("section");
 host.className="aoOfficeReader";
 host.setAttribute("aria-label","Divine Office");
 const style=d.createElement("style");style.textContent=STYLE;host.append(style);
 const back=d.createElement("button");back.type="button";
 back.textContent="← Prayer";back.setAttribute("aria-label","Return to Prayer");
 back.addEventListener("click",()=>{
   publicLatin?.dispose?.();
   localReview?.instance?.dispose?.();
   host.remove();
   restoreBackground();
   installOfficeShortcut(win); // Restore the canonical Prayer entry after donor hub reset.
 });
 host.append(back);
 const kicker=d.createElement("p");kicker.className="aoOfKicker";
 kicker.textContent="Breviarium Romanum · Rubrics of 1960";host.append(kicker);
 const title=d.createElement("h1");title.textContent="Divine Office";host.append(title);
 const intro=d.createElement("p");
 intro.textContent="Eight daily Hours. Source-first Latin, English and French readings are being integrated independently of the Mass calendar. Only individually certified Hours will become readable.";
 host.append(intro);
 const bar=d.createElement("div");bar.className="aoOfBar";
 const label=d.createElement("label");label.textContent="Civil date ";
 const input=d.createElement("input");input.type="date";
 input.value=/^\d{4}-\d{2}-\d{2}$/.test(date)?date:todayLocal();
 label.append(input);bar.append(label);
 const example=d.createElement("button");example.type="button";
 example.textContent="Advent pilot · 28 Nov 2026";
 example.addEventListener("click",()=>{input.value="2026-11-28";hour="COMPLINE";draw()});
 bar.append(example);
 const secondSaturday=d.createElement("button");secondSaturday.type="button";
 secondSaturday.textContent="Advent II · 5 Dec 2026";
 secondSaturday.addEventListener("click",()=>{
  input.value="2026-12-05";hour="COMPLINE";draw();
 });
 bar.append(secondSaturday);
 // The two independently verified Sunday-Psalter appointments.
 for(const [date,caption] of [
  ["2026-11-29","Advent I Sunday · 29 Nov"],
  ["2026-11-30","St Andrew · 30 Nov"]
 ]){
  const go=d.createElement("button");go.type="button";go.textContent=caption;
  go.addEventListener("click",()=>{input.value=date;hour="COMPLINE";draw()});
  bar.append(go);
 }
 // Advent ferias and III-class saints each retain their own weekday
 // Compline psalter; this is not a Sunday/feast fallback.
 for(const [date,caption] of [
  ["2026-12-01","Advent Tuesday · 1 Dec"],
  ["2026-12-02","St Bibiana · 2 Dec"],
  ["2026-12-03","St Francis Xavier · 3 Dec"],
  ["2026-12-04","St Peter Chrysologus · 4 Dec"]
 ]){
  const go=d.createElement("button");go.type="button";go.textContent=caption;
  go.addEventListener("click",()=>{input.value=date;hour="COMPLINE";draw()});
  bar.append(go);
 }
 // Compact date selector: eight additional stacked buttons would clutter
 // the 320px phone reader. The civil date field remains available.
 const weekII=d.createElement("select");
 weekII.setAttribute("aria-label","Advent II Compline date");
 const prompt=d.createElement("option");
 prompt.value="";prompt.textContent="Advent II · 6–13 Dec 2026";
 weekII.append(prompt);
 for(const [date,caption] of [
  ["2026-12-06","6 Dec · Second Sunday of Advent"],
  ["2026-12-07","7 Dec · First Compline of Immaculate Conception"],
  ["2026-12-08","8 Dec · Immaculate Conception"],
  ["2026-12-09","9 Dec · Advent Wednesday"],
  ["2026-12-10","10 Dec · Advent Thursday"],
  ["2026-12-11","11 Dec · St Damasus I"],
  ["2026-12-12","12 Dec · Eve of Gaudete"],
  ["2026-12-13","13 Dec · Gaudete Sunday"]
 ]){
  const option=d.createElement("option");
  option.value=date;option.textContent=caption;
  weekII.append(option);
 }
 weekII.addEventListener("change",()=>{
  if(weekII.value){input.value=weekII.value;hour="COMPLINE";draw()}
 });
 bar.append(weekII);
 // Privileged ferias and Ember Days: seven reviewed, exact-date
 // Compline appointments. Keep these accessible without seven more buttons.
 const weekIII=d.createElement("select");
 weekIII.setAttribute("aria-label","Advent III Compline date");
 const first=d.createElement("option");
 first.value="";first.textContent="Advent III · 14–20 Dec 2026";
 weekIII.append(first);
 for(const [date,caption] of [
  ["2026-12-14","14 Dec · Advent III Monday"],
  ["2026-12-15","15 Dec · Advent III Tuesday"],
  ["2026-12-16","16 Dec · Ember Wednesday"],
  ["2026-12-17","17 Dec · Advent III Thursday"],
  ["2026-12-18","18 Dec · Ember Friday"],
  ["2026-12-19","19 Dec · Ember Saturday, First Vespers"],
  ["2026-12-20","20 Dec · Fourth Sunday of Advent"]
 ]){
  const option=d.createElement("option");
  option.value=date;option.textContent=caption;
  weekIII.append(option);
 }
 weekIII.addEventListener("change",()=>{
  if(weekIII.value){input.value=weekIII.value;hour="COMPLINE";draw()}
 });
 bar.append(weekIII);
 // Christmas 21–27 December: compact, source-certified dates, not seven
 // additional mobile buttons.
 const christmas=d.createElement("select");
 christmas.setAttribute("aria-label","Christmas Compline date");
 const christmasPrompt=d.createElement("option");
 christmasPrompt.value="";
 christmasPrompt.textContent="Christmas · 21–27 Dec 2026";
 christmas.append(christmasPrompt);
 for(const [date,caption] of [
  ["2026-12-21","21 Dec · St Thomas Apostle"],
  ["2026-12-22","22 Dec · Advent IV Tuesday"],
  ["2026-12-23","23 Dec · Advent IV Wednesday"],
  ["2026-12-24","24 Dec · First Compline of Christmas"],
  ["2026-12-25","25 Dec · Nativity of Our Lord"],
  ["2026-12-26","26 Dec · St Stephen Protomartyr"],
  ["2026-12-27","27 Dec · Sunday within Christmas Octave"]
 ]){
  const option=d.createElement("option");
  option.value=date;option.textContent=caption;christmas.append(option);
 }
 christmas.addEventListener("change",()=>{
  if(christmas.value){input.value=christmas.value;hour="COMPLINE";draw()}
 });
 bar.append(christmas);
 host.append(bar);
 const hours=d.createElement("div");hours.className="aoOfHours";host.append(hours);
 let hour="VESPERS";
 for(const row of ROMAN_OFFICE_HOURS){
   const button=d.createElement("button");button.type="button";
   button.textContent=row.name;button.dataset.officeHour=row.id;
   button.addEventListener("click",()=>{hour=row.id;draw()});
   hours.append(button);
 }
 const status=d.createElement("div");status.className="aoOfStatus";
 status.setAttribute("aria-live","polite");host.append(status);
 const publicSlot=d.createElement("div");publicSlot.className="aoOfPublicLatin";
 let publicLatin=null;
 // Only an explicit localhost-only development session may fetch noncertified
 // Office source text. Never expose this affordance on GitHub Pages.
 let localReview=null;
 if(officePrivateSourceReviewAllowed(win.location)){
   const reviewButton=d.createElement("button");reviewButton.type="button";
   reviewButton.className="aoOfPrivateReviewLaunch";
   reviewButton.textContent="Review actual Office source · development only";
   const reviewNotice=d.createElement("p");
   reviewNotice.className="aoOfPrivateReviewNotice";
   reviewNotice.textContent="Source-first research only: not a certified liturgical edition, not published as an Office Hour.";
   host.append(reviewButton,reviewNotice);
   reviewButton.addEventListener("click",async()=>{
     if(localReview){localReview.instance?.dispose?.();localReview.node.remove();localReview=null;
       reviewButton.textContent="Review actual Office source · development only";return}
     const node=d.createElement("div");node.className="aoOfPrivateReview";
     host.insertBefore(node,reviewButton);
     reviewButton.disabled=true;
     try{
       const {mountPrivateOfficeReview}=await import("./private-office-review-page.js");
       if(!host.isConnected){node.remove();return}
       const witness=new URL("./data/office/research/advent-i-2026-universal-commemoration.json",
         win.location.href).href;
       const instance=mountPrivateOfficeReview(node,{
         win,fetchSource:win.fetch.bind(win),
         readUniversalWitness:async()=>{
           const response=await win.fetch(witness,{
             credentials:"same-origin",cache:"no-store"
           });
           if(!response.ok)throw Error("LOCAL_OFFICE_CALENDAR_WITNESS_UNAVAILABLE");
           return response.json();
         },
         initialDate:input.value,initialHour:hour
       });
       localReview={node,instance};
       reviewButton.textContent="Close private source review";
     }catch(err){
       node.remove();
       reviewNotice.textContent="Private source review unavailable: "+String(err?.message??err);
     }finally{reviewButton.disabled=false}
   });
 }
 const tenebrae=d.createElement("button");tenebrae.type="button";
 tenebrae.textContent="Open the existing Tenebrae reader";
 tenebrae.style.marginTop="18px";
 tenebrae.addEventListener("click",()=>{
   Promise.resolve(win?.AO_MODULES?.open?.("pray.tenebrae")).catch(error=>
     win?.console?.error?.("Tenebrae navigation failed",error));
 });
 host.append(tenebrae);
 function draw(){
   for(const b of hours.querySelectorAll("button")){
     b.setAttribute("aria-pressed",String(b.dataset.officeHour===hour));
   }
   const current=officeRouteState({date:input.value,hour});
   publicLatin?.dispose?.();publicLatin=null;
   publicSlot.remove();publicSlot.replaceChildren();
   status.replaceChildren();
   const heading=d.createElement("strong");heading.textContent=
     current.status==="RELEASED"?"Latin Compline · available":
     current.status==="SOURCE_RESEARCH_ONLY"?"Source pilot prepared · not yet published":"Hour not yet available";
   status.append(heading);
   const msg=d.createElement("p");
   msg.textContent=current.status==="RELEASED"
     ?"Certified Latin Compline for this date; other Hours and languages remain independently gated."
     :current.status==="SOURCE_RESEARCH_ONLY"
     ?(current.label+" · This Office remains held for independent rubrical, translation and publication checks. No substitute text will be displayed.")
     :"The selected date and Hour have not passed independent Office source and rubrical verification.";
   status.append(msg);
   const metadata=d.createElement("small");metadata.textContent=
      "Office date: "+(current.officeDate||"unresolved")+" · Status: "+current.reason+
      " · Reading enabled: "+(current.readingEnabled?"yes":"no")+
      " · Published: "+(current.published?"yes":"no");
   status.append(metadata);
   const release=latinComplineReleaseEligibility({date:input.value,hour});
   if(current.status==="RELEASED"&&release.status==="ELIGIBLE"){
    const button=d.createElement("button");button.type="button";
    button.textContent="Read Latin Compline";
    publicSlot.append(button);status.after(publicSlot);
    button.addEventListener("click",async()=>{
     if(publicLatin){publicLatin.dispose();publicLatin=null;
      button.textContent="Read Latin Compline";return}
     button.disabled=true;
     try{
      const {mountPublishedLatinCompline}=await import("./latin-compline-public-page.js");
      if(!host.isConnected||input.value!==release.date||hour!=="COMPLINE")return;
      const reading=d.createElement("div");publicSlot.append(reading);
      publicLatin=mountPublishedLatinCompline(reading,{win,date:release.date});
      button.textContent="Close Latin Compline";
     }finally{button.disabled=false}
    });
   }
 }
 input.addEventListener("change",draw);
 mount.prepend(host);
 // Also restore the header if the app navigates away by removing this mount,
 // rather than taking the Office's own Back control.
 if(typeof win.MutationObserver==="function"){
  const watcher=new win.MutationObserver(()=>{
   if(!host.isConnected){restoreBackground();watcher.disconnect()}
  });
  watcher.observe(mount,{childList:true});
 }
 draw();
 mount.scrollTop=0;
 return true;
}
