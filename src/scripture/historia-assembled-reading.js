/**
 * Historia Salutis P3: derived, research-only annotated Scripture assembly.
 * The v18 continuous-reading proof owns selections, order and editorial status.
 * This module never promotes a held bridge or publishes a witness text.
 */
export const HISTORIA_EDITIONS = Object.freeze(["cpdv-2009", "dr-challoner", "crampon-1923"]);

export function parseHistoriaSpan(reference) {
  const m = typeof reference === "string" &&
    reference.match(/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:[–-](?:(\d+):)?(\d+))?$/);
  if (!m) throw new Error("Unparseable Historia verse coordinates: " + reference);
  const fromChapter = Number(m[2]), fromVerse = Number(m[3]);
  const toChapter = Number(m[4] || m[2]), toVerse = Number(m[5] || m[3]);
  if (toChapter < fromChapter || (toChapter === fromChapter && toVerse < fromVerse))
    throw new Error("Reversed Historia span: " + reference);
  return {reference, book: m[1], fromChapter, fromVerse, toChapter, toVerse};
}

function indexWitness(witness, edition, book) {
  if (witness?.editionId !== edition || witness?.book !== book ||
      witness?.sourceStatus !== "UNCOLLATED_SOURCE_WITNESS" || !Array.isArray(witness.verses))
    throw new Error("Missing/unexpected uncollated Historia witness: " + edition + "/" + book);
  const lookup = new Map();
  for (const [chapter, verse, text] of witness.verses) {
    const key = chapter + ":" + verse;
    if (lookup.has(key) || !String(text || "").trim())
      throw new Error("Duplicate/blank witness verse: " + edition + "/" + book + " " + key);
    lookup.set(key, text);
  }
  return lookup;
}

function actualVerses(range, index, edition) {
  const output = [];
  for (let chapter = range.fromChapter; chapter <= range.toChapter; chapter++) {
    const start = chapter === range.fromChapter ? range.fromVerse : 1;
    const ending = chapter === range.toChapter ? range.toVerse :
      Math.max(...[...index.keys()].filter(key => key.startsWith(chapter + ":")).map(key => +key.split(":")[1]));
    if (!Number.isFinite(ending))
      throw new Error("Missing chapter: " + edition + " " + range.book + " " + chapter);
    for (let verse = start; verse <= ending; verse++) {
      const value = index.get(chapter + ":" + verse);
      if (!value) throw new Error("Missing verse: " + edition + " " + range.book + " " + chapter + ":" + verse);
      output.push({chapter, verse, reference: range.book + " " + chapter + ":" + verse, text: value});
    }
  }
  return output;
}

/**
 * Translate a source-owned long citation into exact, consecutive rail ranges.
 * Every verse from the original selected span appears once, unchanged. These
 * are presentation anchors, never a secondary Scripture selection.
 */
function railSectionsFor(ref, verses, partitions) {
  const refs=partitions || [ref];
  const base=parseHistoriaSpan(ref);
  const groups=[];
  let at=0;
  for (const sectionRef of refs) {
    const span=parseHistoriaSpan(sectionRef);
    if(span.book!==base.book)throw new Error("Rail book mismatch "+ref+" / "+sectionRef);
    const group=[];
    while(at<verses.length) {
      const v=verses[at];
      if(v.chapter>span.toChapter||(v.chapter===span.toChapter&&v.verse>span.toVerse))break;
      const inRange=v.chapter>span.fromChapter||(v.chapter===span.fromChapter&&v.verse>=span.fromVerse);
      if(!inRange)throw new Error("Discontinuous rail segmentation "+ref+" / "+sectionRef+" at "+v.reference);
      group.push(v);
      at++;
    }
    if(!group.length||group[0].chapter!==span.fromChapter||group[0].verse!==span.fromVerse||
       group.at(-1).chapter!==span.toChapter||group.at(-1).verse!==span.toVerse)
      throw new Error("Rail segment does not match selected verse coordinates: "+sectionRef);
    groups.push({reference:sectionRef,anchorVerseStart:group[0].reference,
      anchorVerseEnd:group.at(-1).reference,verseCount:group.length,
      text:group.map(v=>v.text).join(" "),reviewStatus:partitions?"RAIL_SPLIT_TRIAL_NOT_ACCEPTED":"SOURCE_REFERENCE_UNMODIFIED"});
  }
  if(at!==verses.length || groups.flatMap(g=>g.text.split(" ")).length!==verses.map(v=>v.text).join(" ").split(" ").length)
    throw new Error("Rail segmentation failed full-text parity "+ref);
  if(groups.map(g=>g.text).join(" ")!==verses.map(v=>v.text).join(" "))
    throw new Error("Rail segmentation changed Scripture "+ref);
  return groups;
}


