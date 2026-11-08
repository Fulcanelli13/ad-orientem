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
// COMPLETE BANK PASS. The earlier 80-file source-mapped export was not the
// whole bank. Reconcile every original icon in the five source libraries, plus
// retained older LIVE art. User-rejected exact V4.6 IDs remain metadata only.
const bankInventory=[];
const inventorySeen=new Set();
const lockById=new Map(lock.items.map(x=>[x.id,x]));
for(const [key,item] of byKey){
 const primaryId=item.authority==="v46"?"v46_"+key:
  item.authority==="approved"&&key.startsWith("final_")?key.slice(6):key;
 const verdict=lockById.get(primaryId);
 const status=verdict?.status||
  (item.authority==="oct29"?"APPROVED_CONCEPT_CONDITIONAL":
   item.authority==="reviewed"?"APPROVED_REVIEWED_VARIANT":
   item.authority==="canonical"?"CANONICAL_RUNTIME_MEANING":"UNDETERMINED");
 const rejected=status==="reject";
 const inclusion=!rejected;
 if(inclusion)select(key,item.path,
  "COMPLETE_BANK_"+item.authority+"_"+status);
 bankInventory.push({key,path:item.path,bank:item.authority,
  source_lock_id:verdict?.id||"",
  source_lock_name:verdict?.name||"",
  source_lock_status:status,
  archive_decision:rejected?"EXCLUDED_REJECTED":"INCLUDED",
  runtime_status:item.authority==="canonical"?"CANONICAL_SEMANTIC_ASSET":
   item.authority==="oct29"?"GESTURE_CONDITIONAL":
   item.authority==="v46"?"LEGACY_BANK_NOT_PROOF_OF_DISPLAY":
   "BANK_VARIANT_NOT_PROOF_OF_DISPLAY",
  github_source:source+item.path});
 inventorySeen.add(item.path);
}
for(const dir of ["live-actors","live-audible","live-audio","live-cue",
 "live-gesture","live-guidance","live-posture","live-priest-position"]){
 const rel="assets/active/"+dir;
 for(const file of fs.readdirSync(path.join(root,rel))){
  if(!/\.(?:svg|png|webp)$/i.test(file))continue;
  const loc=rel+"/"+file;
  if(inventorySeen.has(loc))continue;
  const suppressed=loc==="assets/active/live-priest-position/ao-live-priest-foot-altar.png";
  if(!suppressed)select("legacy:"+dir+":"+file,loc,
   "LEGACY_LIVE_BANK_UNVERIFIED");
  bankInventory.push({key:"legacy:"+dir+":"+file,path:loc,
   bank:"legacy-live",source_lock_id:"",source_lock_name:"",
   source_lock_status:suppressed?"USER_SUPPRESSED_FOOT_CENTER":"LEGACY_NOT_CURRENTLY_VERIFIED",
   archive_decision:suppressed?"EXCLUDED_SUPPRESSED":"INCLUDED",
   runtime_status:"ARCHIVAL_LEGACY_NOT_CERTIFIED_AS_CURRENT",
   github_source:source+loc});
  inventorySeen.add(loc);
 }
}
csv("08_FULL_BANK_INVENTORY.csv",["key","path","bank","source_lock_id",
 "source_lock_name","source_lock_status","archive_decision","runtime_status",
 "github_source"],bankInventory);

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
json("REGISTRY.json",{schema:"AO_MASS_COMPLETE_ICON_EXPORT_V2",bankInventory,commit:process.env.GITHUB_SHA||"",
 files:assetRows,assignments,liveCards:cardRows,missalPages:pageRows,moments,
 canonicalMeanings:meanings,rejectedAssetIDs:lock.permanentlyRejectedExactArtwork.map(x=>x.id)});
const summary={iconFiles:assetRows.length,completeBankInventoryRows:bankInventory.length,sourceCrosswalk:crosswalk.rows.length,
 assignmentRows:assignments.length,liveCardsPerForm:cardRows.length/2,
 missalPagesPerForm:pageRows.length/2,cues:sourceCues.size,
 missingArtMeanings:meanings.filter(x=>!x.path).length};
