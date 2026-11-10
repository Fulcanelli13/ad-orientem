// Visual handoff's C01–C65 identifiers are references to existing 1962
// source-backed LIVE cards, NEVER a second Mass sequence/resolver.
//
// The 65 titles originate in owner-supplied data/mass_cards.json (2026-11-10).
// The 39 source-group spans correspond to the certified native direct
// 30-macro -> 39 source units -> 65 curated display cards. Cues/paragraphs
// are always read from the ACTUAL resolved native model, never from the handoff.
// This adapter does not change Mass order, liturgical conditions, choir time,
// displayed text, rite controllers, or 65-card reader state.
const freeze=Object.freeze;
export const LIVE_HANDOFF_CROSSWALK_SCHEMA="ao-live-handoff-native65-crosswalk-v1";

const SOURCE_SPANS=freeze([
 ["AO.CARD.001",5],["AO.CARD.002",1],["AO.CARD.003",3],
 ["AO.CARD.004",1],["AO.CARD.005",1],["AO.CARD.006",1],
 ["AO.CARD.007",2],["AO.CARD.008",1],["AO.CARD.009",4],
 ["AO.CARD.010",6],["AO.CARD.011",2],["AO.CARD.012",1],
 ["AO.CARD.013",1],
 ...Array.from({length:14},(_,i)=>["AO.CANON."+String(i+1).padStart(2,"0"),
   i===5||i===6?2:1]),
 ["AO.CARD.019",1],["AO.CARD.020",3],["AO.CARD.021",1],
 ["AO.CARD.022",2],["AO.CARD.023",2],["AO.CARD.024",2],
 ["AO.CARD.025",1],["AO.CARD.026",2],["AO.CARD.027",1],
 ["AO.CARD.028",1],["AO.CARD.029",2],["AO.CARD.030",2]
].map(row=>freeze(row)));
const TITLES=freeze([
 "At the Foot of the Altar · Opening and Psalm 42",
 "Confiteor of the Celebrant",
 "Confiteor of the Servers",
 "Versicles and Ascent of the Altar",
 "Introit",
 "Kyrie",
 "Gloria · The Celebrant's Intonation",
 "Gloria · Praise and Supplication",
 "Gloria · Doxology",
 "Collect",
 "Epistle / Lesson",
 "Gradual · Alleluia / Tract / Sequence",
 "Preparation for the Gospel",
 "Proclamation of the Holy Gospel",
 "Sermon / Homily",
 "Credo · The Celebrant's Intonation",
 "Credo · The Father and the Son",
 "Credo · Incarnation, Passion and Resurrection",
 "Credo · The Holy Spirit, Church and Life Eternal",
 "Offertory · Invitation and Antiphon",
 "Offertory · Offering of the Bread",
 "Offertory · Preparing and Offering the Chalice",
 "Offertory · Humility and Invocation",
 "Offertory · Incensation",
 "Offertory · Lavabo and Offering to the Trinity",
 "Orate, fratres · Prayer and Response",
 "Secret Prayer and Conclusion",
 "Preface",
 "Sanctus",
 "Te igitur",
 "Memento, Domine — Living",
 "Communicantes",
 "Hanc igitur",
 "Quam oblationem",
 "Consecration of the Host · Preparation",
 "Words of Consecration and Elevation · Host",
 "Consecration of the Chalice · Preparation",
 "Words of Consecration and Elevation · Chalice",
 "Unde et memores",
 "Supra quae",
 "Supplices te rogamus",
 "Memento etiam, Domine — Dead",
 "Nobis quoque peccatoribus",
 "Per quem haec omnia",
 "Per ipsum · Minor Elevation",
 "Pater noster",
 "Libera nos · Prayer and Conclusion",
 "Pax Domini",
 "Commingling of the Sacred Species",
 "Agnus Dei",
 "Prayers before the Priest's Communion",
 "Domine, non sum dignus · Celebrant",
 "The Priest receives the Sacred Host",
 "The Priest receives the Precious Blood",
 "Second Confiteor · Optional Local Custom",
 "Ecce Agnus Dei · Preparation of the Faithful",
 "Communion of the Faithful",
 "Ablutions",
 "Communion Antiphon",
 "Postcommunion",
 "Dismissal",
 "Placeat tibi · Closing Prayer",
 "Final Blessing",
 "Last Gospel · Prologue of St John",
 "Last Gospel · The Word Made Flesh"
]);
const two=n=>String(n).padStart(2,"0");
const anchors=SOURCE_SPANS.flatMap(([sourceKey,span])=>
 Array.from({length:span},(_,i)=>({sourceKey,cutOrdinal:i+1})));
if(anchors.length!==65||TITLES.length!==65||
  new Set(anchors.map(a=>a.sourceKey+"#"+a.cutOrdinal)).size!==65)
 throw new Error("LIVE_HANDOFF_REFERENCE_DATA_NOT_65_UNIQUE_SOURCE_CUTS");
