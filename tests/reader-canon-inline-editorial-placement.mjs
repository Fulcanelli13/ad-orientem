import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createMassReaderModel} from "../src/mass/reader-model.js";
import {createCanonRubricAdjudicationController} from "../src/mass/reader-canon-rubric-adjudication.js";
import {projectCanonInlineEditorialPlacements} from "../src/mass/reader-canon-inline-editorial-placement.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const sung=load("../data/presentation/reader-text-sung.v1.json");
const low=load("../data/presentation/reader-text-low.v1.json");
const sections=load("../data/presentation/reader-section-map.v0.13.1.json");
const canonSourceMap=load("../data/presentation/reader-canon-source-map.v1.json");
const frenchOrdinary=load("../data/presentation/reader-french-ordinary.v1.json");
const canonData=load("../data/presentation/reader-canon-rubric-review.v1.json");
const triggerAudit=load("../data/research/mass-canon-62-source-trigger-audit-20261013.json");
const frenchReview=load("../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json");
const ministerData=load("../data/research/mass-canon-minister-form-branches-20261013.json");
const promotion=load("../data/research/mass-canon-42-rubric-promotion-review-20261013.json");
const ctl=createCanonRubricAdjudicationController({
  canonData,triggerAudit,frenchReview,ministerData,
});
const t=(lat,en)=>({lat,en,fr:"Exemple de test — "+en});
const proper={
  sourcePath:"Sancti/10-07",introit:t("Introitus","Introit"),
  collects:[t("Collecta","Collect")],epistle:t("Epistola","Epistle"),
  gradual:t("Graduale et Alleluia","Gradual"),
  sequence:{lat:"",en:"",fr:""},
  gospel:t("Evangelium","Gospel"),offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),postcommunions:[t("Postcommunio","Postcommunion")],
};
const base={
  schema:"ao-resolved-mass-v2",date:"2026-10-04",
  form:"MISSA_CANTATA_INCENSE",presentationMode:"LIVE",
  actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Holy Rosary"},
  calendarCelebration:{id:"Tempora/Pent18-0",type:"CALENDAR"},
  explicitlySelectedCelebration:true,
  proper:{status:"READY",data:proper,sourcePath:"Sancti/10-07"},
  overlays:["VOTIVE_PROPER"],precedingRites:[],followingActions:[],distinctRite:null,
};
const sourceByCue=corpus=>Object.fromEntries(corpus.blocks.flatMap(b=>
  (b.units??[]).map(u=>[u.cue_id,u.latin])));
