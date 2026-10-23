import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assembleHistoriaReading,historiaAssemblyMarkdown,historiaReadableMarkdown,HISTORIA_EDITIONS,parseHistoriaSpan} from "../src/scripture/historia-assembled-reading.js";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const proof=read("data/research/historia-salutis-v18-continuous-reading-proof.v1.json");
const expected={movements:37,scriptureBeats:93,scriptureSpans:166,editorialConnectorProposals:41,originalContextUnits:29,additionalCausalSeams:12,heldSourceCandidates:16,stillUnselectedBridgeCandidates:7,bridgeReadingTrials:9,readingTrialSpans:12,exactVerseRailSections:220,sourceSpansWithProposedRailSplits:18,readableResearchProjectedSourceSpans:2,readableResearchSourceVerseOmissions:6,trialVerseEntries:54,published:0};
for (const edition of HISTORIA_EDITIONS) {
  const witnessCache=new Map();
  const getWitness=book=>{
    if(!witnessCache.has(book))witnessCache.set(book,read("data/scripture/witness/"+edition+"/"+book+".json"));
    return witnessCache.get(book);
  };
  const output=assembleHistoriaReading(proof,edition,getWitness);
  assert.equal(output.stage,"RESEARCH_TEXT_ASSEMBLY_NOT_APPROVED");
  // The original 93 scripture units have not changed. Crampon's equivalent
  // Isaiah 9 child oracle necessarily uses two native citations (8:23, 9:1–5)
  // rather than one imported English 9:1–6 range. This adds a source segment
  // and a verse-rail section only for the French research witness.
  const editionExpected=edition==="crampon-1923"?
    {...expected,scriptureSpans:167,exactVerseRailSections:221}:expected;
  assert.deepEqual(output.totals,editionExpected);
  assert.equal(output.movements.length,37);
  assert.equal(output.movements.every(m=>m.accepted===false&&m.publicationApproved===false),true);
  for(const movement of output.movements){
    const sourceMovement=proof.movements.find(m=>m.id===movement.id);
    assert.ok(sourceMovement);
    for(const segment of movement.segments){
      assert.equal(segment.publicationApproved,false);
      const original=sourceMovement.beats.find(b=>b.id===segment.ownerUnitId);
      assert.ok(original,"Unowned source segment "+segment.anchor);
      if(segment.kind==="SCRIPTURE_EXACT_WITNESS"){
        assert.equal(original.kind,"SCRIPTURE");
        const sources=original.semanticEditionAlignment?.selectedReferencesByEdition?.[edition]||original.refs;
        assert.ok(sources.includes(segment.reference));
        const parsed=parseHistoriaSpan(segment.reference);
        assert.equal(segment.verses[0].chapter,parsed.fromChapter);
        assert.equal(segment.verses[0].verse,parsed.fromVerse);
        assert.equal(segment.verses.at(-1).chapter,parsed.toChapter);
        assert.equal(segment.verses.at(-1).verse,parsed.toVerse);
        assert.equal(segment.text,segment.verses.map(v=>v.text).join(" "));
        assert.equal(segment.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
        assert.ok(segment.railSections.length>=1);
        assert.equal(segment.railSections.map(r=>r.text).join(" "),segment.text);
        const intended=original.railSegmentationTrial?.byOriginalReference?.[segment.reference];
        assert.deepEqual(segment.railSections.map(r=>r.reference),intended||[segment.reference]);
        assert.equal(segment.railSubdivisionAccepted,false);
        assert.equal(segment.railSections.every(r=>r.verseCount>0&&r.anchorVerseStart&&r.anchorVerseEnd),true);
        const lookup=new Map(getWitness(parsed.book).verses.map(([c,v,t])=>[c+":"+v,t]));
        for(const v of segment.verses){
          assert.equal(v.text,lookup.get(v.chapter+":"+v.verse));
          assert.equal(v.reference,parsed.book+" "+v.chapter+":"+v.verse);
        }
      } else if(segment.kind==="EDITORIAL_CONNECTOR_PROPOSAL"){
        if(segment.additionalCausalSeam){
          assert.ok(["HS-P3-EC-01","HS-P3-EC-02","HS-P3-EC-03","HS-P3-EC-04","HS-P3-EC-05","HS-P3-EC-06","HS-P3-EC-07","HS-P3-EC-08","HS-P3-EC-09","HS-P3-EC-10","HS-P3-EC-11","HS-P3-EC-12"].includes(segment.candidateId));
          const candidate=original.beforeScriptureConnectorCandidate||original.readthroughTrial?.editorialPreface;
          assert.ok(candidate);
          assert.ok(["SCRIPTURE","SOURCE_BRIDGE_CANDIDATE"].includes(original.kind));
          assert.equal(candidate.id,segment.candidateId);
          assert.deepEqual(segment.sourceReferences,candidate.sourceReferences);
          assert.equal(segment.text,candidate.text);
          assert.equal(segment.originalDeskText,null);
        } else {
          assert.equal(original.kind,"EDITORIAL_CONTEXT_NOT_BIBLE");
          assert.equal(segment.text,original.editorialReadingCandidate.text);
          assert.deepEqual(segment.sourceReferences,
             original.editorialReadingCandidate.sourceReferencesByEdition?.[edition]||
             original.editorialReadingCandidate.sourceReferences);
          assert.equal(segment.sourceReference,original.sourceReference);
          assert.equal(segment.originalDeskText,original.explanation);
          assert.equal(original.editorialReadingCandidate.publicationApproved,false);
        }
        assert.equal(segment.accepted,false);
        assert.equal(segment.editorialSourceLanguage,"en");
        assert.equal(segment.requiresEditorialLocalization,edition==="crampon-1923");
        assert.equal(segment.editionIndependent,false);
      } else if(segment.kind==="SCRIPTURE_READING_TRIAL_NOT_APPROVED"){
        const trial=segment.trialType==="HELD_BRIDGE_RESEARCH_TRIAL"?
          original.readthroughTrial:original.afterSelectedReadthroughTrial;
        assert.ok(trial);
        assert.ok(trial.refs.includes(segment.reference));
        assert.equal(trial.accepted,false);
        assert.equal(trial.publicationApproved,false);
        assert.equal(segment.selectedForPublication,false);
        assert.equal(segment.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
        assert.equal(segment.text,segment.verses.map(v=>v.text).join(" "));
        assert.deepEqual(segment.railSections.map(x=>x.reference),[segment.reference]);
        assert.equal(segment.railSections[0].text,segment.text);
        const parsed=parseHistoriaSpan(segment.reference);
        assert.equal(segment.verses[0].chapter,parsed.fromChapter);
        assert.equal(segment.verses[0].verse,parsed.fromVerse);
        assert.equal(segment.verses.at(-1).chapter,parsed.toChapter);
        assert.equal(segment.verses.at(-1).verse,parsed.toVerse);
        const lookup=new Map(getWitness(parsed.book).verses.map(([c,v,t])=>[c+":"+v,t]));
        for(const verse of segment.verses)assert.equal(verse.text,lookup.get(verse.chapter+":"+verse.verse));
      } else {
        assert.equal(segment.kind,"HELD_SOURCE_CANDIDATE");
        assert.equal(original.kind,"SOURCE_BRIDGE_CANDIDATE");
        assert.equal(segment.text,null);
        assert.equal(segment.selected,false);
      }
    }
  }
  const creation=output.movements.find(m=>m.id==="HS-M01");
  const sixDays=creation.segments.find(s=>s.reference==="Genesis 1:1–31");
  assert.deepEqual(sixDays.railSections.map(s=>s.reference),["Genesis 1:1–5","Genesis 1:6–8","Genesis 1:9–13","Genesis 1:14–19","Genesis 1:20–23","Genesis 1:24–25","Genesis 1:26–31"]);
  const cross=output.movements.find(m=>m.id==="HS-M28");
  assert.deepEqual(cross.segments.find(s=>s.reference==="John 19:17–30").railSections.map(s=>s.reference),["John 19:17–22","John 19:23–27","John 19:28–30"]);
  const easter=output.movements.find(m=>m.id==="HS-M29");
  const emmaus=easter.segments.find(s=>s.ownerUnitId==="H65-03");
  const evening=easter.segments.find(s=>s.ownerUnitId==="H65-02");
  assert.ok(easter.segments.indexOf(emmaus)>easter.segments.findIndex(s=>s.ownerUnitId==="H65-01"));
  assert.ok(easter.segments.indexOf(emmaus)<easter.segments.indexOf(evening),"Emmaus belongs before the Apostles and Thomas appearances");
  assert.ok(emmaus.text.includes("same Easter day"));
  const laterEpoch=output.movements.find(m=>m.id==="HS-M18");
  assert.ok(laterEpoch.segments.some(s=>s.candidateId==="HS-P3-EC-08"&&s.text.includes("Herod king of Judea")));
  const m31=output.movements.find(m=>m.id==="HS-M31");
  assert.ok(m31.segments.some(s=>s.reference==="Acts 2:1–10"));
  assert.ok(output.movements.find(m=>m.id==="HS-M33").segments.some(s=>s.reference==="Acts 15:4–11"));
  const king=output.movements.find(m=>m.id==="HS-M12");
  const saul=king.segments.find(s=>s.candidateId==="HS-P3-EC-01");
  assert.ok(saul&&saul.additionalCausalSeam&&saul.publicationApproved===false);
  assert.ok(king.segments.indexOf(saul)<king.segments.findIndex(s=>s.reference==="1Samuel 10:1–8"));
  assert.ok(output.movements.find(m=>m.id==="HS-M34").segments.some(s=>s.kind==="SCRIPTURE_READING_TRIAL_NOT_APPROVED"&&s.reference==="Acts 28:17–22"));
  assert.ok(output.movements.find(m=>m.id==="HS-M08").segments.some(s=>s.kind==="SCRIPTURE_READING_TRIAL_NOT_APPROVED"&&s.reference==="Exodus 12:29–30"));
  const passion=output.movements.find(m=>m.id==="HS-M28");
  const passionReading=passion.segments.filter(s=>s.kind==="SCRIPTURE_EXACT_WITNESS"||s.kind==="SCRIPTURE_READING_TRIAL_NOT_APPROVED");
  assert.deepEqual(passionReading.map(s=>s.reference),["John 19:17–30","John 19:31–37","John 19:38–42"]);
  assert.ok(!passion.omittedSourceSeams.some(s=>s.reference==="John 19:31–37"));
  assert.ok(output.movements.find(m=>m.id==="HS-M37").segments.some(s=>s.reference==="Revelation 21:9–11"));
  for(const [movement,candidateId] of [["HS-M12","HS-P3-EC-03"],["HS-M13","HS-P3-EC-04"],["HS-M14","HS-P3-EC-05"],["HS-M31","HS-P3-EC-06"],["HS-M34","HS-P3-EC-07"]]){
    const m=output.movements.find(x=>x.id===movement);
    assert.ok(m.segments.some(s=>s.candidateId===candidateId&&s.publicationApproved===false));
  }
  assert.ok(output.movements.find(m=>m.id==="HS-M06").segments.some(s=>s.candidateId==="HS-P3-EC-02"));
  for(const [movement,candidateId] of [["HS-M18","HS-P3-EC-08"],["HS-M20","HS-P3-EC-09"],["HS-M33","HS-P3-EC-10"]]){
    assert.ok(output.movements.find(m=>m.id===movement).segments.some(s=>s.candidateId===candidateId&&s.accepted===false));
  }
  const david=output.movements.find(m=>m.id==="HS-M13");
  const saulDeath=david.segments.find(s=>s.ownerUnitId==="H31-04");
  assert.equal(saulDeath.text,"Saul and his sons died in battle against the Philistines.");
  assert.ok(!saulDeath.text.includes("anointed"));
  const bread=output.movements.find(m=>m.id==="HS-M22");
  const breadIntro=bread.segments.find(s=>s.ownerUnitId==="H56-01");
  assert.ok(breadIntro.text.includes("Capharnaum"));
  assert.deepEqual(breadIntro.sourceReferences,["John 6:1–15","John 6:22–25"]);
  const stephen=m31.segments.find(s=>s.ownerUnitId==="H68-04"&&s.kind==="SCRIPTURE_EXACT_WITNESS");
  assert.equal(stephen.reference,edition==="crampon-1923"?"Acts 7:54–60":"Acts 7:54–59");
  const economyCases=[
    {mid:"HS-M12",id:"H29-04",book:"1Samuel",from:["1Samuel 10:1–8"],to:["1Samuel 10:1"],saved:{"dr-challoner":279,"cpdv-2009":299,"crampon-1923":238}},
    {mid:"HS-M06",id:"H16-03",book:"Genesis",from:["Genesis 41:33–45"],to:["Genesis 41:33–41","Genesis 41:45"],saved:{"dr-challoner":94,"cpdv-2009":100,"crampon-1923":88}},
    {mid:"HS-M13",id:"H32-02",book:"2Samuel",from:["2Samuel 5:1–10"],to:["2Samuel 5:1–3","2Samuel 5:6–7","2Samuel 5:9–10"],saved:{"dr-challoner":98,"cpdv-2009":105,"crampon-1923":82}},
    {mid:"HS-M32",id:"H70-01",book:"Acts",from:["Acts 10:30–32"],to:[],saved:{"dr-challoner":73,"cpdv-2009":81,"crampon-1923":81}}
  ];
  let sumWordSavings=0;
  const readOption=refs=>refs.flatMap(ref=>{
    const a=parseHistoriaSpan(ref);
    assert.equal(a.fromChapter,a.toChapter);
    const source=new Map(getWitness(a.book).verses.map(([c,v,t])=>[c+":"+v,t]));
    return Array.from({length:a.toVerse-a.fromVerse+1},(_,i)=>{
      const word=source.get(a.fromChapter+":"+(a.fromVerse+i));
      assert.ok(word,"Missing economy candidate source verse "+ref);
      return word;
    });
  }).join(" ");
  const wordCount=t=>t?t.split(/\s+/).length:0;
  for(const trial of economyCases){
    const b=proof.movements.find(m=>m.id===trial.mid).beats.find(b=>b.id===trial.id);
    assert.ok(b);
    const opt=b.literaryEconomyOption;
    assert.deepEqual(opt.sourceReferencesUnderReview,trial.from);
    assert.deepEqual(opt.substituteReferences,trial.to);
    assert.equal(opt.bookWitnessSourceCoordinatesVerified,true);
    assert.equal(opt.appliedToDefaultReading,false);
    assert.equal(opt.optionWasAppliedToMainResearchManuscript,false);
    assert.equal(opt.publicationApproved,false);
    const r=opt.readingDecision;
    assert.ok(r);
    assert.equal(r.originalSourceSelectionPreserved,true);
    assert.equal(r.editorialLiteraryApproval,false);
    assert.equal(r.publicationApproved,false);
    assert.equal(r.appliesOnlyToDerivedReadingView,true);
    if(["H16-03","H32-02"].includes(trial.id)){
      assert.equal(r.decision,"USE_SHORTENED_PASSAGES_IN_RESEARCH_READING_ONLY");
      assert.deepEqual(r.projectedReferences,trial.to);
    }else{
      assert.equal(r.decision,"RETAIN_FULL_IN_RESEARCH_READING");
      assert.equal(r.projectedReferences,null);
    }
    assert.equal(opt.sourceVerseComparison.sourceBook,trial.book);
    const original=readOption(trial.from),short=readOption(trial.to);
    const diff=wordCount(original)-wordCount(short);
    assert.equal(diff,trial.saved[edition],"Witness-based source economy mismatch "+trial.id+" "+edition);
    assert.equal(diff,opt.sourceVerseComparison.approximateWordsSavedByEdition[edition]);
    sumWordSavings+=diff;
    const current=output.movements.find(m=>m.id===trial.mid).segments.filter(s=>s.ownerUnitId===trial.id&&s.kind==="SCRIPTURE_EXACT_WITNESS");
    for(const ref of trial.from)assert.ok(current.some(s=>s.reference===ref),"Original passage must remain in default reading");
    for(const segment of current.filter(s=>trial.from.includes(s.reference))){
      const projected=segment.readableResearchProjection;
      if(["H16-03","H32-02"].includes(trial.id)){
        assert.ok(projected&&projected.publicationApproved===false);
        assert.equal(projected.originalReference,segment.reference);
        assert.deepEqual(projected.sections.map(s=>s.reference),trial.to);
        assert.deepEqual(projected.omittedVerseReferences.length,3);
        assert.equal(projected.sections.map(s=>s.text).join(" "),short);
      }else assert.equal(projected,null);
    }
  }
  assert.equal(sumWordSavings,edition==="dr-challoner"?544:edition==="cpdv-2009"?585:489);
  const manuscript=historiaAssemblyMarkdown(output);
  assert.ok(manuscript.includes("## 37 · The New Creation"));
  assert.ok(manuscript.includes("⟦HELD source bridge:"));
  assert.ok(manuscript.includes("⟦TRIAL SCRIPTURE · John 19:31–37 · NOT APPROVED⟧"));
  assert.ok(manuscript.includes("⟦TRIAL SCRIPTURE · John 19:38–42 · NOT APPROVED⟧"));
  assert.ok(manuscript.includes("⟦TRIAL SCRIPTURE · Acts 7:51–53 · NOT APPROVED⟧"));
  assert.ok(manuscript.includes("⟦TRIAL SCRIPTURE · Exodus 12:29–30 · NOT APPROVED⟧"));
  assert.ok(manuscript.includes("Editorial connector · source:"));
  assert.ok(manuscript.includes("1Samuel 9:15–17; 1Samuel 9:25–27"));
  assert.ok(!manuscript.includes("Christ's temptation may be mentioned briefly"));
  assert.ok(!manuscript.includes("Introduce the loaves once"));
  if(edition==="crampon-1923"){
    assert.ok(manuscript.includes("ATTENTION: Les raccords éditoriaux sont encore des brouillons en anglais"));
  }else{
    assert.ok(!manuscript.includes("ATTENTION: Les raccords éditoriaux"));
  }
  assert.ok(manuscript.includes("**RESEARCH TEXT PROOF — NOT APPROVED FOR PUBLICATION**"));
  assert.ok(!manuscript.includes("**APPROVED FOR PUBLICATION**"));
  if(edition==="dr-challoner"){
    const committed=readFileSync(new URL("../data/research/historia-salutis-p3-assembled-dr-challoner.v1.md",import.meta.url),"utf8");
    assert.equal(committed,manuscript,"Committed annotated manuscript must reproduce from source owners");
    const readable=historiaReadableMarkdown(output);
    const committedReadable=readFileSync(new URL("../data/research/historia-salutis-p3-continuous-research-reading-dr-challoner.v1.md",import.meta.url),"utf8");
    assert.equal(committedReadable,readable,"The clean research reading must reproduce from identical canonical source data");
    assert.equal((readable.match(/^## \d\d · /gm)||[]).length,37);
    assert.equal((readable.match(/^\*[^\n]+\*$/gm)||[]).filter(r=>/^(?:\*Genesis |\*Exodus |\*1Samuel |\*2Samuel |\*Acts )/.test(r)).length>0,true);
    assert.ok(!readable.includes("⟦TRIAL SCRIPTURE"));
    assert.ok(!readable.includes("⟦HELD source bridge"));
    assert.ok(readable.includes("**UNAPPROVED RESEARCH READING — NOT FOR PUBLICATION**"));
    assert.equal((readable.match(/\*Genesis 41:33–41\*/g)||[]).length,1);
    assert.equal((readable.match(/\*Genesis 41:45\*/g)||[]).length,1);
    assert.equal((readable.match(/\*2Samuel 5:6–7\*/g)||[]).length,1);
    assert.ok(!readable.includes("And he made him go up into his second chariot"));
    assert.ok(readable.includes("The Lord had made known to Samuel"));
    assert.ok(readable.includes("Among the descendants of Sem was Abram"));
    assert.ok(readable.includes("On Patmos, John received the revelation"));
    assert.ok(readable.includes("John the Baptist began preaching repentance"));
  }else if(edition==="crampon-1923"){
    assert.throws(()=>historiaReadableMarkdown(output),/untranslated English drafts/);
  }else{
    const readable=historiaReadableMarkdown(output);
    assert.ok(readable.includes("**UNAPPROVED RESEARCH READING — NOT FOR PUBLICATION**"));
    assert.ok(readable.includes("*Genesis 41:33–41*"));
  }
}
console.log("PASS Historia annotated source assembly: 37 movements, 93 A units, 166 English vs 167 French original-citation spans (Isaiah 8:23 + 9:1–5); 220 English vs 221 French verse-rail sections, 12 provisional source spans, 29 context + 12 causal connectors, 16 held candidates, three witnesses and no publication approval");
