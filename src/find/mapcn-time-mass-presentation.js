// Visual pattern adapted from MapCN Uptime Monitor. Source-owned Mass board.
// Does not claim real-time church status, next Mass, or a canonical daily Ordo.
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L=(language,en,fr)=>language==="fr"?fr:en;
const LABELS={
 SOURCE_REVIEW_CURRENT:["Source within review window","Source dans le délai de révision"],
 SOURCE_ATTESTED:["Source checked · review date unknown","Source contrôlée · prochaine révision inconnue"],
 REVIEW_DUE:["Source review overdue","Révision de la source en retard"],
 RAW_UNCONFIRMED:["Published wording · unverified","Texte publié · non vérifié"],
 LISTING_ONLY:["Listing only · no usable timetable","Lieu répertorié · horaires indisponibles"],
};
const order=["ALL","SOURCE_REVIEW_CURRENT","SOURCE_ATTESTED","REVIEW_DUE","RAW_UNCONFIRMED","LISTING_ONLY"];
const opts=(lang,status,count)=>order.map(code=>{
 const title=code==="ALL"?L(lang,"All locations","Tous les lieux"):L(lang,...LABELS[code]);
 return '<option value="'+code+'"'+(status===code?" selected":"")+'>'+esc(title)
   +(code==="ALL"?"":" · "+String(count?.[code]??0))+'</option>';
}).join("");
export function renderTimeMassPanel({board,language="en",filters={}}={}){
 if(!board)return "";
 let html='<section class="aoTimeMassPanel" data-explore-time-mass-panel aria-label="'+
  esc(L(language,"Time and Mass","Temps liturgique et messes"))+'">';
 html+='<header class="aoTimeMassHead"><div><small>'+L(language,"MAPCN · LITURGICAL TIME","MAPCN · TEMPS LITURGIQUE")+'</small>'
   +'<h2>'+L(language,"Time & Mass","Temps liturgique et messes")+'</h2></div>'
   +'<button type="button" data-explore-time-mass-toggle aria-label="'+L(language,"Close Time and Mass","Fermer Temps et messes")+'">×</button></header>';
 html+='<div class="aoTimeMassScroll"><section class="aoTimeMassSeason" data-season-colour="'+
   esc(board.seasonColour)+'"><div class="aoTimeMassSeasonAccent" aria-hidden="true"></div>'
   +'<small>'+esc(board.yearLabel)+' · '+L(language,"1962 LITURGICAL SEASON","TEMPS LITURGIQUE 1962")+'</small>'
   +'<h3>'+esc(board.season)+'</h3><p>'+esc(board.seasonSummary)+'</p>';
 if(board.nextPeriod)html+='<span>'+L(language,"Next seasonal transition","Prochain changement de temps")+
   ' · '+esc(board.nextPeriod.date)+' · '+esc(board.nextPeriod.name)+'</span>';
 html+='</section><div class="aoTimeMassFields"><label>'+L(language,"Choose date","Choisir la date")+
  '<input data-explore-time-mass-date type="date" min="1900-01-01" max="2099-12-31" value="'+esc(board.date)+'"></label>'
  +'<button type="button" data-explore-time-mass-calendar>'+L(language,"Open the 1962 Calendar","Ouvrir le calendrier de 1962")+' ↗</button></div>';
 html+='<p class="aoTimeMassNotice">'+L(language,
   "The selected date changes the liturgical season only. Calendar resolves the exact feast. Published schedules below are not filtered by presumed daily occurrences.",
   "La date choisie change uniquement le temps liturgique. Le calendrier détermine la fête exacte. Les horaires ci-dessous ne sont pas filtrés selon des célébrations supposées.")+'</p>';
 html+='<div class="aoTimeMassMetrics"><div><small>'+L(language,"Listed venues","Lieux répertoriés")+
   '</small><strong>'+board.total+'</strong></div><div><small>'+L(language,"Within review window","Révision en cours de validité")+
   '</small><strong>'+board.counts.SOURCE_REVIEW_CURRENT+'</strong></div><div><small>'+L(language,"Require checking","À revérifier")+
   '</small><strong>'+(board.total-board.counts.SOURCE_REVIEW_CURRENT)+'</strong></div></div>';
 html+='<div class="aoTimeMassFilters"><label>'+L(language,"Search by chapel, place or institute","Rechercher église, ville ou institut")+
   '<input type="search" data-explore-time-mass-query autocomplete="off" value="'+esc(filters.timeMassQuery||"")+'" placeholder="'+
   L(language,"Place, country, source…","Lieu, pays, source…")+'"></label>';
 html+='<label>'+L(language,"Source evidence","État de la source")+
   '<select data-explore-time-mass-evidence>'+opts(language,filters.timeMassEvidence||"ALL",board.counts)+'</select></label></div>';
 html+='<p class="aoTimeMassResults" role="status">'+board.matched+' '+
  L(language,"matching venues","lieux correspondants")+'</p>';
 html+='<div class="aoTimeMassRows">';
 if(!board.rows.length)html+='<p class="aoTimeMassEmpty">'+L(language,"No matching source records. Broaden the search.","Aucune fiche correspondante. Élargissez la recherche.")+'</p>';
 for(const row of board.rows){
  html+='<article class="aoTimeMassRow" data-time-mass-status="'+row.status+'">'
    +'<small>'+esc(row.affiliation)+' · '+esc(L(language,...LABELS[row.status]))+'</small>'
    +'<h3>'+esc(row.name)+'</h3><p>'+esc(row.place)+'</p>';
  if(row.raw)html+='<blockquote>'+esc(row.raw)+'</blockquote>';
  else html+='<p class="aoTimeMassNoSchedule">'+L(language,"No current timetable imported; consult the linked venue.",
    "Aucun horaire actuel importé ; consultez la source du lieu.")+'</p>';
  if(row.checkedAt)html+='<p class="aoTimeMassChecked">'+
    L(language,"Source last checked","Source contrôlée le")+' · '+esc(row.checkedAt.slice(0,10))+'</p>';
  if(row.source)html+='<a href="'+esc(row.source.url)+'" target="_blank" rel="noopener noreferrer">'+
   L(language,row.source.exact?"Read supporting schedule source":"Check venue / directory source",
     row.source.exact?"Consulter la source des horaires":"Vérifier la source du lieu")+' ↗</a>';
  else html+='<p class="aoTimeMassNoSource">'+L(language,"No linked timetable source","Aucune source d’horaires liée")+'</p>';
  html+='</article>';
 }
 html+='</div>';
 if(board.rows.length<board.matched)html+='<button type="button" class="aoTimeMassMore" data-explore-time-mass-more>'+
   L(language,"Show more directory records","Afficher d’autres lieux")+' · '+(board.matched-board.rows.length)+'</button>';
 html+='<footer><p>'+L(language,
  "Schedule descriptions are source assertions, not promises that Mass is celebrated today. Check exceptions, church-local time and current information before travelling.",
  "Ces horaires proviennent des sources et ne garantissent aucune messe aujourd’hui. Vérifiez les exceptions, l’heure locale et les informations actuelles avant de partir.")+'</p>'
   +'<button type="button" data-find-filter="lens" data-find-filter-value="tlm">'+L(language,
    "Open provisional world Mass map","Voir la carte mondiale provisoire des messes")+' ↗</button></footer>';
 html+='</div></section>';
 return html;
}
