// Future Home renderer for the 526-card bilingual editorial selection.
// It is safe to import but *never* authorizes a release by itself.
// Production gate remains deliberately false until a separately signed-off release.
import {dyk526ApprovedCandidates,dyk526Model} from "./dyk-526-release-adapter.js";
import {dykPublishedMarkup} from "./dyk-published-feed.js";

// An explicit code review + owner-authorized release is needed to change this.
export const DYK526_HOME_ENABLED=false;
// This FUTURE release file does not exist yet. Never fetch from data/research.
const APPROVED_SOURCE=new URL("../../data/did-you-know/dyk-526-approved-release.v1.json",import.meta.url);

const clean=x=>typeof x==="string"?x.trim():"";
const validDate=x=>{
 if(typeof x!=="string"||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(x))return false;
 const d=new Date(x+"T12:00:00Z");
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===x;
};

// Does not fetch a byte or touch the private candidate corpus when disabled.
// The approved-release adapter validates the distinct schema and EVERY record gate.
export async function loadDyk526HomeRelease(win=globalThis,{enabled=DYK526_HOME_ENABLED}={}){
 if(enabled!==true||typeof win?.fetch!=="function")return null;
 try{
  const response=await win.fetch(APPROVED_SOURCE,{cache:"no-store"});
  if(!response?.ok)return null;
  const data=await response.json();
  return dyk526ApprovedCandidates(data,{enabled:true}).length?data:null;
 }catch{return null;}
}

export function dyk526HomeCandidates(data,{enabled=DYK526_HOME_ENABLED}={}){
 return dyk526ApprovedCandidates(data,{enabled});
}

// Render only a record independently approved in an APPROVED release bank.
// Use reviewed bilingual titles, not the old generic category heading.
export function applyDyk526HomeCard(button,data,id,date,language="en",{enabled=DYK526_HOME_ENABLED}={}){
 if(!button||!validDate(date)||enabled!==true)return false;
 const model=dyk526Model(data,id,date,language,{enabled:true});
 if(!model)return false;
 const title=button.querySelector?.("[data-home-dyk-title]");
 const fact=button.querySelector?.("[data-home-dyk-fact]");
 const source=button.querySelector?.("[data-home-dyk-source]");
 if(!title||!fact||!source||!button.dataset)return false;
 title.textContent=model.title;
 fact.textContent=model.fact;
 source.textContent=language==="fr"?
  "Découverte · Consulter la source ›":"Discovery · Read the source ›";
 delete button.dataset.homeDykEntry;
 button.dataset.homeDykBank="526";
 button.dataset.homeDykFactId=model.id;
 button.dataset.homeDykFactDate=date;
 return true;
}

// The ordinary Home source-sheet is reused; no new unapproved-source UI.
export async function openDyk526HomeSource(win,{
 id,date,language="en",trigger,enabled=DYK526_HOME_ENABLED
}={}){
 if(enabled!==true||!validDate(date)||!clean(id)||!win?.document?.createElement)return false;
 const data=await loadDyk526HomeRelease(win,{enabled:true});
 if(!data)return false;
 const model=dyk526Model(data,id,date,language,{enabled:true});
 if(!model)return false;
 const markup=dykPublishedMarkup(model);
 if(!markup)return false;
 const node=win.document.createElement("div");
 node.innerHTML=markup;
 const shade=node.querySelector("[data-dyk-published-shade]");
 if(!shade)return false;
 const close=()=>{
  node.remove();
  try{trigger?.focus?.({preventScroll:true})}catch{trigger?.focus?.()}
 };
 node.addEventListener("click",event=>{
  if(event.target===shade||event.target?.closest?.("[data-dyk-published-close]"))close();
 });
 node.addEventListener("keydown",event=>{
  if(event.key==="Escape"){event.preventDefault?.();close();return;}
  if(event.key!=="Tab")return;
  const items=[...node.querySelectorAll("button,a")];
  if(!items.length)return;
  if(event.shiftKey&&win.document.activeElement===items[0]){event.preventDefault?.();items.at(-1).focus();}
  else if(!event.shiftKey&&win.document.activeElement===items.at(-1)){event.preventDefault?.();items[0].focus();}
 });
 win.document.body.appendChild(node);
 node.querySelector("[data-dyk-published-close]")?.focus?.();
 return true;
}
