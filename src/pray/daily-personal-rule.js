/**
 * User-owned daily rule over exact-edition St Pius X texts.
 * Complete preconciliar prayers and separately identified traditional
 * liturgical excerpts are optional, never silently presented as St Pius X
 * or machine-translated into another language.
 * Saves only source IDs/edition/language; no prayer content or examination.
 */
import {DAILY_PERSONAL_PRAYER_SOURCE_V1 as CORPUS} from "./daily-personal-prayer-source.js";
import {prayerAcquisitionCandidates} from "./prayer-acquisition-historical-witnesses.v1.js";
import {reviewedDailyAlternative,reviewedDailyPurpose,DAILY_PURPOSES,REVIEWED_DAILY_STAGE_ALTERNATIVES} from "./daily-stage-alternative-review.js";

export const DAILY_PERSONAL_RULE_STORAGE_KEY="ao.pray.personal-rule.v1";
const LANGS=new Set(["la","en","fr"]);
const EDITIONS=new Set(["1905","1913"]);
const PARTS=["morning","evening"];
const MODES=new Set(["standard","expanded"]);
const LENGTHS=new Set(["full","brief"]);
/** Ad Orientem-curated personal subsets of the existing whole, ordered prayers.
 * These are not independent historical editions of St Pius X. */
export const PERSONAL_BRIEF_PRAYER_IDS=Object.freeze({
 "1913":Object.freeze({
  morning:Object.freeze(["sign-of-cross","daily-prayer","our-father","hail-mary","salve-regina","guardian-angel"]),
  evening:Object.freeze(["daily-prayer","our-father","hail-mary","examen","contrition"])
 }),
 "1905":Object.freeze({
  morning:Object.freeze(["sign-of-cross","daily-prayer","our-father","hail-mary","salve-regina","guardian-angel"]),
  evening:Object.freeze(["daily-prayer","our-father","hail-mary","contrition"])
 })
});
/** User selections are stored independently for each edition and daypart.
 * An absent override means the published Personal Brief starter selection. */
function briefCore(edition,daypart){
 return CORPUS.editions[edition].dayparts[daypart].filter(row=>row.kind!=="supplement");
}
function normalizeBriefOverride(raw,edition,daypart){
 if(!Array.isArray(raw))return null;
 const core=briefCore(edition,daypart);
 const known=new Set(core.map(row=>row.id));
 // Reject malformed overrides rather than quietly dropping an unintended
 // source, and never create an empty or full-length "Brief".
 if(raw.length<1||raw.length>=core.length||new Set(raw).size!==raw.length||raw.some(id=>typeof id!=="string"||!known.has(id)))return null;
 const chosen=new Set(raw);
 return core.filter(row=>chosen.has(row.id)).map(row=>row.id);
}
export function personalDailyBriefIds(edition,daypart,prefs){
 if(!EDITIONS.has(edition)||!PARTS.includes(daypart))throw new RangeError("Invalid Personal Brief source");
 const chosen=normalizeBriefOverride(prefs?.briefSelections?.[edition]?.[daypart],edition,daypart);
 return chosen||[...PERSONAL_BRIEF_PRAYER_IDS[edition][daypart]];
}
const EDITION_SUPPLEMENT_IDS=new Set(["piusx-1913-de-profundis","piusx-1913-jesus-joseph-mary"]);
const ids=new Set([...CORPUS.additional.map(x=>x.id),...EDITION_SUPPLEMENT_IDS]);
function editionSupplements(language){
 const original=CORPUS.editions["1913"],list=original.dayparts.evening.filter(x=>x.kind==="supplement");
 return list.map(row=>({
  id:row.id==="de-profundis"?"piusx-1913-de-profundis":"piusx-1913-jesus-joseph-mary",
  lang:language,daypart:"evening",kind:"additional",slot:"supplement",
  title:language==="fr"?row.titleFr:row.titleEn,
  sourceLabel:row.sourceLabel,sourceUrl:row.sourceUrl,
  text:row.text?.[language]||null,
  legacyPrayerId:row.id==="de-profundis"?"dead_de_profundis":null,
  sourceExact:row.sourceExact
 }));
}
const allowed=(arr,lang,daypart)=>arr.filter(x=>x.lang===lang && x.daypart===daypart);

