import assert from "node:assert/strict";
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {buildLiturgicalYear} from "../../src/calendar/liturgical-year.js";

const works=JSON.parse(readFileSync("data/calendar/sacred-art-candidates.v1.json","utf8"));
const targets=JSON.parse(readFileSync("data/calendar/sacred-art-subject-targets.v2.json","utf8"));
const legacy=JSON.parse(readFileSync("data/calendar/sacred-art-module-targets.v1.json","utf8"));
const outdir="artifacts/sacred-art-coverage";
const counts={};
assert.equal(targets.schema,"AO_SACRED_ART_SUBJECT_TARGETS_V2");
assert.equal(works.tagSchema,"AO_SACRED_ART_SEMANTIC_TAGS_V2");
assert.ok(targets.targets.length>130);
assert.equal(new Set(targets.targets.map(x=>x.id)).size,targets.targets.length,"Duplicate subject targets");
assert.equal(new Set(works.artworks.map(x=>x.id)).size,works.artworks.length,"Duplicate painting records");
const allPeriods=["advent","christmas","epiphany","after-epiphany","septuagesima","lent","passion","easter","ascension","pentecost","after-pentecost"];
const allNovenaIds=new Set(["holy_ghost","christmas","corpus_christi","sacred_heart","immaculate_conception","annunciation","assumption","seven_sorrows","st_joseph","holy_souls","perpetual_help","st_therese","christ_the_king","immaculate_heart","st_michael","st_anthony_nine_tuesdays"]);
const allRosaryIds=new Set(["joy1","joy2","joy3","joy4","joy5","sor1","sor2","sor3","sor4","sor5","glo1","glo2","glo3","glo4","glo5","lum1","lum2","lum3","lum4","lum5"]);
const validHash=/^[a-f0-9]{64}$/;
const isAcquired=a=>validHash.test(a.acquisition?.originalSha256||"")&&!!a.acquisition?.archiveOriginal;
const isCC0=a=>a.source?.rights==="CC0";
const isPDart=a=>a.source?.rights==="PUBLIC_DOMAIN_PD_ART_PDM";
const noArtCertification=a=>a.tags?.artCuratorApproval!==true&&a.tags?.phoneHeroCropApproval!==true&&a.review?.status==="CANDIDATE"&&a.image===null;
for(const a of works.artworks){
 assert.equal(a.medium,"painting",a.id+": no engraving/fresco/photo may enter painting registry");
 assert.ok(a.tags,a.id+" missing semantic tag object");
 for(const r of a.tags.rosaryMysteries||[])assert.ok(allRosaryIds.has(r),a.id+" unknown Rosary mystery "+r);
 for(const r of a.tags.novenaIds||[])assert.ok(allNovenaIds.has(r),a.id+" unknown novena "+r);
 for(const r of a.tags.liturgicalSeasonIds||[])assert.ok(allPeriods.includes(r),a.id+" unknown liturgical period "+r);
 assert.ok(noArtCertification(a),a.id+" accidentally promoted before human review");
 if(isPDart(a))assert.equal(a.review.rights,"PD_ART_JURISDICTION_REVIEW_PENDING");
 assert.ok(isCC0(a)||isPDart(a),a.id+" unsupported rights type");
}
function explicitMatch(t,a){
 const link=new Set(a.tags.prayerKeys||[]);
 if(t.id.startsWith("rosary."))return link.has(t.id);
 if(t.id.startsWith("devotion."))return link.has(t.id.slice(9))
   ||t.contexts.some(v=>v.startsWith("pray.novenas:")&&(a.tags.novenaIds||[]).includes(v.slice("pray.novenas:".length)));
 if(t.id.startsWith("calendar."))return (a.tags.iconography||[]).includes(t.id.slice(9));
 if(t.id.startsWith("station."))return (a.tags.stationNumbers||[]).includes(Number(t.id.split(".")[1]));
 if(t.id.startsWith("scripture."))return (a.tags.scriptureIdentityKeys||[]).includes(t.id.slice(10));
 if(t.id.startsWith("person."))return a.tags.portraitSubjectId===t.id.slice(7);
 return false;
}
const subjectCoverage=targets.targets.map(t=>{
 const matching=works.artworks.filter(a=>explicitMatch(t,a));
 const original=matching.filter(isAcquired);
 return {id:t.id,title:t.title,priority:t.priority,type:t.type,contexts:t.contexts,
  required:t.minimumOriginals,sourceCandidates:matching.length,downloadedOriginals:original.length,
  cc0Originals:original.filter(isCC0).length,pdArtOriginalsHeld:original.filter(isPDart).length,
  missingToMinimum:Math.max(0,t.minimumOriginals-original.length),
  acquisitionStatus:original.length>=t.minimumOriginals?"SUBJECT_ORIGINALS_AVAILABLE":"SOURCE_ORIGINAL_GAP",
  approvalStatus:"NOT_ARTISTICALLY_REVIEWED",
  images:matching.map(a=>a.id)};
});
const rosary=legacy.principalTraditionalRosaryMysteries.map(t=>({
 id:t.key,required:t.minimumMasterpieces,
 candidates:works.artworks.filter(a=>(a.tags?.prayerKeys||[]).includes(t.key)).length,
 originals:works.artworks.filter(a=>isAcquired(a)&&(a.tags?.prayerKeys||[]).includes(t.key)).length
}));
const season=Object.fromEntries(allPeriods.map(p=>[p,works.artworks.filter(a=>isAcquired(a)&&(a.tags?.liturgicalSeasonIds||[]).includes(p)).length]));
const dateSweep={years:[2024,2027],dates:0,seasonalOriginalAvailableDates:0,seasonalOriginalMissingDates:0,seasonFrequency:{}};
for(const y of dateSweep.years)for(let i=0;i<(y===2024?366:365);i++){
 const d=new Date(Date.UTC(y,0,i+1)).toISOString().slice(0,10);
 const key=buildLiturgicalYear(d).currentPeriod.id;
 dateSweep.dates++;dateSweep.seasonFrequency[key]=(dateSweep.seasonFrequency[key]||0)+1;
 if(season[key]>0)dateSweep.seasonalOriginalAvailableDates++;else dateSweep.seasonalOriginalMissingDates++;
}
const summary={
 sourceTargets:targets.targets.length,
 firstPartyModulesAndSubjectsAudited:new Set(targets.targets.flatMap(t=>t.contexts)).size,
 candidatePaintings:works.artworks.length,
 acquiredOriginals:works.artworks.filter(isAcquired).length,
 cc0AcquiredOriginals:works.artworks.filter(a=>isAcquired(a)&&isCC0(a)).length,
 pdArtRightsHeldOriginals:works.artworks.filter(a=>isAcquired(a)&&isPDart(a)).length,
 rosaryMysteriesSourceCovered:rosary.filter(x=>x.candidates>=x.required).length,
 rosaryMysteriesOriginalCovered:rosary.filter(x=>x.originals>=x.required).length,
 subjectsMeetingOriginalMinimum:subjectCoverage.filter(t=>!t.missingToMinimum).length,
 subjectsWithNoExplicitlyMappedArtwork:subjectCoverage.filter(t=>t.sourceCandidates===0).length,
 subjectsWithOriginalAcquisitionGaps:subjectCoverage.filter(t=>t.missingToMinimum>0).length,
 approvedReleaseArtworks:0,
 actualObservedCalendarArtworkCoverage:"NOT_AUDITED_NO_1962_DATE_TO_ORIGINALS_MAPPING"
};
assert.equal(rosary.length,15);
assert.equal(summary.rosaryMysteriesOriginalCovered,15,"Rosary two-acquired-original milestone regressed");
mkdirSync(outdir,{recursive:true});
const report={schema:"AO_SACRED_ART_ALL_MODULE_COVERAGE_AUDIT_V2",date:"2026-10-10",
 warnings:[
 "SourceOriginalsAvailable != museum-grade beauty, crop quality, reliable subject attribution or publication approval.",
 "Season fallback dates use a *pure liturgical-period index*, NOT proof of correct observed 1962 feast or appointed Scripture artwork.",
 "No dated mass/art mapping or full 2024/2027 image match certification is claimed.",
 "A strict explicit tag-based audit deliberately does not infer a subject from the image title or saint's nominal civil date.",
 "Some subject targets permit narrative-related paintings; final labels must distinguish exact event from symbolic support.",
 "Commons PD-Art images are held separately from source-certified CC0 originals."
 ],summary,rosary,seasonFallbackPool:season,seasonalDateSweep:dateSweep,subjects:subjectCoverage};