/**
 * A reading-only abridgment can omit whole verses but must never alter
 * their wording, order, owner, or the underlying canonical selection.
 */
function provisionalReadableSource(ref, verses, beat, getIndex, edition) {
  const option=beat.literaryEconomyOption;
  const decision=option?.readingDecision;
  if(!decision || !option.sourceReferencesUnderReview?.includes(ref))return null;
  if(decision.publicationApproved!==false || decision.editorialLiteraryApproval!==false ||
     decision.originalSourceSelectionPreserved!==true ||
     option.publicationApproved!==false || option.appliedToDefaultReading!==false)
     throw new Error("Unsafe Historia reading-only economy decision for "+beat.id);
  if(decision.decision==="RETAIN_FULL_IN_RESEARCH_READING")return null;
  if(decision.decision!=="USE_SHORTENED_PASSAGES_IN_RESEARCH_READING_ONLY" ||
     !Array.isArray(decision.projectedReferences) || !decision.projectedReferences.length)
     throw new Error("Unknown/empty Historia reading-only decision "+beat.id);
  const units=[],sourceKeys=new Map(verses.map((v,i)=>[v.chapter+":"+v.verse,i]));
  let previous=-1;
  for(const sourceRef of decision.projectedReferences){
    const parsed=parseHistoriaSpan(sourceRef);
    if(parsed.book!==parseHistoriaSpan(ref).book)throw new Error("Abridgment crossed Bible books");
    const cut=actualVerses(parsed,getIndex(parsed.book),edition);
    for(const v of cut){
      const index=sourceKeys.get(v.chapter+":"+v.verse);
      if(index===undefined||index<=previous||verses[index].text!==v.text)
        throw new Error("Abridgment is not a strict unmodified source subsequence: "+sourceRef);
      previous=index;
    }
    units.push({reference:sourceRef,verses:cut,text:cut.map(v=>v.text).join(" ")});
  }
  const included=units.flatMap(u=>u.verses);
  if(!included.length||included.length>=verses.length)
    throw new Error("Reading-only projection must be a real subset for "+ref);
  const includedKeys=new Set(included.map(v=>v.chapter+":"+v.verse));
  return {
    status:"PROVISIONAL_SOURCE_SUBSELECTION_NOT_APPROVED",
    originalReference:ref,sections:units,
    omittedVerseReferences:verses.filter(v=>!includedKeys.has(v.chapter+":"+v.verse)).map(v=>v.reference),
    selectedForPublication:false,editorialLiteraryApproval:false,publicationApproved:false
  };
}

function gapBetween(previous, next) {
  if (!previous || previous.book !== next.book) return null;
  if (next.fromChapter < previous.toChapter ||
     (next.fromChapter === previous.toChapter && next.fromVerse <= previous.toVerse))
    return {kind: "SAME_BOOK_REVERSE_OR_OVERLAP", previous: previous.reference, next: next.reference};
  if (previous.toChapter === next.fromChapter && next.fromVerse > previous.toVerse + 1)
    return {kind: "OMITTED_VERSES", reference: previous.book + " " + previous.toChapter + ":" +
      (previous.toVerse + 1) + "–" + (next.fromVerse - 1)};
  if (next.fromChapter > previous.toChapter + 1)
    return {kind: "INTERVENING_CHAPTERS", reference: previous.book + " " +
      (previous.toChapter + 1) + "–" + (next.fromChapter - 1)};
  return null;
}

