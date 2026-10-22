// Litany call-and-response layout — presentation only.
//
// A litany is a long run of invocations that share one repeated response
// ("have mercy on us", "deliver us, O Jesus"). Printing that response on every
// line hides the structure people actually pray: one voice calls, all answer.
// This layout prints each invocation once and the shared response once per run,
// pinned to the bottom of the screen while that run is in view.
//
// Fidelity rules:
//   • The source text is never edited. Each line is split at a character
//     index only; call + response === the original line, byte for byte.
//   • Responses are inferred from the litany's own text: a trailing clause
//     (after a comma) that ends at least MIN_REPEAT lines. Where one candidate
//     is the tail of another, the one ending more lines wins ("deliver us,
//     O Jesus." over "O Jesus."; "ayez pitié de nous." over "qui êtes Dieu,
//     ayez pitié de nous.").
//   • Lines whose invocation would be a single word (Kyrie, Christe) are left
//     whole: their alternation is not a call/response of this kind.
//   • Lines that do not fit stay whole and are shown exactly as written.
//   • Screen readers receive every complete line.

const MIN_REPEAT=3;
const VOICE_KEY="ao-litany-voice";
const FACE_KEY="ao-litany-face";
const STYLE_ID="aoLitanyResponsiveStyles";
export const LITANY_LAYOUT_KEY="ao-litany-layout";

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function read(key,fallback){try{return localStorage.getItem(key)??fallback}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,value)}catch{}}

export function litanyLayoutPreference(){return read(LITANY_LAYOUT_KEY,"text")==="responsive"?"responsive":"text"}
export function setLitanyLayoutPreference(value){write(LITANY_LAYOUT_KEY,value==="responsive"?"responsive":"text")}

// Every split point in a line: indices just after ", " where a trailing
// clause could begin. Returns [{index, tail}] from longest tail to shortest.
function tails(line){
 const out=[];
 const re=/,\s+/g;let m;
 while((m=re.exec(line)))out.push({index:m.index+m[0].length,tail:line.slice(m.index+m[0].length)});
 return out;
}
const words=s=>String(s).replace(/[,.;:!?]/g," ").trim().split(/\s+/).filter(Boolean).length;

/**
 * Parse a litany into sections (blank-line separated) of runs.
 * @returns {{sections:Array<{lines:Array<{text:string,call:string|null,response:string|null}>}>,responses:string[]}}
 */
export function parseLitany(text){
 const blocks=String(text||"").replace(/\r/g,"").trim().split(/\n\s*\n/).map(b=>b.split("\n").map(l=>l.trim()).filter(Boolean)).filter(b=>b.length);
 const all=blocks.flat();
 // 1. Longest trailing clause of each line that recurs at least MIN_REPEAT times.
 const freq=new Map();
 for(const line of all)for(const {tail} of tails(line))freq.set(tail,(freq.get(tail)||0)+1);
 const frequent=t=>(freq.get(t)||0)>=MIN_REPEAT;
 const maximal=new Map();
 for(const line of all){
  const t=tails(line).find(x=>frequent(x.tail));
  if(t)maximal.set(t.tail,(maximal.get(t.tail)||0)+1);
 }
 let accepted=new Set([...maximal].filter(([,n])=>n>=MIN_REPEAT).map(([t])=>t));
 // 2. When one candidate is the tail of another ("O Jesus." / "deliver us,
 //    O Jesus."; "ayez pitié de nous." / "qui êtes Dieu, ayez pitié de nous."),
 //    keep the one that ends more lines: it is the response the people repeat;
 //    the other is part of a few invocations. Repeat until stable.
 const isTailOf=(short,long)=>long.length>short.length&&long.endsWith(short)&&/,\s+$/.test(long.slice(0,long.length-short.length));
 const assigned=()=>{const n=new Map();for(const line of all){const t=tails(line).find(x=>accepted.has(x.tail));if(t)n.set(t.tail,(n.get(t.tail)||0)+1)}return n};
 for(let changed=true;changed;){
  changed=false;const n=assigned();
  outer:for(const a of accepted)for(const b of accepted){
   if(!isTailOf(a,b))continue;
   accepted.delete((n.get(a)||0)>=(n.get(b)||0)?b:a);changed=true;break outer;
  }
 }
 for(const [t,count] of assigned())if(count<MIN_REPEAT)accepted.delete(t);
 const responses=accepted;
 // 3. Split each line at its longest accepted response.
 const sections=blocks.map(block=>({lines:block.map(line=>{
  const hit=tails(line).find(x=>responses.has(x.tail));
  if(!hit)return {text:line,call:null,response:null};
  const call=line.slice(0,hit.index),response=line.slice(hit.index);
  if(words(call)<2)return {text:line,call:null,response:null};
  return {text:line,call,response};
 })}));
 return {sections,responses:[...responses]};
}

