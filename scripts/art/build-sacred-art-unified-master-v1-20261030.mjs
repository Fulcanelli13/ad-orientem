/**
 * Ad Orientem Sacred Art — one bulk master + three exclusive operational queues.
 *
 * Sources are immutable. Unproven work-identity relations never deduplicate.
 * Rejected review decisions remain in the master, outside publication queues.
 * No painting/photo is READY without exact user quality PASS + rights and
 * original-byte/source proof. This wave creates NO publication approvals.
 *
 * GitHub Actions checks out main at upstream-main/ for 22 permanent module
 * hero decisions; merged research branch supplies the other frozen sources.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
const dir="data/calendar/",out="data/calendar/sacred-art-master-v1/";
const get=(path)=>JSON.parse(readFileSync(path,"utf8"));
const load=(name)=>get(dir+name);
const canon=load("sacred-art-curator-queues-383-20261029.v1.json").main_records;
const accept=load("sacred-art-accepted-856-to-canonical-383-20261029.v1.json").records;
const editorial=load("sacred-art-editorial-master-20261029.v1.json");
const shards=editorial.shards.flatMap(s=>get(s.path).records);
const candidates=load("sacred-art-candidates.v1.json").artworks;
const licenses=load("sacred-art-licence-first-383-exact-source-audit-20261029.v1.json").records;
const acceptedCommons=load("sacred-art-phase1-commons-305-structured-work-leads-20261030.v2.json").rows;
const prayer=load("prayer-31-section-review-reconciliation-20261028.v1.json");
const hero=get("upstream-main/data/research/module-hero-editorial-decision-ledger-2026-10-26.review19.json").final_approved_heroes;
const first200=load("sacred-art-phase2-first200-qa-worklist-20261029.v1.json").items;
const canonicalRepaired=load("sacred-art-phase1-canonical383-source-repair-priorities-20261030.v1.json");
if(canon.length!==383||accept.length!==856||shards.length!==2455||
 candidates.length!==281||licenses.length!==383||hero.length!==22||
 prayer.modules.length!==31||first200.length!==200||
 canonicalRepaired.stats.sourcePageMissing!==289)throw Error("Frozen input cardinality drift");
const sha=s=>createHash("sha256").update(s).digest("hex");
const normalizeUrl=s=>{try{
 const u=new URL(s);let path;try{path=decodeURIComponent(u.pathname)}catch{path=u.pathname}
 return u.hostname.toLowerCase().replace(/^www\./,"")+
 path.replace(/_/g," ").replace(/\/+$/,"").toLowerCase();
}catch{return null;}};
const normalize=s=>String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const words=s=>[...new Set(normalize(s).split(" ").filter(x=>x.length>=3 &&
 !new Set(["the","and","saint","sainte","san","santa","with","from","after",
 "circle","school","workshop","study","painting","les","des","del","von",
 "for","his","her","der","die","een","della","dello","van","het","and","du"]).has(x)))];
const topics=[
 ["annunciation",/\b(annunciation|annonciation|annunciazione|verkundigung|bebudelsen)\b/i],
 ["visitation",/\b(visitation|visitazione|visita de marie)\b/i],
 ["nativity",/\b(nativity|birth of (?:christ|jesus)|nativita|nativite|geburt christi)\b/i],
 ["adoration-of-shepherds",/\badoration of the shepherds|aanbidding door de herders|adorazione dei pastori/i],
 ["adoration-of-magi",/\b(adoration of the magi|adoration of the kings|epiphany|adorazione dei magi)/i],
 ["circumcision",/\bcircumcision\b/i],
 ["presentation-in-temple",/\bpresentation (?:of|in|at)|presentazione al tempio/i],
 ["flight-into-egypt",/\bflight into egypt|fuite en egypte|fuga in egitto/i],
 ["baptism-of-christ",/\bbaptism of (?:christ|jesus)|bapteme du christ|battesimo di cristo/i],
 ["transfiguration",/\btransfiguration|trasfigurazione\b/i],
 ["holy-family",/\b(holy family|sainte famille|sagrada familia|sacra famiglia)\b/i],
 ["last-supper",/\b(last supper|cene|ultima cena|avondmaal)\b/i],
 ["eucharist",/\b(eucharist|host|chalice|communion|mass of|messe de|messa di|benediction)\b/i],
 ["agony-in-garden",/\b(agony in the garden|garden of gethsemane|oraison au jardin)\b/i],
 ["scourging",/\b(scourg|flagellat)\w*/i],
 ["crown-of-thorns",/\b(crown(?:ing)? with thorns|couronnement d.epines|ecce homo)\b/i],
 ["crucifixion",/\b(crucifixion|crucified|crocifissione|kreuzigung)\b/i],
 ["descent-from-cross",/\b(descent from the cross|deposition|descente de croix)\b/i],
 ["lamentation",/\b(lamentation|pieta|pietà|ploration)\b/i],
 ["entombment",/\b(entombment|burial of christ|mise au tombeau)\b/i],
 ["resurrection",/\b(resurrection|risen christ|resurrezione|auferstehung)\b/i],
 ["ascension",/\bascension\b/i],
 ["pentecost",/\b(pentecost|pentecote|pentecoste|pfingsten)\b/i],
 ["assumption",/\b(assumption|assunzione|assomption)\b/i],
 ["coronation-of-virgin",/\bcoronation of the virgin|incoronazione della vergine/i],
 ["immaculate-conception",/\b(immaculate conception|inmaculada concepcion|immacolata concezione)\b/i],
 ["sacred-heart",/\b(sacred heart|heart of jesus|coeur sacre|sacro cuore)\b/i],
 ["immaculate-heart",/\b(immaculate heart|heart of mary|coeur immacule)\b/i],
 ["rosary",/\b(rosary|rosario|rosaire|rosenkranz)\b/i],
 ["seven-sorrows",/\b(seven sorrows|sette dolori|sept douleurs)\b/i],
 ["divine-mercy",/\b(divine mercy|misericordia)\b/i],
 ["purgatory",/\b(purgatory|purgatoire|purgatorio)\b/i],
 ["annunciation-angel-gabriel",/\b(gabriel)\b/i],
 ["archangel-michael",/\b(michael|michel|michele|miguel)\b/i],
 ["guardian-angel",/\b(guardian angel|ange gardien|angelo custode)\b/i],
 ["old-testament-abraham",/\b(abraham)\b/i],
 ["old-testament-moses",/\b(moses|moise|mose)\b/i],
 ["old-testament-david",/\b(david)\b/i],
 ["old-testament-daniel",/\b(daniel)\b/i],
 ["mary-magdalene",/\b(magdalen|magdalena|madeleine)\b/i],
 ["saint-joseph",/\b(joseph|giuseppe|jose)\b/i],
 ["saint-john-baptist",/\b(john the baptist|jean.baptiste|giovanni battista)\b/i],
 ["martyrdom",/\b(martyrdom|martirio|martyr)\b/i],
 ["saint-portrait",/\b(saint|st\.|santa|santo|sainte|san )\b/i],
 ["altarpiece",/\b(altarpiece|retable|retablo|triptych|polyptych|altar)\b/i],
 ["oil-sketch",/\b(oil sketch|modello|bozzetto|sketch)\b/i],
 ["engraving-or-print",/\b(engraving|etching|print|gravure|lithograph)\b/i]
];
const termTags=(title)=>topics.filter(([tag,rx])=>rx.test(String(title||""))).map(([tag])=>tag);
const list=a=>[...new Set((a||[]).filter(x=>typeof x==="string"&&x.trim()))];
const byCanon=new Map(canon.map(x=>[x.artwork_id,x]));
const licenseByCanon=new Map(licenses.map(x=>[x.artwork_id,x]));
const sourceReview=new Map(shards.map(x=>[x.sourceId,x]));
const byReview=new Map(accept.map(x=>[x.sourceId,x]));
const first200ById=new Map(first200.map(x=>[x.id,x]));
const commonsById=new Map(acceptedCommons.map(x=>[x.sourceId,x]));
if(sourceReview.size!==2455||byReview.size!==856||byCanon.size!==383)
 throw Error("Duplicate identifiers");
