import { CSE_SOURCES, CSE_SOURCE_MAP } from "./sources.js";
import { CSE_RAW_001_050 } from "./questions-001-050.js";
import { CSE_RAW_051_100 } from "./questions-051-100.js";
import { CSE_RAW_101_150 } from "./questions-101-150.js";
import { CSE_DEBATE_MAP, CSE_DEBATE_IDS, CSE_DEBATE_FIELDS, CSE_DEBATE_VALIDATION } from "./debates.js";

export const SEXUAL_ETHICS_VERSION="1.4.0";
export const SEXUAL_ETHICS_ROUTE="learn.sexual_ethics";
export const SEXUAL_ETHICS_RESEARCH_LEAD="LBM";

export const CSE_SECTIONS=Object.freeze([
  Object.freeze({id:"foundations",range:[1,10],title:Object.freeze(["Moral foundations","Fondements moraux"])}),
  Object.freeze({id:"authority",range:[11,20],title:Object.freeze(["Authority, Scripture & conscience","Autorité, Écriture & conscience"])}),
  Object.freeze({id:"chastity",range:[21,30],title:Object.freeze(["Chastity, temptation & modesty","Chasteté, tentation & modestie"])}),
  Object.freeze({id:"courtship",range:[31,40],title:Object.freeze(["Dating, courtship & cohabitation","Fréquentation, fiançailles & cohabitation"])}),
  Object.freeze({id:"marriage",range:[41,50],title:Object.freeze(["Nature of marriage","Nature du mariage"])}),
  Object.freeze({id:"marital",range:[51,60],title:Object.freeze(["Sexual ethics within marriage","Morale sexuelle dans le mariage"])}),
  Object.freeze({id:"contraception",range:[61,70],title:Object.freeze(["Contraception & fertility regulation","Contraception & régulation des naissances"])}),
  Object.freeze({id:"pornography",range:[71,80],title:Object.freeze(["Masturbation, pornography & habits","Masturbation, pornographie & habitudes"])}),
  Object.freeze({id:"homosexuality",range:[81,90],title:Object.freeze(["Homosexuality & same-sex relationships","Homosexualité & relations de même sexe"])}),
  Object.freeze({id:"gender",range:[91,100],title:Object.freeze(["Sex, gender & personal identity","Sexe, genre & identité personnelle"])}),
  Object.freeze({id:"reproduction",range:[101,110],title:Object.freeze(["Infertility & reproductive technology","Infertilité & technologies reproductives"])}),
  Object.freeze({id:"violence",range:[111,120],title:Object.freeze(["Sexual violence, coercion & involuntariness","Violence sexuelle, contrainte & involontaire"])}),
  Object.freeze({id:"family-digital",range:[121,130],title:Object.freeze(["Family, pregnancy & digital sexuality","Famille, grossesse & sexualité numérique"])}),
  Object.freeze({id:"confession",range:[131,140],title:Object.freeze(["Confession, scrupulosity & recovery","Confession, scrupule & relèvement"])}),
  Object.freeze({id:"popular",range:[141,150],title:Object.freeze(["Major popular objections","Grandes objections courantes"])})
]);

const DEBATE=new Set(CSE_DEBATE_IDS.map(id=>Number(id.slice(3))));
const EXPANDED=new Set([4,11,17,19,26,28,30,33,36,46,52,53,57,62,68,72,82,107,137,144]);
const allRaw=[...CSE_RAW_001_050,...CSE_RAW_051_100,...CSE_RAW_101_150];

const numberOf=id=>Number(String(id).replace(/^CSE/,""));
const sectionFor=n=>CSE_SECTIONS.find(section=>n>=section.range[0]&&n<=section.range[1])?.id||null;
const depthFor=n=>DEBATE.has(n)?"DEBATE":EXPANDED.has(n)?"EXPANDED":"STANDARD";

export const CSE_QUESTIONS=Object.freeze(allRaw.map(raw=>{
  const n=numberOf(raw.id);
  return Object.freeze({
    ...raw,
    number:n,
    section:sectionFor(n),
    depth:depthFor(n),
    layer:raw.layer||"PERENNIAL",
    q:Object.freeze([...raw.q]),
    a:Object.freeze([...raw.a]),
    d:raw.d?Object.freeze([...raw.d]):null,
    debate:CSE_DEBATE_MAP[raw.id]||null,
    aliases:Object.freeze([...(raw.aliases||[])]),
    refs:Object.freeze((raw.refs||[]).map(ref=>Object.freeze([...ref]))),
    cross:Object.freeze([...(raw.cross||[])])
  });
}));

