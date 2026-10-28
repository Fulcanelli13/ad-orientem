import { projectResolvedReaderText } from "./reader-projection.js";
import { composeProperReaderParagraphs } from "./proper-reader-composition.js";
import { composeOrdinaryReaderParagraphs } from "./ordinary-reader-composition.js";
import { applyCanonicalTextCorrection } from "./canonical-text-corrections.js";
import { resolveOrdinarySpeaker, correctSungPreparatoryAmen, applySungSpeakerPrefix } from "./reader-speaker-roles.js";

const EXPECTED = Object.freeze({
  LOW:Object.freeze({
    rawSha256:"2ed36ea25b00d515a9f4a6edd1e02da274ebb92c082ecaea4dfc73feade03044",
    priestEvents:275,
  }),
  SUNG:Object.freeze({
    rawSha256:"050ce4b65918890a252078c9942f1dde282d2494dabe0e522bb842c03be20b28",
    priestEvents:279,
  }),
});

function formFamily(form){
  const raw=String(form??"").toUpperCase();
  return raw==="LOW" ? "LOW" : "SUNG";
}

function macroId(sequence){
  return "AO.SM.M"+String(sequence).padStart(2,"0");
}

// PUBLIC_TEXT is not universally a chant: at the foot of the altar, for
// example, prayers may be spoken. Only these source-owned public prayers
// are explicitly chanted in the certified sung form, in addition to all
// SCHOLA_PUBLIC units. Ordinary Versicles/Responses keep their own policy.
// Source-identified *public invitations* are navigational calls to the
// faithful, not long private prayers. Render Latin first with the exact
// existing EN/FR translation directly beneath. Never infer a new liturgical
// event or apply this policy to every PUBLIC_TEXT clock (Psalm, Canon, etc.).
// The other public versicles and responses already have their own bilingual
// source-speaker policy, including C0036 (first Orémus).
export const LIVE_LATIN_FIRST_INVITATION_CUES=Object.freeze([
  "AO.SM.C0072", // Orémus before the Collect
  "AO.SM.C0108", // Orémus at the Offertory
  "AO.SM.C0208", // Orémus / Præceptis salutaribus
  "AO.SM.C0253", // Orémus before Postcommunion
  "AO.SM.C0084", // Gospel introduction: Sequentia sancti Evangelii
  "AO.SM.C0130", // Orate, fratres
  "AO.SM.C0135", // Per omnia saecula saeculorum before Preface
  "AO.SM.C0242", // Ecce Agnus Dei before Communion
  "AO.SM.C0269", // Last Gospel proclamation
]);
const LIVE_INVITATION_SET=new Set(LIVE_LATIN_FIRST_INVITATION_CUES);

const REQUIEM_FOOT_PSALM_CUES=Object.freeze(
 Array.from({length:10},(_,i)=>"AO.SM.C"+String(i+4).padStart(4,"0"))
);
const REQUIEM_LAVABO_DOXOLOGY_CUES=Object.freeze(["AO.SM.C0126","AO.SM.C0127"]);

const SUNG_PUBLIC_PRAYER_BLOCKS=new Set([
  "AO.SM.B016", // Gloria intonation
  "AO.SM.B027", // Credo intonation
  "AO.SM.B062", // Pater noster introduction
  "AO.SM.B063", // Pater noster
]);

function unitKind(unit){
  const latin=String(unit?.latin??"").trim();
  const clock=String(unit?.clock??"").toUpperCase();
  if(latin.startsWith("℟") || latin.startsWith("R.") || clock.includes("RESPONSE")) return "RESPONSE";
  if(latin.startsWith("℣") || latin.startsWith("V.")) return "VERSICLE";
  return "TEXT";
}

function ready(value){
  return ["READY","CACHED"].includes(String(value??"").toUpperCase());
}

