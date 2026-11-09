/**
 * Finite Roman 1960 Office-ordo evidence: 14–20 December 2026.
 * No Mass calendar is an authority for this list. The independent
 * traditional 2026 Office ordo names the principal day and Compline.
 * Contemporary 1962 ordo confirms the Ember-day "Of the feria" rubric
 * and the evening of 19 December's First Vespers of Advent IV.
 *
 * Original Latin and exact source certification are separate release gates.
 */
export const ADVENT_III_2026_ORDO_SCHEMA=
 "ao.office.advent-iii-2026-independent-dated-ordo.v1";
export const ADVENT_III_2026_ORDO_SOURCE=
 "https://breviariumgregorianum.com/ordo-2026.php";
export const ADVENT_III_2026_EMBER_ORDO_SOURCE=
 "https://1962ordo.today/day/ember-wednesday-advent-2-3-2-2-2-2-2-2/";
export const ADVENT_III_2026_SATURDAY_ORDO_SOURCE=
 "https://1962ordo.today/day/ember-saturday-advent-2-3-2-2-2-2-2/";
export const ADVENT_III_2026_ORDO_WITNESSES=Object.freeze([
 Object.freeze({date:"2026-12-14",namedOffice:"Monday of the Third Week of Advent",
  class:"III_FERIA",officeKind:"FERIA",psalmDay:"Feria II",rubric:"171(e)",
  officeDate:"2026-12-14",stichs:28,latinWords:337}),
 Object.freeze({date:"2026-12-15",namedOffice:"Tuesday of the Third Week of Advent",
  class:"III_FERIA",officeKind:"FERIA",psalmDay:"Feria III",rubric:"171(e)",
  officeDate:"2026-12-15",stichs:26,latinWords:334}),
 Object.freeze({date:"2026-12-16",namedOffice:"Ember Wednesday of Advent",
  class:"II_FERIA",officeKind:"FERIA",psalmDay:"Feria IV",rubric:"171(e)",
  officeDate:"2026-12-16",stichs:30,latinWords:335,
  commemoration:"Saint Eusebius, Bishop and Martyr",
  independentBreviaryDetail:ADVENT_III_2026_EMBER_ORDO_SOURCE}),
 Object.freeze({date:"2026-12-17",namedOffice:"Thursday after the Third Sunday of Advent",
  class:"II_FERIA",officeKind:"FERIA",psalmDay:"Feria V",rubric:"171(e)",
  officeDate:"2026-12-17",stichs:33,latinWords:398,
  vespersNote:"O Sapientia Magnificat antiphon belongs to Vespers; not the Compline Marian antiphon",
  independentBreviaryDetail:"https://1962ordo.today/day/feria-iii-iii-sunday-advent-2-2-2-2-2-2-2/"}),
 Object.freeze({date:"2026-12-18",namedOffice:"Ember Friday of Advent",
  class:"II_FERIA",officeKind:"FERIA",psalmDay:"Feria VI",rubric:"171(e)",
  officeDate:"2026-12-18",stichs:36,latinWords:469}),
 Object.freeze({date:"2026-12-19",namedOffice:"Fourth Sunday of Advent",
  civilDayOffice:"Ember Saturday of Advent, II class",
  class:"SUNDAY_FIRST_VESPERS",officeKind:"SUNDAY",
  psalmDay:"Sabbato",rubric:"166(b)",officeDate:"2026-12-20",
  stichs:41,latinWords:null,
  independentBreviaryDetail:ADVENT_III_2026_SATURDAY_ORDO_SOURCE}),
 Object.freeze({date:"2026-12-20",namedOffice:"Fourth Sunday of Advent",
  class:"I_SUNDAY",officeKind:"SUNDAY",psalmDay:"Dominica",rubric:"166(h)",
  officeDate:"2026-12-20",stichs:30,latinWords:329,
  independentBreviaryDetail:"https://1962ordo.today/day/dominica-iv-adventus-3-2-2-2-2-2/"})
]);