export function defaultPersonalDailyPrefs(language="en"){
 return {version:1,edition:"1913",language:LANGS.has(language)?language:"en",
  mode:"standard",length:"full",variants:{morning:{},evening:{}},purposeSelections:{morning:{},evening:{}},
  briefSelections:{},
  extras:{morning:[],evening:[]}};
}
export function normalizePersonalDailyPrefs(raw,language="en"){
 const fallback=defaultPersonalDailyPrefs(language);
 if(!raw||raw.version!==1||typeof raw!=="object"||Array.isArray(raw))return fallback;
 const prefs={
  version:1,edition:EDITIONS.has(raw.edition)?raw.edition:fallback.edition,
  language:LANGS.has(raw.language)?raw.language:fallback.language,
  mode:MODES.has(raw.mode)?raw.mode:fallback.mode,
  length:LENGTHS.has(raw.length)?raw.length:fallback.length,
  variants:{},extras:{},purposeSelections:{},briefSelections:{}
 };
 for(const edition of EDITIONS){
  const selections={};
  for(const part of PARTS){
   const chosen=normalizeBriefOverride(raw.briefSelections?.[edition]?.[part],edition,part);
   if(chosen)selections[part]=chosen;
  }
  if(Object.keys(selections).length)prefs.briefSelections[edition]=selections;
 }
 for(const part of PARTS){
  const variants=raw.variants?.[part];
  prefs.variants[part]={};
  prefs.purposeSelections[part]={};
  if(variants&&typeof variants==="object"&&!Array.isArray(variants)){
   for(const [slot,id] of Object.entries(variants)){
    if(!/^(daily-prayer|faith|hope|charity|contrition)$/.test(slot))continue;
    const item=CORPUS.additional.find(x=>x.id===id&&x.daypart===part&&
      (x.kind==="variant"&&x.slot===slot||
       x.kind==="additional"&&reviewedDailyAlternative(x.id,part,slot)));
    if(item)prefs.variants[part][slot]=id;
    else{
     // Non-destructive B07 migration: a saved Offering/Thanksgiving selection
     // is moved to its own purpose, not silently erased or left replacing
     // the complete St Pius X combined opening.
     const rule=REVIEWED_DAILY_STAGE_ALTERNATIVES[id];
     if(slot==="daily-prayer"&&rule?.scope==="narrower"&&rule.daypart===part)
      prefs.purposeSelections[part][rule.purpose]=id;
    }
   }
  }
  // Explicit B08 purpose choices take precedence over B07 migration.
  const sourcePurposes=raw.purposeSelections?.[part];
  if(sourcePurposes&&typeof sourcePurposes==="object"&&!Array.isArray(sourcePurposes)){
   for(const purpose of DAILY_PURPOSES[part]){
    const id=sourcePurposes[purpose];
    if(typeof id==="string"&&reviewedDailyPurpose(id,part,purpose))
     prefs.purposeSelections[part][purpose]=id;
   }
  }
  const original=raw.extras?.[part];
  prefs.extras[part]=Array.isArray(original)?[...new Set(original.filter(id=>ids.has(id)&&CORPUS.additional.some(x=>x.id===id&&x.daypart===part&&x.kind==="additional"||EDITION_SUPPLEMENT_IDS.has(id)&&part==="evening")))].slice(0,40):[];
 }
 return prefs;
}
export function loadPersonalDailyPrefs(storage,language="en"){
 try{
  const text=storage?.getItem?.(DAILY_PERSONAL_RULE_STORAGE_KEY);
  if(!text||text.length>8192)return defaultPersonalDailyPrefs(language);
  return normalizePersonalDailyPrefs(JSON.parse(text),language);
 }catch{return defaultPersonalDailyPrefs(language)}
}
export function savePersonalDailyPrefs(storage,prefs,language="en"){
 const validated=normalizePersonalDailyPrefs(prefs,language);
 try{storage?.setItem?.(DAILY_PERSONAL_RULE_STORAGE_KEY,JSON.stringify(validated));return true}catch{return false}
}
/** Publish independently verified 1908 source-language alternatives without
 * altering St Pius X's printed 1905/1913 dayparts or the locked prayer bank.
 * Unreleased witnesses, and English text in a French session, fail closed.
 */