const acceptedBySourceUrl=new Map();
for(const a of accept){
 const u=normalizeUrl(a.review.originalSourceUrl);
 if(u)acceptedBySourceUrl.set(u,[...(acceptedBySourceUrl.get(u)||[]),a.sourceId]);
}
const byAcceptedSourceId=id=>{
 const a=byReview.get(id);
 return a?.canonical383?.status==="CONFIRMED_IDENTITY"?
   "CANONICAL::"+a.canonical383.artworkId:"REVIEW::"+id;
};
const candidateIds=new Map(candidates.map(x=>[x.id,x]));
const candByUrl=new Map();
for(const c of candidates){const u=normalizeUrl(c.source?.objectUrl);
 if(u)candByUrl.set(u,[...(candByUrl.get(u)||[]),c.id]);}
const sourceToWork=new Map(accept.map(a=>[a.sourceId,byAcceptedSourceId(a.sourceId)]));
const workRefFor=(id,url)=>{
 if(byCanon.has(id))return "CANONICAL::"+id;
 if(sourceToWork.has(id))return sourceToWork.get(id);
 const u=normalizeUrl(url),hits=(acceptedBySourceUrl.get(u)||[]).map(id=>sourceToWork.get(id));
 const uniq=list(hits);if(uniq.length===1)return uniq[0];
 return null;
};
const officialPolicy=(url)=>{
 const s=String(url||"");
 return /^(https?:\/\/)(?:www\.)?(metmuseum\.org|clevelandart\.org)\//i.test(s);
};
const rightsFromAudit=(audit)=>{
 if(!audit)return null;
 const status=audit.file_licence_audit_status;
 const m=audit.commons_live_file_metadata||{};
 const licence=m.licence_short_name||audit.commons_file_licence_class||"";
 if(status==="COMMONS_PUBLIC_DOMAIN_EXACT_FILE_METADATA_VERIFIED")
  return {classification:"FREE_FILE_METADATA_VERIFIED",label:"PUBLIC_DOMAIN",
   evidence:"CURRENT_COMMONS_EXACT_FILE_METADATA",terms:licence||"Public domain",
   policyUrl:m.licence_url||"",credit:m.attribution||"",sourcePhotoId:m.current_image_sha1||"",
   exactImageFileProof:"CURRENT_COMMONS_IMAGE_SHA1",requiresFileByteCheck:true};
 if(status==="EXACT_SELECTED_ARCHIVE_OFFICIAL_CC0_SHA_VERIFIED")
  return {classification:"FREE_EXACT_ARCHIVE_CC0_EVIDENCE",label:"CC0",
   evidence:"OFFICIAL_MUSEUM_CC0_AND_HISTORICAL_ARCHIVE_SHA",terms:"CC0",
   policyUrl:audit.source_photo_policy_url||"",credit:"",
   sourcePhotoId:audit.recorded_archive_image_sha256||"",
   exactImageFileProof:"ARCHIVE_SHA256_RECORDED",requiresFileByteCheck:true};
 if(status==="OFFICIAL_CC0_ARCHIVE_PROVENANCE_SHA_LINKED"||
   status==="EXACT_OFFICIAL_CC0_ARCHIVE_PREVIOUSLY_VERIFIED_API_403_HOLD")
  return {classification:"OPEN_ACCESS_EXACT_PHOTO_RECHECK",label:"CC0_SOURCE_POLICY",
   evidence:status,terms:"Official CC0 artwork policy; verify exact selected image",
   policyUrl:audit.source_photo_policy_url||"",credit:"",
   sourcePhotoId:audit.recorded_archive_image_sha256||"",
   exactImageFileProof:"ARCHIVED_PHOTO_SHA_RECORDED_BUT_RECHECK",requiresFileByteCheck:true};
 if(status==="OFFICIAL_CC0_OBJECT_NOT_EXACT_ARCHIVED_PHOTO_CERTIFIED"||
 status==="OFFICIAL_CC0_PHOTOGRAPH_VERSION_REQUIRES_JOIN")
  return {classification:"OPEN_ACCESS_EXACT_PHOTO_RECHECK",label:"CC0_SOURCE_POLICY",
   evidence:status,terms:"Official CC0 museum work; selected photograph not proven",
   policyUrl:audit.source_photo_policy_url||"",credit:"",sourcePhotoId:"",
   exactImageFileProof:"PENDING",requiresFileByteCheck:true};
 if(status==="COMMONS_CC_BY_ATTRIBUTION_REQUIRED"||status==="COMMONS_CC_BY_SA_ATTRIBUTION_SHAREALIKE")
  return {classification:"ATTRIBUTION_LICENSE_DEFERRED",label:licence||
   (status.includes("SA")?"CC BY-SA":"CC BY"),evidence:status,
   terms:"Usable only after legally required attribution and licence obligations are satisfied",
   policyUrl:m.licence_url||"",credit:m.attribution||"",sourcePhotoId:m.current_image_sha1||"",
   exactImageFileProof:"COMMONS_FILE_LICENSE_METADATA",requiresFileByteCheck:true};
 return {classification:"RIGHTS_UNRESOLVED",label:licence||"",evidence:status,
   terms:"Rights and/or exact source-photo identity not demonstrated",
   policyUrl:audit.source_photo_policy_url||"",credit:m.attribution||"",sourcePhotoId:"",
   exactImageFileProof:"NONE",requiresFileByteCheck:true};
};
const rightsFor=(kind,sourceId,url,canonId,candidate)=>{
 if(kind==="CANONICAL"){
  return rightsFromAudit(licenseByCanon.get(canonId))||rightsFromAudit(null);
 }
 if(kind==="REVIEW"){
  const origin=sourceReview.get(sourceId);
  if(origin?.rightsHold===true)return {
   classification:"RIGHTS_UNRESOLVED",label:"",evidence:"ORIGINAL_REVIEW_RIGHTS_HOLD",
   terms:"Historical source-rights hold",policyUrl:"",credit:"",
   sourcePhotoId:"",exactImageFileProof:"NONE",requiresFileByteCheck:true};
  if(officialPolicy(url))return {
   classification:"OPEN_ACCESS_EXACT_PHOTO_RECHECK",label:"CC0_SOURCE_POLICY",
   evidence:"MET_OR_CMA_OPEN_ACCESS_SOURCE_POLICY_NOT_EXACT_IMAGE",
   terms:"Institutional open-access source only; exact photograph rights and file SHA need verification",
   policyUrl:"",credit:"",sourcePhotoId:"",
   exactImageFileProof:"PENDING",requiresFileByteCheck:true};
  return {classification:"RIGHTS_UNRESOLVED",label:"",
   evidence:sourceId.startsWith("commons:")?
    "COMMONS_STRUCTURED_WORK_STATEMENTS_NOT_A_PHOTO_LICENSE":"NO_EXACT_REUSE_PROOF_IN_FROZEN_ACCEPTED_SOURCE",
   terms:"Not certified as a reusable exact image",policyUrl:"",credit:"",
   sourcePhotoId:"",exactImageFileProof:"NONE",requiresFileByteCheck:true};
 }
 if(kind==="RESEARCH"&&candidate?.source?.rights==="CC0")
  return {classification:"OPEN_ACCESS_EXACT_PHOTO_RECHECK",label:"CC0_SOURCE_POLICY",
   evidence:"RESEARCH_CANDIDATE_MUSEUM_CC0_ONLY",
   terms:"Catalogue candidate, requires editorial approval and exact photo check",
   policyUrl:candidate.source?.rightsPolicyUrl||"",credit:"",
   sourcePhotoId:candidate.acquisition?.originalSha256||"",
   exactImageFileProof:"RESEARCH_SHA_RECHECK",requiresFileByteCheck:true};
 return {classification:"RIGHTS_UNRESOLVED",label:"",
   evidence:"NO_EXACT_IMAGE_REUSE_RIGHTS_PROVEN",terms:"Source and photo rights require verification",
   policyUrl:"",credit:"",sourcePhotoId:"",exactImageFileProof:"NONE",requiresFileByteCheck:true};
};
const master=[];
function append(item){
 const id=item.recordId;
 if(!id||master.some(z=>z.recordId===id))throw Error("Duplicate master record "+id);
 const title=item.title||"",artist=item.artist||"";
 item.searchTerms=list([ ...words(title),...words(artist),...item.iconography,
  ...item.scriptureKeys,...item.seasonIds,...item.prayerKeys,
  ...(item.moduleIds||[])]);
 item.identityConfidence=item.identityConfidence||"UNVERIFIED_PHYSICAL_WORK_LINK";
 item.rights=item.rights||rightsFor(item.recordKind,item.sourceId,item.sourceUrl,
  item.canonicalArtworkId);
 item.qaDecision="NOT_PRISTINE_APPROVED";
 item.productionApproved=false;
 master.push(item);
}
const archivedVerified=load("sacred-art-phase1-canonical383-111-official-source-verification-20261030.v1.json").rows;
const archivedUrlById=new Map(archivedVerified.filter(x=>x.verification.publishedObjectSourceIdentityConfirmed||
 x.verification.publishedSourceFilePageResolved).map(x=>[x.canonicalArtworkId,x.archivedPage]));
