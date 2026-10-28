import { ORDINARY_SUNG_SOURCE_ONLY_CUES } from "./reader-source-only-cues.js";
/** Display-only title. Never rename, split or omit the Benedictus text. */
export function visibleMassCardTitle(card){
  const source=String(card?.sourceSectionId??card?.sectionId??"");
  return source==="AO.CARD.013" ? "Sanctus" : String(card?.title??"");
}

// Curated LIVE prayer-card presentation: one card per meaningful moment,
// not per donor block. All source paragraphs, cue IDs and events are preserved.
// Ordinary LIVE has 65 curated source-backed prayer cards (64 visible by
// default when the optional second Confiteor is omitted). This is the
// production Ordinary Sung LIVE family; no URL parameter can substitute
// historical 48-card research presentations.
// Keep the direct native fixture review activation backward compatible.
// Pre-Gospel chant subnavigation requires a source-backed follow-up.
//
// A "block" cut ends after the entire canonical block. A "cue" cut ends
// after the specified exact paragraph, never in the middle of a cue.
// Short speaker responses and gestures remain inside the prayer card.
const GROUPS=Object.freeze({
  "AO.CARD.001":Object.freeze({
    titles:["At the Foot of the Altar · Opening and Psalm 42",
      "Confiteor of the Celebrant","Confiteor of the Servers",
      "Versicles and Ascent of the Altar","Introit"],
    after:[{block:"B004"},{block:"B006"},{block:"B009"},{block:"B013"}],
  }),
  "AO.CARD.003":Object.freeze({
    titles:["Gloria · The Celebrant's Intonation",
      "Gloria · Praise and Supplication","Gloria · Doxology"],
    after:[{cue:54},{cue:65}],
  }),
  "AO.CARD.007":Object.freeze({
    titles:["Preparation for the Gospel","Proclamation of the Holy Gospel"],
    after:[{block:"B023"}],
  }),
  "AO.CARD.009":Object.freeze({
    titles:["Credo · The Celebrant's Intonation",
      "Credo · The Father and the Son",
      "Credo · Incarnation, Passion and Resurrection",
      "Credo · The Holy Spirit, Church and Life Eternal"],
    after:[{cue:90},{cue:94},{cue:98}],
  }),
  "AO.CARD.010":Object.freeze({
    titles:["Offertory · Invitation and Antiphon",
      "Offertory · Offering of the Bread",
       "Offertory · Preparing and Offering the Chalice",
      "Offertory · Humility and Invocation",
      "Offertory · Incensation",
      "Offertory · Lavabo and Offering to the Trinity"],
    after:[{block:"B030"},{block:"B031"},{block:"B033"},{block:"B035"},{block:"B036"}],
  }),
  "AO.CARD.011":Object.freeze({
    titles:["Orate, fratres · Prayer and Response",
      "Secret Prayer and Conclusion"],
    after:[{block:"B039"}],
  }),
  "AO.CARD.013":Object.freeze({
    // One complete priestly prayer; Schola Benedictus timing is independent.
    titles:["Sanctus"],
    after:[],
  }),
  "AO.CANON.06":Object.freeze({
    titles:["Consecration of the Host · Preparation",
      "Words of Consecration and Elevation · Host"],
    after:[{cue:172}],
  }),
  "AO.CANON.07":Object.freeze({
    titles:["Consecration of the Chalice · Preparation",
      "Words of Consecration and Elevation · Chalice"],
    after:[{cue:178}],
  }),
  "AO.CARD.020":Object.freeze({
    titles:["Libera nos · Prayer and Conclusion",
      "Pax Domini","Commingling of the Sacred Species"],
    after:[{block:"B065"},{block:"B066"}],
  }),
  "AO.CARD.022":Object.freeze({
    titles:["Prayers before the Priest's Communion",
      "Domine, non sum dignus · Celebrant"],
    after:[{block:"B072"}],
  }),
  "AO.CARD.023":Object.freeze({
    titles:["The Priest receives the Sacred Host",
      "The Priest receives the Precious Blood"],
    after:[{block:"B075"}],
  }),
  "AO.CARD.024":Object.freeze({
    titles:["Second Confiteor · Optional Local Custom",
      "Ecce Agnus Dei · Preparation of the Faithful"],
    after:[{block:"B079"}],
  }),
  "AO.CARD.026":Object.freeze({
    titles:["Ablutions","Communion Antiphon"],
    after:[{block:"B084"}],
  }),
  "AO.CARD.029":Object.freeze({
    titles:["Placeat tibi · Closing Prayer","Final Blessing"],
    after:[{block:"B091"}],
  }),
  "AO.CARD.030":Object.freeze({
    titles:["Last Gospel · Prologue of St John",
      "Last Gospel · The Word Made Flesh"],
    after:[{cue:272}],
  }),
});

