import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const json=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const research=json('data/learn/research/mystery-mass-two-chronologies-evidence-crosswalk-20261014.v1.json');
const owner=json('data/learn/research/mystery-mass-canonical-39-owner-inventory-20261014.v1.json');
const old=json('data/learn/research/mystery-mass-september422-to-canonical39-bridge-20261014.v1.json');
const meditation=json('data/learn/research/mystery-mass-32-legacy-meditation-group-crosswalk-20261014.v1.json');
const findings=json('data/learn/research/mystery-mass-four-authors-original-source-findings-20261014.v1.json');
const texts=json('data/learn/research/mystery-mass-complete-source-recovery-20261014.v1.json');
assert.equal(research.biblicalChronology.length,24);
assert.equal(research.liturgicalChronology.length,39);
assert.equal(research.dujardinSecondaryMethod.length,22);
assert.equal(research.recoveredGuérangerFirst30.length,30);
assert.equal(research.counts.guérangerSourceDrafts,71);
assert.equal(research.counts.studyManuscriptResearchTopics,48);
const manuscripts=list => list.flatMap(x=>Object.values(x.studyManuscriptIds).filter(Array.isArray).flat());
const guids=research.liturgicalChronology.flatMap(x=>x.guérangerOriginalFrenchSourceIds.map(y=>y.id));
assert.equal(guids.length,71);
assert.equal(new Set(guids).size,71);
for(let i=1;i<=71;i++) assert.ok(guids.includes('FRG'+String(i).padStart(2,'0')));
const manuscriptIds=manuscripts(research.liturgicalChronology);
assert.equal(manuscriptIds.length,48);
assert.equal(new Set(manuscriptIds).size,48);
assert.equal(research.liturgicalChronology.filter(x=>x.studyManuscriptIds.polishedBilingual.length+x.studyManuscriptIds.additionalBilingual.length>0).length,39);
assert.ok(research.liturgicalChronology.every(x=>Array.isArray(x.lanslotsOriginalSourceCandidateIds)));

assert.equal(meditation.rows.length,32);
assert.equal(meditation.rows.filter(x=>x.sourceCode==='SVF').length,26);
assert.equal(meditation.rows.filter(x=>x.sourceCode==='SFS').length,6);
assert.equal(meditation.sources.vincentFerrer.numberedSourceUnits,30);
assert.equal(findings.records.length,12);
const bIds=new Set(research.biblicalChronology.map(x=>x.id));
const ownerIds=new Set(owner.sections.map(x=>x.sectionId));
const list=research.liturgicalChronology;
assert.equal(bIds.size,24);assert.equal(ownerIds.size,39);
assert.deepEqual(list.map(x=>x.ownerId),owner.sections.map(x=>x.sectionId),'Liturgical narration must keep true canonical Mass sequence');
assert.equal(new Set(list.map(x=>x.ownerId)).size,39);
const mb=new Set(list.flatMap(x=>x.existingMassBibleIds));
assert.equal(mb.size,26);
const passageRows=list.flatMap(x=>x.existingMassBiblePassages);
assert.equal(passageRows.length,26);
assert.equal(new Set(passageRows.map(x=>x.researchId)).size,26);
for(const x of passageRows){
 assert.ok(x.scriptureReference && x.relationship);
 assert.ok(x.sourceChapterLinks.length && x.sourceChapterLinks.every(l=>l.url.startsWith('https://')));
 assert.equal(x.approval,'SOURCE_LINK_RESEARCH_ONLY_NOT_PRINTED_1962_CERTIFIED');
}
assert.equal(passageRows.filter(x=>x.properDependent).length,3);

assert.deepEqual([...mb].sort(),Array.from({length:26},(_,i)=>'MB'+String(i+1).padStart(2,'0')).sort());
const sourceIds=new Set(findings.records.map(x=>x.id));
for(const x of research.biblicalChronology){
 assert.ok(x.scriptureReferences.length,x.id);
 assert.ok(x.governingInquiry.length>=60,'No placeholder generic narrative');
 assert.equal(x.scriptureReaderPolicy.startsWith('Use existing Bible reader'),true);
 for(const id of x.relatedMassOwnerIds)assert.ok(ownerIds.has(id),id);
 for(const id of x.existingMassBibleIds)assert.ok(mb.has(id),id);
 for(const id of x.sourceFindingIds)assert.ok(sourceIds.has(id),id);
}
let allIds=[];
for(const x of list){
 assert.equal(x.studyContentOwner,x.ownerId);
 assert.equal(x.release,'RESEARCH_ONLY');
 assert.equal(x.artworkPolicy.includes('approved Sacred Art IDs'),true);
 for(const link of x.biblicalCorrespondences)assert.ok(bIds.has(link.anchor));
 for(const id of x.sourceFindingIds)assert.ok(sourceIds.has(id));
 allIds.push(...x.archivalEvidenceIds);
 assert.equal(x.archivalEvidenceCount,x.archivalEvidenceIds.length);
}
assert.equal(allIds.length,402);
assert.equal(new Set(allIds).size,402);
assert.deepEqual([...new Set(allIds)].sort(),old.evidenceLinks.filter(x=>x.canonicalMassOwner).map(x=>x.evidenceId).sort());
assert.equal(old.counts.needsExactCueOrExternalRouteEvidenceRows,20);
const djIds=new Set(research.dujardinSecondaryMethod.map(x=>x.meditationId));
assert.equal(djIds.size,22);
assert.ok(research.dujardinSecondaryMethod.every(x=>x.publicationApproved===false));
assert.ok(research.dujardinSecondaryMethod.every(x=>x.relation==='AUTHORIAL_MEDITATION_NOT_RITUAL_ORIGIN'));
for(const x of meditation.rows){
 assert.ok(x.originalSectionLocator && x.originalSourceUrl);
 assert.equal(x.doNotInfer1962Rubrics,true);
 assert.equal(x.publicationApproved,false);
 for(const id of x.massResearchOwnerIds)assert.ok(ownerIds.has(id));
 for(const id of x.biblicalResearchAnchorIds)assert.ok(bIds.has(id));
}
assert.deepEqual(new Set(meditation.rows.map(x=>x.archivedDevotionalRow)).size,32);
for(const x of findings.records){
 assert.ok(x.source.url.startsWith('https://'));
 assert.ok(x.source.locator);
 assert.ok(x.review.caution);
 assert.equal(x.review.approvedForPublication,false);
 for(const id of x.studyOwnerIds)assert.ok(ownerIds.has(id)||/^MF0[1-8]$/.test(id));
}
const lang=findings.records.filter(x=>x.author==='LANG');
assert.ok(lang.every(x=>/SECONDHAND|BIBLIOGRAPHY/.test(x.evidenceClass)));
assert.equal(texts.integrationStatus,'RESEARCH_INVENTORY_ONLY_NO_APP_CHANGES');
assert.match(research.productScope.massReader,/UNTOUCHED/);
assert.ok(research.deliberateExclusions.some(x=>x.subject==='Noah'));
console.log('Dual chronology: 24 biblical research anchors + 39 ordered liturgical owners; 26/26 Mass-Bible, 402/402 mapped historical evidence, 22 Dujardin and 32 Ferrer/attributed Passion groups; 12 held authorial findings; no production publication.');