export function validateReaderTextCorpus(corpus){
  if(!corpus || typeof corpus!=="object") throw new TypeError("Reader text corpus required");
  if(corpus.schema!=="ao-reader-text-corpus-v1") throw new Error("Unexpected reader text corpus schema");
  const family=formFamily(corpus.form);
  const expected=EXPECTED[family];
  if(corpus.source?.rawSha256!==expected.rawSha256) throw new Error(family+" reader corpus donor hash changed");
  if(corpus.source?.canonicalMacros!==30 || corpus.macros?.length!==30) throw new Error(family+" reader corpus must contain 30 macros");
  if(corpus.source?.canonicalBlocks!==96 || corpus.blocks?.length!==96) throw new Error(family+" reader corpus must contain 96 blocks");
  if(corpus.source?.canonicalPriestEvents!==expected.priestEvents) throw new Error(family+" reader corpus priest-event denominator changed");

  const blockIds=new Set();
  const cueIds=new Set();
  for(const block of corpus.blocks){
    if(blockIds.has(block.Block_ID)) throw new Error("Duplicate block id "+block.Block_ID);
    blockIds.add(block.Block_ID);
    if(!/^AO\.SM\.M\d{2}$/.test(String(block.Macro_ID??""))) throw new Error(block.Block_ID+": invalid Macro_ID");
    for(const unit of block.units??[]){
      if(cueIds.has(unit.cue_id)) throw new Error("Duplicate cue id "+unit.cue_id);
      cueIds.add(unit.cue_id);
      if(block.Proper_Slot){
        if(unit.latin!==null || unit.english!==null) {
          throw new Error(block.Block_ID+": date-specific Proper text leaked into modular corpus");
        }
        if(unit.proper_slot!==block.Proper_Slot) throw new Error(block.Block_ID+": Proper slot cue binding changed");
      }
    }
  }
  return Object.freeze({
    family,
    macros:corpus.macros.length,
    blocks:corpus.blocks.length,
    cues:cueIds.size,
    properBlocks:(corpus.properBlocks??[]).length,
    rawSha256:corpus.source.rawSha256,
  });
}

export function selectReaderTextCorpus({form,lowCorpus,sungCorpus}={}){
  const family=formFamily(form);
  const corpus=family==="LOW" ? lowCorpus : sungCorpus;
  const audit=validateReaderTextCorpus(corpus);
  return Object.freeze({family,corpus,audit});
}

function languageKey(language){
  return String(language??"en").toLowerCase().startsWith("fr") ? "fr" : "en";
}

function rolePrefix(latin){
  const match=String(latin??"").trim().match(/^(℣\.|℟\.|[VRSMD]\.)\s*/u);
  return match?.[1] ?? "";
}

function validateFrenchOrdinary(frenchOrdinary){
  if(!frenchOrdinary || frenchOrdinary.schema!=="ao-reader-french-ordinary-v1") {
    throw new Error("French Ordinary reader corpus required for French Mass");
  }
  if(frenchOrdinary.source?.commit!=="126a07f91ede04664108abb6fb20ace3f4de14b9") {
    throw new Error("French Ordinary source pin changed");
  }
  if(!frenchOrdinary.byCue || typeof frenchOrdinary.byCue!=="object") {
    throw new Error("French Ordinary cue map missing");
  }
  return frenchOrdinary.byCue;
}

