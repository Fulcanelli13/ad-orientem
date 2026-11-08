import {applyMissionSundayCollect} from "./1962-mission-sunday-source.js";
import {projectJune30InseparableApostles} from "./1962-inseparable-apostles-source.js";
import {project1962TwoCommemorations} from "./1962-multiple-commemoration-source.js";
import {select1962PassionFridayCommemorationsForMassForm} from "./1962-passion-friday-commemorations.js";
// Shared source-first 1962 Mass-form oration projection.
// Certified scope: source-identified single II-class Sunday feast and privileged Sunday / Advent feria.
// Never infer universal privileges from feast titles, colours or typography.
// 1960 General Rubrics 109-112 and Missal Rubrics 433-445:
// https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html
// https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html

const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const GROUPS=["collects","secrets","postcommunions"];
const sourceText=row=>Boolean(row&&String(row.lat??row.la??"").trim()&&
  String(row.en??"").trim()&&String(row.fr??"").trim());
const array=value=>Array.isArray(value)?value:[];
function untouched(proper,reason){
  return Object.freeze({status:"UNVERIFIED",reason,proper});
}
function unwrap(proper){
  return proper?.data&&typeof proper.data==="object"?
    {data:proper.data,envelope:proper}: {data:proper,envelope:null};
}
function canonical(path){return String(path??"").trim().replace(/^\/+|\/+$/g,"").toLowerCase();}
function rowPath(row){return row?.prayerSourcePath??row?.path??null;}
function isCalendarMass(celebrationId){
  return [null,"","mass_of_day"].includes(celebrationId);
}
/**
 * Source-owned (rather than reader-owned) selection from an already resolved
 * 1962 day and its complete, ordered, trilingual Proper.
 * Other classes, extra commemorations, local and conventual variants remain
 * UNVERIFIED until their authoritative source classification is available.
 * Privileged classes follow 1960 General Rubrics §§108, 111(a), 113
 * and Missal §434(a). The resolved source owns the identity and ranks.
 * Do not equate the Mission Sunday §453 prayer under one conclusion with
 * an ordinary Calendar commemoration.
 */