const cueId=n=>"AO.SM.C"+String(n).padStart(4,"0");
const blockId=id=>"AO.SM."+id;

function freezeCard(card){
  return Object.freeze({...card,
    paragraphs:Object.freeze([...(card.paragraphs??[])]),
    blocks:Object.freeze([...(card.blocks??[])]),
    eventIds:Object.freeze([...(card.eventIds??[])]),
    sourceEventIds:Object.freeze([...(card.sourceEventIds??[])])
  });
}
function sourceId(card){return String(card.sectionId);}
function canonicalSourceId(card){return String(card.sourceSectionId??card.sectionId);}
function boundaryIndex(card,marker){
  if(marker.paragraphId!=null){
    const hit=card.paragraphs.map((p,i)=>p.id===marker.paragraphId?i:null).filter(i=>i!==null);
    if(hit.length!==1)throw new Error(sourceId(card)+": SOURCE_PARAGRAPH_CUT_NOT_UNIQUE:"+marker.paragraphId);
    return hit[0];
  }
  if(marker.cue!=null){
    const target=cueId(marker.cue);
    const matches=card.paragraphs.map((p,i)=>
      (p.sourceCueIds??[]).includes(target)?i:null).filter(i=>i!==null);
    if(matches.length!==1)throw new Error(sourceId(card)+": expected one paragraph for "+target);
    return matches[0];
  }
  const id=blockId(marker.block);
  const matches=(card.blocks??[]).filter(b=>b.blockId===id);
  if(matches.length!==1)throw new Error(sourceId(card)+": expected one source block "+id);
  const b=matches[0];
  if(b.firstParagraphIndex==null||!b.paragraphCount){
    // Allow a form-selected omitted incensation block to end at its
    // immediately preceding source prayer. Never fabricate a blank line.
    if((id==="AO.SM.B013" &&
        ["1962_FORM_NO_INCENSE","RITUS_XIII_2_REQUIEM"].includes(b.omittedByRite))||
       (id==="AO.SM.B036"&&b.omittedByRite==="1962_FORM_NO_INCENSE")){
      const before=(card.blocks??[]).slice(0,(card.blocks??[]).indexOf(b)).reverse()
        .find(x=>x.firstParagraphIndex!=null&&x.paragraphCount>0);
      if(before)return before.firstParagraphIndex+before.paragraphCount-1;
    }
    throw new Error(sourceId(card)+": proposed cut has no prayer paragraph "+id);
  }
  return b.firstParagraphIndex+b.paragraphCount-1;
}
function blocksInRange(card,first,last){
  const included=[];
  for(const meta of card.blocks??[]){
    if(meta.firstParagraphIndex==null||!meta.paragraphCount){
      if(meta.omittedByRite)continue; // Exact omitted block stays on canonical source model.
      // Editorially blank placeholders stay in the nearest following
      // section, never inventing a display paragraph or ritual event.
      const next=(card.blocks??[]).find(x=>x.firstParagraphIndex!=null&&
        (card.blocks??[]).indexOf(x)>(card.blocks??[]).indexOf(meta));
      const position=next?.firstParagraphIndex??card.paragraphs.length-1;
      if(position>=first&&position<=last){
        included.push({...meta,firstParagraphIndex:null,paragraphCount:0});
      }
      continue;
    }
    const start=meta.firstParagraphIndex;
    const end=start+meta.paragraphCount-1;
    if(end<first||start>last)continue;
    const overlapStart=Math.max(start,first);
    const overlapEnd=Math.min(end,last);
    included.push({...meta,firstParagraphIndex:overlapStart-first,
      paragraphCount:overlapEnd-overlapStart+1});
  }
  return included;
}
// A Sequence is a distinct source-owned B022 prayer only when this day's
// resolved Proper actually contains it. B021 may still carry Gradual and
// Alleluia/Tract in one translated source paragraph: do not invent an
// unverified internal text boundary. Unlike a fixed 66-card scheme, ordinary
// days with no Sequence retain the certified 65-card presentation.
function conditionalPreGospelSpec(card){
  if(sourceId(card)!=="AO.CARD.006")return null;
  const gradual=(card.blocks??[]).find(b=>b.blockId==="AO.SM.B021");
  const following=(card.blocks??[]).find(b=>b.blockId==="AO.SM.B022");
  if(!gradual||!following)throw new Error("PRE_GOSPEL_CERTIFIED_BLOCKS_MISSING");
  if(!following.paragraphCount)return null; // No phantom absent chants.
  if(!gradual.paragraphCount || gradual.firstParagraphIndex==null ||
     following.firstParagraphIndex==null ||
     gradual.firstParagraphIndex+gradual.paragraphCount!==following.firstParagraphIndex ||
     following.firstParagraphIndex+following.paragraphCount!==card.paragraphs.length)
    throw new Error("PRE_GOSPEL_CHANT_SOURCE_BOUNDARY_UNVERIFIED");
  const nodes=card.paragraphs.slice(following.firstParagraphIndex);
  const named=nodes.map(p=>String(p.liturgicalGroup??"").replace(/^AO\.CHANT\./,""));
  const sourcedGradual=card.paragraphs.slice(gradual.firstParagraphIndex,
    gradual.firstParagraphIndex+gradual.paragraphCount)
    .every(p=>p.liturgicalGroup==="AO.CHANT.GRADUAL");
  const hasNamedFollowup=sourcedGradual &&
    ["ALLELUIA","TRACT"].includes(named[0]) &&
    (nodes.length===1 || nodes.length===2&&named[1]==="SEQUENCE");
  if(hasNamedFollowup){
    const titles=["Gradual",named[0]==="TRACT"?"Tract":"Alleluia"];
    const after=[{block:"B021"}];
    if(nodes.length===2){
      titles.push("Sequence");
      after.push({paragraphId:nodes[0].id});
    }
    return Object.freeze({titles:Object.freeze(titles),after:Object.freeze(after)});
  }
  // Existing source shape: B021 is a single coalesced Gradual/Alleluia
  // Proper, while B022 contains a separately verified Sequence only.
  if(nodes.length!==1 || named[0]!=="")
    throw new Error("PRE_GOSPEL_UNSUPPORTED_CHANT_PARTS");
  return Object.freeze({
    titles:Object.freeze(["Gradual · Alleluia / Tract","Sequence"]),
    after:Object.freeze([{block:"B021"}]),
  });
}

