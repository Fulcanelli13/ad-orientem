/**
 * Shared Scripture face resolver for Seven Penitential Psalms and Gospel Words.
 * Source text is owned by the canonical Catholic Scripture service; never
 * invent a missing language or allow toggling into an empty witness.
 */
const fields=Object.freeze({en:"englishChapter",fr:"frenchChapter",la:"latinChapter"});
export function prayerScriptureStageFacesV1(data,requested="en",full=false){
 const locale=requested==="fr"?"fr":"en";
 const reference=data?.reference;
 const sourceRows=Object.fromEntries(Object.entries(fields).map(([language,field])=>{
  const input=Array.isArray(data?.[field])?data[field]:[];
  const bounded=!full&&Number.isFinite(Number(reference?.start))&&Number.isFinite(Number(reference?.end));
  const filtered=bounded?input.filter(v=>Number(v.verse)>=Number(reference.start)&&Number(v.verse)<=Number(reference.end)):input;
  return [language,filtered.filter(v=>typeof (v?.text||v?.value)==="string"&&String(v.text||v.value).trim())];
 }));
 const available=language=>sourceRows[language].length>0;
 const vernacularLanguage=available(locale)?locale:available(locale==="fr"?"en":"fr")?(locale==="fr"?"en":"fr"):null;
 const primaryLanguage=vernacularLanguage||(available("la")?"la":null);
 const latinRows=available("la")?sourceRows.la:[];
 const vernacularRows=vernacularLanguage?sourceRows[vernacularLanguage]:[];
 return Object.freeze({
  requested:locale,primaryLanguage,
  vernacularLanguage,
  primaryRows:primaryLanguage==="la"?latinRows:vernacularRows,
  vernacularRows,latinRows,
  canFlip:vernacularRows.length>0&&latinRows.length>0,
  fallback:primaryLanguage!==null&&primaryLanguage!==locale,
  unavailable:primaryLanguage===null
 });
}