export const LIVE_HANDOFF_REFERENCE_ANCHORS=freeze(anchors.map((a,i)=>freeze({
 referenceId:"C"+two(i+1),referenceNumber:i+1,
 sourceKey:a.sourceKey,cutOrdinal:a.cutOrdinal,
 expectedNativeId:"AO.LIVECURATED."+a.sourceKey+"."+a.cutOrdinal,
 referenceTitle:TITLES[i],
 sourceAuthority:"NATIVE_DIRECT_CURATED_1962",
 provenance:"OWNER_HANDOFF_2026_11_10_MASS_CARDS",
 noRitualAuthority:true
})));
export const LIVE_HANDOFF_OUTSIDE_MASS_REFERENCES=freeze([
 freeze({referenceId:"P1",rite:"ASPERGES",controller:"EXISTING_NATIVE_ASPERGES",outside65:true}),
 freeze({referenceId:"P2",rite:"ENTRANCE",controller:"SOURCE_OWNED_ENTRANCE",outside65:true}),
 freeze({referenceId:"Q1",rite:"AFTER_MASS",controller:"EXISTING_AFTER_MASS",outside65:true})
]);

function acceptableTitle(anchor,card,form){
 const value=String(card?.title??"");
 if(value===anchor.referenceTitle)return "EXACT_PROTOTYPE_TITLE";
 const low=String(form??"").toUpperCase()==="LOW";
 if(low&&anchor.referenceTitle.includes("The Celebrant's Intonation")&&
   value===anchor.referenceTitle.replace("The Celebrant's Intonation","Opening"))
  return "SOURCE_VALID_LOW_MASS_TITLE";
 if(anchor.referenceId==="C01"&&value==="At the Foot of the Altar · Introibo"&&
   (card.blocks??[]).some(b=>b.omittedByRite==="RITUS_XIII_1_REQUIEM"))
  return "SOURCE_VALID_REQUIEM_FOOT_PSALM_OMISSION";
 if(anchor.referenceId==="C24"&&value==="Incensation omitted for this Mass"&&
    card.stateOnly===true&&card.omittedByRite==="1962_FORM_NO_INCENSE")
  return "SOURCE_VALID_NO_INCENSATION";
 if(anchor.referenceId==="C63"&&value==="Requiem · No final blessing"&&
    card.stateOnly===true&&card.omittedByRite==="RITUS_XIII_1_REQUIEM")
  return "SOURCE_VALID_REQUIEM_NO_BLESSING";
 return "TITLE_OR_SOURCE_RITE_VARIANT_REQUIRES_REVIEW";
}
const blank=reason=>freeze({
 schema:LIVE_HANDOFF_CROSSWALK_SCHEMA,status:"SOURCE_HOLD",reason,
 nativeCardCount:0,sourceMatches:0,exactReferenceMatches:0,
 mappings:freeze([]),holds:freeze([]),additionalNativeCards:freeze([]),
 outsideMass:LIVE_HANDOFF_OUTSIDE_MASS_REFERENCES,
 independentScholaProgression:true,visualClockIsNotObservedSinging:true,
 publicReaderChanged:false
});
const uniqueValues=items=>freeze([...new Set(items.filter(Boolean).map(String))]);
function evidence(card){
 const paragraphs=Array.isArray(card.paragraphs)?card.paragraphs:[];
 const blocks=Array.isArray(card.blocks)?card.blocks:[];
 return freeze({
   sourceMacroId:String(card.sourceSectionId??""),
   canonSegmentId:String(card.provenance?.canonSegmentId??"")||null,
   sourceParagraphIds:uniqueValues(paragraphs.map(p=>p.id)),
   sourceCueIds:uniqueValues(paragraphs.flatMap(p=>p.sourceCueIds??[])),
   sourceBlockIds:uniqueValues(blocks.map(b=>b.blockId)),
   omittedByRite:card.omittedByRite??null,
   stateOnly:card.stateOnly===true,
   sourceOwned:true
 });
}
/**
 * Resolve the prototype C01..C65 *onto* actual native cards.
 * The input is always the resolved native model, never prototype mass_cards.
 * In special/sequence/omitted variants, return explicit holds rather than
 * renumbering a source cut or inventing an omitted source card.
 */
