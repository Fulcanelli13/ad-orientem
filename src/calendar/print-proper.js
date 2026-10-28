// Printable *Propers only*, from the resolved native 1962 day.
// Never represent a Proper extract as the complete Mass or Missal.
import {calendarMassColour} from "./colour-projection.js";
import {select1962CommemorationsForMassForm} from "../mass/1962-commemoration-form-source.js";
import {correct1962ProperEditorialReferences} from "../mass/1962-proper-editorial-corrections.js";
import {reconcile1962PerpetuaFelicityNonVirginCommon,inspect1962PluralMartyrsFrenchOrationSource} from "../mass/1962-plural-martyr-french-source.js";
import {project1962Pent21AlleluiaDisplayRows,PS113_PENT21_ENGLISH_EDITORIAL} from "../mass/1962-ps113-alleluia-editorial.js";

const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const pair=(value,language)=>({
  latin:String(value?.lat??value?.la??"").trim(),
  vernacular:String(value?.[language]??"").trim()
});
const titles=Object.freeze({
 introit:["Introit","Introït"],collect:["Collect","Collecte"],epistle:["Epistle","Épître"],
 gradual:["Gradual / chant","Graduel / chant"],alleluia:["Alleluia","Alléluia"],
 tract:["Tract","Trait"],sequence:["Sequence","Séquence"],gospel:["Gospel","Évangile"],
 offertory:["Offertory","Offertoire"],secret:["Secret","Secrète"],preface:["Preface","Préface"],
 communion:["Communion","Communion"],postcommunion:["Postcommunion","Postcommunion"]
});
const titleFor=(id,lang)=>titles[id]?.[lang==="fr"?1:0]??id;
function sectionsFromProper(p,lang){
  const section=(kind,values)=>{
    const items=(Array.isArray(values)?values:[values]).filter(Boolean);
    return items.map((x,index)=>({
      kind,title:titleFor(kind,lang)+(items.length>1?" "+(index+1):"")+
        (x?.oneConclusion?.status==="CERTIFIED"&&x.oneConclusion.kind==="INSEPARABLE_APOSTLES"?
          (lang==="fr"?" · Pierre et Paul (conclusion unique)":" · Peter and Paul (single conclusion)"):
          x?.oneConclusion?.status==="CERTIFIED"&&x.oneConclusion.kind==="MULTIPLE_COMMEMORATIONS"?
            (lang==="fr"?" · Deux commémoraisons (conclusion unique)":" · Two commemorations (single conclusion)"):
          kind==="collect"&&x?.oneConclusion?.status==="CERTIFIED"?
            (lang==="fr"?" · Missions (conclusion unique)":" · Missions (single conclusion)"):""),
      ...pair(x,lang)
    }));
  };
  const interlections=Array.isArray(p.preGospelChants)&&p.preGospelChants.length
    ?p.preGospelChants.map(x=>({kind:/^(alleluia|tract|sequence)$/i.test(x?.kind)?x.kind.toLowerCase():"gradual",text:x?.text}))
    :p.gradual?[{kind:"gradual",text:p.gradual}]:[];
  return [
    ...section("introit",p.introit),...section("collect",p.collects),
    ...section("epistle",p.epistle),
    ...interlections.flatMap(x=>section(x.kind,x.text)),
    ...section("sequence",p.sequence),...section("gospel",p.gospel),
    ...section("offertory",p.offertory),...section("secret",p.secrets),
    ...section("preface",p.preface),...section("communion",p.communion),
    ...section("postcommunion",p.postcommunions)
  ].filter(x=>x.latin||x.vernacular);
}
/**
 * Shared, pure source-text completeness gate.
 * Printable Calendar Proper and explicitly selected alternate Mass Proper
 * MUST pass the same bilingual source/structure checks. The caller alone
 * owns liturgical selection, permitted commemoration and authorization.
 */
