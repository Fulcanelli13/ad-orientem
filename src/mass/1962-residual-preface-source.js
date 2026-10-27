// 1962 general-Roman principal-Mass Preface recovery: final 13 2026
// source conflicts. These are exact production-resolver source identities,
// not a general date/colour inference or a particular/local Ordo.
// Rubricae Generales Missalis Romani 1960 §§484(b),485(b),490(b),494(b),496.
// Original Latin donor evidence: pinned Divinum Officium ad8783641455...
const records=[
  ["2026-01-02",":feria:4:w","Sancti/01-01","NATIVITATE","Nat","RGMR_484_B",null,"Nat"],
  ["2026-01-05",":feria:4:w","Sancti/01-01","NATIVITATE","Nat","RGMR_484_B",null,"Nat"],
  ["2026-01-07",":feria:4:w","Sancti/01-06","EPIPHANIA","Epi","RGMR_485_B",null,"Epi"],
  ["2026-01-08",":feria:4:w","Sancti/01-06","EPIPHANIA","Epi","RGMR_485_B",null,"Epi"],
  ["2026-01-09",":feria:4:w","Sancti/01-06","EPIPHANIA","Epi","RGMR_485_B",null,"Epi"],
  ["2026-01-12",":feria:4:w","Tempora/Epi1-0a","EPIPHANIA","Epi","RGMR_485_B",null,"Epi"],
  ["2026-03-19","sancti:03-19:1:w","Sancti/03-19","JOSEPH","Joseph","RGMR_496","FESTIVITY","Joseph=Festivitáte"],
  ["2026-05-01","sancti:05-01r:1:w","Sancti/05-01r","JOSEPH","Joseph","RGMR_496","SOLEMNITY","Joseph=Solemnitáte"],
  ["2026-05-17","tempora:Pasc6-0:2:w","Tempora/Pasc6-0","ASCENSIO","Asc","RGMR_490_B",null,null],
  ["2026-11-29","tempora:Adv1-0:1:v","Tempora/Adv1-0","TRINITATE","Trinitate","RGMR_494_B",null,null],
  ["2026-12-06","tempora:Adv2-0:1:v","Tempora/Adv2-0","TRINITATE","Trinitate","RGMR_494_B",null,null],
  ["2026-12-13","tempora:Adv3-0:1:pv","Tempora/Adv3-0","TRINITATE","Trinitate","RGMR_494_B",null,null],
  ["2026-12-20","tempora:Adv4-0:1:v","Tempora/Adv4-0","TRINITATE","Trinitate","RGMR_494_B",null,null]
];
export const RESIDUAL_1962_PREFACE_CASES=Object.freeze(records.map(
  ([date,principalId,originalPath,category,section,rubric,variant,originalPrefatio])=>
    Object.freeze({date,principalId,originalPath,category,section,rubric,variant,
      originalPrefatio,scope:"EXACT_2026_RESIDUAL_PREFACE_SOURCE"})));
const byDate=new Map(RESIDUAL_1962_PREFACE_CASES.map(x=>[x.date,x]));
export function required1962ResidualPrefaceOwner(id,path,date){
  const owner=byDate.get(String(date??""));
  if(!owner||owner.principalId!==id||owner.originalPath!==path)return null;
  return owner;
}
const n=v=>String(v??"").normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae")
  .replace(/œ/gi,"oe").replace(/\s+/g," ").trim().toLowerCase();
export function authentic1962ResidualOriginal(parsed,owner){
  if(!owner||!(parsed?.map instanceof Map))return false;
  const rule=parsed.map.get("Rule");
  if(!Array.isArray(rule))return false;
  const directives=rule.map(x=>n(x).replace(/\s*=\s*/g,"="))
    .filter(x=>/^prefatio=/.test(x));
  if(owner.originalPrefatio)
    return directives.length===1&&
      directives[0].replace(/[;.]+$/,"")===n("Prefatio="+owner.originalPrefatio);
  return directives.length===0;
}
export function render1962ResidualPreface(text,language,owner){
  if(typeof text!=="string"||!owner||!["la","en","fr"].includes(language))return null;
  if(owner.category!=="JOSEPH")return text;
  const replacements={
    FESTIVITY:{
      la:["*Veneratióne*","Festivitáte"],
      en:["on the solemnity of blessed Joseph","on the feast of blessed Joseph"],
      fr:null
    },
    SOLEMNITY:{
      la:["*Veneratióne*","Solemnitáte"],
      en:null,
      fr:["en la fête du bienheureux Joseph","en la solennité du bienheureux Joseph"]
    }
  };
  const pair=replacements[owner.variant]?.[language];
  if(!Object.hasOwn(replacements,owner.variant))return null;
  if(pair===null)return text;
  if(!pair||text.split(pair[0]).length!==2)return null;
  return text.replace(pair[0],pair[1]);
}
export function matches1962ResidualSelected(preface,owner){
  if(!preface||!owner||preface.prefaceSection!==owner.section||
     preface.recoveryScope!==owner.scope||
     preface.residualPrefaceDate!==owner.date||
     preface.originalProperSourcePath!==owner.originalPath||
     preface.prefaceVariant!==(owner.variant??null)||
     preface.sourcePath!=="Ordo/Prefationes")return false;
  if(!String(preface.en??"").trim()||!String(preface.fr??"").trim())return false;
  const latin=n(preface.lat??preface.la);
  const anchors={
    NATIVITATE:["de nativitate domini","quia per incarnati verbi mysterium"],
    EPIPHANIA:["de epiphania domini","cum unigenitus tuus"],
    ASCENSIO:["de ascensione domini","qui post resurrectionem suam"],
    TRINITATE:["de sanctissima trinitate","qui cum unigenito filio tuo"],
    JOSEPH:["de s. joseph","et te in "+(owner.variant==="FESTIVITY"?"festivitate":"solemnitate")+" beati joseph"]
  };
  const a=anchors[owner.category];
  return Boolean(a&&latin.startsWith(a[0])&&latin.includes(a[1])&&
    !latin.includes("*veneratione*"));
}
