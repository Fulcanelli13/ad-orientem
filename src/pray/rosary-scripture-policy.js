import { ROSARY_MYSTERY_CONTEXT_V1 } from "./rosary-mystery-context.v1.js";
import { ROSARY_GUIDED_BEAD_MEDITATIONS_V1 } from "./rosary-guided-bead-meditations.v1.js";

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
    "reference": "Mark 1:14-20",
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
    "reference": "John 19:1-3",
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
    "reference": "Luke 1:46-55",
    "type": "traditional_typology"
  },
  "glo5": {
    "reference": "Revelation 12:1",
    "type": "traditional_typology"
  }
});

export const ROSARY_SCRIPTURE_POLICY_V1 = Object.freeze({
  version:"1.1.0",
  donorExcerptCount:200,
  publicPerBeadExcerptStatus:"WITHHELD_UNTIL_PASSAGE_CERTIFICATION",
  mysteryReferenceCount:20,
  readingMode:"SOURCE_LINKED_BILINGUAL_MYSTERY_CONTEXT",
  editorialRules:Object.freeze([
    "Never label sentence fragments as verbatim Scripture quotations.",
    "Never fall back to English whilst labelling an excerpt Crampon 1923 French.",
    "Never imply the Bible directly narrates Mary's Assumption or Coronation.",
    "Retain the historical 200 cues for source audit without showing them as certified.",
    "A mystery context link is not evidence that an excerpt has been certified."
  ])
});

const CATHOLIC_FRENCH_BOOKS=Object.freeze(new Set(["Luc","Matthieu","Jean","Marc","Actes","Apocalypse"]));
export function rosaryScripturePassage(id){
  const item=ROSARY_SCRIPTURE_REFERENCE_V1[id];
  const context=ROSARY_MYSTERY_CONTEXT_V1[id];
  if(!item||!context||context.reference!==item.reference||
     !CATHOLIC_FRENCH_BOOKS.has(context.bookFr))return null;
  return Object.freeze({
    ...item,
    context,
    // Verbatim wording lives in these Catholic editions, never in the
    // editorial summaries, which are expressly NOT Scripture quotations.
    href:"https://www.biblegateway.com/passage/?search="+encodeURIComponent(item.reference)+"&version=DRA",
    hrefFr:"https://fr.wikisource.org/wiki/Bible_Crampon_1923/"+encodeURIComponent(context.bookFr)+"#"+item.reference.split(" ").pop().split(":")[0],
    doctrinalHref:id==="glo4"
      ?"https://www.vatican.va/content/pius-xii/en/apost_constitutions/documents/hf_p-xii_apc_19501101_munificentissimus-deus.html"
      :id==="glo5"
      ?"https://www.vatican.va/content/pius-xii/en/encyclicals/documents/hf_p-xii_enc_11101954_ad-caeli-reginam.html"
      :null
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
  // Original editorial contemplations, never represented as Bible quotations.
  // Canonical Rosary player still owns bead count, prayer text and progression.
  for(const old of root.querySelectorAll("[data-ao-rosary-guided-bead]"))old.remove();
  if(guided&&info.step.cue&&Number.isInteger(info.mi)){
    const family={joyful:"joy",sorrowful:"sor",glorious:"glo",luminous:"lum"}[String(info.set||"")];
    const id=family+String(info.mi+1),bead=Number(info.step.bead||0);
    const moment=ROSARY_GUIDED_BEAD_MEDITATIONS_V1[id]?.[bead-1];
    const prayer=root.querySelector(".lab-prayer-sheet");
    if(prayer&&moment&&moment.bead===bead){
      const note=root.ownerDocument.createElement("p");
      note.className="aoRosaryGuidedBeadMeditation";
      note.dataset.aoRosaryGuidedBead=id+".b"+bead;
      note.dataset.aoRosaryContext="editorial-meditation";
      note.lang=french?"fr":"en";
      note.textContent=moment[french?"fr":"en"];
      prayer.appendChild(note);
    }
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
    ? (guided?"ÉCRITURE · LECTURE DU MYSTÈRE":"RÉFÉRENCE BIBLIQUE")
    : (guided?"SCRIPTURE · MYSTERY READING":"SCRIPTURE REFERENCE");
  const line=root.ownerDocument.createElement("p");
  line.textContent=passage.reference;
  section.append(caption,line);
  if(passage.type==="traditional_typology"){
    const note=root.ownerDocument.createElement("p");
    note.className="aoRosaryTypologyNote";
    note.textContent=french
      ?(id==="glo4"
        ?"L’Assomption n’est pas racontée dans ce passage : le Magnificat éclaire la glorification de Marie."
        :"Vision symbolique de la Femme : elle concerne aussi le peuple de Dieu et reçoit une interprétation mariale traditionnelle.")
      :(id==="glo4"
        ?"The Assumption is not narrated here: the Magnificat helps contemplate Mary's glorification."
        :"A symbolic vision of the Woman, also concerning God's people and traditionally interpreted in a Marian sense.");
    section.appendChild(note);
  }
  if(guided){
    const summary=root.ownerDocument.createElement("p");
    summary.className="aoRosaryScriptureSummary";
    summary.dataset.aoRosaryContext="editorial-summary";
    summary.textContent=passage.context.summary[french?"fr":"en"];
    section.appendChild(summary);
    const intention=root.ownerDocument.createElement("p");
    intention.className="aoRosaryPrayerIntention";
    intention.textContent=passage.context.intention[french?"fr":"en"];
    section.appendChild(intention);
    const witness=root.ownerDocument.createElement("small");
    witness.className="aoRosaryEditionLabel";
    witness.textContent=french
      ?"MÉDITATION RÉDIGÉE · PAS UNE CITATION BIBLIQUE"
      :"EDITORIAL MEDITATION · NOT A SCRIPTURE QUOTATION";
    section.appendChild(witness);
    const link=root.ownerDocument.createElement("a");
    link.href=french?passage.hrefFr:passage.href;
    link.target="_blank";
    link.rel="noopener noreferrer";
    link.dataset.aoRosaryScriptureEdition=french?"crampon-1923":"douay-rheims-challoner";
    link.textContent=french?"Lire le passage · Bible Crampon 1923 ↗":"Read the passage · Douay–Rheims ↗";
    section.appendChild(link);
    if(passage.doctrinalHref){
      const doctrine=root.ownerDocument.createElement("a");
      doctrine.href=passage.doctrinalHref;
      doctrine.target="_blank";
      doctrine.rel="noopener noreferrer";
      doctrine.dataset.aoRosaryDoctrinalWitness=id;
      doctrine.textContent=french
        ?"Enseignement de l’Église · Pie XII ↗"
        :"Church teaching · Pius XII ↗";
      section.appendChild(doctrine);
    }
  }
  return true;
}
