/**
 * An actual Prayer navigation owner for the Roman Divine Office.
 * Honest launch surface: until release gates are met, no pilot text can be
 * advertised as a complete public Hour. Tenebrae retains its existing owner.
 */
import {ROMAN_OFFICE_HOURS,officeRouteState} from "./office-route-state.js";
const STYLE=`
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
 const previous=[...mount.children];
 previous.forEach(node=>{node.hidden=true});
 const host=d.createElement("section");
 host.className="aoOfficeReader";
 host.setAttribute("aria-label","Divine Office");
 const style=d.createElement("style");style.textContent=STYLE;host.append(style);
 const back=d.createElement("button");back.type="button";
 back.textContent="← Prayer";back.setAttribute("aria-label","Return to Prayer");
 back.addEventListener("click",()=>{
   host.remove();previous.forEach(node=>{node.hidden=false});
 });
 host.append(back);
 const kicker=d.createElement("p");kicker.className="aoOfKicker";
 kicker.textContent="Breviarium Romanum · Rubrics of 1960";host.append(kicker);
 const title=d.createElement("h1");title.textContent="Divine Office";host.append(title);
 const intro=d.createElement("p");
 intro.textContent="Eight daily Hours. Source-first Latin, English and French readings are being integrated independently of the Mass calendar. Only individually certified Hours will become readable.";
 host.append(intro);
 const bar=d.createElement("div");bar.className="aoOfBar";
 const label=d.createElement("label");label.textContent="Office date ";
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
      "Status: "+current.reason+" · Reading enabled: no · Published: no";
   status.append(metadata);
 }
 input.addEventListener("change",draw);
 mount.prepend(host);
 draw();
 mount.scrollTop=0;
 return true;
}
