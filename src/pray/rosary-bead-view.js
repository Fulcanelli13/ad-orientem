// Rosary bead view — presentation-only layout for the canonical Rosary player.
//
// The certified Rosary engine (window.AO_ROSARY_V381) and its exact donor
// shell (#aoPrayerBookRoot) remain the only owners of steps, methods and
// prayer text. This layer:
//   • never writes or retypes prayer text — it re-presents the text nodes the
//     donor has already rendered for the current step;
//   • advances only by pressing the donor's own Previous / Next / bead
//     controls, so every method (ordinary, fifteen, Montfort, scriptural) keeps
//     its existing navigation rules and its Finish behaviour;
//   • is opt-in and remembered per device ("ao-rosary-layout" = "beads").
//
// Layout: the decade itself is the interface. A ring of ten Ave beads with the
// Pater bead below shows where you are; the lower part of the screen is one
// large tap target that advances a bead, so the Rosary can be prayed without
// looking for a small button. Familiar prayers are collapsed to one line.

const LAYOUT_KEY="ao-rosary-layout";
const FACE_KEY="ao-rosary-bead-face";
const RECITATION_KEY="ao-prayer-recitation-mode";
const VIEW_ID="aoRosaryBeadView";
const STYLE_ID="aoRosaryBeadViewStyles";
const VERSION="rosary-bead-view-v1";

const COLLAPSED_BY_DEFAULT=new Set(["sign","pater","ave","gloria","credo"]);

const NAMES={
 en:{sign:"Sign of the Cross",credo:"Apostles’ Creed",pater:"Our Father",ave:"Hail Mary",gloria:"Glory Be",fatima:"O my Jesus",mystery:"Announce the mystery",conclusion:"Closing prayers"},
 fr:{sign:"Signe de la Croix",credo:"Symbole des Apôtres",pater:"Notre Père",ave:"Je vous salue Marie",gloria:"Gloire au Père",fatima:"Ô mon Jésus",mystery:"Annoncer le mystère",conclusion:"Prières finales"}
};

const ROMAN=["I","II","III","IV","V"];

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function isFr(){
 try{return window.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"}catch{return false}
}
const L=(en,fr)=>isFr()?fr:en;
function read(key,fallback){try{return localStorage.getItem(key)??fallback}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,value)}catch{}}

export function rosaryLayout(){return read(LAYOUT_KEY,"classic")==="beads"?"beads":"classic"}
export function setRosaryLayout(value){
 write(LAYOUT_KEY,value==="beads"?"beads":"classic");
 schedule();
 return rosaryLayout();
}

function api(){return window.AO_ROSARY_V381||null}
function donorRoot(){
 const root=document.getElementById("aoPrayerBookRoot");
 return root&&root.classList.contains("open")?root:null;
}
function playerShell(root){
 const shell=root?.querySelector(".pbShell");
 return shell&&shell.querySelector("[data-lab-rosary-next]")?shell:null;
}

/* ------------------------------------------------------------------ state */

const session={expanded:new Set(),mysteryTitles:new Map(),fruits:new Map(),setTitles:new Map(),lastIndex:-1,lastMystery:""};

function liveInfo(){
 const a=api(),st=a?.state?.(),steps=a?.steps?.()||[];
 if(!st||!steps.length)return null;
 const index=Math.max(0,Math.min(steps.length-1,Math.trunc(Number(st.step)||0)));
 return {state:st,steps,index,step:steps[index]||{},set:String(st.set||"")};
}

function stepKey(step){
 if(!step)return"";
 if(step.kind==="mystery")return"mystery";
 if(step.kind==="conclusion")return"conclusion";
 return String(step.key||"");
}

function stepName(step){
 const key=stepKey(step),names=isFr()?NAMES.fr:NAMES.en;
 if(key==="ave"&&step.bead)return `${names.ave} ${step.bead}`;
 return names[key]||"";
}

/* ---------------------------------------------------------- donor reading */

function cleanText(node){
 // Visible text only: screen-reader labels ("Leader", "Group response") are
 // structure, which this view expresses as ℣./℟. instead.
 const copy=node.cloneNode(true);
 copy.querySelectorAll?.(".aoSrOnly").forEach(n=>n.remove());
 return (copy.textContent||"").replace(/\s+/g," ").trim();
}

function textOfFace(face){
 // Rebuild prose and ℣/℟ lines from the donor's own spans. In group
 // recitation the donor itself marks the leader / response division
 // (.aoCustomarySplit); this view never chooses where a prayer divides.
 const parts=[];
 if(!face)return parts;
 for(const node of face.children){
  if(node.classList.contains("aoCustomarySplit")){
   for(const half of node.children){
    const t=cleanText(half);if(!t)continue;
    parts.push({type:half.classList.contains("aoCustomaryResponse")?"r":"v",text:t});
   }
  }else if(node.classList.contains("aoPrayerDialogueLine")){
   parts.push({type:node.classList.contains("aoResponse")?"r":"v",
    text:cleanText(node.querySelector(".aoPrayerWords")||node)});
  }else{
   const t=cleanText(node);
   if(t)parts.push({type:"p",text:t});
  }
 }
 if(!parts.length){const t=cleanText(face);if(t)parts.push({type:"p",text:t})}
 return parts;
}