export function select1962CommemorationsForMassForm({
  proper,calendarResolution,form,celebrationId="mass_of_day",
  isConventual=false,observedSource=false,
}={}){
  const normalizedForm=String(form??"").toUpperCase();
  if(!FORMS.has(normalizedForm))return untouched(proper,"UNSUPPORTED_FORM");
  if(!isCalendarMass(celebrationId)||observedSource)return untouched(proper,"ALTERNATE_FORMULARY");
  if(isConventual!==false)return untouched(proper,"CONVENTUAL_RULES_NOT_VERIFIED");
  const {data,envelope}=unwrap(proper);
  const day=calendarResolution?.day,main=day?.main;
  if(!data||!main||calendarResolution?.status!=="ready"||!calendarResolution?.date)
    return untouched(proper,"SOURCE_DAY_UNAVAILABLE");
  if(String(data.sourcePath??envelope?.sourcePath??"").trim()==="")
    return untouched(proper,"PROPER_SOURCE_UNAVAILABLE");
  // A historical 2026 Calendar source lists only Seven Sorrows here,
  // while the universal Roman 1962 Mass also commemorates St John
  // Damascene. The independently verified *Mass source* may supplement
  // this single display token for a nonconventual form, but may never
  // alter the underlying Calendar or admit an alternate SSPX festal Mass.
  if(calendarResolution.date==="2026-03-27"&&
    main.id==="tempora:Quad5-5Feria:3:v"&&
    data.verifiedPassionFridayCommemorations?.status==="SOURCE_VERIFIED"){
    const special=select1962PassionFridayCommemorationsForMassForm({
      proper, date:calendarResolution.date,principalId:main.id,
      form:normalizedForm,celebrationId,
      requestedCelebrationId:"mass_of_day",celebrationType:"CALENDAR",
      isConventual,observedSource
    });
    if(special.status==="CERTIFIED")return special;
    return untouched(proper,"PASSION_FRIDAY_TWO_SOURCE_FORM_PENDING");
  }
  const comms=array(day.commemorations);
  if(comms.length===0)return untouched(proper,"NO_COMMEMORATIONS");
  // Do not equate complete-looking source arrays with certified Mass prayers.
  // §§111-114 restrict the number, priority and form applicability of
  // multiple commemorations; a Source day may have more entries than a Mass.
  // Until the source resolver has matched and prioritized each entry, leave
  // its Calendar inventory and raw texts intact but explicitly block the
  // reader's claim that this form's oration sets are complete.
  if(comms.length>1){
    const verified=project1962TwoCommemorations({proper,calendarResolution,form:normalizedForm});
    if(verified.status==="CERTIFIED")return verified;
    const decision=Object.freeze({
      status:"UNVERIFIED",source:"1962_PROPER_RESOLVER",
      form:normalizedForm,calendarCount:comms.length,
      reason:"MULTIPLE_COMMEMORATIONS_SOURCE_PRIORITY_PENDING",
      detail:verified.reason,
      authorities:Object.freeze(["1960_GENERAL_RUBRICS_110_114",
        "1960_MISSAL_RUBRICS_433_438"]),
    });
    const blocked=Object.freeze({...data,commemorationFormDecision:decision});
    return untouched(envelope?Object.freeze({...envelope,data:blocked}):blocked,
      decision.reason);
  }
  // §110: a reciprocal St Peter/Paul commemoration belongs INSIDE
  // each source oration group and counts as a single prayer. Handle before
  // the ordinary one-to-one calendar/oration matching logic.
  if(comms.some(c=>c?.inseparable)){
    const projected=projectJune30InseparableApostles({proper,calendarResolution,
      form:normalizedForm});
    if(projected.status==="CERTIFIED")return projected;
    const blocked=Object.freeze({...data,
      inseparableOrationsDecision:Object.freeze({status:"UNVERIFIED",
        reason:projected.reason,source:"1960_GENERAL_RUBRICS_110"})});
    return untouched(envelope?Object.freeze({...envelope,data:blocked}):blocked,
      "INSEPARABLE_"+projected.reason);
  }
  const sunday=new Date(String(calendarResolution.date)+"T12:00:00Z").getUTCDay()===0;
  const only=comms[0],sources=array(data.calendarCommemorations).filter(x=>!x?.inseparable);
  // Calendar identity is the named weekday path, NOT necessarily its
  // prayer text's inherited Sunday template (e.g. Advent Adv1-1 / Adv1-0).
  // Require the actual observance paths to match before considering aliases.
  const namedSource=sources[0]??null;
  const observedPath=canonical(only?.path);
  const prayerPath=canonical(namedSource?.prayerSourcePath??namedSource?.path);
  const inSeasonAlias=/^tempora\/adv[1-4]-[1-6]$/.test(observedPath)&&
    prayerPath===observedPath.replace(/-[1-6]$/,"-0");
  const admissiblePrayerSource=prayerPath===observedPath||inSeasonAlias;
  // A IV-class universal feria is a generic Calendar observance without a
  // physical main.path. Its selected Proper legitimately inherits a Sunday
  // source. Trust that exact RESOLVED source identity only in the narrow
  // post-Pentecost ordinary-feria category, never in a saint/votive case.
  // Other nonconventual IV-class Roman ferias (before Lent, during
  // Eastertide, post-Pentecost continuation, and the 5 January feria).
  // Their Calendar main owner is :feria:4:w without a physical main.path,
  // while the *resolved* Proper inherits a named seasonal/Octave source.
  // Require a narrowly identified original template, never infer that
  // any arbitrary source on a generic date is a lawful principal Mass.
  const fourthClassFeriaSource=String(data.sourcePath??envelope?.sourcePath??"");
  const ordinaryGenericFeriaSource=main?.path==null&&
    String(main?.id??"")===":feria:4:w"&&Number(main.rank)===4&&
    (/^Tempora\/(?:Quadp[0-9]+-0|Pasc[0-9]+-0|Pent[0-9]+-0[ar]?)$/.test(fourthClassFeriaSource)||
     (calendarResolution.date==="2026-01-05"&&fourthClassFeriaSource==="Sancti/01-01"));
  const inheritedPentecostFeria=main?.path==null&&
    String(main?.id??"")===":feria:4:w"&&Number(main.rank)===4&&
    /^Tempora\/Pent[0-9]{1,2}-0$/.test(String(data.sourcePath??envelope?.sourcePath??""));
  const matchedPrincipalSource=inheritedPentecostFeria||ordinaryGenericFeriaSource||
    canonical(data.sourcePath??envelope?.sourcePath)===canonical(main.path);
  const identified=comms.length===1&&sources.length===1&&
    canonical(namedSource.path)===observedPath&&admissiblePrayerSource&&
    matchedPrincipalSource&&
    !only.inseparable&&!namedSource.inseparable;
  if(!identified)return untouched(proper,"RUBRICAL_CLASSIFICATION_PENDING");
  const mainId=String(main.id??""),commId=String(only.id??"");
  const ordinarySunday=sunday&&Number(main.rank)===2&&Number(only.rank)===2&&
    /^tempora:[a-z0-9-]+-0:2:/i.test(mainId)&&
    /^sancti:/i.test(commId)&&!only.privileged;
  // §108(a): an impeded Sunday is privileged in every Mass form; the
  // principal universal I-class feast keeps its own source identity.
  const privilegedSunday=sunday&&Number(main.rank)===1&&Number(only.rank)===2&&
    /^sancti:[0-9]{2}-[0-9]{2}:1:/i.test(mainId)&&
    /^tempora:[a-z0-9-]+-0:2:/i.test(commId)&&
    /^Tempora\/[A-Za-z0-9]+-0$/i.test(String(only.path??""));
  // §108(e): a displaced Advent feria is privileged even in Sung Mass.
  // The prayerSourcePath may be the canonical Sunday-template alias but
  // the actual commemoration PATH must identify the named weekday.
  const privilegedAdvent=/^sancti:[0-9]{2}-[0-9]{2}:[123]:/i.test(mainId)&&
    [1,2,3].includes(Number(main.rank))&&Number(only.rank)===3&&
    /^tempora:Adv[1-4]-[1-6]:3:/i.test(commId)&&
    /^Tempora\/Adv[1-4]-[1-6]$/i.test(String(only.path??""));
  // RG 25(a), 108(e), 111(a): the displaced III-class feria of Lent
  // or Passiontide is privileged beneath an actually selected I/II-class
  // sanctoral Mass. This is true in all four non-conventual forms.
  // Require exact original 1962 principal, feria, rank and prayer ownership:
  // the calendar commemorative label by itself does not authorize a prayer.
  const privilegedLentenFeria=!sunday&&[1,2].includes(Number(main.rank))&&
    Number(only.rank)===3&&
    /^sancti:[0-9]{2}-[0-9]{2}:[12]:/i.test(mainId)&&
    /^tempora:Quad[1-5]-[1-6](?:Feria)?:3:/i.test(commId)&&
    /^Tempora\/Quad[1-5]-[1-6]$/.test(String(only.path??""));
  // RG 109(c): days in the Octave of Christmas are privileged
  // commemorations in ALL Mass forms, even though the host's synthetic
  // 12-26c/12-28c placeholder carries an incorrect IV-class source rank
  // and no separate oration text. Trust only the *verified* original
  // threefold source witness inside the St Stephen/Holy Innocents Proper.
  const nativityOctaveDate=String(calendarResolution.date)==="2026-12-26"?
    "Sancti/12-26":"Sancti/12-28";
  const nativityOctaveOwner=
    ["2026-12-26","2026-12-28"].includes(String(calendarResolution.date))&&
    !sunday&&Number(main.rank)===2&&Number(only.rank)===4&&
    String(main.path)===nativityOctaveDate&&
    String(only.path)===nativityOctaveDate+"c"&&
    namedSource.prayerSourcePath===nativityOctaveDate+"c"&&
    data.verifiedNativityOctaveCommemoration?.status==="SOURCE_VERIFIED"&&
    data.verifiedNativityOctaveCommemoration?.calendarDate===calendarResolution.date&&
    data.verifiedNativityOctaveCommemoration?.principalId===mainId&&
    data.verifiedNativityOctaveCommemoration?.originalChristmasSource==="Sancti/12-25m3"&&
    data.verifiedNativityOctaveCommemoration?.privilege==="RG_108_AND_109_C"&&
    data.verifiedNativityOctaveCommemoration?.orationCount===2;
  // The host's 12-26c/12-28c placeholders masquerade as ordinary
  // IV-class sanctoral sources. They are NOT IV-class commemoration prayers.
  // The source-verified Nativity-octave branch above is the only allowed
  // way to admit their Christmas Collect, Secret and Postcommunion.
  // Otherwise fail closed, including when proof metadata was stripped.
  const nativityOctavePlaceholder=
    ["2026-12-26","2026-12-28"].includes(String(calendarResolution.date))&&
    ["Sancti/12-26","Sancti/12-28"].includes(String(main.path??""))&&
    String(only.path??"")===String(main.path)+"c";
  // General Rubrics §111(c–d), Missal §434(a,c,d): one source-identified
  // ordinary IV-class commemoration is retained in a non-Sunday Low Mass
  // of II/III class but omitted in a non-conventual sung Mass. This is
  // source-owned, not a feast-name lookup or an institution's local Ordo.
  // Class IV ferias without an identified principal source stay withheld.
  const typedSanctoralMain=/^sancti:[0-9]{2}-[0-9]{2}[a-z]*:[23]:/i.test(mainId)&&
    /^Sancti\/[0-9]{2}-[0-9]{2}[a-z]*$/.test(String(main.path??""))&&
    [2,3].includes(Number(main.rank));
  const typedAdventMain=/^tempora:Adv[1-4]-[1-6]:3:/i.test(mainId)&&
    /^Tempora\/Adv[1-4]-[1-6]$/.test(String(main.path??""))&&
    Number(main.rank)===3;
  // 1960 General Rubrics §§25(a), 108, 111(a,d), 112-114:
  // a Lent/Passiontide III-class feria is the principal celebration
  // when a III-class sanctoral feast is impeded. An authenticated
  // ordinary sanctoral commemoration is kept in nonconventual Low Mass;
  // the same ordinary commemoration is omitted in nonconventual
  // Masses in cantu. Ember and Holy Week ferias are not IV-class
  // or III-class generic cases and must retain separate rite ownership.
  const ordinaryLentenFeria=!sunday&&Number(main.rank)===3&&
    /^tempora:Quad[1-5]-[1-6]:3:/i.test(mainId)&&
    /^Tempora\/Quad[1-5]-[1-6]$/.test(String(main.path??""))&&
    [3,4].includes(Number(only.rank))&&!only.privileged&&
    /^sancti:[0-9]{2}-[0-9]{2}[a-z]*:[34]:/i.test(commId)&&
    /^Sancti\/[0-9]{2}-[0-9]{2}[a-z]*$/.test(String(only.path??""));
  // 1960 General Rubrics §§78–79, 108–114: Saturday BVM is the
  // selected IV-class Mass when the IV-class Saturday office permits it.
  // Its selected Commune C10c/C10t source is distinct from a conventual
  // or independently requested BVM votive Mass; the earlier celebrationId
  // guard excludes observed/local alternatives. A named IV-class saint
  // is an ordinary commemoration, retained in Low but not in cantu.
  const saturday=new Date(String(calendarResolution.date)+"T12:00:00Z")
    .getUTCDay()===6;
  const saturdayBvmSource=saturday&&!sunday&&Number(main.rank)===4&&
    /^commune:C10[ct]:4:/i.test(mainId)&&
    /^Commune\/C10[ct]$/.test(String(main.path??""))&&
    /^Sancti\/[0-9]{2}-[0-9]{2}[a-z]*$/.test(String(only.path??""))&&
    Number(only.rank)===4&&!only.privileged&&
    /^sancti:[0-9]{2}-[0-9]{2}[a-z]*:4:/i.test(commId);
  // A source-owned ordinary IV-class saint on a *generic* IV-class feria,
  // with the original Collect, Secret and Postcommunion independently
  // present in all three languages. Main source is the genuine inherited
  // Proper, not the saint's own orphaned commemorative text.
  const ordinaryGenericFourthClassFeria=ordinaryGenericFeriaSource&&
    !sunday&&Number(only.rank)===4&&!only.privileged&&
    /^sancti:[0-9]{2}-[0-9]{2}[a-z]*:4:/i.test(commId)&&
    /^Sancti\/[0-9]{2}-[0-9]{2}[a-z]*$/.test(String(only.path??""));
  // Ordinary commemoration on a IV-class feria after Pentecost.
  // General Rubrics §§108–114: source-identified ordinary commemorations
  // are retained in the Low Mass but not nonconventual Masses in cantu.
  // A weekday's inherited Sunday Proper remains the principal source;
  // neither its inherited Sunday text nor the saint name proves a feast.
  // Other IV-class contexts (Saturday BVM, Christmas/Epiphany, special
  // vigils, institute calendars) remain outside this narrow certification.
  const ordinaryPentecostFeria=inheritedPentecostFeria&&!sunday&&
    Number(only.rank)===4&&!only.privileged&&
    /^sancti:[0-9]{2}-[0-9]{2}[a-z]*:4:/i.test(commId)&&
    /^Sancti\/[0-9]{2}-[0-9]{2}[a-z]*$/.test(String(only.path??""));
  const ordinaryFourthClassSaint=!nativityOctavePlaceholder&&!sunday&&
    !only.privileged&&
    Number(only.rank)===4&&/^sancti:[0-9]{2}-[0-9]{2}[a-z]*:4:/i.test(commId)&&
    /^Sancti\/[0-9]{2}-[0-9]{2}[a-z]*$/i.test(String(only.path??""))&&
    (typedSanctoralMain||typedAdventMain);
  const scope=nativityOctaveOwner?"PRIVILEGED_CHRISTMAS_OCTAVE_II_CLASS_MASS":
    privilegedSunday?"PRIVILEGED_SUNDAY_UNDER_I_CLASS_SANCTORAL":
    privilegedAdvent?"PRIVILEGED_ADVENT_FERIA_UNDER_SANCTORAL":
    privilegedLentenFeria?(Number(main.rank)===1?
      "PRIVILEGED_LENT_PASSION_FERIA_UNDER_I_CLASS_SANCTORAL":
      "PRIVILEGED_LENT_PASSION_FERIA_UNDER_II_CLASS_SANCTORAL"):
    ordinarySunday?"II_CLASS_SUNDAY_SINGLE_II_CLASS_SANCTORAL_FEAST_NON_CONVENTUAL":
    ordinaryFourthClassSaint?"NON_SUNDAY_II_III_CLASS_SINGLE_IV_CLASS_SANCTORAL_COMMEMORATION":
    ordinaryPentecostFeria?"PENTECOST_SEASON_IV_CLASS_FERIA_ORDINARY_COMMEMORATION":
    ordinaryLentenFeria?"LENT_PASSION_III_CLASS_FERIA_ORDINARY_COMMEMORATION":
    saturdayBvmSource?"SATURDAY_BVM_IV_CLASS_ORDINARY_SANCTORAL_COMMEMORATION":
    ordinaryGenericFourthClassFeria?"GENERIC_IV_CLASS_FERIA_ORDINARY_SANCTORAL_COMMEMORATION":null;
  if(!scope)return untouched(proper,"RUBRICAL_CLASSIFICATION_PENDING");
  if(!GROUPS.every(key=>array(data[key]).length===2&&data[key].every(sourceText)))
    return untouched(proper,"ORATION_SOURCE_INCOMPLETE");
  const include=nativityOctaveOwner||privilegedSunday||privilegedAdvent||
    privilegedLentenFeria||normalizedForm==="LOW";
  const applied=include?comms:[],omitted=include?[]:comms;
  const decision=Object.freeze({
    status:"CERTIFIED",source:"1962_PROPER_RESOLVER",form:normalizedForm,
    calendarCount:1,appliedCount:applied.length,
    scope,
    authorities:Object.freeze(nativityOctaveOwner?
      ["1960_GENERAL_RUBRICS_108_109_C_111","1960_MISSAL_RUBRICS_433_434"]:
      privilegedLentenFeria?
        ["1960_GENERAL_RUBRICS_25_A_108_E_111_A_113","1960_MISSAL_RUBRICS_433_434"]:
      ordinaryLentenFeria?
        ["1960_GENERAL_RUBRICS_25_A_111_A_D_112_113_114","1960_MISSAL_RUBRICS_433_434"]:
      ordinaryFourthClassSaint?
        ["1960_GENERAL_RUBRICS_111_C_D_112_113","1960_MISSAL_RUBRICS_433_434"]:
      saturdayBvmSource?
        ["1960_GENERAL_RUBRICS_78_79_111_D_112_113_114","1960_MISSAL_RUBRICS_433_434"]:
      ordinaryGenericFourthClassFeria?
        ["1960_GENERAL_RUBRICS_108_111_D_112_113_114","1960_MISSAL_RUBRICS_433_434"]:
      ordinaryPentecostFeria?
        ["1960_GENERAL_RUBRICS_108_111_D_112_113_114","1960_MISSAL_RUBRICS_433_434"]:
        ["1960_GENERAL_RUBRICS_108_111_113","1960_MISSAL_RUBRICS_433_434"]),
    mainId,commemorationId:commId
  });
  const selected=Object.freeze({...data,
    collects:Object.freeze((include?data.collects:data.collects.slice(0,1)).slice()),
    secrets:Object.freeze((include?data.secrets:data.secrets.slice(0,1)).slice()),
    postcommunions:Object.freeze((include?data.postcommunions:data.postcommunions.slice(0,1)).slice()),
    // Keep the complete Calendar inventory distinct from prayers at this Mass.
    appliedCommemorations:Object.freeze(applied.map(x=>Object.freeze({...x}))),
    omittedCommemorations:Object.freeze(omitted.map(x=>Object.freeze({...x}))),
    commemorationFormDecision:decision,
  });
  // The §453 missionary Collect is NOT a Calendar commemoration. It joins
  // the *first selected Collect* under one conclusion, before any separate
  // privileged/ordinary commemoration; never adds Secret/Postcommunion.
  const mission=applyMissionSundayCollect({
    proper:selected,calendarResolution,form:normalizedForm,celebrationId,
    competingUnderOneConclusion:Array.isArray(data.oneConclusionCollects)?
      data.oneConclusionCollects:[],
  });
  if(mission.status==="UNVERIFIED"){
    const blocked=Object.freeze({...selected,
      missionSundayCollectDecision:Object.freeze({status:"UNVERIFIED",
        reason:mission.reason,source:"1960_MISSAL_453",
        date:calendarResolution.date,form:normalizedForm})});
    return untouched(envelope?Object.freeze({...envelope,data:blocked}):blocked,
      "MISSION_SUNDAY_"+mission.reason);
  }
  const selectedWithMission=mission.status==="APPLIED"?mission.proper:selected;
  const result=envelope?Object.freeze({...envelope,data:selectedWithMission}):selectedWithMission;
  return Object.freeze({status:"CERTIFIED",reason:null,proper:result,decision,
    missionSunday:mission.status==="APPLIED"?mission.decision:null});
}