export function resolveLiveHandoffSourceCrosswalk({model,form}={}){
 const cards=model?.cards;
 if(!Array.isArray(cards)||cards.length===0)
  return blank("ACTUAL_NATIVE_SOURCE_CARDS_REQUIRED");
 if(!String(model?.structureOwner??"").includes("SOURCE_FIRST_LIVE_CURATED"))
  return blank("CANONICAL_DIRECT_65_FAMILY_MODEL_REQUIRED");
 const byId=new Map();
 for(const card of cards){
  const id=String(card?.sectionId??"");
  if(!id||byId.has(id))return blank("DUPLICATE_OR_EMPTY_NATIVE_SOURCE_CARD_ID");
  byId.set(id,card);
 }
 const used=new Set(),holds=[];
 const entries=LIVE_HANDOFF_REFERENCE_ANCHORS.map(anchor=>{
   const native=byId.get(anchor.expectedNativeId);
   if(!native){
     holds.push(freeze({referenceId:anchor.referenceId,
       reason:"MISSING_EXACT_NATIVE_SOURCE_CUT",sourceKey:anchor.sourceKey}));
     return freeze({...anchor,status:"UNMATCHED_REFERENCE_HOLD",
       nativeCardId:null,nativeSequence:null,titleStatus:null,evidence:null});
   }
   used.add(native.sectionId);
   const ev=evidence(native);
   const isCanon=anchor.sourceKey.startsWith("AO.CANON.");
   const sourceOwner=isCanon?ev.canonSegmentId:ev.sourceMacroId;
   const titleStatus=acceptableTitle(anchor,native,form??model?.corpusFamily);
   const structuralMatch=sourceOwner===anchor.sourceKey;
   // Nonspoken state-only cards are legitimate only when 1962 rite
   // conditions explicitly mark their suppression.
   const hasMaterial=ev.sourceCueIds.length>0||ev.sourceBlockIds.length>0||
     native.stateOnly===true;
   const matched=structuralMatch&&hasMaterial&&
     titleStatus!=="TITLE_OR_SOURCE_RITE_VARIANT_REQUIRES_REVIEW";
   if(!matched)holds.push(freeze({referenceId:anchor.referenceId,
     reason:!structuralMatch?"NATIVE_SOURCE_OWNER_DRIFT":
       !hasMaterial?"EMPTY_NATIVE_SOURCE_EVIDENCE":
         "NATIVE_TITLE_OR_CUT_VARIANT_REQUIRES_REVIEW",
     sourceKey:anchor.sourceKey,nativeCardId:native.sectionId}));
   return freeze({...anchor,
     status:matched?"MATCHED_SOURCE_CARD":"SOURCE_IDENTITY_OR_RITE_HOLD",
     nativeCardId:String(native.sectionId),
     nativeSequence:native.sequence,
     nativeTitle:String(native.title??""),
     titleStatus,evidence:ev,
     nativeCardReferenceOnly:true
   });
 });
 const additional=cards.filter(card=>!used.has(card.sectionId)).map(card=>
   freeze({nativeCardId:String(card.sectionId),nativeSequence:card.sequence,
     nativeTitle:String(card.title??""),sourceMacroId:card.sourceSectionId??null,
     reason:"SOURCE_OWNED_ADDITIONAL_OR_SPECIAL_INSERTION",
     notANewReferenceCard:true}));
 if(additional.length)holds.push(freeze({referenceId:null,
   reason:"SOURCE_ADDITIONAL_CARDS_NOT_IN_65_HANDOFF_REFERENCE",
   count:additional.length}));
 const exact=entries.filter(e=>e.status==="MATCHED_SOURCE_CARD").length;
 // Order belongs to the live model. A future source insertion must NEVER
 // allow handoff Cnn to reassign the native sequence of any real prayer.
 const mapped=entries.filter(e=>e.nativeCardId);
 for(let i=1;i<mapped.length;i++)
   if(!(mapped[i].nativeSequence>mapped[i-1].nativeSequence))
     holds.push(freeze({referenceId:mapped[i].referenceId,
       reason:"NATIVE_SOURCE_ORDER_NOT_MONOTONIC"}));
 return freeze({
   schema:LIVE_HANDOFF_CROSSWALK_SCHEMA,
   status:holds.length===0&&cards.length===65?"EXACT_NATIVE_65_CROSSWALK":
     "SOURCE_VARIANT_OR_DRIFT_HOLD",
   reason:holds.length?"REVIEW_SOURCE_VARIANTS_NOT_PROTOTYPE_RENUMBERING":null,
   nativeCardCount:cards.length,sourceMatches:mapped.length,
   exactReferenceMatches:exact,mappings:freeze(entries),
   holds:freeze(holds),additionalNativeCards:freeze(additional),
   outsideMass:LIVE_HANDOFF_OUTSIDE_MASS_REFERENCES,
   independentScholaProgression:true,visualClockIsNotObservedSinging:true,
   publicReaderChanged:false
 });
}
export function nativeCardForHandoffReference({crosswalk,model,referenceId}={}){
 if(crosswalk?.status!=="EXACT_NATIVE_65_CROSSWALK"||
   !Array.isArray(model?.cards))return null;
 const row=crosswalk.mappings.find(x=>x.referenceId===String(referenceId??""));
 return row?.status==="MATCHED_SOURCE_CARD"
  ?model.cards.find(c=>c.sectionId===row.nativeCardId)??null:null;
}