function readDonor(shell){
 const sheet=shell.querySelector(".lab-prayer-sheet");
 const contemplation=shell.querySelector(".lab-contemplation");
 const flips=[...(sheet||shell).querySelectorAll(".lab-prayer-flip")];
 const blocks=flips.map(flip=>({
  vernacular:textOfFace(flip.querySelector("[data-pb-vern]")),
  latin:textOfFace(flip.querySelector("[data-pb-latin]"))
 }));
 const cue=sheet?.querySelector(".lab-scripture-cue");
 let cueRef="",cueText="";
 if(cue){
  cueRef=(cue.querySelector("strong")?.textContent||"").trim();
  cueText=[...cue.childNodes].filter(n=>!(n.nodeType===1&&n.tagName==="STRONG"))
   .map(n=>n.textContent).join(" ").replace(/\s+/g," ").trim();
 }
 const principal=contemplation?.querySelector(".principal");
 let principalText="",principalRef="";
 if(principal){
  principalRef=(principal.querySelector("strong")?.textContent||"").trim();
  principalText=[...principal.childNodes].filter(n=>!(n.nodeType===1&&/^(STRONG|BR)$/.test(n.tagName)))
   .map(n=>n.textContent).join(" ").replace(/\s+/g," ").trim();
 }
 const fruitRaw=(contemplation?.querySelector(".fruit")?.textContent||"").trim();
 return {
  heading:(sheet?.querySelector("h2")||contemplation?.querySelector("h2"))?.textContent?.trim()||"",
  rubric:(sheet?.querySelector(".rubric")?.textContent||"").trim(),
  setTitle:(shell.querySelector(".lab-view-head h1")?.textContent||"").trim(),
  kicker:(contemplation?.querySelector(".kicker")?.textContent||"").trim(),
  fruit:fruitRaw.replace(/^[^:]*:\s*/,""),
  principalText,principalRef,
  cueRef,cueText,
  note:(sheet?.querySelector(".lab-practice-note")?.textContent||"").trim(),
  blocks,
  art:shell.querySelector(".aoV401RosaryHero img")?.currentSrc||shell.querySelector(".aoV401RosaryHero img")?.src||"",
  hasContext:!!shell.querySelector("[data-ao-r-context]"),
  nextLabel:(shell.querySelector("[data-lab-rosary-next]")?.textContent||"").replace(/[→←]/g,"").trim()
 };
}

function mysteryTitle(info,shell,mi){
 const key=info.set+":"+mi+":"+(isFr()?"fr":"en");
 if(info.step.kind==="mystery"&&info.step.mi===mi){
  const h=shell.querySelector(".lab-contemplation h2")?.textContent?.trim();
  if(h)session.mysteryTitles.set(key,h);
 }
 if(session.mysteryTitles.has(key))return session.mysteryTitles.get(key);
 // Localised titles from the presentation layer's named chapter timeline.
 const start=info.steps.findIndex(s=>s?.kind==="mystery"&&s.mi===mi);
 const stop=start>=0?document.querySelector(`#aoPrayerBookRoot [data-ao-rosary-chapter="${start}"] .aoDevoStopTitle`):null;
 const t=stop?.textContent?.trim();
 if(t){session.mysteryTitles.set(key,t);return t}
 // The Rosary art manifest carries the same localised titles.
 try{
  const raw=window.AO_ROSARY_ART_V38?.manifest,m=typeof raw==="function"?raw():raw;
  const entry=m?.[info.set]?.find?.(x=>Number(x?.index)===mi+1);
  const title=entry?.[isFr()?"title_fr":"title_en"]||entry?.title_en;
  if(title){session.mysteryTitles.set(key,title);return title}
 }catch{}
 return L(`Mystery ${mi+1}`,`Mystère ${mi+1}`);
}

/* --------------------------------------------------------------- drawing */