const sourceObjectPage=u=>{
 const s=String(u||"").trim();
 if(/^File:/i.test(s))return "https://commons.wikimedia.org/wiki/"+encodeURIComponent(s).replace(/%3A/i,":");
 if(!/^https?:\/\//i.test(s))return "";
 try{const p=new URL(s);
  return /\/wiki\/File:/i.test(p.pathname)||
   /\/art\/collection\/search\/\d+/i.test(p.pathname)||
   /\/art\/\d/i.test(p.pathname)||
   /\/artworks\/\d+/i.test(p.pathname)||
   /\/objects\/\d+/i.test(p.pathname)||
   /\/collection\/work\/data\//i.test(p.pathname)?s:"";
 }catch{return "";}
};
const bestCanonSource=(r,audit,cand)=>{
 const matches=accept.filter(x=>x.canonical383.status==="CONFIRMED_IDENTITY"&&
 x.canonical383.artworkId===r.artwork_id).map(x=>x.review.originalSourceUrl);
 const metId=String(audit?.museum_api||"").match(/collectionapi\.metmuseum\.org\/public\/collection\/v1\/objects\/(\d+)/i);
 const metUrl=metId?"https://www.metmuseum.org/art/collection/search/"+metId[1]:"";
 const reviewed=first200.filter(x=>x.canonicalId===r.artwork_id).map(x=>x.objectUrl);
 return [r.source_page,archivedUrlById.get(r.artwork_id),
  cand?.source?.objectUrl,...matches,...reviewed,metUrl,
  audit?.source_url,audit?.commons_file_title].map(sourceObjectPage).find(Boolean)||"";
};
const canWorkIds=new Set();
for(const r of canon){
 const cand=candidateIds.get(r.artwork_id),audit=licenseByCanon.get(r.artwork_id);
 canWorkIds.add("CANONICAL::"+r.artwork_id);
 append({recordId:"CANONICAL::"+r.artwork_id,workGroupId:"CANONICAL::"+r.artwork_id,
  recordKind:"CANONICAL",canonicalArtworkId:r.artwork_id,
  title:r.title,artist:r.artist||"",dateOrPeriod:cand?.dated||"",
  medium:cand?.medium||"",museum:cand?.museum||"",
  accession:cand?.source?.objectId||"",
  sourceId:"",sourceUrl:bestCanonSource(r,audit,cand),
  sourceFieldState:r.source_page?"CANONICAL_PAGE":"ARCHIVED_OR_RESEARCH_CANDIDATE_PAGE_NOT_CANONICAL_FIELD",
  exactOriginalSha:r.prior_source_sha256||audit?.recorded_archive_image_sha256||"",
  originalUserDecision:r.editorial_state,editorialStatus:r.editorial_state,
  isOperationalCandidate:/^(APPROVED|SELECTED)/.test(r.editorial_state||"")&&!r.historical_exclusion&&
    !r.historical_editorial_conflict,
  identityConfidence:"CANONICAL_LOCKED_ARTWORK_RECORD",
  subject:r.subject||"",iconography:list([r.subject,...(cand?.tags?.iconography||[])]),
  scriptureKeys:cand?.tags?.scriptureIdentityKeys||[],
  seasonIds:cand?.tags?.liturgicalSeasonIds||[],
  prayerKeys:cand?.tags?.prayerKeys||[],
  observedIds:cand?.tags?.observed1962Identifiers||[],
  moduleIds:[],notes:"",
  rights:rightsFromAudit(audit)||undefined,
  provenanceFiles:["data/calendar/sacred-art-curator-queues-383-20261029.v1.json",
   "data/calendar/sacred-art-licence-first-383-exact-source-audit-20261029.v1.json"]});
}
for(const r of shards){
 const a=byReview.get(r.sourceId),id=a?.canonical383?.artworkId||null;
 const linked=!!id&&a.canonical383.status==="CONFIRMED_IDENTITY";
 const c=linked?candidateIds.get(id):null;
 append({recordId:"REVIEW::"+r.sourceId,
  workGroupId:linked?"CANONICAL::"+id:"REVIEW::"+r.sourceId,
  recordKind:"REVIEW",canonicalArtworkId:linked?id:null,
  title:r.title||"",artist:r.artist||"",dateOrPeriod:"",
  medium:c?.medium||"",museum:c?.museum||"",
  accession:r.accession||"",sourceId:r.sourceId,
  sourceUrl:r.sourceObjectUrl||a?.review.originalSourceUrl||"",
  sourceFieldState:"ORIGINAL_FROZEN_REVIEW_SOURCE",
  exactOriginalSha:"",
  originalUserDecision:r.decision,editorialStatus:r.decision,
  isOperationalCandidate:r.decision==="IMPORT"||r.decision==="IMPORT_WITH_CORRECTIONS",
  identityConfidence:linked?"EXACT_PRIOR_CROSSWALK":"NO_CONFIRMED_CANONICAL_IDENTITY",
  iconography:list([...(c?.tags?.iconography||[])]),subject:"",
  scriptureKeys:c?.tags?.scriptureIdentityKeys||[],
  seasonIds:c?.tags?.liturgicalSeasonIds||[],
  prayerKeys:c?.tags?.prayerKeys||[],observedIds:c?.tags?.observed1962Identifiers||[],
  moduleIds:[],notes:r.corrections||"",
  rights:rightsFor("REVIEW",r.sourceId,r.sourceObjectUrl||a?.review.originalSourceUrl,id),
  structuredWorkQids:commonsById.get(r.sourceId)?.wikidataDigitalRepresentationOf||[],
  provenanceFiles:list(["data/calendar/sacred-art-editorial-master-20261029.v1.json",
   r.sourceFile,r.decisionFile]),
  priorityScore:first200ById.get(r.sourceId)?.priorityScore||0});
}
for(const c of candidates){
 const work=workRefFor(c.id,c.source?.objectUrl);
 append({recordId:"RESEARCH::"+c.id,workGroupId:work||"RESEARCH::"+c.id,
  recordKind:"RESEARCH",canonicalArtworkId:byCanon.has(c.id)?c.id:null,
  title:c.title||"",artist:c.artist||"",dateOrPeriod:c.dated||"",medium:c.medium||"",
  museum:c.museum||"",accession:c.source?.objectId||"",sourceId:"",
  sourceUrl:c.source?.objectUrl||"",
  sourceFieldState:"RESEARCH_OBJECT_SOURCE",
  exactOriginalSha:c.acquisition?.originalSha256||"",
  originalUserDecision:"NOT_A_USER_APPROVAL",editorialStatus:c.review?.status||"RESEARCH_ONLY",
  isOperationalCandidate:false,
  identityConfidence:work?"EXACT_ID_OR_SINGLE_SOURCE_URL_JOIN":"RESEARCH_CANDIDATE_UNLINKED",
  iconography:c.tags?.iconography||c.association?.subjectKeys||[],
  scriptureKeys:c.tags?.scriptureIdentityKeys||c.association?.scriptureKeys||[],
  seasonIds:c.tags?.liturgicalSeasonIds||c.association?.seasonIds||[],
  prayerKeys:c.tags?.prayerKeys||c.association?.prayerKeys||[],
  observedIds:c.tags?.observed1962Identifiers||c.association?.observedIds||[],
  moduleIds:c.tags?.prayerRoutes||[],subject:c.association?.subjectKeys?.join("|")||"",
  notes:"Historical research option; never automatically treated as user approved",
  rights:rightsFor("RESEARCH","",c.source?.objectUrl,"",c),
  provenanceFiles:["data/calendar/sacred-art-candidates.v1.json"]});
}
const heroPlacements=[];
for(const h of hero){
 const group=workRefFor(h.artwork_id,h.source_url)||"HERO::"+h.artwork_id;
 append({recordId:"HERO::"+h.module_id,workGroupId:group,recordKind:"HERO",
  canonicalArtworkId:group.startsWith("CANONICAL::")?group.slice(11):null,
  title:h.title,artist:h.artist,dateOrPeriod:h.date||"",medium:"painting",
  museum:h.institution||"",accession:h.inventory||"",sourceId:"",
  sourceUrl:h.source_url||"",sourceFieldState:"USER_LOCKED_HERO_SOURCE",
  exactOriginalSha:"",originalUserDecision:"FINAL_MODULE_HERO_APPROVAL",
  editorialStatus:"FINAL_MODULE_HERO_APPROVAL",isOperationalCandidate:true,
  identityConfidence:group.startsWith("HERO::")?"HERO_UNLINKED_PENDING_OBJECT_ID":"EXACT_ID_OR_SOURCE_URL_JOIN",
  subject:"",iconography:list([...(h.iconography_note?[h.iconography_note]:[])]),
  scriptureKeys:[],seasonIds:[],prayerKeys:[],observedIds:[],
  moduleIds:[h.module_id],notes:h.rights_note||"",
  rights:rightsFor("HERO","",h.source_url,""),
  provenanceFiles:["upstream-main/data/research/module-hero-editorial-decision-ledger-2026-10-26.review19.json"]});
 heroPlacements.push({moduleId:h.module_id,module:h.module,
  artworkId:h.artwork_id,workGroupId:group,selected:true,sourceUrl:h.source_url||"",
  primary:true,releaseApproved:false});
}
const prayerPlacements=[];
for(const m of prayer.modules)for(const p of m.placements){
 const group=workRefFor(p.artwork_id,p.image_source)||"PRAYER::"+p.artwork_id;
 const row={moduleId:m.id,artworkId:p.artwork_id,workGroupId:group,
  placementKey:p.placement_key,decision:p.action,title:p.title,artist:p.artist,
  sourceUrl:p.image_source,notGlobalRejection:p.action==="reject",
  requiresBetterPhoto:p.action==="better_photo",approvedForProduction:false};
 prayerPlacements.push(row);
 // Only add missing artwork references; same work remains a linked placement.
 if(!master.some(x=>x.workGroupId===group)&&!master.some(x=>x.recordId==="PRAYER::"+p.artwork_id)){
  append({recordId:"PRAYER::"+p.artwork_id,workGroupId:group,recordKind:"PRAYER_PLACEMENT",
   canonicalArtworkId:null,title:p.title,artist:p.artist,dateOrPeriod:"",
   medium:"",museum:"",accession:"",sourceId:"",sourceUrl:p.image_source||"",
   sourceFieldState:"REVIEWED_PRAYER_PLACEMENT_SOURCE",
   exactOriginalSha:"",originalUserDecision:"PLACEMENT_"+String(p.action||"UNREVIEWED").toUpperCase(),
   editorialStatus:"PLACEMENT_"+String(p.action||"UNREVIEWED").toUpperCase(),
   isOperationalCandidate:p.action==="keep",subject:"",
   identityConfidence:"PRAYER_SOURCE_ONLY_NO_PHYSICAL_WORK_JOIN",
   iconography:[],scriptureKeys:[],seasonIds:[],prayerKeys:[],
   observedIds:[],moduleIds:[m.id],notes:p.review_note||"",
   rights:rightsFor("PRAYER_PLACEMENT","",p.image_source,""),
   provenanceFiles:["data/calendar/prayer-31-section-review-reconciliation-20261028.v1.json"]});
 }
}
if(master.length<3100)throw Error("Unified registry unexpectedly incomplete");
const groups=new Map();
for(const x of master){
 if(!groups.has(x.workGroupId))groups.set(x.workGroupId,[]);
 groups.get(x.workGroupId).push(x);
}
const rightsRank={FREE_EXACT_ARCHIVE_CC0_EVIDENCE:5,
 FREE_FILE_METADATA_VERIFIED:4,OPEN_ACCESS_EXACT_PHOTO_RECHECK:3,
 ATTRIBUTION_LICENSE_DEFERRED:1,RIGHTS_UNRESOLVED:0};
const operational=[];
for(const [gid,rows] of groups){
 const active=rows.filter(x=>x.isOperationalCandidate);
 if(!active.length)continue;
 const c=rows.find(x=>x.recordKind==="CANONICAL")||null;
 const allowed=active.filter(x=>!/\b(El Greco|Fra Angelico)\b/i.test(x.artist||""));
 const statuses=list(active.map(x=>x.originalUserDecision));
 const alternateRights=active.map(x=>({recordId:x.recordId,rights:x.rights,
  sourceUrl:x.sourceUrl,originalSha:x.exactOriginalSha})).sort((a,b)=>
  (rightsRank[b.rights.classification]||0)-(rightsRank[a.rights.classification]||0));
 const best=alternateRights[0],r=best.rights;
 const hasConflict=active.some(x=>x.originalUserDecision==="IMPORT_WITH_CORRECTIONS")||
  (c?.editorialStatus==="APPROVED_CONFLICT");
 const qualityUserPass=false;
 const rightsFree=r.classification.startsWith("FREE_")||
  r.classification==="OPEN_ACCESS_EXACT_PHOTO_RECHECK";
 const category=qualityUserPass&&rightsFree?"READY_TO_PUBLISH":
  rightsFree?"PHOTO_QA_OR_REPAIR":"RIGHTS_OR_ALTERNATIVE";
 const qaStatus=hasConflict?"REVIEW_REPAIR_OR_USER_CORRECTIONS":
  r.classification==="OPEN_ACCESS_EXACT_PHOTO_RECHECK"?"VERIFY_EXACT_IMAGE_LICENSE_AND_ORIGINAL":
  r.classification==="FREE_FILE_METADATA_VERIFIED"?"FETCH_NATIVE_ORIGINAL_AND_USER_PRISTINE_CHECK":
  r.classification==="FREE_EXACT_ARCHIVE_CC0_EVIDENCE"?"REVERIFY_ARCHIVED_BYTES_AND_USER_PRISTINE_CHECK":
  r.classification==="ATTRIBUTION_LICENSE_DEFERRED"?"DEFER_ATTRIBUTION_AND_SHAREALIKE_COMPLIANCE":
  "FIND_PUBLIC_DOMAIN_OR_CC0_IMAGE_SOURCE";
 const moduleIds=list([ ...active.flatMap(x=>x.moduleIds||[]),
  ...heroPlacements.filter(x=>x.workGroupId===gid).map(x=>x.moduleId),
  ...prayerPlacements.filter(x=>x.workGroupId===gid&&x.decision==="keep").map(x=>x.moduleId)]);
 const idx=first200ById.get(active.find(x=>first200ById.has(x.sourceId))?.sourceId);
 operational.push({workGroupId:gid,artworkTitle:allowed[0]?.title||active[0].title,
  artist:allowed[0]?.artist||active[0].artist,
  canonicalArtworkId:c?.canonicalArtworkId||"",
  rightsCategory:r.classification,rightsLabel:r.label,
  rightsEvidence:r.evidence,rightsTerms:r.terms,rightsPolicyUrl:r.policyUrl,
  photographerCredit:r.credit,selectedPhotoFingerprint:r.sourcePhotoId,
  preferredRecordId:best.recordId,selectedSourceUrl:best.sourceUrl,
  sourceOriginalSha256:best.originalSha,
  acceptedRecordIds:active.map(x=>x.recordId),
  allSourceVariantCount:rows.length,
  userReviewStates:statuses,iconography:list(rows.flatMap(x=>x.iconography||[])),
  searchKeywords:list(rows.flatMap(x=>x.searchTerms||[])),
  moduleIds,rightsAlternatives:alternateRights,priorityScore:Math.max(
   idx?.priorityScore||0,...active.map(x=>x.priorityScore||0),
   moduleIds.length?400:0,c?.isOperationalCandidate?280:0),
  queue:category,substatus:qaStatus,
  readyForUserPristineQualityReview:
   (r.classification==="FREE_FILE_METADATA_VERIFIED"||
    r.classification==="FREE_EXACT_ARCHIVE_CC0_EVIDENCE")&&!hasConflict,
  imageOriginalNativeLocallyVerified:false,
  userPhotoQualityApproval:false,exactPhotoRightsCertifiedForSelectedBytes:false,
  productionReleased:false,
  historicalExclusion:allowed.length===0,
  noAutomaticSameWorkMerge:true});
}
for(const x of operational)if(x.historicalExclusion){
 // Explicit excluded artist stays visible in master but out of queues.
 x.queue="BLOCKED_HISTORICAL_EXCLUSION";
}
const valid=operational.filter(x=>!x.historicalExclusion);
const queues={
 READY_TO_PUBLISH:valid.filter(x=>x.queue==="READY_TO_PUBLISH"),
 PHOTO_QA_OR_REPAIR:valid.filter(x=>x.queue==="PHOTO_QA_OR_REPAIR"),
 RIGHTS_OR_ALTERNATIVE:valid.filter(x=>x.queue==="RIGHTS_OR_ALTERNATIVE")
};
if(Object.values(queues).reduce((n,x)=>n+x.length,0)!==valid.length)
 throw Error("Operational group classification not exhaustive");
if(queues.READY_TO_PUBLISH.length!==0||
 queues.PHOTO_QA_OR_REPAIR.some(x=>x.userPhotoQualityApproval===true)||
 valid.some(x=>x.productionReleased!==false))
 throw Error("No automatic readiness certification allowed");
function csv(rows,columns){
 const quote=v=>{
  if(v===null||v===undefined)return "";
  let s=Array.isArray(v)?v.join(" | "):typeof v==="object"?JSON.stringify(v):String(v);
  return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;
 };
 return "\uFEFF"+columns.join(",")+"\n"+rows.map(r=>columns.map(k=>quote(r[k])).join(",")).join("\n")+(rows.length?"\n":"");
}
const masterRows=master.map(x=>({
 record_id:x.recordId,physical_work_group:x.workGroupId,record_type:x.recordKind,
 canonical_id:x.canonicalArtworkId||"",source_id:x.sourceId||"",
 title:x.title,artist:x.artist,period_or_date:x.dateOrPeriod,
 medium:x.medium,holding_museum:x.museum,accession:x.accession,
 source_url:x.sourceUrl,source_status:x.sourceFieldState,
 photo_original_sha256:x.exactOriginalSha,
 original_editorial_decision:x.originalUserDecision,
 editorial_status:x.editorialStatus,
 title_derived_iconography:x.iconography,
 search_terms:x.searchTerms,
 observed_1962_ids:x.observedIds,
 scripture_subject_keys:x.scriptureKeys,
 prayer_keys:x.prayerKeys,module_ids:x.moduleIds,
 rights_class:x.rights.classification,
 rights_licence_label:x.rights.label,
 rights_evidence:x.rights.evidence,
 rights_terms:x.rights.terms,rights_policy_url:x.rights.policyUrl,
 rights_credit:x.rights.credit,
 photo_fingerprint:x.rights.sourcePhotoId,
 identity_confidence:x.identityConfidence,
 active_candidate:x.isOperationalCandidate,
 final_pristine_photo_approved:x.qaDecision==="PRISTINE_APPROVED",
 published:x.productionApproved,
 provenance_source_files:x.provenanceFiles,
 research_notes:x.notes
}));
const queueCols=["physical_work_group","title","artist","queue","substatus",
 "rights_category","rights_label","rights_evidence","rights_terms",
 "rights_policy_url","photographer_credit","selected_photo_file_fingerprint",
 "source_url","original_sha256","source_record","canon_artwork_id",
 "module_targets","source_variant_count","priority_score",
 "native_original_verified","human_pristine_approved","approved_in_app"];
const toQueueRow=x=>({
 physical_work_group:x.workGroupId,title:x.artworkTitle,artist:x.artist,
 queue:x.queue,substatus:x.substatus,rights_category:x.rightsCategory,
 rights_label:x.rightsLabel,rights_evidence:x.rightsEvidence,
 rights_terms:x.rightsTerms,rights_policy_url:x.rightsPolicyUrl,
 photographer_credit:x.photographerCredit,
 selected_photo_file_fingerprint:x.selectedPhotoFingerprint,
 source_url:x.selectedSourceUrl,original_sha256:x.sourceOriginalSha256,
 source_record:x.preferredRecordId,canon_artwork_id:x.canonicalArtworkId,
 module_targets:x.moduleIds,source_variant_count:x.allSourceVariantCount,
 priority_score:x.priorityScore,native_original_verified:false,
 human_pristine_approved:false,approved_in_app:false});
const toQueue=(arr)=>arr.map(toQueueRow).sort((a,b)=>
 b.priority_score-a.priority_score||String(a.title||"").localeCompare(String(b.title||"")));
const firstReview=toQueue(queues.PHOTO_QA_OR_REPAIR.filter(x=>x.readyForUserPristineQualityReview))
 .slice(0,200).map((x,i)=>({
 batch_position:i+1,...x,user_photo_decision:"",
 quality_issue_notes:"",user_reviewed_image_sha256:"",reviewed_on:""
 }));
const reviewCols=["batch_position",...queueCols,"user_photo_decision","quality_issue_notes",
 "user_reviewed_image_sha256","reviewed_on"];
const outcomes={totalUserReviewDecisions:2455,
 acceptedUserReviewChoices:856,rejectedUserReviewChoices:1599,
 canonicalRecords:383,oldResearchCandidates:281,
 lockedModuleHeroAssignments:22,prayerSections:31,
 prayerPlacementDecisions:prayerPlacements.length,
 registryRecords:master.length,
 provisionalWorkGroups:groups.size,
 operationalWorkGroups:valid.length,
 historicalExcludedOperationalGroups:operational.length-valid.length,
 queueReadyToPublish:queues.READY_TO_PUBLISH.length,
 queuePhotoQaOrRepair:queues.PHOTO_QA_OR_REPAIR.length,
 queueRightsOrAlternative:queues.RIGHTS_OR_ALTERNATIVE.length,
 reusableExactFileMetadataFirstReviewCandidates:queues.PHOTO_QA_OR_REPAIR.filter(x=>x.readyForUserPristineQualityReview).length,
 firstReviewBatchSize:firstReview.length,
 newQualityApprovalsGranted:0,newPhotoPublicationApprovals:0,
 sourceDecisionsModified:0,feeEur:0};
mkdirSync(out,{recursive:true});
const records={
 schema:"AO_SACRED_ART_MASTER_BATCH_V1",
 generatedAt:new Date().toISOString(),
 frozenSources:["data/calendar/sacred-art-editorial-master-20261029.v1.json",
  "data/calendar/sacred-art-curator-queues-383-20261029.v1.json",
  "data/calendar/sacred-art-accepted-856-to-canonical-383-20261029.v1.json",
  "data/calendar/sacred-art-candidates.v1.json",
  "data/calendar/sacred-art-licence-first-383-exact-source-audit-20261029.v1.json",
  "upstream-main/data/research/module-hero-editorial-decision-ledger-2026-10-26.review19.json",
  "data/calendar/prayer-31-section-review-reconciliation-20261028.v1.json"],
 rules:["A record is a source, canonical artwork, candidate, or module placement; it is not necessarily one unique physical painting.",
  "Only pre-existing exact canonical links or unique original object page evidence unify provisional work groups.",
  "Historical rejection is immutable but outside three operational queues.",
  "Different exact source images can have different rights; a CC0 canvas does not automatically clear another photograph.",
  "CC BY/BY-SA are not illegal; first wave defers their attribution/share-alike compliance at user request.",
  "A public-domain media statement does not prove no-frame/no-glare/native source-photo quality.",
  "NO art goes to publication-ready without human-pristine PASS plus exact photograph rights, file bytes and app crop QA.",
  "Title-derived iconography is search indexing, not a certified depiction or liturgical occasion.",
  "Generated outputs are materialized indexes; immutable upstream source decisions remain authoritative."],
 counts:outcomes,registry:master,operationalWorks:valid,
 moduleHeroPlacements:heroPlacements,prayerPlacements,
 reviewBatch:firstReview.map(x=>({id:x.physical_work_group,source:x.source_record,
  decision:"PENDING_USER_REVIEW"})),
 release:{productionMutation:false,editorialChanges:0,userPhotoApproved:0}};
writeFileSync(out+"master.json",JSON.stringify(records,null,2)+"\n");
writeFileSync(out+"master.csv",csv(masterRows,Object.keys(masterRows[0])));
for(const [name,arr] of Object.entries(queues))
 writeFileSync(out+"queue-"+name.toLowerCase().replaceAll("_","-")+".csv",
 csv(toQueue(arr),queueCols));
writeFileSync(out+"first-pristine-photo-review.csv",csv(firstReview,reviewCols));
writeFileSync(out+"module-placement-ledger.csv",csv([
 ...heroPlacements.map(h=>({placement_kind:"HERO",module:h.moduleId,artwork_id:h.artworkId,
  group_id:h.workGroupId,action:"FINAL_USER_APPROVED",source_url:h.sourceUrl,
  app_released:false})),
 ...prayerPlacements.map(p=>({placement_kind:"PRAYER",module:p.moduleId,artwork_id:p.artworkId,
  group_id:p.workGroupId,action:p.decision,source_url:p.sourceUrl,app_released:false}))
 ],["placement_kind","module","artwork_id","group_id","action","source_url","app_released"]));
writeFileSync(out+"summary.json",JSON.stringify({schema:"AO_SACRED_ART_MASTER_V1_COUNTS",
 at:new Date().toISOString(),counts:outcomes,sha256ByOutput:Object.fromEntries(
 ["master.csv","master.json","queue-ready-to-publish.csv","queue-photo-qa-or-repair.csv",
 "queue-rights-or-alternative.csv","first-pristine-photo-review.csv",
 "module-placement-ledger.csv"].map(f=>[f,sha(readFileSync(out+f,"utf8"))])),
 warnings:["0 release-ready means no user pristine native photograph PASS yet, not that no usable artwork exists.",
  "Number of source records exceeds distinct physical artworks due to unidentified duplicates.",
  "Queue 2 contains free-source-policy leads; user QA must use exact native files, not thumbnails.",
  "Unapproved and rejected artworks are preserved in master without being added to operational queues.",
  "Structured-data work QIDs are not verified physical artwork equivalences."]},null,2)+"\n");
console.log(JSON.stringify(outcomes,null,2));
