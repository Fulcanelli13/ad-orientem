// Source-owned Mass texts preview for the M1 preflight. No parallel Proper
// parser: each paragraph comes from the existing R17 reader slot projection.
// This component is read-only. Only the established Start action begins R17.
import {properToReaderSlots,READER_PROPER_SLOTS} from "./proper-reader-slots.js";

const LABELS=Object.freeze({
 INTROIT:["Introit","Introït"],
 COLLECT_SET:["Collect","Collecte"],
 EPISTLE_OR_LESSON:["Epistle or lesson","Épître ou leçon"],
 GRADUAL:["Gradual","Graduel"],
 ALLELUIA_TRACT_SEQUENCE:["Alleluia, Tract or Sequence","Alléluia, trait ou séquence"],
 GOSPEL:["Gospel","Évangile"],
 OFFERTORY:["Offertory","Offertoire"],
 SECRET_SET:["Secret","Secrète"],
 PREFACE:["Preface","Préface"],
 COMMUNION:["Communion","Communion"],
 POSTCOMMUNION_SET:["Postcommunion","Postcommunion"],
});
export const MASS_TEXTS_SHEET_VERSION="mass-texts-sheet-b3-v1";
const STYLE_ID="ao-mass-texts-sheet-styles";
function tr(fr,en,french){return fr?french:en}
function dateTitle(value,fr){
 const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value??""));
 if(!match)return "";
 const date=new Date(Date.UTC(+match[1],+match[2]-1,+match[3],12));
 if(date.getUTCFullYear()!==+match[1]||date.getUTCMonth()!==+match[2]-1||date.getUTCDate()!==+match[3])return "";
 return new Intl.DateTimeFormat(fr?"fr-FR":"en-GB",{timeZone:"UTC",weekday:"long",day:"numeric",month:"long"}).format(date);
}

export function composeMassTextsSheet({proper,language="en",date="",title="",sourceReady=true}={}){
 const fr=language==="fr";
 const heading=tr(fr,"Mass texts","Textes de la messe");
 const titleText=String(title||tr(fr,"Mass of the day","Messe du jour"));
 if(!sourceReady||!proper||typeof proper!=="object")
  return Object.freeze({heading,title:titleText,date:dateTitle(date,fr),
   available:false,sections:Object.freeze([])});
 let mapped;
 try{mapped=properToReaderSlots(proper,{language:fr?"fr":"en"});}
 catch{return Object.freeze({heading,title:titleText,date:dateTitle(date,fr),
   available:false,sections:Object.freeze([])});}
 const sections=READER_PROPER_SLOTS.map((id)=>{
   const item=mapped.slots[id];
   const ready=item?.status==="READY";
   return Object.freeze({
     id,label:LABELS[id]?.[fr?1:0]??id,
     status:item?.status??"MISSING",
     paragraphs:Object.freeze(ready?(item.data?.paragraphs??[]).map(row=>
       Object.freeze({latin:String(row.latin??""),vernacular:String(row.vernacular??"")})):[])
   });
 }).filter(section=>section.status!=="NOT_APPLICABLE");
 return Object.freeze({
   heading,title:titleText,date:dateTitle(date,fr),
   available:sections.some(section=>section.status==="READY"),
   fullyReady:Boolean(mapped.ready),sections:Object.freeze(sections),
 });
}