writeFileSync(outdir+"/all-modules-v2.json",JSON.stringify(report,null,2)+"\n");
const lines=[
 "# Sacred art acquisition gaps — generated audit",
 "",
 "Exact tags only. Every source image requires separate artistic, subject, licence and phone-crop review.",
 "",
 "Scope: "+summary.sourceTargets+" named subjects across Pray, Calendar, Formation and Scripture; "+summary.candidatePaintings+" painting records.",
 "Original images acquired: "+summary.acquiredOriginals+"; of these "+summary.cc0AcquiredOriginals+" CC0 and "+summary.pdArtRightsHeldOriginals+" PD-Art held for rights clearance.",
 "Traditional Rosary: "+summary.rosaryMysteriesOriginalCovered+"/15 mysteries with >=2 acquired originals.",
 "Target subject minimums: "+summary.subjectsMeetingOriginalMinimum+"/"+summary.sourceTargets+" met on explicitly assigned original sources.",
 "Full observed-date calendar mapping: NOT DONE, despite "+dateSweep.seasonalOriginalAvailableDates+"/"+dateSweep.dates+" seasonal fallback logical possibilities.",
 "",
 "## Open P0 / P1 source-original gaps",
 "",
 ...subjectCoverage.filter(x=>x.missingToMinimum&&x.priority!=="P2")
   .map(x=>"- **"+x.id+"**: "+x.downloadedOriginals+"/"+x.required+" originals; "+x.sourceCandidates+" candidates, "+x.missingToMinimum+" needed."),
 "",
 "## P2 gap inventory",
 "",
 ...subjectCoverage.filter(x=>x.missingToMinimum&&x.priority==="P2")
   .map(x=>"- "+x.id+": "+x.downloadedOriginals+"/"+x.required+" originals."),
 "",
 "## Rights gate",
 "",
 "The "+summary.pdArtRightsHeldOriginals+" Commons PD-Art originals remain outside app publication, without silent conversion to CC0.",
 "",
 "CI source of truth: data/calendar/sacred-art-candidates.v1.json and data/calendar/sacred-art-subject-targets.v2.json."
];
writeFileSync(outdir+"/gaps.md",lines.join("\n")+"\n");
console.log(JSON.stringify(summary,null,2));
console.log("P0/P1 under-minimum:",subjectCoverage.filter(x=>x.missingToMinimum&&x.priority!=="P2").length);
