// Calendar-to-Explore handoffs are declared against existing published
// Customs Atlas identities. A date never implies that a local ceremony exists.
const LINKS=Object.freeze({
  "advent-family-traditions":Object.freeze([
    ["ADVT-001","Advent wreath","Couronne de l’Avent"],
    ["ADVT-002","Manger straw","Paille de la crèche"],
  ]),
  "las-posadas":Object.freeze([["ADVT-003","Las Posadas","Las Posadas"]]),
  "oplatek-christmas":Object.freeze([["XMAS-001","Polish opłatek","Opłatek polonais"]]),
  "holy-thursday":Object.freeze([["HTHU-001","Holy Thursday church visits","Visites des reposoirs"]]),
  "rogation":Object.freeze([["ROGA-001","Family Rogation walk","Marche familiale des Rogations"]]),
  "epiphany-family":Object.freeze([["EPIP-001","Epiphany star singers","Chanteurs de l’Épiphanie"],["EPIP-002","Galette des Rois","Galette des Rois"]]),
  "corpus":Object.freeze([["CORP-001","Corpus Christi flowers","Fleurs de la Fête-Dieu"]]),
  "easter-monday-emmaus":Object.freeze([["EAST-001","Emmaus walk","Marche d’Emmaüs"]]),
  "may-marian-garden":Object.freeze([["MARI-002","Mary garden","Jardin marial"]]),
});
export const CALENDAR_CUSTOM_PROFILE_IDS=Object.freeze([...new Set(Object.values(LINKS).flat().map(row=>row[0]))]);
export function calendarCustomProfileActions(key,{fr=false}={}){
  return Object.freeze((LINKS[key]??[]).map(([id,en,frTitle])=>Object.freeze([
    "find:traditions:"+id,(fr?"Découvrir : "+frTitle:"Explore: "+en),
  ])));
}