/**
 * getWitness(book, edition) must return the existing source-owner witness JSON.
 * Each Scripture segment carries both its literal text and verse-level rail index.
 */
export function assembleHistoriaReading(proof, edition, getWitness) {
  if (!HISTORIA_EDITIONS.includes(edition)) throw new Error("Unsupported Historia witness: " + edition);
  if (!proof?.movements || proof.movements.length !== 37)
    throw new Error("Expected the canonical 37-movement P3 research proof");
  const indexes = new Map();
  const getIndex = book => {
    if (!indexes.has(book)) indexes.set(book, indexWitness(getWitness(book, edition), edition, book));
    return indexes.get(book);
  };
  const movements = proof.movements.map(movement => {
    const segments = [], omittedSourceSeams = [];
    let previous = null;
    const appendReadingTrial = (beat, trial, trialType) => {
      if(trial.accepted!==false || trial.publicationApproved!==false || !Array.isArray(trial.refs))
        throw new Error("Historia research-trial status unsafe: "+beat.id);
      for(const [position, ref] of trial.refs.entries()){
        const parsed=parseHistoriaSpan(ref);
        const gap=gapBetween(previous,parsed);
        if(gap)omittedSourceSeams.push({beforeAnchor:movement.id+":"+beat.id+":trial:"+position,...gap});
        const verses=actualVerses(parsed,getIndex(parsed.book),edition);
        segments.push({
          kind:"SCRIPTURE_READING_TRIAL_NOT_APPROVED",
          anchor:movement.id+":"+beat.id+":trial:"+(position+1),
          ownerUnitId:beat.id,reference:ref,edition,trialType,
          originalCandidateReference:trial.originalHeldReference||trial.sourceReference||null,
          sourceStatus:"UNCOLLATED_SOURCE_WITNESS",verses,
          text:verses.map(v=>v.text).join(" "),
          railSections:railSectionsFor(ref,verses),
          selectedForPublication:false,accepted:false,publicationApproved:false
        });
        previous=parsed;
      }
    };
    for (const beat of movement.beats) {
      if (beat.kind === "EDITORIAL_CONTEXT_NOT_BIBLE") {
        segments.push({
          kind: "EDITORIAL_CONNECTOR_PROPOSAL", anchor: movement.id + ":" + beat.id,
          ownerUnitId: beat.id,
          text: beat.editorialReadingCandidate?.text || beat.explanation,
          sourceReference: beat.sourceReference,
          sourceReferences: beat.editorialReadingCandidate?.sourceReferencesByEdition?.[edition] ||
            beat.editorialReadingCandidate?.sourceReferences || [beat.sourceReference],
          originalDeskText: beat.explanation, editorialCopyStatus: beat.editorialReadingCandidate?.status || "ORIGINAL_DESK_TEXT_NOT_APPROVED",
          editorialSourceLanguage:"en", requiresEditorialLocalization:edition==="crampon-1923",
          editionIndependent: false, accepted: false, publicationApproved: false
        });
        continue;
      }
      if (beat.kind === "SOURCE_BRIDGE_CANDIDATE") {
        if(beat.readthroughTrial){
          if(beat.readthroughTrial.editorialPreface){
            const c=beat.readthroughTrial.editorialPreface;
            if(c.accepted!==false || c.publicationApproved!==false)
              throw new Error("Unsafe research editorial preface "+c.id);
            segments.push({
              kind:"EDITORIAL_CONNECTOR_PROPOSAL",anchor:movement.id+":"+c.id,
              ownerUnitId:beat.id,candidateId:c.id,text:c.text,
              sourceReference:c.sourceReferences.join("; "),sourceReferences:c.sourceReferences,
              additionalCausalSeam:true,originalDeskText:null,editorialCopyStatus:c.status,
              editorialSourceLanguage:"en",requiresEditorialLocalization:edition==="crampon-1923",
              editionIndependent:false,accepted:false,publicationApproved:false
            });
          }
          appendReadingTrial(beat,beat.readthroughTrial,"HELD_BRIDGE_RESEARCH_TRIAL");
        } else {
          segments.push({
            kind: "HELD_SOURCE_CANDIDATE", anchor: movement.id + ":" + beat.id,
            ownerUnitId: beat.id, reference: beat.reference, purpose: beat.purpose || null,
            text: null, selected: false, accepted: false, publicationApproved: false
          });
        }
        continue;
      }
      if (beat.kind !== "SCRIPTURE") throw new Error("Unknown Historia beat kind " + beat.kind);
      if (beat.beforeScriptureConnectorCandidate) {
        const c=beat.beforeScriptureConnectorCandidate;
        if (c.publicationApproved!==false || c.accepted!==false) throw new Error("Prematurely accepted Historia connector "+c.id);
        segments.push({
          kind:"EDITORIAL_CONNECTOR_PROPOSAL",anchor:movement.id+":"+c.id,
          ownerUnitId:beat.id,candidateId:c.id,text:c.text,
          sourceReference:c.sourceReferences.join("; "),sourceReferences:c.sourceReferences,
          additionalCausalSeam:true,originalDeskText:null,editorialCopyStatus:c.status,
          editorialSourceLanguage:"en",requiresEditorialLocalization:edition==="crampon-1923",
          editionIndependent:false,accepted:false,publicationApproved:false
        });
      }
      const references = beat.semanticEditionAlignment?.selectedReferencesByEdition?.[edition] || beat.refs;
      for (const [position, ref] of references.entries()) {
        const parsed = parseHistoriaSpan(ref);
        const gap = gapBetween(previous, parsed);
        if (gap) omittedSourceSeams.push({beforeAnchor: movement.id + ":" + beat.id + ":" + position, ...gap});
        const verses = actualVerses(parsed, getIndex(parsed.book), edition);
        segments.push({
          kind: "SCRIPTURE_EXACT_WITNESS", anchor: movement.id + ":" + beat.id + ":" + (position + 1),
          ownerUnitId: beat.id, scene: beat.scene, reference: ref, edition,
          sourceStatus: "UNCOLLATED_SOURCE_WITNESS", verses,
          text: verses.map(v => v.text).join(" "),
          railSections:railSectionsFor(ref,verses,beat.railSegmentationTrial?.byOriginalReference?.[ref]),
          readableResearchProjection:provisionalReadableSource(ref,verses,beat,getIndex,edition),
          railSubdivisionAccepted:false,accepted: false, publicationApproved: false
        });
        previous = parsed;
      }
      if(beat.afterSelectedReadthroughTrial)appendReadingTrial(beat,beat.afterSelectedReadthroughTrial,"ADDITIONAL_CAUSAL_READING_TRIAL");
    }
    return {
      id: movement.id, sequence: movement.sequence, title: movement.title,
      originalResearchChapterIds: movement.originalResearchChapterIds,
      accepted: false, publicationApproved: false, segments, omittedSourceSeams
    };
  });
  const segments = movements.flatMap(m => m.segments);
  return {
    schema: "ao.historia.p3.derived-annotated-reading.v1",
    stage: "RESEARCH_TEXT_ASSEMBLY_NOT_APPROVED",
    sourceOwner: "data/research/historia-salutis-v18-continuous-reading-proof.v1.json",
    edition, witnessStatus: "UNCOLLATED_SOURCE_WITNESS", movements,
    totals: {
      movements: movements.length,
      scriptureBeats: new Set(segments.filter(s => s.kind === "SCRIPTURE_EXACT_WITNESS").map(s => s.ownerUnitId)).size,
      scriptureSpans: segments.filter(s => s.kind === "SCRIPTURE_EXACT_WITNESS").length,
      editorialConnectorProposals: segments.filter(s => s.kind === "EDITORIAL_CONNECTOR_PROPOSAL").length,
      originalContextUnits: segments.filter(s => s.kind === "EDITORIAL_CONNECTOR_PROPOSAL" && !s.additionalCausalSeam).length,
      additionalCausalSeams: segments.filter(s => s.kind === "EDITORIAL_CONNECTOR_PROPOSAL" && s.additionalCausalSeam).length,
      heldSourceCandidates: segments.filter(s=>s.kind==="HELD_SOURCE_CANDIDATE").length+
        new Set(segments.filter(s=>s.kind==="SCRIPTURE_READING_TRIAL_NOT_APPROVED"&&s.trialType==="HELD_BRIDGE_RESEARCH_TRIAL").map(s=>s.ownerUnitId)).size,
      stillUnselectedBridgeCandidates: segments.filter(s=>s.kind==="HELD_SOURCE_CANDIDATE").length,
      bridgeReadingTrials: new Set(segments.filter(s=>s.kind==="SCRIPTURE_READING_TRIAL_NOT_APPROVED"&&s.trialType==="HELD_BRIDGE_RESEARCH_TRIAL").map(s=>s.ownerUnitId)).size,
      readingTrialSpans: segments.filter(s=>s.kind==="SCRIPTURE_READING_TRIAL_NOT_APPROVED").length,
      exactVerseRailSections: segments.filter(s=>s.railSections).reduce((n,s)=>n+s.railSections.length,0),
      sourceSpansWithProposedRailSplits: segments.filter(s=>s.kind==="SCRIPTURE_EXACT_WITNESS"&&s.railSections.length>1).length,
      readableResearchProjectedSourceSpans:segments.filter(s=>s.readableResearchProjection).length,
      readableResearchSourceVerseOmissions:segments.filter(s=>s.readableResearchProjection).reduce((n,s)=>n+s.readableResearchProjection.omittedVerseReferences.length,0),
      trialVerseEntries: segments.filter(s=>s.kind==="SCRIPTURE_READING_TRIAL_NOT_APPROVED").reduce((n,s)=>n+s.verses.length,0),
      published: 0
    }
  };
}