function ordinaryParagraphs(block,{language="en",frenchOrdinary=null,ordinaryVariants=null,form="LOW"}={}){
  const locale=languageKey(language);
  const sourceFamily=formFamily(form);
  const frenchByCue=locale==="fr" ? validateFrenchOrdinary(frenchOrdinary) : null;
  const raw=(block.units??[])
    .map(unit=>applyCanonicalTextCorrection(block.Block_ID,unit))
    .filter(unit=>Boolean(String(unit?.latin??"").trim() || String(unit?.english??"").trim()))
    .map(unit=>{
      const variant=ordinaryVariants?.[unit.cue_id]??null;
      const speaker=resolveOrdinarySpeaker(unit,{form,blockId:block.Block_ID});
      let vernacular=variant ? (locale==="fr"?variant.fr:variant.en) : unit.english;
      if(locale==="fr"&&!variant){
        const sourced=String(frenchByCue?.[unit.cue_id]??"").trim();
        if(!sourced) throw new Error(block.Block_ID+": French Ordinary cue missing "+unit.cue_id);
        const prefix=rolePrefix(unit.latin);
        vernacular=prefix ? prefix+" "+sourced : sourced;
      }
      // The source places the devotional cross before the final Amen:
      // Cum Sancto Spiritu ✠ / Et vitam ✠. Preserve that printed mark
      // in translated presentation, without altering the corpus itself.
      if(["AO.SM.C0068","AO.SM.C0104"].includes(unit.cue_id) &&
        !String(vernacular??"").includes("✠"))vernacular=String(vernacular??"")+" ✠";
      const latin=applySungSpeakerPrefix(unit.cue_id,correctSungPreparatoryAmen(unit.cue_id,variant?.lat??unit.latin,{form:sourceFamily}),{form:sourceFamily});
      // The three opening Amens lost their speaker prefixes in the Sung
      // donor. Restore them in both language surfaces, not the raw corpus.
      if(speaker.prefix && /^Amen\.$/iu.test(String(vernacular??"").trim())){
        vernacular=speaker.prefix+" "+String(vernacular).trim();
      }
      vernacular=applySungSpeakerPrefix(unit.cue_id,vernacular,{form:sourceFamily});
      return {
        id:unit.cue_id,
        kind:speaker.kind??unitKind(unit),
        latin,
        vernacular,
        speakerRole:speaker.role,
        speakerEvidence:speaker.evidence,
        sourceCueIds:Object.freeze([unit.cue_id]),
      };
    });
  const composed=composeOrdinaryReaderParagraphs(block,raw,{language:locale});
  const byCue=new Map((block.units??[]).map(u=>[u.cue_id,String(u.clock??"").toUpperCase()]));
  const speakersByCue=new Map((block.units??[]).map(u=>[u.cue_id,resolveOrdinarySpeaker(u,{form,blockId:block.Block_ID})]));
  const sungForm=sourceFamily==="SUNG";
  return Object.freeze(composed.map(p=>{
    const cues=p.sourceCueIds??[p.id];
    const clocks=cues.map(id=>byCue.get(id));
    const isSung=sungForm && (
      clocks.includes("SCHOLA_PUBLIC") ||
      (SUNG_PUBLIC_PRAYER_BLOCKS.has(block.Block_ID)&&clocks.includes("PUBLIC_TEXT"))
    );
    const isPrivate=clocks.includes("PRIEST_PRIVATE");
    const speakers=cues.map(id=>speakersByCue.get(id)).filter(Boolean);
    const agreed=speakers.length && speakers.every(x=>x.role===speakers[0].role);
    return Object.freeze({
      ...p,
      speakerRole:agreed?speakers[0].role:"MIXED_OR_UNRESOLVED",
      speakerEvidence:agreed?speakers.map(x=>x.evidence).join(";"):"MULTIPLE_OR_MISSING",
      displayLanguage:cues.length===1&&LIVE_INVITATION_SET.has(cues[0])
        ?"LATIN_CUE":isSung?"LATIN":isPrivate?"VERNACULAR":null,
    });
  }));
}

function stateOnlyBlock(block){
  const units=block.units??[];
  return units.length>0 && units.every(unit=>
    !String(unit?.latin??"").trim() &&
    !String(unit?.english??"").trim() &&
    ["state","pause"].includes(String(unit?.type??"").toLowerCase())
  );
}

function properSpeaker(slot,form){
  const selected=String(form??"").toUpperCase();
  if(slot==="GOSPEL")return Object.freeze({
    role:selected==="SOLEMN"?"DEACON":
      ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"].includes(selected)
        ?"PRIEST":"GOSPEL_PROCLAIMER",
    evidence:"1962_FORM_PUBLIC_GOSPEL",
  });
  if(slot==="EPISTLE_OR_LESSON")return Object.freeze({
    // At Low Mass the celebrant himself reads the Epistle (Ritus VI).
    // At Solemn Mass its public singer is the subdeacon. In a Missa
    // Cantata the singing/reading minister may vary by actual practice.
    role:selected==="SOLEMN"?"SUBDEACON":
      selected==="LOW"?"PRIEST":"MINISTER_TO_BE_OBSERVED",
    evidence:selected==="SOLEMN"?"1962_FORM_SUBDEACON_EPISTLE":
      selected==="LOW"?"1962_LOW_MASS_CELEBRANT_EPISTLE":
      "PUBLIC_EPISTLE_ACTOR_DEPENDS_ON_ACTUAL_FORM",
  });
  return null;
}