function decadeRing(info){
 // 12 positions at 30°: 0 = Pater (bottom), 1–10 = Aves clockwise,
 // 11 = Gloria / Fatima link (bottom right).
 const step=info.step,key=stepKey(step);
 const mi=Number.isInteger(step.mi)?step.mi:null;
 const cx=140,cy=136,R=104;
 const pos=i=>{const a=(90+i*30)*Math.PI/180;return [cx+R*Math.cos(a),cy+R*Math.sin(a)]};
 const at=key==="mystery"?-1:key==="pater"?0:key==="ave"?Number(step.bead||0):(key==="gloria"||key==="fatima")?11:-1;
 const jump=bead=>{
  const i=info.steps.findIndex(s=>s?.mi===mi&&s.key==="ave"&&s.bead===bead);
  return i;
 };
 let beads="";
 // chain
 beads+=`<circle cx="${cx}" cy="${cy}" r="${R}" class="rbvChain"/>`;
 for(let i=0;i<12;i++){
  const [x,y]=pos(i);
  const state=at<0?"future":i<at?"past":i===at?"current":"future";
  if(i===0){
   beads+=`<circle cx="${x}" cy="${y}" r="15" class="rbvBead rbvPater is-${state}"/>`;
  }else if(i===11){
   beads+=`<g class="rbvLink is-${state}" transform="translate(${x} ${y}) rotate(45)"><rect x="-6" y="-6" width="12" height="12" rx="2"/></g>`;
  }else{
   const target=jump(i);
   beads+=`<circle cx="${x}" cy="${y}" r="11" class="rbvBead rbvAve is-${state}"${target>=0?` data-rbv-jump="${target}" role="button" tabindex="-1" aria-label="${esc(L(`Hail Mary ${i}`,`Ave ${i}`))}"`:""}/>`;
   if(state==="current")beads+=`<circle cx="${x}" cy="${y}" r="19" class="rbvHalo"/>`;
  }
 }
 if(at===0)beads+=`<circle cx="${pos(0)[0]}" cy="${pos(0)[1]}" r="23" class="rbvHalo"/>`;
 if(at===11)beads+=`<circle cx="${pos(11)[0]}" cy="${pos(11)[1]}" r="16" class="rbvHalo"/>`;
 // centre
 let big="",small="";
 if(key==="ave"){big=String(step.bead||"");small=L("of 10","sur 10")}
 else if(key==="mystery"){big=ROMAN[mi]||String((mi??0)+1);small=L("Mystery","Mystère")}
 else if(key==="pater"){big="✠";small=""}
 else if(key==="gloria"||key==="fatima"){big="✓";small=L("Decade","Dizaine")}
 const centre=`<text x="${cx}" y="${cy+8}" class="rbvBig">${esc(big)}</text>${small?`<text x="${cx}" y="${cy+36}" class="rbvSmall">${esc(small)}</text>`:""}`;
 return `<svg class="rbvRing" viewBox="0 0 280 272" role="img" aria-label="${esc(stepName(step)||"")}">${beads}${centre}</svg>`;
}

function openingChain(info){
 // Crucifix → Pater bead → three Aves → Gloria link, drawn bottom to top.
 const step=info.step,key=stepKey(step),order={sign:0,credo:0,pater:1,ave:2,gloria:5};
 let at=order[key]??0;if(key==="ave")at=2+Math.max(0,(step.openingAve||1)-1);
 const x=140,ys=[226,176,138,108,78,46];
 const s=i=>i<at?"past":i===at?"current":"future";
 let g=`<line x1="${x}" y1="${ys[0]-20}" x2="${x}" y2="18" class="rbvChainLine"/>`;
 g+=`<g class="rbvCross is-${s(0)}" transform="translate(${x} ${ys[0]})"><rect x="-4" y="-26" width="8" height="52" rx="2"/><rect x="-17" y="-14" width="34" height="8" rx="2"/></g>`;
 g+=`<circle cx="${x}" cy="${ys[1]}" r="15" class="rbvBead rbvPater is-${s(1)}"/>`;
 for(let i=0;i<3;i++)g+=`<circle cx="${x}" cy="${ys[2+i]}" r="10" class="rbvBead rbvAve is-${s(2+i)}"/>`;
 g+=`<g class="rbvLink is-${s(5)}" transform="translate(${x} ${ys[5]}) rotate(45)"><rect x="-6" y="-6" width="12" height="12" rx="2"/></g>`;
 const cur=at===0?[x,ys[0]]:[x,ys[Math.min(at,5)]];
 g+=`<circle cx="${cur[0]}" cy="${cur[1]}" r="${at===0?34:at===1?23:18}" class="rbvHalo"/>`;
 return `<svg class="rbvChainSvg" viewBox="0 0 280 260" role="img" aria-label="${esc(stepName(step)||"")}">${g}</svg>`;
}

function medal(){
 return `<svg class="rbvChainSvg" viewBox="0 0 280 200" role="img" aria-hidden="true"><circle cx="140" cy="100" r="54" class="rbvMedal"/><text x="140" y="118" class="rbvMedalM">M</text></svg>`;
}

function decadeBar(info){
 const mi=Number.isInteger(info.step.mi)?info.step.mi:null;
 const phase=info.step.phase||info.step.kind;
 const total=Math.max(5,...info.steps.map(s=>Number.isInteger(s?.mi)?s.mi+1:0));
 let html=`<span class="rbvSeg rbvSegDot ${phase==="opening"?"is-current":"is-past"}" aria-hidden="true"></span>`;
 for(let i=0;i<total;i++){
  const state=mi===null?(phase==="conclusion"?"past":"future"):i<mi?"past":i===mi?"current":"future";
  html+=`<span class="rbvSeg is-${state}">${ROMAN[i]||i+1}</span>`;
 }
 html+=`<span class="rbvSeg rbvSegDot ${phase==="conclusion"?"is-current":"is-future"}" aria-hidden="true"></span>`;
 return `<div class="rbvDecades" aria-hidden="true">${html}</div>`;
}

function prayerText(blocks,face){
 const pick=b=>(face==="latin"&&b.latin.length?b.latin:b.vernacular.length?b.vernacular:b.latin);
 return blocks.map(b=>`<div class="rbvPrayerBlock">${pick(b).map(p=>p.type==="p"
   ?`<p>${esc(p.text)}</p>`
   :`<p class="rbvDialogue is-${p.type}"><span class="rbvRole">${p.type==="v"?"℣.":"℟."}</span> ${esc(p.text)}</p>`
  ).join("")}</div>`).join("");
}

