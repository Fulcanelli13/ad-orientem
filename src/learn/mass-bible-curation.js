// Source-checked Mass/Bible *editorial preview* inside the existing learn.mass reader.
// This is not a second Mass player, an approved publication or a Proper resolver.
export const MASS_BIBLE_CURATION_SCHEMAS=Object.freeze({
 selection:"AO_MASS_BIBLE_EDITORIAL_SELECTION_V1",
 primary:"AO_MASS_BIBLE_20_PRIMARY_POLISHED_BILINGUAL_V1",
 inline:"AO_MASS_BIBLE_9_INLINE_2_VARIABLE_V1"
});
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const validUrl=v=>typeof v==="string"&&/^https:\/\/[a-z0-9.-]+(?:[:][0-9]+)?(?:\/|$)/i.test(v);
const groups=[
 {id:"PREPARATION",en:"Preparation and the Word",fr:"Préparation et Parole",ids:["MB02","MB01","MB03","MB04","MB05","N01","MB08"]},
 {id:"OFFERTORY",en:"Offertory",fr:"Offertoire",ids:["N02","N03","N04","MB09","MB10"]},
 {id:"CANON",en:"Sanctus, Consecration and Canon",fr:"Sanctus, Consécration et Canon",ids:["MB11","MB12","MB13","MB14","MB15","MB16","MB17","MB18","MB19","MB20"]},
 {id:"COMMUNION",en:"Our Father and Communion",fr:"Notre Père et Communion",ids:["MB21","MB22","MB23","N05","MB24","MB25"]},
 {id:"CONCLUSION",en:"Conclusion",fr:"Conclusion",ids:["MB26"]}
];
const typeFor=k=>({
 DIRECT_SCRIPTURAL_WORDING:"text",SCRIPTURAL_WORDING_ADAPTED:"text",
 EXPLICIT_SCRIPTURAL_EVENT_REFERENCED_IN_LITURGICAL_PRAYER:"meaning",
 EXPLICIT_BIBLICAL_FIGURE:"figures",NARRATIVE_SCRIPTURE_CONNECTION:"meaning",
 DIRECT_SCRIPTURAL_WORDING_CONDITIONAL_RITE:"text",
 DIRECT_GOSPEL_WORDS_EMBEDDED_IN_ADDITIONAL_PRAYER:"text",
 DOCTRINAL_SCRIPTURE_CONNECTION:"meaning",INTERPRETIVE_BIBLICAL_TYPOLOGY:"meaning"
})[k]||"meaning";
const T=(fr,en,language)=>language==="fr"?fr:en;

