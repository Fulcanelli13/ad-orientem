import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {R17_FROZEN_ACTIVE_ICON_ASSETS} from "../../src/mass/reader-icon-bank.js";
import {R17_FINAL_APPROVED_MASS_ASSETS} from "../../src/mass/reader-final-approved-assets.js";
import {R17_REVIEWED_POSTURE_ASSETS} from "../../src/mass/reader-reviewed-posture-assets.js";
import {USER_APPROVED_MASS_GESTURE_ASSETS,USER_APPROVED_MASS_GESTURE_KEYS} from "../../src/mass/reader-user-approved-gesture-art.js";
import {APPROVED_FINGER_ART} from "../../src/mass/reader-approved-finger-art.js";
import {APPROVED_PRIEST_RUBRIC_GESTURE_ART} from "../../src/mass/reader-approved-priest-gesture-art.js";
import {CANONICAL_ICON_SET} from "../../src/mass/reader-canonical-icon-set.js";
import {FINAL_65_CUE_ICON_KEYS,FINAL_65_PRIEST_POSITION_ICON_KEYS,EXACT_PRIEST_RUBRIC_ACTION_ICON_KEYS,ULTRA_MASTER_PRIEST_CHANT_CUE_ADDITIONS,SCHOLA_NOT_PRIEST_CHANT_CUES} from "../../src/mass/reader-final65-icon-keys.js";
import {createReaderSectionResolver} from "../../src/mass/reader-sections.js";
import {buildReaderSectionCard} from "../../src/mass/reader-text.js";
import {projectSourceFirstLiveModel} from "../../src/mass/reader-live-source.js";
import {projectCuratedOrdinaryLiveCards} from "../../src/mass/reader-live-curated-cards.js";
import {projectGranularMissalCards} from "../../src/mass/reader-missal-granularity.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const name="AO_Mass_Live_Missal_Icons_2026-11-08";
const out=path.join(root,name);
const source="https://github.com/Fulcanelli13/ad-orientem/blob/main/";
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const crosswalk=read("data/presentation/mass-icon-final-cue-crosswalk-20261020.v1.json");
const lock=read("data/presentation/mass-icon-final-user-lock-20261020.v1.json");
const canonical=read("data/presentation/mass-icon-canonical-set-20261021.v1.json");
const sections=read("data/presentation/reader-section-map.v0.13.1.json");
const canon=read("data/presentation/reader-canon-source-map.v1.json");
const corpora={LOW:read("data/presentation/reader-text-low.v1.json"),SUNG:read("data/presentation/reader-text-sung.v1.json")};
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const unique=a=>[...new Set(a.filter(Boolean))];
function csv(filename,fields,rows){
 const q=v=>'"'+String(v??"").replaceAll('"','""').replaceAll(/\r?\n/g," ")+'"';
 fs.writeFileSync(path.join(out,filename),[fields.map(q).join(","),...rows.map(r=>fields.map(k=>q(r[k])).join(","))].join("\n")+"\n");
}
const json=(name,value)=>fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+"\n");
const byKey=new Map(),used=new Map();
function register(key,p,authority){
 if(!p||!key)return;
 const prior=byKey.get(key);
 if(prior&&prior.path!==p)throw Error("Conflicting paths for key "+key);
 byKey.set(key,{path:p,authority});
}
for(const [origin,bank] of [
 ["v46",R17_FROZEN_ACTIVE_ICON_ASSETS],
 ["approved",R17_FINAL_APPROVED_MASS_ASSETS],
 ["reviewed",R17_REVIEWED_POSTURE_ASSETS],
 ["oct29",USER_APPROVED_MASS_GESTURE_ASSETS],
]){
 for(const [key,url] of Object.entries(bank)){
  register(key,path.relative(root,fileURLToPath(url)).replaceAll(path.sep,"/"),origin);
 }
}
for(const m of CANONICAL_ICON_SET.meanings)if(m.path)register("canon:"+m.meaningId,m.path,"canonical");
function select(key,p,reason){
 const loc=p||byKey.get(key)?.path;
 if(!loc)return "";
 if(!loc.startsWith("assets/")||!fs.existsSync(path.join(root,loc)))
  throw Error("Missing registered asset "+key+": "+loc);
 const item=used.get(loc)||{path:loc,keys:new Set(),reasons:new Set()};
 if(key)item.keys.add(key);item.reasons.add(reason);used.set(loc,item);
 return loc;
}
const sourceBlocks=new Map(),sourceCues=new Map();
for(const corpus of [corpora.SUNG,corpora.LOW]){
 for(const b of corpus.blocks)for(const u of b.units||[]){
  if(!sourceBlocks.has(u.cue_id))sourceBlocks.set(u.cue_id,b);
  if(!sourceCues.has(u.cue_id))sourceCues.set(u.cue_id,u);
 }
}
const resolver=createReaderSectionResolver(sections);
const slots=Object.fromEntries(unique(corpora.SUNG.blocks.map(b=>b.Proper_Slot)).map(s=>
 [s,{status:"READY",data:{latin:"EXPORT "+s,english:"EXPORT "+s}}]));
