// ICRSP France November 2026 independent Ordo audit, publication HOLD.
// This is not a Mass Proper, date-selector, or oration source and cannot be
// treated as a contract that authorizes the reader to add prayers.
// Independent 21-day evidence ledger: data/research/icrsp-france-ordo-2026-11-09-29-independent.v1.json
// Official Ordo: https://icrspfrance.fr/ordo.php?d=2026-11-09
// The 1960 Missal's §§434 and 457 impose restrictions still requiring review.
// Scope is *ICRSP France*, not ICRSP worldwide or other communities.
export const ICRSP_FRANCE_INTAKE_WINDOW=Object.freeze({
 start:"2026-11-09",end:"2026-11-29",
 scope:"ICRSP_FRANCE_PARTICULAR_ORDO",
 status:"SOURCE_ATTESTED_READER_NOT_CERTIFIED",
 generalMassUnchanged:true,
 instituteMassSelectionAllowed:false,
 records:21,
});
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
})[c]);
export function icrspFranceOrdoIntakeStatus(date){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date??""))||
  date<ICRSP_FRANCE_INTAKE_WINDOW.start||date>ICRSP_FRANCE_INTAKE_WINDOW.end)
  return null;
 return Object.freeze({
  date,status:ICRSP_FRANCE_INTAKE_WINDOW.status,
  sourceScope:ICRSP_FRANCE_INTAKE_WINDOW.scope,
  sourceOrdo:"https://icrspfrance.fr/ordo.php?d="+date+"#j"+date,
  generalMassUnchanged:true,
  instituteMassSelectionAllowed:false,
  mayCertifyReader:false,
  ...(date==="2026-11-09"?{
    independentRubricConflict:"RGMR_434_C_CLASS_II_ONE_ADDITIONAL_LIMIT",
    listedAdditionalPurposes:["SAINT_THEODORE_COMMEMORATION","ORATIO_PRO_PAPA"],
    separateSourceClaimedOrationGroups:3,
    ordinary1962GroupMaximum:2,
    reviewStatus:"DOCUMENTED_CONFLICT_NOT_AUTHORIZED"
  }:{}),
  reason:date==="2026-11-09"?
   "SOURCE_CLAIMS_EXCEED_II_CLASS_1962_LIMIT_NO_EXCEPTION_DOCUMENTED":
   "INSTITUTE_ORATIONS_AND_RUBRICAL_AUTHORITY_AWAIT_INDEPENDENT_REVIEW"
 });
}
export function renderIcrspFranceIntakeHold(date,language="en"){
 const item=icrspFranceOrdoIntakeStatus(date);
 if(!item)return "";
 const fr=language==="fr";
 const say=(en,french)=>fr?french:en;
 return '<section class="aoH4IcrspOrdo" data-home-icrsp-intake-hold="'+esc(date)+'" '+
  'data-mass-source-status="UNVERIFIED" role="note" aria-label="'+
  esc(say("ICRSP France: Mass form not yet certified",
    "ICRSP France : formulaire non encore certifié"))+'">'+
  '<small>'+esc(say("ICRSP France · particular Ordo","ICRSP France · Ordo particulier"))+'</small>'+
  '<strong>'+esc(say("Institute Mass not yet verified","Messe propre à l’Institut non encore vérifiée"))+'</strong>'+
  '<p>'+esc(say(
    "The Institute’s dated Ordo lists additional prayers. Their sequence, texts and applicable rubrical authority have not yet been independently certified in Ad Orientem. The standard Mass button opens the general 1962 calendar Proper, not the Institute’s complete Mass.",
    "L’Ordo daté de l’Institut prescrit des oraisons supplémentaires. Leur ordre, leurs textes et les permissions rubricales applicables ne sont pas encore certifiés indépendamment dans Ad Orientem. Le bouton de messe ordinaire ouvre le Propre du calendrier général de 1962, pas la messe complète de l’Institut."
  ))+'</p>'+
  (item.independentRubricConflict?
    '<p data-mass-1962-rubric-conflict="RGMR_434_C">'+esc(say(
      "9 November: the ICRSP France Ordo names the commemoration of St Theodore and the Prayer for the Pope. The general 1962 rule for this II-class day admits only one separate additional oration. The authority for including both has not been established; do not interpret the three listed prayers as an approved Mass form.",
      "9 novembre : l’Ordo de l’ICRSP France mentionne la mémoire de saint Théodore et l’oraison pour le Pape. La règle générale de 1962, pour ce jour de IIe classe, n’admet qu’une seule oraison supplémentaire distincte. L’autorisation d’inclure les deux n’est pas établie : les trois oraisons citées ne constituent pas un formulaire approuvé."
    ))+'</p>'+
    '<a href="https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html" target="_blank" rel="noopener noreferrer">'+
    esc(say("1960 Missal rubric §434(c)","Rubrique du Missel 1960 §434(c)"))+'</a>'
    :"")+
  '<a href="'+esc(item.sourceOrdo)+'" target="_blank" rel="noopener noreferrer">'+
  esc(say("View official institute Ordo","Consulter l’Ordo officiel de l’Institut"))+'</a>'+
  '</section>';
}
