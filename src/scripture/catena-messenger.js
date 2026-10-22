/*
 * Living Catena: only attributed, unmodified English excerpts from the
 * pinned Oxford/Newman Catena corpus appear as Father messages.
 * Search is conservative local lexical retrieval, never generated speech.
 */
import {catenaRelatedTopic,catenaTopicEvidence,retrieveCatenaRelatedMessages} from "./catena-related-vocabulary.js";
import {curatedCatenaReaderQuestions} from "./catena-reader-questions.js";
export const LIVING_CATENA_SCHEMA="ao.catena.messenger.v1";
// Mixed authorship recorded in the Catena research audit. These two
// boundaries are display metadata only: the canonical source is untouched.
const KNOWN_MIXED_OWNERS=Object.freeze({
 "catena.matthew.26.26:12":Object.freeze({father:"Lanfranc",length:530,at:215}),
 "catena.matthew.27.45:1":Object.freeze({father:"Origen",length:1239,at:726})
});
export function catenaOwnerUnits(row){
 if(!row||typeof row.id!=="string"||typeof row.text!=="string"||
   typeof row.father!=="string")return null;
 const owner=KNOWN_MIXED_OWNERS[row.id];
 if(!owner)return [{father:row.father,originalWords:row.text}];
 if(row.father!==owner.father||row.text.length!==owner.length||
    row.text.indexOf("PSEUDO-DIONYSIUS.")!==owner.at)
   return null; // Fail closed rather than putting another author in one bubble.
 return [{father:owner.father,originalWords:row.text.slice(0,owner.at)},
         {father:"Pseudo-Dionysius",originalWords:row.text.slice(owner.at)}];
}
const STOP=new Set("a an and are as at be been but by can could did do does for from had has have how i in is it its may me my of on or our shall should so that the the their them there these this those to was were what when where which who why will with would you your about passage say says".split(" "));
export const catenaSearchTerms=q=>[...new Set((String(q||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().match(/[a-z]{4,}/g)||[]).filter(x=>!STOP.has(x)))];
const tokens=catenaSearchTerms;
/**
 * Avoid making a lone generic source word seem to answer a long, unrelated
 * question. Short one-topic prompts and repeated focal expressions remain
 * searchable (e.g., "Word" or "Our Father ... My Father").
 * This gate is deliberately conservative, not a claim of semantic relevance.
 */
export function catenaQuestionHasSufficientEvidence(query){
 const terms=catenaSearchTerms(query);
 if(!terms.length)return false;
 if(terms.length>1)return true;
 const words=(String(query).toLowerCase().match(/[a-z0-9]+/g)||[]);
 if(words.length<7)return true;
 const term=terms[0]; // tokenizer guarantees lowercase ASCII letters only
 const count=(String(query).toLowerCase().match(new RegExp("(^|[^a-z])"+term+"([^a-z]|$)","g"))||[]).length;
 return count>=2;
}
/**
 * Conservatively abstain when a question contains multiple substantial
 * concepts absent from the original excerpts. A curated topic phrase is
 * removed before the check because its source wording may be different.
 * Never infer modern facts from a shared generic Gospel word.
 */
export function catenaQuestionHasUnsupportedContext(query,rows){
 if(!Array.isArray(rows)||!rows.length)return false;
 const topic=catenaRelatedTopic(query);
 const residual=topic?String(query).replace(topic.query," "):String(query);
 const words=catenaSearchTerms(residual).filter(t=>t.length>=5);
 if(!words.length)return false;
 const source=rows.map(r=>String(r?.text||"").toLowerCase()).join(" ");
 const absent=words.filter(word=>!source.includes(word));
 return absent.length>=3||(absent.length>=2&&absent.some(word=>word.length>=8));
}
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
 if(!Array.isArray(rows)||!rows.length||!catenaQuestionHasSufficientEvidence(query))return [];
 const q=String(query||"").toLowerCase();
 // An explicitly named Father is a source filter, not content to be
 // mistaken for a theological search keyword.
 const mentioned=[...new Set(rows.map(r=>r.father))].filter(f=>
   f.length>=4&&q.includes(f.toLowerCase()));
 const terms=tokens(query).filter(t=>!mentioned.some(f=>f.toLowerCase().includes(t)));
 if(!terms.length&&!mentioned.length)return [];
 // A conspicuously absent technical/content term is evidence AGAINST
 // relevance, even when a generic phrase overlaps ("the prodigal son"
 // does not make "smartphone" a patristic subject). Editorially recognized
 // related concepts use their separately disclosed source-evidence route.
 if(!catenaRelatedTopic(query)&&terms.some(t=>t.length>=8&&
   !rows.some(r=>String(r?.text||"").toLowerCase().includes(t))))return [];
 const preferred=mentioned.length?rows.filter(r=>mentioned.includes(r.father)):rows;
 // Distinctive words in the current original passage matter more than
 // generic vocabulary. Document frequency is computed only over authenticated
 // extracts already loaded for this pericope; no authored answer bank.
 const frequency=new Map(terms.map(term=>[term,
  preferred.filter(row=>String(row.text||"").toLowerCase().includes(term)).length]));
 const rarityWeight=term=>5*Math.log((preferred.length+1)/(frequency.get(term)+1));
 // Original-source phrase agreement is stronger than isolated token overlap.
 // Keep ordinary stopwords inside phrases: "Our Father"/"My Father" or
 // "to himself" are meaningful when the user asks about those expressions.
 const rawWords=(q.match(/[a-z]+/g)||[]);
 const phrases=[];
 for(const size of [3,2])for(let n=0;n+size<=rawWords.length;n++){
  const parts=rawWords.slice(n,n+size);
  const contentCount=parts.filter(word=>terms.includes(word)).length;
  // Never reward possessive apostrophe fragments, bare articles, or
  // "the Pharisee's" as a substantive thematic match. Two content terms
  // provide a stronger span; short relation words only matter in bounded
  // expressions such as "Our Father" and "to himself".
  const relationWords=new Set(["our","my","his","her","to","not"]);
  const meaningful=contentCount>=2||
   (size===2&&contentCount===1&&parts.some(word=>relationWords.has(word)));
  if(meaningful&&!parts.includes("s")){
   const phrase=parts.join(" ");
   if(!phrases.some(row=>row.value===phrase))
    phrases.push({value:phrase,points:size===3?10:6});
  }
 }
 const scored=preferred.map((r,i)=>{
   const hay=String(r.text||"").toLowerCase();
   let score=0,matched=0;
   for(const term of terms){
     const match=hay.includes(term);
     if(match){
       matched++;
       score+=term.length>=8?4:3;
       if(new RegExp("(^|[^a-z])"+term+"([^a-z]|$)").test(hay))score+=1;
      score+=rarityWeight(term);
     }
   }
   if(terms.length>1&&hay.includes(terms.join(" ")))score+=5;
   const normalizedSource=" "+hay.replace(/[^a-z]+/g," ").replace(/ +/g," ").trim()+" ";
   let phraseScore=0;
   for(const phrase of phrases)if(normalizedSource.includes(" "+phrase.value+" "))
    phraseScore+=phrase.points;
   score+=Math.min(30,phraseScore);
   // A concise source segment with the same literal question phrase is
   // often a more useful entry point than a distant occurrence in a long
   // theological passage. Modest boost; never a fabricated relevance grade.
   if(phraseScore>=6&&r.text.length<=260)score+=3;
   return {r,i,matched,score,phraseScore};
 }).filter(x=>terms.length===0||x.matched>=Math.min(2,terms.length)||
   (x.matched>=1&&x.phraseScore>=6));
 scored.sort((a,b)=>{
   const aSeen=excludeIds?.has?.(a.r.id)?1:0;
   const bSeen=excludeIds?.has?.(b.r.id)?1:0;
   return aSeen-bSeen||b.score-a.score||b.matched-a.matched||a.i-b.i;
 });
 const capped=Math.max(1,Math.min(5,limit)),picked=[],authors=new Set();
 // Keep the two strongest original quotations before diversifying voices;
 // otherwise an author-based rotation can bury the only precise answer.
 for(const x of scored.slice(0,Math.min(2,capped))){
  picked.push(x.r);authors.add(x.r.father);
 }
 // After the strongest evidence, give distinct authors a chance.
 for(const x of scored){
   if(picked.length>=capped)break;
   if(!picked.includes(x.r)&&!authors.has(x.r.father)){
    picked.push(x.r);authors.add(x.r.father)
   }
 }
 for(const x of scored){
   if(picked.length>=capped)break;
   if(!picked.includes(x.r))picked.push(x.r);
 }
 return picked;
}
/**
 * A literal three-word phrase in a *single original attributed excerpt*
 * is stronger navigational evidence than an otherwise broad theme bucket.
 * This is strictly text matching, not editorial doctrinal interpretation.
 */