function asText(text) {
  return String(text || "").replace(/\r\n/g, "\n").trim();
}

/** Research manuscript, deliberately labels every editor-written connector and held source. */
export function historiaAssemblyMarkdown(assembly) {
  const lines = [
    "# Historia Salutis — continuous annotated reading",
    "",
    "**RESEARCH TEXT PROOF — NOT APPROVED FOR PUBLICATION**",
    "",
    "Witness: " + assembly.edition + " (uncollated; verify against the intended printed edition).",
    "All Scripture wording below comes directly from that edition's existing source witness.",
    "Each reference preceding a paragraph is its future vertical-rail anchor; the complete per-verse rail is in the machine assembly.",
    "Italic connectors are editorial proposals, not Bible quotations. Trial Scripture is exact witness text provisionally inserted for research reading ONLY; selection, printed collation, literary acceptance and publication remain unapproved.",
    ...(assembly.edition==="crampon-1923"?["ATTENTION: Les raccords éditoriaux sont encore des brouillons en anglais et doivent être rédigés et vérifiés en français. Le texte biblique est tiré du témoin Crampon."]:[]),
    ""
  ];
  for (const movement of assembly.movements) {
    lines.push("## " + String(movement.sequence).padStart(2, "0") + " · " + movement.title, "");
    for (const s of movement.segments) {
      if (s.kind === "SCRIPTURE_EXACT_WITNESS") {
        lines.push("**⟦" + s.reference + "⟧**", "", asText(s.text), "");
      } else if (s.kind === "SCRIPTURE_READING_TRIAL_NOT_APPROVED") {
        lines.push("**⟦TRIAL SCRIPTURE · " + s.reference + " · NOT APPROVED⟧**", "", asText(s.text), "");
      } else if (s.kind === "EDITORIAL_CONNECTOR_PROPOSAL") {
        lines.push("*⟦Editorial connector · source: " + (s.sourceReferences?.join("; ") || s.sourceReference) + " · NOT APPROVED⟧*", "",
          "*" + asText(s.text) + "*", "");
      } else {
        lines.push("*⟦HELD source bridge: " + s.reference + " · not selected or approved⟧*", "");
      }
    }
    if (movement.omittedSourceSeams.length) {
      lines.push("<details><summary>Unselected same-book source seams (research audit)</summary>", "");
      for (const gap of movement.omittedSourceSeams) {
        lines.push("- " + gap.kind + ": " + (gap.reference || gap.previous + " → " + gap.next));
      }
      lines.push("", "</details>", "");
    }
  }
  return lines.join("\n") + "\n";
}

