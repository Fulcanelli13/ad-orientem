#!/usr/bin/env node
/** Recover candidate source links for 13 source-less artworks from already-published app artwork metadata. Never silently assign or publish. */
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {RELEASED_MODULE_PAINTINGS} from '../src/art/released-module-paintings.v1.js';
const queue=JSON.parse(readFileSync('data/pray/artwork-r5c-bulk-acquisition-73-source-groups-20261103.v1.json','utf8'));
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[“”"'‘’]/g,'').replace(/[^a-zA-Z0-9]+/g,' ').toLowerCase().trim();
const pending=queue.groups.filter(g=>!g.sourcePage);
if(pending.length!==13)throw Error('Expected 13 source-less groups, found '+pending.length);
const issued=Object.entries(RELEASED_MODULE_PAINTINGS).map(([id,a])=>({releaseId:id,title:a.title,artist:a.artist,sourcePage:a.source,photo:a.image,releasePr:a.releasePr}));
const records=pending.map(g=>{
 const matches=issued.filter(x=>normalize(x.title)===normalize(g.title)&&normalize(x.artist)===normalize(g.artist));
 const titleOnly=issued.filter(x=>normalize(x.title)===normalize(g.title)&&!matches.includes(x));
 return {artist:g.artist,title:g.title,slots:g.slots.filter(s=>!g.rosaryDeferred.includes(s)),rosaryDeferred:g.rosaryDeferred,
  sourceRecoveryStatus:matches.length===1?'EXACT_METADATA_CANDIDATE_REQUIRES_OBJECT_VERIFICATION':matches.length>1?'AMBIGUOUS_METADATA_MATCH':'SOURCE_RESEARCH_NEEDED',
  exactMetadataCandidates:matches,
  titleOnlyWarnings:titleOnly.map(x=>({title:x.title,artist:x.artist,sourcePage:x.sourcePage,releaseId:x.releaseId})),
  sourcePageAssigned:null,publicationAuthorized:false};
});
const report={schema:'AO_PRAYER_R5D_SOURCELESS_RECOVERY_AUDIT_V1',total:records.length,
  exactMetadataCandidates:records.filter(x=>x.exactMetadataCandidates.length).length,
  stillNeedsObjectResearch:records.filter(x=>!x.exactMetadataCandidates.length).length,
  publicationAuthorized:false,records};
mkdirSync('r5d-source-recovery',{recursive:true});
writeFileSync('r5d-source-recovery/report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({total:report.total,exactMetadataCandidates:report.exactMetadataCandidates,stillNeedsObjectResearch:report.stillNeedsObjectResearch,candidates:records.filter(x=>x.exactMetadataCandidates.length).map(x=>({title:x.title,matched:x.exactMetadataCandidates}))},null,2));
