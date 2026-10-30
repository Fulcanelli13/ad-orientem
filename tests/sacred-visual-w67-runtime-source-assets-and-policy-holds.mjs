import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';

const path = 'data/research/sacred-visual-w67-main-runtime-existing-image-asset-and-legacy-exclusion-audit-20261015.v1.json';
const a = JSON.parse(readFileSync(path, 'utf8'));
assert.equal(a.schema, 'AO_SACRED_VISUAL_W67_MAIN_BRANCH_RUNTIME_ASSET_SOURCE_TRACE_V1');
const expected = {
  stationImageFilePaths: 14,
  stationFilesFound: 14,
  geographyRegisteredApprovedMediaPaths: 24,
  geographyAssetFilesFound: 24,
  geographyUniquePlaceIDs: 19,
  geographyMainPhotoRefs: 18,
  geographyGalleryPhotoRefs: 6,
  historicBaseProperRows: 50,
  historicBaseProperArtworks: 49,
  historicBaseGreenProperRows: 47,
  historicBaseExcludedArtistGreenProperRows: 4,
  currentlyBrowserRenderedImagesVerified: 0,
  imagesNewlyAuthorisedToPublish: 0
};
for (const [k,v] of Object.entries(expected)) assert.equal(a.counts[k],v,k);
const files = [...a.stationFiles, ...a.approvedGeographyMediaReferences];
assert.equal(files.length,38);
assert.equal(new Set(files.map(x=>x.repoPath)).size,38);
for (const f of files) {
  assert.equal(f.existsInMain,true,f.repoPath);
  assert.equal(f.imageRenderChecked,false,f.repoPath);
  assert.ok(f.repoPath.startsWith('assets/'),f.repoPath);
  assert.ok(existsSync(f.repoPath),f.repoPath);
  assert.ok(statSync(f.repoPath).size > 1000,f.repoPath);
  assert.match(f.gitBlobSha||'',/^[0-9a-f]{40}$/,f.repoPath);
}
assert.deepEqual(a.historicBaseExcludedArtistGreenRows.map(x=>x.legacyArtworkId).sort(),
 ['AO001','AO015','AO084','AO105'].sort());
for (const r of a.historicBaseExcludedArtistGreenRows) {
  assert.equal(r.currentCuratorialExclusion,true);
  assert.equal(r.doNotAutoPublish,true);
  assert.equal(r.frontendActiveState,'UNVERIFIED_AFTER_SEQUENTIAL_WRAPPER_OVERRIDES');
  assert.ok(!a.historicAestheticGateExplicitBlockedIds.includes(r.legacyArtworkId));
}
assert.equal(new Set(a.approvedGeographyMediaReferences.map(x=>x.placeId)).size,19);
assert.ok(a.policy.includes('NO_REQUESTING_PERMISSIONS'));
assert.ok(a.policy.includes('NO_PAID_LICENSES'));
assert.ok(a.policy.includes('NO_ARTWORK_PROMOTION_WITHOUT_CURRENT_APPROVAL'));
console.log('W67: all 38 local source files present; 4 historic artist-exclusion holds classified without claiming live display.');
