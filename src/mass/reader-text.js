import { projectResolvedReaderText } from "./reader-projection.js";

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

function ordinaryParagraphs(block){
  return (block.units??[]).map(unit=>({
    id:unit.cue_id,
    kind:unitKind(unit),
    latin:unit.latin,
    vernacular:unit.english,
  }));
}

function properParagraphs(block,properSlots){
  const slot=block.Proper_Slot;
  const envelope=properSlots?.[slot] ?? null;
  if(envelope?.status==="NOT_APPLICABLE") return [];
  if(!envelope || !ready(envelope.status)) {
    throw new Error(block.Block_ID+": Proper slot "+slot+" is unresolved; refusing stale donor text");
  }
  const data=envelope.data ?? envelope;
  if(Array.isArray(data.paragraphs) && data.paragraphs.length){
    return data.paragraphs.map((p,index)=>({
      id:String(p.id ?? block.Block_ID+".proper."+index),
      kind:String(p.kind ?? "TEXT").toUpperCase(),
      latin:p.latin ?? p.lat ?? null,
      vernacular:p.vernacular ?? p.english ?? p.en ?? null,
    }));
  }
  const latin=data.latin ?? data.Latin_Text ?? null;
  const english=data.vernacular ?? data.english ?? data.English_Text ?? null;
  if(!latin || !english) throw new Error(block.Block_ID+": Proper slot "+slot+" lacks bilingual resolved text");
  return [{
    id:block.Block_ID+".proper",
    kind:"TEXT",
    latin,
    vernacular:english,
  }];
}

export function buildReaderSectionCard({
  corpus,
  section,
  properSlots={},
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
    const raw=block.Proper_Slot
      ? properParagraphs(block,properSlots)
      : ordinaryParagraphs(block);
    if(raw.length===0 && block.Branch_Status!=="OPTIONAL_LOCAL_CUSTOM") {
      throw new Error(block.Block_ID+": block contains no reader text");
    }
    const projected=raw.length ? projectResolvedReaderText({status:"READY",paragraphs:raw}) : [];
    paragraphs.push(...projected);
    blockMeta.push(Object.freeze({
      blockId:block.Block_ID,
      title:block.Title,
      properSlot:block.Proper_Slot,
      firstParagraphIndex:projected.length ? paragraphs.length-projected.length : null,
      paragraphCount:projected.length,
    }));
  }
  if(paragraphs.length===0) throw new Error(section.sectionId+": refusing blank reader card");

  return Object.freeze({
    schema:"ao-reader-section-card-v1",
    sectionId:section.sectionId,
    sequence:section.sequence,
    title:section.name,
    part:section.part,
    rubricKey:section.rubricKey,
    macroId:mid,
    paragraphs:Object.freeze(paragraphs),
    blocks:Object.freeze(blockMeta),
    provenance:Object.freeze({
      textCorpusForm:corpus.form,
      donorHash:corpus.source.rawSha256,
      displayOnly:true,
    }),
  });
}
