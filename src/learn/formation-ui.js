// Shared visual grammar for Formation's existing canonical readers.
// Layout only: no content ownership, translation, publication or route changes.
export const FORMATION_UI_VERSION="formation-unified-navigation-v2";

export function formationReaderCss(){
  const roots=":is(#ao-glossary-root,#ao-learn-modular-root,#ao-spiritual-life-root,#ao-sexual-ethics-root,#ao-latin-course-root,#ao-learn-traditional-root,#ao-mass-formation-root,#ao-formation-recovery-review)";
  const top=":is(.aoGlossTop,.aoLearnModTop,.aoSLTop,.aoCSETop,.aoL2Top,.aoLearnTradTop,.aoMFTop,.rrTop)";
  const wrap=":is(.aoGlossWrap,.aoLearnModWrap,.aoSLWrap,.aoCSEWrap,.aoL2Wrap,.aoLearnTradWrap,.aoMFWrap)";
  return `
${roots}{--ao-formation-column:760px;--ao-formation-gutter:var(--ao-page-gutter,14px);background:var(--ao-bg-canvas,var(--bg,#080c12));color:var(--ao-text-primary,var(--text,#e9e4d9));font-family:var(--ao-font-body,var(--font-body,Georgia,serif));overscroll-behavior:contain}
${roots} ${top}{position:sticky;top:0;z-index:9;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:10px;align-items:center;padding:calc(10px + var(--safe-top,0px)) var(--ao-formation-gutter) 10px;background:color-mix(in srgb,var(--ao-bg-canvas,var(--bg,#080c12)) 94%,transparent);border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.14)));backdrop-filter:blur(var(--ao-topbar-blur,14px))}
${roots} ${top} button{width:44px;height:44px;min-width:44px;min-height:44px;padding:0;display:grid;place-items:center;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.16)));border-radius:var(--ao-pill-radius,999px);background:var(--ao-surface-1,var(--surface-1,#101821));color:inherit}
${roots} ${top}>:nth-child(2){min-width:0;text-align:center}
${roots} ${top} small{display:block;color:var(--liturgical,#c9ad78);font:600 .64rem/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.1em;text-transform:uppercase}
${roots} ${top} strong{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-height:2.55em;margin-top:3px;font:600 1rem/1.24 var(--ao-font-display,var(--font-display,Georgia,serif));letter-spacing:.01em;white-space:normal;text-overflow:ellipsis}
${roots} ${wrap}{box-sizing:border-box;width:min(var(--ao-formation-column),100%);max-width:100%;margin-inline:auto;padding:20px var(--ao-formation-gutter) 48px}
${roots} :is(.aoGlossHero,.aoLearnModHero,.aoSLHero,.aoL2Hero,.aoSLLessonHead){padding-top:12px;padding-bottom:20px}
${roots} :is(.aoGlossHero h1,.aoLearnModHero h1,.aoSLHero h1,.aoL2Hero h1,.aoSLLessonHead h1,.aoMFStage h1){font:500 clamp(1.95rem,7vw,3rem)/1.08 var(--ao-font-display,var(--font-display,Georgia,serif));letter-spacing:-.015em}
${roots} :is(.aoGlossHero p,.aoLearnModHero p,.aoSLHero p,.aoL2Meta p,.aoLearnTradIntro,.aoMFIntro,.aoCSEIntro,.aoSLLessonHead p){font-size:max(15px,.9375rem);line-height:1.58;color:var(--ao-text-muted,var(--muted,#a9a5b1))}
${roots} :is(.aoSLBlock p,.aoL2Block p,.aoMFClaim p,.aoLearnTradCard p,.aoCSEAnswer,.aoCSEDebateStep p){font-size:max(15px,.9375rem);line-height:1.66}
${roots} :is(.aoGlossSection,.aoGlossTerm,.aoSLRow,.aoCSERow,.aoMFStageRow,.aoLearnTradCard>summary,.aoL2Stage,.aoL2Lesson){min-height:54px}
${roots} :is(.aoSLSources summary,.aoCSESources summary,.aoL2Sources summary,.aoLearnTradSource summary,.aoL2Panel>summary){min-height:44px;display:flex;align-items:center;line-height:1.4}
${roots} :is(button,input,select,textarea,summary,a):focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:3px}
${roots} :is(.aoSLSource a,.aoCSESource a,.aoLearnTradSource a,.aoMFSource a){text-decoration-color:color-mix(in srgb,var(--liturgical,#c9ad78) 50%,transparent);text-underline-offset:3px}
${roots} :is(.aoSLBlock h2,.aoL2Block h2,.aoCSEMaritalDisputations h2,.aoLearnTradPrayer h2,.aoMFStageRow strong){font-family:var(--ao-font-display,var(--font-display,Georgia,serif))}
${roots} :is(.aoGlossCard,.aoGlossTerm,.aoLearnModCard,.aoL2Stage,.aoL2Lesson,.aoL2Panel,.aoL2Passage,.aoL2Exercise,.aoCSEAnswer){border-color:var(--ao-rule,var(--border,rgba(255,255,255,.14)));background:var(--ao-surface-1,var(--surface-1,#101821))}

${roots} .aoFNav{position:sticky;top:var(--ao-fnav-top,65px);z-index:8;background:color-mix(in srgb,var(--ao-bg-canvas,#080c12) 94%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.12));font-family:var(--ao-font-ui,system-ui,sans-serif);animation:aoFNavAppear .22s ease-out}
${roots} .aoFNavRail{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:8px;max-width:760px;margin:auto;padding:7px var(--ao-formation-gutter,14px)}
${roots} .aoFNav button{color:inherit;cursor:pointer}
${roots} .aoFNavArrow{display:grid;place-items:center;width:44px;height:44px;border:1px solid var(--ao-rule,rgba(255,255,255,.16));border-radius:50%;background:var(--ao-surface-1,#101821);font:500 1.3rem/1 var(--ao-font-ui,system-ui,sans-serif)}
${roots} .aoFNavArrow:disabled{opacity:.3;cursor:default}
${roots} .aoFNavMain{display:flex;align-items:center;min-width:0;gap:9px;min-height:44px;padding:4px 11px;border:1px solid var(--ao-rule,rgba(255,255,255,.16));border-radius:13px;background:var(--ao-surface-1,#101821);text-align:left}
${roots} .aoFNavIcon{flex:0 0 20px;font:1.1rem/1 var(--ao-font-ui,system-ui,sans-serif);color:var(--liturgical,#c9ad78)}
${roots} .aoFNavText{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
${roots} .aoFNavCounter{font:650 .63rem/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.065em;text-transform:uppercase;color:var(--liturgical,#c9ad78)}
${roots} .aoFNavTitle{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:500 .81rem/1.28 var(--ao-font-ui,system-ui,sans-serif)}
${roots} .aoFNavChevron{color:var(--liturgical,#c9ad78);font-size:.95rem;transition:transform .18s ease}
${roots} .aoFNavMain[aria-expanded=true] .aoFNavChevron{transform:rotate(180deg)}
${roots} .aoFNavProgress{height:2px;background:var(--ao-rule,rgba(255,255,255,.14));overflow:hidden}
${roots} .aoFNavProgress>span{display:block;transform:scaleX(var(--ao-fnav-progress,0));transform-origin:left center;height:100%;width:100%;background:var(--liturgical,#c9ad78);transition:transform .15s linear}
${roots} .aoFNavMenu{max-height:min(45vh,320px);overflow-y:auto;overscroll-behavior:contain;padding:5px var(--ao-formation-gutter,14px) 13px;border-top:1px solid var(--ao-rule,rgba(255,255,255,.1))}
${roots} .aoFNavMenu[hidden]{display:none!important}
${roots} .aoFNavIndex{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;max-width:760px;margin:auto}
${roots} .aoFNavIndex button{display:flex;align-items:center;gap:8px;min-width:0;min-height:44px;padding:8px 10px;text-align:left;border:1px solid var(--ao-rule,rgba(255,255,255,.13));border-radius:10px;background:var(--ao-surface-1,#101821);font:500 .75rem/1.35 var(--ao-font-ui,system-ui,sans-serif)}
${roots} .aoFNavIndex button[aria-current=location]{border-color:var(--liturgical,#c9ad78);background:color-mix(in srgb,var(--liturgical,#c9ad78) 9%,var(--ao-surface-1,#101821))}
${roots} .aoFNavIndex button>span:first-child{flex:0 0 auto;color:var(--liturgical,#c9ad78);font-size:.65rem;font-variant-numeric:tabular-nums}
${roots} .aoFNavIndex button>span:last-child{min-width:0;overflow-wrap:break-word}
${roots} .aoFNav :is(button):focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:2px}
${roots} .aoFNavTarget{scroll-margin-top:150px}
${roots} main{animation:aoFReaderAppear .19s ease-out both}
@keyframes aoFNavAppear{from{opacity:.5;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
@keyframes aoFReaderAppear{from{opacity:.85}to{opacity:1}}
@media(prefers-reduced-motion:reduce){${roots} .aoFNav,${roots} main{animation:none!important}${roots} .aoFNav *{transition:none!important}}
@media(max-width:430px){${roots} .aoFNavRail{gap:7px;padding:6px 12px}${roots} .aoFNavIndex{gap:6px}${roots} .aoFNavIndex button{font-size:.72rem;padding:8px}}
@media(max-width:430px){
 ${roots} ${top}{gap:8px}
 ${roots} ${wrap}{padding:16px var(--ao-formation-gutter) 40px}
 ${roots} :is(.aoGlossHero h1,.aoLearnModHero h1,.aoSLHero h1,.aoL2Hero h1,.aoSLLessonHead h1,.aoMFStage h1){font-size:clamp(1.9rem,8vw,2.4rem)}
}
`;
}


