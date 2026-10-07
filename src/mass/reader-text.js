import { projectResolvedReaderText } from "./reader-projection.js";
import { composeProperReaderParagraphs } from "./proper-reader-composition.js";
import { composeOrdinaryReaderParagraphs } from "./ordinary-reader-composition.js";
import { applyCanonicalTextCorrection } from "./canonical-text-corrections.js";

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

function ordinaryParagraphs(block,{language="en",frenchOrdinary=null}={}){
  const locale=languageKey(language);
  const frenchByCue=locale==="fr" ? validateFrenchOrdinary(frenchOrdinary) : null;
  const raw=(block.units??[])
    .map(unit=>applyCanonicalTextCorrection(block.Block_ID,unit))
    .filter(unit=>Boolean(String(unit?.latin??"").trim() || String(unit?.english??"").trim()))
    .map(unit=>{
      let vernacular=unit.english;
      if(locale==="fr"){
        const sourced=String(frenchByCue?.[unit.cue_id]??"").trim();
        if(!sourced) throw new Error(block.Block_ID+": French Ordinary cue missing "+unit.cue_id);
        const prefix=rolePrefix(unit.latin);
        vernacular=prefix ? prefix+" "+sourced : sourced;
      }
      return {
        id:unit.cue_id,
        kind:unitKind(unit),
        latin:unit.latin,
        vernacular,
        sourceCueIds:Object.freeze([unit.cue_id]),
      };
    });
  return composeOrdinaryReaderParagraphs(block,raw,{language:locale});
}

function stateOnlyBlock(block){
  const units=block.units??[];
  return units.length>0 && units.every(unit=>
    !String(unit?.latin??"").trim() &&
    !String(unit?.english??"").trim() &&
    ["state","pause"].includes(String(unit?.type??"").toLowerCase())
  );
}

function properParagraphs(block,properSlots,{language="en"}={}){
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
    }));
    return composeProperReaderParagraphs(block.Block_ID,resolved,{language});
  }
  const latin=data.latin ?? data.Latin_Text ?? null;
  const english=data.vernacular ?? data.english ?? data.English_Text ?? null;
  if(!latin || !english) throw new Error(block.Block_ID+": Proper slot "+slot+" lacks bilingual resolved text");
  return composeProperReaderParagraphs(block.Block_ID,[{
    id:block.Block_ID+".proper",
    kind:"TEXT",
    latin,
    vernacular:english,
  }],{language});
}

export function buildReaderSectionCard({
  corpus,
  section,
  properSlots={},
  vernacularLanguage="en",
  frenchOrdinary=null,
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
    const explicitNotApplicable=Boolean(
      block.Proper_Slot && properSlots?.[block.Proper_Slot]?.status==="NOT_APPLICABLE"
    );
    const raw=block.Proper_Slot
      ? properParagraphs(block,properSlots,{language:vernacularLanguage})
      : ordinaryParagraphs(block,{language:vernacularLanguage,frenchOrdinary});
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
    title:section.name,
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