export function assessResolvedProperTextSections(proper,{language="en"}={}){
  if(!["en","fr"].includes(language))return {ok:false,reason:"Unsupported vernacular"};
  const p=proper?.data&&proper?.status?proper.data:proper;
  if(!p||typeof p!=="object")return {ok:false,reason:"Resolved Proper unavailable"};
  // Print must use the SAME exact-source, non-Virgin C7b editorial
  // inheritance already verified in the LIVE Reader, not the raw host
  // Common fallback. This is a display projection only; original data is
  // preserved. Any still-invalid named Latin (either print language), or
  // deficient French-only plural Common, must be withheld.
  p=reconcile1962PerpetuaFelicityNonVirginCommon(p);
  for(const slot of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]){
    const hold=inspect1962PluralMartyrsFrenchOrationSource(p,slot);
    if(hold&&(language==="fr"||hold.sourceLatinIncorrect===true))
      return {ok:false,reason:"1962 source-owned Common inheritance conflict",
        missing:[slot],sourceConflict:hold};
  }
  if(!["ordinary_mass","ordinary_mass_1962"].includes(String(p.riteProfile||"ordinary_mass").toLowerCase())||
    (p.preparatoryLessons||[]).length||(p.specialSections||[]).length)
    return {ok:false,reason:"Special structure requires the native Missal reader"};
  const sections=sectionsFromProper(p,language);
  const mandatory=["introit","collect","epistle","gospel","offertory","secret","communion","postcommunion"];
  const missing=mandatory.filter(kind=>!sections.some(x=>x.kind===kind));
  if(missing.length)return {ok:false,reason:"Required Proper section unavailable",missing};
  if(sections.some(x=>!x.latin||!x.vernacular))
    return {ok:false,reason:"Incomplete bilingual source passages"};
  if(!String(p.sourcePath||"").trim())return {ok:false,reason:"Canonical source identity unavailable"};
  return {ok:true,reason:null,sections,proper:p,
    sourceEditorialCorrections:p.sourceEditorialCorrections??[]};
}
export function assessPrintableProper(resolved,{language="en",massForm=null}={}){
  if(!["en","fr"].includes(language))return {ok:false,reason:"Unsupported vernacular"};
  const raw=resolved?.proper?.status==="ready"?resolved.proper.data:null;
  if(resolved?.status==="failed"||!resolved?.day?.main||!raw)return {ok:false,reason:"Resolved Proper unavailable"};
  const selected=massForm?select1962CommemorationsForMassForm({
    proper:raw,calendarResolution:resolved,form:massForm,
    celebrationId:"mass_of_day",
  }):null;
  if(massForm&&Array.isArray(resolved?.day?.commemorations)&&
    resolved.day.commemorations.length>0&&selected?.status!=="CERTIFIED")
    return {ok:false,reason:"Form-specific commemoration rules not yet source-certified"};
  const p=correct1962ProperEditorialReferences(selected?.proper??raw);
  const audit=assessResolvedProperTextSections(p,{language});
  if(!audit.ok)return audit;
  const prepared=audit.proper;
  const sections=project1962Pent21AlleluiaDisplayRows(
    prepared,audit.sections,{language});
  return sections===audit.sections?audit:{
    ...audit,sections,displayTranslationCorrections:
      Object.freeze([PS113_PENT21_ENGLISH_EDITORIAL]),
  };
}
export function renderPrintableProperHtml(resolved,{language="en",massForm=null}={}){
  const audit=assessPrintableProper(resolved,{language,massForm});
  if(!audit.ok)throw new Error("Print withheld: "+audit.reason+(audit.missing?": "+audit.missing.join(", "):""));
  const p=audit.proper,fr=language==="fr";
  const date=String(resolved.date||"");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error("Original civil date required");
  const title=String(fr?(p.nameFr||p.name):(p.name||resolved.day.main.title));
  const note=fr
    ?"Propre de la messe uniquement. Ce document ne comprend ni l’Ordinaire, ni les gestes, ni les rubriques ou cérémonies particulières. Vérifier le propre local."
    :"Mass Proper only. This document omits the Ordinary, gestures, rubrics and exceptional ceremonies. Check local propers.";
  const sections=audit.sections.map((x,index)=>[
    '<section class="item"><h2 id="section-',String(index),'">',escapeHtml(x.title),'</h2>',
    '<div class="cols"><div lang="la"><small>LATIN</small><p>',escapeHtml(x.latin),
    '</p></div><div lang="',language,'"><small>',fr?"FRANÇAIS":"ENGLISH",
    '</small><p>',escapeHtml(x.vernacular),'</p></div></div></section>'
  ].join("")).join("");
  const comm=(p.commemorationFormDecision?.status==="CERTIFIED"?p.appliedCommemorations:(p.calendarCommemorations||[])).map(x=>[
    '<li>',escapeHtml(x.name??x.title??x.id),' · ',escapeHtml(x.path),
    x.prayerSourcePath&&x.prayerSourcePath!==x.path?" · "+escapeHtml(x.prayerSourcePath):"","</li>"
  ].join("")).join("");
  const css='@page{size:A4;margin:14mm}*{box-sizing:border-box}html{background:#f5f3ef;color:#161616}body{font-family:Georgia,serif;max-width:930px;margin:auto;padding:26px 20px}header{border-bottom:2px solid #252525;padding-bottom:13px;margin-bottom:22px}header small,.cols small{font:700 9px/1.4 system-ui,sans-serif;letter-spacing:.12em}header h1{font-size:24px;margin:8px 0}header p{margin:5px 0}header .note{font-size:12px;color:#555}.item{margin-bottom:22px;break-inside:avoid-page}.item h2{font-size:15px;border-bottom:1px solid #aaa;padding-bottom:5px}.cols{display:grid;grid-template-columns:1fr 1fr;gap:17px}.cols p{font-size:11pt;line-height:1.45;white-space:pre-line;overflow-wrap:anywhere;margin:7px 0}.cols small{color:#666}footer{font-size:11px;border-top:1px solid #888;padding-top:10px;overflow-wrap:anywhere}.toolbar{margin-bottom:16px}.toolbar button{background:#222;color:white;border:0;border-radius:4px;padding:10px 16px;cursor:pointer}@media print{html{background:white}body{padding:0;max-width:none}.toolbar{display:none}}@media(max-width:550px){.cols{grid-template-columns:1fr}.item{break-inside:auto}}';
  return [
    '<!doctype html><html lang="',language,'"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1"><title>',escapeHtml(title),' · ',escapeHtml(date),'</title>',
    '<style>',css,'</style></head><body><div class="toolbar"><button type="button" onclick="window.print()">',
    fr?"Imprimer / PDF":"Print / Save as PDF",'</button></div>',
    '<header><small>',fr?"PROPRE DE LA MESSE · RITE ROMAIN 1962":"PROPER OF THE MASS · ROMAN RITE 1962",
    '</small><h1>',escapeHtml(title),'</h1><p>',escapeHtml(date),' · ',
    escapeHtml(p.rank||resolved.day.main.rank),' · ',escapeHtml(calendarMassColour(resolved)),
    '</p><p class="note">',escapeHtml(note),'</p></header><main>',sections,'</main><footer><b>',
    fr?"Source canonique":"Canonical source",': </b>',escapeHtml(p.sourcePath),
    comm?'<p><b>'+(fr?"Commémorations et sources":"Commemorations and sources")+'</b></p><ul>'+comm+'</ul>':"",
    '</footer></body></html>'
  ].join("");
}