function properParagraphs(block,properSlots,{language="en",form="SUNG",omitFixedCueIds=[]}={}){
  const slot=block.Proper_Slot;
  const envelope=properSlots?.[slot] ?? null;
  if(envelope?.status==="NOT_APPLICABLE") return [];
  if(!envelope || !ready(envelope.status)) {
    throw new Error(block.Block_ID+": Proper slot "+slot+" is unresolved; refusing stale donor text");
  }
  const data=envelope.data ?? envelope;
  if(Array.isArray(data.paragraphs) && data.paragraphs.length){
    const resolved=data.paragraphs.map((p,index)=>({
      id:String(p.id ?? block.Block_ID+".proper."+index),
      kind:String(p.kind ?? "TEXT").toUpperCase(),
      latin:p.latin ?? p.lat ?? null,
      vernacular:p.vernacular ?? p.english ?? p.en ?? null,
      // The Proper resolver identifies independently concluded prayer groups.
      // Preserve that identity for liturgically accurate Oremus/Amen insertion.
      sourceAnchorCueId:p.sourceAnchorCueId??block.units?.[0]?.cue_id??null,
      orationGroupIndex:p.orationGroupIndex??null,
      prayerRole:p.prayerRole??null,
      speakerRole:properSpeaker(slot,form)?.role??p.speakerRole??null,
      speakerEvidence:properSpeaker(slot,form)?.evidence??p.speakerEvidence??null,
      liturgicalGroup:p.liturgicalGroup??null,
      sourcePath:p.sourcePath??null,
    }));
    return composeProperReaderParagraphs(block.Block_ID,resolved,{language,form,omitFixedCueIds})
      .map(p=>Object.freeze({...p,displayLanguage:"VERNACULAR"}));
  }
  const latin=data.latin ?? data.Latin_Text ?? null;
  const english=data.vernacular ?? data.english ?? data.English_Text ?? null;
  if(!latin || !english) throw new Error(block.Block_ID+": Proper slot "+slot+" lacks bilingual resolved text");
  return composeProperReaderParagraphs(block.Block_ID,[{
    id:block.Block_ID+".proper",
    sourceAnchorCueId:block.units?.[0]?.cue_id??null,
    kind:"TEXT",
    latin,
    vernacular:english,
    speakerRole:properSpeaker(slot,form)?.role??null,
    speakerEvidence:properSpeaker(slot,form)?.evidence??null,
  }],{language,form,omitFixedCueIds}).map(p=>Object.freeze({...p,displayLanguage:"VERNACULAR"}));
}

