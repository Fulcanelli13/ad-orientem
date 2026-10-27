// Independent *read-only* Preface audit for the canonical general Roman
// 1962 Mass of the day. It MUST NOT select or repair texts for the reader.
// Governing rule: 1960 Missal RGMR §§482-499; a commemoration never brings
// its own Preface (§483). Particular Ordos and votive Masses are separate.
export const ORDO_1962_PREFACE_REVIEW_VERSION="ao-1962-preface-review-v1";
export const PREFACE_RUBRIC_SOURCE="https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html";
const text=v=>typeof v==="string"?v.trim():"";
const canonical=v=>text(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/[æǽ]/gi,"ae").replace(/[œ]/gi,"oe").toLowerCase();
const sourceId=id=>/^(?:sancti|tempora|commune):[a-z0-9:-]+$/i.test(id)||id===":feria:4:w";
const fail=(status,reason,base={})=>Object.freeze({
  status,reason,scope:"GENERAL_ROMAN_1962",expected:null,actual:null,
  clause:null,sourceUrl:PREFACE_RUBRIC_SOURCE,heading:null,
  trilingualTextComplete:false,autoPublish:false,changesReader:false,...base
});
const rule=(category,clause,basis)=>Object.freeze({category,clause,basis});
// §299 supplies a preceding Sunday Proper to an ordinary feria, while
// §§489(b), 490(b) govern Preface inheritance. Do NOT generalise this to
// saints, votives, non-white days, unknown source paths or a simple date guess.
function romanEasterUtc(year){
  // Gregorian computus, used only as independent seasonal boundary evidence.
  const a=year%19,b=Math.floor(year/100),c=year%100;
  const d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25);
  const g=Math.floor((b-f+1)/3);
  const h=(19*a+b-d-g+15)%30;
  const i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k+7)%7;
  const m=Math.floor((a+11*h+22*l)/451);
  const month=Math.floor((h+l-7*m+114)/31);
  const day=((h+l-7*m+114)%31)+1;
  return Date.UTC(year,month-1,day);
}
function inheritedSundayFeriaPreface(id,date,rank,colour,sourcePath){
  if(id!==":feria:4:w"||rank!==4||colour!=="white")return null;
  const inherited=/^Tempora\/Pasc([1-6])-0$/.exec(sourcePath);
  if(!inherited||!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;
  const year=Number(date.slice(0,4));
  if(year<1900||year>2099)return null; // independent computus tested range
  const day=Date.parse(date+"T12:00:00.000Z");
  if(!Number.isFinite(day))return null;
  const easter=romanEasterUtc(year);
  const days=Math.round((day-Date.UTC(year,0,1,12))/86400000)-
    Math.round((easter-Date.UTC(year,0,1))/86400000);
  const week=Number(inherited[1]);
  // Never inherit from an unrelated preceding or following Sunday source.
  if(days<=week*7||days>week*7+6)return null;
  if(days>=1&&days<=38)
    return rule("PASCHALIS","489_B","SOURCE_MATCHED_INHERITED_PASCHAL_FERIA");
  if(days>=40&&days<=47)
    return rule("ASCENSIO","490_B","SOURCE_MATCHED_INHERITED_ASCENSION_FERIA");
  return null;
}


const utcDate=date=>Date.parse(date+"T12:00:00.000Z");
const withinDays=(actual,start,low,high)=>{
  // Actual source dates are validated at 12:00 UTC; independent feast
  // boundaries are UTC midnight. Floor avoids treating noon as next day.
  const n=Math.floor((actual-start)/86400000);
  return n>=low&&n<=high;
};
function firstAdventSundayUtc(year){
  const dec3=Date.UTC(year,11,3);
  return dec3-new Date(dec3).getUTCDay()*86400000;
}
function thirdSeptemberSundayUtc(year){
  const sept1=Date.UTC(year,8,1);
  return sept1+((7-new Date(sept1).getUTCDay())%7+14)*86400000;
}
// Prove a common-family identity AND its temporal entitlement. These are
// original source/rubric heading AUDITS only, never changes to the reader.
// The donor source for C10* needs its own provenance: the Missal's §309(a)
// expressly names Mary's Saturday Masses; §495 supplies their Preface.
function sourceOwned1962FeriaAndSaturday(id,date,rank,colour,sourcePath){
  const year=Number(date.slice(0,4));
  if(year<1900||year>2099)return null;
  const actual=utcDate(date);
  if(!Number.isFinite(actual))return null;
  const weekday=new Date(actual).getUTCDay();
  const md=date.slice(5);
  if(rank===4&&colour==="white"&&id===":feria:4:w"){
    if(md>="01-02"&&md<="01-05"&&sourcePath==="Sancti/01-01")
      return rule("NATIVITATE","484_B","SOURCE_MATCHED_NATIVITY_SEASON_FERIA");
    if(md>="01-07"&&md<="01-13"&&
      (sourcePath==="Sancti/01-06"||sourcePath==="Tempora/Epi1-0a"))
      return rule("EPIPHANIA","485_B","SOURCE_MATCHED_EPIPHANY_SEASON_FERIA");
  }
  // The generic fallback identity ends in ':w', but the actual 1962
  // Septuagesima feria is VIOLET. Never use the suffix as vestment evidence.
  if(rank===4&&id===":feria:4:w"&&colour==="violet"){
    const prelent=/^Tempora\/Quadp([1-3])-0$/.exec(sourcePath);
    if(prelent){
      const week=Number(prelent[1]);
      const start=romanEasterUtc(year)-63*86400000+(week-1)*7*86400000;
      if(weekday!==0&&withinDays(actual,start,1,6))
        return rule("COMMUNIS","498","SOURCE_MATCHED_PRELENT_FERIA");
    }
  }
  if(rank===4&&colour==="white"&&weekday===6){
    const suffix=/^commune:C10(b|c|Pasc|t):4:w$/.exec(id);
    if(suffix&&sourcePath==="Commune/C10"+suffix[1])
      return rule("MARIA","309_A_495","SOURCE_MATCHED_BVM_SATURDAY_MASS");
  }
  const advent=/^tempora:Adv([1-4])-([1-6]):[23]:v$/.exec(id);
  if(advent&&colour==="violet"&&sourcePath==="Tempora/Adv"+advent[1]+"-"+advent[2]){
    const expectedDate=firstAdventSundayUtc(year)+
      ((Number(advent[1])-1)*7+Number(advent[2]))*86400000;
    const screened=new Set(["1-2","1-6","2-3","2-4","2-6",
      "3-1","3-2","3-3","3-4","3-5","3-6","4-2","4-3"]);
    if(screened.has(advent[1]+"-"+advent[2])&&withinDays(actual,expectedDate,0,0))
      return rule("COMMUNIS","498","SOURCE_MATCHED_ADVENT_FERIA_NO_UNIVERSAL_SEASONAL_PREFACE");
  }
  const ember=/^tempora:093-([356]):2:v$/.exec(id);
  if(ember&&colour==="violet"&&sourcePath==="Tempora/093-"+ember[1]){
    const expectedDate=thirdSeptemberSundayUtc(year)+Number(ember[1])*86400000;
    if(withinDays(actual,expectedDate,0,0))
      return rule("COMMUNIS","498","SOURCE_MATCHED_SEPTEMBER_EMBER_FERIA");
  }
  if(id==="tempora:Adv3-0:1:pv"&&sourcePath==="Tempora/Adv3-0"&&
    rank===1&&colour==="rose"&&weekday===0&&
    withinDays(actual,firstAdventSundayUtc(year),14,14))
    return rule("TRINITATE","494_B","SOURCE_MATCHED_GAUDETE_ADVENT_SUNDAY");
  if(id==="tempora:Pasc3-0r:2:w"&&sourcePath==="Tempora/Pasc3-0r"&&
    rank===2&&colour==="white"&&weekday===0&&
    withinDays(actual,romanEasterUtc(year),21,21))
    return rule("PASCHALIS","489_A","SOURCE_MATCHED_THIRD_POST_EASTER_SUNDAY");
  // ICRSP France independently states post-1960 Corpus Christi:
  // Præfatio Communis, and the older Missal: Præfatio de Nativitate.
  // 1960 §498 selects Common in the universal 1962 baseline. The later
  // 2020 optional Eucharistic Preface is NOT an automatic entitlement.
  if(id==="tempora:Pent01-4:1:w"&&sourcePath==="Tempora/Pent01-4"&&
    rank===1&&colour==="white"&&weekday===4&&
    withinDays(actual,romanEasterUtc(year),60,60))
    return rule("COMMUNIS","498","ICRSP_POST_1960_CORPUS_CHRISTI_COMMON");
  return null;
}

function expectedFor(id,date,rank,colour,sourcePath){
  // Explicit feast/source IDs; do not infer Lord/Mary/Apostle solely from
  // vernacular titles, colour, modern observances or commemoration labels.
  const main=id.split(":").slice(0,2).join(":").toLowerCase();
  const exact={
    "sancti:01-01":rule("NATIVITATE","484_A","OCTAVE_OF_THE_NATIVITY"),
    "sancti:01-06":rule("EPIPHANIA","485_A","EPIPHANY"),
    "sancti:01-13":rule("EPIPHANIA","485_A","BAPTISM_OF_THE_LORD"),
    "sancti:02-02":rule("NATIVITATE","484_A","PURIFICATION"),
    "sancti:03-19":rule("JOSEPH","496","ST_JOSEPH"),
    "sancti:03-25":rule("MARIA","495","ANNUNCIATION"),
    "sancti:05-01r":rule("JOSEPH","496","ST_JOSEPH_WORKER"),
    "sancti:10-07":rule("MARIA","495","OUR_LADY_OF_THE_ROSARY"),
    "sancti:10-du":rule("CHRISTUS_REX","492","CHRIST_THE_KING"),
    "sancti:10-28":rule("APOSTOLI","497","SIMON_JUDE"),
    "sancti:07-01":rule("CRUX","487_A","PRECIOUS_BLOOD"),
    "sancti:09-14":rule("CRUX","487_A","EXALTATION_OF_CROSS"),
    "sancti:12-08":rule("MARIA","495","IMMACULATE_CONCEPTION"),
    "tempora:pent02-5":rule("COR_IESU","491","SACRED_HEART"),
    "tempora:pasc5-4":rule("ASCENSIO","490_A","ASCENSION"),
  };
  if(exact[main])return exact[main];
  // The first full 142-file Sanctoral source screen establishes nine
  // precise Marian original-source selectors (Rubrics §495) plus two exact
  // Common selectors (Rubrics §498). Never infer them merely from colour,
  // an English title or a Marian commemoration. The Transfiguration's
  // original *1960-qualified* Prefatio=Communis
  // outranks its older Prefatio=Nat (6 August). These are read-only audit
  // expectations, NOT reader text overrides or publication certification.
  const originalSanctoralMary=new Set([
    "02-11","07-02","08-05","08-15","08-22",
    "09-08","09-12","09-15","11-21"
  ]);
  const originalSanctoralCommon=new Set(["08-06","08-14"]);
  const original=id.match(/^sancti:(\d{2}-\d{2}):[1-4]:[a-z]{1,2}$/i);
  if(original&&date.slice(5)===original[1]&&
     sourcePath==="Sancti/"+original[1]){
    if(originalSanctoralMary.has(original[1]))
      return rule("MARIA","495","ORIGINAL_MARIAN_PREFATIO_SOURCE_1960");
    if(originalSanctoralCommon.has(original[1]))
      return rule("COMMUNIS","498",
        original[1]==="08-06"?"EXPLICIT_1960_TRANSFIGURATION_COMMON":
          "EXPLICIT_ASSUMPTION_VIGIL_COMMON");
  }
  // This is a reviewed index of the *named Roman calendar source paths*,
  // not an inference based on a red vestment or "saint" in the title.
  const apostleFeasts=new Set([
    "02-24","04-25","06-11","06-29","06-30","07-25",
    "08-24","09-21","10-28","11-30","12-21"
  ]);
  const apostleKey=main.match(/^sancti:(\d{2}-\d{2})$/);
  if(apostleKey&&apostleFeasts.has(apostleKey[1]))
    return rule("APOSTOLI","497","NAMED_APOSTLE_OR_EVANGELIST");
  if(/^sancti:12-25m[123]:1:w$/i.test(id))
    return rule("NATIVITATE","484_A","NATIVITY_THREE_MASSES");
  const md=date.slice(5);
  // Christmas octave preface overrides an ordinary saint's proper, but
  // not a Preface proper to one of the divine mysteries or Persons: those
  // need particular source scrutiny. Limit this branch to matched general
  // Christmas octave observances and unambiguous Stephen/John/Innocents.
  if(/^tempora:Nat/i.test(id))return rule("NATIVITATE","484_A_B","CHRISTMAS_TEMPORAL");
  if(/^tempora:Epi1-0:2:w$/i.test(id)&&md>="01-07"&&md<="01-13")
    return rule("EPIPHANIA","485_B","EPIPHANY_SEASON_SUNDAY");
  if(["12-26","12-27","12-28"].includes(md)&&/^sancti:12-(?:26|27|28):/i.test(id))
    return rule("NATIVITATE","484_B","CHRISTMAS_OCTAVE_SAINT");
  const family=sourceOwned1962FeriaAndSaturday(id,date,rank,colour,sourcePath);
  if(family)return family;
  if(id===":feria:4:w"){
    // Generic IDs do not identify the source's Office season; require a
    // witnessed GREEN IV-class Mass per annum, not just a date.
    if(rank===4&&colour==="green")return rule("COMMUNIS","498","GREEN_IV_FERIA_PER_ANNUM");
    const inherited=inheritedSundayFeriaPreface(id,date,rank,colour,sourcePath);
    if(inherited)return inherited;
    return null;
  }
  // The resolver source owns the *principal* Mass. Only named Temporale
  // identities can prove seasonal prefatory obligation.
  if(/^tempora:Adv[1-4]-0:[12]:v$/i.test(id))
    return rule("TRINITATE","494_B","ADVENT_SUNDAY");
  if(/^tempora:Pent01-0r?:1:w$/i.test(id))
    return rule("TRINITATE","494_A","HOLY_TRINITY_FEAST");
  if(/^tempora:(?:Pent\d{1,2}|Epi[2-6])-0r?:2:g$/i.test(id)||
     /^tempora:Quadp[1-3]-0:2:v$/i.test(id))
    return rule("TRINITATE","494_B","PER_ANNUM_SUNDAY");
  if(/^tempora:Quadp\d-[3-6]:[123]:v$/i.test(id)||
     /^tempora:Quad[1-4]-[0-6]:[123]:[a-z]{1,2}$/i.test(id))
    return rule("QUADRAGESIMA","486_A","LENT_TEMPORAL");
  if(/^tempora:Quad5-[0-6](?:Feria)?:[123]:v$/i.test(id)||
     /^tempora:Quad6-[0-3]r?:[123]:[a-z]{1,2}$/i.test(id)||
     /^tempora:Quad6-4r:1:w$/i.test(id))
    return rule("CRUX","487_A","PASSION_TEMPORAL");
  if(/^tempora:Quad6-6r:1:vw$/i.test(id))
    return rule("PASCHALIS","489_A","EASTER_VIGIL_MASS");
  if(/^tempora:Pasc[0-4]-[0-6]:[123]:[a-z]+$/i.test(id)||
     /^tempora:Pasc5-[0-3]:[123]:[a-z]+$/i.test(id))
    return rule("PASCHALIS","489_A","EASTER_TEMPORAL");
  if(/^tempora:Pasc5-[5-6]:[123]:[a-z]+$/i.test(id)||
     /^tempora:Pasc6-[0-5]:[123]:[a-z]+$/i.test(id))
    return rule("ASCENSIO","490_B","ASCENSION_SEASON");
  if(/^tempora:Pasc6-6:1:r$/i.test(id)||
     /^tempora:Pasc7-[0-6]:1:r$/i.test(id))
    return rule("SPIRITU","493_A","PENTECOST_VIGIL_AND_OCTAVE");
  return null;
}
const latinHeading=preface=>text(preface?.lat??preface?.la).split(/\r?\n/)[0]?.trim()||null;
export function classify1962PrefaceHeading(heading){
  const h=canonical(heading);
  if(!h)return null;
  const tests=[
    ["COMMUNIS",/^communis\b/],
    ["PASCHALIS",/^paschalis\b/],
    ["NATIVITATE",/^de\s+nativitate\b/],
    ["EPIPHANIA",/^de\s+epiphania\b/],
    ["TRINITATE",/^de\s+sanctissima\s+trinitate\b/],
    ["MARIA",/^de\s+(?:beata\s+maria\s+virgine|b\.?\s*m\.?\s*v\.?)/],
    ["SPIRITU",/^de\s+(?:spiritu\s+sancto|sancto\s+spiritu)/],
    ["COR_IESU",/^de\s+(?:(?:sacratissimo|sacro)\s+)?(?:corde|cordis)\s+(?:iesu|jesu)/],
    ["CHRISTUS_REX",/^de\s+(?:(?:domino\s+nostro\s+)?(?:(?:iesu|jesu)\s+christo\s+rege|christo\s+rege)|d\.n\.\s*(?:iesu|jesu)\s+christi\s+rege)/],
    ["JOSEPH",/^de\s+(?:(?:sancto|s\.)\s+)?(?:ioseph|joseph)\b/],
    ["APOSTOLI",/^de\s+apostol/],
    ["ASCENSIO",/^de\s+ascension/],
    ["QUADRAGESIMA",/^de\s+quadragesima/],
    ["CRUX",/^de\s+(?:sancta\s+)?cruce|^de\s+passione/],
  ];
  return tests.find(([,pattern])=>pattern.test(h))?.[0]??null;
}
export function review1962PrefaceForCalendarDay(resolution){
  const date=text(resolution?.date),main=resolution?.day?.main;
  const parsed=/^\d{4}-\d{2}-\d{2}$/.test(date)?new Date(date+"T12:00:00.000Z"):null;
  if(!parsed||Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==date||
     resolution?.status!=="ready"||
     !main||resolution?.proper?.status!=="ready"||!resolution?.proper?.data)
    return fail("WITHHELD","DAY_OR_PROPER_NOT_READY");
  const id=text(main.id),p=resolution.proper.data;
  if(!sourceId(id)||!text(p.sourcePath))
    return fail("WITHHELD","PRINCIPAL_SOURCE_ID_OR_PROPER_PATH_MISSING");
  const encodedClass=id.match(/:([1-4]):[a-z]{1,2}$/i);
  if(!encodedClass||Number(encodedClass[1])!==Number(main.rank))
    return fail("WITHHELD","PRINCIPAL_SOURCE_CLASS_MISMATCH",{principalId:id,date});
  if(/^tempora:Quad6-5r:/i.test(id))
    return fail("NOT_MASS","GOOD_FRIDAY_NON_MASS",{principalId:id,date});
  if(/(?:requiem|votive|mass_of_dead)/i.test(text(p.riteProfile??p.profile)))
    return fail("WITHHELD","SELECTED_SPECIAL_MASS_NOT_THE_GENERAL_CALENDAR",{principalId:id,date});
  const rank=Number(main.rank),colour=text(resolution?.colourPlan?.massColor??p.color??main.color).toLowerCase();
  const alternate=resolution?.day?.selectedMassOption?.path;
  const sourcePath=text(p.sourcePath);
  const expected=alternate&&alternate!==sourcePath?null:
    expectedFor(id,date,rank,colour,sourcePath);
  const expectation=expected;
  const heading=latinHeading(p.preface),actual=classify1962PrefaceHeading(heading);
  const validPassage=value=>Boolean(text(value)&&!/^[$@]/.test(text(value)));
  const complete=validPassage(p.preface?.lat??p.preface?.la)&&
    validPassage(p.preface?.en)&&validPassage(p.preface?.fr);
  const common={date,principalId:id,sourcePath:p.sourcePath,actual,heading,
    trilingualTextComplete:complete,expected:expectation?.category??null,
    clause:expectation?.clause??null,basis:expectation?.basis??null};
  if(!expectation)return fail("UNMAPPED","RUBRICAL_OWNER_NOT_YET_ATTESTED",common);
  if(!actual)return fail("UNCLASSIFIED_TEXT",heading?
    "LATIN_PREFACE_HEADING_NOT_RECOGNIZED":"LATIN_PREFACE_MISSING",common);
  if(actual!==expectation.category)
    return fail("SOURCE_CONFLICT","RESOLVED_PREFACE_DISAGREES_WITH_1960_RUBRIC",common);
  return fail(complete?"RULE_TEXT_AGREE":"TRANSLATIONS_INCOMPLETE",
    complete?null:"MISSING_EN_OR_FR_PREFACE_TEXT",common);
}
