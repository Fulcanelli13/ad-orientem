import "./presentation-runtime.js";
import { directChildAnchor } from "./dom-anchor.js";

// Locked v43.59.30 PRAY coherence owner. Presentation behavior is preserved
// verbatim while route/navigation ownership belongs to AO_PRAY_APP_V1.
if(typeof window!=="undefined"&&typeof document!=="undefined"){

(()=>{'use strict';
const ROOT='aoPray435930', LEGACY='aoPrayerBookRoot', KEY='ao-prayer-recitation-mode';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isFr=()=>window.AO_RUNTIME_V8?.store?.getState?.()?.language==='fr';
const getMode=()=>{try{const x=localStorage.getItem(KEY);if(x==='group'||x==='individual')return x}catch{};const x=window.AO_PRAY_V435930?.state?.()?.rosary?.recitation;return x==='group'?'group':'individual'};
function setMode(v){
  const m=v==='group'?'group':'individual';
  try{localStorage.setItem(KEY,m)}catch{}
  document.documentElement.classList.toggle('aoRecitationGroup',m==='group');
  document.documentElement.classList.toggle('aoRecitationIndividual',m!=='group');
  document.querySelectorAll('[data-p435930-global-recitation]').forEach(b=>{const on=b.dataset.p435930GlobalRecitation===m;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on?'true':'false')});
  document.querySelectorAll('#aoPrayerBookRoot [data-ao-recitation],#aoPrayerBookRoot [data-p435930-recitation]').forEach(b=>{
    const x=b.dataset.aoRecitation||b.dataset.p435930Recitation;b.classList.toggle('active',x===m);
  });
  try{window.AO_PRAY_V435930?.setRecitationMode?.(m)}catch{}
  return m;
}
function oneLayer(){
  const root=document.getElementById(ROOT),legacy=document.getElementById(LEGACY);
  const open=!!root?.classList.contains('open');
  document.body.classList.toggle('aoP435930Open',open);
  if(open&&legacy){legacy.classList.remove('open');legacy.setAttribute('aria-hidden','true')}
}
function viewOf(root){return root?.querySelector('.aoP435930Mount')?.dataset.aoPrayView||''}
function needsRecitation(root){
  const v=viewOf(root);if(['rosary','confession','firstFriday','firstSaturday','fsMeditation'].includes(v))return false;
  if(v==='library')return !!root.querySelector('.aoP435930Prayer');
  return !!root.querySelector('.aoP435930Prayer,.aoP435930LitCard,.aoP435930AppendixFlip');
}
function recitationControl(root){
  root.querySelectorAll('[data-ao-recitation-control]').forEach(x=>x.remove());
  if(!needsRecitation(root))return;
  const body=root.querySelector('.aoP435930Body');if(!body)return;
  const fr=isFr(),m=getMode();
  const el=document.createElement('section');el.className='aoP435930RecitationMode';el.dataset.aoRecitationControl='1';
  el.innerHTML=`<span>${fr?'Récitation':'Recitation'}</span><div role="group" aria-label="${fr?'Mode de récitation':'Recitation mode'}"><button type="button" aria-pressed="${m==='individual'?'true':'false'}" data-p435930-global-recitation="individual" class="${m==='individual'?'active':''}">${fr?'Individuel':'Individual'}</button><button type="button" aria-pressed="${m==='group'?'true':'false'}" data-p435930-global-recitation="group" class="${m==='group'?'active':''}">${fr?'Groupe':'Group'}</button></div>`;
  const firstPrayer=body.querySelector('.aoP435930Cards,.aoP435930Prayer,.aoP435930AppendixFlip');
  const anchor=directChildAnchor(body,firstPrayer);
  if(anchor)body.insertBefore(el,anchor);else body.prepend(el);
}
function plainWithBreaks(el){
  const c=el.cloneNode(true);c.querySelectorAll('br').forEach(br=>br.replaceWith(document.createTextNode('\n')));
  return (c.textContent||'').replace(/\u00a0/g,' ').trim();
}
function canonicalMarkers(v){return String(v||'').replace(/^\s*V(?:[.\/]{0,2})\s+/gmi,'℣. ').replace(/^\s*R(?:[.\/]{0,2})\s+/gmi,'℟. ').replace(/^\s*℣(?:\.)?\s+/gmi,'℣. ').replace(/^\s*℟(?:\.)?\s+/gmi,'℟. ')}
function commonParts(text){
  const raw=String(text||'').trim(),low=raw.toLowerCase();
  const kind=/^(?:pater noster|our father|notre père|notre pere)\b/i.test(raw)?'pater':/^(?:ave maria|hail mary|je vous salue)\b/i.test(raw)?'ave':/^(?:gloria patri|glory be|gloire au père|gloire au pere)\b/i.test(raw)?'gloria':'';
  if(!kind)return null;
  const marks={pater:['panem nostrum','give us this day','donnez-nous aujourd'],ave:['sancta maria','holy mary','sainte marie'],gloria:['sicut erat','as it was','comme il était','comme il etait']}[kind];
  for(const mark of marks){const at=low.indexOf(mark);if(at>0)return{kind,leader:raw.slice(0,at).trim(),response:raw.slice(at).trim()}}
  return null;
}
function roleLine(line){
  const m=String(line).match(/^\s*([℣℟])\.\s*(.*)$/);if(!m)return null;
  const response=m[1]==='℟';return `<span class="aoP435930PrayerDialogue ${response?'aoResponse':'aoLeader'}"><span class="aoP435930PrayerRole">${m[1]}.</span><span class="aoP435930PrayerWords">${esc(m[2])}</span></span>`;
}
function litanyParts(line){
  let m=String(line||'').trim().match(/^(.+?)\s+[—–]\s+(.+)$/);
  if(!m)m=String(line||'').trim().match(/^(.+?),\s*((?:ora pro nobis|miserere nobis|parce nobis(?:, Domine)?|exaudi nos(?:, Domine)?|libera nos(?:, Domine)?|pray for us|have mercy on us|spare us(?:, O Lord)?|graciously hear us(?:, O Lord)?|deliver us(?:, O Lord)?|priez pour nous|ayez pitié de nous|pardonnez-nous(?:, Seigneur)?|exaucez-nous(?:, Seigneur)?|délivrez-nous(?:, Seigneur)?)\.?)$/i);
  return m?{call:m[1].trim(),response:m[2].trim()}:null;
}
function semantic(text){
  const src=canonicalMarkers(text),out=[];let blank=false;
  for(const raw of src.split(/\n/)){
    const line=String(raw||'').trim();if(!line){blank=true;continue}
    if(blank&&out.length)out.push('<span class="aoP435930PrayerSpacer" aria-hidden="true"></span>');blank=false;
    const role=roleLine(line);if(role){out.push(role);continue}
    const cp=commonParts(line);if(cp){out.push(`<span class="aoP435930CommonSplit" data-common-prayer="${cp.kind}"><span class="aoP435930CommonLeader"><span class="aoP435930PrayerRole" aria-hidden="true">℣.</span><span>${esc(cp.leader)}</span></span><span class="aoP435930CommonResponse"><span class="aoP435930PrayerRole" aria-hidden="true">℟.</span><span>${esc(cp.response)}</span></span></span>`);continue}
    const lp=litanyParts(line);if(lp){out.push(`<span class="aoP435930LitanyLine"><span class="aoP435930LitanyCall"><span class="aoP435930PrayerRole">℣.</span><span>${esc(lp.call)}</span></span><span class="aoP435930LitanyResponse"><span class="aoP435930PrayerRole">℟.</span><span>${esc(lp.response)}</span></span></span>`);continue}
    out.push(`<span class="aoP435930PrayerProse">${esc(line)}</span>`);
  }
  return out.join('');
}
function semanticFace(el){
  if(!el||el.dataset.aoPraySemantic==='1')return;
  // The canonical Angelus already provides a separate leader and response.
  // TextContent flattens its two nested spans into one line, which previously
  // destroyed the response role (and the spoken pairing) in Group mode.
  // Keep this structured DOM as the authority rather than parsing it twice.
  if(el.querySelector('[data-ao-angelus-voice="leader"]')&&
     el.querySelector('[data-ao-angelus-voice="response"]')){
    el.classList.add('aoP435930SemanticFace');
    el.dataset.aoPraySemantic='1';
    return;
  }
  const text=plainWithBreaks(el);if(!text)return;
  el.innerHTML=semantic(text);el.classList.add('aoP435930SemanticFace');el.dataset.aoPraySemantic='1';
}
function normalizePrayerText(root){
  root.querySelectorAll('.aoP435930LitCard [data-face-v],.aoP435930LitCard [data-face-la],.aoP435930Flip [data-face-v],.aoP435930Flip [data-face-la],.aoP435930AppendixFlip [data-face-v],.aoP435930AppendixFlip [data-face-la],.aoP435930Prayer .aoP435930Text').forEach(semanticFace);
  root.querySelectorAll('.pbFlipHint,.lab-flip-hint,[data-pb-flip-hint],.flipHint,.translationNote').forEach(x=>x.remove());
}
function enforceTranslationContract(root){
  if(!root)return;
  root.querySelectorAll('[data-p435930-card-flip],[data-p435930-flip],.aoP435930Flip,.aoP435930AppendixFlip').forEach(host=>{
    const vern=host.querySelector('[data-face-v]'),latin=host.querySelector('[data-face-la]');if(!vern||!latin)return;
    if(!vern.hidden&&!latin.hidden)latin.hidden=true;
    const latinVisible=!latin.hidden;host.dataset.aoTranslate='tap';host.setAttribute('aria-pressed',latinVisible?'true':'false');host.setAttribute('aria-label',isFr()?'Afficher l’autre langue':'Show the other language');
  });
}
let v3410LastScrollTop=0;
function v3410FocusY(mount){
  const mr=mount.getBoundingClientRect(),head=mount.querySelector(':scope > .aoP435930Head');
  const top=Math.max(mr.top,head?.getBoundingClientRect().bottom||mr.top),bottom=mr.bottom;
  const ratio=matchMedia('(max-width:760px)').matches?.40:.42;
  return top+Math.max(90,(bottom-top)*ratio);
}
function v3410MidpointCurrent(nodes,y){
  if(!nodes.length)return null;
  for(let i=0;i<nodes.length-1;i++){
    const a=nodes[i].getBoundingClientRect(),b=nodes[i+1].getBoundingClientRect();
    if(y<(a.bottom+b.top)/2)return nodes[i];
  }
  return nodes[nodes.length-1];
}
function v3410Energy(nodes,current,mount,{near=.76,far=.54,variable='--ao347-focus-opacity',prefix='ao347'}={}){
  const idx=nodes.indexOf(current);if(idx<0)return;
  const y=v3410FocusY(mount),s=mount.scrollTop,direction=s===v3410LastScrollTop?0:(s>v3410LastScrollTop?1:-1);
  v3410LastScrollTop=s;
  const energy=nodes.map((_,i)=>i===idx?1:(Math.abs(i-idx)===1?near:far));
  const preZone=matchMedia('(max-width:760px)').matches?118:138;
  if(direction>=0&&idx<nodes.length-1){
    const a=current.getBoundingClientRect(),b=nodes[idx+1].getBoundingClientRect(),distance=(a.bottom+b.top)/2-y,p=Math.max(0,Math.min(1,1-distance/preZone));
    if(p>0){energy[idx]=1-.04*p;energy[idx+1]=near+.17*p}
  }else if(direction<0&&idx>0){
    const a=nodes[idx-1].getBoundingClientRect(),b=current.getBoundingClientRect(),distance=y-(a.bottom+b.top)/2,p=Math.max(0,Math.min(1,1-distance/preZone));
    if(p>0){energy[idx]=1-.04*p;energy[idx-1]=near+.17*p}
  }
  nodes.forEach((n,i)=>{
    n.style.setProperty(variable,energy[i].toFixed(3));
    const d=Math.abs(i-idx);
    n.classList.toggle(prefix+'-current',i===idx);
    n.classList.toggle(prefix+'-near',d===1);
    n.classList.toggle(prefix+'-far',d>1);
    n.dataset.aoPrayFocus=i===idx?'active':i<idx?'past':'future';
  });
}
function v3410StationNodes(root){
  const main=root.querySelector('.aoP435930Stations');if(!main)return[];
  const out=[],push=(el,phase)=>{if(el){el.dataset.ao347Phase=phase;out.push(el)}};
  push(main.querySelector('.aoP435930GuideNow'),'arrive');
  const prayers=[...main.querySelectorAll('.aoP435930StationPrayer')];
  push(prayers[0],'adoramus');
  push(main.querySelector('.aoP435930StationConsider'),'consider');
  push(main.querySelector('.aoP435930StationOrdinary'),'ordinary');
  prayers.slice(1).forEach(el=>push(el,'devotion'));
  push([...main.querySelectorAll('.aoP435930GuideCue')].at(-1),'move');
  return out;
}
function v3410SpecialFocus(root,mount){
  const view=viewOf(root),y=v3410FocusY(mount);
  if(view==='angelus'){
    const nodes=[...root.querySelectorAll('.aoP435930AngelusSequence .aoP435930PrayerUnit')].filter(x=>x.offsetParent!==null),current=v3410MidpointCurrent(nodes,y);
    if(!current)return false;
    v3410Energy(nodes,current,mount,{near:.76,far:.50,variable:'--ao346-focus-opacity',prefix:'ao346'});
    nodes.forEach(n=>n.classList.toggle('ao346-incarnation',n===current&&n.dataset.aoIncarnation==='true'));
    return true;
  }
  if(view==='stations'){
    const nodes=v3410StationNodes(root).filter(x=>x.offsetParent!==null),current=v3410MidpointCurrent(nodes,y);
    if(!current)return false;
    nodes.forEach(n=>n.classList.add('ao347-focusable'));
    v3410Energy(nodes,current,mount,{near:.76,far:.54,variable:'--ao347-focus-opacity',prefix:'ao347'});
    return true;
  }
  return false;
}
function focusUnits(root){
  root.querySelectorAll('.aoP435930FluidUnit').forEach(x=>x.classList.remove('aoP435930FluidUnit'));
  root.querySelectorAll('.aoP435930SemanticFace').forEach(face=>{
    if(face.closest('.aoP435930PrayerUnit')){face.classList.add('aoP435930FluidUnit');return}
    [...face.children].forEach(el=>{if(!el.classList.contains('aoP435930PrayerSpacer'))el.classList.add('aoP435930FluidUnit')});
  });
  const mount=root.querySelector('.aoP435930Mount'),special=['angelus','stations'].includes(viewOf(root));
  const hasFocusUnits=special||!!root.querySelector('.aoP435930FluidUnit');
  mount?.classList.toggle('aoP435930FocusRunway',hasFocusUnits);
  mount?.classList.toggle('aoP435930ReadingView',hasFocusUnits);
  mount?.classList.toggle('aoP435930InteractiveView',!hasFocusUnits);
  if(mount){if(hasFocusUnits)mount.dataset.aoReaderContract=special?'fluid-v3410':'fluid-v1';else delete mount.dataset.aoReaderContract}
}
function updateFocus(){
  const root=document.getElementById(ROOT),mount=root?.querySelector('.aoP435930Mount');if(!root||!mount||!root.classList.contains('open'))return;
  if(v3410SpecialFocus(root,mount))return;
  const units=[...root.querySelectorAll('.aoP435930FluidUnit')].filter(x=>x.offsetParent!==null);if(!units.length)return;
  const box=mount.getBoundingClientRect(),focusY=box.top+Math.min(box.height,window.innerHeight)*.43,band=Math.max(150,Math.min(box.height,window.innerHeight)*.39);
  let active=null,best=Infinity;
  for(const el of units){const r=el.getBoundingClientRect(),c=(r.top+r.bottom)/2,d=Math.abs(c-focusY);if(d<best){best=d;active=el}}
  for(const el of units){
    const r=el.getBoundingClientRect(),c=(r.top+r.bottom)/2,d=Math.abs(c-focusY),t=Math.min(1,d/band);
    let opacity=.018+.982*Math.pow(1-t,2.25);if(el===active)opacity=1;
    el.style.setProperty('--ao-pray-focus-opacity',opacity.toFixed(3));
    el.dataset.aoPrayFocus=el===active?'active':c<focusY?'past':'future';
  }
}
function decorate(){
  const root=document.getElementById(ROOT);if(!root)return;
  oneLayer();setMode(getMode());recitationControl(root);normalizePrayerText(root);enforceTranslationContract(root);focusUnits(root);requestAnimationFrame(updateFocus);
}
let raf=0;function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(decorate)}
function boot(){
  const root=document.getElementById(ROOT);if(!root)return false;
  const mount=root.querySelector('.aoP435930Mount');
  new MutationObserver(schedule).observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
  mount?.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(updateFocus)},{passive:true});
  window.addEventListener('resize',()=>requestAnimationFrame(updateFocus),{passive:true});
  decorate();return true;
}
if(!boot())new MutationObserver((_,o)=>{if(boot())o.disconnect()}).observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-p435930-global-recitation]');if(b){setMode(b.dataset.p435930GlobalRecitation);schedule();return}
  const q=e.target.closest?.('[data-ao-recitation],[data-p435930-recitation]');if(q){setMode(q.dataset.aoRecitation||q.dataset.p435930Recitation);schedule()}
},true);
window.AO_PRAY_COHERENCE_V435930={version:'43.59.30-pray-unified-reader-closure',decorate,updateFocus,setMode,mode:getMode,semantic,commonParts,audit(){
  const root=document.getElementById(ROOT),pairs=root?[...root.querySelectorAll('[data-ao-translate=\"tap\"]')]:[],stacked=pairs.filter(h=>{const v=h.querySelector('[data-face-v]'),a=h.querySelector('[data-face-la]');return v&&a&&!v.hidden&&!a.hidden}).length;return {view:viewOf(root),open:!!root?.classList.contains('open'),recitation:getMode(),semanticFaces:root?.querySelectorAll('.aoP435930SemanticFace').length||0,fluidUnits:root?.querySelectorAll('.aoP435930FluidUnit').length||0,readerContract:root?.querySelector('.aoP435930Mount')?.dataset.aoReaderContract||'interactive',translationPairs:pairs.length,stackedTranslationPairs:stacked,recitationControls:root?.querySelectorAll('[data-ao-recitation-control]').length||0,legacyOpen:document.getElementById(LEGACY)?.classList.contains('open')||false,stackedLatinDetails:root?.querySelectorAll('details>summary').length? [...root.querySelectorAll('details>summary')].filter(x=>/^latin$/i.test(x.textContent.trim())).length:0}}};
})();

}
