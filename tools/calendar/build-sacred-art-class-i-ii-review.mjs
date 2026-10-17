#!/usr/bin/env node
// Review inventory for all observed 1962 General Calendar Class I/II dates.
// Reuses existing verified 365-date resolver and open-access artwork source records.
// Does not imply any individual artwork is user-selected or app-release approved.
import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const out='artifacts/sacred-art-coverage';
const year=read('artifacts/calendar-oracle/1962-2026-full-year-audit.json');
const linked=read(out+'/full-year-multiple-associations.v1.json');
const artworkById=new Map(read('data/calendar/sacred-art-candidates.v1.json').artworks.map(x=>[x.id,x]));
const openRights=new Set(['CC0','PUBLIC_DOMAIN_PD_ART_PDM']);
const exactCrosswalk=read('data/calendar/sacred-art-1962-exact-feast-source-links.v1.json');
const exactResearchDates=new Set(exactCrosswalk.links.map(x=>x.observedDate2026));
assert.equal(exactResearchDates.size,21,'2026 exact-source research inventory changed');
const galleryText=readFileSync('docs/research/review-galleries/ao-sacred-art-unified-curator-20261016.html','utf8');
const marker='<script type="application/json" id="model-data">';
const a=galleryText.indexOf(marker),b=galleryText.indexOf('</script>',a);
assert.ok(a>=0&&b>a,'Embedded gallery unavailable');
const gallery=JSON.parse(galleryText.slice(a+marker.length,b));
assert.equal(year.rows.length,365);
assert.equal(year.summary.unresolved,0);
assert.equal(linked.days.length,365);
const byDate=new Map(linked.days.map(x=>[x.date,x]));
const norm=url=>String(url||'').replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\?.*$/,'').replace(/\/$/,'').toLowerCase();
const previewByMuseum=new Map();
for(const c of gallery.categories)for(const w of c.works){
  const image=w.photos.find(p=>p.preview&&!p.identityHold&&!p.deliveryHold);
  if(w.source&&image&&!previewByMuseum.has(norm(w.source)))previewByMuseum.set(norm(w.source),image.preview);
}
const tiers=['STRICT_DAY_SOURCE_LINK','VERIFIED_CONTEXTUAL_LEDGER','OBSERVED_ID_TAG_UNREVIEWED','TITULAR_PERSON_OR_EVENT_CANDIDATE','APPOINTED_GOSPEL_SCENE_CANDIDATE','MARIAN_SATURDAY_CONTEXT','LITURGICAL_SEASON_CONTEXT','GENERIC_BACKGROUND'];
const rows=year.rows.filter(r=>r.rawRank==='I class'||r.rawRank==='II class').map(r=>{
 const existing=byDate.get(r.date);
 assert.ok(existing&&existing.observedPrincipalId===r.mainId,'DayResolver identity mismatch '+r.date);
 const sunday=new Date(r.date+'T12:00:00Z').getUTCDay()===0;
 const gospel=r.scriptureContexts.find(x=>x.slot==='GOSPEL')||null;
 const scenes=sunday?existing.sundayGospelScenes||[]:[];
 const feastOnSunday=sunday&&r.mainId.startsWith('sancti:');
 const sourceOptions=existing.alternatives.filter(x=>openRights.has(x.rights)).map(x=>{
   const w=artworkById.get(x.artworkId);
   const tags=[...(w?.tags?.iconography||[]),...(w?.association?.subjectKeys||[])];
   return {...x,gospelDepictsReading:scenes.some(k=>tags.includes(k))};
 }).sort((x,y)=>sunday&&!feastOnSunday&&x.gospelDepictsReading!==y.gospelDepictsReading?(x.gospelDepictsReading?-1:1):0);
 const options=sourceOptions.slice(0,12).map(x=>{
  const found=previewByMuseum.get(norm(x.sourceUrl))||'';
  let preview=found.startsWith('https://commons.wikimedia.org/wiki/Special:FilePath/')?
   found.replace(/([?&]width=)\d+(?=&|$)/,'$1'+'500'):found;
  // Reuse a real Commons file-page filename; never invent a remote image ID.
  if(!preview&&x.rights==='PUBLIC_DOMAIN_PD_ART_PDM'){
    const m=x.sourceUrl.match(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:(.+)$/i);
    if(m){
      const filename=decodeURIComponent(m[1].split('?')[0]).replaceAll('_',' ');
      preview='https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(filename)+'?width=500';
    }
  }
  return {artworkId:x.artworkId,title:x.title,artist:x.artist,sourceUrl:x.sourceUrl,
    rights:x.rights,tier:x.tier,evidence:x.evidence,preview,gospelDepictsReading:x.gospelDepictsReading,
    metId:(x.sourceUrl.match(/metmuseum\.org\/art\/collection\/search\/(\d+)/)||[])[1]||null};
 });
 const specific=options.some(x=>tiers.indexOf(x.tier)<=4);
 const gospelArtworkCount=sourceOptions.filter(x=>x.gospelDepictsReading).length;
 const sundayGospel=sunday?{
  reference:gospel?.reference||null,passage:gospel?.passage||null,
  sceneKeys:scenes,gospelArtworkCount,
  source:'ACTUAL_1962_MASS_PROPER',
  policy:feastOnSunday?'PRINCIPAL_FEAST_FIRST_AND_GOSPEL_CONTEXT':'APPOINTED_GOSPEL_SCENE_FIRST',
  evidence:gospelArtworkCount?'OPEN_ARTWORK_DEPICTS_GOSPEL_SCENE':!gospel?.reference?'SPECIAL_RITE_OR_SOURCE_UNAVAILABLE':scenes.length?'SCENE_IDENTIFIED_ARTWORK_MISSING':'DISCOURSE_OR_SCENE_UNINDEXED'
 }:null;
 const exact=options.some(x=>x.tier==='STRICT_DAY_SOURCE_LINK');
 return {date:r.date,class:r.rawRank==='I class'?'I':'II',observedPrincipalId:r.mainId,
   title:r.title,gospel:gospel?.reference||null,sundayGospel,
   options,artworkCoverage:exact?'EXACT_SOURCE_RESEARCH':specific?'SUBJECT_CANDIDATE':'THEMATIC_ONLY',
   specificArtStillNeeded:!specific,reviewStatus:'USER_SELECTION_PENDING',
   productionApproved:false};
});
assert.equal(rows.length,129,'All 53 Class I and 76 Class II principal dates required');
assert.equal(rows.filter(x=>x.class==='I').length,53);
assert.equal(rows.filter(x=>x.class==='II').length,76);
assert.equal(new Set(rows.map(x=>x.date)).size,129);

