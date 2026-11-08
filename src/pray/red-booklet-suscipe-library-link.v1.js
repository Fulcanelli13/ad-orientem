/**
 * 2013 Coalition Red Booklet, p. 62: discoverability ONLY for an existing
 * St Ignatius Suscipe reading, from Lasance's separately verified 1908
 * English and Latin printed witnesses. The 2013 English remains uncollated.
 * French labels are UI labels, NOT a French prayer translation.
 */
import {prayerAcquisitionCandidates} from "./prayer-acquisition-historical-witnesses.v1.js";
const english=prayerAcquisitionCandidates("self_offering",{language:"en"}).find(w=>w.id==="ignatius_suscipe_lasance_1908_en");
const latin=prayerAcquisitionCandidates("self_offering",{language:"la"}).find(w=>w.id==="ignatius_suscipe_lasance_1908_la");
if(!english?.text||!latin?.text||english.source.page!=="227"||latin.source.page!=="227")
 throw new Error("Cleared Lasance Suscipe EN/LA witnesses missing");
export const RED_BOOKLET_SUSCIPE_LIBRARY_LINK_V1=Object.freeze({
 id:"ignatius_suscipe",
 en:"Suscipe — St Ignatius of Loyola",
 fr:"Suscipe — Saint Ignace de Loyola",
 subject:"III",
 phase:"after",
 printedPage:62,
 route:"pray.morning_evening",
 sourceIds:Object.freeze({en:english.id,la:latin.id}),
 languages:Object.freeze(["en","la"]),
 sourceEdition:"F. X. Lasance, My Prayer-Book (1908), p. 227",
 wordingCollatedAgainst2013:false
});
export function redBookletSuscipeLibraryLinksForSubject(subject,query=""){
 const q=String(query||"").trim().toLocaleLowerCase();
 const w=RED_BOOKLET_SUSCIPE_LIBRARY_LINK_V1;
 if(subject!==w.subject&&!(subject==="all"&&q))return [];
 return !q||[w.id,w.en,w.fr,"ignatius","self offering","take o lord","suscipe"].some(v=>v.toLocaleLowerCase().includes(q))?[w]:[];
}
