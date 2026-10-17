/**
 * MISSAL book copy: distinguish liturgical Latin from vernacular-only
 * editorial square-bracket rubrics. The Sung donor labels many of these
 * brackets in its "latin" column in ENGLISH: never print them as Latin.
 *
 * No translating or altering canonical prayers; only the presentation
 * choice of the already existing French/English witness is made here.
 */
export function missalSourceRubricCopy(paragraph,{language="en"}={}){
 if(paragraph?.kind!=="RUBRIC")return null;
 const vernacular=String(paragraph.secondary??paragraph.alternate??"").trim();
 const primary=String(paragraph.primary??"").trim();
 const isFrench=String(language).toLowerCase().startsWith("fr");
 // If a French witness is unavailable, do not pretend an English source
 // square bracket is actually Latin. Preserve it as untranslated evidence.
 const text=vernacular || primary;
 if(!text)return null;
 return Object.freeze({
   text:text.replace(/^\[([\s\S]*)\]$/,"$1").trim(),
   translationAvailable:Boolean(vernacular),
   requestedLanguage:isFrench?"fr":"en",
   isLiturgicalLatin:false,
   owner:"EXISTING_SOURCE_VERNACULAR_RUBRIC",
 });
}
/** A second-depth view is permitted ONLY for meaningful additional,
 * individually editorial-approved rubrical substance. Short gestures
 * and their identical action expansions NEVER qualify. */
export function shouldShowExtendedMissalRubric(detail){
 return Boolean(detail?.status==="APPROVED_ADDITIONAL_1962_CEREMONIAL_TEXT" &&
   detail?.owner==="MISSAL_RUBRIC_LONG_CERTIFIED" &&
   detail?.materiallyAdditional===true &&
   typeof detail?.description==="string" &&
   detail.description.trim().length>=45 &&
   typeof detail?.sourceUrl==="string" &&
   /^https:\/\//.test(detail.sourceUrl));
}