/**
 * Calm, source-traceable continuous research reading derived from the SAME
 * authoritative v18 proof. Only this projection considers the two provisional
 * economical sub-selections; the annotated source edition remains untouched.
 *
 * Unapproved source bridges are not injected silently: their trial passages
 * are accounted for in each movement's collapsed research/source audit.
 */
export function historiaReadableMarkdown(assembly) {
  if (assembly.edition==="crampon-1923")
    throw new Error("Do not render a fully French clean Historia reader while editorial connectors remain untranslated English drafts");
  if (!["dr-challoner","cpdv-2009"].includes(assembly.edition))
    throw new Error("Unsupported clean Historia reader edition "+assembly.edition);
  const lines=[
    "# Historia Salutis — continuous reading · research preview",
    "",
    "**UNAPPROVED RESEARCH READING — NOT FOR PUBLICATION**",
    "",
    "Scripture is quoted verbatim from the existing uncollated "+assembly.edition+" witness. ",
    "Italic passages are *editorial connecting prose*, never Scripture. Their exact supporting source coordinates are recorded in collapsed movement notes.",
    "This provisional reading contains unapproved Scripture bridges; seven optional bridge candidates are not inserted. Two shorter verse selections affect this reading preview only: the canonical P3 proof remains intact.",
    "",
  ];
  for(const movement of assembly.movements){
    lines.push("## "+String(movement.sequence).padStart(2,"0")+" · "+movement.title,"");
    const notes=[];
    let e=0;
    for(const segment of movement.segments){
      if(segment.kind==="EDITORIAL_CONNECTOR_PROPOSAL"){
        e++;
        lines.push("*"+asText(segment.text)+"*  [e"+e+"]","");
        notes.push("- e"+e+" — **Editorial, not Scripture** · "+segment.sourceReferences.join("; ")+
          " · approval pending");
      }else if(segment.kind==="SCRIPTURE_EXACT_WITNESS"||
               segment.kind==="SCRIPTURE_READING_TRIAL_NOT_APPROVED"){
        const subs=segment.readableResearchProjection?.sections||[{
          reference:segment.reference,text:segment.text
        }];
        for(const a of subs){
          lines.push("*"+a.reference+"*","",asText(a.text),"");
        }
        if(segment.readableResearchProjection){
          const r=segment.readableResearchProjection;
          notes.push("- **Reading-only abridgment** · original "+r.originalReference+
            " · shortened to "+r.sections.map(u=>u.reference).join("; ")+
            " · omitted whole verses: "+r.omittedVerseReferences.join(", ")+
            " · canonical selected source unchanged");
        }
        if(segment.kind==="SCRIPTURE_READING_TRIAL_NOT_APPROVED"){
          notes.push("- **Unapproved Scripture bridge** · "+segment.reference+" · witnessed but not approved");
        }
      }else if(segment.kind==="HELD_SOURCE_CANDIDATE"){
        notes.push("- **Held, not inserted** · "+segment.reference);
      }else throw new Error("Unknown readable segment "+segment.kind);
    }
    if(notes.length){
      lines.push("<details>","<summary>References and editorial audit · "+notes.length+" notes</summary>","",
        ...notes,"","</details>","");
    }
  }
  return lines.join("\n")+"\n";
}
