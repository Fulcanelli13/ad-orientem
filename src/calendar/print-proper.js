// Printable *Propers only*, from the resolved native 1962 day.
// Never represent a Proper extract as the complete Mass or Missal.
import {calendarMassColour} from "./colour-projection.js";

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
      kind,title:titleFor(kind,lang)+(items.length>1?" "+(index+1):""),
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
export function assessPrintableProper(resolved,{language="en"}={}){
  if(!["en","fr"].includes(language))return {ok:false,reason:"Unsupported vernacular"};
  const p=resolved?.proper?.status==="ready"?resolved.proper.data:null;
  if(resolved?.status==="failed"||!resolved?.day?.main||!p)return {ok:false,reason:"Resolved Proper unavailable"};
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
  return {ok:true,reason:null,sections,proper:p};
}
export function renderPrintableProperHtml(resolved,{language="en"}={}){
  const audit=assessPrintableProper(resolved,{language});
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
  const comm=(p.calendarCommemorations||[]).map(x=>[
    '<li>',escapeHtml(x.name),' · ',escapeHtml(x.path),
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