export function catenaHasExactSourcePhrase(rows,question){
 if(!Array.isArray(rows)||typeof question!=="string")return false;
 const wordList=question.toLowerCase().match(/[a-z]+/g)||[];
 const content=new Set(catenaSearchTerms(question));
 if(wordList.length<3||!content.size)return false;
 const phrases=[];
 for(let i=0;i<=wordList.length-3;i++){
  const phrase=wordList.slice(i,i+3);
  if(phrase.filter(word=>content.has(word)).length>=2)
   phrases.push(" "+phrase.join(" ")+" ");
 }
 if(!phrases.length)return false;
 return rows.some(r=>{
  const normalized=" "+String(r.text||"").toLowerCase()
   .replace(/[^a-z]+/g," ").replace(/ +/g," ").trim()+" ";
  return phrases.some(phrase=>normalized.includes(phrase));
 });
}
/**
 * Report HOW an original extract was retrieved without classifying it as a
 * theological answer. A source occurrence supports only retrieval evidence.
 * The returned sourcePhrase is taken verbatim from the canonical fragment.
 */
export function catenaLiteralMatchEvidence(row,question){
 if(typeof row?.text!=="string"||typeof question!=="string")return null;
 const words=question.toLowerCase().match(/[a-z]+/g)||[];
 const content=new Set(catenaSearchTerms(question));
 for(const size of [4,3,2]){
  for(let i=0;i+size<=words.length;i++){
   const phrase=words.slice(i,i+size);
   if(phrase.filter(word=>content.has(word)).length<2)continue;
   const pattern=new RegExp("\\b"+phrase.join("[^a-zA-Z]+")+"\\b","i");
   const match=pattern.exec(row.text);
   if(match)return Object.freeze({kind:"exact-source-wording",sourcePhrase:match[0]});
  }
 }
 const shared=[...content].filter(word=>
  new RegExp("(^|[^a-z])"+word+"([^a-z]|$)","i").test(row.text));
 if(shared.length)return Object.freeze({kind:"shared-vocabulary",sourceTerms:shared});
 return null;
}
/**
 * The actual source selector used for both the Messenger and the automated
 * editorial acceptance fixtures. Related-topic retrieval is a fallback unless
 * the question's exact multiword wording appears in the canonical extract.
 */
