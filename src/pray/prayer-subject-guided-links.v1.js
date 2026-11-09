/**
 * Verified reader-owner links for Prayer's theological subject browsing.
 *
 * This does not import draft work-registry text or create a second reader.
 * Each route is registered in internal-route-owner.js and uses the original
 * specialised UI on entry. Only routes with Stage 6–9 rendered-body evidence
 * are included as of 8 November 2026.
 */
export const PRAYER_SUBJECT_GUIDED_LINKS_V1=Object.freeze([
 Object.freeze({id:"pray.five_wounds",subject:"II",en:"Chaplet of the Five Wounds",fr:"Chapelet des Cinq Plaies",descriptionEn:"Thirty prayers in the original Five Wounds reader.",descriptionFr:"Trente prières dans le parcours des Cinq Plaies."}),
 Object.freeze({id:"pray.precious_blood",subject:"II",en:"Chaplet of the Precious Blood",fr:"Chapelet du Précieux Sang",descriptionEn:"Seven mysteries; thirty-three Our Fathers.",descriptionFr:"Sept mystères ; trente-trois Notre Père."}),
 Object.freeze({id:"pray.little_crown",subject:"II",en:"Little Crown of the Infant Jesus",fr:"Petite Couronne de l’Enfant-Jésus",descriptionEn:"Fifteen beads in the original reader.",descriptionFr:"Quinze grains dans le parcours d’origine."}),
 Object.freeze({id:"pray.seven_words",subject:"II",en:"Seven Last Words",fr:"Sept Dernières Paroles",descriptionEn:"Historical English meditations with their original opening and closing prayers.",descriptionFr:"Méditations historiques en anglais, avec prières d’ouverture et de conclusion."}),
 Object.freeze({id:"pray.st_joseph_seven_sorrows",subject:"VI",en:"Seven Sorrows and Joys of St Joseph",fr:"Sept douleurs et sept joies de saint Joseph",descriptionEn:"Seven complete supplications and their closing prayer.",descriptionFr:"Sept supplications complètes et la prière finale."}),
 Object.freeze({id:"pray.for_priests",subject:"VII",en:"Prayers for Priests and Vocations",fr:"Prières pour les prêtres et les vocations",descriptionEn:"Original sourced prayers for clergy and vocations.",descriptionFr:"Prières sourcées pour les prêtres et les vocations."}),
 Object.freeze({id:"pray.occasional_intercessions",subject:"VII",en:"Prayers for Particular Needs",fr:"Prières pour les besoins particuliers",descriptionEn:"Sickness, family, peace, travel and discernment.",descriptionFr:"Maladie, famille, paix, voyage et discernement."})
]);
export function guidedPrayerLinksForSubject(subject,query=""){
 const q=String(query||"").trim().toLocaleLowerCase();
 return PRAYER_SUBJECT_GUIDED_LINKS_V1.filter(x=>
  (subject==="all"||x.subject===subject)&&
  (!q||[x.id,x.en,x.fr,x.descriptionEn,x.descriptionFr].some(value=>value.toLocaleLowerCase().includes(q))));
}
