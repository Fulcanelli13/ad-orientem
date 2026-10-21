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
    for (const beat of movement.beats) {
      if (beat.kind === "EDITORIAL_CONTEXT_NOT_BIBLE") {
        segments.push({
          kind: "EDITORIAL_CONNECTOR_PROPOSAL", anchor: movement.id + ":" + beat.id,
          ownerUnitId: beat.id, text: beat.explanation, sourceReference: beat.sourceReference,
          editionIndependent: true, accepted: false, publicationApproved: false
        });
        continue;
      }
      if (beat.kind === "SOURCE_BRIDGE_CANDIDATE") {
        segments.push({
          kind: "HELD_SOURCE_CANDIDATE", anchor: movement.id + ":" + beat.id,
          ownerUnitId: beat.id, reference: beat.reference, purpose: beat.purpose || null,
          text: null, selected: false, accepted: false, publicationApproved: false
        });
        continue;
      }
      if (beat.kind !== "SCRIPTURE") throw new Error("Unknown Historia beat kind " + beat.kind);
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
          accepted: false, publicationApproved: false
        });
        previous = parsed;
      }
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
      heldSourceCandidates: segments.filter(s => s.kind === "HELD_SOURCE_CANDIDATE").length,
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
    "Italic connectors are editorial proposals, not Bible quotations. Held passages are visibly unresolved and never inserted as Scripture.",
    ""
  ];
  for (const movement of assembly.movements) {
    lines.push("## " + String(movement.sequence).padStart(2, "0") + " · " + movement.title, "");
    for (const s of movement.segments) {
      if (s.kind === "SCRIPTURE_EXACT_WITNESS") {
        lines.push("**⟦" + s.reference + "⟧**", "", asText(s.text), "");
      } else if (s.kind === "EDITORIAL_CONNECTOR_PROPOSAL") {
        lines.push("*⟦Editorial connector · source: " + s.sourceReference + " · NOT APPROVED⟧*", "",
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
