import {resolve1962OrganPermission} from "./reader-rite-music-authority.js";

// Presentation only; the existing 1958 authority decides the norm.
// No clock, microphone, MIDI state, liturgical-calendar guess, or local-organ claim.
const freeze=Object.freeze;
const SEASONS=new Set([
  "ADVENT","LENT","PASSIONTIDE","SEPTUAGESIMA","SEXAGESIMA",
  "QUINQUAGESIMA","CHRISTMAS","EPIPHANY","EASTER","PENTECOST","ORDINARY"
]);

function verifiedOrdinaryContext(resolvedMass){
  // Low Mass has additional §29 positional restrictions. Do not project the
  // sung-Mass permissions onto its card spans without that separate model.
  if(resolvedMass?.form==="LOW")return null;
  // Existing resolved Requiem ownership is sufficient for the general
  // no-solo-organ rule; chant accompaniment is a distinct §83c question.
  const requiem=resolvedMass?.overlays?.includes("REQUIEM")===true;
  // The product does not yet guarantee a universally source-owned season
  // field. Trust only an explicitly verified 1962 plan field, never date/title.
  const declared=resolvedMass?.provenance?.organ1962;
  const season=declared?.verified===true &&
    declared?.source==="LITURGICAL_PLAN_1962" &&
    SEASONS.has(String(declared.season??"").toUpperCase())
    ? String(declared.season).toUpperCase() : null;
  if(!requiem&&!season)return null;
  return {
    season,requiem,
    triduum:declared?.verified===true && declared?.triduum===true,
    septEmberFerial:declared?.verified===true && declared?.septEmberFerial===true,
    exceptionalFeastConfirmed:declared?.verified===true &&
      declared?.exceptionalFeastConfirmed===true,
  };
}

function verdictFor(context,{scope,reason=null}={}){
  const solo=resolve1962OrganPermission({...context,kind:"SOLO"});
  const accompaniment=resolve1962OrganPermission({...context,kind:"ACCOMPANY_CHANT"});
  if(solo.status==="REQUIRES_CONTEXT"||accompaniment.status==="REQUIRES_CONTEXT")
    return null;
  const silent=solo.status==="FORBIDDEN"&&accompaniment.status==="FORBIDDEN";
  const support=solo.status==="FORBIDDEN"&&
    accompaniment.status==="ACCOMPANIMENT_ONLY_NOT_OBSERVED";
  const permitted=solo.status==="PERMITTED_NOT_OBSERVED";
  if(!silent&&!support&&!permitted)return null;
  const status=silent?"SILENT":support?"ACCOMPANIMENT_ONLY":"PERMITTED";
  const label=status==="SILENT"?"1958 RULE · ORGAN SILENT":
    status==="ACCOMPANIMENT_ONLY"?"1958 RULE · CHANT ACCOMPANIMENT ONLY":
    "1958 RULE · ORGAN PERMITTED";
  const description=(reason??"1958 liturgical permission")+
    ". A liturgical rule, not evidence of organ sound or real-time performance.";
  return freeze({
    schema:"ao-reader-organ-permission-note-v1",
    status,label,description,scope:scope??null,
    solo:solo.status,accompaniment:accompaniment.status,
    authority:freeze([...new Set([...solo.authority,...accompaniment.authority])]),
    actuallyPlaying:"UNKNOWN",notAnObservation:true,
    sourceOwner:"EXISTING_1958_ORGAN_PERMISSION",
  });
}

/**
 * Render source-stage *permissions*, not stage performance observations.
 *
 * Good Friday: its complete distinct rite is in the Triduum silence.
 * Easter Vigil: source-owned vigil stays silent through its Kyrie Mass entry.
 * The Gloria card is the 1958 end boundary, not evidence that its chant was
 * heard. The 1962 section identity is resolved from the certified Mass model.
 * Ordinary Mass: only verified liturgical-plan context or resolved Requiem.
 */
