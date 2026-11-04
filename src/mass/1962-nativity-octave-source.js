// 1962 Roman Missal, Christmas Octave's source-owned privileged orations.
// Source identity is the literal 12/26 + 12/28 original [Commemoratio]
// sections, each matched in full against the trilingual Third Mass of
// Christmas (Sancti/12-25m3). This is NOT the synthetic [Rule] ignore
// 12-26c / 12-28c source, nor the St Stephen alternate [Oratio1].
// The octave commemoration is privileged (1960 General Rubrics 108,109(c)).
// Only the two independently attested 2026 source-selected Masses qualify.
export const NATIVITY_OCTAVE_1962_SOURCE_SCHEMA="ao-1962-nativity-octave-exact-oration-recovery-v1";
const owners=Object.freeze({
 "2026-12-26":Object.freeze({
  source:"Sancti/12-26",id:"sancti:12-26:2:r",placeholder:"Sancti/12-26c"
 }),
 "2026-12-28":Object.freeze({
  source:"Sancti/12-28",id:"sancti:12-28:2:r",placeholder:"Sancti/12-28c"
 })
});
const donor="Sancti/12-25m3";
const sections=Object.freeze([
 Object.freeze({plural:"collects",single:"collect",section:"Oratio"}),
 Object.freeze({plural:"secrets",single:"secret",section:"Secreta"}),
 Object.freeze({plural:"postcommunions",single:"postcommunion",section:"Postcommunio"})
]);
const norm=s=>String(s??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/[æǽ]/g,"ae").replace(/[œ]/g,"oe")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const nonempty=v=>Boolean(String(v??"").trim());
const full=row=>Boolean(row&&["lat","en","fr"].every(lang=>nonempty(row[lang])));
const header=s=>/^\s*!|^\s*\*?Pro Octava Nativitatis/i.test(String(s));
const plain=rows=>(rows??[]).filter(s=>!header(s)&&!/^\s*\$/.test(String(s)))
 .map(s=>String(s).replace(/~\s*/g," ")).join(" ").trim();
const ending=rows=>String(rows?.at(-1)??"").trim().replace(/^\$/,"").toLowerCase();
const endings=Object.freeze({
 "Per eundem":Object.freeze({
  lat:"Per eúndem Dóminum nostrum Jesum Christum, Fílium tuum: Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
  en:"Through the same Lord Jesus Christ, Thy Son, Who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
  fr:"Par le même Jésus-Christ, votre Fils, notre Seigneur, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il."
 }),
 "Qui tecum":Object.freeze({
  lat:"Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
  en:"Who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
  fr:"Lui qui vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il."
 })
});
function expansion(section,raw,language){
 const suffix=ending(raw);
 const expected=section==="Postcommunio"?"qui tecum":"per eundem";
 if(suffix!==expected&&!(expected==="per eundem"&&suffix==="per eumdem"))return null;
 return endings[expected==="qui tecum"?"Qui tecum":"Per eundem"][language];
}
const sectionData=(parsed,section)=>parsed?.map?.get?.(section);
const rowList=(data,plural,single)=>Array.isArray(data?.[plural])&&data[plural].length
 ?data[plural]:data?.[single]?[data[single]]:[];

// The genuine 1962 high-rank source can have an *alternative* St Stephen
// Oratio1 in place of the octave Collect. It is an alternative for Stephen,
// not a second prayer and cannot be silently turned into a commemoration.
async function originalStephenAlternative(data,hostResolver,diagnostic){
 const r=rowList(data,"collects","collect");
 if(r.length!==2||!full(r[0])||!nonempty(r[1]?.lat)||nonempty(r[1]?.en))return false;
 for(const [sourceLang,key] of [["la","lat"],["fr","fr"]]){
  const parsed=await hostResolver.resolveSource("Sancti/12-26",sourceLang,diagnostic);
  const original=plain(sectionData(parsed,"Oratio1"));
  if(!original||!norm(String(r[1]?.[key]??"")).startsWith(norm(original).slice(0,80)))
    return false;
 }
 return true;
}

