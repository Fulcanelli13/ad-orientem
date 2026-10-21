/*
 * Living Catena: only attributed, unmodified English excerpts from the
 * pinned Oxford/Newman Catena corpus appear as Father messages.
 * Search is conservative local lexical retrieval, never generated speech.
 */
import {catenaRelatedTopic,catenaTopicEvidence,retrieveCatenaRelatedMessages} from "./catena-related-vocabulary.js";
export const LIVING_CATENA_SCHEMA="ao.catena.messenger.v1";
const STOP=new Set("a an and are as at be been but by can could did do does for from had has have how i in is it its may me my of on or our shall should so that the the their them there these this those to was were what when where which who why will with would you your about passage say says".split(" "));
export const catenaSearchTerms=q=>[...new Set((String(q||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().match(/[a-z]{4,}/g)||[]).filter(x=>!STOP.has(x)))];
const tokens=catenaSearchTerms;
function safeUrl(value){try{const u=new URL(value);return u.protocol==="https:"&&u.hostname==="www.ecatholic2000.com"?u.href:null}catch{return null}}
export function indexCatenaMessages(pericopes){
 const result=[];
 for(const p of Array.isArray(pericopes)?pericopes:[]){
  const url=safeUrl(p?.source?.url);
  if(!url||typeof p?.id!=="string"||typeof p?.citation!=="string"||!Array.isArray(p?.segments))continue;
  p.segments.forEach((s,i)=>{
   if(typeof s?.father!=="string"||!s.father.trim()||typeof s?.text!=="string"||!s.text.trim())return;
   result.push(Object.freeze({id:p.id+":"+i,pericopeId:p.id,ordinal:i+1,
     father:s.father,text:s.text,citation:p.citation,sourceUrl:url}));
  });
 }
 return Object.freeze(result);
}
export function retrieveCatenaMessages(rows,query,{limit=3,excludeIds=null}={}){
 if(!Array.isArray(rows)||!rows.length)return [];
 const q=String(query||"").toLowerCase();
 // An explicitly named Father is a source filter, not content to be
 // mistaken for a theological search keyword.
 const mentioned=[...new Set(rows.map(r=>r.father))].filter(f=>
   f.length>=4&&q.includes(f.toLowerCase()));
 const terms=tokens(query).filter(t=>!mentioned.some(f=>f.toLowerCase().includes(t)));
 if(!terms.length&&!mentioned.length)return [];
 const preferred=mentioned.length?rows.filter(r=>mentioned.includes(r.father)):rows;
 const scored=preferred.map((r,i)=>{
   const hay=String(r.text||"").toLowerCase();
   let score=0,matched=0;
   for(const term of terms){
     const match=hay.includes(term);
     if(match){
       matched++;
       score+=term.length>=8?4:3;
       if(new RegExp("(^|[^a-z])"+term+"([^a-z]|$)").test(hay))score+=1;
     }
   }
   if(terms.length>1&&hay.includes(terms.join(" ")))score+=5;
   return {r,i,matched,score};
 }).filter(x=>terms.length===0||x.matched>=Math.min(2,terms.length));
 scored.sort((a,b)=>{
   const aSeen=excludeIds?.has?.(a.r.id)?1:0;
   const bSeen=excludeIds?.has?.(b.r.id)?1:0;
   return aSeen-bSeen||b.score-a.score||b.matched-a.matched||a.i-b.i;
 });
 const capped=Math.max(1,Math.min(5,limit)),picked=[],authors=new Set();
 // Relevant voices first, with an opportunity for different Fathers to
 // contribute before repeating one voice.
 for(const x of scored){
   if(picked.length>=capped)break;
   if(!authors.has(x.r.father)){picked.push(x.r);authors.add(x.r.father)}
 }
 for(const x of scored){
   if(picked.length>=capped)break;
   if(!picked.includes(x.r))picked.push(x.r);
 }
 return picked;
}
export function suggestCatenaTopics(rows,{limit=4}={}){
 const candidates=["Word","Beginning","Father","Creation","Eternal",
   "Kingdom","Faith","Mercy","Grace","Love","Prayer","Resurrection",
   "Baptism","Forgiveness","Bread","Spirit","Wisdom","Flesh","Glory",
   "Law","Heaven","Judgment","Life","Truth","Sin"];
 const corpus=(Array.isArray(rows)?rows:[]).map(x=>String(x.text||"").toLowerCase()).join(" ");
 return candidates.filter(term=>new RegExp("(^|[^a-z])"+term.toLowerCase()+"(s|al|ity)?([^a-z]|$)").test(corpus))
  .slice(0,Math.max(0,Math.min(6,limit)));
}
const element=(d,tag,cls,text)=>{
 const e=d.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;
};
function action(d,label,fn){
 const b=element(d,"button",null,label);b.type="button";b.addEventListener("click",fn);return b;
}
function opening(text){
 if(text.length<=440)return text;
 const at=text.lastIndexOf(" ",440);
 return text.slice(0,at>250?at:440);
}
function installStyle(d){
 if(d.getElementById("ao-catena-messenger-style"))return;
 const s=element(d,"style");s.id="ao-catena-messenger-style";
 s.textContent=[
 ".aoCatenaMessenger{background:#0a131c;border:1px solid #67563d;border-radius:14px;overflow:hidden;margin:14px 0;font-family:var(--ao-font-liturgical,Georgia,serif)}",
 ".aoCatenaMessenger *{box-sizing:border-box}",
 ".aoCatenaMHead{background:linear-gradient(130deg,#24303b,#0a131c);padding:18px;border-bottom:1px solid #67563d}",
 ".aoCatenaMHead h4{font:400 26px/1.3 var(--ao-font-liturgical,Georgia,serif)!important;color:#ecd7b4;margin:0!important}",
 ".aoCatenaMHead p{font:13px/1.5 var(--ao-font-ui,Georgia,serif);color:#bdb09e;margin:6px 0}",
 ".aoCatenaMHead .aoCatenaMKicker{color:#d6b477;letter-spacing:.13em;text-transform:uppercase;font-size:11px}",
 ".aoCatenaMAuthors{padding:10px;display:flex;gap:7px;flex-wrap:wrap;border-bottom:1px solid #574933}",
 ".aoScriptureLibrary .aoCatenaMAuthors button{min-height:43px;border:1px solid #776044;background:#17232e;color:#efd8b8;padding:9px 12px;border-radius:25px;font:500 13px var(--ao-font-ui,Georgia,serif)}",
 ".aoScriptureLibrary .aoCatenaMAuthors button[aria-pressed=true]{background:#53402b;border-color:#c4a16a}",
 ".aoCatenaMFeed{padding:15px 11px;display:flex;flex-direction:column;gap:17px}",
 ".aoCatenaMRow{display:flex;align-items:flex-start;gap:9px;width:100%}",
 ".aoCatenaMAvatar{flex:0 0 38px;width:38px;height:38px;border-radius:50%;border:1px solid #aa8552;background:#303739;display:grid;place-items:center;color:#ead0a6;font:600 15px Georgia}",
 ".aoCatenaMBody{flex:1;min-width:0}",
 ".aoCatenaMRelated{font:500 11px/1.5 var(--ao-font-ui,Georgia,serif);color:#c7b9a1;margin:0 0 5px!important}",
 ".aoCatenaMElsewhere{font:600 11px/1.5 var(--ao-font-ui,Georgia,serif);color:#d6ae70;margin:0 0 5px!important;letter-spacing:.035em}",
 ".aoCatenaMName{color:#e9c68e;font:600 13px var(--ao-font-ui,Georgia,serif);margin:0 0 5px!important}",
 ".aoCatenaMBubble{border:1px solid #41505b;background:#1a2834;padding:13px;border-radius:4px 14px 14px 14px;color:#efe6d9;white-space:pre-wrap;overflow-wrap:anywhere;font:17px/1.65 var(--ao-font-liturgical,Georgia,serif)}",
 ".aoCatenaMBubble p{margin:0!important}",
 ".aoCatenaMComplete{margin-top:9px;border-top:1px solid #56606b;padding-top:4px}",
 ".aoCatenaMComplete summary{display:flex;align-items:center;min-height:44px;color:#e4c18a;font:500 13px var(--ao-font-ui,Georgia,serif)}",
 ".aoCatenaMMeta{margin-top:7px;color:#c2b6a4;font:12px/1.5 var(--ao-font-ui,Georgia,serif)}",
 ".aoCatenaMMeta a{display:inline!important;margin:0!important;font:inherit!important;color:#e6cb96}",
 ".aoCatenaMUser{align-self:flex-end;max-width:83%;padding:11px 14px;background:#463725;border:1px solid #997b50;border-radius:14px 14px 3px 14px;font:16px/1.5 var(--ao-font-liturgical,Georgia,serif);color:#fff0d5;overflow-wrap:anywhere}",
 ".aoCatenaMNotice{align-self:center;max-width:95%;padding:10px 13px;border:1px solid #6c563a;border-radius:9px;color:#d0bfa6;text-align:center;font:13px/1.5 var(--ao-font-ui,Georgia,serif)}",
 ".aoCatenaMFooter{background:#101c27;border-top:1px solid #67563d;padding:12px}",
 ".aoCatenaMTopics{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin:0 0 12px}",
 ".aoCatenaMTopics>span{font:12px var(--ao-font-ui,Georgia,serif);color:#b5a38a}",
 ".aoScriptureLibrary .aoCatenaMTopics button{min-height:40px;background:#172633;color:#e3c598;border:1px solid #68573e;border-radius:22px;padding:8px 10px;font:500 13px var(--ao-font-ui,Georgia,serif)}",
 ".aoCatenaMActions{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px}",
 ".aoScriptureLibrary .aoCatenaMActions button{min-height:44px;background:transparent;border:1px solid #967954;color:#e5c895;font:500 13px var(--ao-font-ui,Georgia,serif)}",
 ".aoCatenaMForm{display:flex;gap:7px}",
 ".aoScriptureLibrary .aoCatenaMForm input{flex:1;min-width:0;min-height:47px;background:#08131e;color:#eee3d1}",
 ".aoScriptureLibrary .aoCatenaMForm button{min-height:47px;background:#ba945a;border:0;color:#09121b;font:600 13px var(--ao-font-ui,Georgia,serif)}",
 ".aoCatenaMDisclaimer{margin:11px 0 0!important;font:12px/1.5 var(--ao-font-ui,Georgia,serif);color:#aeb0ad}",
 "@media(max-width:480px){.aoCatenaMHead{padding:13px}.aoCatenaMFeed{padding:12px 7px}.aoCatenaMAvatar{flex-basis:31px;width:31px;height:31px}.aoCatenaMBubble{font-size:16px;padding:10px}}"
 ].join("\n");
 (d.head||d.documentElement).append(s);
}
export function mountCatenaMessenger(host,pericopes,{language="en",fetcher=globalThis.fetch?.bind(globalThis),cacheStorage=globalThis.caches,cryptoProvider=globalThis.crypto}={}){
 if(!host?.ownerDocument||language!=="en")return null;
 const d=host.ownerDocument,rows=indexCatenaMessages(pericopes);
 if(!rows.length)return null;
 installStyle(d);
 const shell=element(d,"section","aoCatenaMessenger");
 shell.dataset.catenaMessenger=LIVING_CATENA_SCHEMA;
 shell.setAttribute("aria-label","Source-faithful Living Catena conversation");
 const head=element(d,"header","aoCatenaMHead");
 head.append(element(d,"p","aoCatenaMKicker","The Fathers on Holy Scripture"),
  element(d,"h4",null,"The Living Catena"),
  element(d,"p",null,rows.length+" original excerpts · "+new Set(rows.map(r=>r.father)).size+" attributed authors · "+pericopes.map(p=>p.citation).join("; ")));
 const authors=element(d,"nav","aoCatenaMAuthors");authors.setAttribute("aria-label","Select an attributed Father");
 const feed=element(d,"div","aoCatenaMFeed");feed.setAttribute("role","log");feed.setAttribute("aria-label","Patristic source extracts");
 const foot=element(d,"div","aoCatenaMFooter"),topics=element(d,"div","aoCatenaMTopics"),acts=element(d,"div","aoCatenaMActions"),form=element(d,"form","aoCatenaMForm");
 const input=element(d,"input");
 input.type="search";input.maxLength=240;input.placeholder="Ask about the passage…";input.setAttribute("aria-label","Find the Fathers' words");
 const send=element(d,"button",null,"Find excerpts");send.type="submit";
 form.append(input,send);
 foot.append(topics,acts,form,element(d,"p","aoCatenaMDisclaimer","Messages reproduce the Oxford/Newman Catena extracts. Questions use literal vocabulary and a small reviewed list of related expressions; related matches are marked, not treated as answers. No AI speech. Historical author labels follow the source."));
 shell.append(head,authors,feed,foot);host.append(shell);
 const seen=new Set();let lastFather=null,lastQuestion="",searching=false;
 const wider=action(d,"Search all four Gospels",()=>{if(lastQuestion)void searchElsewhere(lastQuestion)});
 wider.disabled=true;
 function note(s){const e=element(d,"p","aoCatenaMNotice",s);e.setAttribute("role","status");feed.append(e)}
 function renderAuthors(){
  const count=new Map();rows.forEach(r=>count.set(r.father,(count.get(r.father)||0)+1));
  authors.replaceChildren();
  for(const [name,n] of count){
   const b=action(d,name+" · "+n,()=>{
    const candidate=rows.find(r=>r.father===name&&!seen.has(r.id));
    if(candidate)message(candidate);else note("All available extracts from "+name+" are already shown.");
   });
   b.setAttribute("aria-pressed",String(name===lastFather));authors.append(b);
  }
 }
 function message(r){
  if(!r||seen.has(r.id))return false;
  seen.add(r.id);lastFather=r.father;
  const article=element(d,"article","aoCatenaMRow");article.dataset.catenaFragmentId=r.id;
  const av=element(d,"div","aoCatenaMAvatar",r.father.slice(0,1).toUpperCase());av.setAttribute("aria-hidden","true");
  const body=element(d,"div","aoCatenaMBody"),bubble=element(d,"div","aoCatenaMBubble");
  if(r.fromAnotherPassage)body.append(element(d,"p","aoCatenaMElsewhere","FROM ANOTHER PASSAGE · "+r.reference));
  if(r.relatedSourceEvidence)body.append(element(d,"p","aoCatenaMRelated","RELATED SOURCE WORDING · “"+r.relatedSourceEvidence.sourcePhrase+"” · Not a direct answer"));
  body.append(element(d,"p","aoCatenaMName",r.father));
  const excerpt=opening(r.text);bubble.append(element(d,"p",null,excerpt));
  if(excerpt!==r.text){
   const details=element(d,"details","aoCatenaMComplete");
   details.append(element(d,"summary",null,"Read complete, unabridged extract"),
                  element(d,"p",null,r.text));
   bubble.append(details);
  }
  const meta=element(d,"div","aoCatenaMMeta");
  meta.append(d.createTextNode(r.citation+" · Extract "+r.ordinal+" · "));
  const source=element(d,"a",null,"Original Catena source ↗");
  source.href=r.sourceUrl;source.target="_blank";source.rel="noopener noreferrer";
  source.dataset.scriptureCommentarySource="verified";meta.append(source);
  body.append(bubble,meta);article.append(av,body);feed.append(article);renderAuthors();
  return true;
 }
 acts.append(action(d,"Continue reading",()=>{
  const next=rows.find(r=>!seen.has(r.id));
  if(next)message(next);else note("All extracts for this passage are already in the thread.");
 }),action(d,"Another Father",()=>{
  const next=rows.find(r=>r.father!==lastFather&&!seen.has(r.id));
  if(next)message(next);else note("No further extracts from another attributed author remain.");
 }),wider);
 async function searchElsewhere(query){
  if(searching||!shell.isConnected)return;
  searching=true;wider.disabled=true;
  const busy=element(d,"p","aoCatenaMNotice","Searching the original Catena across all four Gospels…");
  busy.setAttribute("role","status");feed.append(busy);
  try{
   const module=await import("./catena-global-search.js");
   const output=await module.searchCatenaAcrossGospels(query,{
    currentPericopeIds:pericopes.map(p=>p.id),
    currentAuthors:[...new Set(rows.map(r=>r.father))],
    fetcher,cacheStorage,cryptoProvider,limit:3
   });
   if(!shell.isConnected)return;
   busy.remove();let added=0;
   for(const result of output.results)if(message(result))added++;
   if(!added)note("No further matching original extracts could be verified elsewhere in the indexed Gospels.");
   if(output.unavailable.length)note("Some Gospel indexes or original chapter packs could not be loaded. Results are incomplete: "+output.unavailable.join(", ")+".");
  }catch{
   if(shell.isConnected){busy.remove();note("Cross-Gospel source search is unavailable. No patristic message has been invented.");}
  }finally{searching=false;wider.disabled=!lastQuestion||!shell.isConnected}
 }
 function ask(query,display=query){
  if(!query.trim())return;
  feed.append(element(d,"div","aoCatenaMUser",display));
  lastQuestion=query;wider.disabled=false;
  const topic=catenaRelatedTopic(query);
  const related=topic?retrieveCatenaRelatedMessages(rows,query,{limit:4,excludeIds:seen}):[];
  const matched=related.length?related.map(hit=>Object.freeze({
    ...hit.row,relatedSourceEvidence:hit.evidence
  })):retrieveCatenaMessages(rows,query,{limit:4,excludeIds:seen});
  if(!matched.length){
   note("No verified matching source wording here. Searching other Gospel passages…");
   void searchElsewhere(query);return;
  }
  let fresh=0;for(const r of matched)if(message(r))fresh++;
  if(!fresh)note("The matching original extracts are already present earlier in the conversation.");
 }
 topics.append(element(d,"span",null,"Find passages on:"));
 for(const subject of suggestCatenaTopics(rows)){
  topics.append(action(d,subject,()=>ask(subject,"Find source extracts mentioning “"+subject+"”")));
 }
 form.addEventListener("submit",event=>{
  event.preventDefault();const query=input.value.trim();input.value="";ask(query);
 });
 message(rows[0]);const second=rows.find(r=>r.father!==rows[0].father);if(second)message(second);
 return Object.freeze({element:shell,total:rows.length});
}
