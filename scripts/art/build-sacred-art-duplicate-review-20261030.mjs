/**
 * Sacred Art duplicate review. Read-only build from the frozen 3 visual galleries
 * and operational registry. Never deduplicates, approves, deletes or publishes.
 * The generated HTML embeds the matching gallery previews so review works offline.
 */
import { readFileSync,writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
const BASE="data/calendar/";
const SOURCE="research/sacred-art-phase1-consolidation-20261029";
const master=JSON.parse(readFileSync(BASE+"sacred-art-master-v2/master.json","utf8"));
const triage=JSON.parse(readFileSync(BASE+"sacred-art-phase1-identity-triage-34-20261029.v1.json","utf8"));
const batchPaths=["01","02","03"].map(x=>"docs/SACRED_ART_FAST_GRID_REVIEW_BATCH"+x+"_20261030.html");
const all=[];
for(const [i,path] of batchPaths.entries()){
 const raw=readFileSync(path,"utf8");
 const match=raw.match(/const data=(\[[\s\S]*?\]);\s*const KEY=/);
 if(!match)throw Error("Missing gallery data "+path);
 const cards=JSON.parse(match[1]);
 if(cards.length!==[73,200,171][i])throw Error("Changed gallery cardinality "+path);
 for(const c of cards)all.push({...c,batch:String(i+1).padStart(2,"0")});
}
if(all.length!==444||master.registry.length!==3205||master.operationalWorks.length!==989||triage.groups.length!==34)
 throw Error("Source registry or image review baseline drift");
const norm=s=>String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
  .replace(/\([^)]*\)/g," ").replace(/[^a-z0-9]+/g," ").trim();
const normUrl=s=>{try{const u=new URL(s);return u.hostname.toLowerCase().replace(/^www\./,"")+
 decodeURIComponent(u.pathname).replace(/_/g," ").toLowerCase().replace(/\/+$/,"");}
 catch{return "";}};
