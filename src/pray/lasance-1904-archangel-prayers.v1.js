/** Source-owned historical prayer bodies from F.X. Lasance (1904).
 * ONE 1904 English prayer each, with new editorial French translations.
 * An OPTIONAL modern nine-day guide repeats the same St Raphael prayer, as
 * permitted by the non-prescriptive 1910 Raccolta rule; it is NOT another
 * canonical novena and is NOT falsely called a nine-day text of Lasance.
 * The Wikisource transcription is marked not proofread, and no original
 * page-image collation is claimed. No contemporary indulgence claim.
 */
export const LASANCE_1904_ARCHANGELS_V1=Object.freeze([
  {
    "id": "lasance_1904_st_raphael_prayer",
    "subject": "VI",
    "titleEn": "Prayer to St Raphael the Archangel",
    "titleFr": "Prière à saint Raphaël archange",
    "sourceWork": "F. X. Lasance, Prayer-book for Religious (Benziger Brothers, 1904), scanned page 591",
    "sourceURL": "https://en.wikisource.org/wiki/Page:Prayerbookforrel00lasa_0.djvu/591",
    "originalLanguage": "en",
    "sourceTranscriptionStatus": "1904_PUBLIC_DOMAIN_ENGLISH_WIKISOURCE_PAGE_MARKED_NOT_PROOFREAD",
    "originalPageImageIndependentlyCollated": false,
    "sourceNovelty": "ST_RAPHAEL_SINGLE_HISTORIC_PRAYER",
    "fullEnglish": "Glorious archangel, St. Raphael, great prince of the heavenly court, illustrious by thy gifts of wisdom and grace, guide of travelers by land and sea, consoler of the unfortunate and refuge of sinners, I entreat thee to help me in all my needs and in all the trials of this life, as thou didst once assist the young Tobias in his journeying. And since thou art the “physician of God,” I humbly pray thee to heal my soul of its many infirmities and my body of the ills that afflict it, if this favor is for my greater good. I ask, especially, for angelic purity, that I may be made fit to be the living temple of the Holy Ghost. Amen.",
    "editorialFrench": "Glorieux archange saint Raphaël, grand prince de la cour céleste, illustre par vos dons de sagesse et de grâce, guide de ceux qui voyagent sur terre et sur mer, consolateur des malheureux et refuge des pécheurs, je vous supplie de m’aider dans tous mes besoins et dans toutes les épreuves de cette vie, comme vous avez jadis assisté le jeune Tobie au cours de son voyage. Puisque vous êtes le « médecin de Dieu », je vous prie humblement de guérir mon âme de ses nombreuses infirmités et mon corps des maux qui l’affligent, si cette faveur est pour mon plus grand bien. Je vous demande surtout la pureté angélique, afin d’être rendu digne de devenir le temple vivant du Saint-Esprit. Ainsi soit-il.",
    "recurringProgramme": {
      "id": "st_raphael_historical_9_day_private",
      "days": 9,
      "sourceNovenaReference": "The Raccolta (1910), no. 294",
      "sourceNovenaURL": "https://www.saintsbooks.net/books/The%20Raccolta%20-%201910.pdf",
      "historicalNovenaRule": "1910_RACCOLTA_PERMITS_ANY_ECCLESIASTICALLY_SANCTIONED_FORM_NO_SINGLE_FIXED_DAY_PRAYER",
      "presentation": "ONE_1904_PRAYER_REPEATED_FOR_NINE_DAYS_EDITORIAL_GUIDED_ARRANGEMENT",
      "fixedNineDayTextIn1904": false,
      "standardCommonPrayersOptional": [
        "foundations_our_father",
        "foundations_hail_mary",
        "foundations_glory_be"
      ]
    },
    "sourceNoteEn": "The 1904 prayer is historical English. A nine-day reader repeats the same prayer as a modern guided arrangement; neither Lasance nor the 1910 Raccolta is claimed to prescribe this exact daily sequence. The 1904 Wikisource page remains unproofread and has not been separately checked against the printed photograph.",
    "sourceNoteFr": "La prière anglaise est tirée d’un ouvrage de 1904. Le parcours en neuf jours reprend la même prière selon un agencement moderne ; ni Lasance ni le Raccolta de 1910 ne sont présentés comme ayant prescrit exactement ce déroulement. La transcription Wikisource n’est pas encore relue ni collationnée indépendamment sur la photographie imprimée.",
    "searchTerms": [
      "raphael",
      "raphaël",
      "raphael novena",
      "neuvaine saint raphael",
      "medicine of god",
      "archangel healing",
      "prière saint raphaël",
      "tobias",
      "tobie"
    ],
    "historicalIndulgencesCurrentlyValid": false
  },
  {
    "id": "lasance_1904_st_gabriel_prayer",
    "subject": "VI",
    "titleEn": "Prayer to St Gabriel the Archangel",
    "titleFr": "Prière à saint Gabriel archange",
    "sourceWork": "F. X. Lasance, Prayer-book for Religious (Benziger Brothers, 1904), scanned page 591",
    "sourceURL": "https://en.wikisource.org/wiki/Page:Prayerbookforrel00lasa_0.djvu/591",
    "originalLanguage": "en",
    "sourceTranscriptionStatus": "1904_PUBLIC_DOMAIN_ENGLISH_WIKISOURCE_PAGE_MARKED_NOT_PROOFREAD",
    "originalPageImageIndependentlyCollated": false,
    "sourceNovelty": "ST_GABRIEL_SINGLE_HISTORIC_PRAYER",
    "fullEnglish": "O blessed archangel Gabriel, we beseech thee, do thou intercede for us at the throne of divine Mercy in our present necessities, that, as thou didst announce to Mary the mystery of the Incarnation, so through thy prayers and patronage in heaven we may obtain the benefits of the same, and sing the praise of God for ever in the land of the living. Amen.",
    "editorialFrench": "Ô bienheureux archange Gabriel, nous vous en supplions, intercédez pour nous auprès du trône de la divine Miséricorde dans nos besoins présents. De même que vous avez annoncé à Marie le mystère de l’Incarnation, obtenez-nous, par vos prières et votre patronage dans le ciel, de recevoir les fruits de ce même mystère et de chanter à jamais les louanges de Dieu dans la terre des vivants. Ainsi soit-il.",
    "recurringProgramme": null,
    "sourceNoteEn": "Complete English prayer printed in Lasance's 1904 Prayer-book for Religious. The corresponding Wikisource transcription is marked unproofread, and the original page photograph has not been independently collated. The French is a modern editorial translation.",
    "sourceNoteFr": "Prière anglaise complète figurant dans le livre de Lasance (1904). La transcription Wikisource est signalée comme non relue, et la photographie de la page n’a pas fait l’objet d’une collation indépendante. Le français est une traduction éditoriale moderne.",
    "searchTerms": [
      "gabriel",
      "saint gabriel",
      "gabriel archange",
      "prayer st gabriel",
      "archangel annunciation",
      "annonciation",
      "incarnation"
    ],
    "historicalIndulgencesCurrentlyValid": false
  }
]);
export function lasance1904ArchangelWork(id){return LASANCE_1904_ARCHANGELS_V1.find(x=>x.id===id)||null}
export function lasance1904ArchangelMatches({category="all",subject="all",search=""}={}){
 if(category!=="all")return [];
 const q=String(search||"").toLocaleLowerCase().trim();
 return LASANCE_1904_ARCHANGELS_V1.filter(w=>(subject==="all"||subject===w.subject)&&
 (!q||[w.id,w.titleEn,w.titleFr,w.fullEnglish,w.editorialFrench,...w.searchTerms].join(" ").toLocaleLowerCase().includes(q)));
}