function projection(corpus){
 const cards=resolver.sections.map(section=>buildReaderSectionCard({
  corpus,section,properSlots:slots,actualForm:corpus.form==="LOW"?"LOW":"MISSA_CANTATA_SIMPLE"
 }));
 const base={cards,totalCards:cards.length,presentationMode:"MISSAL",
  corpusFamily:corpus.form,structureOwner:"BASE_30_MACROS"};
 const missal=projectGranularMissalCards(base,{language:"en"});
 const first=projectSourceFirstLiveModel({...base,presentationMode:"LIVE"},canon);
 const live=projectCuratedOrdinaryLiveCards(first);
 if(![65,66,67].includes(live.totalCards))throw Error("LIVE source projection has unsupported card count: "+live.totalCards);
 return {live,missal};
}
const cardRows=[],pageRows=[],moments=[],assignments=[],positions=new Map();
for(const [form,corpus] of Object.entries(corpora)){
 const views=projection(corpus);
 for(const [mode,model,destination] of [
  ["LIVE",views.live,cardRows],["MISSAL",views.missal,pageRows]
 ]){
  for(const card of model.cards){
   const cues=unique((card.paragraphs||[]).flatMap(p=>p.sourceCueIds||[]));
   destination.push({form,mode,number:card.sequence,id:card.sectionId,title:card.title,
    source_section:card.sourceSectionId||card.sectionId,
    blocks:(card.blocks||[]).map(x=>x.blockId).join("|"),
    cues:cues.join("|"),cue_count:cues.length});
   for(const cue of cues){
    const key=form+"|"+mode+"|"+cue;
    positions.set(key,[...(positions.get(key)||[]),card]);
   }
  }
 }
}
const locate=(form,mode,cue)=>{
 const group=positions.get(form+"|"+mode+"|"+cue)||[];
 return {numbers:unique(group.map(x=>x.sequence)).join("|"),
  titles:unique(group.map(x=>x.title)).join(" | "),
  ids:unique(group.map(x=>x.sectionId)).join("|")};
};
function emit(entry){
 const cue=String(entry.cue_id||"");
 const block=sourceBlocks.get(cue),unit=sourceCues.get(cue);
 for(const form of ["LOW","SUNG"]){
  const live=locate(form,"LIVE",cue),missal=locate(form,"MISSAL",cue);
  assignments.push({...entry,form,macro:block?.Macro_ID||"",
   block:block?.Block_ID||"",prayer:block?.Title||"",
   latin:String(unit?.latin||"").slice(0,140),
   live_card:live.numbers,live_title:live.titles,live_id:live.ids,
   missal_page:missal.numbers,missal_title:missal.titles,missal_id:missal.ids,
   source_only:!live.ids&&!missal.ids?"YES":"NO"});
 }
 if(entry.asset_path)select(entry.icon_key,entry.asset_path,entry.origin);
}
for(const r of crosswalk.rows)emit({
 cue_id:r.cueId,lane:r.lane,icon_key:r.runtimeAssetKey||"",
 asset_path:r.reviewState==="MAPPED"?r.assetPath||"":"",
 display_name:r.assetName||"",status:r.reviewState,
 condition:r.sourceEvent?.condition||"",event_id:r.sourceEvent?.id||r.registryId||"",
 event_label:r.sourceEvent?.label||r.sourceEvent?.action||r.sourceEvent?.voice||
   r.sourceEvent?.posture||r.sourceEvent?.station||r.sourceEvent?.text||"",
 match_rule:r.matchRule||"",origin:"OCT20_CROSSWALK",
 explanation:r.semanticResolution||"",source_register:r.sourceRegistry||""
});
for(const [lane,map] of Object.entries(FINAL_65_CUE_ICON_KEYS))
 for(const [cue,key] of Object.entries(map))emit({cue_id:cue,lane,icon_key:key,
  asset_path:byKey.get(key)?.path||"",status:"LIVE_STATE_CONDITIONAL",
  origin:"LIVE_65_EXACT_CUE_KEYS",explanation:"Key only. Actual source state and form govern display.",
  source_register:"src/mass/reader-final65-icon-keys.js"});