function firstLine(blocks,face){
 const b=blocks[0];if(!b)return"";
 const parts=(face==="latin"&&b.latin.length?b.latin:b.vernacular.length?b.vernacular:b.latin);
 const t=parts.map(p=>p.text).join(" ");
 const m=t.match(/^(.{20,64}?[,;:.])\s/);
 return (m?m[1]:t.slice(0,60)).replace(/[,;:.]$/,"")+"…";
}

function nextLabel(info,donor){
 const next=info.steps[info.index+1];
 if(!next)return donor.nextLabel||L("Finish","Terminer");
 if(next.kind==="mystery"){
  return `${L("Mystery","Mystère")} ${ROMAN[next.mi]||next.mi+1}`;
 }
 return stepName(next)||donor.nextLabel||L("Next","Suivant");
}

/* --------------------------------------------------------------- render */

let view=null,observer=null,pending=false,lastSignature="";

function ensureStyles(){
 if(document.getElementById(STYLE_ID))return;
 const style=document.createElement("style");style.id=STYLE_ID;style.textContent=CSS;
 document.head.appendChild(style);
}

function ensureToggle(shell){
 const head=shell.querySelector(".lab-view-head");
 if(!head||head.querySelector("[data-rbv-open]"))return;
 const b=document.createElement("button");
 b.type="button";b.className="rbvOpen";b.dataset.rbvOpen="1";
 b.setAttribute("aria-label",L("Switch to bead view","Passer à la vue chapelet"));
 b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2.2 2.4"/><circle cx="12" cy="17" r="2" fill="currentColor"/><path d="M12 19v3M10.5 20.5h3" stroke="currentColor" stroke-width="1.4"/></svg><span>${esc(L("Beads","Chapelet"))}</span>`;
 b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();setRosaryLayout("beads")});
 const home=head.querySelector(".aoModuleHome");
 if(home)head.insertBefore(b,home);else head.appendChild(b);
}

function unmount(){
 if(view){view.remove();view=null}
 lastSignature="";
 document.documentElement.classList.remove("rbvActive");
}

