import {readFileSync, mkdirSync, writeFileSync} from "node:fs";

const data=JSON.parse(readFileSync("data/calendar/sacred-art-candidates.v1.json","utf8"));
const targets=JSON.parse(readFileSync("data/calendar/sacred-art-module-targets.v1.json","utf8"));
const poolOf=key=>data.artworks.filter(a=>(a.association?.prayerKeys||[]).includes(key));
const isActualOriginal=a=>a.review?.image==="ACQUIRED_REVIEW_ARCHIVE_ONLY" && !!a.acquisition?.archiveOriginal && /^[a-f0-9]{64}$/.test(a.acquisition?.originalSha256||"");
const result={
  schema:"AO_SACRED_ART_COVERAGE_AUDIT_V1",date:"2026-10-10",
  sourceCandidateCount:data.artworks.length,
  note:"Source coverage is NOT publication readiness. Originals in separate CI archives; 0 curator-approved production paintings.",
  rosary:targets.principalTraditionalRosaryMysteries.map(t=>{
    const pool=poolOf(t.key);const downloaded=pool.filter(isActualOriginal);
    return {key:t.key,title:t.title,target:t.minimumMasterpieces,
      catalogued:pool.length,acquiredOriginals:downloaded.length,
      blocked:pool.filter(a=>String(a.review?.image||"").startsWith("DOWNLOAD_BLOCKED")).map(a=>a.id),
      sourceGap:Math.max(0,t.minimumMasterpieces-pool.length),
      originalGap:Math.max(0,t.minimumMasterpieces-downloaded.length)};
  }),
  recurring:targets.recurringPrayerTargets.map(t=>{
    const pool=poolOf(t.key);const downloaded=pool.filter(isActualOriginal);
    return {key:t.key,target:t.minimumMasterpieces,
      catalogued:pool.length,acquiredOriginals:downloaded.length,
      sourceGap:Math.max(0,t.minimumMasterpieces-pool.length),
      originalGap:Math.max(0,t.minimumMasterpieces-downloaded.length)};
  })
};
result.summary={
 traditionalMysteries:result.rosary.length,
 sourceCoveredMysteries:result.rosary.filter(r=>r.sourceGap===0).length,
 twoOriginalMysteries:result.rosary.filter(r=>r.originalGap===0).length,
 manuscriptOrPhotoExceptionsApproved:0,
 productionArtworksApproved:0,
 stillNeedActualOriginals:result.rosary.filter(r=>r.originalGap>0).map(r=>r.key)
};
mkdirSync("artifacts/sacred-art-coverage",{recursive:true});
writeFileSync("artifacts/sacred-art-coverage/coverage.json",JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result.summary,null,2));
console.log("Missing acquisition coverage:\n"+result.rosary.filter(x=>x.originalGap).map(x=>x.key+" "+x.acquiredOriginals+"/"+x.target+" original(s)").join("\n"));
if(result.summary.sourceCoveredMysteries!==15)process.exitCode=1;