function clearedMorningOfferings(daypart,language){
 if(daypart!=="morning")return [];
 return prayerAcquisitionCandidates("self_offering",{language}).map(w=>Object.freeze({
  id:w.id,lang:w.language,daypart:"morning",kind:"additional",
  slot:"offering",purpose:"offering",title:w.title,
  sourceLabel:"F. X. Lasance, My Prayer-Book (1908), p. "+w.source.page,
  sourceUrl:w.source.scanPageUrl,
  sourceImageChecked:true,text:w.text
 }));
}
export function personalDailyOptions(daypart,language,edition="1913"){
 if(!PARTS.includes(daypart)||!LANGS.has(language))return [];
 return [
  ...allowed(CORPUS.additional,language,daypart),
  ...clearedMorningOfferings(daypart,language),
  ...(edition==="1913"&&daypart==="evening"?editionSupplements(language):[])
 ];
}
export function personalDailyEdition(edition){
 return CORPUS.editions[EDITIONS.has(edition)?edition:"1913"];
}
/**
 * The 1913 De Profundis and Jesus/Joseph/Mary are labelled "supplement"
 * in that edition; only selected optional complete prayers follow the core.
 * No cross-language fallback: a choice unavailable in Latin is invisible in
 * Latin rather than shown with English words.
 */