function render(){
 pending=false;
 const root=donorRoot(),shell=playerShell(root);
 if(!root||!shell){unmount();return}
 ensureStyles();
 ensureToggle(shell);
 if(rosaryLayout()!=="beads"){unmount();return}
 const info=liveInfo();if(!info){unmount();return}
 const donor=readDonor(shell);
 const face=read(FACE_KEY,"vernacular")==="latin"?"latin":"vernacular";
 const group=read(RECITATION_KEY,"individual")==="group";
 const key=stepKey(info.step);
 const signature=[info.set,info.index,face,group,key,isFr(),donor.heading,donor.cueRef,donor.art,donor.blocks.length,[...session.expanded].join(",")].join("|");
 if(view&&view.isConnected&&signature===lastSignature)return;
 lastSignature=signature;

 const mi=Number.isInteger(info.step.mi)?info.step.mi:null;
 const mTitle=mi!==null?mysteryTitle(info,shell,mi):"";
 if(key==="mystery"&&donor.fruit)session.fruits.set(info.set+":"+mi,donor.fruit);
 const fruit=mi!==null?session.fruits.get(info.set+":"+mi)||"":"";
 let art="";
 if(mi!==null){
  art=donor.art;
  if(!art){try{art=window.AO_ROSARY_V401?.preview?.(info.set,mi)||window.AO_ROSARY_V41?.preview?.(info.set,mi)||""}catch{art=""}}
 }

 // The set name ("Joyful Mysteries") is the rubric on every decade prayer;
 // remember it so the announcement step, whose heading is the mystery, keeps it.
 const setKey=info.set+":"+(isFr()?"fr":"en");
 if(info.step.phase==="decade"&&key!=="mystery"&&donor.rubric)session.setTitles.set(setKey,donor.rubric);
 if(!session.setTitles.has(setKey)&&donor.setTitle&&key!=="mystery"&&info.step.phase!=="decade")session.setTitles.set(setKey,donor.setTitle);
 const setTitle=session.setTitles.get(setKey)||"";
 const eyebrow=mi!==null?`${setTitle||L("Holy Rosary","Saint Rosaire")} · ${ROMAN[mi]||mi+1}`:(donor.rubric||L("Holy Rosary","Saint Rosaire"));
 const title=mi!==null?mTitle:(donor.heading||stepName(info.step));

 const diagram=info.step.phase==="opening"?openingChain(info):key==="conclusion"?medal():decadeRing(info);
 const name=key==="mystery"?"":(key==="conclusion"?donor.heading:(stepName(info.step)||donor.heading));

 const collapsible=COLLAPSED_BY_DEFAULT.has(key)&&donor.blocks.length===1;
 const open=!collapsible||session.expanded.has(key);
 let meditation="";
 if(key==="mystery"){
  meditation=`<section class="rbvMystery">
   <h2>${esc(mTitle)}</h2>
   ${fruit?`<p class="rbvFruit"><span>${esc(L("Fruit","Fruit"))}</span>${esc(fruit)}</p>`:""}
   ${donor.principalText?`<p class="rbvPrincipal">${esc(donor.principalText)}${donor.principalRef?` <cite>${esc(donor.principalRef)}</cite>`:""}</p>`:""}
   ${donor.hasContext?`<button type="button" class="rbvLink" data-rbv-passage>${esc(L("Read the passage","Lire le passage"))}</button>`:""}
  </section>`;
 }else if(donor.cueText){
  meditation=`<blockquote class="rbvCue"><p>${esc(donor.cueText)}</p>${donor.cueRef?`<cite>${esc(donor.cueRef)}</cite>`:""}</blockquote>`;
 }
 const text=donor.blocks.length?(open
   ?`<div class="rbvPrayer" data-rbv-prayer="open">${prayerText(donor.blocks,face)}${collapsible?`<button type="button" class="rbvFold" data-rbv-collapse="${esc(key)}">${esc(L("Show first line only","Première ligne seulement"))}</button>`:""}</div>`
   :`<button type="button" class="rbvPrayer is-collapsed" data-rbv-expand="${esc(key)}" aria-expanded="false"><span>${esc(firstLine(donor.blocks,face))}</span><small>${esc(L("Show full prayer","Afficher la prière"))}</small></button>`)
  :"";
 const note=donor.note?`<p class="rbvNote">${esc(donor.note)}</p>`:"";

 const html=`
  <div class="rbvBackdrop"${art?` style="--rbv-art:url(&quot;${esc(art)}&quot;)"`:""}></div>
  <header class="rbvHead">
   <button type="button" class="rbvIcon" data-rbv-exit aria-label="${esc(L("Leave the Rosary","Quitter le Rosaire"))}">←</button>
   <div class="rbvTitles"><p>${esc(eyebrow)}</p><h1>${esc(title)}</h1></div>
   <button type="button" class="rbvPill" data-rbv-face aria-pressed="${face==="latin"}" aria-label="${esc(face==="latin"?L("Show vernacular","Afficher la langue vernaculaire"):L("Show Latin","Afficher le latin"))}">${face==="latin"?"LA":(isFr()?"FR":"EN")}</button>
   <button type="button" class="rbvPill" data-rbv-classic aria-label="${esc(L("Switch to classic view","Revenir à la vue classique"))}">${esc(L("Classic","Classique"))}</button>
  </header>
  ${decadeBar(info)}
  <div class="rbvScroll">
   <div class="rbvStage">${diagram}${name?`<p class="rbvName">${esc(name)}</p>`:""}</div>
   ${meditation}
   ${text}
   ${note}
  </div>
  <footer class="rbvFoot">
   <button type="button" class="rbvBack" data-rbv-prev aria-label="${esc(L("Previous","Précédent"))}"${info.index===0?" disabled":""}>‹</button>
   <button type="button" class="rbvAdvance" data-rbv-next>
    <span class="rbvAdvanceHint">${esc(L("Tap to continue","Touchez pour continuer"))}</span>
    <span class="rbvAdvanceNext">${info.steps[info.index+1]?`<span class="rbvAdvanceLead">${esc(L("Next","Ensuite"))}</span> `:""}${esc(nextLabel(info,donor))}</span>
   </button>
  </footer>`;

 if(!view||!view.isConnected){
  view=document.createElement("section");
  view.id=VIEW_ID;view.dataset.aoRosaryBeadView=VERSION;
  view.setAttribute("role","dialog");view.setAttribute("aria-modal","true");
  view.setAttribute("aria-label",L("Holy Rosary — bead view","Saint Rosaire — vue chapelet"));
  bind(view);
  root.appendChild(view);
 }
 const scroller=view.querySelector(".rbvScroll"),keepScroll=info.index===session.lastIndex?scroller?.scrollTop||0:0;
 view.innerHTML=html;
 view.dataset.step=String(info.index);view.dataset.kind=key;view.dataset.phase=String(info.step.phase||"");
 if(keepScroll)view.querySelector(".rbvScroll").scrollTop=keepScroll;
 document.documentElement.classList.add("rbvActive");

 // Haptic cues: a light tick per bead, a fuller pulse when a decade ends.
 if(session.lastIndex>=0&&info.index!==session.lastIndex){
  const prev=info.steps[session.lastIndex];
  const decadeDone=info.index>session.lastIndex&&info.step.kind==="mystery"&&prev?.phase==="decade";
  try{navigator.vibrate?.(decadeDone?[18,70,18]:8)}catch{}
 }
 session.lastIndex=info.index;
}

function press(selector){
 const shell=playerShell(donorRoot());
 const button=shell?.querySelector(selector);
 if(!button||button.disabled)return false;
 button.click();
 schedule();
 return true;
}

