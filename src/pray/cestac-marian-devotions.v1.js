/** Focused August Queen prayer from the Servants of Mary
 * congregation's online French witness. The texts are treated as historically
 * attributed devotional works, not independently collated first leaflets.
 * English is a modern Ad Orientem editorial translation FROM the French.
 * The ICKSP English variant is linked, not a second independent prayer.
 * Never represent historical indulgences as current.
 */
export const CESTAC_MARIAN_DEVOTIONS_V1=Object.freeze([
  {
    "id": "cestac_august_queen_angels",
    "acquisitionId": "AO-AQ-012",
    "subject": "V",
    "enTitle": "August Queen of Heaven · Queen of the Angels",
    "frTitle": "Auguste Reine des cieux · Reine des Anges",
    "order": 1,
    "languageSource": "fr",
    "originalFrench": "Auguste Reine des cieux et maîtresse des Anges,\nVous qui avez reçu de Dieu\nle pouvoir et la mission d’écraser la tête de Satan,\nnous vous le demandons humblement,\nenvoyez les légions célestes pour que, sous vos ordres,\nelles poursuivent les démons, les combattent partout,\nrépriment leur audace et les refoulent dans l’abîme.\nQui est comme Dieu ?\nÔ bonne et tendre Mère,\nvous serez toujours notre amour et notre espérance.\nÔ divine Mère, envoyez les Saints Anges\npour me défendre et repousser loin de moi le cruel ennemi.\nSaints Anges et Archanges, défendez-nous, gardez-nous.",
    "editorialEnglish": "August Queen of Heaven and Mistress of the Angels,\nyou who have received from God\nthe power and the mission to crush the head of Satan,\nwe humbly ask you:\nsend the heavenly legions so that, under your command,\nthey may pursue the demons, fight them everywhere,\nrestrain their boldness and drive them back into the abyss.\nWho is like God?\nO good and tender Mother,\nyou will always be our love and our hope.\nO divine Mother, send the holy angels\nto defend me and drive the cruel enemy far from me.\nHoly Angels and Archangels, defend us and keep us.",
    "primarySource": "https://servantesdemarie.com/fr/pages/pere-cestac-priere-spiritualite-accompagnement-soutien-vierge-marie-auguste-reine",
    "additionalWitnesses": [
      {
        "url": "https://servantesdemarie.com/en/pages/father-cestac-prayer-spirituality-accompaniment-support-virgin-marie-noble-queen",
        "type": "CONGREGATION_ENGLISH_PARALLEL_NOT_EDITORIAL_FACE"
      },
      {
        "url": "https://institute-christ-king.org/resources/devotions-prayers/617-devotions-prayer-virgin-remedy",
        "type": "ICKSP_ALTERNATE_ENGLISH_RECENSION"
      }
    ],
    "optionalClosingRefrainFr": "Auguste Reine des cieux et maîtresse des Anges.",
    "optionalClosingRefrainEn": "August Queen of Heaven and Mistress of the Angels.",
    "primaryOnlineWitnessContainsClosingRefrain": true,
    "instituteWitnessContainsClosingRefrain": false,
    "instituteVariationNotes": "The ICKSP English text adds 'from the beginning', 'by thy power', a different description of the demons' fate, and Amen; the congregation's online French witness has an extra closing refrain. Do not silently conflate them.",
    "original1864LeafletCollated": false,
    "apparitionStoryStatus": "CATHOLIC_DEVOTIONAL_TRADITION_AS_RELATED_BY_CONGREGATION_NOT_INDEPENDENT_HISTORICAL_PROOF",
    "printedHistoricalIndulgencesCurrent": false,
    "searchTerms": [
      "august queen",
      "auguste reine",
      "queen of angels",
      "reine des anges",
      "cestac",
      "evil spirits",
      "remedy against evil spirits",
      "icksp",
      "icrsp",
      "reine du ciel"
    ]
   }
]);
export function cestacMarianWork(id){return CESTAC_MARIAN_DEVOTIONS_V1.find(w=>w.id===id)||null}
export function cestacMarianMatches({subject="all",category="all",search=""}={}){
 if(category!=="all")return [];
 const q=String(search||"").toLocaleLowerCase().trim();
 return CESTAC_MARIAN_DEVOTIONS_V1.filter(w=>(subject==="all"||subject===w.subject)&&
 (!q||[w.id,w.enTitle,w.frTitle,w.originalFrench,w.editorialEnglish,...w.searchTerms].join(" ").toLocaleLowerCase().includes(q)));
}
