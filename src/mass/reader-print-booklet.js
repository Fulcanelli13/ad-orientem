// Canonical 30-Missal-section print projection for the ordinary 1962 Mass.
// Do not flatten 39-step source-first LIVE or product-48 cards:
// the LIVE source projection omits the distinct B061 Canon conclusion.
// Do not infer a Holy Week graph or claim a full rubrical Missal.
import {guideForSequence} from "./reader-guide.js";

const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const list=a=>Array.isArray(a)?a:[];
const keyLang=v=>String(v??"en").toLowerCase().startsWith("fr")?"fr":"en";
const nonempty=v=>typeof v==="string"&&Boolean(v.trim());
const modelSource=m=>m?.sourceAuthorityModel??m;
const unsupported=(prepared)=>{
 const mass=prepared?.session?.resolvedMass,plan=prepared?.session?.plan;
 if(!mass||plan?.kind!=="MASS")return "Not an ordinary Mass plan";
 if(!["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"].includes(mass.form))
   return "Mass form has not been audited for print";
 if(mass.distinctRite)return "Distinct liturgical rite requires its own print projection";
 for(const key of ["precedingRites","followingActions","overlays"]){
   if(list(mass[key]).length)return "Active "+key+" requires a rite-specific print projection";
 }
 for(const key of ["precedingGraphs","followingGraphs","overlayGraphs"]){
   if(list(plan[key]).length)return "Active "+key+" requires a rite-specific print projection";
 }
 if(plan.blessingAllowed===false||plan.normalLastGospel===false)
   return "Modified ending cannot use unqualified ordinary Mass print";
 if(plan.postcommunionExit?.mode==="PRAYER_OVER_PEOPLE")
   return "Prayer over the People requires special proper print";
 return null;
};
function translate(paragraph){
 // R17 projection: responses have Latin primary + vernacular secondary;
 // prayers have vernacular primary + Latin alternate.
 const primary=String(paragraph?.primary??"").trim();
 const second=String(paragraph?.secondary??"").trim();
 const alternate=String(paragraph?.alternate??"").trim();
 if(second&&alternate)throw new Error("Reader paragraph has conflicting language channels");
 return {latin:second?primary:alternate,vernacular:second||primary};
}
const isStageDirection=s=>/^\[[\p{Lu}][^\]]+\]$/u.test(String(s??"").trim());
export function assessMassTextPrint({prepared,model,guideRegistry=null,language=null}={}){
 const selected=keyLang(language??prepared?.readerPreferences?.language??"en");
 const denial=unsupported(prepared);
 if(denial)return Object.freeze({ok:false,reason:denial,language:selected});
 const source=modelSource(model);
 if(source?.schema!=="ao-mass-reader-model-v1"||source.totalCards!==30||
    source.structureOwner!=="BASE_30_MACROS"||!Array.isArray(source.cards)||
    source.cards.length!==30)return Object.freeze({ok:false,reason:"Canonical 30-card Missal reading model required",language:selected});
 if(source.corpusFamily!==(prepared.session.resolvedMass.form==="LOW"?"LOW":"SUNG"))
    return Object.freeze({ok:false,reason:"Reader form/corpus mismatch",language:selected});
 if(!nonempty(source.properSource))return Object.freeze({ok:false,reason:"Canonical Proper source missing",language:selected});
 if(guideRegistry?.schema!=="ao-r17-guide-registry-v1"||
    guideRegistry.status!=="RECOVERED_CONTINUITY_CERTIFIED")
    return Object.freeze({ok:false,reason:"Source-referenced rubric guide not ready",language:selected});
 const byBlock=new Set(),byCue=new Set(),cards=[],errors=[];
 for(const card of source.cards){
   const meta=list(card.blocks),all=list(card.paragraphs);
   if(!nonempty(card.sectionId)||!nonempty(card.title)||meta.length===0)errors.push("Section has no source blocks: "+String(card.sectionId));
   const seenIndices=new Set(),pages=[];
   for(const b of meta){
     if(!nonempty(b.blockId)||byBlock.has(b.blockId))errors.push("Missing/duplicate source block "+b.blockId);
     byBlock.add(b.blockId);
     const absentSlot=Boolean(b.properSlot&&source.properSlots?.slots?.[b.properSlot]?.status==="NOT_APPLICABLE");
     if(!b.stateOnly&&b.paragraphCount===0&&!absentSlot)
       errors.push("Source block has no text: "+b.blockId);
     if(b.firstParagraphIndex==null){
       if(b.paragraphCount)errors.push("Missing block offset "+b.blockId);
       continue;
     }
     for(let offset=0;offset<b.paragraphCount;offset++){
       const ix=b.firstParagraphIndex+offset;
       if(ix<0||ix>=all.length||seenIndices.has(ix))errors.push("Invalid paragraph ownership "+b.blockId+" index "+ix);
       seenIndices.add(ix);
     }
   }
   for(let ix=0;ix<all.length;ix++){
     const p=all[ix],owner=meta.find(b=>b.firstParagraphIndex!=null&&ix>=b.firstParagraphIndex&&ix<b.firstParagraphIndex+b.paragraphCount);
     if(!owner)errors.push("Unowned paragraph "+card.sectionId+" "+ix);
     let pair;try{pair=translate(p)}catch(e){errors.push(String(e.message));continue}
     const editorial=isStageDirection(pair.latin);
     if(!editorial&&(!nonempty(pair.latin)||!nonempty(pair.vernacular)))
       errors.push("Missing bilingual source text "+String(p.id));
     // Bracketed PRIEST_ACTION donor cues were inherited as English stage
     // directions in a 'latin' field: print as rubric, not Latin prayer.
     if(editorial&&!nonempty(pair.vernacular))errors.push("Missing action caption "+String(p.id));
     const cues=list(p.sourceCueIds).map(String);
     for(const cue of cues){
       if(byCue.has(cue))errors.push("Cue duplicated by source card "+cue);
       byCue.add(cue);
     }
     pages.push(Object.freeze({
       id:String(p.id??card.sectionId+"."+ix),
       blockId:owner?.blockId??null,
       latin:editorial?"":pair.latin,
       vernacular:pair.vernacular,
       direction:editorial,
       cueIds:Object.freeze(cues),
     }));
   }
   if(!all.length&&!meta.every(b=>b.stateOnly))
     errors.push("Empty source section "+card.sectionId);
   const seq=card.guideSequence??card.sourceSequence??card.sequence;
   let guide=null;
   try{guide=guideForSequence(guideRegistry,seq)}catch(e){errors.push("Missing canonical guide "+seq+": "+e.message)}
   if(!guide?.sourceLinks)errors.push("No rubric source links "+card.sectionId);
   cards.push(Object.freeze({id:card.sectionId,title:card.title,sequence:card.sequence,guide,paragraphs:Object.freeze(pages)}));
 }
 if(byBlock.size!==96)errors.push("Expected 96 unique canonical blocks, got "+byBlock.size);
 if(!byCue.has("AO.SM.C0206")||!byCue.has("AO.SM.C0207"))errors.push("Canon conclusion Per omnia/Amen (B061) missing");
 if(!byCue.size)errors.push("No source cue identities");
 const status=errors.length?Object.freeze({ok:false,reason:"Source completeness check failed",errors:Object.freeze(errors),language:selected})
   :Object.freeze({ok:true,reason:null,language:selected,cards:Object.freeze(cards),
     blockCount:byBlock.size,cueCount:byCue.size,properSource:source.properSource});
 return status;
}
export function renderMassTextPrintHtml(input={}){
 const a=assessMassTextPrint(input);
 if(!a.ok)throw new Error("1962 booklet withheld: "+a.reason+(a.errors?"; "+a.errors.slice(0,4).join("; "):""));
 const fr=a.language==="fr",mass=input.prepared.session.resolvedMass;
 const feast=String(mass.actualCelebration?.title||mass.calendarCelebration?.title||"1962 Roman Mass");
 const date=String(mass.date||"");
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error("1962 booklet requires a dated Mass");
 const paragraphs=card=>card.paragraphs.map(p=>
   p.direction?'<div class="direction" data-cue="'+escapeHtml(p.cueIds.join(" "))+'">'+escapeHtml(p.vernacular)+'</div>':
   '<div class="two" data-cue="'+escapeHtml(p.cueIds.join(" "))+'"><p lang="la">'+escapeHtml(p.latin)+'</p><p lang="'+a.language+'">'+escapeHtml(p.vernacular)+'</p></div>'
 ).join("");
 const sections=a.cards.map(card=>
   '<section class="section" id="section-'+escapeHtml(card.sequence)+'" data-section="'+escapeHtml(card.id)+'">'+
   '<h2>'+escapeHtml(card.title)+'</h2>'+paragraphs(card)+
   (card.guide?'<aside><b>'+(fr?"Guide (source anglaise)":"Reader guidance")+'</b>: '+escapeHtml(card.guide.text)+
    (card.guide.sourceLinks?'<small>'+escapeHtml(card.guide.sourceLinks)+'</small>':"")+'</aside>':"")+
   '</section>'
 ).join("");
 const css='@page{size:A4;margin:14mm}*{box-sizing:border-box}html{background:#f6f4f0;color:#181818}body{margin:auto;max-width:920px;padding:26px 20px;font:11pt/1.42 Georgia,serif}header{border-bottom:2px solid #292929;padding-bottom:13px;margin-bottom:22px}header h1{font-size:25px;line-height:1.2}header small,.section aside,.direction,footer{font-size:11px}header .scope{color:#555;font-size:12px}.section{break-inside:avoid-page;margin:0 0 23px}.section h2{font-size:16px;padding-bottom:5px;border-bottom:1px solid #aaa}.two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}.two p{white-space:pre-line;overflow-wrap:anywhere;margin:6px 0 12px}.direction{font-style:italic;color:#555;background:#eee;padding:5px 8px;margin:8px 0}.section aside{border-left:2px solid #aaa;margin-top:10px;padding:6px 10px;color:#555}.section aside small{display:block;overflow-wrap:anywhere}.toolbar{margin-bottom:14px}.toolbar button{background:#222;color:#fff;border:0;padding:10px 15px;border-radius:4px}footer{border-top:1px solid #888;padding-top:12px;overflow-wrap:anywhere}@media print{html{background:white}body{padding:0;max-width:none}.toolbar{display:none}}@media(max-width:560px){.two{grid-template-columns:1fr}.section{break-inside:auto}}';
 const notice=fr
  ?"Textes de l’Ordinaire et du Propre, édition de travail tirée du lecteur R17. Les rubriques détaillées, gestes et cérémonies particulières ne sont pas reproduits intégralement. Ce document n’est pas un missel liturgique certifié."
  :"Ordinary and Proper texts from the R17 reader. Detailed rubrics, gestures and exceptional ceremonies are not reproduced in full. This is not a certified complete liturgical Missal.";
 return '<!doctype html><html lang="'+a.language+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+
   escapeHtml(feast)+' — '+escapeHtml(date)+'</title><style>'+css+'</style></head><body>'+
   '<div class="toolbar"><button type="button" onclick="window.print()">'+(fr?"Imprimer / PDF":"Print / Save as PDF")+'</button></div>'+
   '<header><small>'+(fr?"MESSE ROMAINE DE 1962 · TEXTES DE LA MESSE":"1962 ROMAN MASS · TEXT BOOKLET")+'</small>'+
   '<h1>'+escapeHtml(feast)+'</h1><p>'+escapeHtml(date)+' · '+escapeHtml(mass.form)+'</p><p class="scope">'+escapeHtml(notice)+'</p></header>'+
   '<main>'+sections+'</main><footer>'+(fr?"Source du Propre":"Proper source")+': '+escapeHtml(a.properSource)+
   ' · R17 '+a.blockCount+' '+(fr?"blocs canoniques":"canonical blocks")+
   ' · '+a.cueCount+' '+(fr?"identifiants de répliques":"source cue identifiers")+
   ' · '+a.cards.length+' '+(fr?"sections":"sections")+'</footer></body></html>';
}
