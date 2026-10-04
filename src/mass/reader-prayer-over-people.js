// R30 Prayer over the People reader composition.
// The day-specific oration is source-owned by Proper Resolver 2.0.
// Fixed invitation/response text is the 1962 ordinary formula.
// This module changes presentation only; postcommunion-exit.js owns route timing.

import { assertResolvedOration } from "./proper-contracts.js";
import { compilePostcommunionExitDelta, assertPostcommunionExitOwnership } from "./postcommunion-exit.js";

function freeze(value){return Object.freeze(value)}

function properData(proper){
  return proper?.data??proper??null;
}

function manifestFromResolvedMass(resolvedMass){
  const proper=properData(resolvedMass?.proper);
  return proper?.schema==="ao-proper-manifest-v2" ? proper : null;
}

function english(value,...keys){
  for(const key of keys){
    const hit=value?.[key];
    if(typeof hit==="string"&&hit.trim())return hit.trim();
  }
  return null;
}

function textParagraph({id,latin,vernacular=null,kind="TEXT"}){
  const hasEnglish=Boolean(vernacular);
  return freeze({
    id,
    kind,
    primary:hasEnglish ? String(vernacular) : String(latin),
    secondary:null,
    alternate:hasEnglish ? String(latin) : null,
    replaceOnToggle:hasEnglish,
    active:false,
    sourceCueIds:freeze([]),
  });
}

export function resolvePrayerOverPeopleInsertion(resolvedMass){
  const manifest=manifestFromResolvedMass(resolvedMass);
  const raw=manifest?.orations?.prayerOverPeople??null;
  if(!raw)return null;

  const oration=assertResolvedOration(raw,"orations.prayerOverPeople");
  const delta=assertPostcommunionExitOwnership(
    compilePostcommunionExitDelta({prayerOverPeoplePresent:true})
  );

  const bodyEn=english(oration,"bodyEn","bodyEnglish","translation","translationEn","en");
  const conclusionEn=english(oration,"conclusionEn","conclusionEnglish");
  const paragraphs=freeze([
    textParagraph({
      id:"R17.POP.010.INVITATION",
      latin:"Orémus. Humiliáte cápita vestra Deo.",
      vernacular:"Let us pray. Bow your heads to God.",
    }),
    textParagraph({
      id:"R17.POP.010.BODY",
      latin:oration.bodyLat,
      vernacular:bodyEn,
    }),
    textParagraph({
      id:"R17.POP.010.CONCLUSION",
      latin:oration.conclusionLat,
      vernacular:conclusionEn,
    }),
    textParagraph({
      id:"R17.POP.010.AMEN",
      latin:"℟. Amen.",
      vernacular:"℟. Amen.",
      kind:"RESPONSE",
    }),
  ]);

  return freeze({
    schema:"ao-r30-prayer-over-people-reader-insertion-v1",
    owner:"PROPER_MANIFEST_V2",
    sourceRef:oration.sourceRef,
    orationId:oration.id,
    paragraphs,
    postcommunionExit:delta,
    guarantees:freeze([
      "PRAYER_AFTER_POSTCOMMUNION_BEFORE_FINAL_DOMINUS_VOBISCUM",
      "C0256_BASE_EXIT_SUPPRESSED",
      "DEFERRED_EXIT_OWNS_TURN_TO_PEOPLE",
      "NO_EXTRA_READER_CARD",
    ]),
  });
}

export function augmentReaderCardsWithPrayerOverPeople(cards,resolvedMass){
  if(!Array.isArray(cards))throw new TypeError("Reader cards required");
  const insertion=resolvePrayerOverPeopleInsertion(resolvedMass);
  if(!insertion)return freeze([...cards]);

  const index=cards.findIndex(card=>Number(card?.sequence)===27);
  if(index<0)throw new Error("Postcommunion card AO.CARD.027 unavailable for Prayer over the People");

  const card=cards[index];
  if(card.sectionId!=="AO.CARD.027")throw new Error("Prayer over the People target card identity changed");
  if(card.paragraphs.some(p=>String(p.id).startsWith("R17.POP.010"))){
    throw new Error("Prayer over the People was duplicated");
  }

  const next=cards.map((value,i)=>i===index ? freeze({
    ...value,
    paragraphs:freeze([...value.paragraphs,...insertion.paragraphs]),
    prayerOverPeople:insertion,
    provenance:freeze({
      ...(value.provenance??{}),
      prayerOverPeople:"PROPER_MANIFEST_V2",
      prayerOverPeopleSourceRef:insertion.sourceRef,
    }),
  }) : value);

  return freeze(next);
}