const flattened=review=>review.paragraphs.flatMap(p=>p.placements);
let totalExact=0,totalNonWord=0;
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const model=createMassReaderModel({
    resolvedMass:{...base,form,presentationMode:form==="LOW"?"SIMPLE":"LIVE",
      overlays:form==="LOW"?[]:["VOTIVE_PROPER"]},
    sectionMap:sections,lowCorpus:low,sungCorpus:sung,canonSourceMap,
  });
  const paragraphs=model.cards.flatMap(c=>c.paragraphs);
  const disabled=projectCanonInlineEditorialPlacements({paragraphs,controller:ctl,
    promotion,sourceLatinByCue:sourceByCue(form==="LOW"?low:sung),form});
  assert.equal(disabled.status,"EDITORIAL_PREVIEW_DISABLED");
  assert.equal(disabled.paragraphs.length,0,"Production path may not leak Canon research");
  const preview=projectCanonInlineEditorialPlacements({
    paragraphs,controller:ctl,promotion,
    sourceLatinByCue:sourceByCue(form==="LOW"?low:sung),
    form,editorialPreview:true,
  });
  const events=flattened(preview);
  assert.equal(preview.status,"EDITORIAL_PREVIEW_ONLY");
  assert.equal(preview.publicationReady,0);
  assert.equal(preview.canPublish,false);
  assert.equal(preview.unmatchedGapCueIds.length,0,form+" must carry the 42 Canon source cues");
  assert.equal(events.length,42,form+" must map every source-gap cue exactly once");
  assert.equal(new Set(events.map(x=>x.cueId)).size,42);
  assert.ok(events.every(e=>e.canPublish===false&&e.displayText===null&&
    e.faithfulPosture===null&&e.priestActionNow===null&&
    e.publication==="NOT_APPROVED_NOT_VISIBLE"));
  assert.ok(events.every(e=>e.status==="WORD_MATCH_EXACT"||
    e.status==="NON_TEXT_SOURCE_EVENT"||
    e.status==="RENDERED_LATIN_MISMATCH_REVALIDATION_REQUIRED"||
    e.status==="COMPOSITE_PARAGRAPH_REQUIRES_SOURCE_SEGMENTATION"));
  const nonWord=events.filter(e=>e.sourceAnchorKind!=="SOURCE_LATIN_WORDS");
  assert.ok(nonWord.every(e=>e.spans.length===0));
  const exact=events.filter(e=>e.status==="WORD_MATCH_EXACT");
  for(const event of exact){
    const rendered=paragraphs.find(p=>p.sourceCueIds?.includes(event.cueId));
    const latin=rendered?.displayLanguage==="VERNACULAR"
      ?rendered?.alternate:rendered?.primary;
    for(const span of event.spans)
      assert.equal(latin.slice(span.start,span.end),span.latin,
        form+"/"+event.cueId+": inline placement must preserve exact rendered glyphs");
  }
  assert.ok(exact.length>=20,form+": too few source-verified precise word placements");
  assert.ok(nonWord.length>=2,form+": non-text Canon events must remain separate");
  totalExact+=exact.length;totalNonWord+=nonWord.length;
}
const sungSource=sourceByCue(sung);
const hand=projectCanonInlineEditorialPlacements({
  paragraphs:[{
    id:"single",sourceCueIds:["AO.SM.C0165"],displayLanguage:"VERNACULAR",
    primary:"Test translation, not Latin",alternate:sungSource["AO.SM.C0165"],
  }],
  controller:ctl,promotion,sourceLatinByCue:sungSource,
  form:"SOLEMN",editorialPreview:true,
});
const hostSign=flattened(hand)[0];
assert.equal(hostSign.status,"WORD_MATCH_EXACT");
assert.ok(hostSign.spans[0].latin.includes("✠"));
const changed=projectCanonInlineEditorialPlacements({
  paragraphs:[{
    id:"corrected",sourceCueIds:["AO.SM.C0165"],displayLanguage:"VERNACULAR",
    primary:"Non-Latin presentation",alternate:sungSource["AO.SM.C0165"]+" — changed",
  }],
  controller:ctl,promotion,sourceLatinByCue:sungSource,
  form:"SOLEMN",editorialPreview:true,
});
assert.equal(flattened(changed)[0].status,"RENDERED_LATIN_MISMATCH_REVALIDATION_REQUIRED");
assert.equal(flattened(changed)[0].spans.length,0);
const synthetic=projectCanonInlineEditorialPlacements({
  paragraphs:[{id:"derived-amen",sourceCueIds:[],sourceAnchorCueId:"AO.SM.C0165",
    primary:sungSource["AO.SM.C0165"]}],
  controller:ctl,promotion,sourceLatinByCue:sungSource,
  form:"SOLEMN",editorialPreview:true,
});
assert.equal(flattened(synthetic).length,0,"SourceAnchorCueId is NOT a canonical text cue");
const composite=projectCanonInlineEditorialPlacements({
  paragraphs:[{id:"joined",sourceCueIds:["AO.SM.C0165","AO.SM.C0166"],
    primary:sungSource["AO.SM.C0165"]+" "+sungSource["AO.SM.C0166"]}],
  controller:ctl,promotion,sourceLatinByCue:sungSource,
  form:"SOLEMN",editorialPreview:true,
});
assert.ok(flattened(composite).every(e=>e.status==="COMPOSITE_PARAGRAPH_REQUIRES_SOURCE_SEGMENTATION"));
assert.ok(flattened(composite).every(e=>e.spans.length===0));
const denied=projectCanonInlineEditorialPlacements({
  paragraphs:[],controller:ctl,promotion,sourceLatinByCue:sungSource,
  form:"REQUIEM",editorialPreview:true,
});
assert.equal(denied.status,"EDITORIAL_PREVIEW_DISABLED");
const duplicate=()=>projectCanonInlineEditorialPlacements({
  paragraphs:[{id:"one",sourceCueIds:["AO.SM.C0165"],primary:sungSource["AO.SM.C0165"]},
    {id:"two",sourceCueIds:["AO.SM.C0165"],primary:sungSource["AO.SM.C0165"]}],
  controller:ctl,promotion,sourceLatinByCue:sungSource,
  form:"LOW",editorialPreview:true,
});
assert.throws(duplicate,/repeated in multiple reader paragraphs/);
console.log("PASS Canon inline review: 42 gap cues in all four reader forms; "+
  totalExact+" exact word placements; "+totalNonWord+
  " non-text previews; corrected text and composite cues fail closed; zero LIVE copy.");
