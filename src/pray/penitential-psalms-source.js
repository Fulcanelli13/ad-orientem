/**
 * Seven Penitential Psalms: source acceptance ledger, not a copy of Scripture.
 * Existing Catholic Scripture service remains the only text owner, with
 * traditional Vulgate numbering in the Prayer interface.
 */
export const PENITENTIAL_PSALMS_VULGATE=Object.freeze([
 Object.freeze({trad:6,modern:6}),
 Object.freeze({trad:31,modern:32}),
 Object.freeze({trad:37,modern:38}),
 Object.freeze({trad:50,modern:51}),
 Object.freeze({trad:101,modern:102}),
 Object.freeze({trad:129,modern:130}),
 Object.freeze({trad:142,modern:143})
]);
export function penitentialPsalmReference(psalm){return "Psalms "+psalm.trad+":1"}
export function auditPenitentialPsalmResponse(data){
 const result={};
 for(const [lang,field] of [["en","englishChapter"],["fr","frenchChapter"],["la","latinChapter"]]){
  const rows=Array.isArray(data?.[field])?data[field]:[];
  const nums=rows.map(x=>Number(x.verse));
  const nonempty=rows.every(x=>String(x.text??x.value??"").trim().length>0);
  const ordered=nums.every((x,i)=>Number.isInteger(x)&&x>=0&&(!i||x>nums[i-1]));
  const gaps=nums.flatMap((x,i)=>i&&x-nums[i-1]>1?[[nums[i-1],x]]:[]);
  result[lang]=Object.freeze({verses:rows.length,first:nums[0]??null,last:nums.at(-1)??null,
    uniqueOrdered:ordered,nonempty,contiguous:gaps.length===0,gaps:Object.freeze(gaps)});
 }
 return Object.freeze(result);
}
export const PENITENTIAL_PSALMS_TEXT_STATUS=Object.freeze({
 owner:"AO_RUNTIME_V8.scriptureService",
 translations:Object.freeze({en:"Douay–Rheims/CPDV corpus",fr:"Crampon 1923",la:"Vulgate source owned by Scripture"}),
 offline:"User-initiated verified warm-cache, not a permanent in-repository Bible edition",
 verification:"No full seven-psalm verse concordance has yet been independently certified"
});
