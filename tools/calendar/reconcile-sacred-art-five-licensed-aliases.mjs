#!/usr/bin/env node
/**
 * Losslessly group five blocked catalogue IDs into three already-known physical
 * National Gallery originals. Research-only alias groups; never merges artwork
 * IDs or overrides frozen approvals. All images remain licence-blocked.
 */
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
const root=new URL("../../",import.meta.url);
const load=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const recover=load("data/research/sacred-art-open-source-recovery-76-20261020.v1.json");
const frozen=load("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
const rootDir=process.argv[2]||"artifacts/qa-discovery-merged";
const summary=JSON.parse(readFileSync(join(rootDir,"batch-34-object-shortlist.json"),"utf8"));
const allowed=new Set([...frozen.approved.map(x=>x.artworkId),...frozen.historicallyFiveIDsPreservedSeparately]);
const banned=new Set(frozen.rejected.map(x=>x.artworkId));
const missing=summary.records.filter(x=>!x.preliminaryFileForHumanObjectMatch);
assert.equal(missing.length,5);
const exactMap=new Map(recover.records.map(x=>[x.artworkId,x]));
const groups=new Map();
for(const r of missing){
 const s=exactMap.get(r.artworkId);
 assert(s&&allowed.has(r.artworkId)&&!banned.has(r.artworkId));
 assert(s.lane==="LICENSE_BLOCKED");
 assert(/^https:\/\/www\.nationalgallery\.org\.uk\/paintings\//.test(s.sourceUrl),"Expected physical National Gallery original");
 const key=new URL(s.sourceUrl).pathname.replace(/\/+$/,"");
 const o=groups.get(key)||{institution:"The National Gallery, London",originalWorkPage:s.sourceUrl,
  artist:s.artist, approvedCatalogueIDs:[],titles:[],hold:"HOLD_NATIONAL_GALLERY_NC_ND_PHOTO",
  physicalPaintingHasMuseumObjectRecord:true,
  museumPhotoRightsNotForCommercialDerivativeReuse:true,
  independentlyReusableReproductionIdentified:false,
  doNotCreateMirrorOrCopy:true,
  sourcePhotoPublished:false};
 assert(o.artist===s.artist,"Different artists merged as one object");
 o.approvedCatalogueIDs.push(s.artworkId);
 o.titles.push(s.title);
 groups.set(key,o);
}
const originalGroups=[...groups.values()].map(x=>({
 ...x,approvedCatalogueIDs:x.approvedCatalogueIDs.sort(),
 primarySourceOwnerID:null,
 canonicalMergeRequested:false,
 artworkRatingReopened:false,
 futureSourceTask:"Find a photographic reproduction of this exact National Gallery physical original with independently verified commercial/derivative reuse rights, or retain no photo."
}));
assert.equal(originalGroups.length,3,"Five blocked IDs must resolve to three original paintings");
assert.deepEqual(originalGroups.map(x=>x.approvedCatalogueIDs.length).sort(),[1,2,2]);
const result={schema:"AO_SACRED_ART_FIVE_CATALOGUE_IDS_THREE_NG_ORIGINALS_V1",asOf:"2026-10-20",
 counts:{blockedCatalogueEntries:5,physicalOriginals:3,duplicateAliasGroups:2,
  independentlyReusablePhotos:0,publishedPhotos:0},
 policy:{noArtworkIDMerge:true,noArtworkReRating:true,noNationalGalleryNCNDReuse:true,
  noPradoSourceOrMirror:true,noPaidLicenseRequests:true,
  noAutomaticSourceReplacement:true,appMediaUnchanged:true},
 originalGroups};
mkdirSync(rootDir,{recursive:true});
writeFileSync(join(rootDir,"batch-5-licensed-originals-3-groups.json"),JSON.stringify(result,null,2)+"\n");
const csv=s=>'"'+String(s??"").replace(/"/g,'""')+'"';
writeFileSync(join(rootDir,"batch-5-licensed-originals-3-groups.csv"),
 "originalSource,artist,approvedCatalogueIDs,numberOfAliases,sourcePhotoStatus\n"+
 originalGroups.map(x=>[x.originalWorkPage,x.artist,x.approvedCatalogueIDs.join(";"),
 x.approvedCatalogueIDs.length,x.hold].map(csv).join(",")).join("\n")+"\n");
console.log(JSON.stringify({counts:result.counts,groups:originalGroups.map(x=>({
 artist:x.artist,canonicalOriginal:x.originalWorkPage,ids:x.approvedCatalogueIDs}))}));
