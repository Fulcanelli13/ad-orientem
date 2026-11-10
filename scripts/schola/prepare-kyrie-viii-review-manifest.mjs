// Non-publishing, reproducible nine-cue Kyrie VIII review package.
// Run: node scripts/schola/prepare-kyrie-viii-review-manifest.mjs
// The stdout JSON is a RESEARCH review artifact; never bundle into the
// approved-score registry or app release. Approval is not a CLI parameter.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {
  KYRIE_VIII_REVIEW_SOURCE,prepareKyrieVIIIReview,
  prepareKyrieVIIIUnapprovedGabcExcerpts
} from "../../src/mass/reader-kyrie-viii-review-queue.js";
import {offlineKyrialeResearchScore} from "../../src/mass/reader-kyriale-research-gabc.js";

const sourcePath=new URL("../../data/presentation/reader-text-sung.v1.json",import.meta.url);
const sha256=s=>createHash("sha256").update(s,"utf8").digest("hex");
const NOTES=Object.freeze([
  Object.freeze({
    sourceLine:0,folios:Object.freeze(["28*"]),
    incipit:"Kýrie, eléison",repeats:3,
    visiblePrintEvidence:"Kyrie VIII incipit, first melody, iij. repeat rubric",
    pitchAndNeumeVerification:"NOT_CERTIFIED",
    engravingDifferenceReview:"NOT_CERTIFIED"
  }),
  Object.freeze({
    sourceLine:1,folios:Object.freeze(["28*"]),
    incipit:"Christe, eléison",repeats:3,
    visiblePrintEvidence:"Christe, second melody, iij. repeat rubric",
    pitchAndNeumeVerification:"NOT_CERTIFIED",
    engravingDifferenceReview:"NOT_CERTIFIED"
  }),
  Object.freeze({
    sourceLine:2,folios:Object.freeze(["28*","29*"]),
    incipit:"Kýrie, eléison",repeats:2,
    visiblePrintEvidence:"Returning Kyrie continues across printed page turn; ij. repeat rubric",
    pitchAndNeumeVerification:"NOT_CERTIFIED",
    engravingDifferenceReview:"NOT_CERTIFIED"
  }),
  Object.freeze({
    sourceLine:3,folios:Object.freeze(["29*"]),
    incipit:"Kýrie, eléison",repeats:1,
    visiblePrintEvidence:"Separate concluding Kyrie melody with asterisks; not interchangeable with returning Kyrie",
    pitchAndNeumeVerification:"NOT_CERTIFIED",
    engravingDifferenceReview:"NOT_CERTIFIED"
  })
]);

// There is intentionally NO option to mark this publication-ready.
// It requires an independently reviewed musical transcription and a new,
// explicit editorial decision in the separate trusted approval registries.
export function buildKyrieVIIIReviewManifest({corpus}={}){
  const researchScore=offlineKyrialeResearchScore("KYRIE","MASS_08");
  if(!researchScore?.gabc||
     sha256(researchScore.gabc)!==KYRIE_VIII_REVIEW_SOURCE.sourceGabcSha256){
    return Object.freeze({schema:"ao-schola-kyrie-viii-review-package-v1",
      status:"SOURCE_GABC_SHA_DRIFT_HOLD",candidates:Object.freeze([])});
  }
  const source=corpus??JSON.parse(readFileSync(sourcePath,"utf8"));
  const reviewed=prepareKyrieVIIIReview({corpus:source});
  const excerpted=prepareKyrieVIIIUnapprovedGabcExcerpts({corpus:source});
  if(reviewed.status!=="READY_FOR_NOTE_BY_NOTE_PRINT_REVIEW_NOT_PUBLISHABLE" ||
     excerpted.status!=="RESEARCH_GABC_EXCERPTS_READY_FOR_PRINT_COMPARISON" ||
     excerpted.excerpts.length!==9)return Object.freeze({
       schema:"ao-schola-kyrie-viii-review-package-v1",
       status:"SOURCE_IDENTITY_HOLD",candidates:Object.freeze([])
     });
  const candidateScores=excerpted.excerpts.map((entry,index)=>{
    const row=reviewed.rows[index];
    if(row?.cueId!==entry.cueId||row?.sourceLine!==entry.sourceLine ||
       entry.publication!=="BLOCKED")throw new Error("Kyrie source-cue review drift");
    return Object.freeze({
      schema:"ao-mass-inline-approved-gabc-v1",
      scoreId:"GREGOBASE-1184-"+entry.cueId,
      selectionKey:"KYRIE",settingId:"MASS_08",riteScope:"ORDINARY",
      sourceCueId:entry.cueId,sourceBlockId:row.sourceBlockId,
      sourceLatin:row.sourceLatin,
      sourceWitness:KYRIE_VIII_REVIEW_SOURCE.sourceWitness,
      sourceUrl:KYRIE_VIII_REVIEW_SOURCE.sourceUrl,
      sourceScoreId:"GREGOBASE-1184",
      sourceLine:entry.sourceLine,repeatIndex:entry.repeatIndex,
      facsimileFolios:entry.facsimileFolios,
      sourceImageUrls:KYRIE_VIII_REVIEW_SOURCE.printedPageImages,
      licence:"CC0-1.0",
      gabc:entry.gabc,gabcSha256:sha256(entry.gabc),
      sourceTextVerified:true,
      musicalNotationVerified:false,
      userEditorialApproval:false,
      approval:"NOT_MUSICAL_SOURCE_REVIEWED",
      publication:"BLOCKED",score_status:"research_hold",
      performanceStatus:"EXPECTED_NOT_OBSERVED"
    });
  });
  return Object.freeze({
    schema:"ao-schola-kyrie-viii-review-package-v1",
    status:"SOURCE_CUES_READY_MUSICAL_PROOF_AND_PUBLICATION_HELD",
    generatedFrom:"SOURCE_VERIFIED_1962_CORPUS_AND_PINNED_1961_GABC",
    source:KYRIE_VIII_REVIEW_SOURCE,
    verifiedResearchGabcSha256:sha256(researchScore.gabc),
    printedSourceLines:4,sourceCues:9,repeatPattern:Object.freeze([3,3,2,1]),
    sourceLineReview:NOTES,
    requiredBeforePublication:Object.freeze([
      "Independent line-by-line neume/pitch/episema comparison with printed 28* and 29*",
      "Confirm GABC editor markings against exact printed witness",
      "Independent editorial decision to publish the nine precise source cues",
      "Validate one-to-one selected MASS_08 setting and original Latin in LIVE reader",
      "Both trusted score manifest and Schola promotion registry must explicitly pass review",
      "Final offline Exsurge, 320px/390px and curated-65 mobile regression gates"
    ]),
    approval: "NOT_GRANTED",
    approvedScores:0,publishedScores:0,
    candidates:Object.freeze(candidateScores)
  });
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  process.stdout.write(JSON.stringify(buildKyrieVIIIReviewManifest(),null,2)+"\n");
}
