/** Raccolta (1910) nos. 428 and 435, and the no. 429 prescribed exercise.
 * Checked against rendered pages of a modern typeset transcription of the
 * historic English/Latin text; NOT collated with a first-edition facsimile.
 * French is newly editorial. Old indulgence grants are NOT current claims.
 */
export const RACCOLTA_1910_GOOD_DEATH_WORKS_V1 = Object.freeze([
  {
    "id": "raccolta_1910_428_beati_mortui",
    "number": 428,
    "subject": "IX",
    "titleEn": "Beati mortui — Prayer for a Holy Death",
    "titleFr": "Beati mortui — Prière pour une sainte mort",
    "sourcePages": [
      169
    ],
    "la": "Beati mortui, qui in Domino moriuntur.\n\nO mi Deus, moriendum mihi est certo, sed nescio quando, quomodo, ubi moriar; hoc unum scio, me in æternum periturum, si in peccato lethali expirem.\n\nBeatissima Virgo Maria, Mater Dei Sancta, ora pro me peccatore, nunc et in hora mortis meæ. Amen.",
    "en": "Blessed are the dead who die in the Lord.\n\nO my God, I have certainly to die, but I know not when, how, or where I shall die; this only I know: that if I die in mortal sin, I shall be lost forever.\n\nMost blessed Virgin Mary, holy Mother of God, pray for me a sinner, now and at the hour of my death. Amen.",
    "fr": "Bienheureux les morts qui meurent dans le Seigneur.\n\nÔ mon Dieu, je dois certainement mourir, mais j'ignore quand, comment et où je mourrai ; je sais seulement que, si je meurs en état de péché mortel, je serai perdu pour l'éternité.\n\nTrès bienheureuse Vierge Marie, sainte Mère de Dieu, priez pour moi, pécheur, maintenant et à l'heure de ma mort. Ainsi soit-il.",
    "searchTerms": [
      "beati mortui",
      "holy death",
      "bonne mort",
      "mortis"
    ],
    "sourceWork": "The Raccolta (1910), attributed translation by Ambrose St John",
    "sourceURL": "https://motherofmercychapter.com/Prayers/The%20Raccolta%20-%201910%20Collection%20of%20Indulgenced%20Prayers%20and%20Good%20Works.pdf",
    "witnessStatus": "1910_TEXT_IN_MODERN_TYPESET_REPRODUCTION_CHECKED_AGAINST_RENDERED_PAGES_NOT_ORIGINAL_PRINT_FACSIMILE",
    "languagePolicy": "LATIN_AND_ENGLISH_HISTORICAL_TEXT_FRENCH_NEW_EDITORIAL_TRANSLATION",
    "historicalIndulgencesCurrentlyValid": false
  },
  {
    "id": "raccolta_1910_435_benedicite",
    "number": 435,
    "subject": "IX",
    "titleEn": "Jesus, Mary and Joseph — Bless Us at Death",
    "titleFr": "Jésus, Marie et Joseph — Bénissez-nous à la mort",
    "sourcePages": [
      170
    ],
    "la": "Nos, Jesu, Maria, et Joseph bone, benedicite nunc et in mortis agone.",
    "en": "O good Jesus, Mary and Joseph, bless us now and in the agony of death.",
    "fr": "Ô bon Jésus, Marie et Joseph, bénissez-nous maintenant et dans l'agonie de la mort.",
    "searchTerms": [
      "benedicite nunc",
      "Jesus Mary Joseph",
      "hour of death",
      "agone",
      "agonie"
    ],
    "sourceWork": "The Raccolta (1910), attributed translation by Ambrose St John",
    "sourceURL": "https://motherofmercychapter.com/Prayers/The%20Raccolta%20-%201910%20Collection%20of%20Indulgenced%20Prayers%20and%20Good%20Works.pdf",
    "witnessStatus": "1910_TEXT_IN_MODERN_TYPESET_REPRODUCTION_CHECKED_AGAINST_RENDERED_PAGES_NOT_ORIGINAL_PRINT_FACSIMILE",
    "languagePolicy": "HISTORICAL_LATIN_EDITORIAL_ENGLISH_AND_FRENCH",
    "historicalIndulgencesCurrentlyValid": false
  }
].map(w=>Object.freeze(w)));
export const RACCOLTA_1910_AGONY_429 = Object.freeze({
  "id": "raccolta_1910_429_agony",
  "number": 429,
  "subject": "IX",
  "titleEn": "Prayer for Those in Their Agony",
  "titleFr": "Prière pour ceux qui sont à l'agonie",
  "sourceURL": "https://motherofmercychapter.com/Prayers/The%20Raccolta%20-%201910%20Collection%20of%20Indulgenced%20Prayers%20and%20Good%20Works.pdf",
  "sourcePages": [
    169
  ],
  "kind": "PRESCRIBED_DEVOTION_NOT_DISTINCT_PRAYER",
  "instructionEn": "Pray three Our Fathers in memory of the Passion of Christ and three Hail Marys in memory of the Sorrows of Mary assisting at the Passion. The 1910 source directs kneeling unless physical infirmity makes this impossible.",
  "instructionFr": "Récitez trois Notre Père en mémoire de la Passion du Christ et trois Je vous salue Marie en mémoire des douleurs de Marie présente à la Passion. La source de 1910 prescrit de s'agenouiller, sauf empêchement dû à une infirmité.",
  "steps": [
    "foundations_our_father",
    "foundations_our_father",
    "foundations_our_father",
    "foundations_hail_mary",
    "foundations_hail_mary",
    "foundations_hail_mary"
  ],
  "searchTerms": [
    "agony",
    "agonie",
    "dying",
    "mourants",
    "pater noster",
    "ave maria"
  ],
  "historicalIndulgencesCurrentlyValid": false
});
export function raccolta1910GoodDeathWork(id){return RACCOLTA_1910_GOOD_DEATH_WORKS_V1.find(w=>w.id===id)||(id===RACCOLTA_1910_AGONY_429.id?RACCOLTA_1910_AGONY_429:null)}
export function raccolta1910GoodDeathMatches({category="all",subject="all",search=""}={}){if(category!=="all")return [];const q=String(search||"").toLocaleLowerCase().trim();return [...RACCOLTA_1910_GOOD_DEATH_WORKS_V1,RACCOLTA_1910_AGONY_429].filter(w=>(subject==="all"||subject===w.subject)&&(!q||[w.id,w.titleEn,w.titleFr,w.en||"",w.la||"",w.fr||"",...(w.searchTerms||[])].join(" ").toLocaleLowerCase().includes(q)));}
