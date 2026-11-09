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

function sourcedLanguage(value,language,englishKeys,frenchKeys){
  const keys=language==="fr"?frenchKeys:englishKeys;
  for(const key of keys){
    const hit=value?.[key];
    if(typeof hit==="string"&&hit.trim())return hit.trim();
  }
  // A missing French translation must never be substituted with English.
  // The paired paragraph remains visibly Latin until French is sourced.
  return null;
}
function readerLanguage(value){
  return String(value??"en").toLowerCase().startsWith("fr")?"fr":"en";
}

function textParagraph({id,latin,vernacular=null,kind="TEXT"}){
  const hasTranslation=Boolean(vernacular);
  return freeze({
    id,
    kind,
    primary:hasTranslation ? String(vernacular) : String(latin),
    secondary:null,
    alternate:hasTranslation ? String(latin) : null,
    replaceOnToggle:hasTranslation,
    active:false,
    sourceCueIds:freeze([]),
  });
}

export function resolvePrayerOverPeopleInsertion(resolvedMass,{language="en"}={}){
  const locale=readerLanguage(language);
  const manifest=manifestFromResolvedMass(resolvedMass);
  const raw=manifest?.orations?.prayerOverPeople??null;
  if(!raw)return null;

  const oration=assertResolvedOration(raw,"orations.prayerOverPeople");
  const delta=assertPostcommunionExitOwnership(
    compilePostcommunionExitDelta({prayerOverPeoplePresent:true})
  );

  const body=sourcedLanguage(oration,locale,
    ["bodyEn","bodyEnglish","translation","translationEn","en"],
    ["bodyFr","bodyFrench","translationFr","fr"]);
  const conclusion=sourcedLanguage(oration,locale,
    ["conclusionEn","conclusionEnglish"],
    ["conclusionFr","conclusionFrench"]);
  const paragraphs=freeze([
    textParagraph({
      id:"R17.POP.010.INVITATION",
      latin:"Orémus. Humiliáte cápita vestra Deo.",
      // French formula verified against the original Francais/Tempora/Quad1-5
      // [Super populum] source. No machine-authored wording.
      vernacular:locale==="fr"?"Prions. Humiliez vos têtes devant Dieu.":
        "Let us pray. Bow your heads to God.",
    }),
    textParagraph({
      id:"R17.POP.010.BODY",
      latin:oration.bodyLat,
      vernacular:body,
    }),
    textParagraph({
      id:"R17.POP.010.CONCLUSION",
      latin:oration.conclusionLat,
      vernacular:conclusion,
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

export function augmentReaderCardsWithPrayerOverPeople(cards,resolvedMass,{language="en"}={}){
  if(!Array.isArray(cards))throw new TypeError("Reader cards required");
  const insertion=resolvePrayerOverPeopleInsertion(resolvedMass,{language});
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
