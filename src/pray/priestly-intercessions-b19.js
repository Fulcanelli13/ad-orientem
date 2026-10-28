/**
 * Ad Orientem B19 — focused, source-qualified prayer for priests.
 *
 * Do not multiply Institute source-witness appearances into extra works.
 * Prayer 1 appears independently in The Ecclesiastical Review v.50 (1914)
 * pp. 608–609 according to a historical attribution study and later ICKSP
 * US/UK published recensions. No evidence that St Therese wrote it.
 * Anonymous/author unproven, rather than silently crediting St Therese.
 *
 * Prayers 2–3 are *The Raccolta* (1910), §464, the complete two formulas
 * for vocations and preservation of clergy. Historical English & Latin
 * textual witnesses are preserved, not modern translations. Print-photo
 * collation remains pending; old indulgence grants are not presented.
 *
 * ICKSP Sacred Heart "Eternal High Priest" is NOT imported: its US page
 * has an obviously corrupt duplicated clause. Benedict XVI's text and
 * Fr Thevenin's modern translations are not copied pending rights.
 */
export const PRIESTLY_INTERCESSIONS_B19=Object.freeze([
 Object.freeze({
  id:"priest_intercession_eternal_priest_1914_en",
  purpose:"priests",titleEn:"O Jesus, Eternal Priest",
  titleFr:"Ô Jésus, Prêtre éternel",language:"en",
  text:"O Jesus, Eternal Priest, keep Thy priests within the shelter of Thy Sacred Heart, where none may touch them. Keep unstained their anointed hands, which daily touch Thy Sacred Body. Keep unsullied their lips, daily purpled with Thy Precious Blood. Keep pure and unworldly their hearts, sealed with the sublime mark of Thy Priesthood. Let Thy Holy Love surround them from the world's contagion. Bless their labors with abundant fruit. May the souls to whom they minister be their joy and consolation here, and their everlasting crown hereafter. Amen.",
  authorStatus:"ANONYMOUS_1914_THERESE_ATTRIBUTION_UNPROVEN",
  printedClaim:"The Ecclesiastical Review, vol. 50 (1914), pp. 608–609; original page image not authenticated",
  witnesses:Object.freeze([
   "https://institute-christ-king.org/resources/devotions-prayers/614-devotions-prayer-priests",
   "https://icksp.org.uk/newbrighton/the-most-holy-rosary-of-the-blessed-virgin-mary/",
   "https://fauxtations.wordpress.com/2016/10/01/st-therese-and-praying-for-priests/"
  ]),
  editionTextStatus:"INSTITUTE_US_COMPLETE_DIGITAL_TEXT_AND_SECONDARY_1914_REFERENCE",
  rightsBasis:"Pre-1929 prayer historically attested; wording from source-owned ICKSP witness",
  liveEligible:true,
  provenanceNoteEn:"Appears in a 1914 Ecclesiastical Review reference; commonly attributed to St Thérèse, but that authorship is unproven.",
  provenanceNoteFr:"Prière attestée par une référence de 1914 ; attribution courante à sainte Thérèse, non démontrée."
 }),
 Object.freeze({
  id:"priest_intercession_vocations_raccolta_1910",
  purpose:"vocations",titleEn:"For Priestly Vocations",
  titleFr:"Pour les vocations sacerdotales",language:"en_la",
  en:"Ant. Why stand ye all the day idle? Go ye into my vineyard.\n℣. Ask the Lord of the harvest.\n℟. That He send labourers into his vineyard.\n\nLet us pray.\n\nO God, who willest not the death of the sinner, but rather that he be converted and live; grant, by the intercession of blessed Mary ever Virgin and of all the saints, labourers for Thy Church, fellow labourers with Christ, to spend and consume themselves for souls. Through the same Jesus Christ, etc. Amen.",
  la:"Ant. Quid statis tota die otiosi? Ite in vineam meam.\n℣. Rogate Dominum messis.\n℟. Ut mittat operarios in vineam suam.\n\nOremus.\n\nDeus, qui non vis mortem peccatoris, sed magis ut convertatur et vivat, da, quaesumus, per intercessionem beatae Mariae semper Virginis et omnium sanctorum, operarios Ecclesiae tuae, qui sunt cooperatores Christi, ut se impendant et superimpendant pro animabus. Per eundem Dominum, etc. Amen.",
  printedClaim:"The Raccolta (1910), §464.I, PDF p.181 (PDF index 180)",
  witnesses:Object.freeze(["https://www.saintsbooks.net/books/The%20Raccolta%20-%201910.pdf"]),
  editionTextStatus:"1910_DIGITIZED_COMPLETE_PARALLEL_EN_LATIN_PRINT_IMAGE_NOT_VERIFIED",
  rightsBasis:"1910 Ambrose St John public-domain English and printed Latin",
  liveEligible:true,
  provenanceNoteEn:"The 1910 edition abbreviates the liturgical conclusion as 'etc.'; it is not silently expanded.",
  provenanceNoteFr:"L'édition de 1910 abrège la conclusion liturgique par « etc. » ; celle-ci n'est pas complétée sans source."
 }),
 Object.freeze({
  id:"priest_intercession_perseverance_raccolta_1910",
  purpose:"perseverance",titleEn:"For the Perseverance of Priests",
  titleFr:"Pour la persévérance des prêtres",language:"en_la",
  en:"Ant. No one putting his hand to the plough and looking back is fit for the Kingdom of God.\n℣. No soldier of God involves himself in worldly affairs.\n℟. That he may please Him to whom he has approved himself.\n\nLet us pray.\n\nO God, the sole protection of human weakness, hear, we beseech Thee, the prayers which we humbly address to Thee for our brethren who are in danger, and do Thou rescue them from all evil of sin, and establish them in the security of Thy protection. Through Jesus Christ our Lord. Amen.",
  la:"Ant. Nemo mittens manum suam ad aratrum et respiciens retro aptus est regno Dei.\n℣. Nemo militans Deo implicat se negotiis saecularibus.\n℟. Ut ei placeat, cui se probavit.\n\nOremus.\n\nDeus, infirmitatis humanae singulare praesidium, exaudi, quaesumus, preces quas pro fratribus in discrimine positis humiliter fundimus, ut famulos tuos ab omni eruas peccatorum nequitia et in tuae protectionis securitate constituas. Per Dominum, etc. Amen.",
  printedClaim:"The Raccolta (1910), §464.II, PDF p.181 (PDF index 180)",
  witnesses:Object.freeze(["https://www.saintsbooks.net/books/The%20Raccolta%20-%201910.pdf"]),
  editionTextStatus:"1910_DIGITIZED_COMPLETE_PARALLEL_EN_LATIN_PRINT_IMAGE_NOT_VERIFIED",
  rightsBasis:"1910 Ambrose St John public-domain English and printed Latin",
  liveEligible:true,
  provenanceNoteEn:"An historic liturgical petition for protection and perseverance, rather than a replacement for personal prayer for a particular priest.",
  provenanceNoteFr:"Prière ancienne pour la protection et la persévérance du clergé ; elle ne remplace pas l'intercession personnelle."
 })
]);
export const PRIESTLY_INTERCESSION_PURPOSES_B19=Object.freeze(["priests","vocations","perseverance"]);
export function priestlyIntercessionFor(purpose,uiLanguage="en",preferLatin=false){
 if(!PRIESTLY_INTERCESSION_PURPOSES_B19.includes(purpose)||!["en","fr"].includes(uiLanguage))return null;
 const w=PRIESTLY_INTERCESSIONS_B19.find(x=>x.purpose===purpose&&x.liveEligible===true);
 if(!w)return null;
 const selectedLanguage=(preferLatin||uiLanguage==="fr")&&w.la?"la":"en";
 const text=selectedLanguage==="la"?w.la:(w.en||w.text);
 if(!text)return null;
 return Object.freeze({
  id:w.id,purpose:w.purpose,title:uiLanguage==="fr"?w.titleFr:w.titleEn,
  text,language:selectedLanguage,labelOriginal:uiLanguage==="fr"&&selectedLanguage==="en",
  labelLanguage:selectedLanguage==="la"?"Latin original":(uiLanguage==="fr"?"Anglais historique":"Historical English"),
  attributionStatus:w.authorStatus||null,
  sourceStatus:w.editionTextStatus,sourceLinks:w.witnesses,
  sourceNote:uiLanguage==="fr"?w.provenanceNoteFr:w.provenanceNoteEn
 });
}
export const PRIESTLY_INTERCESSIONS_HOLDS_B19=Object.freeze([
 Object.freeze({id:"icksp_priests_heart",reason:"US textual witness has an obvious duplicated clause; no clean independent source yet",status:"HOLD_TEXT_CORRUPTION"}),
 Object.freeze({id:"icksp_father_thevenin",reason:"Modern author / translation rights not cleared",status:"HOLD_RIGHTS"}),
 Object.freeze({id:"icksp_benedict_xvi",reason:"Modern papal prayer rights and alternate versions not reconciled",status:"HOLD_RIGHTS"}),
 Object.freeze({id:"raccolta_1910_463",reason:"Historically long and anachronistic expression of Mary at the altar; not sufficiently useful as another everyday option",status:"DEFER_EDITORIAL"}),
 Object.freeze({id:"icksp_new_brighton_first_thursday",reason:"Two-part UK sequence is source-backed but overlaps 1910 priestly purposes; preserve as one local first-Thursday source, not duplicate daily forms",status:"DEFER_LOCAL_COMPOSITE"})
]);