export const CSE_QUESTION_MAP=Object.freeze(Object.fromEntries(CSE_QUESTIONS.map(item=>[item.id,item])));
export const CSE_SECTION_MAP=Object.freeze(Object.fromEntries(CSE_SECTIONS.map(section=>[section.id,section])));
export { CSE_SOURCES, CSE_SOURCE_MAP };

const errors=[];
const seen=new Set();
const allowedLayers=new Set(["PERENNIAL","LATER_APPLICATION","PASTORAL_CASE"]);
const allowedCrossTargets=new Set(["learn.rites.matrimony","learn.catholic_life","pray.confession"]);
for(let n=1;n<=150;n++){
  const id=`CSE${String(n).padStart(3,"0")}`;
  const item=CSE_QUESTION_MAP[id];
  if(!item){errors.push(`missing ${id}`);continue;}
  if(seen.has(id))errors.push(`duplicate ${id}`);
  seen.add(id);
  if(item.number!==n)errors.push(`${id}: wrong number`);
  if(!item.section)errors.push(`${id}: missing section`);
  if(!item.q?.[0]||!item.q?.[1])errors.push(`${id}: missing bilingual question`);
  if(!item.a?.[0]||!item.a?.[1])errors.push(`${id}: missing bilingual answer`);
  if(item.depth==="EXPANDED"&&(!item.d?.[0]||!item.d?.[1]))errors.push(`${id}: EXPANDED missing detail`);
  if(item.depth==="DEBATE"&&!item.debate)errors.push(`${id}: DEBATE missing structured debate`);
  if(item.depth!=="DEBATE"&&item.debate)errors.push(`${id}: structured debate assigned to non-DEBATE record`);
  if(!allowedLayers.has(item.layer))errors.push(`${id}: invalid layer ${item.layer}`);
  if(!item.refs.length)errors.push(`${id}: no sources`);
  if(item.cross.some(target=>!allowedCrossTargets.has(target)))errors.push(`${id}: invalid cross-link target`);
  for(const [sourceId,locator] of item.refs){
    if(!CSE_SOURCE_MAP[sourceId])errors.push(`${id}: unknown source ${sourceId}`);
    if(!locator)errors.push(`${id}: source ${sourceId} missing locator`);
  }
}
for(const section of CSE_SECTIONS){
  const count=CSE_QUESTIONS.filter(item=>item.section===section.id).length;
  if(count!==10)errors.push(`${section.id}: expected 10 questions, got ${count}`);
}
const depthCounts=Object.freeze({
  STANDARD:CSE_QUESTIONS.filter(item=>item.depth==="STANDARD").length,
  EXPANDED:CSE_QUESTIONS.filter(item=>item.depth==="EXPANDED").length,
  DEBATE:CSE_QUESTIONS.filter(item=>item.depth==="DEBATE").length,
});
if(depthCounts.STANDARD!==75)errors.push(`expected 75 STANDARD, got ${depthCounts.STANDARD}`);
if(depthCounts.EXPANDED!==20)errors.push(`expected 20 EXPANDED, got ${depthCounts.EXPANDED}`);
if(depthCounts.DEBATE!==55)errors.push(`expected 55 DEBATE, got ${depthCounts.DEBATE}`);
if(!CSE_DEBATE_VALIDATION.complete||CSE_DEBATE_VALIDATION.count!==55)errors.push(`structured debate corpus invalid`);
for(const id of CSE_DEBATE_IDS){if(!CSE_QUESTION_MAP[id])errors.push(`debate references missing question ${id}`);}
for(const item of CSE_QUESTIONS){if(item.depth==="DEBATE"){for(const field of CSE_DEBATE_FIELDS){if(!item.debate?.[field]?.[0]||!item.debate?.[field]?.[1])errors.push(`${item.id}: incomplete debate field ${field}`);}}}

export const CSE_VALIDATION=Object.freeze({
  ok:errors.length===0,
  errors:Object.freeze(errors),
  questions:CSE_QUESTIONS.length,
  sections:CSE_SECTIONS.length,
  sources:CSE_SOURCES.length,
  depthCounts,
  debates:CSE_DEBATE_VALIDATION,
});