export function retrieveCatenaQuestionMatches(rows,question,{limit=4,excludeIds=null}={}){
 if(catenaQuestionHasUnsupportedContext(question,rows))return [];
 const literal=retrieveCatenaMessages(rows,question,{limit,excludeIds});
 const topic=catenaRelatedTopic(question);
 const annotated=literal.map(row=>Object.freeze({
  ...row,sourceMatchEvidence:catenaLiteralMatchEvidence(row,question)
 }));
 if(literal.length&&(!topic||catenaHasExactSourcePhrase(rows,question)))return annotated;
 const related=topic?retrieveCatenaRelatedMessages(rows,question,{limit,excludeIds}):[];
 return related.length?related.map(hit=>Object.freeze({
  ...hit.row,relatedSourceEvidence:hit.evidence
 })):annotated;
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
/**
 * Source-grounded navigational questions. The modern questions are not
 * patristic writings or editorially authenticated answers.
 */
export function suggestCatenaQuestions(rows,{limit=5}={}){
 if(!Array.isArray(rows)||!rows.length)return Object.freeze([]);
 const cap=Math.max(1,Math.min(6,limit));
 // Full source-pointer question routes take priority over lexical fallback.
 const result=[...curatedCatenaReaderQuestions(rows,{limit:cap})];
 if(result.length>=cap)return Object.freeze(result);
 for(const term of suggestCatenaTopics(rows,{limit:6})){
  if(result.some(x=>x.topic.toLowerCase()===term.toLowerCase()))continue;
  const hits=retrieveCatenaQuestionMatches(rows,term,{limit:1});
  if(!hits.length||(!hits[0].sourceMatchEvidence&&!hits[0].relatedSourceEvidence))continue;
  result.push(Object.freeze({
   topic:term,question:"What do the Fathers say about “"+term+"”?",
   sourcePointer:hits[0].id,lookupTerm:term,
   kind:"source-vocabulary-navigation"
  }));
  if(result.length>=cap)break;
 }
 return Object.freeze(result);
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
 ".aoCatenaMRelated,.aoCatenaMEvidence{font:500 11px/1.5 var(--ao-font-ui,Georgia,serif);color:#c7b9a1;margin:0 0 5px!important}",
 ".aoCatenaMResearch{margin:6px 0 10px;padding:12px;border:1px solid #7a6646;border-radius:9px;background:#1b2229}",
 ".aoCatenaMResearch h5{color:#edd3a7;font:500 16px Georgia,serif;margin:0 0 5px}",
 ".aoCatenaMResearch p{color:#c8bba8;font:12px/1.55 var(--ao-font-ui,Georgia,serif);margin:3px 0 9px!important}",
 ".aoScriptureLibrary .aoCatenaMResearch button{display:block;text-align:left;width:100%;min-height:44px;background:#111d29;border:1px solid #6c5b40;padding:9px 12px;color:#f0dfc3;margin:7px 0;border-radius:7px;font:14px/1.4 Georgia,serif}",
 ".aoCatenaMResearchOwner{border-top:1px solid #726248;padding-top:10px;margin-top:10px}",
 ".aoCatenaMResearchOwner:first-child{border-top:0;padding-top:0;margin-top:0}",
 ".aoCatenaMResearchBadge{color:#e3c28a;font:500 11px/1.4 var(--ao-font-ui,Georgia,serif);letter-spacing:.03em}",
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
 ".aoCatenaMTopics{display:grid;gap:7px;margin:0 0 14px}",
 ".aoCatenaMTopics h5{font:400 20px/1.3 var(--ao-font-liturgical,Georgia,serif);color:#f2d6ac;margin:0}",
 ".aoCatenaMTopics>p{font:12px/1.45 var(--ao-font-ui,Georgia,serif);color:#b5a38a;margin:0 0 3px}",
 ".aoCatenaMTopicChoices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}",
 ".aoScriptureLibrary .aoCatenaMTopicChoices button{min-height:49px;text-align:left;background:#172633;color:#e8ce9f;border:1px solid #68573e;border-radius:8px;padding:9px 12px;font:14px/1.4 var(--ao-font-liturgical,Georgia,serif)}",
 ".aoCatenaMTopicChoices button:focus-visible{outline:2px solid #dfbc81;outline-offset:2px}",
 ".aoCatenaMRevisited{outline:2px solid #b6945d;outline-offset:4px;border-radius:8px}",
 ".aoCatenaMTopics>span{font:12px var(--ao-font-ui,Georgia,serif);color:#b5a38a}",
 ".aoScriptureLibrary .aoCatenaMTopics button{min-height:40px;background:#172633;color:#e3c598;border:1px solid #68573e;border-radius:22px;padding:8px 10px;font:500 13px var(--ao-font-ui,Georgia,serif)}",
 ".aoCatenaMActions{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px}",
 ".aoScriptureLibrary .aoCatenaMActions button{min-height:44px;background:transparent;border:1px solid #967954;color:#e5c895;font:500 13px var(--ao-font-ui,Georgia,serif)}",
 ".aoCatenaMForm{display:flex;gap:7px}",
 ".aoScriptureLibrary .aoCatenaMForm input{flex:1;min-width:0;min-height:47px;background:#08131e;color:#eee3d1}",
 ".aoScriptureLibrary .aoCatenaMForm button{min-height:47px;background:#ba945a;border:0;color:#09121b;font:600 13px var(--ao-font-ui,Georgia,serif)}",
 ".aoCatenaMDisclaimer{margin:11px 0 0!important;font:12px/1.5 var(--ao-font-ui,Georgia,serif);color:#aeb0ad}",
 "@media(max-width:480px){.aoCatenaMHead{padding:13px}.aoCatenaMFeed{padding:12px 7px}.aoCatenaMAvatar{flex-basis:31px;width:31px;height:31px}.aoCatenaMBubble{font-size:16px;padding:10px}.aoCatenaMTopicChoices{grid-template-columns:1fr}}"
 ].join("\n");
 (d.head||d.documentElement).append(s);
}
export function mountCatenaMessenger(host,pericopes,{language="en",fetcher=globalThis.fetch?.bind(globalThis),cacheStorage=globalThis.caches,cryptoProvider=globalThis.crypto,editorialResearchEnabled=false}={}){
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
 const researchPanel=element(d,"section","aoCatenaMResearch");
 researchPanel.hidden=true;researchPanel.setAttribute("aria-label","Unapproved editorial research questions");
 const input=element(d,"input");
 input.type="search";input.maxLength=240;input.placeholder="Ask about the passage…";input.setAttribute("aria-label","Find the Fathers' words");
 const send=element(d,"button",null,"Find excerpts");send.type="submit";
 form.append(input,send);
 foot.append(topics,editorialResearchEnabled?researchPanel:element(d,"span"),acts,form,
  element(d,"p","aoCatenaMDisclaimer",
   "All displayed commentaries reproduce Oxford/Newman Catena excerpts, with historically inherited attribution labels. Reader questions locate original source wording; they are not questions or answers by the Fathers. The separate editorial research suggestions (when enabled) remain unapproved. No AI Father speech."));
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
  const ownerUnits=catenaOwnerUnits(r);
  if(!ownerUnits){note("Mixed source attribution boundary failed validation; unverified excerpt withheld.");return false;}
  seen.add(r.id);lastFather=r.father;
  const article=element(d,"article","aoCatenaMRow");article.dataset.catenaFragmentId=r.id;
  const av=element(d,"div","aoCatenaMAvatar",r.father.slice(0,1).toUpperCase());av.setAttribute("aria-hidden","true");
  const body=element(d,"div","aoCatenaMBody"),bubble=element(d,"div","aoCatenaMBubble");
  if(r.fromAnotherPassage)body.append(element(d,"p","aoCatenaMElsewhere","FROM ANOTHER PASSAGE · "+r.reference));
  if(r.readerQuestionLink)body.append(element(d,"p","aoCatenaMEvidence",
   "READER QUESTION · This exact original excerpt discusses “"+r.readerQuestionLink.sourceEvidence+
   "”. The modern question is a navigation aid, not the Father's own question or a certified standalone answer."));
  if(r.editorialResearchLead)body.append(element(d,"p","aoCatenaMResearchBadge",
   "EDITORIAL SOURCE LEAD · NOT A VERIFIED ANSWER · ORIGINAL EXCERPT"));
  if(r.editorialContextReview)body.append(element(d,"p","aoCatenaMEvidence",
   "AI SOURCE REVIEW · "+r.editorialContextReview.reviewLabel+" · HUMAN APPROVAL PENDING"));
  if(r.relatedSourceEvidence)body.append(element(d,"p","aoCatenaMRelated","RELATED SOURCE WORDING · “"+r.relatedSourceEvidence.sourcePhrase+"” · Not a direct answer"));
  else if(r.sourceMatchEvidence){
   const evidence=r.sourceMatchEvidence;
   const label=evidence.kind==="exact-source-wording"
    ?"EXACT SOURCE WORDING · “"+evidence.sourcePhrase+"” · Relevance not reviewed"
    :"SHARED SOURCE WORDS · Not necessarily an answer";
   const context=element(d,"p","aoCatenaMEvidence",label);
   context.dataset.catenaMatch=evidence.kind;
   body.append(context);
  }
  body.append(element(d,"p","aoCatenaMName",
   ownerUnits.length>1?"MULTIPLE PRINTED ATTRIBUTIONS":("Catena attribution: "+r.father)));
  for(const unit of ownerUnits){
   const ownerBlock=element(d,"section",ownerUnits.length>1?"aoCatenaMResearchOwner":null);
   if(ownerUnits.length>1)ownerBlock.append(element(d,"p","aoCatenaMName","Attributed in the Catena: "+unit.father));
   const excerpt=opening(unit.originalWords);
   ownerBlock.append(element(d,"p",null,excerpt));
   if(excerpt!==unit.originalWords){
    const details=element(d,"details","aoCatenaMComplete");
    details.append(element(d,"summary",null,"Read complete, unabridged extract"),
                   element(d,"p",null,unit.originalWords));
    ownerBlock.append(details);
   }
   bubble.append(ownerBlock);
  }
  const meta=element(d,"div","aoCatenaMMeta");
  meta.append(d.createTextNode(r.citation+" · Extract "+r.ordinal+" · "));
  const source=element(d,"a",null,"Original Catena source ↗");
  source.href=r.sourceUrl;source.target="_blank";source.rel="noopener noreferrer";
  source.dataset.scriptureCommentarySource="verified";meta.append(source);
  body.append(bubble,meta);article.append(av,body);feed.append(article);renderAuthors();
  return true;
 }
 if(editorialResearchEnabled){
  const browse=action(d,"Browse research questions",()=>{void toggleEditorialResearch()});
  acts.append(browse);
  let registryPromise=null,researchOpen=false;
  async function getRegistry(){
   if(!registryPromise)registryPromise=import("./catena-editorial-routes.js").then(async mod=>{
    const registry=await mod.loadCatenaEditorialRoutes({fetcher});
    const review=await mod.loadCatenaEditorialReview(registry,{fetcher});
    return {mod,registry,review};
   }).catch(error=>{registryPromise=null;throw error});
   return registryPromise;
  }
  async function toggleEditorialResearch(){
   researchOpen=!researchOpen;
   browse.setAttribute("aria-expanded",String(researchOpen));
   researchPanel.hidden=!researchOpen;
   if(!researchOpen)return;
   researchPanel.replaceChildren(element(d,"p",null,"Loading source-linked research questions…"));
   try{
    const {mod,registry,review}=await getRegistry();
    if(!researchOpen||!shell.isConnected)return;
    const query=lastQuestion||"";
    const found=mod.discoverCatenaEditorialRoutes(registry,query,{
     currentPericopeIds:pericopes.map(p=>p.id),limit:10
    });
    researchPanel.replaceChildren(element(d,"h5",null,"Original sources to investigate"));
    researchPanel.append(element(d,"p",null,
     "Modern editorial questions — all unapproved. Select to inspect the Fathers' original words, never a combined answer."));
    if(!found.length){
     researchPanel.append(element(d,"p",null,
      "No contextual-review questions for this selection. Ask a shorter Matthew question or use the original full-corpus search."));
    }
    for(const route of found){
     const contextual=route.sourcePointers.map(p=>review.byPointer.get(p)).filter(Boolean);
     const needs=contextual.some(x=>x.AIContextAssessment!=="direct");
     const btn=action(d,route.question+
      (route.kind==="comparison"?" · compare sources":"")+
      (needs?" · context check required":""),()=>{void showEditorialRoute(mod,registry,review,route)});
     btn.dataset.catenaResearchQuestion=route.id;
     btn.dataset.catenaResearchReview=needs?"caution":"not-yet-assessed";
     researchPanel.append(btn);
    }
   }catch{
    if(researchOpen&&shell.isConnected){
     researchPanel.replaceChildren(element(d,"p",null,
      "Editorial question registry unavailable; original Messenger search remains available."));
    }
   }
  }
  async function showEditorialRoute(mod,registry,review,route){
   const busy=element(d,"p","aoCatenaMNotice","Checking original source excerpt and attribution…");
   feed.append(busy);
   try{
    const found=await mod.retrieveCatenaEditorialPassages(registry,route,{fetcher,cacheStorage,cryptoProvider});
    if(!shell.isConnected)return;
    busy.remove();
    feed.append(element(d,"div","aoCatenaMUser",route.question));
    note("EDITORIAL SOURCE LEAD · HUMAN APPROVAL PENDING · These original excerpts may illuminate the question but are not verified standalone answers. Distinct Father interpretations remain separate.");
    if(route.caution)note("Comparison context: "+route.caution);
    for(const ptr of route.sourcePointers){
     const item=review.byPointer.get(ptr);
     if(item)note("AI context review · "+item.inheritedFatherLabel+" · "+ptr+" · "+
      mod.catenaEditorialReviewLabel(item.AIContextAssessment)+". "+item.contextualWarning);
    }
    let added=0;
    for(const r of found){
     const other=!pericopes.some(p=>p.id===r.pericopeId);
     const item=review.byPointer.get(r.id);
     const disclaimer=item?{reviewLabel:mod.catenaEditorialReviewLabel(item.AIContextAssessment)}:null;
     if(message({...r,editorialContextReview:disclaimer,fromAnotherPassage:other,reference:r.citation}))added++;
    }
    if(!added)note("Relevant original excerpts are already shown, or have been withheld because source ownership could not be verified.");
   }catch{
    if(shell.isConnected){
     busy.remove();
     note("Could not verify all original excerpts for that research route. No attributed answer was substituted.");
    }
   }
  }
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
  if(catenaQuestionHasUnsupportedContext(query,rows)){
   note("The question contains concepts not attested in this passage. No Father is being presented as answering it.");
   return;
  }
  const matched=retrieveCatenaQuestionMatches(rows,query,{limit:4,excludeIds:seen});
  if(!matched.length){
   note("No verified matching source wording here. Searching other Gospel passages…");
   void searchElsewhere(query);return;
  }
  let fresh=0;for(const r of matched)if(message(r))fresh++;
  if(!fresh){
   const first=matched.find(r=>seen.has(r.id));
   const existing=first&&[...feed.querySelectorAll("[data-catena-fragment-id]")].find(
    node=>node.dataset.catenaFragmentId===first.id);
   if(existing){
    existing.classList.add("aoCatenaMRevisited");
    existing.scrollIntoView?.({behavior:"auto",block:"nearest"});
    note("The original excerpt is already above and has been highlighted; no new reply was composed.");
   }else note("The matching original extracts are already present earlier in the conversation.");
  }
 }
 function revealExistingSource(pointer){
  const el=[...feed.querySelectorAll("[data-catena-fragment-id]")].find(
   node=>node.dataset.catenaFragmentId===pointer);
  if(!el)return false;
  el.classList.add("aoCatenaMRevisited");
  el.scrollIntoView?.({behavior:"auto",block:"nearest"});
  return true;
 }
 function askPinned(item){
  feed.append(element(d,"div","aoCatenaMUser",item.question));
  lastQuestion=item.lookupTerm;wider.disabled=false;
  const source=rows.find(r=>r.id===item.sourcePointer);
  if(!source||!String(source.text).includes(item.sourceEvidence)){
   note("This question's original excerpt is no longer source-verifiable, so no attributed reply can be shown.");
   return;
  }
  note("Curated reading lead, not an independently approved Father answer. Showing the exact original excerpt and citation.");
  if(!message({...source,readerQuestionLink:item})){
   if(revealExistingSource(item.sourcePointer))
    note("The original excerpt is already above and has been highlighted without inventing another reply.");
   else note("Could not present the original excerpt with a verified attribution.");
  }
 }
 const questions=suggestCatenaQuestions(rows);
 if(questions.length){
  topics.append(element(d,"h5",null,"Explore this passage"));
  topics.append(element(d,"p",null,
   "Select a question to locate original texts, not composed replies."));
  const choices=element(d,"div","aoCatenaMTopicChoices");
  for(const item of questions){
   const b=action(d,item.question,()=>item.kind==="curated-source-pointer"
    ?askPinned(item):ask(item.lookupTerm,item.question));
   if(item.kind==="curated-source-pointer")b.dataset.catenaCuratedQuestion=item.id;
   b.dataset.catenaSourceQuestion=item.topic;
   b.dataset.catenaSourcePointer=item.sourcePointer;
   choices.append(b);
  }
  topics.append(choices);
 }
 form.addEventListener("submit",event=>{
  event.preventDefault();const query=input.value.trim();input.value="";ask(query);
 });
 message(rows[0]);const second=rows.find(r=>r.father!==rows[0].father);if(second)message(second);
 return Object.freeze({element:shell,total:rows.length});
}
