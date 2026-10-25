// 1962-use Mass music authority, not a microphone or playback engine.
// Primary norm: SCR, De musica sacra et sacra liturgia (1958), §§16b, 27, 80–85.
// No condition inferred from a Gregorian date or a priest's scroll position.
const freeze=Object.freeze;
const RESTRICTED_SEASONS=new Set(["ADVENT","LENT","PASSIONTIDE"]);
const SEPTUAGESIMA=new Set(["SEPTUAGESIMA","SEXAGESIMA","QUINQUAGESIMA"]);

function verdict(status,reason,paragraphs){
  return freeze({schema:"ao-organ-permission-v1",status,reason,
    authority:freeze(["De musica sacra et sacra liturgia (1958)",...paragraphs]),
    actuallyPlaying:"UNKNOWN",notAnObservation:true});
}

/**
 * The caller must supply a verified liturgical context from the Mass plan;
 * no civil-calendar seasonal guessing or inferred local organ performance.
 * kind: SOLO, ACCOMPANY_CHANT, OTHER_INSTRUMENTS
 * moment: ORDINARY, PRIEST_CHANT, PRIEST_RESPONSE, CONSECRATION,
 *         FINAL_BLESSING, HOLY_THURSDAY_GLORIA
 * office: MASS, VESPERS, BENEDICTION, OTHER
 * exceptionalFeastConfirmed: explicit clerically verified §83a exception
 */
export function resolve1962OrganPermission({
  kind="SOLO",moment="ORDINARY",office="MASS",
  season=null,requiem=false,septEmberFerial=false,
  triduum=false,holyThursdayChrism=false,
  holyThursdayGloria=false,easterVigilGloriaReached=false,
  exceptionalFeastConfirmed=false,organOnlySunday=false,lowMassCustomRelevant=false,
  lowMassRestrictedInterval=false
}={}){
  const use=String(kind).toUpperCase();
  const action=String(moment).toUpperCase();
  const service=String(office).toUpperCase();
  const liturgicalSeason=String(season??"").toUpperCase();
  // §29 is conditional on an interfering instrumental custom at Low Mass.
  // The caller must independently certify that context *and* the stage
  // boundary. Neither the calendar date nor an ordinary 1962 Mass card
  // alone satisfies this condition.
  if(lowMassCustomRelevant===true && lowMassRestrictedInterval===true)
    return verdict("FORBIDDEN","CERTIFIED_LOW_MASS_RESTRICTED_INTERVAL",["29"]);
  if(!["SOLO","ACCOMPANY_CHANT","OTHER_INSTRUMENTS"].includes(use))
    return verdict("REQUIRES_CONTEXT","UNKNOWN_INSTRUMENTAL_USE",["60–69"]);
  if(["PRIEST_CHANT","PRIEST_RESPONSE"].includes(action))
    return verdict("FORBIDDEN","NO_INSTRUMENTS_DURING_PRIEST_CHANT_AND_RITUAL_RESPONSES",["16b"]);
  if(action==="CONSECRATION")
    return verdict("FORBIDDEN","ABSOLUTE_CONSECRATION_SILENCE",["27e"]);
  if(action==="FINAL_BLESSING")
    return verdict("FORBIDDEN","NO_ORGAN_WHILE_PRIEST_GIVES_BLESSING",["27g"]);
  const triduumException=Boolean(holyThursdayChrism || holyThursdayGloria) &&
    use!=="OTHER_INSTRUMENTS";
  if(triduum&&!easterVigilGloriaReached&&!triduumException)
    return verdict("FORBIDDEN","SACRED_TRIDUUM_SILENCE",["84"]);
  if(triduumException&&use!=="OTHER_INSTRUMENTS")
    return verdict("PERMITTED_NOT_OBSERVED","HOLY_THURSDAY_GLORIA_OR_CHRISM_EXCEPTION",["83b","84"]);
  if(service==="BENEDICTION")
    return verdict("PERMITTED_NOT_OBSERVED","BENEDICTION_EXCEPTION_NO_OBSERVATION",["81"]);
  // The Easter Vigil Gloria is the explicit §81b/§84 endpoint of the
  // Lenten instrumental prohibition; otherwise the season label alone
  // would incorrectly keep the organ silent for the Paschal Mass.
  const lentenRestriction=RESTRICTED_SEASONS.has(liturgicalSeason) &&
    !(triduum && easterVigilGloriaReached);
  const seasonalBan=lentenRestriction||Boolean(requiem)||Boolean(septEmberFerial);
  // §83(b): the third Sunday of Advent and the fourth of Lent admit the
  // organ (or harmonium) only; other instruments stay forbidden.
  if(lentenRestriction && organOnlySunday && !requiem && !septEmberFerial)
    return use==="OTHER_INSTRUMENTS"
      ? verdict("FORBIDDEN","GAUDETE_LAETARE_ORGAN_ONLY",["83b"])
      : verdict("PERMITTED_NOT_OBSERVED","GAUDETE_LAETARE_ORGAN_ONLY",["83b"]);
  if(seasonalBan && exceptionalFeastConfirmed && !requiem)
    return verdict("PERMITTED_NOT_OBSERVED","VERIFIED_EXCEPTION_FEAST_OR_EXTRAORDINARY_SOLEMNITY",["83a"]);
  if(seasonalBan){
    if(use==="ACCOMPANY_CHANT"&&["MASS","VESPERS"].includes(service))
      return verdict("ACCOMPANIMENT_ONLY_NOT_OBSERVED","SONG_SUPPORT_EXCEPTION_NOT_SOLO_MUSIC",["81","83c"]);
    return verdict("FORBIDDEN","SEASONAL_OR_REQUIEM_INSTRUMENT_RESTRICTION",["81"]);
  }
  if(SEPTUAGESIMA.has(liturgicalSeason)&&use==="OTHER_INSTRUMENTS")
    return verdict("FORBIDDEN","SEPTUAGESIMA_OTHER_INSTRUMENT_RESTRICTION",["82"]);
  if(!liturgicalSeason && !easterVigilGloriaReached)
    return verdict("REQUIRES_CONTEXT","SEASON_NOT_VERIFIED",["80–85"]);
  return verdict("PERMITTED_NOT_OBSERVED","POTENTIALLY_PERMITTED_NOT_A_CLAIM_OF_SOUND",["60","61","66"]);
}

