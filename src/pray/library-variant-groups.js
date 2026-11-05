// Presentation-only grouping for distinct, source-owned canonical prayer forms.
// Never deduplicate text or convert a historical edition into the other form.
export const PRAYER_LIBRARY_VARIANT_FAMILIES_V1=Object.freeze({
 litany_loreto:Object.freeze({
  en:"Litany of Loreto",fr:"Litanies de Lorette",
  ids:Object.freeze(["litany_loreto_1962","litany_loreto_current"])
 }),
 eternal_rest:Object.freeze({
  en:"Eternal Rest",fr:"Repos éternel",
  ids:Object.freeze(["foundations_eternal_rest","dead_eternal_rest_singular"])
 })
});
export const PRAYER_LIBRARY_VARIANT_OWNER_V1=Object.freeze(Object.fromEntries(
 Object.entries(PRAYER_LIBRARY_VARIANT_FAMILIES_V1).flatMap(([family,group])=>
  group.ids.map(id=>[id,family]))
));
export function libraryVariantFamily(id){return PRAYER_LIBRARY_VARIANT_OWNER_V1[id]||null}

// Group only records already admitted by the Library's current search/category
// filter. Keep every original prayer ID and source witness reachable, including
// a single matching form when a search narrows a family.
export function groupLibraryPrayerRows(rows){
 const result=[],groups=new Map();
 for(const prayer of rows){
  const family=libraryVariantFamily(prayer.id);
  if(!family){result.push({kind:"single",prayer});continue}
  let group=groups.get(family);
  if(!group){
   group={kind:"variants",family,prayers:[]};
   groups.set(family,group);result.push(group);
  }
  group.prayers.push(prayer);
 }
 return result;
}
