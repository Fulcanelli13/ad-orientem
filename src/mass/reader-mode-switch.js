import { normalizePresentationMode } from "./session-engine.js";
import { createMassReaderModel } from "./reader-model.js";
import { projectSourceFirst48Presentation } from "./reader-live-product48.js";

function modeResolvedMass(prepared,mode){
  const normalized=normalizePresentationMode(mode);
  return Object.freeze({
    ...prepared.session.resolvedMass,
    presentationMode:normalized,
  });
}

export function buildReaderModeModels({prepared,data,mode}={}){
  if(!prepared?.session?.resolvedMass)throw new TypeError("Prepared Mass session required");
  if(!data?.sectionMap||!data?.lowCorpus||!data?.sungCorpus)throw new TypeError("Reader presentation data required");
  const normalized=normalizePresentationMode(mode);
  const sourceModel=createMassReaderModel({
    resolvedMass:modeResolvedMass(prepared,normalized),
    sectionMap:data.sectionMap,
    lowCorpus:data.lowCorpus,
    sungCorpus:data.sungCorpus,
    canonSourceMap:data.canonSourceMap,
    nuptialData:data.nuptialData,
    vernacularLanguage:prepared?.readerPreferences?.language??"en",
  });
  const presentationModel=projectSourceFirst48Presentation(sourceModel);
  return Object.freeze({mode:normalized,sourceModel,presentationModel});
}

function sourceSectionId(card){
  return card?.sourceSectionId??card?.sectionId??null;
}

function cardHasCue(card,cueId){
  if(!cueId)return false;
  return (card?.paragraphs??[]).some(paragraph=>
    (paragraph?.sourceCueIds??[]).some(id=>String(id)===String(cueId))
  );
}

export function captureReaderModeAnchor(card,{activeCueId=null}={}){
  if(!card)return Object.freeze({
    cueId:activeCueId??null,
    sectionId:null,
    sourceSectionId:null,
    sourceSequence:null,
    macroId:null,
  });
  return Object.freeze({
    cueId:activeCueId??null,
    sectionId:card.nuptialInsertion===true ? String(card.sectionId) : null,
    sourceSectionId:sourceSectionId(card),
    sourceSequence:Number.isFinite(Number(card.sourceSequence)) ? Number(card.sourceSequence) : null,
    macroId:card.macroId??null,
  });
}

export function findReaderModeAnchorCard(model,anchor={}){
  const cards=Array.isArray(model?.cards)?model.cards:[];
  if(!cards.length)return null;

  if(anchor.sectionId){
    const exact=cards.find(card=>String(card.sectionId)===String(anchor.sectionId));
    if(exact)return exact;
  }

  if(anchor.cueId){
    const exactCue=cards.find(card=>cardHasCue(card,anchor.cueId));
    if(exactCue)return exactCue;
  }

  if(anchor.sourceSectionId){
    const source=cards.find(card=>String(sourceSectionId(card))===String(anchor.sourceSectionId));
    if(source)return source;
  }

  if(anchor.sourceSequence!=null){
    const sequence=cards.find(card=>Number(card.sourceSequence??card.guideSequence??card.sequence)===Number(anchor.sourceSequence));
    if(sequence)return sequence;
  }

  if(anchor.macroId){
    const macro=cards.find(card=>String(card.macroId??"")===String(anchor.macroId));
    if(macro)return macro;
  }

  return cards[0]??null;
}