function bind(node){
 node.addEventListener("click",e=>{
  const t=e.target.closest("[data-rbv-next],[data-rbv-prev],[data-rbv-jump],[data-rbv-face],[data-rbv-classic],[data-rbv-exit],[data-rbv-expand],[data-rbv-collapse],[data-rbv-passage]");
  if(!t)return;
  e.preventDefault();e.stopPropagation();
  if(t.matches("[data-rbv-next]"))press("[data-lab-rosary-next]");
  else if(t.matches("[data-rbv-prev]"))press("[data-lab-rosary-prev]");
  else if(t.matches("[data-rbv-jump]")){
   const n=Number(t.dataset.rbvJump);
   if(!press(`[data-v401-rosary-jump="${n}"]`)&&api()?.setStep?.(n)!==false)schedule();
  }
  else if(t.matches("[data-rbv-face]")){write(FACE_KEY,read(FACE_KEY,"vernacular")==="latin"?"vernacular":"latin");schedule()}
  else if(t.matches("[data-rbv-classic]"))setRosaryLayout("classic");
  else if(t.matches("[data-rbv-exit]"))press(".lab-view-head .lab-back");
  else if(t.matches("[data-rbv-expand]")){session.expanded.add(t.dataset.rbvExpand);schedule()}
  else if(t.matches("[data-rbv-collapse]")){session.expanded.delete(t.dataset.rbvCollapse);schedule()}
  else if(t.matches("[data-rbv-passage]"))press("[data-ao-r-context]");
 });
 // Horizontal swipe: left = next, right = previous. Vertical scroll is untouched.
 let sx=0,sy=0,st=0;
 node.addEventListener("touchstart",e=>{const p=e.touches[0];sx=p.clientX;sy=p.clientY;st=Date.now()},{passive:true});
 // Claim clearly horizontal moves so the browser never turns a "previous
 // bead" swipe into history-back (which the app treats as leaving the Rosary).
 node.addEventListener("touchmove",e=>{
  const p=e.touches[0];if(!p||e.touches.length>1)return;
  const dx=p.clientX-sx,dy=p.clientY-sy;
  if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)&&e.cancelable)e.preventDefault();
 },{passive:false});
 node.addEventListener("touchend",e=>{
  const p=e.changedTouches[0],dx=p.clientX-sx,dy=p.clientY-sy;
  if(Date.now()-st<600&&Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6){
   press(dx<0?"[data-lab-rosary-next]":"[data-lab-rosary-prev]");
  }
 },{passive:true});
}

function onKey(e){
 if(!view?.isConnected||e.defaultPrevented||e.metaKey||e.ctrlKey||e.altKey)return;
 if(e.target?.closest?.("input,textarea,select,[contenteditable]"))return;
 if(e.key==="ArrowRight"||(e.key===" "&&!e.target?.closest?.("button"))){e.preventDefault();press("[data-lab-rosary-next]")}
 else if(e.key==="ArrowLeft"){e.preventDefault();press("[data-lab-rosary-prev]")}
}

function schedule(){
 if(pending)return;pending=true;
 (window.requestAnimationFrame||setTimeout)(()=>render());
}

export function installRosaryBeadView(){
 if(typeof window==="undefined"||typeof document==="undefined")return null;
 if(window.AO_ROSARY_BEAD_VIEW_V1)return window.AO_ROSARY_BEAD_VIEW_V1;
 // Cheap at startup: watch only <body>'s direct children until the Rosary
 // container exists, then only that container's subtree.
 let watched=null;
 const contentObserver=new MutationObserver(records=>{
  for(const r of records){
   if(view&&(r.target===view||view.contains(r.target)))continue;
   schedule();return;
  }
 });
 const attach=()=>{
  const root=document.getElementById("aoPrayerBookRoot");
  if(!root||root===watched)return;
  contentObserver.disconnect();watched=root;
  contentObserver.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:["class","hidden","data-face"]});
  schedule();
 };
 observer=new MutationObserver(attach);
 const start=()=>{observer.observe(document.body,{childList:true});attach()};
 if(document.body)start();else document.addEventListener("DOMContentLoaded",start,{once:true});
 window.addEventListener("keydown",onKey,true);
 const publicApi=Object.freeze({version:VERSION,layout:rosaryLayout,setLayout:setRosaryLayout,refresh:schedule});
 window.AO_ROSARY_BEAD_VIEW_V1=publicApi;
 return publicApi;
}