export function buildPersonalDailyPlan({daypart="morning",prefs=defaultPersonalDailyPrefs()}={}){
 if(!PARTS.includes(daypart))throw new RangeError("Invalid daily prayer daypart");
 const p=normalizePersonalDailyPrefs(prefs);
 const edition=personalDailyEdition(p.edition),language=p.language;
 const fullNative=edition.dayparts[daypart];
 const briefIDs=personalDailyBriefIds(p.edition,daypart,p);
 const native=p.length==="brief"?fullNative.filter(x=>briefIDs.includes(x.id)):fullNative;
 // Do not silently omit/reorder an invalid source ID.
 if(p.length==="brief"&&(native.length!==briefIDs.length||native.some((x,i)=>x.id!==briefIDs[i])))throw new Error("Invalid Personal Brief source selection");
 const options=personalDailyOptions(daypart,language,p.edition);
 const variants=options.flatMap(item=>{
  if(item.kind==="variant")return [item];
  const rule=item.kind==="additional"&&reviewedDailyAlternative(item.id,daypart,"contrition");
  return rule?[{...item,kind:"reviewed-variant",slot:rule.slot,choiceLabel:rule.label,
    replacementFocus:rule.purpose,replacementScope:rule.scope}]:[];
 });
 const purposeChoices=DAILY_PURPOSES[daypart].map(purpose=>({
  purpose,
  options:options.flatMap(item=>{
   const rule=item.kind==="additional"&&reviewedDailyPurpose(item.id,daypart,purpose);
   return rule?[{...item,kind:"purpose-prayer",purpose,choiceLabel:rule.label}]:[];
  })
 })).filter(x=>x.options.length>0);
 const selectedPurposes=Object.fromEntries(purposeChoices.flatMap(({purpose,options})=>{
  const id=p.purposeSelections[daypart][purpose];
  return options.some(x=>x.id===id)?[[purpose,id]]:[];
 }));
 const chosen=Object.fromEntries(Object.entries(p.variants[daypart]).filter(([slot,id])=>variants.some(x=>x.id===id&&x.slot===slot)));
 const primary=native.filter(x=>x.kind!=="supplement").map((row,index)=>{
  if(row.kind==="guided")return {...row,id:"piusx-"+p.edition+"-"+daypart+"-examen",kind:"personal-examen",sourceId:"examen",index};
  const replacement=variants.find(x=>x.slot===row.id&&x.id===chosen[row.id]);
  const body=replacement?.text||row.text?.[language];
  // Fail closed on source gaps; never fall back to a foreign language.
  return {id:"piusx-"+p.edition+"-"+daypart+"-"+row.id,
   sourceId:row.id,kind:"personal-prayer",title:replacement?replacement.title:(language==="fr"?row.titleFr:row.titleEn),
   text:body||null,latinText:replacement?null:row.text?.la||null,language,sourceLabel:replacement?.sourceLabel||row.sourceLabel,
   sourceUrl:replacement?.sourceUrl||row.sourceUrl,
   sourceStatus:replacement?"printed-manual-form":row.translationStatus||"source-edition-translation",
   replacementId:replacement?.id||null,
   replacementFocus:replacement?.replacementFocus||null,
   replacementScope:replacement?.replacementScope||null,
   missing:!body,index,sourceExact:replacement?true:row.sourceExact};
 });
 const extrasById=new Map(personalDailyOptions(daypart,language,p.edition).filter(x=>x.kind==="additional").map(x=>[x.id,x]));
 const selected=p.length==="full"&&p.mode==="expanded"?p.extras[daypart].filter(id=>extrasById.has(id)):[];
 const extras=selected.map(id=>optionalPersonalPrayerRow(extrasById.get(id),language));
 // Append selected complete optional devotions in the order saved by the
 // user. The printed catechism's mandatory stages retain their exact order.
 return {mode:"personal",daypart,edition:p.edition,language,length:p.length,brief:p.length==="brief",expanded:p.length==="full"&&p.mode==="expanded",
  rows:[...primary,...extras],selectedExtras:selected,
  briefCandidates:fullNative.filter(row=>row.kind!=="supplement").map(row=>({id:row.id,kind:row.kind,
    title:language==="fr"?row.titleFr:row.titleEn,sourceLabel:row.sourceLabel})),
  briefIds:briefIDs,briefCustom:Boolean(p.briefSelections[p.edition]?.[daypart]),
  offeredExtras:[...extrasById.values()],availableVariants:variants,purposeChoices,selectedPurposes,
  sourceLabel:edition.sourceLabel,sourceUrl:edition.sourceUrl};
}
/** One immutable source-owned view for both a saved optional extra and
 * direct reading. Direct entry must not require recording a purpose choice
 * or adding an optional text to St Pius X's fixed printed sequence.
 */
function optionalPersonalPrayerRow(item,language){
 return {id:"personal-extra-"+item.id,sourceId:item.id,
  kind:item.legacyPrayerId?"personal-legacy":"personal-prayer",
  legacyId:item.legacyPrayerId||null,title:item.title,language,text:item.text,
  sourceLabel:item.sourceLabel,sourceUrl:item.sourceUrl,
  sourceStatus:item.purpose?.startsWith("historical-office-")
   ?"complete-optional-liturgical-selection":"complete-additional-manual-prayer",
  sourceContextEn:item.sourceContextEn||null,sourceContextFr:item.sourceContextFr||null,
  optional:true,sourceExact:true};
}
/** Read one unmodified source prayer without adding it to the daily rule.
 * Both the printed edition and optional source-language corpus are searchable.
 * Personal Brief inclusions and saved extras are never changed here. */