export function project1962ReaderOrganNote({
  riteId=null,stageId=null,massCard=null,massModel=null,resolvedMass=null,
}={}){
  if(riteId==="GOOD_FRIDAY"){
    if(!/^GF-/.test(String(stageId??"")))return null;
    return verdictFor({season:"PASSIONTIDE",triduum:true},{
      scope:stageId,reason:"Sacred Triduum: complete instrumental silence (§84)"
    });
  }
  if(riteId==="HOLY_THURSDAY_POST"){
    if(!/^HT-R/.test(String(stageId??"")))return null;
    return verdictFor({season:"LENT",triduum:true},{
      scope:stageId,reason:"Holy Thursday after the Gloria; Triduum silence (§84)"
    });
  }
  if(riteId==="REQUIEM_ABSOLUTION"){
    if(!/^ABS-R/.test(String(stageId??"")))return null;
    return verdictFor({requiem:true,office:"OTHER"},{
      scope:stageId,reason:"Office of the Dead outside Mass or Vespers (§81)"
    });
  }
  if(riteId==="CORPUS_CHRISTI_PROCESSION"){
    if(!["CORPUS-R04","CORPUS-R05"].includes(String(stageId??"")))return null;
    return verdictFor({office:"BENEDICTION",season:"ORDINARY"},{
      scope:stageId,reason:"Benediction of the Blessed Sacrament exception (§81)"
    });
  }
  if(riteId==="EASTER_VIGIL"){
    if(!/^EV-/.test(String(stageId??"")))return null;
    return verdictFor({season:"LENT",triduum:true},{
      scope:stageId,reason:"Before the Easter Vigil Mass Gloria (§84)"
    });
  }
  if(riteId==="EASTER_VIGIL_MASS"){
    if(massModel?.easterVigil!==true||!massCard)return null;
    const cards=massModel.cards??[];
    const current=cards.find(card=>card.sectionId===massCard.sectionId);
    const gloria=cards.find(card=>
      (card.sourceSectionId??card.sectionId)==="AO.CARD.003");
    if(!current||!gloria||!Number.isInteger(current.sequence)||
       !Number.isInteger(gloria.sequence))return null;
    const fromGloria=current.sequence>=gloria.sequence;
    return verdictFor({
      season:"LENT",triduum:true,easterVigilGloriaReached:fromGloria,
    },{
      scope:current.sectionId,
      reason:fromGloria
        ? "At or after the Easter Vigil Gloria in the source Mass order; §16b still forbids accompaniment of the celebrant's own intonation"
        : "Before the Easter Vigil Gloria (§84)",
    });
  }
  if(riteId!=null)return null;
  if(!massCard)return null;
  // The two canonical Consecration prayer blocks own this universal silent
  // moment independently of the calendar, organ, reader form or season.
  if((massCard.blocks??[]).some(block=>
    ["AO.SM.B052","AO.SM.B053"].includes(block.blockId))){
    return verdictFor({moment:"CONSECRATION"},{
      scope:massCard.sectionId,
      reason:"During the Consecration instrumental music ceases (§27e)",
    });
  }
  const context=verifiedOrdinaryContext(resolvedMass);
  if(!context)return null;
  // §83b permits organ from the *beginning* of Holy Thursday's evening
  // Mass through the END of Gloria, not merely while Gloria is on-screen.
  // Source-owned 001–003 are the opening, Kyrie and Gloria; never infer
  // this from the civil date or a user's movement across cards.
  const sourceSection=massCard.sourceSectionId??massCard.sectionId;
  const earlyHolyThursday=["AO.CARD.001","AO.CARD.002","AO.CARD.003"]
    .includes(sourceSection);
  const holyThursdayGloria=context.triduum===true &&
    resolvedMass?.provenance?.organ1962?.holyThursdayMass===true && earlyHolyThursday;
  const holyThursdayChrism=context.triduum===true &&
    resolvedMass?.provenance?.organ1962?.holyThursdayChrism===true;
  return verdictFor({...context,holyThursdayGloria,holyThursdayChrism},{
    scope:massCard.sectionId,
    reason:context.requiem
      ? "Office or Mass of the Dead; solo organ is prohibited, subject to chant-support rules"
      : "Source-verified season or day in the 1962 Mass plan",
  });
}