function curated(card){
  const spec=GROUPS[sourceId(card)]??conditionalPreGospelSpec(card);
  if(!spec)return [Object.freeze({title:card.title,paragraphs:card.paragraphs,
    blocks:card.blocks,ordinal:1})];
  if(spec.titles.length!==spec.after.length+1)throw new Error(sourceId(card)+": bad card specification");
  const ends=spec.after.map(cut=>boundaryIndex(card,cut));
  ends.push(card.paragraphs.length-1);
  let previous=-1;
  return ends.map((last,i)=>{
    if(last<=previous){
      const omitted=sourceId(card)==="AO.CARD.010"&&i===4
        ?(card.blocks??[]).find(b=>b.blockId==="AO.SM.B036"&&b.omittedByRite==="1962_FORM_NO_INCENSE")
        :sourceId(card)==="AO.CARD.029"&&i===1
        ?(card.blocks??[]).find(b=>b.blockId==="AO.SM.B092"&&b.omittedByRite==="RITUS_XIII_1_REQUIEM")
        :null;
      if(last===previous&&omitted)return Object.freeze({
        title:omitted.blockId==="AO.SM.B036"?"Incensation omitted for this Mass":
          "Requiem · No final blessing",
        paragraphs:[],blocks:[{...omitted,firstParagraphIndex:null,paragraphCount:0}],
        ordinal:i+1,stateOnly:true,omittedByRite:omitted.omittedByRite,
      });
      throw new Error(sourceId(card)+": empty or reordered curated prayer group "+i);
    }
    const first=previous+1;
    const paragraphs=card.paragraphs.slice(first,last+1);
    const blocks=blocksInRange(card,first,last);
    if(!paragraphs.length)throw new Error(sourceId(card)+": empty curated LIVE card");
    previous=last;
    // The original fixed group title names Psalm 42 even where Ritus XIII.1
    // has source-suppressed it in Requiem Masses. Keep the exact card/cue
    // identity but never advertise a prayer that is not rendered.
    const omittedJudica=sourceId(card)==="AO.CARD.001" && i===0 &&
      (card.blocks??[]).some(b=>b.blockId==="AO.SM.B003" &&
        b.omittedByRite==="RITUS_XIII_1_REQUIEM");
    return Object.freeze({
      title:omittedJudica?"At the Foot of the Altar · Introibo":spec.titles[i],
      paragraphs,blocks,ordinal:i+1,
    });
  });
}