for(const [cue,detail] of Object.entries(EXACT_PRIEST_RUBRIC_ACTION_ICON_KEYS))
 emit({cue_id:cue,lane:"priest_rubric_action",icon_key:detail.key,
  asset_path:byKey.get(detail.key)?.path||"",status:"EXACT_LABEL_REQUIRED",
  condition:"ACTION="+detail.action,origin:"CERTIFIED_RUBRIC_ACTION_OVERRIDE"});
for(const [cue,key] of Object.entries(USER_APPROVED_MASS_GESTURE_KEYS))
 emit({cue_id:cue,lane:"priest_gesture_extension",icon_key:key,
  asset_path:byKey.get(key)?.path||"",status:"SOURCE_MATRIX_CONDITIONAL",
  origin:"OCT29_SIX_APPROVED_EXTENSIONS",condition:"NORMATIVE_1962_MATRIX"});
for(const [id,detail] of Object.entries(APPROVED_FINGER_ART))
 emit({cue_id:detail.cueId,lane:"priest_finger_state",icon_key:detail.assetId,
  asset_path:detail.path,status:"APPROVED_RUBRIC_STATE",condition:detail.stateKey,
  event_id:id,origin:"FINGER_RUBRIC_ART"});
for(const [id,detail] of Object.entries(APPROVED_PRIEST_RUBRIC_GESTURE_ART))
 emit({cue_id:detail.cueId,lane:"priest_hands_joined_rubric",icon_key:detail.assetId,
  asset_path:"assets/active/mass-v46/hands_joined.svg",
  status:"PUBLISHED_RUBRIC_ONLY",event_id:id,origin:"APPROVED_RUBRIC_GESTURE"});
for(const cue of ULTRA_MASTER_PRIEST_CHANT_CUE_ADDITIONS)
 emit({cue_id:cue,lane:"priest_voice",icon_key:"final_ao_chant",
  asset_path:byKey.get("final_ao_chant")?.path||"",
  status:"SUNG_PRIEST_ONLY",origin:"ULTRA_CHANT_CUES"});
for(const cue of SCHOLA_NOT_PRIEST_CHANT_CUES)
 emit({cue_id:cue,lane:"priest_voice",icon_key:"",asset_path:"",
  status:"EXPLICIT_ICON_SUPPRESSION",origin:"SCHOLA_NOT_PRIEST_CHANT"});
for(const [station,key] of Object.entries(FINAL_65_PRIEST_POSITION_ICON_KEYS))
 if(key)select(key,"","LIVE_STATION="+station);
for(const key of ["final_review_posture_stand","final_sit","final_review_posture_kneel",
 "final_review_posture_genuflect","final_response","final_schola","bells",
 "final_new_priest_facing","final_ao_chant"])select(key,"","LIVE_DYNAMIC_LANE");
