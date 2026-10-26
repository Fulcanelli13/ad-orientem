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
function expectedFor(id,date,rank,colour){
  // Explicit feast/source IDs; do not infer Lord/Mary/Apostle solely from
  // vernacular titles, colour, modern observances or commemoration labels.
  const main=id.split(":").slice(0,2).join(":").toLowerCase();
  const exact={
    "sancti:01-06":rule("EPIPHANIA","485_A","EPIPHANY"),
    "sancti:01-13":rule("EPIPHANIA","485_A","BAPTISM_OF_THE_LORD"),
    "sancti:02-02":rule("NATIVITATE","484_A","PURIFICATION"),
    "sancti:03-19":rule("JOSEPH","496","ST_JOSEPH"),
    "sancti:03-25":rule("MARIA","495","ANNUNCIATION"),
    "sancti:05-01r":rule("JOSEPH","496","ST_JOSEPH_WORKER"),
    "sancti:10-07":rule("MARIA","495","OUR_LADY_OF_THE_ROSARY"),
    "sancti:10-du":rule("CHRISTUS_REX","492","CHRIST_THE_KING"),
    "sancti:10-28":rule("APOSTOLI","497","SIMON_JUDE"),
    "sancti:12-08":rule("MARIA","495","IMMACULATE_CONCEPTION"),
    "tempora:pent02-5":rule("COR_IESU","491","SACRED_HEART"),
    "tempora:pasc5-4":rule("ASCENSIO","490_A","ASCENSION"),
  };
  if(exact[main])return exact[main];
  const md=date.slice(5);
  // Christmas octave preface overrides an ordinary saint's proper, but
  // not a Preface proper to one of the divine mysteries or Persons: those
  // need particular source scrutiny. Limit this branch to matched general
  // Christmas octave observances and unambiguous Stephen/John/Innocents.
  if(/^tempora:Nat/i.test(id))return rule("NATIVITATE","484_A_B","CHRISTMAS_TEMPORAL");
  if(["12-26","12-27","12-28"].includes(md)&&/^sancti:12-(?:26|27|28):/i.test(id))
    return rule("NATIVITATE","484_B","CHRISTMAS_OCTAVE_SAINT");
  if(id===":feria:4:w"){
    // Generic IDs do not identify the source's Office season; require a
    // witnessed GREEN IV-class Mass per annum, not just a date.
    if(rank===4&&colour==="green")return rule("COMMUNIS","498","GREEN_IV_FERIA_PER_ANNUM");
    return null;
  }
  // The resolver source owns the *principal* Mass. Only named Temporale
  // identities can prove seasonal prefatory obligation.
  if(/^tempora:Adv[1-4]-0:[12]:v$/i.test(id))
    return rule("TRINITATE","494_B","ADVENT_SUNDAY");
  if(/^tempora:Pent\d{1,2}-0r?:2:g$/i.test(id))
    return rule("TRINITATE","494_B","PER_ANNUM_SUNDAY");
  if(/^tempora:Quadp\d-[3-6]:[123]:v$/i.test(id)||
     /^tempora:Quad[1-4]-[0-6]:[123]:v$/i.test(id))
    return rule("QUADRAGESIMA","486_A","LENT_TEMPORAL");
  if(/^tempora:Quad5-[0-6]:[123]:v$/i.test(id)||
     /^tempora:Quad6-[0-3]r:[123]:[a-z]+$/i.test(id))
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
    ["CHRISTUS_REX",/^de\s+(?:domino\s+nostro\s+)?(?:(?:iesu|jesu)\s+christo\s+rege|christo\s+rege)/],
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
  const expectation=expectedFor(id,date,rank,colour);
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