const cardById=new Map(all.map(c=>[c.id,c]));
if(cardById.size!==444)throw Error("Duplicate review ID among galleries");
const embeddedByUrl=new Map();
for(const c of all){const url=normUrl(c.sourceUrl);if(url&&c.preview?.startsWith("data:image/")&&!embeddedByUrl.has(url))embeddedByUrl.set(url,c.preview);}
const active=master.registry.filter(r=>r.isOperationalCandidate);
const activeByGroup=Map.groupBy(active,r=>r.workGroupId);
const activeByRecord=new Map(active.map(r=>[r.recordId,r]));
const ops=master.operationalWorks;
const workById=new Map(ops.map(w=>[w.workGroupId,w]));
const groups=[],seen=new Set();
const sha=s=>createHash("sha256").update(s).digest("hex").slice(0,14);
function memberFromCard(c){
 return {id:c.id,title:c.title||"",artist:c.artist||"",sourceUrl:c.sourceUrl||"",
  label:"Reviewed Batch "+c.batch,rights:c.rightsLabel||"",
  preview:c.preview||c.remotePreview||"",sourceFingerprint:c.sourcePhotoFingerprint||""};
}
function memberFromWork(w){
 const c=cardById.get(w.workGroupId);
 if(c)return memberFromCard(c);
 const url=w.selectedSourceUrl||"";
 return {id:w.workGroupId,title:w.artworkTitle||"",artist:w.artist||"",sourceUrl:url,
  label:"Master candidate · "+(w.queue||"research"),rights:w.rightsLabel||"",
  preview:embeddedByUrl.get(normUrl(url))||w.qualityReviewPreviewUrl||"",
  sourceFingerprint:w.selectedPhotoFingerprint||""};
}
function memberFromRecord(r){
 const u=r.sourceUrl||"",bySource=embeddedByUrl.get(normUrl(u));
 return {id:r.recordId,title:r.title||"",artist:r.artist||"",sourceUrl:u,
  label:"Historical "+r.recordKind+" · "+(r.originalUserDecision||""),
  rights:r.rights?.label||"",preview:bySource||"",
  sourceFingerprint:r.rights?.sourcePhotoId||""};
}
function add(confidence,reason,members){
 const unique=[...new Map(members.filter(x=>x&&x.id).map(x=>[x.id,x])).values()]
  .sort((a,b)=>a.id.localeCompare(b.id));
 if(unique.length<2)return;
 const ident=unique.map(x=>x.id).join("|");
 if(seen.has(ident))return;
 seen.add(ident);
 groups.push({id:"DUP-"+sha(ident),confidence,reason,title:unique[0].title||"Potential duplicate",
   members:unique});
}
const by=(records,key)=>{
 const map=new Map();
 for(const r of records){const k=key(r);if(!k)continue;
  if(!map.has(k))map.set(k,[]);map.get(k).push(r);
 }
 return [...map.values()].filter(rows=>rows.length>1);
};
const reliableUrl=s=>/\/wiki\/file:|\/art\/collection\/search\/\d+|\/art\/\d|\/collection\/work\/data\/|\/artwork\/\d/i.test(s||"");
// Existing photographed source duplicates: strong evidence of one *photographic source*, not permission to delete artwork records.
for(const rows of by(all,c=>reliableUrl(c.sourceUrl)?normUrl(c.sourceUrl):"")){
 add("EXACT SOURCE", "Identical exact source page; choose the preferred catalogue record. Both source histories remain.",
  rows.map(memberFromCard));
}
// Same artist/title but different physical objects are possible; never identify from text alone.
for(const rows of by(all,c=>norm(c.artist)&&norm(c.title)?norm(c.artist)+"|"+norm(c.title):"")){
 if(new Set(rows.map(x=>normUrl(x.sourceUrl))).size<2)continue;
 add("POSSIBLE — REVIEW", "Same artist and title, but different source photographs or object pages. Mark Not duplicates if distinct.",
  rows.map(memberFromCard));
}
// One canonical work group can contain several photographs or archived aliases.
for(const [id,rows] of activeByGroup){
 if(!cardById.has(id)||rows.length<2)continue;
 const variants=[...new Map(rows.filter(r=>r.sourceUrl)
  .map(r=>[normUrl(r.sourceUrl),r])).values()];
 if(variants.length<2)continue;
 add("LINKED WORK — PHOTOS", "Several source records are linked to one work. Check whether they show the same painting; no link is made irreversible.",
  variants.map(memberFromRecord));
}
// Scan the entire operational registry for likely duplicates not already in the 444 photo batch.
for(const rows of by(ops,w=>reliableUrl(w.selectedSourceUrl)?normUrl(w.selectedSourceUrl):"")){
 add("MASTER — EXACT SOURCE", "Other active master records share an exact source page. No approval or merge has been inferred.",
  rows.map(memberFromWork));
}
// Historic distinctions are identity evidence: never re-introduce these known distinct pairs
// solely because an artist and title agree.
const knownDistinctPairs=new Set();
for(const t of triage.groups){
 if(t.identityDisposition==="SAME_PHYSICAL_WORK_MULTIPLE_IMAGE_SOURCES")continue;
 const ids=t.sourceRows.map(r=>"REVIEW::"+r.sourceId).sort();
 for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)
  knownDistinctPairs.add(ids[i]+"|"+ids[j]);
}
for(const rows of by(ops,w=>norm(w.artist)&&norm(w.artworkTitle)?norm(w.artist)+"|"+norm(w.artworkTitle):"")){
 if(rows.length>12)continue; // do not form misleading, giant same-subject sets
 if(rows.every((a,i)=>rows.slice(i+1).every(b=>
  knownDistinctPairs.has([a.workGroupId,b.workGroupId].sort().join("|")))))continue;
 add("MASTER — POSSIBLE", "Similar title and artist. Not confirmed same physical work; a Not duplicates result retains each separately.",
  rows.map(memberFromWork));
}
// Keep the one established Met/Commons same-work relation in view if it remains operational.
for(const t of triage.groups.filter(t=>t.identityDisposition==="SAME_PHYSICAL_WORK_MULTIPLE_IMAGE_SOURCES")){
 const rows=t.sourceRows.map(x=>activeByRecord.get("REVIEW::"+x.sourceId)).filter(Boolean);
 if(rows.length>1)add("PRIOR EVIDENCE — SAME WORK",t.explanation,rows.map(memberFromRecord));
}
groups.sort((a,b)=>{
 const rank={"EXACT SOURCE":0,"LINKED WORK — PHOTOS":1,"POSSIBLE — REVIEW":2,
 "MASTER — EXACT SOURCE":3,"PRIOR EVIDENCE — SAME WORK":4,"MASTER — POSSIBLE":5};
 return (rank[a.confidence]??9)-(rank[b.confidence]??9)||a.title.localeCompare(b.title);
});
const out={schema:"AO_SACRED_ART_DUPLICATE_REVIEW_PAGE_V1",
 snapshot:sha(JSON.stringify(master.counts)+batchPaths.join("|")+JSON.stringify(groups.map(g=>[g.id,g.members.map(m=>m.id)]))),
 reviewedCards:all.length,registryRecords:master.registry.length,operationalArtworkGroups:ops.length,
 previousIdentityTriageGroups:triage.groups.length,groups};