export function buildReaderSectionCard({
  corpus,
  section,
  properSlots={},
  vernacularLanguage="en",
  frenchOrdinary=null,
  ordinaryVariants=null,
  omittedOrdinaryCues=[],
  actualForm=null,
}={}){
  validateReaderTextCorpus(corpus);
  if(!section || !Number.isInteger(section.sequence)) throw new TypeError("Reader section with sequence required");

  const mid=macroId(section.sequence);
  const blocks=corpus.blocks
    .filter(block=>block.Macro_ID===mid)
    .sort((a,b)=>(a.Display_Order??0)-(b.Display_Order??0));
  if(blocks.length===0) throw new Error(section.sectionId+": no canonical text blocks for "+mid);

  const paragraphs=[];
  const blockMeta=[];
  for(const block of blocks){
    // XIII.1: Requiem begins with the first Introibo/response and proceeds
    // directly to Adjutorium. Psalm 42 (B003, ten exact source cues) is
    // omitted, not merely hidden behind a visible blank prayer.
    if(block.Block_ID==="AO.SM.B003"&&
       REQUIEM_FOOT_PSALM_CUES.some(id=>omittedOrdinaryCues.includes(id))){
      if(block.units?.length!==REQUIEM_FOOT_PSALM_CUES.length||
         block.units.some((u,i)=>u.cue_id!==REQUIEM_FOOT_PSALM_CUES[i])||
         !REQUIEM_FOOT_PSALM_CUES.every(id=>omittedOrdinaryCues.includes(id)))
        throw new Error("REQUIEM_JUDICA_SOURCE_IDENTITY_MISMATCH");
      blockMeta.push(Object.freeze({
        blockId:block.Block_ID,title:block.Title,properSlot:block.Proper_Slot,
        stateOnly:false,firstParagraphIndex:null,paragraphCount:0,
        omittedByRite:"RITUS_XIII_1_REQUIEM",
      }));
      continue;
    }
    // XIII.1: the Gospel preparation keeps Munda cor meum and the
    // movement to the Gospel side, but not the two private blessing
    // petitions. Validate the 3 original source cue identities strictly.
    const omitGospelPreparation=block.Block_ID==="AO.SM.B023" &&
      omittedOrdinaryCues.includes("AO.SM.C0080");
    if(omitGospelPreparation){
      const ids=["AO.SM.C0079","AO.SM.C0080","AO.SM.C0081"];
      if(block.units?.length!==ids.length||
         block.units.some((u,i)=>u.cue_id!==ids[i]))
        throw new Error("REQUIEM_GOSPEL_PREPARATION_SOURCE_IDENTITY_MISMATCH");
    }
    // The Gospel text + Laus tibi remain; only Per evangelica dicta and
    // its accompanying kiss are omitted from the fixed source followups.
    const omitGospelBookKiss=block.Block_ID==="AO.SM.B026"&&
      omittedOrdinaryCues.includes("AO.SM.C0088");
    if(omitGospelBookKiss){
      const ids=["AO.SM.C0086","AO.SM.C0087","AO.SM.C0088"];
      if(block.units?.length!==ids.length||
         block.units.some((u,i)=>u.cue_id!==ids[i]))
        throw new Error("REQUIEM_GOSPEL_FOLLOWUP_SOURCE_IDENTITY_MISMATCH");
    }
    // XIII.1: at the Lavabo the Psalm remains but the two final doxology
    // cues are omitted. Work from a display-only copy of the frozen block.
    let projectedBlock=omitGospelPreparation
      ? {...block,units:Object.freeze(block.units.filter(u=>u.cue_id!=="AO.SM.C0080"))}
      : block;
    if(block.Block_ID==="AO.SM.B037"&&
       REQUIEM_LAVABO_DOXOLOGY_CUES.some(id=>omittedOrdinaryCues.includes(id))){
      const expected=["AO.SM.C0125",...REQUIEM_LAVABO_DOXOLOGY_CUES];
      if(block.units?.length!==expected.length||
         block.units.some((u,i)=>u.cue_id!==expected[i])||
         !REQUIEM_LAVABO_DOXOLOGY_CUES.every(id=>omittedOrdinaryCues.includes(id)))
        throw new Error("REQUIEM_LAVABO_SOURCE_IDENTITY_MISMATCH");
      projectedBlock={...block,units:Object.freeze([block.units[0]])};
    }
    // Incense is not used at LOW or MISSA_CANTATA_SIMPLE. The source's
    // two CONDITIONAL_1962 incensation blocks must not appear as prayers
    // merely because the frozen donor holds their content. This is a
    // selected-form gate, never a change to the underlying donor.
    const knownNoIncenseForm=actualForm!=null &&
      ["LOW","MISSA_CANTATA_SIMPLE"].includes(String(actualForm).toUpperCase());
    if(knownNoIncenseForm &&
       ["AO.SM.B013","AO.SM.B036"].includes(block.Block_ID)){
      const expected=block.Block_ID==="AO.SM.B013"
        ?["AO.SM.C0040","AO.SM.C0041"]
        :["AO.SM.C0120","AO.SM.C0121","AO.SM.C0122","AO.SM.C0123","AO.SM.C0124"];
      if(block.Branch_Status!=="CONDITIONAL_1962"||
         block.units?.length!==expected.length ||
         block.units.some((u,i)=>u.cue_id!==expected[i]))
        throw new Error("NO_INCENSE_FORM_SOURCE_IDENTITY_MISMATCH");
      blockMeta.push(Object.freeze({
        blockId:block.Block_ID,title:block.Title,properSlot:block.Proper_Slot,
        stateOnly:false,firstParagraphIndex:null,paragraphCount:0,
        omittedByRite:"1962_FORM_NO_INCENSE",
      }));
      continue;
    }
    // XIII.2 suppresses the whole initial-incensation block at a
    // Requiem. Offertory incensation is independently permitted and
    // must remain available for the selected incensed form.
    if(block.Block_ID==="AO.SM.B013" &&
       omittedOrdinaryCues.includes("AO.SM.C0040") &&
       omittedOrdinaryCues.includes("AO.SM.C0041")){
      if(block.units?.length!==2 ||
         block.units[0]?.cue_id!=="AO.SM.C0040" ||
         block.units[1]?.cue_id!=="AO.SM.C0041")
        throw new Error("REQUIEM_ENTRANCE_INCENSATION_SOURCE_IDENTITY_MISMATCH");
      blockMeta.push(Object.freeze({
        blockId:block.Block_ID,title:block.Title,properSlot:block.Proper_Slot,
        stateOnly:false,firstParagraphIndex:null,paragraphCount:0,
        omittedByRite:"RITUS_XIII_2_REQUIEM",
      }));
      continue;
    }
    // XIII.1 omits the final blessing completely at a Requiem.
    // Placeat, altar kiss and Last Gospel remain in their original order.
    if(block.Block_ID==="AO.SM.B092"&&
       ["AO.SM.C0263","AO.SM.C0264","AO.SM.C0265","AO.SM.C0266"]
         .every(id=>omittedOrdinaryCues.includes(id))){
      const expected=["AO.SM.C0263","AO.SM.C0264","AO.SM.C0265","AO.SM.C0266"];
      if(block.units?.length!==expected.length||
         block.units.some((u,i)=>u.cue_id!==expected[i]))
        throw new Error("REQUIEM_FINAL_BLESSING_SOURCE_IDENTITY_MISMATCH");
      blockMeta.push(Object.freeze({
        blockId:block.Block_ID,title:block.Title,properSlot:block.Proper_Slot,
        stateOnly:false,firstParagraphIndex:null,paragraphCount:0,
        omittedByRite:"RITUS_XIII_1_REQUIEM",
      }));
      continue;
    }
    // XIII.1 omits the complete FIRST peace-prayer block at Requiem Masses.
    // Retain its non-rendered block metadata for original Missal section
    // ownership; never invent a blank prayer or renumber the other two.
    if(block.Block_ID==="AO.SM.B069"&&omittedOrdinaryCues.includes("AO.SM.C0225")){
      if(block.units?.length!==1||block.units[0]?.cue_id!=="AO.SM.C0225")
        throw new Error("REQUIEM_PEACE_PRAYER_SOURCE_IDENTITY_MISMATCH");
      blockMeta.push(Object.freeze({
        blockId:block.Block_ID,title:block.Title,properSlot:block.Proper_Slot,
        stateOnly:false,firstParagraphIndex:null,paragraphCount:0,
        omittedByRite:"RITUS_XIII_1_REQUIEM",
      }));
      continue;
    }
    const explicitNotApplicable=Boolean(
      block.Proper_Slot && properSlots?.[block.Proper_Slot]?.status==="NOT_APPLICABLE"
    );
    const raw=block.Proper_Slot
      ? properParagraphs(block,properSlots,{language:vernacularLanguage,form:actualForm??corpus.form,
          omitFixedCueIds:omitGospelBookKiss?["AO.SM.C0088"]:[]})
      : ordinaryParagraphs(projectedBlock,{language:vernacularLanguage,frenchOrdinary,ordinaryVariants,form:actualForm??corpus.form});
    const stateOnly=stateOnlyBlock(block);
    if(raw.length===0 && !explicitNotApplicable && !stateOnly && block.Branch_Status!=="OPTIONAL_LOCAL_CUSTOM") {
      throw new Error(block.Block_ID+": block contains no reader text");
    }
    const projected=raw.length ? projectResolvedReaderText({status:"READY",paragraphs:raw}) : [];
    paragraphs.push(...projected);
    blockMeta.push(Object.freeze({
      blockId:block.Block_ID,
      title:block.Title,
      properSlot:block.Proper_Slot,
      stateOnly,
      firstParagraphIndex:projected.length ? paragraphs.length-projected.length : null,
      paragraphCount:projected.length,
    }));
  }
  const stateOnlyCard=paragraphs.length===0 && blockMeta.some(block=>block.stateOnly);
  if(paragraphs.length===0 && !stateOnlyCard) throw new Error(section.sectionId+": refusing blank reader card");

  return Object.freeze({
    schema:"ao-reader-section-card-v1",
    sectionId:section.sectionId,
    sequence:section.sequence,
    title:blockMeta.some(b=>b.blockId==="AO.SM.B092"&&
      b.omittedByRite==="RITUS_XIII_1_REQUIEM")
      ?"Placeat tibi, sancta Trinitas":section.name,
    part:section.part,
    rubricKey:section.rubricKey,
    macroId:mid,
    paragraphs:Object.freeze(paragraphs),
    stateOnly:stateOnlyCard,
    blocks:Object.freeze(blockMeta),
    provenance:Object.freeze({
      textCorpusForm:corpus.form,
      donorHash:corpus.source.rawSha256,
      displayOnly:true,
      vernacularLanguage:languageKey(vernacularLanguage),
      frenchOrdinaryCommit:languageKey(vernacularLanguage)==="fr" ? frenchOrdinary?.source?.commit??null : null,
    }),
  });
}