// Source text is never composed or translated. The only word supplied here
// is the expanded *standard Missal conclusion siglum*, already printed in
// its own LAT/EN/FR version. Unknown sigla or duplicate original texts fail.
export async function recover1962NativityOctaveCommemoration({
 data,principalId,calendarDate,hostResolver,diagnostic
}={}){
 const owner=owners[calendarDate];
 if(!owner||!data||String(data.sourcePath)!==owner.source||
   String(principalId)!==owner.id||
   data.principalCelebrationId&&data.principalCelebrationId!==owner.id||
   data.appliedCommemorations?.length||data.omittedCommemorations?.length||
   data.calendarCommemorations?.length!==1)return null;
 const comm=data.calendarCommemorations[0];
 if(comm?.path!==owner.placeholder||comm?.prayerSourcePath!==owner.placeholder||
    comm?.inseparable)return null;
 const initial={};
 for(const {plural,single} of sections){
  const r=rowList(data,plural,single);
  if(r.length<1||r.length>2||!full(r[0])||r.some(x=>x?.oneConclusion))return null;
  initial[plural]=r;
 }
 const alternative=calendarDate==="2026-12-26"&&initial.collects.length===2
    ?await originalStephenAlternative(data,hostResolver,diagnostic):false;
 if(calendarDate==="2026-12-26"&&initial.collects.length===2&&!alternative)return null;
 if(calendarDate==="2026-12-28"&&sections.some(s=>initial[s.plural].length!==1))return null;
 if(initial.secrets.length!==1||initial.postcommunions.length!==1)return null;

 const verified={};
 for(const {section,plural} of sections){
  const translated={};
  for(const [sourceLang,language] of [["la","lat"],["en","en"],["fr","fr"]]){
   const [principal,christmas]=await Promise.all([
    hostResolver.resolveSource(owner.source,sourceLang,diagnostic),
    hostResolver.resolveSource(donor,sourceLang,diagnostic)
   ]);
   const emb=sectionData(principal,"Commemoratio "+section);
   const named=sectionData(christmas,section);
   if(!Array.isArray(emb)||!Array.isArray(named)||
      emb.length<2||named.length<2||
      !plain(emb)||!plain(named)||
      norm(plain(emb))!==norm(plain(named)))return null;
   const close=expansion(section,named,language);
   // Original embedded reference must carry the same Missal conclusion.
   if(!close||ending(emb)!==ending(named))return null;
   translated[language]=plain(named)+"\n"+close;
  }
  if(!full(translated))return null;
  verified[plural]=Object.freeze({...translated,sourcePath:donor,
   sourceSection:section,sourceOwner:owner.source,
   commemorationLabel:"OCTAVE_OF_THE_NATIVITY"});
 }
 const next={...data};
 for(const {plural,single} of sections){
  const r=initial[plural];
  // The sole current extra Collect on St Stephen is its Oratio1
  // alternative, not a valid second collect. Original remains available
  // in primary source and is retained in transparent provenance.
  next[plural]=Object.freeze([r[0],verified[plural]]);
  next[single]=r[0];
 }
 next.sourceEditorialCorrections=Object.freeze([
  ...(data.sourceEditorialCorrections??[]),
  ...sections.map(({section})=>Object.freeze({
   id:"1962_CHRISTMAS_OCTAVE_PRIVILEGED_ORATION",
   sourcePath:owner.source,misleadingPlaceholder:owner.placeholder,
   sourceSection:"Commemoratio "+section,verifiedSource:donor,
   privilege:"RG_109_C",sourceSectionParity:"FULL_3_LANGUAGES",
   originalAlternativeStephenOratio1Excluded:Boolean(alternative&&section==="Oratio"),
   originalSourcePreserved:true,addedTranslation:false
  }))
 ]);
 next.verifiedNativityOctaveCommemoration=Object.freeze({
  status:"SOURCE_VERIFIED",schema:NATIVITY_OCTAVE_1962_SOURCE_SCHEMA,
  calendarDate,principalId:owner.id,principalSource:owner.source,
  originalChristmasSource:donor,commemorationPlaceholder:owner.placeholder,
  privilege:"RG_108_AND_109_C",availableMassForms:"ALL",
  originalAlternativeStephenOratio1Excluded:alternative,
  orationCount:2
 });
 return Object.freeze(next);
}
