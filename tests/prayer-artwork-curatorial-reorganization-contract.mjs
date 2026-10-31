import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const rd=p=>JSON.parse(readFileSync(p,'utf8'));
const root='data/prayer/artwork-editorial-20261101/';
const master=rd(root+'curatorial-master-267-20261101.v1.json');
const prior=rd('data/prayer/artwork-editorial-20261031/provisional-one-choice-per-267-art-position.v1.json');
test('all original selected artworks retained unchanged and no rotation is inferred',()=>{
 assert.equal(master.assignments.length,267);
 assert.equal(master.count.provisionalPositions,23);
 assert.equal(master.count.priorApprovedOrInheritedLinks,244);
 const map=new Map(master.assignments.map(x=>[x.slot,x]));
 for(const x of prior.placements){assert.deepEqual(map.get(x.slot).currentAssignment,x.assignment,x.slot);assert.equal(map.get(x.slot).productionEnabled,false);}
 assert.equal(master.publicationAllowed,false);
 assert.equal(master.policy.rosaryMysteryImageFixedAcrossDecade,true);
 assert.equal(master.policy.acceptedAlternativesNeverImplyRotation,true);
 assert.equal(master.verbatimUserInstructions.length,28);
 for(const [slot,name] of master.finalProtectedCovers){assert.ok(JSON.stringify(map.get(slot).currentAssignment).includes(name));}
});

test('selected artwork source crosswalk is evidential and not a replacement or photo-rights authorization',()=>{
 const c=rd('data/prayer/artwork-editorial-20261101/selected-work-source-crosswalk-267-20261101.v1.json');
 assert.equal(c.rows.length,267);
 assert.deepEqual(c.counts,{EXACT_URL:190,EXACT_TITLE_ARTIST:38,UNMATCHED_PRESERVE_SELECTED:37,UNIQUE_TITLE_ONLY_UNCONFIRMED:2});
 assert.equal(c.summary.unmatchedStationsOfTheCross,14);
 assert.equal(c.summary.unmatchedCategoryDoors,5);
 assert.equal(c.rows.every(x=>x.selectedAssignmentPreserved&&!x.publicationVerified&&!x.photoRightsAndPixelQAPassed),true);
 assert.equal(master.count.primaryResearchIdentityMatchedConservatively,228);
});
