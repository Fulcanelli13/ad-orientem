// Missal-only prayer-page granularity. These are source *block* boundaries,
// not new liturgical events, gestures or translation owners. Formation P1 owns
// meaning/history; the Missal reader only identifies what is being prayed.
const SPLITS=Object.freeze({
  "001":[["B001","B002","B003","B004"],["B005","B006"],["B007","B008","B009"],["B010","B011","B012"],["B013","B014"]],
  "004":[["B017","B018"],["B019"]],
  "006":[["B021"],["B022"]],
  "007":[["B023"],["B024","B025","B026"]],
  "010":[["B028","B029","B030"],["B031"],["B032"],["B033"],["B034","B035"],["B036"],["B037"],["B038"]],
  "011":[["B039"],["B040","B041"]],
  "012":[["B042","B043","B044"],["B045"]],
  "014":[["B047"],["B048"],["B049"],["B050"],["B051"]],
  "017":[["B054"],["B055"],["B056"],["B057"],["B058"],["B059"]],
  "018":[["B060"],["B061"]],
  "019":[["B062"],["B063"]],
  "020":[["B064"],["B065"],["B066","B067"]],
  "022":[["B069","B070","B071"],["B072"],["B073"]],
  "023":[["B074"],["B075"],["B076"]],
  "024":[["B077","B078","B079"],["B080","B081"]],
  "026":[["B083","B084"],["B085"]],
  "027":[["B086","B087"],["B088"]],
  "029":[["B091"],["B092"]],
  "030":[["B093","B094"],["B095"]],
});
function canonicalBlockId(value){return "AO.SM."+value}
const shortDescriptions=Object.freeze({
  B003:["Psalm 42, recited at the foot of the altar.","Psaume 42, récité au bas de l’autel."],
  B005:["The celebrant confesses his sins.","Le célébrant confesse ses péchés."],
  B007:["The ministers answer with their Confiteor.","Les ministres répondent par leur Confiteor."],
  B011:["Prayer while ascending the altar.","Prière en montant à l’autel."],
  B012:["Prayer while venerating the altar.","Prière en vénérant l’autel."],
  B019:["The opening prayer or prayers of this Mass.","Oraison ou oraisons d’ouverture de cette messe."],
  B020:["The lesson appointed for this Mass.","Lecture prescrite pour cette messe."],
  B023:["Preparation before proclaiming the Gospel.","Préparation avant la proclamation de l’Évangile."],
  B026:["The Gospel appointed for this Mass.","Évangile prescrit pour cette messe."],
  B030:["The Offertory chant of this Mass.","Chant d’offertoire de cette messe."],
  B031:["The offering of the bread.","Offrande du pain."],
  B032:["Preparation of the chalice.","Préparation du calice."],
  B033:["The offering of the chalice.","Offrande du calice."],
  B034:["Prayer of humility during the Offertory.","Prière d’humilité pendant l’offertoire."],
  B035:["Invocation of the Holy Ghost over the gifts.","Invocation du Saint-Esprit sur les dons."],
  B036:["Prayer accompanying the incensation.","Prière accompagnant l’encensement."],
  B037:["The priest washes his hands.","Le prêtre se lave les mains."],
  B038:["The offering to the Holy Trinity.","Offrande à la Sainte Trinité."],
  B040:["The Secret prayer or prayers of this Mass.","Oraison ou oraisons secrètes de cette messe."],
  B045:["The Preface appointed for this Mass.","Préface prescrite pour cette messe."],
  B047:["Opening prayer of the Roman Canon.","Prière initiale du Canon romain."],
  B048:["Commemoration of the living.","Mémoire des vivants."],
  B049:["Commemoration of the Church and the saints.","Mémoire de l’Église et des saints."],
  B050:["Prayer over the offering.","Prière sur l’offrande."],
  B051:["Prayer before the Consecration.","Prière avant la consécration."],
  B052:["Consecration of the Sacred Host.","Consécration de la sainte Hostie."],
  B053:["Consecration of the Precious Blood.","Consécration du Précieux Sang."],
  B054:["Prayer after the Consecration.","Prière après la consécration."],
  B057:["Commemoration of the dead.","Mémoire des défunts."],
  B058:["Prayer for the faithful sinners.","Prière pour les fidèles pécheurs."],
  B060:["The concluding doxology of the Canon.","Doxologie finale du Canon."],
  B063:["The Lord’s Prayer.","L’Oraison dominicale."],
  B064:["Prayer for deliverance from evil.","Prière pour être délivrés du mal."],
  B068:["The invocation to the Lamb of God.","Invocation à l’Agneau de Dieu."],
  B072:["Prayer before the priest’s Communion.","Prière avant la communion du prêtre."],
  B073:["The priest declares his unworthiness.","Le prêtre reconnaît son indignité."],
  B074:["The priest receives the Sacred Host.","Le prêtre reçoit la sainte Hostie."],
  B076:["The priest receives the Precious Blood.","Le prêtre reçoit le Précieux Sang."],
  B077:["Optional older/local Communion Confiteor.","Confiteor de communion facultatif, selon l’usage local ou ancien."],
  B080:["The priest shows the Sacred Host to the faithful.","Le prêtre présente la sainte Hostie aux fidèles."],
  B081:["The faithful respond before Communion.","Réponse des fidèles avant la communion."],
  B085:["The Communion chant of the day.","Chant de communion du jour."],
  B088:["The concluding prayer or prayers of the Mass.","Oraison ou oraisons finales de la messe."],
  B092:["The final blessing.","Bénédiction finale."],
  B095:["The opening of Saint John’s Gospel.","Prologue de l’Évangile selon saint Jean."],
});
const properTitles=Object.freeze({
  INTROIT:["Introit","Introït"],
  COLLECT_SET:["Collect","Collecte"],
  EPISTLE_OR_LESSON:["Epistle or Lesson","Épître ou leçon"],
  GRADUAL:["Gradual","Graduel"],
  ALLELUIA_TRACT_SEQUENCE:["Alleluia, Tract or Sequence","Alléluia, trait ou séquence"],
  GOSPEL:["Gospel","Évangile"],
  OFFERTORY:["Offertory","Offertoire"],
  SECRET_SET:["Secret","Secrète"],
  PREFACE:["Preface","Préface"],
  COMMUNION:["Communion","Communion"],
  POSTCOMMUNION_SET:["Postcommunion","Postcommunion"],
});
function labelFor(meta,locale){
  const exact=properTitles[meta.properSlot]??properTitles[meta.title];
  return exact?exact[locale==="fr"?1:0]:String(meta.title??meta.blockId);
}
// Actual-Mass-owner contextual rubric, not a timed priest/minister event.
// Missale Romanum 1962, Ritus servandus VII.4 and VII.9; the Requiem
// omission is in VII.4 and Ordo Missae. This is static Missal guidance at
// the B032 prayer, not a synthetic "pour wine" cue when the page is opened.
// Latin witnesses:
// https://www.intratext.com/IXT/LAT0820/_PI.HTM
// https://www.intratext.com/IXT/LAT0820/_PP.HTM
export function missalChalicePreparationDescription(resolvedMass,{language="en"}={}){
  const form=String(resolvedMass?.form??"").toUpperCase();
  if(!["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"].includes(form)
    || !resolvedMass?.actualCelebration)return null;
  const locale=String(language).toLowerCase().startsWith("fr")?"fr":"en";
  const requiem=String(resolvedMass.actualCelebration.type??"").toUpperCase()==="REQUIEM"
    || (resolvedMass.overlays??[]).includes("REQUIEM");
  const solemn=form==="SOLEMN";
  const rows=solemn
    ? requiem
      ? ["Before this prayer, the deacon pours the wine and the subdeacon presents and adds the water. The priest says the prayer without blessing the water.",
         "Avant cette prière, le diacre verse le vin et le sous-diacre présente et ajoute l’eau. Le prêtre récite la prière sans bénir l’eau."]
      : ["Before this prayer, the deacon pours the wine; the subdeacon presents and adds the water as the priest blesses it and says the prayer.",
         "Avant cette prière, le diacre verse le vin ; le sous-diacre présente et ajoute l’eau tandis que le prêtre la bénit et récite la prière."]
    : requiem
      ? ["The priest pours the wine before this prayer, then adds water without blessing it while saying the prayer.",
         "Le prêtre verse le vin avant cette prière, puis ajoute l’eau sans la bénir en récitant la prière."]
      : ["The priest pours the wine before this prayer, then blesses and adds the water while saying it.",
         "Le prêtre verse le vin avant cette prière, puis bénit et ajoute l’eau en la récitant."];
  return rows[locale==="fr"?1:0];
}