// Cleveland's CC0 API has no browser CORS header; obtain actual small web JPEGs
// at build time. Never invent a CDN filename from the accession number.
const cmaAccessions=[...new Set(rows.flatMap(r=>r.options.slice(0,3).map(o=>{
 const m=o.sourceUrl.match(/^https:\/\/(?:www\.)?clevelandart\.org\/art\/([\w.]+)$/i);
 return m?.[1]||null;
}).filter(Boolean)))];
const cmaImages=new Map();
for(let i=0;i<cmaAccessions.length;i+=5){
 await Promise.all(cmaAccessions.slice(i,i+5).map(async id=>{
  try{
   const response=await fetch('https://openaccess-api.clevelandart.org/api/artworks/'+id,
    {signal:AbortSignal.timeout(8500)});
   if(!response.ok)return;
   const payload=await response.json(),record=payload.data||payload;
   if(record.share_license_status==='CC0'&&/^https:\/\//.test(record.images?.web?.url||''))
    cmaImages.set(id,record.images.web.url);
  }catch(error){/* Retain official object link instead of inventing a photograph. */}
 }));
}
for(const row of rows)for(const option of row.options){
 const m=option.sourceUrl.match(/^https:\/\/(?:www\.)?clevelandart\.org\/art\/([\w.]+)$/i);
 if(m&&cmaImages.has(m[1]))option.preview=cmaImages.get(m[1]);
}

assert.ok(rows.filter(x=>x.class==='I'&&x.artworkCoverage==='EXACT_SOURCE_RESEARCH').length<=exactResearchDates.size,
 'CC0 linked exact-source options cannot outnumber the historic research source dates');
const sundays=rows.filter(x=>x.sundayGospel);
assert.equal(sundays.length,52,'Expected 52 calendar Sundays');
const sundayGospelCounts={
 sundayDates:sundays.length,withReference:sundays.filter(r=>r.sundayGospel.reference).length,
 withOpenGospelScenePainting:sundays.filter(r=>r.sundayGospel.gospelArtworkCount>0).length,
 sceneNeedsArtwork:sundays.filter(r=>r.sundayGospel.evidence==='SCENE_IDENTIFIED_ARTWORK_MISSING').length,
 discourseOrUnindexed:sundays.filter(r=>r.sundayGospel.evidence==='DISCOURSE_OR_SCENE_UNINDEXED').length,
 specialSourceMissing:sundays.filter(r=>r.sundayGospel.evidence==='SPECIAL_RITE_OR_SOURCE_UNAVAILABLE').length
};
const counts=Object.fromEntries(['I','II'].map(k=>{
 const d=rows.filter(r=>r.class===k);
 return [k,{observed:d.length,openSourceOptions:d.filter(r=>r.options.length>0).length,
   exactSource:d.filter(r=>r.artworkCoverage==='EXACT_SOURCE_RESEARCH').length,
   additionalSubject:d.filter(r=>r.artworkCoverage==='SUBJECT_CANDIDATE').length,
   thematicOnly:d.filter(r=>r.artworkCoverage==='THEMATIC_ONLY'&&r.options.length>0).length,
   noOption:d.filter(r=>!r.options.length).length}];
}));
const report={schema:'AO_SACRED_ART_2026_CLASS_I_II_REVIEW_V1',year:2026,
 cmaWebPreviewResolved:cmaImages.size,cmaWebPreviewRequested:cmaAccessions.length,
 exactResearchDatesInEarlierCrosswalk:exactResearchDates.size,
 sundayGospelCounts,
 status:'DATE_INVENTORY_COMPLETE_ARTWORK_EDITION_UNFINISHED',
 source:'2026 full-year 1962 production DayResolver / CC0 acquired-original artwork registry',
 scope:'All observed general-calendar Class I/II principal days in 2026; not every displaced nominal or local feast',
 caveats:['PD-Art/PDM photographic reuse may need jurisdiction-specific confirmation; review-source image is not publication clearance.',
 'One image per date is a selection target, not proof of exact iconography.',
 'Generic and seasonal candidates never count as exact feast coverage.',
 'Candidates must be reviewed by the user and then licensed/cropped/packaged before app release.',
 'Feasts suppressed or transferred by precedence and particular local calendars require a separate source-level audit.',
 'Never transfer a score from another painting, even of the same subject.'],
 counts,rows};
mkdirSync(out,{recursive:true});
writeFileSync(out+'/class-i-ii-2026-review.json',JSON.stringify(report,null,2)+'\n');
const lines=['# 1962 Class I and II — every observed date in 2026','','Review inventory, not production release. The 129 dates include Sundays, vigils and octaves.',
 '| Class | Dates | Open candidates | Exact links | Other subject | Thematic | No option |',
 '|---|---:|---:|---:|---:|---:|---:|'];
for(const k of ['I','II']){
 const x=counts[k];
 lines.push('| '+k+' | '+[x.observed,x.openSourceOptions,x.exactSource,x.additionalSubject,x.thematicOnly,x.noOption].join(' | ')+' |');
}
lines.push('','## Dates without specific feast / appointed Gospel subject evidence','','These still need targeted open-source art or explicit thematic acceptance.');
for(const r of rows.filter(x=>x.specificArtStillNeeded))
 lines.push('- '+r.date+' · Class '+r.class+' · '+r.title+' · '+r.observedPrincipalId);
writeFileSync(out+'/class-i-ii-2026-review.md',lines.join('\n')+'\n');

const sundayReport={
 schema:'AO_SACRED_ART_SUNDAY_GOSPEL_1962_2026_V1',year:2026,
 source:'Production 1962 DayResolver Gospel + shared canonical iconographic-scene registry',
 status:'GOSPEL_RESEARCH_ASSOCIATIONS_NOT_USER_ART_APPROVAL',
 counts:sundayGospelCounts,
 policy:'For temporal Sundays the Gospel episode is the primary art-selection anchor. Feasts observed on Sundays retain their principal feast subject first. Generic/seasonal pictures never count as Gospel-scene evidence.',
 sundays:sundays.map(r=>({
  date:r.date,class:r.class,principalId:r.observedPrincipalId,title:r.title,
  gospel:r.sundayGospel,
  gospelPaintingCandidates:r.options.filter(x=>x.gospelDepictsReading),
  otherFeastOrContextOptions:r.options.filter(x=>!x.gospelDepictsReading).slice(0,3)
 }))
};
writeFileSync(out+'/sunday-gospel-2026-review.json',JSON.stringify(sundayReport,null,2)+'\n');
const sundayMd=[
 '# Sunday appointed Gospel → sacred artwork (1962; 2026)','',
 'The appointed Gospel and actual observed principal come from the production 1962 DayResolver. Scene identifiers describe iconography, not a confirmed painting.',
 '', '| Date | Class | Observed Mass | Appointed Gospel | Possible scenes | Open gospel-painting candidates |',
 '|---|---|---|---|---|---:|',
 ...sundays.map(r=>'| '+r.date+' | '+r.class+' | '+r.title.replace(/\|/g,'/')+
  ' | '+(r.sundayGospel.reference||'Special rite / source missing')+
  ' | '+(r.sundayGospel.sceneKeys.join(', ')||'Discourse or not yet indexed')+
  ' | '+r.sundayGospel.gospelArtworkCount+' |'),
 '', 'No specific image does not mean the Gospel has no art; search Commons/CC0 first, group recurring pericopes, then label symbolic scene substitutions explicitly.'
];
writeFileSync(out+'/sunday-gospel-2026-backlog.md',sundayMd.join('\n')+'\n');

// Compact mobile review. No external libraries; sourced images lazy-load via
// existing Commons mirror or the Met open-access collection API.
const shell=[
 '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
 '<title>Ad Orientem · Class I–II feast art review</title>',
 '<style>:root{color-scheme:dark;background:#080c12;color:#d9dce3;font-family:Georgia,serif}body{max-width:1200px;margin:auto;padding:15px}',
 'h1{font-variant:small-caps;font-size:clamp(24px,5vw,36px)}p,small{color:#aeb4be;line-height:1.4}',
 '.toolbar{position:sticky;top:0;background:#080c12f2;display:flex;gap:7px;flex-wrap:wrap;padding:12px 0;border-bottom:1px solid #445063;z-index:3}',
 'input,select,button{border:1px solid #607087;background:#152030;color:#eee;border-radius:6px;padding:7px;font:14px system-ui}button{cursor:pointer}',
 '#results{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:14px;margin-top:15px}',
 '.day{border:1px solid #3a4557;padding:13px;border-radius:9px;background:#101823;min-width:0}.day h2{font-size:18px;margin:7px 0}',
 '.pill{font:11px system-ui;color:#b9c9da;border:1px solid #516a88;border-radius:8px;padding:3px 6px}',
 '.option{border-top:1px solid #344254;padding:9px 0}.pic{height:205px;background:#1c2630;display:flex;align-items:center;justify-content:center;overflow:hidden}',
 '.pic img{width:100%;height:100%;object-fit:contain}.pic span{font:12px system-ui;color:#c5ccd7;padding:14px;text-align:center}',
 '.name{font:600 13px system-ui;margin:6px 0}.details{font:11px system-ui;color:#abb7c7;line-height:1.4}',
 'a{color:#b2cef2;font:12px system-ui}.ratings{display:flex;gap:4px;align-items:center;margin-top:6px;flex-wrap:wrap}',
 '.ratings button{padding:5px 8px}.ratings button[aria-pressed=true]{background:#394b68;border-color:#d2dded}',
 '</style></head><body><h1>Ad Orientem · Feast Artwork</h1>',
 '<p>2026 — all 53 Class I and 76 Class II observed dates. The 1962 Mass Calendar decides observance; this is an independent review. Choose usable open-access art; thematic images remain labelled. Old artwork scores are never overwritten.</p>',
 '<div id="summary"></div><div class="toolbar">',
 '<select id="rank"><option value="all">Classes I + II</option><option value="I">Class I</option><option value="II">Class II</option></select>',
 '<select id="type"><option value="all">All coverage</option><option value="EXACT_SOURCE_RESEARCH">Exact source</option><option value="SUBJECT_CANDIDATE">Specific subject</option><option value="THEMATIC_ONLY">Thematic only</option></select>',
 '<input id="search" placeholder="Search date or feast">',
 '<button id="export">Export choices JSON</button><button id="importBtn">Import choices</button><input type="file" id="import" accept=".json" hidden>',
 '</div><p id="count"></p><main id="results"></main>',
 '<script type="application/json" id="dataset">'+JSON.stringify(report).replace(/</g,'\\u003c')+'</script>',
 '<script>',
 'const DATA=JSON.parse(document.getElementById("dataset").textContent);let decisions={};',
 'const $=id=>document.getElementById(id);',
 'const e=s=>String(s||"").replace(/[&<>"\\u0027]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",',
 ' "\\"":"&quot;","\\u0027":"&#39;"}[c]));',
 'function render(){const f=$("rank").value,t=$("type").value,q=$("search").value.toLowerCase();',
 'const days=DATA.rows.filter(d=>(f==="all"||d.class===f)&&(t==="all"||d.artworkCoverage===t)&&',
 '(d.date+" "+d.title+" "+d.observedPrincipalId).toLowerCase().includes(q));',
 '$("count").textContent=days.length+" dates shown · "+days.filter(d=>!decisions[d.date]).length+" awaiting choice";',
 '$("results").innerHTML=days.map(d=>"<article class=day><small>"+e(d.date)+" · Class "+e(d.class)+"</small> <span class=pill>"+e(d.artworkCoverage)+"</span><h2>"+e(d.title)+"</h2><small>"+e(d.gospel||"")+"</small>"+',
 '(d.sundayGospel?"<div class=details><strong>Appointed Gospel:</strong> "+e(d.sundayGospel.reference||"special rite")+" · Biblical scene: "+e(d.sundayGospel.sceneKeys.join(", ")||"no literal episode indexed")+" · "+e(d.sundayGospel.policy.replaceAll("_"," "))+"</div>":"")+' ,
 '(d.options.length?d.options.slice(0,3).map(o=>"<section class=option><div class=pic>"+',
 '(o.preview?"<img loading=lazy referrerpolicy=no-referrer src=\\\""+e(o.preview)+"\\\" alt=\\\""+e(o.title)+"\\\">":',
 'o.metId?"<img loading=lazy data-met=\\\""+e(o.metId)+"\\\" alt=\\\""+e(o.title)+"\\\">":"<span>Open source for image</span>")+',
 '"</div><p class=name>"+e(o.title)+"</p><div class=details>"+e(o.artist)+" · "+e(o.tier)+" · "+e(o.rights)+(o.gospelDepictsReading?" · Gospel-scene painting":" · Not a verified Gospel painting")+"</div>"+',
 '"<a href=\\\""+e(o.sourceUrl)+"\\\" target=_blank rel=noopener>Official artwork page ↗</a><div class=ratings>Suitability "+',
 '[0,1,2,3,4,5].map(n=>"<button data-day=\\\""+e(d.date)+"\\\" data-art=\\\""+e(o.artworkId)+"\\\" data-rating="+n+',
 '" aria-pressed="+(decisions[d.date]?.artworkId===o.artworkId&&decisions[d.date]?.rating===n)+">"+n+"</button>").join("")+"</div></section>").join(""):',
 '"<p>No CC0 research image identified yet. A genuine subject gap.</p>")+"</article>").join("");',
 'const observe=new IntersectionObserver(entries=>entries.forEach(async x=>{if(!x.isIntersecting)return;observe.unobserve(x.target);',
 'const im=x.target;try{const response=await fetch("https://collectionapi.metmuseum.org/public/collection/v1/objects/"+im.dataset.met);',
 'const j=await response.json();if(!j.primaryImageSmall)throw Error("No image");im.src=j.primaryImageSmall;}',
 'catch(err){im.replaceWith(Object.assign(document.createElement("span"),{textContent:"See museum page for image"}));}}),{rootMargin:"200px"});',
 'document.querySelectorAll("img[data-met]").forEach(im=>observe.observe(im));}',
 'document.addEventListener("click",ev=>{const b=ev.target.closest("button[data-rating]");if(!b)return;',
 'decisions[b.dataset.day]={artworkId:b.dataset.art,rating:Number(b.dataset.rating),status:"REVIEW_ONLY"};render();});',
 'for(const id of ["rank","type","search"])$(id).addEventListener(id==="search"?"input":"change",render);',
 '$("summary").textContent="53 Class I + 76 Class II = 129 dates · source open access ≠ automatic app approval";',
 '$("export").onclick=()=>{const blob=new Blob([JSON.stringify({schema:"AO_1962_FEAST_ART_CHOICES_V1",year:2026,choices:decisions},null,2)],{type:"application/json"});',
 'const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="ad-orientem-129-feast-art-choices.json";a.click();URL.revokeObjectURL(url);};',
 '$("importBtn").onclick=()=>$("import").click();$("import").onchange=async ev=>{try{',
 'const data=JSON.parse(await ev.target.files[0].text());if(data.schema!=="AO_1962_FEAST_ART_CHOICES_V1"||data.year!==2026)throw Error("Wrong file");',
 'decisions=data.choices||{};render();}catch(e){alert(String(e));}};render();',
 '</script></body></html>'
].join('\n');
writeFileSync(out+'/class-i-ii-2026-review.html',shell);
console.log('SACRED_ART_CLASS_I_II_REVIEW='+JSON.stringify(counts));