const CSS=`
#aoPrayerBookRoot .rbvOpen{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 12px;border-radius:999px;border:1px solid var(--line,rgba(231,235,240,.12));background:transparent;color:var(--text,#eef0ef);font:500 13px/1 var(--ao-font-ui,Georgia,serif);letter-spacing:.04em;cursor:pointer;margin-left:auto}
#aoPrayerBookRoot .rbvOpen svg{width:18px;height:18px}
#${VIEW_ID}{--rbv-bg:var(--ao-bg-canvas,#080c12);--rbv-ink:var(--ao-text-primary,#eef0ef);--rbv-muted:var(--ao-text-muted,#a1acb9);--rbv-line:var(--line,rgba(231,235,240,.12));--rbv-accent:#6cc08a;--rbv-ivory:#e9dfc8;--rbv-surface:var(--ao-surface-1,#181e27);
 position:fixed;inset:0;z-index:2147480000;display:flex;flex-direction:column;background:var(--rbv-bg);color:var(--rbv-ink);font-family:var(--ao-font-body,'EB Garamond',Georgia,serif);overscroll-behavior:contain;-webkit-tap-highlight-color:transparent;touch-action:pan-y}
/* Horizontal swipes here move between beads. They must never reach the
   browser as an overscroll "history back", which would close the Rosary. */
html.rbvActive,html.rbvActive body{overscroll-behavior-x:none}
#${VIEW_ID} .rbvBackdrop{position:absolute;inset:0 0 auto 0;height:62%;background-image:var(--rbv-art,none);background-size:cover;background-position:center 30%;opacity:.12;filter:saturate(.7) blur(1px);mask-image:linear-gradient(#000 0%,transparent 100%);-webkit-mask-image:linear-gradient(#000 0%,transparent 100%);pointer-events:none}
#${VIEW_ID} .rbvHead{position:relative;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 6px}
#${VIEW_ID} .rbvTitles{flex:1;min-width:0}
#${VIEW_ID} .rbvTitles p{margin:0;font:600 10px/1.3 var(--ao-font-brand,Cinzel,serif);letter-spacing:.16em;text-transform:uppercase;color:var(--rbv-accent);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#${VIEW_ID} .rbvTitles h1{margin:2px 0 0;font:500 21px/1.15 var(--ao-font-display,'EB Garamond',serif);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#${VIEW_ID} .rbvIcon{width:44px;height:44px;flex:none;border-radius:50%;border:1px solid var(--rbv-line);background:transparent;color:inherit;font-size:20px;cursor:pointer}
#${VIEW_ID} .rbvPill{min-height:44px;min-width:44px;padding:0 10px;border-radius:999px;border:1px solid var(--rbv-line);background:rgba(255,255,255,.03);color:var(--rbv-muted);font:600 12px/1 var(--ao-font-ui,Georgia,serif);letter-spacing:.06em;cursor:pointer}
#${VIEW_ID} .rbvPill[aria-pressed="true"]{color:var(--rbv-ink);border-color:var(--rbv-accent)}
#${VIEW_ID} .rbvDecades{position:relative;display:flex;align-items:center;justify-content:center;gap:6px;padding:4px 16px 0}
#${VIEW_ID} .rbvSeg{flex:0 1 52px;height:22px;display:grid;place-items:center;border-radius:999px;font:600 10px/1 var(--ao-font-brand,Cinzel,serif);letter-spacing:.08em;color:var(--rbv-muted);border:1px solid var(--rbv-line)}
#${VIEW_ID} .rbvSeg.is-past{background:rgba(233,223,200,.12);color:var(--rbv-ivory);border-color:transparent}
#${VIEW_ID} .rbvSeg.is-current{background:var(--rbv-accent);color:#08130c;border-color:transparent}
#${VIEW_ID} .rbvSegDot{flex:0 0 8px;width:8px;height:8px;padding:0}
#${VIEW_ID} .rbvScroll{position:relative;flex:1;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:0 20px 24px}
#${VIEW_ID} .rbvStage{display:flex;flex-direction:column;align-items:center;padding-top:4px}
#${VIEW_ID} .rbvRing{width:min(72vw,280px);height:auto;display:block}
#${VIEW_ID} .rbvChainSvg{width:min(62vw,240px);height:auto;display:block;max-height:30vh}
#${VIEW_ID} .rbvChain{fill:none;stroke:rgba(233,223,200,.22);stroke-width:1.2}
#${VIEW_ID} .rbvChainLine{stroke:rgba(233,223,200,.22);stroke-width:1.2}
#${VIEW_ID} .rbvBead{fill:var(--rbv-bg);stroke:rgba(233,223,200,.42);stroke-width:1.5;transition:fill .25s,stroke .25s}
#${VIEW_ID} .rbvBead.is-past{fill:var(--rbv-ivory);stroke:var(--rbv-ivory)}
#${VIEW_ID} .rbvBead.is-current{fill:var(--rbv-accent);stroke:var(--rbv-accent)}
#${VIEW_ID} .rbvAve[data-rbv-jump]{cursor:pointer}
#${VIEW_ID} .rbvHalo{fill:none;stroke:var(--rbv-accent);stroke-width:1.2;opacity:.55}
#${VIEW_ID} .rbvLink rect,#${VIEW_ID} .rbvCross rect{fill:var(--rbv-bg);stroke:rgba(233,223,200,.42);stroke-width:1.4}
#${VIEW_ID} .rbvLink.is-past rect,#${VIEW_ID} .rbvCross.is-past rect{fill:var(--rbv-ivory);stroke:var(--rbv-ivory)}
#${VIEW_ID} .rbvLink.is-current rect,#${VIEW_ID} .rbvCross.is-current rect{fill:var(--rbv-accent);stroke:var(--rbv-accent)}
#${VIEW_ID} .rbvMedal{fill:none;stroke:var(--rbv-accent);stroke-width:2}
#${VIEW_ID} .rbvMedalM{fill:var(--rbv-ivory);font:500 52px/1 var(--ao-font-brand,Cinzel,serif);text-anchor:middle}
#${VIEW_ID} .rbvBig{fill:var(--rbv-ink);font:500 58px/1 var(--ao-font-brand,Cinzel,serif);text-anchor:middle}
#${VIEW_ID} .rbvSmall{fill:var(--rbv-muted);font:600 12px/1 var(--ao-font-brand,Cinzel,serif);letter-spacing:.14em;text-anchor:middle;text-transform:uppercase}
#${VIEW_ID} .rbvName{margin:2px 0 0;font:500 15px/1.2 var(--ao-font-brand,Cinzel,serif);letter-spacing:.12em;text-transform:uppercase;color:var(--rbv-accent);text-align:center}
#${VIEW_ID} .rbvMystery{margin:14px auto 0;max-width:34rem;text-align:center}
#${VIEW_ID} .rbvKicker{margin:0;font:600 10px/1.2 var(--ao-font-brand,Cinzel,serif);letter-spacing:.16em;text-transform:uppercase;color:var(--rbv-muted)}
#${VIEW_ID} .rbvMystery h2{margin:6px 0 10px;font:500 28px/1.15 var(--ao-font-display,'EB Garamond',serif)}
#${VIEW_ID} .rbvFruit{display:inline-flex;gap:8px;align-items:baseline;margin:0 0 14px;padding:6px 14px;border-radius:999px;background:rgba(108,192,138,.12);color:var(--rbv-ink);font-size:17px}
#${VIEW_ID} .rbvFruit span{font:600 10px/1 var(--ao-font-brand,Cinzel,serif);letter-spacing:.14em;text-transform:uppercase;color:var(--rbv-accent)}
#${VIEW_ID} .rbvPrincipal{margin:0;font-size:18px;line-height:1.5;color:var(--rbv-ink)}
#${VIEW_ID} .rbvPrincipal cite{display:block;margin-top:6px;font:600 11px/1 var(--ao-font-brand,Cinzel,serif);letter-spacing:.1em;color:var(--rbv-muted);font-style:normal}
#${VIEW_ID} .rbvLink{margin-top:12px;min-height:44px;padding:0 16px;border-radius:999px;border:1px solid var(--rbv-line);background:transparent;color:var(--rbv-accent);font:inherit;font-size:16px;cursor:pointer}
#${VIEW_ID} .rbvCue{margin:14px auto 0;max-width:34rem;padding:0;text-align:center}
#${VIEW_ID} .rbvCue p{margin:0;font-size:21px;line-height:1.45;font-style:italic;color:var(--rbv-ink)}
#${VIEW_ID} .rbvCue cite{display:block;margin-top:8px;font:600 11px/1 var(--ao-font-brand,Cinzel,serif);letter-spacing:.12em;text-transform:uppercase;color:var(--rbv-muted);font-style:normal}
#${VIEW_ID} .rbvPrayer{display:block;width:100%;max-width:34rem;margin:18px auto 0;text-align:left;font-size:19px;line-height:1.55;color:var(--rbv-ink)}
#${VIEW_ID} .rbvPrayer p{margin:0 0 .55em}
#${VIEW_ID} .rbvPrayerBlock+.rbvPrayerBlock{margin-top:1.1em;padding-top:1.1em;border-top:1px solid var(--rbv-line)}
#${VIEW_ID} .rbvPrayer.is-collapsed{border:1px solid var(--rbv-line);border-radius:14px;background:rgba(255,255,255,.025);padding:12px 16px;font:inherit;color:var(--rbv-muted);cursor:pointer;text-align:center;font-size:18px}
#${VIEW_ID} .rbvPrayer.is-collapsed span{display:block;color:var(--rbv-ink)}
#${VIEW_ID} .rbvPrayer.is-collapsed small{display:block;margin-top:4px;font:600 10px/1.2 var(--ao-font-brand,Cinzel,serif);letter-spacing:.14em;text-transform:uppercase;color:var(--rbv-accent)}
#${VIEW_ID} .rbvDialogue .rbvRole{color:var(--rbv-accent);font-weight:600}
#${VIEW_ID} .rbvDialogue.is-r{font-weight:600}
#${VIEW_ID} .rbvFold{display:block;margin:6px auto 0;min-height:44px;min-width:44px;background:none;border:0;color:var(--rbv-muted);font:600 10px/1 var(--ao-font-brand,Cinzel,serif);letter-spacing:.14em;text-transform:uppercase;cursor:pointer}
#${VIEW_ID} .rbvNote{max-width:34rem;margin:14px auto 0;color:var(--rbv-muted);font-size:16px;font-style:italic;text-align:center}
#${VIEW_ID} .rbvFoot{position:relative;display:flex;gap:10px;align-items:stretch;padding:10px 12px calc(env(safe-area-inset-bottom,0px) + 12px);background:linear-gradient(transparent,var(--rbv-bg) 30%)}
#${VIEW_ID} .rbvBack{flex:0 0 56px;border-radius:18px;border:1px solid var(--rbv-line);background:transparent;color:var(--rbv-muted);font-size:28px;cursor:pointer}
#${VIEW_ID} .rbvBack:disabled{opacity:.3}
#${VIEW_ID} .rbvAdvance{flex:1;min-height:104px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;border-radius:22px;border:1px solid rgba(108,192,138,.45);background:rgba(108,192,138,.10);color:var(--rbv-ink);cursor:pointer;touch-action:manipulation;transition:background .15s,transform .1s}
#${VIEW_ID} .rbvAdvance:active{background:rgba(108,192,138,.22);transform:scale(.985)}
#${VIEW_ID} .rbvAdvanceHint{font:600 11px/1 var(--ao-font-brand,Cinzel,serif);letter-spacing:.18em;text-transform:uppercase;color:var(--rbv-accent)}
#${VIEW_ID} .rbvAdvanceNext{font-size:19px;color:var(--rbv-ink)}
#${VIEW_ID} .rbvAdvanceLead{color:var(--rbv-muted)}
#${VIEW_ID} .rbvAdvanceLead::after{content:":"}
#${VIEW_ID} button:focus-visible{outline:2px solid var(--rbv-accent);outline-offset:2px}
@media (min-height:760px){#${VIEW_ID} .rbvAdvance{min-height:128px}}
@media (prefers-reduced-motion:reduce){#${VIEW_ID} *{transition:none!important}}
`;

if(typeof window!=="undefined"&&typeof document!=="undefined")installRosaryBeadView();
