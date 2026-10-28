/** B20: two historically sourced, narrow occasional intercessions.
 * The third purpose REUSES the existing multilingual canonical Ad te, beate Ioseph;
 * it must never duplicate the canonical work or alter the 48-prayer bank.
 * Digital witnesses are not claimed as print-image certification.
 */
export const OCCASIONAL_INTERCESSIONS_B20=Object.freeze([
  {
    "id": "occasional_for_sick_lasance_1911_en",
    "purpose": "sick",
    "titleEn": "For Someone Who Is Sick",
    "titleFr": "Pour une personne malade",
    "en": "Most merciful Jesus, Who art the consolation and salvation of all who put their trust in Thee, we humbly beseech Thee, by Thy most bitter Passion, grant the recovery of his (or her) health to Thy servant N.N., provided this be for his soul’s welfare, that with us he may praise and magnify Thy holy name.\n\nO Mary! Mother of our Saviour, Virgin, most powerful, Virgin, most merciful, Health of the sick, Refuge of sinners, Comforter of the afflicted, Help of Christians; Pray for him (or her). St. Joseph, pray for him (or her).\n\nOur Father, Hail Mary, Glory be to the Father.",
    "printedClaim": "F. X. Lasance, With God: A Book of Prayers and Reflections (1911), pp. 826–827",
    "sourceLinks": [
      "https://novenaregina.com/prayers/prayer-for-a-sick-person",
      "https://en.wikisource.org/wiki/With_God"
    ],
    "sourceStatus": "HISTORICAL_1911_EN_DIGITAL_WITNESS_PRINT_IMAGE_UNCOLLATED",
    "noteEn": "N.N. indicates the sick person's name. The original printed formula retains 'his (or her)'. Its final line instructs three familiar prayers; those prayers are already available in Ad Orientem.",
    "noteFr": "N.N. désigne le nom de la personne malade. Le texte anglais historique et ses indications restent inchangés ; aucune traduction française n'est attestée pour cet extrait."
  },
  {
    "id": "occasional_holy_family_lasance_1910_en",
    "purpose": "family",
    "titleEn": "Prayer to the Holy Family",
    "titleFr": "Prière à la Sainte Famille",
    "en": "O most loving Jesus, Who by Thy sublime and beautiful virtues of humility, obedience, poverty, modesty, charity, patience, and gentleness, and by the example of Thy domestic life, didst bless with peace and happiness the family which Thou didst choose on earth; in Thy clemency look down upon this household, humbly prostrate before Thee and imploring Thy mercy. Remember that this family belongs to Thee; for to Thee we have in a special way dedicated and devoted ourselves.\n\nLook upon us in Thy loving kindness, preserve us from danger, give us help in time of need, and grant us the grace to persevere to the end in the imitation of Thy holy family; that having revered Thee and loved Thee faithfully on earth, we may bless and praise Thee eternally in heaven. O Mary, most sweet Mother, to thy intercession we have recourse, knowing that thy divine Son will hear thy prayers. And do thou, O glorious patriarch, St. Joseph, assist us by thy powerful mediation, and offer, by the hand of Mary, our prayers to Jesus. Amen.",
    "printedClaim": "F. X. Lasance, The Young Man's Guide (1910), X: Various Prayers, 'Prayer to the Holy Family'",
    "sourceLinks": [
      "https://en.wikisource.org/wiki/The_young_man%27s_guide/X._VARIOUS_PRAYERS",
      "https://en.wikisource.org/wiki/The_young_man%27s_guide"
    ],
    "sourceStatus": "HISTORICAL_1910_EN_DIGITAL_TRANSCRIPTION_PRINT_IMAGE_UNCOLLATED",
    "noteEn": "A household prayer of dedication and intercession; not a new public rite or a requirement to consecrate a household. The transcription is not yet checked against the original printed image.",
    "noteFr": "Prière familiale historique en anglais. Il ne s'agit ni d'un rite public nouveau ni d'une consécration obligatoire ; l'image imprimée reste à collationner."
  }
].map(x=>Object.freeze({...x,sourceLinks:Object.freeze(x.sourceLinks)})));
export const OCCASIONAL_PURPOSES_B20=Object.freeze(["sick","family","difficulties"]);
export const OCCASIONAL_CANONICAL_REUSE_B20=Object.freeze({difficulties:"devotion_ad_te_beate_ioseph"});
export function occasionalIntercessionFor(purpose,uiLanguage="en",preferLatin=false,canonicalStJoseph=null){
 if(!OCCASIONAL_PURPOSES_B20.includes(purpose)||!["en","fr"].includes(uiLanguage))return null;
 if(purpose==="difficulties"){
   const p=canonicalStJoseph;
   if(!p||p.id!==OCCASIONAL_CANONICAL_REUSE_B20.difficulties||!p.en||!p.la||!p.fr)return null;
   const language=preferLatin?"la":uiLanguage, text=p[language];
   return Object.freeze({
     id:p.id,purpose,title:uiLanguage==="fr"?(p.titleFr||p.title):p.title,
     text,language,labelOriginal:false,canLatin:true,canonical:true,
     sourceLinks:Object.freeze(p.sourceUrl?[p.sourceUrl]:[]),
     sourceNote:uiLanguage==="fr"
       ?"Prière traditionnelle déjà présente dans Ad Orientem, réutilisée sans copie supplémentaire."
       :"An existing canonical prayer for help in adversity, reused without creating a duplicate."
   });
 }
 const w=OCCASIONAL_INTERCESSIONS_B20.find(x=>x.purpose===purpose);
 if(!w||!w.en)return null;
 return Object.freeze({
   id:w.id,purpose,title:uiLanguage==="fr"?w.titleFr:w.titleEn,
   text:w.en,language:"en",labelOriginal:uiLanguage==="fr",canLatin:false,canonical:false,
   sourceLinks:w.sourceLinks,sourceStatus:w.sourceStatus,
   sourceNote:uiLanguage==="fr"?w.noteFr:w.noteEn
 });
}
export const OCCASIONAL_HOLDS_B20=Object.freeze([
 Object.freeze({id:"infant_jesus_for_sick_icksp",reason:"Specific infant devotion adds less utility than a general sick-person intercession",status:"DEFER_EDITORIAL"}),
 Object.freeze({id:"preces_gertrudianae_tribulation_1861",reason:"Longer personal tribulation prayer; existing Ad te, beate Ioseph already covers adversity in EN/FR/Latin",status:"DEFER_DUPLICATE_PURPOSE"}),
 Object.freeze({id:"holy_family_novena",reason:"Nine-day programme is not needed for a one-off family intention",status:"DEFER_EDITORIAL"}),
 Object.freeze({id:"baltimore_dying_prayers",reason:"Already a dedicated Good Death / Dying Companion owner",status:"RETAIN_EXISTING_OWNER"})
]);