function runsOf(lines){
 const runs=[];
 for(const line of lines){
  const last=runs[runs.length-1];
  if(line.response&&last&&last.response===line.response)last.lines.push(line);
  else runs.push({response:line.response||null,lines:[line]});
 }
 return runs;
}

const ROLE=/^(℣\.?|℟\.?|V\.|R\.)\s*/;
function plainLine(text){
 const m=text.match(ROLE);
 if(m){
  const role=/^(℟|R)/.test(m[1])?"r":"v";
  return `<p class="aoLitCRPlain aoLitCRDialogue is-${role}"><span class="aoLitCRRole">${esc(m[1])}</span> ${esc(text.slice(m[0].length))}</p>`;
 }
 return `<p class="aoLitCRPlain">${esc(text)}</p>`;
}

function faceMarkup(text,{labels=[],face,hidden}){
 const {sections}=parseLitany(text);
 const useLabels=labels.length===sections.length;
 return `<div class="aoLitCRFace" data-ao-litany-face-body="${face}"${hidden?" hidden":""}>${sections.map((section,i)=>{
  const head=useLabels&&labels[i]?`<h4 class="aoLitCRHead">${esc(labels[i])}</h4>`:"";
  const body=runsOf(section.lines).map(run=>{
   // A single line is not a call-and-response run (e.g. the third Agnus Dei):
   // keep it whole so it reads like its neighbours.
   if(!run.response||run.lines.length<2)return run.lines.map(l=>plainLine(l.text)).join("");
   const resp=run.response;
   return `<div class="aoLitCRRun" data-ao-litany-response="${esc(resp)}">
    <ol class="aoLitCRCalls">${run.lines.map(l=>`<li class="aoLitCRCall" data-ao-litany-line="${esc(l.text)}"><span class="aoLitCRCallText">${esc(l.call.replace(/,\s+$/,""))}</span><span class="aoSrOnly">, ${esc(l.response)}</span><span class="aoLitCRCue" aria-hidden="true">℟</span></li>`).join("")}</ol>
    <p class="aoLitCRResponse" aria-hidden="true"><span class="aoLitCRRole">℟.</span> <span class="aoLitCRResponseText">${esc(resp)}</span><small class="aoLitCRCount">× ${run.lines.length}</small></p>
   </div>`;
  }).join("");
  return `<section class="aoLitCRSection">${head}${body}</section>`;
 }).join("")}</div>`;
}

/**
 * Call-and-response markup for one litany.
 * @param {{title:string, vernacular:string, latin?:string, labels?:string[], vernacularLabel?:string, french?:boolean, id?:string}} opts
 */
export function litanyResponsiveMarkup({title,vernacular,latin="",labels=[],labelsLatin=null,vernacularLabel="EN",french=false,id="litany"}){
 ensureLitanyResponsiveStyles();
 const L=(en,fr)=>french?fr:en;
 const voice=["together","leader","people"].includes(read(VOICE_KEY,"together"))?read(VOICE_KEY,"together"):"together";
 const face=latin&&read(FACE_KEY,"v")==="la"?"la":"v";
 const voiceButton=(v,en,fr)=>`<button type="button" data-ao-litany-voice="${v}" aria-pressed="${voice===v}">${esc(L(en,fr))}</button>`;
 return `<article class="aoLitCR" data-ao-litany-responsive="${esc(id)}" data-voice="${voice}" data-face="${face}">
  <header class="aoLitCRBar">
   <h3>${esc(title)}</h3>
   <div class="aoLitCRControls">
    <div class="aoLitCRVoices" role="group" aria-label="${esc(L("Pray as","Prier en tant que"))}">${voiceButton("together","Together","Ensemble")}${voiceButton("leader","Leader","Meneur")}${voiceButton("people","People","Assemblée")}</div>
    ${latin?`<button type="button" class="aoLitCRFaceToggle" data-ao-litany-face aria-pressed="${face==="la"}" aria-label="${esc(face==="la"?L("Show vernacular","Afficher la langue vernaculaire"):L("Show Latin","Afficher le latin"))}">${face==="la"?"LA":esc(vernacularLabel)}</button>`:""}
   </div>
  </header>
  ${faceMarkup(vernacular,{labels,face:"v",hidden:face!=="v"})}
  ${latin?faceMarkup(latin,{labels:labelsLatin||labels,face:"la",hidden:face!=="la"}):""}
 </article>`;
}

