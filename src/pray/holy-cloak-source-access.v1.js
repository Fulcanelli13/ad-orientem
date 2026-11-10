/** Holy Cloak of St Joseph — source-only, NOT a transcribed Prayer reader.
 * User-requested 30-day devotional access, with separate edition witnesses.
 * All thirty occasions repeat one complete reading; do not manufacture
 * thirty independent historical day prayers or treat a modern translation
 * as the printed 1882 Italian witness.
 * A complete local English/French reader needs source/edition and rights review.
 */
export const HOLY_CLOAK_SOURCE_ACCESS_V1=Object.freeze({
 id:"st_joseph_holy_cloak_30_days",
 subject:"VI",
 titleEn:"Holy Cloak of St Joseph · 30 days",
 titleFr:"Saint Joseph · Sacré Manteau, trente jours",
 searchTerms:Object.freeze(["holy cloak","st joseph","saint joseph","sacred mantle","sacro manto","manteau de saint joseph","thirty days","30 days","trente jours"]),
 schedule:Object.freeze({dayCount:30,sameCompleteDailyForm:true,distinctDailyPrayers:0}),
 primary:Object.freeze({
  url:"https://mhocsa.org.au/holy-cloak-of-st-joseph/",
  labelEn:"Complete English prayer · Catholic parish",
  labelFr:"Prière complète en anglais · paroisse catholique",
  form:"FIVE_SECTION_ENGLISH_PRESENTATION",
  language:"en",
  sourcePublicationPeriod:"MODERN_WEB_PRESENTATION",
  printEditionCollated:false,
  reuseRightsCertified:false
 }),
 otherWitnesses:Object.freeze([
  Object.freeze({
   url:"https://www.heartsoftheholyfamily.org/prayers",
   form:"SIX_SECTION_ENGLISH_PRESENTATION_WITH_ADDITIONAL_CLOSING_PRAYER",
   language:"en",printEditionCollated:false
  }),
  Object.freeze({
   url:"https://giovanidelrosario.altervista.org/?p=407",
   form:"CLAIMED_1882_ITALIAN_NINETEEN_NUMBERED_PASSAGES_WITH_IMAGE_ONLY_TEXT",
   language:"it",printEditionCollated:false
  })
 ]),
 nativePrayerTextIncluded:true,
 nativePrayerLanguage:"it",
 nativePrayerSourceId:"st_joseph_holy_cloak_italian",
 nativePrayerSectionCount:19,
 nativePrayerAvailableLanguages:Object.freeze(["it","en","fr"]),
 modernEditorialTranslationLanguages:Object.freeze(["en","fr"]),
 nativePrayerReadingSteps:23,
 frenchPrayerTextIncluded:true,
 historicFrenchPrayerTextCertified:false,
 editorialTranslationReviewed:false,
 originalItalianPrintCertified:false,
 historicalIndulgencesCurrent:false,
 sourceAccessStatus:"NATIVE_OFFLINE_IT_SOURCE_WITH_MODERN_EN_FR_EDITORIAL_TRANSLATIONS_PENDING_REVIEW_NOT_HISTORICAL_PRINT_CERTIFIED"
});
export function holyCloakSourceMatches({search="",subject="all",category="all"}={}){
 if(category!=="all"||(subject!=="all"&&subject!=="VI"))return false;
 const q=String(search||"").trim().toLocaleLowerCase();
 return !q||HOLY_CLOAK_SOURCE_ACCESS_V1.searchTerms.concat([HOLY_CLOAK_SOURCE_ACCESS_V1.titleEn.toLocaleLowerCase(),HOLY_CLOAK_SOURCE_ACCESS_V1.titleFr.toLocaleLowerCase()])
  .some(term=>term.includes(q)||q.includes(term));
}