export function projectCuratedOrdinaryLiveCards(model){
  if(!model||!Array.isArray(model.cards))throw new TypeError("source-first LIVE model required");
  if(String(model.presentationMode).toUpperCase()!=="LIVE"||
     String(model.corpusFamily).toUpperCase()!=="SUNG")return model;
  if(!String(model.structureOwner??"").includes("SOURCE_FIRST"))
    throw new Error("Curated LIVE requires source-first authority");
  // Special-day ownership is not interchangeable with the plain 39 steps.
  // Leave all such forms untouched until individually validated.
  if(model.totalCards!==39)return model;

  const result=[];
  const visited=new Set();
  for(const sourceCard of model.cards){
    const id=sourceId(sourceCard);
    visited.add(id);
    const chunks=sourceCard.paragraphs.length?curated(sourceCard):
      [{title:sourceCard.title,paragraphs:[],blocks:sourceCard.blocks,ordinal:1}];
    if(JSON.stringify(chunks.flatMap(chunk=>chunk.paragraphs.map(p=>p.id)))!==
      JSON.stringify(sourceCard.paragraphs.map(p=>p.id)))
      throw new Error(id+": card projection omitted or duplicated source paragraphs");
    for(const chunk of chunks){
      result.push(freezeCard({
        ...sourceCard,
        sectionId:"AO.LIVECURATED."+id.replace(/[^A-Za-z0-9.-]/g,"-")+"."+chunk.ordinal,
        title:chunk.title,
        sequence:result.length+1,
        paragraphs:chunk.paragraphs,
        blocks:chunk.blocks,
        stateOnly:chunk.stateOnly===true || (chunk.paragraphs.length===0 && sourceCard.stateOnly===true),
        omittedByRite:chunk.omittedByRite??null,
        sourceSectionId:canonicalSourceId(sourceCard),
        sourceSequence:sourceCard.sourceSequence??sourceCard.guideSequence??sourceCard.sequence,
        guideSequence:sourceCard.guideSequence??sourceCard.sourceSequence??sourceCard.sequence,
        sourceEventIds:[...(sourceCard.eventIds??[])],
        eventIds:[],
        curatedPresentationReview:true,
        provenance:Object.freeze({
          ...(sourceCard.provenance??{}),
          productPresentation:"SOURCE_FIRST_CURATED_65_REVIEW",
          canonicalTextMutation:false,
        }),
      }));
    }
  }
  for(const key of Object.keys(GROUPS)){
    if(!visited.has(key))throw new Error("Curated section not found: "+key);
  }
  const preGospelCount=result.filter(card=>card.sourceSectionId==="AO.CARD.006").length;
  if(preGospelCount<1||preGospelCount>3)throw new Error("PRE_GOSPEL_CARD_COUNT_UNSUPPORTED");
  const expectedCards=65+(preGospelCount-1);
  if(result.length!==expectedCards)throw new Error(
    "Ordinary curated LIVE expected "+expectedCards+" source-backed cards; found "+result.length);
  const cards=Object.freeze(result);
  const lookup=new Map(cards.map(c=>[c.sectionId,c]));
  if(lookup.size!==cards.length)throw new Error("Curated cards have duplicate IDs");
  const bySequence=n=>Number.isInteger(Number(n))?cards[Number(n)-1]??null:null;
  const neighbor=(id,delta)=>{
    const card=lookup.get(String(id));
    return card?bySequence(card.sequence+delta):null;
  };
  return Object.freeze({
    ...model,
    schema:"ao-mass-reader-presentation-model-v1",
    structureOwner:"SOURCE_FIRST_LIVE_CURATED_65_REVIEW",
    sourceStructureOwner:model.structureOwner,
    sourceModelTotalCards:model.totalCards,
    productParity48:false,
    cards,totalCards:cards.length,
    cardBySequence:bySequence,
    previousCard:id=>neighbor(id,-1),
    nextCard:id=>neighbor(id,1),
    cardForEvent:undefined,
    sourceAuthorityModel:model,
    // Source-only priest/Proper clock cues have NO prayer paragraph.
    // Retain them as audit metadata, never as an inferred spoken line,
    // movement, or automatic gesture/position/sound trigger.
    sourceOnlyCueRegister:ORDINARY_SUNG_SOURCE_ONLY_CUES,
    curatedPresentationReview:true,
  });
}
export const CURATED_LIVE_GROUPS=GROUPS;


