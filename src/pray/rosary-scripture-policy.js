/**
 * Rosary Scripture display policy — editorial safety gate, 9 October 2026.
 * A donor has 200 mixed-length Douay–Rheims excerpts, some split in mid-clause,
 * and a separate French Crampon cue set. Neither set has passage-by-passage
 * certification. Do not publish those extracts as 200 verbatim quotations.
 *
 * This file does NOT change the 20 mystery definitions, 5-decade player,
 * bead counts, canonical prayer words, the historical donor, or commentary.
 * The mystery opening offers a useful full-passage reference and an explicit
 * typology distinction. Exact word-for-word quotations may be reintroduced
 * only from a verified bilingual passage registry.
 */
export const ROSARY_SCRIPTURE_REFERENCE_V1 = Object.freeze({
  "joy1": {
    "reference": "Luke 1:26-38",
    "type": "narrative"
  },
  "joy2": {
    "reference": "Luke 1:39-56",
    "type": "narrative"
  },
  "joy3": {
    "reference": "Luke 2:1-20",
    "type": "narrative"
  },
  "joy4": {
    "reference": "Luke 2:22-38",
    "type": "narrative"
  },
  "joy5": {
    "reference": "Luke 2:41-52",
    "type": "narrative"
  },
  "lum1": {
    "reference": "Matthew 3:13-17",
    "type": "narrative"
  },
  "lum2": {
    "reference": "John 2:1-11",
    "type": "narrative"
  },
  "lum3": {
    "reference": "Mark 1:14-15",
    "type": "narrative"
  },
  "lum4": {
    "reference": "Matthew 17:1-9",
    "type": "narrative"
  },
  "lum5": {
    "reference": "Luke 22:14-20",
    "type": "narrative"
  },
  "sor1": {
    "reference": "Matthew 26:36-46",
    "type": "narrative"
  },
  "sor2": {
    "reference": "John 19:1",
    "type": "narrative"
  },
  "sor3": {
    "reference": "Matthew 27:27-31",
    "type": "narrative"
  },
  "sor4": {
    "reference": "Luke 23:26-33",
    "type": "narrative"
  },
  "sor5": {
    "reference": "John 19:25-30",
    "type": "narrative"
  },
  "glo1": {
    "reference": "John 20:1-18",
    "type": "narrative"
  },
  "glo2": {
    "reference": "Acts 1:3-11",
    "type": "narrative"
  },
  "glo3": {
    "reference": "Acts 2:1-13",
    "type": "narrative"
  },
  "glo4": {
    "reference": "Psalm 131:8",
    "type": "traditional_typology"
  },
  "glo5": {
    "reference": "Revelation 12:1",
    "type": "traditional_typology"
  }
});

export const ROSARY_SCRIPTURE_POLICY_V1 = Object.freeze({
  version:"1.0.0",
  donorExcerptCount:200,
  publicPerBeadExcerptStatus:"WITHHELD_UNTIL_PASSAGE_CERTIFICATION",
  mysteryReferenceCount:20,
  readingMode:"FULL_PASSAGE_REFERENCE_AT_MYSTERY_OPENING",
  editorialRules:Object.freeze([
    "Never label sentence fragments as verbatim Scripture quotations.",
    "Never fall back to English whilst labelling an excerpt Crampon 1923 French.",
    "Never imply the Bible directly narrates Mary's Assumption or Coronation.",
    "Retain the historical 200 cues for source audit without showing them as certified.",
    "A mystery context link is not evidence that an excerpt has been certified."
  ])
});

export function rosaryScripturePassage(id){
  const item=ROSARY_SCRIPTURE_REFERENCE_V1[id];
  if(!item)return null;
  return Object.freeze({
    ...item,
    // DRA is public-domain Douay–Rheims. The source link shows the complete
    // passage, not an invented or truncated quotation in either language.
    href:"https://www.biblegateway.com/passage/?search="+encodeURIComponent(item.reference)+"&version=DRA"
  });
}

export function applyRosaryScripturePolicy(root,info,{french=false,guided=false}={}){
  if(!root?.querySelectorAll || !info?.step)return false;
  const shell=root.querySelector(".pbShell");
  if(!shell)return false;
  shell.dataset.aoRosaryScripturePolicy="context-first-v1";
  // The legacy player renders each cue as a supposedly certified verse.
  // Do not change its underlying state or source records: withhold the UI
  // until all original edition/reference mappings receive editorial review.
  for(const el of root.querySelectorAll(".lab-prayer-sheet .lab-scripture-cue,.lab-prayer-sheet .lab-scripture-actions")){
    el.remove();
  }
  const contemplation=root.querySelector(".lab-contemplation");
  if(!contemplation || info.step.kind!=="mystery")return true;
  // The old mystery-opening button only read the first bead’s narrow verse.
  // Replace it with a single complete-passage link in Guided mode.
  contemplation.querySelector(".lab-scripture-actions")?.remove();
  const id=String(info.step.id||"");
  const passage=rosaryScripturePassage(id);
  if(!passage)return false; // Fail closed if the mystery is not in the source registry.
  let section=contemplation.querySelector("[data-ao-rosary-scripture-opening]");
  if(!section){
    section=root.ownerDocument.createElement("section");
    section.dataset.aoRosaryScriptureOpening=id;
    section.className="aoRosaryScriptureOpening";
    const anchor=contemplation.querySelector(".principal");
    if(anchor)anchor.insertAdjacentElement("afterend",section);
    else contemplation.prepend(section);
  }
  section.replaceChildren();
  const caption=root.ownerDocument.createElement("small");
  caption.textContent=french
    ? (guided?"ÉCRITURE · PASSAGE COMPLET":"RÉFÉRENCE BIBLIQUE")
    : (guided?"SCRIPTURE · COMPLETE PASSAGE":"SCRIPTURE REFERENCE");
  const line=root.ownerDocument.createElement("p");
  line.textContent=passage.reference;
  section.append(caption,line);
  if(passage.type==="traditional_typology"){
    const note=root.ownerDocument.createElement("p");
    note.className="aoRosaryTypologyNote";
    note.textContent=french
      ?"Figure biblique appliquée à Notre-Dame dans la tradition de l’Église ; ce passage ne raconte pas directement ce mystère."
      :"Biblical figure traditionally applied to Our Lady; this passage is not a direct historical account of the mystery.";
    section.appendChild(note);
  }
  if(guided){
    const link=root.ownerDocument.createElement("a");
    link.href=passage.href;
    link.target="_blank";
    link.rel="noopener noreferrer";
    link.textContent=french?"Lire dans la Bible · Douay–Rheims (anglais) ↗":"Read in the Douay–Rheims Bible ↗";
    section.appendChild(link);
  }
  return true;
}