const meanings=CANONICAL_ICON_SET.meanings.map(x=>{
 if(x.path)select("canon:"+x.meaningId,x.path,"CANONICAL_MEANING");
 return {meaning_id:x.meaningId,lane:x.lane,name:x.userName||"",
  key:x.path?"canon:"+x.meaningId:"",path:x.path||"",
  status:x.path?"APPROVED_SOURCE_ART":"TEXT_ONLY_NO_ART"};
});
for(const [cue,unit] of [...sourceCues].sort((a,b)=>a[0].localeCompare(b[0]))){
 const block=sourceBlocks.get(cue);
 for(const form of ["LOW","SUNG"]){
  const l=locate(form,"LIVE",cue),m=locate(form,"MISSAL",cue);
  moments.push({form,cue_id:cue,macro:block?.Macro_ID,block:block?.Block_ID,
   title:block?.Title,latin:unit.latin||"",english:unit.english||"",
   live_card:l.numbers,live_title:l.titles,missal_page:m.numbers,
   missal_title:m.titles,source_only:!l.ids&&!m.ids?"YES":"NO",
   icon_assignment_count:assignments.filter(x=>x.cue_id===cue&&x.form===form).length});
 }
}
const assetRows=[];
for(const [loc,item] of [...used].sort((a,b)=>a[0].localeCompare(b[0]))){
 const from=path.join(root,loc),to=path.join(out,loc);
 fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);
 const data=fs.readFileSync(from);
 assetRows.push({path:loc,bytes:data.length,format:path.extname(loc).slice(1).toUpperCase(),
  sha256:crypto.createHash("sha256").update(data).digest("hex"),
  keys:unique([...item.keys]).join("|"),reasons:unique([...item.reasons]).join("|"),
  source_url:source+loc});
}
fs.mkdirSync(path.join(out,"sources"),{recursive:true});
for(const [p,name] of [
 ["data/presentation/mass-icon-final-cue-crosswalk-20261020.v1.json","final-cue-crosswalk.json"],
 ["data/presentation/mass-icon-canonical-set-20261021.v1.json","canonical-meanings.json"],
 ["data/presentation/mass-icon-final-user-lock-20261020.v1.json","user-lock.json"],
 ["data/presentation/reader-section-map.v0.13.1.json","reader-sections.json"],
 ["data/presentation/reader-canon-source-map.v1.json","canon-segments.json"],
])fs.copyFileSync(path.join(root,p),path.join(out,"sources",name));
csv("01_ICON_FILES.csv",["path","bytes","format","sha256","keys","reasons","source_url"],assetRows);
csv("02_CUE_ASSIGNMENTS.csv",["form","cue_id","lane","macro","block","prayer","latin",
 "live_card","live_title","live_id","missal_page","missal_title","missal_id",
 "icon_key","asset_path","display_name","status","condition","event_id",
 "event_label","match_rule","origin","explanation","source_register","source_only"],assignments);
csv("03_LIVE_CARDS.csv",["form","mode","number","id","title","source_section","blocks","cues","cue_count"],cardRows);
csv("04_MISSAL_PAGES.csv",["form","mode","number","id","title","source_section","blocks","cues","cue_count"],pageRows);
csv("05_ALL_MOMENTS.csv",["form","cue_id","macro","block","title","latin","english",
 "live_card","live_title","missal_page","missal_title","source_only","icon_assignment_count"],moments);
csv("06_CANONICAL_MEANINGS.csv",["meaning_id","lane","name","key","path","status"],meanings);
json("REGISTRY.json",{schema:"AO_MASS_ICON_EXPORT_V1",commit:process.env.GITHUB_SHA||"",
 files:assetRows,assignments,liveCards:cardRows,missalPages:pageRows,moments,
 canonicalMeanings:meanings,rejectedAssetIDs:lock.permanentlyRejectedExactArtwork.map(x=>x.id)});
const summary={iconFiles:assetRows.length,sourceCrosswalk:crosswalk.rows.length,
 assignmentRows:assignments.length,liveCardsPerForm:cardRows.length/2,
 missalPagesPerForm:pageRows.length/2,cues:sourceCues.size,
 missingArtMeanings:meanings.filter(x=>!x.path).length};
json("SUMMARY.json",summary);
fs.writeFileSync(path.join(out,"README.md"),[
 "# Ad Orientem: LIVE / MISSAL Mass icon export",
 "Source repository: https://github.com/Fulcanelli13/ad-orientem",
 "Source revision: "+(process.env.GITHUB_SHA||"checkout"),
 "",
 "The assets directory contains original source PNG/SVG files, not generated replacements.",
 "01_ICON_FILES lists icon hashes/keys.",
 "02_CUE_ASSIGNMENTS lists the 414 source crosswalk entries plus exact LIVE,",
 "conditional approved extension and text-only/suppression assignments.",
 "03_LIVE_CARDS maps the source-backed LIVE 65 baseline and optional supported pre-Gospel split(s).",
 "04_MISSAL_PAGES maps source-granular Missal pages.",
 "05_ALL_MOMENTS contains all 1962 ordinary source cues, including text-only.",
 "06_CANONICAL_MEANINGS maps semantic meaning to approved source artwork.",
 "REGISTRY.json is the complete machine-readable export.",
 "sources/ retains authoritative registries and the user rejection lock.",
 "",
 "Important: SOURCE assignment is NOT proof an icon appears in every form,",
 "moment or reading state. Runtime source state, priest/minister actor, rite",
 "and local conditions govern display. Null artwork and rejected Foot Centre",
 "substitutions remain text-only. V4.6 SVG files sometimes embed pixel art.",
 "Special-rite overlays are not misrepresented as ordinary 65-card events.",
 "",
 ...Object.entries(summary).map(([k,v])=>k+": "+v),
 ""].join("\n"));
console.log(JSON.stringify(summary));