/**
 * Registry maps the native rite cards to their existing pinned chant source.
 * It DOES NOT replace ordinary reader cues or invent words for processions.
 * Source paths are dot-path selectors into a pinned JSON payload, not music text.
 */
export function resolveRiteMusicScene({registry,riteId,stageId,sourcePayload,condition=null}={}){
  if(registry?.schema!=="ao-mass-special-rite-music-events-v1")
    return freeze({status:"UNAVAILABLE",reason:"RITE_MUSIC_REGISTRY_UNVERIFIED",events:freeze([])});
  const rite=(registry.rites??[]).find(r=>r.id===riteId);
  if(!rite)return freeze({status:"UNAVAILABLE",reason:"RITE_NOT_INDEXED",events:freeze([])});
  const atStage=(rite.events??[]).filter(x=>x.stageId===stageId);
  // Ordinary Asperges and Eastertide Vidi aquam cannot both sound. Nor may
  // an optional burial procession be inferred simply from a Requiem.
  const hits=atStage.filter(e=>e.condition==="ANY" ||
    (condition!=null && e.condition===condition));
  if(atStage.length && !hits.length){
    return freeze({schema:"ao-special-rite-music-scene-v1",
      status:"REQUIRES_CONTEXT",riteId,stageId,events:freeze([])});
  }
  const events=hits.map(e=>{
    const sourceFound=e.sourcePaths.map(path=>{
      const value=path.split(".").reduce((acc,key)=>acc?.[key],sourcePayload);
      if(value==null)throw new Error("Missing pinned rite chant source "+riteId+":"+path);
      return freeze({path,available:true});
    });
    return freeze({id:e.id,stageId:e.stageId,kind:e.kind,performers:e.performers,
      status:e.kind==="SOURCE_HOLD"?"NOT_SPECIFIED":"EXPECTED_NOT_OBSERVED",
      sourceFound:freeze(sourceFound),sourceFile:rite.sourceFile,
      sourceOwner:e.sourceOwner,condition:e.condition,
      endBoundary:e.endBoundary,segmentScope:e.segmentScope??null,actuallySinging:"UNKNOWN"});
  });
  return freeze({schema:"ao-special-rite-music-scene-v1",
    status:!hits.length?"NO_INDEXED_MUSIC":
      hits.every(e=>e.kind==="SOURCE_HOLD")?"NOT_SPECIFIED":"EXPECTED_NOT_OBSERVED",
    riteId,stageId,lifecycle:rite.lifecycle,events:freeze(events)});
}
