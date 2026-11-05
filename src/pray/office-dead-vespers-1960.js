/**
 * 1960 votive Vespers of the Dead (for the faithful departed in general).
 * Fully source-derived, but NOT a public reader or exact printed-Breviary certificate.
 * Caller must supply the locally staged, pinned source bundles. No web fallback.
 *
 * Do not enable 2 November proper, personal deceased, or older-rubric variants
 * through this assembler: those have different source decisions.
 */
export const OFFICE_DEAD_VESPERS_1960_SOURCE_COMMIT="b9f8c8eb15d52b2b2c02e2ca24807cfaa73758f0";
export const OFFICE_DEAD_VESPERS_1960_CONTEXT="VOTIVE_GENERAL_DEPARTED_1960";
export const OFFICE_DEAD_VESPERS_1960_PSALMS=Object.freeze([114,119,120,129,137]);

const LOCALES=Object.freeze(["la","en","fr"]);
const freeze=Object.freeze;
const requireText=(s,id)=>{
 if(typeof s!=="string"||s.trim().length===0)throw new Error("Office of Dead missing pinned witness: "+id);
 return s.trim();
};
function section(raw,key){
 const markers=[...requireText(raw,"source").matchAll(/^\[([^\]\n]+)\][^\n]*\r?\n/gm)];
 const i=markers.findIndex(m=>m[1]===key);
 if(i<0)throw new Error("Office of Dead source section missing: "+key);
 return requireText(raw.slice(markers[i].index+markers[i][0].length,markers[i+1]?.index??raw.length),key);
}
function sourced(bundle,locale,predicate,description){
 const hit=bundle.files?.filter(row=>row.locale===locale&&predicate(row))??[];
 if(hit.length!==1)throw new Error("Office of Dead "+locale+" "+description+" source uniqueness failed");
 if(!/^[a-f0-9]{40}$/.test(hit[0].blobSha))throw new Error("Office of Dead source blob SHA missing: "+description);
 return requireText(hit[0].raw,locale+" "+description);
}
function assertRevision(bundle,label){
 if(bundle?.sourceCommit!==OFFICE_DEAD_VESPERS_1960_SOURCE_COMMIT)
  throw new Error("Office of Dead "+label+" revision mismatch");
}
function normalizedAntiphon(text){
 // Under the 1960 rubrics both recitations are complete. '*' indicates
 // the musical intonation division, not omitted words.
 return text.replace(/\s*\*\s*/g," ").replace(/\s+/g," ").trim();
}
function antiphs(raw){
 const rows=section(raw,"Ant Vespera").split(/\r?\n/).filter(Boolean).map(row=>{
  const m=row.match(/^(.*);;(\d+)\s*$/);
  if(!m)throw new Error("Office of Dead Vespers antiphon lacks psalm ID: "+row);
  return {psalm:Number(m[2]),text:m[1].trim()};
 });
 if(rows.length!==5||rows.some((x,i)=>x.psalm!==OFFICE_DEAD_VESPERS_1960_PSALMS[i]))
  throw new Error("Office of Dead Vespers five-psalm source alignment failed");
 return rows;
}
function sourceLines(raw,id){
 const lines=requireText(raw,id).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(lines.some(x=>/^[@$&]/.test(x)||/^\(sed rubrica/.test(x)))
  throw new Error("Office of Dead unresolved macro in "+id);
 return lines;
}
function commonPrayer(raw,name){
 return sourceLines(section(raw,name),name);
}
function noLiteralMacro(lines,id){
 if(lines.some(s=>/^[@$&]/.test(s)||/\[unresolved\]/i.test(s)))throw new Error("Office of Dead unresolved "+id);
 return lines;
}
function makeLocale(locale,{proper,psalms,supplemental}){
 const c9=sourced(proper,locale,r=>r.leaf==="C9","C9");
 // 11-02 is source-captured, but NOT substituted into the separate votive Office.
 sourced(proper,locale,r=>r.leaf==="11-02","11-02");
 const ordinary=sourced(supplemental,locale,r=>r.part==="ORDINARY","ordinary");
 const magnificat=sourced(supplemental,locale,r=>r.part==="MAGNIFICAT","Magnificat");
 const requiem=commonPrayer(ordinary,"Requiem");
 const antiphons=antiphs(c9);
 const out=[];
 for(const ant of antiphons){
  const raw=sourced(psalms,locale,r=>r.psalm===ant.psalm,"psalm "+ant.psalm);
  const verses=sourceLines(raw,"Psalm "+ant.psalm);
  if(verses.length<5||!verses.every(x=>new RegExp("^"+ant.psalm+":").test(x)))
   throw new Error("Office of Dead incomplete psalm "+ant.psalm+" in "+locale);
  out.push(freeze({
   id:"V.P"+ant.psalm,kind:"PSALM",psalm:ant.psalm,
   antiphonBefore:ant.text,verses:freeze(verses),
   requiem:freeze([...requiem]),antiphonAfter:normalizedAntiphon(ant.text)
  }));
 }
 out.push(freeze({id:"V.VERSICLE",kind:"VERSICLE",lines:freeze(sourceLines(section(c9,"Versum 1"),"Versum 1"))}));
 const ant=section(c9,"Ant 1");
 const magVerses=sourceLines(magnificat,"Magnificat").filter(x=>/^1:(?:4[6-9]|5[0-5])\s/.test(x));
 if(magVerses.length!==10)throw new Error("Magnificat is not 10 verses in "+locale);
 out.push(freeze({id:"V.MAGNIFICAT",kind:"CANTICLE",
  antiphonBefore:ant,verses:freeze(magVerses),requiem:freeze([...requiem]),antiphonAfter:normalizedAntiphon(ant)
 }));
 out.push(freeze({id:"V.PATER",kind:"PATER_NOSTER",lines:freeze(commonPrayer(ordinary,"Pater noster Et"))}));
 // C9 (1960) omits Psalm 145 in the collect preces, even for votive use.
 // Read the original source marker, not an older rubric's conditional inclusion.
 const laC9=sourced(proper,"la",r=>r.leaf==="C9","C9 rubric");
 if(!/\(sed rubrica 1955 aut rubrica 1960[^\n]*omittitur\)/.test(section(laC9,"Oratio_a_porta")))
  throw new Error("Missing explicit 1960 Psalm 145 omission witness");
 const dominus=commonPrayer(ordinary,"Dominus").filter(x=>!x.startsWith("/:"));
 if(dominus.length!==4)throw new Error("Office of Dead Domine exaudi source split is not four lines");
 const preces=[
  ...commonPrayer(ordinary,"Aportainferi"),
  ...commonPrayer(ordinary,"Requiescant"),
  ...dominus.slice(2)
 ];
 if(preces.length!==6)throw new Error("Office of Dead preces must have six responses");
 out.push(freeze({id:"V.PRECES",kind:"PRECES",lines:freeze(preces)}));
 const oratioBody=section(c9,"Oratio_Fid").split(/\r?\n/)
  .map(x=>x.trim()).filter(x=>x&&x!=="$Oremus"&&x!=="$Qui vivis");
 // Avoid silently importing the printed macros as prayer text.
 if(oratioBody.length!==1||!/^v\.\s/i.test(oratioBody[0]))
  throw new Error("Office of Dead Fidelium collect body not source-resolved in "+locale);
 const collect=[...commonPrayer(ordinary,"Oremus"),...oratioBody,...commonPrayer(ordinary,"Qui vivis")];
 noLiteralMacro(collect,"Fidelium collect");
 out.push(freeze({id:"V.COLLECT",kind:"COLLECT",lines:freeze(collect),proper:"FIDELIUM_FOR_ALL_DEPARTED"}));
 const concl=sourceLines(section(c9,"Conclusio"),"Conclusio");
 if(concl.length!==4)throw new Error("Office of Dead Vespers closing lines missing");
 out.push(freeze({id:"V.CONCLUSION",kind:"CONCLUSION",lines:freeze(concl)}));
 if(out.length!==11||out.some(row=>JSON.stringify(row).includes("Glória Patri")||JSON.stringify(row).includes("Gloria Patri")))
  throw new Error("Office of Dead Vespers stage count/doxology invalid");
 return freeze(out);
}
export function compileOfficeDeadVespers1960({proper,psalms,supplemental,context=OFFICE_DEAD_VESPERS_1960_CONTEXT}={}){
 if(context!==OFFICE_DEAD_VESPERS_1960_CONTEXT)
  throw new RangeError("Other Office of Dead contexts require separately certified 1960 propers and rubrics: "+context);
 assertRevision(proper,"proper");assertRevision(psalms,"psalm");assertRevision(supplemental,"supplemental");
 const byLocale=Object.fromEntries(LOCALES.map(locale=>[locale,makeLocale(locale,{proper,psalms,supplemental})]));
 const ids=byLocale.la.map(x=>x.id);
 for(const lang of LOCALES)if(byLocale[lang].map(x=>x.id).join("|")!==ids.join("|"))
  throw new Error("Office of Dead multilingual stage identity mismatch: "+lang);
 return freeze({
  schema:"ao.office-dead.1960-votive-vespers-source-assembly.v1",
  sourceCommit:OFFICE_DEAD_VESPERS_1960_SOURCE_COMMIT,
  context,locales:freeze([...LOCALES]),stageIds:freeze(ids),
  psalmOrder:freeze([...OFFICE_DEAD_VESPERS_1960_PSALMS]),
  byLocale:freeze(byLocale),
  flags:freeze({sourceDerivedHourComplete:true,criticalBreviaryPrintCertified:false,
   allSoulsProperCertified:false,independentLanguageEditionsCertified:false,
   publicReaderRouteReleased:false,psalm145OmittedIn1960:true,needsBrowserTest:true}),
  sourceNote:"Pinned MIT Divinum Officium source-derived votive Office; no original printed-Breviary certification."
 });
}