function onClick(e){
 const t=e.target.closest?.("[data-ao-litany-voice],[data-ao-litany-face]");
 if(!t)return;
 const card=t.closest(".aoLitCR");if(!card)return;
 e.preventDefault();e.stopPropagation();
 if(t.matches("[data-ao-litany-voice]")){
  const v=t.dataset.aoLitanyVoice;card.dataset.voice=v;write(VOICE_KEY,v);
  card.querySelectorAll("[data-ao-litany-voice]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.aoLitanyVoice===v)));
 }else{
  const next=card.dataset.face==="la"?"v":"la";card.dataset.face=next;write(FACE_KEY,next);
  card.querySelectorAll("[data-ao-litany-face-body]").forEach(n=>{n.hidden=n.dataset.aoLitanyFaceBody!==next});
  const vl=t.dataset.vernacularLabel||t.textContent;
  if(next==="la"){t.dataset.vernacularLabel=vl;t.textContent="LA"}else{t.textContent=t.dataset.vernacularLabel||"EN"}
  t.setAttribute("aria-pressed",String(next==="la"));
 }
}

let installed=false;
export function ensureLitanyResponsiveStyles(){
 if(typeof document==="undefined")return;
 if(!installed){installed=true;document.addEventListener("click",onClick,true)}
 if(document.getElementById(STYLE_ID))return;
 const style=document.createElement("style");style.id=STYLE_ID;style.textContent=CSS;
 document.head.appendChild(style);
}

const CSS=`
.aoLitCR{--lit-accent:#6cc08a;--lit-ink:var(--ao-text-primary,#eef0ef);--lit-muted:var(--ao-text-muted,#a1acb9);--lit-line:var(--line,rgba(231,235,240,.12));--lit-bg:var(--ao-bg-canvas,#080c12);color:var(--lit-ink);font-family:var(--ao-font-body,'EB Garamond',Georgia,serif)}
.aoLitCRBar{display:flex;flex-direction:column;gap:10px;margin:0 0 6px}
.aoLitCRBar h3{margin:0;font:500 22px/1.2 var(--ao-font-display,'EB Garamond',serif)}
.aoLitCRControls{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.aoLitCRVoices{display:inline-flex;border:1px solid var(--lit-line);border-radius:999px;padding:2px;gap:2px}
.aoLitCRVoices button,.aoLitCRFaceToggle{min-height:44px;min-width:44px;padding:0 14px;border-radius:999px;border:0;background:transparent;color:var(--lit-muted);font:600 13px/1 var(--ao-font-ui,Georgia,serif);letter-spacing:.03em;cursor:pointer}
.aoLitCRVoices button[aria-pressed="true"]{background:rgba(108,192,138,.16);color:var(--lit-ink)}
.aoLitCRFaceToggle{border:1px solid var(--lit-line);margin-left:auto}
.aoLitCRFaceToggle[aria-pressed="true"]{color:var(--lit-ink);border-color:var(--lit-accent)}
.aoLitCRSection{position:relative;margin:0 0 6px}
.aoLitCRHead{position:sticky;top:0;z-index:2;margin:0 -2px;padding:12px 2px 8px;background:linear-gradient(var(--lit-bg) 75%,transparent);font:600 11px/1.2 var(--ao-font-brand,Cinzel,serif);letter-spacing:.16em;text-transform:uppercase;color:var(--lit-accent)}
.aoLitCRPlain{margin:.35em 0;font-size:19px;line-height:1.5}
.aoLitCRDialogue .aoLitCRRole,.aoLitCRResponse .aoLitCRRole{color:var(--lit-accent);font-weight:600}
.aoLitCRDialogue.is-r{font-weight:600}
.aoLitCRRun{position:relative;margin:4px 0 14px}
.aoLitCRCalls{list-style:none;margin:0;padding:0}
.aoLitCRCall{display:flex;align-items:baseline;gap:10px;padding:9px 0;border-bottom:1px solid var(--lit-line);font-size:19px;line-height:1.4}
.aoLitCRCallText{flex:1}
.aoLitCRCue{flex:none;color:var(--lit-accent);opacity:.55;font-size:15px}
.aoLitCRResponse{position:sticky;bottom:8px;z-index:1;display:flex;align-items:baseline;gap:8px;margin:10px 0 0;padding:12px 16px;border-radius:14px;border:1px solid rgba(108,192,138,.45);background:#15241c;background:color-mix(in srgb,var(--lit-bg) 82%,#6cc08a 18%);box-shadow:0 6px 20px rgba(0,0,0,.35);font-size:19px;font-weight:600}
.aoLitCRResponseText{flex:1}
.aoLitCRCount{font:600 11px/1 var(--ao-font-brand,Cinzel,serif);letter-spacing:.08em;color:var(--lit-muted);font-weight:600}
.aoLitCR[data-voice="leader"] .aoLitCRCallText{font-weight:600}
.aoLitCR[data-voice="leader"] .aoLitCRResponse{opacity:.6;font-weight:400}
.aoLitCR[data-voice="people"] .aoLitCRCall{color:var(--lit-muted)}
.aoLitCR[data-voice="people"] .aoLitCRResponse{font-size:22px}
#aoPray435930 .aoTP381LitanyViews{margin:4px 0 14px}
.aoLitCR .aoSrOnly{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
`;