// Reader navigator: semantic section index plus scroll position, not a graded
// completion meter. The existing content owners keep all Back/Next semantics.
const fnavInstances=new WeakMap();
const fnavEsc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fnavTrim=value=>String(value||"").replace(/\s+/g," ").trim();
const fnavFr=(win,root)=>root?.lang==="fr"||win?.document?.documentElement?.lang==="fr"||
 win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr";
function fnavEntries(main){
 const headings=[...main.querySelectorAll("h2")].filter(x=>fnavTrim(x.textContent).length>2);
 const buttons=headings.length>=2?headings:
  [...main.querySelectorAll([
   "[data-ao-sl-lesson]","[data-ao-cse-family]","[data-ao-mf-stage]",
   "[data-l2-stage]","[data-l2-lesson]","[data-ao-learn-family]",
   "[data-rr-theme]","[data-rr-dossier]","[data-gloss-category]",
   "[data-ao-tradlearn-module]"
  ].join(","))];
 const targets=buttons.length?buttons:[...main.querySelectorAll("h1,h2,h3")].filter(x=>fnavTrim(x.textContent).length>2);
 const entries=[],seen=new Set();
 for(const el of targets){
  const title=fnavTrim(el.querySelector?.("strong")?.textContent||el.textContent).slice(0,85);
  if(!title||seen.has(title))continue;
  seen.add(title);entries.push({el,title});
  if(entries.length>=80)break;
 }
 return entries;
}
export function installFormationNavigation(win,root){
 if(!root?.querySelector||!root?.querySelectorAll||!root?.insertBefore||!root?.addEventListener)return false;
 const header=root.querySelector(":scope > header"),main=root.querySelector(":scope > main");
 if(!header||!main||!main.querySelectorAll)return false;
 const old=root.querySelector(":scope > .aoFNav");
 if(old)old.remove();
 const previous=fnavInstances.get(root);
 if(previous){root.removeEventListener?.("scroll",previous.onScroll);root.removeEventListener?.("click",previous.onClick);}
 fnavInstances.delete(root);
 const entries=fnavEntries(main);
 if(entries.length<2)return false;
 const fr=fnavFr(win,root),doc=root.ownerDocument||win?.document;
 if(!doc?.createElement)return false;
 const nav=doc.createElement("nav");
 nav.className="aoFNav";
 nav.setAttribute("aria-label",fr?"Navigation dans la page":"On this page");
 nav.innerHTML='<div class="aoFNavRail">'+
  '<button type="button" class="aoFNavArrow" data-ao-fnav-action="prev" aria-label="'+(fr?"Section précédente":"Previous section")+'">‹</button>'+
  '<button type="button" class="aoFNavMain" data-ao-fnav-action="toggle" aria-expanded="false" aria-controls="ao-fnav-index-'+fnavEsc(root.id)+'">'+
   '<span class="aoFNavIcon" aria-hidden="true">☷</span>'+
   '<span class="aoFNavText"><span class="aoFNavCounter" data-ao-fnav-counter></span><span class="aoFNavTitle" data-ao-fnav-title></span></span>'+
   '<span class="aoFNavChevron" aria-hidden="true">⌄</span></button>'+
  '<button type="button" class="aoFNavArrow" data-ao-fnav-action="next" aria-label="'+(fr?"Section suivante":"Next section")+'">›</button>'+
  '</div><div class="aoFNavProgress" aria-hidden="true"><span></span></div>'+
  '<div class="aoFNavMenu" id="ao-fnav-index-'+fnavEsc(root.id)+'" hidden><div class="aoFNavIndex">'+
  entries.map((x,i)=>'<button type="button" data-ao-fnav-go="'+i+'"><span>'+String(i+1).padStart(2,"0")+'</span><span>'+fnavEsc(x.title)+'</span></button>').join("")+
  '</div></div>';
 root.insertBefore(nav,main);
 root.style?.setProperty?.("--ao-fnav-top",Math.round(header.getBoundingClientRect().height)+"px");
 for(const x of entries)x.el.classList.add("aoFNavTarget");
 const state={nav,entries,index:0,open:false,onScroll:null,onClick:null};
 const redraw=()=>{
  if(!nav.isConnected)return;
  const viewTop=nav.getBoundingClientRect().bottom+7;
  let index=0;
  for(let i=0;i<entries.length;i++)if(entries[i].el.getBoundingClientRect().top<=viewTop+2)index=i;
  state.index=index;
  const counter=nav.querySelector("[data-ao-fnav-counter]"),title=nav.querySelector("[data-ao-fnav-title]");
  if(counter)counter.textContent=(fr?"SECTION ":"SECTION ")+(index+1)+" / "+entries.length;
  if(title)title.textContent=entries[index]?.title||"";
  for(const [action,disabled] of [["prev",index===0],["next",index===entries.length-1]]){
   const b=nav.querySelector('[data-ao-fnav-action="'+action+'"]');if(b)b.disabled=disabled;
  }
  nav.querySelectorAll("[data-ao-fnav-go]").forEach(x=>{
   if(Number(x.dataset.aoFnavGo)===index)x.setAttribute("aria-current","location");
   else x.removeAttribute("aria-current");
  });
  const max=Math.max(1,root.scrollHeight-root.clientHeight);
  const progress=Math.max(0,Math.min(1,root.scrollTop/max));
  nav.style.setProperty("--ao-fnav-progress",String(progress));
 };
 const jump=i=>{
  const index=Math.max(0,Math.min(entries.length-1,i)),target=entries[index]?.el;
  if(!target)return;
  state.index=index;
  const top=root.scrollTop+target.getBoundingClientRect().top-root.getBoundingClientRect().top-
    nav.getBoundingClientRect().height-(header.getBoundingClientRect().height||0)-8;
  const reduced=win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  root.scrollTo?.({top:Math.max(0,top),behavior:reduced?"instant":"smooth"});
  if(target.matches?.("h1,h2,h3")){target.setAttribute("tabindex","-1");target.focus?.({preventScroll:true});}
  redraw();
 };
 state.onClick=e=>{
  const button=e.target?.closest?.("[data-ao-fnav-action],[data-ao-fnav-go]");
  if(!button||!nav.contains(button))return;
  e.preventDefault?.();
  const action=button.dataset.aoFnavAction;
  if(action==="toggle"){
   state.open=!state.open;
   const menu=nav.querySelector(".aoFNavMenu");if(menu)menu.hidden=!state.open;
   button.setAttribute("aria-expanded",String(state.open));
  }else if(action==="prev"||action==="next")jump(state.index+(action==="next"?1:-1));
  else if(button.dataset.aoFnavGo!==undefined){
   state.open=false;
   const menu=nav.querySelector(".aoFNavMenu");if(menu)menu.hidden=true;
   nav.querySelector('[data-ao-fnav-action="toggle"]')?.setAttribute("aria-expanded","false");
   jump(Number(button.dataset.aoFnavGo));
  }
 };
 state.onScroll=()=>redraw();
 root.addEventListener("click",state.onClick);
 root.addEventListener("scroll",state.onScroll,{passive:true});
 fnavInstances.set(root,state);
 redraw();
 return true;
}
