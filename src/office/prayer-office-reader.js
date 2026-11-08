/**
 * An actual Prayer navigation owner for the Roman Divine Office.
 * Honest launch surface: until release gates are met, no pilot text can be
 * advertised as a complete public Hour. Tenebrae retains its existing owner.
 */
import {ROMAN_OFFICE_HOURS,officeRouteState} from "./office-route-state.js";
import {officePrivateSourceReviewAllowed} from "./office-private-preview-gate.js";
const STYLE=`
/* The legacy Prayer header is positioned above the mount even with hidden
   set by its donor. Suppress it only while the native Office is in the DOM. */
#aoPray435930:has(.aoOfficeReader) .aoP435930Head{display:none!important;pointer-events:none!important}
.aoOfficeReader{max-width:900px;margin:0 auto;min-height:70vh;padding:18px 14px 42px;background:#080c12;color:#e9e4d9}
.aoOfficeReader *{box-sizing:border-box}.aoOfficeReader .aoOfKicker{font:500 11px/1.4 system-ui;letter-spacing:.16em;text-transform:uppercase;color:#c9ad78}
.aoOfficeReader h1{font:400 clamp(29px,6vw,46px)/1.12 Georgia,serif;margin:8px 0 12px}
.aoOfficeReader p{font:400 15px/1.55 Georgia,serif;color:#bfc5cc}
.aoOfficeReader .aoOfBar{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.aoOfficeReader button,.aoOfficeReader input{min-height:44px;background:#101821;color:#e9e4d9;border:1px solid #5f5547;border-radius:9px;padding:9px 12px;font:500 14px/1.3 system-ui}
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
.aoOfficeReader .aoOfPrivateReview .aoOfOptions{display:flex;flex-wrap:wrap;gap:8px}
.aoOfficeReader .aoOfPrivateReview .aoOfFrame{border:1px solid #5f5547;border-radius:12px;padding:15px;margin:12px 0}
.aoOfficeReader .aoOfPrivateReview .aoOfColumns{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:15px}
.aoOfficeReader .aoOfPrivateReview .aoOfLanguage{min-width:0;overflow-wrap:anywhere}
.aoOfficeReader .aoOfPrivateReview .aoOfLanguage p{white-space:pre-wrap;overflow-wrap:anywhere}
.aoOfficeReader .aoOfPrivateReview .aoOfFrameControls{display:flex;justify-content:space-between;align-items:center;gap:8px}
.aoOfficeReader .aoOfPrivateReview .aoOfFrameTop{display:flex;justify-content:space-between;gap:8px}
.aoOfficeReader .aoOfPrivateReview .aoOfProvenance{display:block;font:11px/1.4 system-ui;overflow-wrap:anywhere}

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
   localReview?.instance?.dispose?.();
   host.remove();
   restoreBackground();
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
 example.addEventListener("click",()=>{input.value="2026-11-28";draw()});
 bar.append(example);host.append(bar);
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
   status.replaceChildren();
   const heading=d.createElement("strong");heading.textContent=
     current.status==="SOURCE_RESEARCH_ONLY"?"Source pilot prepared · not yet published":"Hour not yet available";
   status.append(heading);
   const msg=d.createElement("p");
   msg.textContent=current.status==="SOURCE_RESEARCH_ONLY"
     ?(current.label+" · This Office remains held for independent rubrical, translation and publication checks. No substitute text will be displayed.")
     :"The selected date and Hour have not passed independent Office source and rubrical verification.";
   status.append(msg);
   const metadata=d.createElement("small");metadata.textContent=
      "Office date: "+(current.officeDate||"unresolved")+" · Status: "+current.reason+" · Reading enabled: no · Published: no";
   status.append(metadata);
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