function installStyle(doc){
 if(doc.getElementById(STYLE_ID))return;
 const style=doc.createElement("style");
 style.id=STYLE_ID;
 style.textContent=`
.aoMassTextsOverlay{position:fixed;inset:0;z-index:var(--ao-z-modal,2147483200);display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.55)}
.aoMassTextsSheet{box-sizing:border-box;width:min(560px,100%);max-height:90dvh;max-height:90vh;display:flex;flex-direction:column;min-width:0;overflow:hidden;border-radius:20px 20px 0 0;border:1px solid var(--line,var(--ao-rule,#24303b));background:var(--surface,var(--ao-surface-1,#121a22));color:var(--ink,var(--ao-text-primary,#f1ebe1));box-shadow:0 -8px 24px rgba(0,0,0,.30)}
.aoMassTextsGrip{flex:none;width:36px;height:4px;border-radius:4px;margin:8px auto 4px;background:var(--mute,var(--ao-text-muted,#98a1ab))}
.aoMassTextsHeader{flex:none;display:flex;align-items:center;gap:4px;min-height:52px;padding:0 12px;border-bottom:1px solid var(--line,var(--ao-rule,#24303b));min-width:0}
.aoMassTextsHeader button{flex:0 0 44px;width:44px;height:44px;min-width:44px;min-height:44px;padding:0;border:0;border-radius:12px;background:transparent;color:inherit;font:500 24px/1 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}
.aoMassTextsHeader h2{flex:1 1 auto;min-width:0;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:500 22px/1.2 var(--ao-font-display,Georgia,serif);color:inherit}
.aoMassTextsBody{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:16px 18px 22px}
.aoMassTextsDate{margin:0 0 8px;color:var(--mute,var(--ao-text-muted,#98a1ab));font:400 13px/1.3 system-ui,sans-serif}
.aoMassTextsTitle{font:500 22px/1.2 var(--ao-font-display,Georgia,serif);margin:0 0 16px;overflow-wrap:anywhere}
.aoMassTextsSection{border-top:1px solid var(--line,var(--ao-rule,#24303b));margin:0;padding:0}
.aoMassTextsSection>summary{display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:52px;padding:9px 0;cursor:pointer;list-style:none;font:500 17px/1.25 var(--ao-font-display,Georgia,serif)}
.aoMassTextsSection>summary::-webkit-details-marker{display:none}
.aoMassTextsSection>summary:after{content:"▾";font:400 16px/1 system-ui,sans-serif;color:var(--mute,var(--ao-text-muted,#98a1ab))}
.aoMassTextsSection[open]>summary:after{content:"▴"}
.aoMassTextsParagraph{margin:0 0 15px;display:grid;grid-template-columns:minmax(0,1fr);gap:9px;font:400 16px/1.55 var(--ao-font-body,Georgia,serif)}
.aoMassTextsParagraph p{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}
.aoMassTextsParagraph [lang="la"]{color:var(--ink,var(--ao-text-primary,#f1ebe1))}
.aoMassTextsParagraph [data-vernacular]{color:var(--ink-2,var(--ao-text-muted,#cfc6b8))}
.aoMassTextsUnavailable{padding:12px 0;color:var(--mute,var(--ao-text-muted,#98a1ab));font:400 16px/1.5 var(--ao-font-body,Georgia,serif)}
.aoMassTextsFooter{flex:none;margin:0;padding:12px 18px max(14px,env(safe-area-inset-bottom,14px));border-top:1px solid var(--line,var(--ao-rule,#24303b));color:var(--mute,var(--ao-text-muted,#98a1ab));font:400 13px/1.35 system-ui,sans-serif}
.aoMassTextsOpen{min-height:44px;display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line,var(--ao-rule,#24303b));border-radius:22px;padding:8px 15px;background:transparent;color:var(--ink,var(--ao-text-primary,#f1ebe1));font:500 15px/1.2 var(--ao-font-display,Georgia,serif)}
.aoMassTextsOpen:focus-visible,.aoMassTextsHeader button:focus-visible,.aoMassTextsSection>summary:focus-visible{outline:2px solid var(--sage,var(--ao-liturgical-accent,#86b596));outline-offset:2px}
@media(min-width:700px){.aoMassTextsParagraph{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}}
@media(prefers-reduced-motion:reduce){.aoMassTextsSheet{scroll-behavior:auto}}
`;
 (doc.head??doc.documentElement).append(style);
}