// Ritus servandus XIII.1: static Missal direction, never a sensed gesture.
export function missalRequiemIntroitCrossDescription(resolvedMass,{language="en"}={}){
 const explicit=resolvedMass?.isRequiem===true||
   resolvedMass?.provenance?.isRequiem===true||
   ["REQUIEM","MASS_FOR_THE_DEAD"].includes(
     String(resolvedMass?.actualCelebration?.type??"").toUpperCase())||
   (resolvedMass?.overlays??[]).includes("REQUIEM");
 if(!explicit)return null;
 return String(language).toLowerCase().startsWith("fr")
   ?"À l’Introït, le prêtre ne se signe pas : de la main droite étendue, il trace une croix au-dessus du missel."
   :"At the Introit the priest does not sign himself; with his right hand extended he traces a Cross over the Missal.";
}
/** Brief prayer identity and form-specific practical context; no history or inferred live events. */
export function missalPrayerHeadingsForCard(card,{language="en",resolvedMass=null}={}){
  const locale=String(language).toLowerCase().startsWith("fr")?"fr":"en";
  return Object.freeze((card?.blocks??[])
    .filter(block=>block.firstParagraphIndex!=null&&block.paragraphCount>0)
    .map(block=>Object.freeze({
      blockId:block.blockId,
      paragraphIndex:block.firstParagraphIndex,
      title:labelFor(block,locale),
      description:block.blockId==="AO.SM.B014"
        ? missalRequiemIntroitCrossDescription(resolvedMass,{language:locale})
          ??shortDescriptions.B014?.[locale==="fr"?1:0]??null
        :block.blockId==="AO.SM.B032"
        ? missalChalicePreparationDescription(resolvedMass,{language:locale})
          ??shortDescriptions.B032[locale==="fr"?1:0]
        : shortDescriptions[block.blockId.replace("AO.SM.","")]?.[locale==="fr"?1:0]??null,
    })));
}
function subsections(card,groups,{language="en"}={}){
  const locale=String(language).toLowerCase().startsWith("fr")?"fr":"en";
  const blocks=card.blocks??[];
  const expected=blocks.map(x=>x.blockId);
  const specified=groups.flat().map(canonicalBlockId);
  if(JSON.stringify(expected)!==JSON.stringify(specified))
    throw new Error("MISSAL_BLOCK_OWNERSHIP_MISMATCH:"+card.sectionId);
  const results=[];
  let pendingEmptyBlocks=[];
  for(let index=0;index<groups.length;index++){
    let paragraphs=[],groupBlocks=[];
    for(const short of groups[index]){
      const block=blocks.find(x=>x.blockId===canonicalBlockId(short));
      const rows=block.firstParagraphIndex==null?[]:
        card.paragraphs.slice(block.firstParagraphIndex,block.firstParagraphIndex+block.paragraphCount);
      groupBlocks.push(Object.freeze({...block,firstParagraphIndex:rows.length?paragraphs.length:null,
        paragraphCount:rows.length}));
      paragraphs.push(...rows);
    }
    if(!paragraphs.length){
      // The Gospel-chant branch (B022) can legitimately have no separate
      // source text when the selected Proper contains only a Gradual.
      // Preserve its block identity with the preceding page rather than
      // emitting a blank fake prayer or silently dropping its metadata.
      const preceding=results.at(-1);
      if(groupBlocks.every(b=>b.paragraphCount===0)){
        if(preceding){
          results[results.length-1]=Object.freeze({
            ...preceding,
            blocks:Object.freeze([...preceding.blocks,...groupBlocks]),
          });
        }else pendingEmptyBlocks.push(...groupBlocks);
        continue;
      }
      // Optional omitted branches are not invented as empty prayer cards.
      if(groupBlocks.some(b=>b.stateOnly)){
        results.push(Object.freeze({...card,
          sectionId:"AO.MISSAL."+card.sectionId.slice(-3)+"."+(index+1),
          sourceSectionId:card.sectionId,
          sourceSequence:card.sequence,sequence:null,
          title:labelFor(groupBlocks[0],locale),
          paragraphs:Object.freeze([]),blocks:Object.freeze(groupBlocks),
          eventIds:Object.freeze([]),sourceEventIds:card.eventIds??Object.freeze([]),
          missalPresentation:true,
        }));
      }
      continue;
    }
    const titledBlock=groupBlocks[0];
    if(pendingEmptyBlocks.length){
      groupBlocks=[...pendingEmptyBlocks,...groupBlocks];
      pendingEmptyBlocks=[];
    }
    // Compound Secret/Collect pages can begin with a Proper block whose
    // raw title is the registry key (e.g. SECRET_SET), not a prayer name.
    const properTitle=properTitles[titledBlock.properSlot]??properTitles[titledBlock.title];
    const title=groupBlocks.length===1||properTitle
      ?labelFor(titledBlock,locale):String(titledBlock.title??card.title);
    results.push(Object.freeze({...card,
      sectionId:"AO.MISSAL."+card.sectionId.slice(-3)+"."+(index+1),
      sourceSectionId:card.sectionId,sourceSequence:card.sequence,
      title,sequence:null,paragraphs:Object.freeze(paragraphs),blocks:Object.freeze(groupBlocks),
      eventIds:Object.freeze([]),sourceEventIds:card.eventIds??Object.freeze([]),
      missalPresentation:true,
      provenance:Object.freeze({...card.provenance,displayOnly:true,canonicalTextMutation:false}),
    }));
  }
  if(pendingEmptyBlocks.length){
    const previous=results.at(-1);
    if(!previous)throw new Error("MISSAL_NO_DISPLAYABLE_PRAYER:"+card.sectionId);
    results[results.length-1]=Object.freeze({
      ...previous,blocks:Object.freeze([...previous.blocks,...pendingEmptyBlocks]),
    });
  }
  return results;
}
export function projectGranularMissalCards(model,{language="en"}={}){
  if(!model||!Array.isArray(model.cards))throw new TypeError("Missal source model required");
  if(String(model.presentationMode??"").toUpperCase()!=="MISSAL")return model;
  const cards=[];
  for(const card of model.cards){
    const key=String(card.sourceSectionId??card.sectionId??"").slice(-3);
    const groups=SPLITS[key];
    if(groups && Array.isArray(card.blocks) && card.blocks.length>1)
      cards.push(...subsections(card,groups,{language}));
    else cards.push(card);
  }
  const final=Object.freeze(cards.map((card,i)=>Object.freeze({...card,sequence:i+1})));
  const byId=new Map(final.map(card=>[card.sectionId,card]));
  const neighbor=(id,delta)=>{
    const card=byId.get(String(id));
    return card?final[card.sequence-1+delta]??null:null;
  };
  return Object.freeze({...model,
    schema:"ao-mass-reader-presentation-model-v1",
    structureOwner:"CANONICAL_MISSAL_PRAYER_BLOCK_PRESENTATION",
    sourceStructureOwner:model.structureOwner,
    sourceModelTotalCards:model.totalCards,
    cards:final,totalCards:final.length,
    cardBySequence:n=>Number.isInteger(Number(n))?final[Number(n)-1]??null:null,
    previousCard:id=>neighbor(id,-1),nextCard:id=>neighbor(id,1),
    cardForEvent:undefined,sourceAuthorityModel:model,
  });
}
