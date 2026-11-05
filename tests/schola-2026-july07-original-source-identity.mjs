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
assert.ok(d.residualHold.includes("original 1961 printed [35]-[37]"));
assert.equal(d.threeArchivedGabcSamePrintedPageCandidatesLocated,true);
assert.equal(d.numberOfNewGabcTranscriptionsNeededForThreeChants,0);
assert.equal(g.existing1195ArchiveRecordsLocated,3);
assert.equal(g.existing1195ArchiveGabcNotesCollatedAgainstScannedPrint,false);
assert.equal(g.specificArchived1195GabcFileIdentityCertified,false);
const matches=g.existing1195ArchiveCandidates;
assert.equal(matches.length,3);
for(const [i,expected] of [
 [0,["GREGOBASE-48","in","[35]","edf2d86594bba08d30130e47f9bd04890f633a326eec9ec2f67823f85a831777"]],
 [1,["GREGOBASE-415","gr","[36]","5bc5f9de688c1de1dc1a33f7b1ce40015f321cdff7c38bbed374148aaad8ea08"]],
 [2,["GREGOBASE-1187","al","[37]","bba316ec64fed01860a893e5ecb810141e14ed501a0759481958f6ef1002db2a"]]
]){
 const ref=matches[i];
 assert.deepEqual([ref.id,ref.officePart,ref.printedPage,ref.gabcSha256],expected);
 const archive=load(ref.archiveFile);
 assert.equal(archive.schema,"ao-gregobase-graduale1961-research-batch-v1");
 assert.equal(archive.sourceEditionId,2);
 assert.equal(archive.status,"STAGED_UNRELEASED");
 const rows=archive.items.filter(r=>r.id===ref.id);
 assert.equal(rows.length,1);
 const item=rows[0];
 assert.deepEqual([item.id,item.officePart,item.gradualeRomanum1961Page,item.sha256],expected);
 assert.equal(item.sourceUrl,ref.sourceUrl);
 assert.equal(item.gregobaseId,ref.gregobaseId);
 assert.equal(item.incipit,ref.incipit);
 assert.equal(item.releaseStatus,"RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED");
 assert.match(item.gabc,/^\(c[1-4]\)/);
 assert.ok(item.gabc.includes("(::)"));
}

const annual=load(".tmp/schola-1962-selected-annual/2026-selected-gabc-coverage.json");
assert.equal(annual.schema,"ao-schola-selected-mass-2026-proper-gabc-candidate-coverage-v1");
assert.equal(annual.year,2026);
assert.equal(annual.rows.length,365);
const july=annual.rows.find(x=>x.date==="2026-07-07");
assert.equal(july?.sourcePath,"Sancti/07-07");
assert.equal(july?.status,"SOURCE_MATCHED_FOR_REVIEW");
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
const latin=norm(july.selectedGradualLatin);
const appointed=[
 "sacerdotes eius induam salutari et sancti eius exsultatione exsultabunt",
 "illuc producam cornu david paravi lucernam christo meo",
 "iuravit dominus",
 "tu es sacerdos in aeternum secundum ordinem melchisedech"
];
let previous=-1;
for(const segment of appointed){
 const pos=latin.indexOf(segment);
 assert.ok(pos>=0,"7 July appointed source segment omitted: "+segment);
 assert.ok(pos>previous,"7 July appointed Gregorian segment out of liturgical order: "+segment);
 previous=pos;
}
assert.ok(!latin.includes("ecce sacerdos magnus"),
 "The historical C4 first Common must NOT replace the 7 July Sacerdotes form");
console.log("SCHOLA_JULY07_ORIGINAL_SOURCE_PROOF_PASS: 1962 Vatican pp.580-581, 1961 Graduale [35]-[37]/saint p.549, C4-1 != C4; C4d section candidate, 3 exact archived GABC locators, 0 public approvals");