export function openMassTextsSheet(doc,options={}){
 if(!doc?.body||!doc.createElement)return null;
 const model=composeMassTextsSheet(options);
 const fr=options.language==="fr";
 installStyle(doc);
 doc.querySelector(".aoMassTextsOverlay")?.remove();
 const opener=options.opener??doc.activeElement;
 const overlay=doc.createElement("div");
 overlay.className="aoMassTextsOverlay";
 overlay.dataset.aoMassTextsSheet=MASS_TEXTS_SHEET_VERSION;
 const sheet=doc.createElement("section");
 sheet.className="aoMassTextsSheet";
 sheet.setAttribute("role","dialog");
 sheet.setAttribute("aria-modal","true");
 const titleId="ao-mass-texts-title";
 sheet.setAttribute("aria-labelledby",titleId);
 const grip=doc.createElement("div");
 grip.className="aoMassTextsGrip";
 grip.setAttribute("aria-hidden","true");
 const header=doc.createElement("header");header.className="aoMassTextsHeader";
 const back=doc.createElement("button");back.type="button";
 back.dataset.massTextsClose="";
 back.setAttribute("aria-label",tr(fr,"Back to Mass","Retour à la messe"));
 back.textContent="←";
 const heading=doc.createElement("h2");heading.id=titleId;heading.textContent=model.heading;
 header.append(back,heading);
 const body=doc.createElement("div");body.className="aoMassTextsBody";
 if(model.date){const date=doc.createElement("p");date.className="aoMassTextsDate";date.textContent=model.date;body.append(date);}
 const subject=doc.createElement("h3");subject.className="aoMassTextsTitle";subject.textContent=model.title;body.append(subject);
 if(!model.available){
   const error=doc.createElement("p");error.className="aoMassTextsUnavailable";
   error.textContent=tr(fr,"Mass texts are not yet available from the selected source.","Les textes de la messe ne sont pas encore disponibles pour le propre choisi.");
   body.append(error);
 }
 let first=true;
 for(const part of model.sections){
  const details=doc.createElement("details");
  details.className="aoMassTextsSection";
  details.dataset.massTextsSlot=part.id;
  if(first&&part.status==="READY"){details.open=true;first=false;}
  const summary=doc.createElement("summary");summary.textContent=part.label;details.append(summary);
  if(part.status!=="READY"){
   const missing=doc.createElement("p");missing.className="aoMassTextsUnavailable";
   missing.textContent=tr(fr,"Not available from this source.","Non disponible dans cette source.");
   details.append(missing);
  }else for(const para of part.paragraphs){
   const pair=doc.createElement("div");pair.className="aoMassTextsParagraph";
   const latin=doc.createElement("p");latin.lang="la";latin.textContent=para.latin;
   const vernacular=doc.createElement("p");vernacular.lang=fr?"fr":"en";vernacular.dataset.vernacular="";vernacular.textContent=para.vernacular;
   pair.append(latin,vernacular);details.append(pair);
  }
  body.append(details);
 }
 const footer=doc.createElement("p");footer.className="aoMassTextsFooter";
 footer.textContent=tr(fr,"Read-only preview · Begin Mass from the Mass page.","Aperçu en lecture seule · Commencez la messe depuis la page Messe.");
 sheet.append(grip,header,body,footer);overlay.append(sheet);doc.body.append(overlay);
 const close=()=>{
   overlay.removeEventListener("click",onClick);
   doc.removeEventListener("keydown",onKey,true);
   overlay.remove();
   if(opener?.isConnected)try{opener.focus({preventScroll:true})}catch{}
 };
 const onClick=e=>{if(e.target===overlay||e.target.closest?.("[data-mass-texts-close]"))close();};
 const onKey=e=>{
   if(e.key==="Escape"){e.preventDefault();e.stopImmediatePropagation();close();return;}
   if(e.key!=="Tab")return;
   const focusables=[...sheet.querySelectorAll("button,summary")].filter(el=>el.getClientRects().length);
   if(!focusables.length)return;
   const firstEl=focusables[0],last=focusables.at(-1);
   if(e.shiftKey&&doc.activeElement===firstEl){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&doc.activeElement===last){e.preventDefault();firstEl.focus();}
 };
 overlay.addEventListener("click",onClick);
 doc.addEventListener("keydown",onKey,true);
 back.focus({preventScroll:true});
 return Object.freeze({close,model,root:overlay});
}