json("SUMMARY.json",summary);
const esc=v=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const inventoryByPath=new Map();
for(const item of bankInventory){
 const old=inventoryByPath.get(item.path);
 if(!old||item.bank==="canonical")inventoryByPath.set(item.path,item);
}
const cards=assetRows.map(row=>{
 const entry=inventoryByPath.get(row.path)||{};
 const status=String(entry.source_lock_status||"SOURCE_ASSIGNED");
 const bank=String(entry.bank||"SOURCE_ASSIGNED");
 return '<article data-text="'+esc([row.path,bank,status,row.keys].join(" ").toLowerCase())+
 '"><div class="preview"><img loading="lazy" src="'+esc(row.path)+'" alt="'+esc(row.path)+'"></div>'+
 '<div class="details"><strong>'+esc(row.path.split("/").at(-1))+'</strong><small>'+
 esc(bank+' · '+status)+'</small><code>'+esc(row.path)+'</code></div></article>';
}).join("\n");
fs.writeFileSync(path.join(out,"ICON_GALLERY.html"),'<!doctype html><html lang="en"><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Ad Orientem Mass Icon Bank</title>'+
 '<style>body{background:#10151b;color:#eff1ed;font-family:system-ui,sans-serif;margin:0;padding:24px}h1{font-family:Georgia,serif}p{color:#abb4bd;max-width:860px}input{background:#242c34;border:1px solid #4f5e69;color:white;padding:12px;border-radius:9px;font-size:16px;width:min(94%,560px)}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px;margin-top:22px}article{border:1px solid #34414d;border-radius:12px;overflow:hidden;background:#18222a}.preview{height:155px;display:flex;align-items:center;justify-content:center;background:#e8e8df;padding:14px}.preview img{max-height:130px;max-width:100%;object-fit:contain}.details{padding:12px;display:grid;gap:6px;overflow-wrap:anywhere}small{color:#b7c5ce}code{font-size:11px;color:#c0b59a}article[hidden]{display:none}</style>'+
 '<h1>Mass · LIVE / MISSAL icon bank</h1><p>Original source assets, not redrawn. Includes canonical and source-assigned art plus labelled approved variants and legacy artwork. The rejection register preserves excluded images as metadata, not active icons.</p>'+
 '<input id="search" placeholder="Filter filename, bank or approval status" aria-label="Filter icons"><p id="count"></p><div class="grid">'+cards+'</div>'+
 '<script>const input=document.querySelector("#search"),el=[...document.querySelectorAll("article")];function apply(){let q=input.value.toLowerCase().trim(),n=0;for(let a of el){a.hidden=!a.dataset.text.includes(q);if(!a.hidden)n++}document.querySelector("#count").textContent=n+" of "+el.length+" source files"}input.addEventListener("input",apply);apply()</script></html>');

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
 "08_FULL_BANK_INVENTORY separates source bank, archive inclusion and exclusions.",
 "ICON_GALLERY.html is an offline sortable visual gallery of included files.",
 "REGISTRY.json is the complete machine-readable export.",
 "sources/ retains authoritative registries and the user rejection lock.",
 "",
 "Important: SOURCE assignment is NOT proof an icon appears in every form,",
 "moment or reading state. Runtime source state, priest/minister actor, rite",
 "and local conditions govern display. Null artwork and rejected Foot Centre",
 "substitutions remain text-only. V4.6 SVG files sometimes embed pixel art.",
 "Special-rite overlays are not misrepresented as ordinary 65-card events.",
 "No rejected or suppressed artwork is copied into this ZIP; excluded identifiers",
 "are preserved in the register only. Legacy assets are not asserted as active.",
 "",
 ...Object.entries(summary).map(([k,v])=>k+": "+v),
 ""].join("\n"));
console.log(JSON.stringify(summary));