const template=readFileSync("scripts/art/sacred-art-duplicate-review-template-20261030.html","utf8");
if(!template.includes("__DATA__"))throw Error("Review HTML template token missing");
const html=template.replace("__DATA__",JSON.stringify(out).replace(/</g,"\\u003c"));
const page="docs/SACRED_ART_DUPLICATE_REVIEW_20261030.html";
writeFileSync(page,html);
const groupIndex={schema:"AO_SACRED_ART_DUPLICATE_GROUP_INDEX_V1",snapshot:out.snapshot,
  groups:groups.map(g=>({id:g.id,confidence:g.confidence,reason:g.reason,
    members:g.members.map(m=>({id:m.id,title:m.title,artist:m.artist,sourceUrl:m.sourceUrl||"",sourceFingerprint:m.sourceFingerprint||""}))}))};
writeFileSync(BASE+"sacred-art-master-v2/duplicate-review-groups-20261030.v1.json",
 JSON.stringify(groupIndex,null,2)+"\n");
const allMembers=groups.flatMap(g=>g.members);
const summary={schema:out.schema,snapshot:out.snapshot,reviewedCards:444,registryRecords:3205,
 operationalArtworkGroups:989,groups:groups.length,
 byConfidence:Object.fromEntries([...new Set(groups.map(g=>g.confidence))].map(c=>
 [c,groups.filter(g=>g.confidence===c).length])),
 previewMembers:groups.reduce((n,g)=>n+g.members.filter(m=>m.preview).length,0),
 embeddedPreviewMembers:allMembers.filter(m=>m.preview?.startsWith("data:image/")).length,
 remotePreviewMembers:allMembers.filter(m=>m.preview&&!m.preview.startsWith("data:image/")).length,
 groupsFullyEmbedded:groups.filter(g=>g.members.every(m=>m.preview?.startsWith("data:image/"))).length,
 missingPreviewMembers:groups.reduce((n,g)=>n+g.members.filter(m=>!m.preview).length,0),
 sourceGalleryImagesEmbeddedNotReacquired:true,previousApprovalsChanged:0,
 rightsClearancesChanged:0,queue1Promotions:0,productionMutations:0,costEur:0};
writeFileSync(BASE+"sacred-art-master-v2/duplicate-review-page-manifest-20261030.v1.json",JSON.stringify(summary,null,2)+"\n");
if(groups.filter(g=>g.confidence==="EXACT SOURCE").length!==6)
 throw Error("Expected six established exact-source groups in 444");
console.log(JSON.stringify({page,bytes:Buffer.byteLength(html),...summary}));
