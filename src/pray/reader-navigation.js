// Presentation-only section/progress alignment. The original Rosary engine
// owns steps and prayer text; this module never changes or completes them.
export const READER_NAV_VERSION="shared-prayer-reader-navigation-v1";

export function readerPosition(index,total){
  const size=Number.isFinite(Number(total))?Math.max(0,Math.trunc(Number(total))):0;
  const step=size?Math.max(0,Math.min(size-1,Math.trunc(Number(index)||0))):0;
  return Object.freeze({index:step,total:size,percent:size?Math.round((step/Math.max(1,size-1))*100):0});
}
export function syncAngelusNavigation(main,current){
  const nav=main?.querySelector?.("[data-ao-angelus-progress]");
  if(!nav)return false;
  const buttons=[...(nav.querySelectorAll?.("[data-ao-angelus-jump]")??[])];
  if(!buttons.length)return false;
  const step=readerPosition(current?.dataset?.aoAngelusIndex,buttons.length);
  if(!current)return false;
  const key=String(step.index);
  if(nav.dataset.aoReaderCurrent===key)return true;
  nav.dataset.aoReaderCurrent=key;
  buttons.forEach((b,i)=>{
    const active=i===step.index;
    b.classList.toggle("current",active);
    if(active)b.setAttribute("aria-current","step");
    else b.removeAttribute("aria-current");
  });
  const label=nav.querySelector("[data-ao-reader-position]");
  const prefix=nav.dataset.aoProgressPrefix||"Prayer";
  if(label)label.textContent=prefix+" "+(step.index+1)+" / "+step.total;
  return true;
}
export function scrollToAngelusUnit(mount,index){
  if(!mount?.querySelector)return false;
  const units=[...mount.querySelectorAll(".aoP435930AngelusSequence .aoP435930PrayerUnit")];
  if(!units.length||!Number.isFinite(Number(index)))return false;
  const step=readerPosition(index,units.length);
  const el=units[step.index],top=mount.getBoundingClientRect?.().top??0;
  const target=Math.max(0,Number(mount.scrollTop||0)+(el.getBoundingClientRect().top-top)-Math.min(116,(mount.clientHeight||400)*.2));
  if(typeof mount.scrollTo==="function")mount.scrollTo({top:target,behavior:"auto"});
  else mount.scrollTop=target;
  return true;
}
function rosaryDonor(win){
  const doc=win?.document;
  const r=doc?.querySelector?.("#aoPrayerBookRoot.open");
  return r?.querySelector?.(".pbShell")?r:null;
}
export function syncRosaryProgress(win=globalThis){
  const root=rosaryDonor(win),api=win?.AO_ROSARY_V381;
  if(!root||typeof api?.steps!=="function"||typeof api?.state!=="function")return false;
  const state=api.state(),steps=api.steps();
  if(!state||!Array.isArray(steps)||!steps.length)return false;
  const position=readerPosition(state.step,steps.length);
  const shell=root.querySelector(".pbShell");
  const anchor=shell?.querySelector(".aoP435930RosaryBar,.lab-view-head,.pbTop,.pbHead,header");
  if(!shell||!anchor)return false;
  let nav=shell.querySelector('[data-ao-rosary-progress]');
  if(!nav){
    nav=win.document.createElement("div");
    nav.className="aoReaderSeqNav aoReaderRosaryProgress";
    nav.dataset.aoRosaryProgress=READER_NAV_VERSION;
    nav.setAttribute("role","group");
    nav.setAttribute("aria-label","Rosary reading position");
    const caption=win.document.createElement("span");
    caption.className="aoReaderSeqPosition";
    caption.dataset.aoReaderPosition="";
    nav.appendChild(caption);
    const track=win.document.createElement("div");
    track.className="aoReaderSeqTrack";
    track.setAttribute("role","progressbar");
    track.setAttribute("aria-valuemin","0");
    track.setAttribute("aria-valuemax","100");
    track.setAttribute("aria-label","Current place in the Rosary reader");
    const fill=win.document.createElement("span");
    fill.className="aoReaderSeqFill";
    track.appendChild(fill);
    nav.appendChild(track);
    anchor.insertAdjacentElement("afterend",nav);
  }
  const mi=Number(steps[position.index]?.mi);
  const mystery=Number.isInteger(mi)&&mi>=0&&mi<15?" · "+(mi+1):"";
  const language=win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr";
  const label=(language?"Étape ":"Step ")+(position.index+1)+" / "+position.total+(mystery?(language?" · Mystère":" · Mystery")+mystery:"");
  const key=position.index+":"+position.total+":"+label;
  if(nav.dataset.aoReaderCurrent===key)return true;
  nav.dataset.aoReaderCurrent=key;
  const caption=nav.querySelector("[data-ao-reader-position]");
  if(caption)caption.textContent=label;
  const track=nav.querySelector('[role="progressbar"]');
  if(track)track.setAttribute("aria-valuenow",String(position.percent));
  const fill=nav.querySelector(".aoReaderSeqFill");
  if(fill)fill.style.width=position.percent+"%";
  return true;
}
