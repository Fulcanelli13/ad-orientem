// M50: inspectable original-print visual location map, NOT musical source approval.
// Coordinates are approximate visual alignments on the archived 420-dpi crops;
// they do not certify ink-level rhythmic signs or authentic Gregorian performance.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const m=load('../data/research/mass-music-m50-kyrie-xviii-print-visual-position-map.v1.json');
const ledger=load('../data/research/mass-music-m49-kyrie-xviii-note-review-ledger.v1.json');
const source=load('../data/research/mass-music-m49-kyrie-xviii-1961-source-review.v1.json');
assert.equal(m.schema,'ao-schola-m50-1961-print-visual-positions-v1');
assert.equal(m.scoreId,ledger.source);
assert.equal(m.scoreId,source.scoreId);
assert.equal(m.provenance.originalPdf,source.printedWitness.pdfUrl);
assert.equal(m.provenance.originalPdfSha256,'119b084b5c0689fc3e87541143731f6526c404a018bc97d18e8c98a7635ce2bd');
assert.equal(m.provenance.originalFacsimileImagesNotAddedToPublicAssets,true);
assert.equal(m.provenance.nativeScanResolutionIndependentlyConfirmed,false);
assert.equal(m.notePositions.length,44);
assert.equal(m.observedStructure.total,44);
assert.deepEqual(m.observedStructure.writtenNotesByPhrase,[10,8,10,16]);
assert.deepEqual(m.observedStructure.printedRepeatLabels,['iij.','iij.','ij.',null]);
assert.equal(m.observedStructure.threeKyrieThreeChristeThreeKyrieInvocationPlan,true);
assert.deepEqual(m.observedStructure.visiblePunctaMoraSourceOrdinals,[10,18,28,44]);
assert.deepEqual(m.observedStructure.visibleHorizontalEpisemaSourceOrdinals,[8,26]);
assert.deepEqual(m.observedStructure.finalPhraseDiamondHeadsSourceOrdinals,[40,41]);
assert.deepEqual(m.observedStructure.visiblePunctaMoraSourceOrdinals,
  ledger.records.filter(x=>x.modelPunctumMora).map(x=>x.sourceOrdinal));
assert.deepEqual(m.observedStructure.visibleHorizontalEpisemaSourceOrdinals,
  ledger.records.filter(x=>x.modelHorizontalEpisema).map(x=>x.sourceOrdinal));

let lastXByPhrase=new Map();
let counts=[0,0,0,0];
for(let i=0;i<m.notePositions.length;i++){
  const v=m.notePositions[i],a=ledger.records[i];
  assert.equal(v.ordinal,i+1);
  assert.equal(a.sourceOrdinal,v.ordinal);
  assert.equal(v.phrase,a.phrase);
  assert.equal(v.observedStaffPosition,a.staffPosition,'facsimile staff-position map differs at source ordinal '+v.ordinal);
  assert.equal(v.staffSystem,v.phrase<=2?1:2);
  assert.equal(v.confidence,'PROVISIONAL_VISUAL_ALIGNMENT');
  assert.equal(v.visualNoteheadShape,([40,41].includes(v.ordinal)?'diamond':'square_or_attached_neume'));
  const [x,y]=v.approximateInkCenterPx;
  const crop=v.staffSystem===1?m.provenance.crop1:m.provenance.crop2;
  assert.ok(Number.isInteger(x)&&x>=0&&x<crop.width,'x outside archival crop at '+v.ordinal);
  assert.ok(Number.isInteger(y)&&y>=0&&y<crop.height,'y outside archival crop at '+v.ordinal);
  const [topLine,secondLine,thirdLine,bottomLine]=crop.staffLinesYApprox;
  assert.ok(secondLine>topLine&&thirdLine>secondLine&&bottomLine>thirdLine);
  const expectedY=bottomLine-(v.observedStaffPosition-1)*(bottomLine-topLine)/6;
  assert.ok(Math.abs(y-expectedY)<=8,'staff y contradicts ordinal '+v.ordinal+': '+y+' vs '+expectedY);
  assert.ok(x>=(lastXByPhrase.get(v.phrase)??-1),'original glyphs must remain in reading order at '+v.ordinal);
  lastXByPhrase.set(v.phrase,x);
  counts[v.phrase-1]++;
}
assert.deepEqual(counts,[10,8,10,16]);
assert.equal(source.observedPrint.fullPhysicalNoteheadByNoteheadManualCountCertified,false);
assert.equal(source.observedPrint.exactOriginalPixelLevelRhythmicSignAttachmentCertified,false);
assert.equal(source.observedPrint.exactPitchContourFrom1961ScanIndependentlyAudited,false);
assert.equal(m.remainingEditorialBoundaries.scoreApproved,false);
assert.equal(m.remainingEditorialBoundaries.independent1961PhysicalInkCertification,false);
assert.equal(m.remainingEditorialBoundaries.neumeShapeAndIndividualSignCertification,false);
assert.equal(m.remainingEditorialBoundaries.performanceRhythmCertified,false);
assert.equal(m.remainingEditorialBoundaries.excludeRequiem,true);
assert.equal(m.remainingEditorialBoundaries.noAutomaticMassCalendarAssignment,true);
assert.equal(m.status,'PROVISIONAL_PRINT_VISUAL_ALIGNMENT_NOT_APPROVED');
console.log('PASS M50: all 44 source ordinals have crop coordinates and staff-line parity; no musical approval or source imagery publication');
