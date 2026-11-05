// Fail-closed 7 July 2026 printed 1962 role and 1961 musical reference owner.
// This does NOT approve a historical source alias or a GABC score.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const e=load("data/research/schola-2026-july07-original-1962-1961-printed-identity.v1.json");
const pinned=load("data/research/mass-music-1962-pinned-full-source-universe.v1.json");
const variants=load("data/research/schola-2026-27-selected-variant-owner-candidates.v1.json");
assert.equal(e.schema,"ao-schola-2026-july07-original-1962-missal-1961-graduale-source-identity-v1");
assert.equal(e.authority.appointedDay,"2026-07-07");
assert.equal(e.authority.sourcePath,"Sancti/07-07");
assert.equal(e.authority.selectedSourceActualRankSelector,";;Duplex;;3;;vide C4-1");
assert.equal(e.authority.previousResearchRubricalTruncation,"vide C4-1 -> C4");
assert.equal(e.authority.previousHistoricalCommonWasNotCorrectPreGospel,"Commune/C4:Graduale = Ecce sacerdos magnus");
assert.equal(e.authority.historicalCandidateSection,"Commune/C4d:Graduale");
assert.equal(e.authority.historicalCandidateFilePath,"obsolete/missa/Latin/Commune/C4d.txt");
assert.equal(e.authority.historicalCandidateGitBlobSha,"fb1d78a3d527f44734b18867c965d19a11e612e6");
assert.equal(e.authority.noLiteralC4Minus1SourceFileLocated,true);
assert.equal(e.authority.sourceRoleResolution,"TEXT_AND_APPOINTED_PRINTED_COMMON_MATCH_SOURCE_FILE_ALIAS_REMAINS_UNVERIFIED");
assert.equal(pinned.schema,"ao-mass-music-1962-pinned-source-universe-v1");
assert.equal(pinned.sourceRef,"ad8783641455bae38a8eb5782b34241a7b3ff2ef");
assert.equal(pinned.sourceFiles.length,1049);
assert.equal(pinned.sourceFiles.find(x=>x.path==="Sancti/07-07")?.sha,
 "476c93a0f4869b71a2a5a348110ba8e590e5104b");
assert.equal(e.authority.selectedSourceGitBlobSha,
 "476c93a0f4869b71a2a5a348110ba8e590e5104b");
assert.equal(pinned.sourceFiles.some(x=>x.path==="Commune/C4d"),false);
const selected=variants.exactDateExternalDispositionHolds.find(r=>r.date==="2026-07-07");
assert.equal(selected?.previousRubricCue,"Commune/C4");
assert.equal(selected?.selectedOpening,"Sacerdotes eius induam salutari");
assert.equal(selected?.appointed1962TextCertified,false,
 "Never silently rewrite immutable prior selected-year review");
const m=e.original1962MissaleRomanum;
assert.equal(m.originalPageImageReviewed,true);
assert.deepEqual(m.directPageImages.map(p=>p.printedPage),[580,581]);
assert.deepEqual(m.directPageImages.map(p=>p.url),[
 "https://gregobase.selapa.net/sources/42/662.png",
 "https://gregobase.selapa.net/sources/42/663.png"]);
assert.deepEqual(m.appointedRoles,["GRADUALE_PS_131_16_17","ALLELUIA_PS_109_4"]);
assert.ok(m.appointedGradualFullLatinOpening.startsWith("Sacerdotes eius induam salutari"));
assert.ok(m.appointedGradualVerseOpening.startsWith("Illuc producam cornu David"));
assert.ok(m.appointedAlleluiaVerseOpening.startsWith("Iuravit Dominus"));
assert.deepEqual(m.notAppointed,["TRACTUS_POST_SEPTUAGESIMAM_OPTION","DUAL_PASCHAL_ALLELUIA_OPTION"]);
const g=e.original1961GradualeRomanum;
assert.equal(g.saintDayPrintedPage,549);
assert.deepEqual(g.scans.map(x=>x.printedPage),["[35]","[36]","[37]"]);
assert.deepEqual(g.scans.map(x=>x.url),[
 "https://gregobase.selapa.net/sources/2/761.png",
 "https://gregobase.selapa.net/sources/2/762.png",
 "https://gregobase.selapa.net/sources/2/763.png"]);
assert.ok(g.indexEntries.includes("Graduale. Sacerdotes ejus. [36]."));
assert.ok(g.indexEntries.includes("Alleluia, alleluia. V. Juravit. [37]."));
assert.ok(g.indexEntries.includes("Offertorium. Mirabilis Deus. [24]."));
assert.ok(g.indexEntries.includes("Communio. Quod dico vobis. [31]."));
assert.equal(g.fullPrintedNotationComparedNoteByNoteAgainstSpecificGabc,false);
assert.equal(g.original1961SolesmesPitchNeumeRhythmUnderlayCertified,false);
assert.equal(g.specificArchived1195GabcFileIdentityCertified,false);
const d=e.evidenceDisposition;
assert.equal(d.dateSpecific1962PrintedTextAndRoleVerified,true);
assert.equal(d.dateSpecific1961PrintedMassChantReferenceVerified,true);
assert.equal(d.historicalArchivedC4dPreGospelLatinOpeningAligned,true);
assert.equal(d.selectedResolverFullPreGospelLatinComparedByteForByte,false);
assert.equal(d.literalSourceSelectorDigitalMappingAuthenticated,false);
assert.equal(d.sourceAliasesApproved,0);
assert.equal(d.publicProperScoresApproved,0);
assert.equal(d.humanMusicalApproval,false);
assert.equal(d.localReaderModified,false);
assert.equal(d.publicationManifestModified,false);
assert.ok(d.residualHold.includes("1961 [36]-[37]"));
console.log("SCHOLA_JULY07_ORIGINAL_SOURCE_PROOF_PASS: 1962 Vatican pp.580-581, 1961 Graduale [35]-[37]/saint p.549, C4-1 != C4; C4d section candidate, 0 public approvals");
