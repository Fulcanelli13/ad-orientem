// Existing learn.mass owner extension: biblical source layers, not a second Mass reader.
export const MASS_BIBLE_STUDY_SCHEMA="AO_MASS_BIBLE_SOURCE_LAYERS_V1";
export const MASS_BIBLE_HOLD="EDITORIAL_STUDY_PREVIEW_NOT_1962_WORD_FOR_WORD_CERTIFIED";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const arr=v=>Array.isArray(v)?v:[];
const L=(lang,en,fr)=>lang==="fr"?fr:en;
const goodUrl=u=>typeof u==="string"&&/^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(u);
const GROUPS=Object.freeze([
 ["PREPARATION","Preparation","Préparation"],
 ["WORD","Liturgy of the Word","Liturgie de la Parole"],
 ["OFFERTORY","Offertory","Offertoire"],
 ["CANON","Canon","Canon"],
 ["CONSECRATION","Consecration","Consécration"],
 ["SACRIFICE","Sacrifice and typology","Sacrifice et typologie"],
 ["COMMUNION","Communion","Communion"],
 ["CONCLUSION","Conclusion","Conclusion"]
]);
const CLASSES=Object.freeze({
 DIRECT_SCRIPTURAL_WORDING:["Biblical words in the rite","Texte biblique repris dans le rite","text"],
 SCRIPTURAL_WORDING_ADAPTED:["Adapted scriptural words","Paroles bibliques adaptées","text"],
 EXPLICIT_BIBLICAL_FIGURE:["Biblical person named in the Mass","Personnage biblique nommé dans la Messe","names"],
 VARIABLE_PROPER_READING:["Proper reading — variable","Lecture du propre — variable","variable"],
 VARIABLE_RITE_SCRIPTURE_READING:["Rite-dependent Gospel","Évangile propre au rite","variable"],
 NARRATIVE_SCRIPTURE_CONNECTION:["Biblical narrative connection","Lien avec un récit biblique","interpretation"],
 DOCTRINAL_SCRIPTURE_CONNECTION:["Doctrinal connection","Lien doctrinal","interpretation"],
 SCRIPTURAL_PARALLEL_NOT_QUOTATION:["Comparison — not a quotation","Rapprochement — non une citation","interpretation"],
 INTERPRETIVE_BIBLICAL_TYPOLOGY:["Biblical typology","Typologie biblique","interpretation"]
});
const OPTIONS=Object.freeze([
 ["all","All connections","Tous les liens"],
 ["text","Biblical wording","Formules bibliques"],
 ["names","Named biblical figures","Personnages bibliques"],
 ["interpretation","Interpretations","Interprétations"],
 ["variable","Variable readings","Lectures variables"]
]);
export function validateMassBibleStudy(data){
 if(data?.schema!==MASS_BIBLE_STUDY_SCHEMA||data?.status!==MASS_BIBLE_HOLD||arr(data.rows).length!==26||arr(data.reviewHolds).length!==4)return false;
 if(data?.sourcePolicy?.rightAndCanon?.includes("No automatically published")!==true)return false;
 const seen=new Set();
 for(const row of data.rows){
  if(!row.id||seen.has(row.id)||!CLASSES[row.classification]||!GROUPS.some(g=>g[0]===row.group)||
   !/^MF0[1-8]$/.test(row.formationStage)||!row.liturgicalCue||
   !row.reading?.en||!row.reading?.fr||!row.scriptureReference||arr(row.sourceLinks).length<2||
   !row.sourceLinks.some(s=>s.role==="1962_MISSAL_ORDER_AND_TEXT"&&goodUrl(s.url))||
   !row.sourceLinks.some(s=>s.role==="BIBLICAL_CONTEXT"&&goodUrl(s.url)))return false;
  seen.add(row.id);
 }
 return data.reviewHolds.every(h=>h.public===false);
}
export function massBibleRows(data,{category="all",stage=""}={}){
 if(!validateMassBibleStudy(data))return [];
 const selected=OPTIONS.some(x=>x[0]===category)?category:"all";
 return data.rows.filter(row=>(selected==="all"||CLASSES[row.classification][2]===selected)&&(!stage||row.group===stage));
}
export function validateProperWitnesses(first,second,segmented){
 const all=[...arr(first?.celebrations),...arr(second?.celebrations)];
 if(first?.status!=="EXTERNAL_MISSAL_READING_CITATIONS_WITH_LATIN_IDENTITY_GUARD"||
    second?.status!=="SOURCE_GATED_MAJOR_FEASTS_HOLY_WEEK_EMBER_AND_26_ORDINARY_LENTEN_WEEKDAYS"||
    segmented?.status!=="SOURCE_VERIFIED_EXACT_PROPER_AND_LATIN_GATED"||
    all.length!==105||new Set(all.map(x=>x.sourcePath)).size!==105||arr(segmented.readings).length!==15)return false;
 return all.every(row=>row.sourcePath&&goodUrl(row.witnessUrl)&&Object.values(row.readings||{}).every(r=>r.reference&&r.latinIncipit));
}
export function properReadingIndex(first,second,segmented){
 if(!validateProperWitnesses(first,second,segmented))return [];
 return [...first.celebrations,...second.celebrations].map(row=>({
  sourcePath:row.sourcePath,title:row.title,witnessUrl:row.witnessUrl,
  slots:["EPISTLE_OR_LESSON","GOSPEL"].filter(slot=>row.readings?.[slot]).map(slot=>({
   slot,reference:row.readings[slot].reference,latinIncipit:row.readings[slot].latinIncipit
  })),
  segmented:segmented.readings.filter(x=>x.sourcePath===row.sourcePath).map(x=>({
   slot:x.slot,reference:x.reference,latinIncipit:x.latinIncipit,
   witnessUrl:x.witnessUrl
  })),
  holds:arr(row.sourceHolds).map(x=>({slot:x.slot,reason:x.reason}))
 })).sort((a,b)=>a.sourcePath.localeCompare(b.sourcePath));
}
export function renderMassBibleStudy(data,{language="en",category="all",stage=""}={}){
 const lang=language==="fr"?"fr":"en",good=validateMassBibleStudy(data);
 if(!good)return '<p class="aoMFError">'+esc(L(lang,"Biblical study research unavailable; existing Mass formation remains accessible.","Recherche biblique indisponible ; la formation sur la Messe reste accessible."))+'</p>';
 const selected=OPTIONS.some(x=>x[0]===category)?category:"all";
 const count=massBibleRows(data,{category:selected,stage});
 const selections='<label class="aoMBMobileFilter">'+esc(L(lang,"Type of biblical connection","Type de lien biblique"))+
 '<select data-ao-mf-bible-filter-select aria-label="'+esc(L(lang,"Filter evidence type","Filtrer les preuves"))+'">'+
 OPTIONS.map(([id,en,fr])=>'<option value="'+id+'"'+(id===selected?' selected':'')+'>'+esc(L(lang,en,fr))+'</option>').join("")+'</select></label>'+ 
 '<nav class="aoMBFilters" aria-label="'+esc(L(lang,"Evidence types","Catégories de preuves"))+'">'+
 OPTIONS.map(([id,en,fr])=>'<button type="button" data-ao-mf-bible-filter="'+id+'" aria-pressed="'+String(id===selected)+'">'+esc(L(lang,en,fr))+'</button>').join("")+'</nav>';
 const filter='<label class="aoMBStageSelect">'+esc(L(lang,"Part of the Mass","Partie de la Messe"))+
 '<select data-ao-mf-bible-stage aria-label="'+esc(L(lang,"Filter Mass stage","Filtrer les étapes de la Messe"))+'"><option value="">'+esc(L(lang,"All stages","Toutes les étapes"))+'</option>'+
 GROUPS.map(([key,en,fr])=>'<option value="'+key+'"'+(stage===key?' selected':'')+'>'+esc(L(lang,en,fr))+'</option>').join("")+'</select></label>';
 const byStage=GROUPS.map(([key,en,fr])=>{
  const rows=count.filter(row=>row.group===key);
  if(!rows.length)return "";
  return '<section class="aoMBGroup"><h2>'+esc(L(lang,en,fr))+'</h2>'+rows.map(row=>{
   const kind=CLASSES[row.classification],phrase=row.liturgicalCue;
   const links=row.sourceLinks.map(l=>'<a href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer">'+
    esc(l.role==="BIBLICAL_CONTEXT"?row.scriptureReference:L(lang,"1962 Missal source","Missel de 1962"))+' ↗</a>').join("");
   return '<article class="aoMBConnection" data-ao-mass-bible-row="'+esc(row.id)+'" data-evidence-type="'+esc(kind[2])+'">'+
     '<div class="aoMBEvidence">'+esc(L(lang,kind[0],kind[1]))+'</div>'+
     '<h3>'+esc(row.liturgicalMoment)+'</h3><p class="aoMBLatin">'+esc(phrase)+'</p>'+
     '<p>'+esc(L(lang,row.reading.en,row.reading.fr))+'</p>'+ 
     (row.scriptureReaderRef?'<button type="button" class="aoMBReadBible" data-ao-scripture-context="'+esc(row.scriptureReaderRef)+'">'+esc(L(lang,"Open biblical context · ","Ouvrir le contexte biblique · "))+esc(row.scriptureReaderRef)+'</button>':"")+
     '<details><summary>'+esc(L(lang,"Evidence, original sources and limits","Justification, sources originales et limites"))+'</summary>'+
       '<div class="aoMBLinks">'+links+'</div>'+
       (row.qualification?'<small>'+esc(row.qualification.replaceAll("_"," ").toLowerCase())+'</small>':"")+
       '</details></article>';
  }).join("")+'</section>';
 }).join("");
 return '<div class="aoMBStudy" data-ao-mass-bible-study><details class="aoMBResearch aoMBResearchDetails"><summary>'+ 
 esc(L(lang,"Source-linked research preview · 26 biblical connections","Aperçu de recherche sourcée · 26 liens bibliques"))+'</summary><p>'+ 
 esc(L(lang,"Biblical wording, typology and meditations are separate layers. The Missal and original Bible editions still require word-level collation; LIVE Mass readings and gestures are unchanged.","Texte biblique, typologie et méditations sont distincts. Le Missel et les éditions bibliques originales attendent une collation mot à mot ; lectures et gestes de la Messe LIVE ne sont pas modifiés."))+'</p></details>'+ 
 selections+filter+byStage+'</div>';
}
export function renderMassProperWitnessStudy(index,{language="en",sourcePath=""}={}){
 const lang=language==="fr"?"fr":"en";
 if(!Array.isArray(index)||index.length!==105)return '<p class="aoMFError">'+esc(L(lang,"Missal reading witness index unavailable.","Registre des lectures du Missel indisponible."))+'</p>';
 const chosen=index.find(x=>x.sourcePath===sourcePath)||index[0];
 return '<div class="aoMBProper" data-ao-mass-bible-propers><details class="aoMBResearch aoMBResearchDetails"><summary>'+ 
 esc(L(lang,"Source-indexed 1962 Proper study · not today's Mass","Étude des propres de 1962 · non la Messe du jour"))+'</summary><p>'+ 
 esc(L(lang,"105 source-path-specific Proper witnesses; the selected Proper and matching original Latin incipit are required for an actual reading.","105 propres identifiés par source ; le propre choisi et l’incipit latin original concordant sont requis pour une lecture réelle."))+'</p></details>'+
 '<label class="aoMBStageSelect">'+esc(L(lang,"1962 Proper source","Source du propre de 1962"))+
 '<select data-ao-mf-bible-proper aria-label="'+esc(L(lang,"Select witnessed Proper","Choisir un propre attesté"))+'">'+
 index.map(r=>'<option value="'+esc(r.sourcePath)+'"'+(r.sourcePath===chosen.sourcePath?' selected':'')+'>'+esc(r.title)+' — '+esc(r.sourcePath)+'</option>').join("")+'</select></label>'+
 '<h2>'+esc(chosen.title)+'</h2><p class="aoMBSourcePath">'+esc(chosen.sourcePath)+'</p>'+
 '<div class="aoMBLinks"><a href="'+esc(chosen.witnessUrl)+'" target="_blank" rel="noopener noreferrer">'+esc(L(lang,"Original Proper witness","Témoin original du propre"))+' ↗</a></div>'+
 chosen.slots.map(r=>'<article class="aoMBConnection"><div class="aoMBEvidence">'+esc(r.slot==="GOSPEL"?L(lang,"Gospel","Évangile"):L(lang,"Epistle / Lesson","Épître / Leçon"))+'</div>'+
 '<h3>'+esc(r.reference)+'</h3><p class="aoMBLatin">'+esc(r.latinIncipit)+'</p></article>').join("")+
 (chosen.segmented.length?'<p class="aoMBResearch">'+esc(L(lang,"Segmented or discontinuous passages require the special ordered-source registry; do not convert these into one continuous reading.","Les passages discontinus exigent le registre spécial des segments dans leur ordre original ; ne pas les fusionner."))+'</p>':"")+
 chosen.holds.map(h=>'<p class="aoMBResearch">'+esc(L(lang,"Source hold","Réserve de source"))+': '+esc(h.slot)+' — '+esc(h.reason.replaceAll("_"," "))+'</p>').join("")+
 '</div>';
}
export function massBibleStudyCss(){
 return [
 ".aoMBMobileFilter{display:none}.aoMBStudy,.aoMBProper{max-width:800px;margin:0 auto}.aoMBResearch{font:12px/1.6 var(--ao-font-ui,system-ui);color:var(--muted,#b6ae9c);border-left:2px solid #9c865c;background:#15191f;padding:11px 13px}.aoMBResearch strong{display:block;color:#e5c994}.aoMBResearchDetails summary{font:600 12px/1.4 system-ui;color:#e5c994;cursor:pointer}.aoMBResearchDetails p{font:12px/1.55 system-ui;color:#c7baa8;margin:10px 0 0}",
 ".aoMBFilters{display:flex;gap:7px;overflow-x:auto;padding:12px 0;scrollbar-width:thin}.aoMBFilters button{flex:none;min-height:44px;padding:9px 12px;border:1px solid #9c865c66;border-radius:8px;background:#151d28;color:#dacbb2;font:600 12px system-ui}.aoMBFilters button[aria-pressed=true]{border-color:#c9ae75;background:#332f27;color:#f4e2bb}",
 ".aoMBStageSelect{display:grid;gap:8px;margin:12px 0 22px;font:600 12px system-ui;color:#bda782}.aoMBStageSelect select{max-width:100%;width:100%;min-height:44px;border:1px solid #a48c6177;border-radius:8px;background:#101821;color:#f3e4ce;padding:9px;font:13px system-ui}",
 ".aoMBGroup{padding:10px 0 4px;border-top:1px solid #c9ae7526}.aoMBGroup h2,.aoMBProper h2{font:500 25px Georgia,serif;margin:12px 0;color:#efe0c5}.aoMBConnection{margin:12px 0;padding:16px 17px;background:#111922;border:1px solid #b69c6d33;border-radius:12px}.aoMBEvidence{font:600 10px system-ui;letter-spacing:.1em;text-transform:uppercase;color:#bfa479}.aoMBConnection h3{font:500 19px/1.3 Georgia,serif;margin:9px 0}.aoMBConnection p{font:14px/1.6 Georgia,serif;color:#d9cdba}.aoMBConnection p.aoMBLatin{font:italic 16px/1.5 Georgia,serif;color:#eed9ac}.aoMBReadBible{display:inline-flex;align-items:center;text-align:left;min-height:44px;border:1px solid #c3a77277;background:#2c291e;color:#f0d9ab;border-radius:8px;padding:9px 12px;margin-top:7px;font:600 12px/1.4 system-ui;max-width:100%}.aoMBConnection details{margin-top:14px}.aoMBConnection summary{cursor:pointer;color:#e2c58b;font:600 12px system-ui}.aoMBConnection small{font:11px/1.5 system-ui;color:#aa9c89}.aoMBLinks{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.aoMBLinks a{color:#e5c994;min-height:36px;display:inline-flex;align-items:center;font:12px/1.5 system-ui;border:1px solid #a48c6177;border-radius:8px;text-decoration:none;padding:8px 10px}.aoMBSourcePath{font:12px system-ui;color:#bdaa83}",
 "@media(max-width:480px){.aoMBFilters{display:none}.aoMBMobileFilter{display:grid;gap:6px;margin:12px 0 6px;font:600 12px system-ui;color:#bda782}.aoMBMobileFilter select{width:100%;min-height:44px;padding:9px 10px;border:1px solid #a48c6177;border-radius:8px;background:#101821;color:#f3e4ce;font:13px system-ui}.aoMBResearch{padding:8px 11px}.aoMBStageSelect{margin:11px 0 16px}.aoMBConnection{padding:14px}}"
 ].join("\n");
}