// Palm Sunday, Ash Wednesday, and Candlemas have an independently sourced
// pre-Mass ceremony ending at the Introit; their Mass omits the prayers at
// the Foot of the Altar. Do not render those omitted opening cards and do
// not renumber, synthesize or mutate their underlying canonical 39 steps.
export function projectCuratedIntroitEntryLiveCards(curated){
  if(curated?.structureOwner!=="SOURCE_FIRST_LIVE_CURATED_65_REVIEW"||
     ![65,66,67].includes(curated?.totalCards)||curated?.sourceModelTotalCards!==39)
    throw new Error("CURATED_INTROIT_ENTRY_REQUIRES_SOURCE_CURATED_65");
  const opening=curated.cards.filter(card=>card.sourceSectionId==="AO.CARD.001");
  const introit=opening.find(card=>card.title==="Introit" &&
    (card.blocks??[]).some(block=>block.blockId==="AO.SM.B014"));
  if(opening.length!==5 || opening[4]!==introit ||
     curated.cards[4]!==introit ||
     curated.cards.slice(0,4).some(card=>card.sourceSectionId!=="AO.CARD.001") ||
     (introit.blocks??[]).some(block=>block.blockId!=="AO.SM.B014") ||
     !introit.paragraphs.length)
    throw new Error("CURATED_INTROIT_ENTRY_SOURCE_BOUNDARY_UNVERIFIED");
  const omitted=curated.cards.slice(0,4);
  const cards=Object.freeze(curated.cards.slice(4).map((card,i)=>freezeCard({
    ...card,sequence:i+1,
    provenance:Object.freeze({
      ...(card.provenance??{}),
      massEntry:"INTROIT",
      openingOmission:"ORDINARY_FOOT_CLUSTER_BY_PRECEDING_RITE",
    }),
  })));
  const expectedVisible=curated.totalCards-omitted.length;
  if(![61,62,63].includes(expectedVisible)||cards.length!==expectedVisible||
     cards[0].title!=="Introit")
    throw new Error("CURATED_INTROIT_ENTRY_EXPECTED_SOURCE_STEPS");
  const lookup=new Map(cards.map(c=>[c.sectionId,c]));
  if(lookup.size!==expectedVisible)throw new Error("CURATED_INTROIT_ENTRY_DUPLICATE_IDS");
  const bySequence=n=>Number.isInteger(Number(n))?cards[Number(n)-1]??null:null;
  const neighbor=(id,delta)=>{
    const card=lookup.get(String(id));
    return card?bySequence(card.sequence+delta):null;
  };
  const canonicalStart=curated.sourceAuthorityModel.cards.find(c=>c.sectionId==="AO.CARD.001");
  const keptSourceCueIds=new Set(cards.flatMap(c=>c.paragraphs.flatMap(p=>p.sourceCueIds??[])));
  if(!canonicalStart || omitted.some(card=>card.paragraphs.some(p=>
      (p.sourceCueIds??[]).some(id=>keptSourceCueIds.has(id)))))
    throw new Error("CURATED_INTROIT_ENTRY_SOURCE_CUE_DUPLICATION");
  return Object.freeze({
    ...curated,
    structureOwner:"SOURCE_FIRST_LIVE_CURATED_INTROIT_"+String(expectedVisible),
    cards,totalCards:expectedVisible,
    cardBySequence:bySequence,
    previousCard:id=>neighbor(id,-1),
    nextCard:id=>neighbor(id,1),
    preMassHandoff:"INTROIT",
    suppressedOpeningCardCount:omitted.length,
    suppressedOpeningTitles:Object.freeze(omitted.map(c=>c.title)),
    sourceAuthorityModel:curated.sourceAuthorityModel,
  });
}
