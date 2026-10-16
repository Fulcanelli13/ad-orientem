// Research-only: ORIGINAL source-owned physical shrine sites. A shrine title
// does not certify a saint identity, biography event, relic or feast.
import {isMapPublishablePlaceGeo} from "./geography-contracts.js";
const arr=x=>Array.isArray(x)?x:[];
const txt=x=>String(x??"").trim();
const fold=x=>txt(x).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const esc=x=>txt(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const safeUrl=x=>{
 try{
  const u=new URL(x);
  return u.protocol==="https:"&&["www.openstreetmap.org","openstreetmap.org","www.vatican.va"].includes(u.hostname)?u.href:null;
 }catch{return null;}
};
export function projectSaintResearchShrinePlaces(dataset={}){
 const audit=dataset.saintsShrineReadiness;
 if(!dataset?.saintsRelease?.researchEnabled||
    audit?.schema!=="ao.saints.existing-shrine-geography-readiness-20261016.v1"||
    audit?.status!=="SOURCE_LINKED_PLACE_CANDIDATES_NO_NEW_SAINT_PINS_OR_PERSON_ID_APPROVAL")
    return Object.freeze([]);
 const evidence=dataset?.saintsW78Evidence;
 const evidenceByName=evidence?.schema==="ao.saints.w78-119-shrine-name-owner-source-evidence.v1"&&
  evidence?.status==="READ_ONLY_SOURCE_MATCH_NOT_CANONICAL_IDENTITY_ART_OR_MAP_APPROVAL"
  ?new Map(arr(evidence.records).map(r=>[r.legacy_shrine_person_or_group_name,r])):new Map();
 const places=new Map(arr(dataset.geography?.places).map(p=>[p?.place_id,p]));
 const originalShrines=new Map(arr(dataset.shrines?.shrines).map(s=>[s.shrine_id,s]));
 const originalSources=new Map(arr(dataset.shrines?.sources).map(source=>[source.id,source]));
 const groups=new Map();
 for(const row of arr(audit.rows)){
  if(!txt(row.legacy_name_literal)||row.canonical_saint_id_approved!==null)continue;
  for(const link of arr(row.physical_place_associations)){
   const p=places.get(link.place_id),shrine=originalShrines.get(link.shrine_id);
   if(!p||!shrine||shrine.place_id!==link.place_id||
      !arr(shrine.associated_saints).includes(row.legacy_name_literal)||
      !arr(link.provenance_source_ids).every(id=>arr(shrine.source_ids).includes(id))||
      !arr(link.provenance_source_ids).length||
      link.identity_approved_for_pin!==false||
      link.observed_relation!=="SHRINE_ASSOCIATION_ONLY_NOT_BIRTH_DEATH_RESIDENCE_OR_RELIC_AUTHENTICATION")continue;
   if(!groups.has(link.place_id))groups.set(link.place_id,{place:p,relations:[]});
   const sourceCase=evidenceByName.get(row.legacy_name_literal);
   const caseEvidence=sourceCase&&arr(sourceCase.original_shrine_relationships).some(x=>
     x.place_id===link.place_id&&x.shrine_id===link.shrine_id)?sourceCase:null;
   groups.get(link.place_id).relations.push(Object.freeze({
    source_saint_name:row.legacy_name_literal,shrine_id:link.shrine_id,
    source_ids:Object.freeze([...link.provenance_source_ids]),
    official_source_links:Object.freeze(arr(link.provenance_source_ids).map(id=>{
      const source=originalSources.get(id);
      const href=source?.url;
      if(!href||!/^https:\/\//i.test(href))return null;
      return Object.freeze({source_id:id,href,issuer:txt(source.issuer),directness:txt(source.directness)});
    }).filter(Boolean)),
    exact_name_candidate_keys:Object.freeze([...arr(row.candidate_source_keys)]),
    identity_match_status:row.identity_match_status,
    source_reconciliation_tier:caseEvidence?.source_reconciliation_tier??"SHRINE_NAME_ONLY",
    source_key_review_bucket:caseEvidence?.source_key_review_bucket??"SHRINE_NAME_ONLY",
    curated_variant_source_key_leads:Object.freeze(arr(caseEvidence?.curated_variant_existing_key_leads).map(x=>x.source_key)),
    external_relic_subject_ids:Object.freeze(arr(caseEvidence?.external_owner_evidence?.relic_subjects).map(x=>x.subject_id)),
    external_art_research_subject_ids:Object.freeze(arr(caseEvidence?.external_owner_evidence?.sacred_art_subjects).map(x=>x.subject_id)),
    recorded_alias_source_keys:Object.freeze(arr(caseEvidence?.prior_documented_alias_candidates).flatMap(x=>arr(x.existing_exact_source_key_candidates))),
    entity_guard:caseEvidence?.person_kind_guard??"ENTITY_KIND_NOT_REVIEWED",
    interpretation:"SHRINE_SOURCE_NAME_ONLY_NOT_CERTIFIED_PERSON_PLACE"
   }));
  }
 }
 return Object.freeze([...groups.entries()].map(([id,row])=>{
  const p=row.place,g=p.geo??null;
  const precise=Boolean(!g?.indicative_only&&["site","complex_anchor"].includes(g?.precision)
    &&isMapPublishablePlaceGeo(g,p.address?.country_code));
  const associations=Object.freeze(row.relations.sort((a,b)=>a.source_saint_name.localeCompare(b.source_saint_name)));
  const title=txt(p.name?.official)||id;
  return Object.freeze({
   item_id:"saints:source-shrine:"+id,lens:"saints",kind:"SAINTS_SOURCE_SHRINE_PLACE",
   place_id:id,title,title_fr:title,subtitle:p.address?.formatted??"",
   eyebrow:"SAINTS · RESEARCH SHRINE ASSOCIATIONS",
   summary:associations.length+" sourced shrine-name association"+(associations.length===1?"":"s")+" · identities unapproved",
   summary_fr:associations.length+" association"+(associations.length===1?"":"s")+" à un sanctuaire · identités non certifiées",
   address:p.address??null,geo:precise?g:null,map_publishable:precise,
   map_state:precise?"MAPPED_EXISTING_SITE_RESEARCH_ONLY":"LIST_ONLY_GEO_HOLD",
   associated_saint_name_sources:associations,saints:Object.freeze([]),artwork_id:null,
   search_text:fold([title,p.address?.formatted,...associations.flatMap(a=>[
     a.source_saint_name,...a.exact_name_candidate_keys,...a.recorded_alias_source_keys,...a.curated_variant_source_key_leads
   ])].join(" ")),
   editorial_status:"RESEARCH_SHRINE_ASSOCIATION_NO_PERSON_IDENTITY_CERTIFIED"
  });
 }).sort((a,b)=>a.title.localeCompare(b.title)));
}
export function mergeSaintPilotAndResearchPlaces(pilot=[],research=[]){
 const covered=new Set(arr(pilot).map(x=>x.place_id));
 return Object.freeze([...arr(pilot),...arr(research).filter(x=>!covered.has(x.place_id))]);
}
export function renderSaintResearchShrineSheet(vm){
 const item=vm?.selected;
 if(item?.kind!=="SAINTS_SOURCE_SHRINE_PLACE")return "";
 const fr=vm.language==="fr",say=(en,frText)=>fr?frText:en;
 let h='<div class="aoFindSheetBackdrop" data-find-close-detail><section class="aoFindSheet aoSaintSourceShrineSheet" role="dialog" aria-modal="true" aria-label="'+esc(item.title)+'">';
 h+='<header><div><small>'+esc(say("SAINTS · SOURCE SHRI​NE","SAINTS · SANCTUAIRE SOURCÉ"))+'</small><h2>'+esc(item.title)+'</h2></div>'
  +'<button type="button" data-find-close-detail aria-label="'+esc(say("Close","Fermer"))+'">×</button></header>';
 if(item.subtitle)h+='<p class="aoSaintSourceShrineAddress">'+esc(item.subtitle)+'</p>';
 h+='<p class="aoSaintSourceShrineCaution">'+esc(say(
  "Existing shrine-name association. Not proof of this saint's identity, birthplace, deathplace, residence, or authenticated relics.",
  "Nom associé à un sanctuaire existant. Cela ne prouve ni l’identité du saint, ni sa naissance, son décès, son domicile ou l’authenticité de reliques."))+'</p>';
 h+='<h3>'+esc(say("Names given by the original shrine sources","Noms fournis par les sources des sanctuaires"))+'</h3>';
 h+='<ul class="aoSaintSourceShrinePeople">'+arr(item.associated_saint_name_sources).map(x=>
  '<li><strong>'+esc(x.source_saint_name)+'</strong><p>'+esc(say("Associated source name; person identity unconfirmed","Nom associé ; identité non confirmée"))+'</p>'
  +'<small>'+esc(arr(x.source_ids).join(" · "))+'</small>'
  +(x.source_reconciliation_tier!=="SHRINE_NAME_ONLY"
    ?'<p class="aoSaintSourceEvidenceStatus">'+esc(say("Cross-source research: ","Recherche intersources : ")+x.source_reconciliation_tier.replaceAll("_"," ").toLowerCase())+'</p>'
    :"")
  +(arr(x.exact_name_candidate_keys).length
    ?'<small>'+esc(say("Exact-name source key(s), not certified identity: ","Clé(s) de source au nom identique, identité non certifiée : ")+x.exact_name_candidate_keys.join(" · "))+"</small>":"")
  +(arr(x.recorded_alias_source_keys).length
    ?'<small>'+esc(say("Previously recorded alias candidate(s), unapproved: ","Alias antérieurs proposés, non approuvés : ")+x.recorded_alias_source_keys.join(" · "))+"</small>":"")
  +(arr(x.curated_variant_source_key_leads).length
    ?'<small>'+esc(say("Existing source-key variant lead(s), unapproved: ","Variantes de clés de source proposées, non approuvées : ")+x.curated_variant_source_key_leads.join(" · "))+"</small>":"")
  +(arr(x.external_relic_subject_ids).length
    ?'<small>'+esc(say("Relic registry subjects (not authenticated): ","Sujets du registre des reliques (non authentifiées) : ")+x.external_relic_subject_ids.join(" · "))+'</small>':"")
  +(arr(x.external_art_research_subject_ids).length
    ?'<small>'+esc(say("Unapproved art research subjects: ","Sujets de recherche artistique non approuvés : ")+x.external_art_research_subject_ids.join(" · "))+'</small>':"")
  +arr(x.official_source_links).map(link=>'<a class="aoSaintSourceShrineInstitution" href="'+esc(link.href)+'" target="_blank" rel="noopener noreferrer">'+esc(link.issuer||say("Original site source","Source du site"))+' ↗</a>').join("")+'</li>').join("")+'</ul>';
 const url=safeUrl(item.geo?.source_url);
 if(url)h+='<a class="aoSaintSourceShrineGeoSource" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(
  say("Original coordinate source","Source originale des coordonnées"))+' ↗</a>';
 h+='</section></div>';
 return h;
}
export const SAINTS_SHRINE_RESEARCH_CSS=[
 ".aoSaintSourceShrineSheet{max-width:640px;background:linear-gradient(155deg,#15202b,#080d14 62%)}",
 ".aoSaintSourceShrineSheet header h2{font:550 clamp(22px,5vw,28px)/1.2 var(--ao-font-display,Georgia,serif)}",
 ".aoSaintSourceShrineAddress{font:13px/1.5 var(--ao-font-ui,system-ui,sans-serif);color:#cdbb9a}",
 ".aoSaintSourceShrineCaution{border-inline-start:2px solid #bda47c;padding:12px;color:#e8d8bb;line-height:1.5}",
 ".aoSaintSourceShrinePeople{list-style:none;padding:0;display:grid;gap:10px}",
 ".aoSaintSourceShrinePeople li{border-bottom:1px solid rgba(217,197,154,.16);padding-bottom:9px}",
 ".aoSaintSourceShrinePeople strong{color:#e8d6b4;font-size:15px}",
 ".aoSaintSourceShrinePeople p,.aoSaintSourceShrinePeople small{display:block;color:#c4b69c;font-size:12px}",
 ".aoSaintSourceEvidenceStatus{margin:8px 0;color:#ceb994;font-size:12px}",
 ".aoSaintSourceShrineGeoSource,.aoSaintSourceShrineInstitution{display:inline-block;margin-right:12px;color:#e3c999;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}"
].join("");