export function personalDailyDirectPlan({daypart="morning",prefs=defaultPersonalDailyPrefs(),sourceId}={}){
 if(!PARTS.includes(daypart)||typeof sourceId!=="string")return null;
 const p=normalizePersonalDailyPrefs(prefs);
 const full={...p,length:"full",mode:"standard",variants:{morning:{},evening:{}}};
 const base=buildPersonalDailyPlan({daypart,prefs:full});
 let selected=base.rows.find(row=>row.sourceId===sourceId);
 if(!selected){
  const item=personalDailyOptions(daypart,p.language,p.edition).find(row=>row.id===sourceId&&row.kind==="additional");
  if(!item)return null;
  selected=optionalPersonalPrayerRow(item,p.language);
 }
 return selected?{...base,rows:[selected],direct:true,sourceId,selectedExtras:[]}:null;
}
export function changePersonalDailyPrefs(prefs,{action,daypart="morning",value,language}={}){
 const p=normalizePersonalDailyPrefs(prefs,language);
 if(action==="edition"&&EDITIONS.has(value))p.edition=value;
 else if(action==="language"&&LANGS.has(value))p.language=value;
 else if(action==="mode"&&MODES.has(value))p.mode=value;
 else if(action==="length"&&LENGTHS.has(value))p.length=value;
 else if(action==="reset")return defaultPersonalDailyPrefs(p.language);
 else if(action==="brief-toggle"&&p.length==="brief"&&PARTS.includes(daypart)&&typeof value==="string"){
  const core=briefCore(p.edition,daypart);
  if(core.some(row=>row.id===value)){
   const existing=personalDailyBriefIds(p.edition,daypart,p);
   const chosen=new Set(existing);
   if(chosen.has(value)){
    if(chosen.size>1)chosen.delete(value);
   }else if(chosen.size<core.length-1)chosen.add(value);
   const ordered=core.filter(row=>chosen.has(row.id)).map(row=>row.id);
   if(ordered.length!==existing.length||ordered.some((id,i)=>id!==existing[i])){
    p.briefSelections[p.edition]??={};
    p.briefSelections[p.edition][daypart]=ordered;
   }
  }
 }
 else if(action==="brief-reset"&&p.length==="brief"&&PARTS.includes(daypart)){
  if(p.briefSelections[p.edition]){
   delete p.briefSelections[p.edition][daypart];
   if(!Object.keys(p.briefSelections[p.edition]).length)delete p.briefSelections[p.edition];
  }
 }
 else if(PARTS.includes(daypart)){
  const options=personalDailyOptions(daypart,p.language,p.edition);
  if(action==="variant"){
   const item=options.find(x=>x.id===value&&(x.kind==="variant"||
    x.kind==="additional"&&Boolean(reviewedDailyAlternative(x.id,daypart,"contrition"))));
   if(item){
    const rule=item.kind==="additional"?reviewedDailyAlternative(item.id,daypart,"contrition"):null;
    const slot=rule?.slot||item.slot;
    if(p.variants[daypart][slot]===value)delete p.variants[daypart][slot];
    else p.variants[daypart][slot]=value;
   }
  }
  if(action==="purpose"){
   if(typeof value==="string"&&value.startsWith("none:")){
    const purpose=value.slice(5);
    if(DAILY_PURPOSES[daypart].includes(purpose))delete p.purposeSelections[daypart][purpose];
   }else{
    const item=options.find(x=>x.id===value&&x.kind==="additional");
    const rule=item&&REVIEWED_DAILY_STAGE_ALTERNATIVES[item.id];
    if(rule?.scope==="narrower"&&rule.daypart===daypart&&DAILY_PURPOSES[daypart].includes(rule.purpose))
     p.purposeSelections[daypart][rule.purpose]=item.id;
   }
  }
  if(action==="extra"){
   const item=options.find(x=>x.id===value&&x.kind==="additional");
   if(item){
    const arr=p.extras[daypart];
    if(arr.includes(value))p.extras[daypart]=arr.filter(x=>x!==value);
    else p.extras[daypart]=[...arr,value];
    if(p.extras[daypart].length)p.mode="expanded";
   }
  }
  if(action==="move"&&typeof value==="string"){
   const [id,direction]=value.split("|"),arr=p.extras[daypart];
   const from=arr.indexOf(id),to=from+(direction==="up"?-1:direction==="down"?1:0);
   if(from>=0&&to>=0&&to<arr.length&&from!==to)[arr[from],arr[to]]=[arr[to],arr[from]];
  }
 }
 return p;
}
export const PERSONAL_DAILY_SOURCE_COVERAGE=Object.freeze({
 editions:["1905","1913"],languages:["la","en","fr"],manualOptions:CORPUS.additional.length
});