// Escape all data before converting tightly constrained markdown URL references.
// No arbitrary HTML from research files is ever injected.
export function safeMassBibleLinkedText(value){
 const s=String(value??""),re=/\[([^\]\n]{1,120})\]\((https:\/\/[^\s()<>"]+)\)/g;
 let start=0,parts=[],match;
 while((match=re.exec(s))){
  parts.push(esc(s.slice(start,match.index)));
  if(validUrl(match[2]))parts.push('<a href="'+esc(match[2])+'" target="_blank" rel="noopener noreferrer">'+esc(match[1])+' ↗</a>');
  else parts.push(esc(match[0]));
  start=re.lastIndex;
 }
 parts.push(esc(s.slice(start)));
 return parts.join("");
}
const idsUnique=rows=>new Set(rows.map(x=>x.id)).size===rows.length;
export function validateCuratedMassBibleStudy(selection,primary,inline){
 if(selection?.schema!==MASS_BIBLE_CURATION_SCHEMAS.selection||
    primary?.schema!==MASS_BIBLE_CURATION_SCHEMAS.primary||
    inline?.schema!==MASS_BIBLE_CURATION_SCHEMAS.inline)return false;
 if(selection.status!=="EDITORIAL_SCOPE_SELECTED_NOT_PUBLICATION_APPROVED"||
    primary.status!=="EDITORIAL_RESEARCH_ACCEPTED_NOT_PUBLICATION"||
    inline.status!=="EDITORIAL_RESEARCH_COPY_ONLY"||primary.publicationApproved!==false)return false;
 const chosen=primary.records,notes=inline.inlineNotes,proper=inline.variableProper,decisions=selection.records;
 if(!Array.isArray(chosen)||chosen.length!==20||!idsUnique(chosen)||
    !Array.isArray(notes)||notes.length!==9||!idsUnique(notes)||
    !Array.isArray(proper)||proper.length!==2||!idsUnique(proper)||
    !Array.isArray(decisions)||decisions.length!==31||!idsUnique(decisions))return false;
 const chosenIds=new Set(chosen.map(x=>x.id)),noteIds=new Set(notes.map(x=>x.id)),properIds=new Set(proper.map(x=>x.id));
 if(properIds.size!==2||!properIds.has("MB06")||!properIds.has("MB07")||!proper.every(x=>x.releaseApproved===false&&x.sourceRegistryOwnedElsewhere===true))return false;
 if(chosen.some(x=>x.technicalPublicationApproved!==false||
   !x.french||!x.english||
   !Array.isArray(x.directSources)||
   !x.directSources.some(s=>s.role==="BIBLE_PASSAGE"&&validUrl(s.url))||
   !x.directSources.some(s=>s.role==="ORIGINAL_1962_VATICAN_MISSAL_PAGE"&&validUrl(s.url))||
   !x.french.includes("[Écriture](")||!x.english.includes("[Scripture](")))return false;
 if(notes.some(x=>x.releaseApproved!==false||!x.fr?.includes("[Écriture](")||
   !x.en?.includes("[Scripture](")||!validUrl(x.scriptureSource)||!validUrl(x.missalOriginal)))return false;
 for(const row of decisions){
  if(row.publicationApproved!==false)return false;
  const expected=chosenIds.has(row.id)?"FULL_TEACHING_ENTRY":noteIds.has(row.id)?"INLINE_COMPANION":
   properIds.has(row.id)?"DYNAMIC_PROPER_ONLY":null;
  if(!expected||row.disposition!==expected)return false;
 }
 const order=groups.flatMap(x=>x.ids);
 return order.length===29&&new Set(order).size===29&&order.every(x=>chosenIds.has(x)||noteIds.has(x));
}
export function renderCuratedMassBibleStudy(selection,primary,inline,{language="en",category="all",stage=""}={}){
 const lang=language==="fr"?"fr":"en";
 if(!validateCuratedMassBibleStudy(selection,primary,inline))
  return '<p class="aoMFError">'+esc(T(lang==="fr"?"Impossible de vérifier la sélection biblique.":"Curated biblical study is unavailable; source verification failed.",lang==="fr"?"Impossible de vérifier la sélection biblique.":"Curated biblical study is unavailable; source verification failed.",lang))+'</p>';
 const full=new Map(primary.records.map(x=>[x.id,x])),short=new Map(inline.inlineNotes.map(x=>[x.id,x]));
 const decisions=new Map(selection.records.map(x=>[x.id,x]));
 const categories=[["all","All connections","Tous les liens"],["text","Scriptural words","Paroles de l’Écriture"],
 ["figures","Biblical people","Personnages bibliques"],["meaning","Explanation and typology","Sens et typologie"]];
 const normalized=categories.some(x=>x[0]===category)?category:"all";
 const controls='<label class="aoMBMobileFilter">'+esc(T("Type de lien","Connection type",lang))+
  '<select data-ao-mf-bible-filter-select>'+categories.map(([id,en,fr])=>'<option value="'+id+'"'+(normalized===id?" selected":"")+'>'+esc(T(fr,en,lang))+'</option>').join("")+'</select></label>'+
  '<nav class="aoMBFilters" aria-label="'+esc(T("Filtrer les liens","Filter biblical links",lang))+'">'+
  categories.map(([id,en,fr])=>'<button type="button" data-ao-mf-bible-filter="'+id+'" aria-pressed="'+String(id===normalized)+'">'+esc(T(fr,en,lang))+'</button>').join("")+'</nav>'+
  '<label class="aoMBStageSelect">'+esc(T("Partie de la Messe","Part of Mass",lang))+
  '<select data-ao-mf-bible-stage><option value="">'+esc(T("Toutes les parties","All sections",lang))+'</option>'+
  groups.map(g=>'<option value="'+g.id+'"'+(stage===g.id?" selected":"")+'>'+esc(T(g.fr,g.en,lang))+'</option>').join("")+'</select></label>';
 let shown=0;
 const sections=groups.map(g=>{
  if(stage&&g.id!==stage)return "";
  const html=g.ids.map(id=>{
   const main=full.get(id),note=short.get(id),record=main||note;
   if(!record)return "";
   const cls=main?typeFor(main.classification):"meaning";
   if(normalized!=="all"&&cls!==normalized)return "";
   shown++;
   const raw=lang==="fr"?(main?.french||note?.fr):(main?.english||note?.en);
   const reason=decisions.get(id);
   return '<article class="aoMBConnection'+(note?' aoMBInline':'')+'" data-ao-mass-bible-row="'+esc(id)+'" data-evidence-type="'+esc(cls)+'">'+
    '<div class="aoMBEvidence">'+esc(T(note?"Complément":"Lien biblique","Biblical context":"Biblical study",lang))+'</div>'+
    '<h3>'+esc(reason?.moment||id)+'</h3>'+
    '<p>'+safeMassBibleLinkedText(raw)+'</p>'+
    (main?'<details><summary>'+esc(T("Lien, conditions et sources","Sources and liturgical conditions",lang))+'</summary>'+
       '<p class="aoMBQualification">'+esc(T("Texte de recherche, non homologué pour publication.","Research text; not approved for publication.",lang))+'</p>'+
       '<p class="aoMBQualification">'+esc(main.conditionalDisplay||"")+'</p></details>':"")+
    '</article>';
  }).join("");
  return html?'<section class="aoMBGroup"><h2>'+esc(T(g.fr,g.en,lang))+'</h2>'+html+'</section>':"";
 }).join("");
 const proper='<section class="aoMBGroup aoMBDynamic" data-ao-mass-bible-dynamic>'+
  '<h2>'+esc(T("Épître et Évangile du jour","Epistle and Gospel of the selected Mass",lang))+'</h2>'+
  '<p>'+esc(T("Ces lectures dépendent du propre effectivement choisi : aucun exemple biblique ne remplace la lecture du jour.","These readings depend on the actual selected Proper. A research example must never replace the Mass readings.",lang))+'</p>'+
  '<button type="button" data-ao-mf-open-propers>'+esc(T("Choisir un propre attesté","Choose a witnessed Proper",lang))+'</button></section>';
 return '<div class="aoMBStudy aoMBCurated" data-ao-mass-bible-curation>'+
  '<p class="aoMBResearch">'+esc(T("Aperçu éditorial · 20 explications, 9 compléments · non publié","Editorial research preview · 20 explanations, 9 notes · unpublished",lang))+'</p>'+
  controls+(shown?sections:'<p class="aoMFIntro">'+esc(T("Aucun lien pour ce filtre.","No entries match these filters.",lang))+'</p>')+proper+'</div>';
}
export function massBibleCurationCss(){
 return ".aoMBCurated .aoMBInline{padding:11px 15px;border-left:2px solid var(--liturgical,#c9ad78);background:transparent}.aoMBCurated .aoMBInline h3{font-size:1rem;margin:6px 0}.aoMBCurated .aoMBInline p{font-size:.87rem}.aoMBCurated .aoMBConnection a{color:var(--liturgical,#c9ad78);text-decoration:underline;text-underline-offset:3px}.aoMBCurated .aoMBQualification{font:12px/1.5 system-ui;color:var(--muted,#b6ae9c)}.aoMBDynamic{padding:16px 0}.aoMBDynamic p{line-height:1.55}.aoMBDynamic button{min-height:44px;border:1px solid var(--liturgical,#c9ad78);border-radius:9px;background:var(--ao-surface-1,#101821);color:inherit;padding:10px 14px;font:600 .83rem system-ui}";
}
