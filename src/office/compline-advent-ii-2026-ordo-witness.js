/**
 * Date-specific independent published 1960 Office ordo witnesses for the
 * Advent II / Gaudete Latin Compline release.
 *
 * PRIMARY DATED OFFICE ORDO (not Mass): Breviarium Gregorianum 2026:
 * https://breviariumgregorianum.com/ordo-2026.php (December 2026).
 * SECONDARY independent concurrence at 7 December 2026:
 * https://www.cantusorgani.org/vespers/sancti/12-08/
 * BINDING RUBRICS: 1960 Breviary §§166,167,169,171:
 * https://isidore.co/divinum/www/horas/Help/Rubrics/Breviary%201960.html
 *
 * This finite ledger is not an annual Office calendar, does not approve
 * English/French, and never extends the public release on its own.
 */
export const ADVENT_II_2026_DATED_OFFICE_ORDO_SCHEMA=
 "ao.office.advent-ii-2026-independent-dated-ordo.v1";
export const ADVENT_II_2026_ORDO_SOURCE=
 "https://breviariumgregorianum.com/ordo-2026.php";
export const ADVENT_II_2026_VESPERS_SECOND_WITNESS=
 "https://www.cantusorgani.org/vespers/sancti/12-08/";
export const ADVENT_II_2026_ORDO_WITNESSES=Object.freeze([
 Object.freeze({date:"2026-12-06",namedOffice:"Second Sunday of Advent",
  class:"I_SUNDAY",civilComplineAfter:"SECOND_VESPERS",officeDate:"2026-12-06",
  officeKind:"SUNDAY",psalmDay:"Dominica",rubric:"166(h)",
  stichs:30,originalLatinPsalmWords:329}),
 Object.freeze({date:"2026-12-07",namedOffice:"Immaculate Conception of the Blessed Virgin Mary",
  civilDayOffice:"Saint Ambrose, Bishop, Confessor and Doctor of the Church (III)",
  class:"I_FEAST_FIRST_VESPERS",civilComplineAfter:"FIRST_VESPERS",
  officeDate:"2026-12-08",officeKind:"I_FEAST",
  psalmDay:"Dominica",rubric:"167(b)",stichs:30,
  originalLatinPsalmWords:329,
  concurrenceSecondWitness:ADVENT_II_2026_VESPERS_SECOND_WITNESS}),
 Object.freeze({date:"2026-12-08",namedOffice:"Immaculate Conception of the Blessed Virgin Mary",
  class:"I_FEAST",civilComplineAfter:"SECOND_VESPERS",
  officeDate:"2026-12-08",officeKind:"I_FEAST",
  psalmDay:"Dominica",rubric:"167(h)",
  stichs:30,originalLatinPsalmWords:329}),
 Object.freeze({date:"2026-12-09",namedOffice:"Wednesday of the Second Week of Advent",
  class:"FERIA",civilComplineAfter:"SECOND_VESPERS",
  officeDate:"2026-12-09",officeKind:"FERIA",
  psalmDay:"Feria IV",rubric:"171(e)",stichs:30,
  originalLatinPsalmWords:335}),
 Object.freeze({date:"2026-12-10",namedOffice:"Thursday of the Second Week of Advent",
  commemoration:"Saint Melchiades",
  class:"FERIA",civilComplineAfter:"SECOND_VESPERS",
  officeDate:"2026-12-10",officeKind:"FERIA",
  psalmDay:"Feria V",rubric:"171(e)",stichs:33,
  originalLatinPsalmWords:398}),
 Object.freeze({date:"2026-12-11",namedOffice:"Saint Damasus I, Pope and Confessor",
  class:"III_FEAST",civilComplineAfter:"SECOND_VESPERS",
  officeDate:"2026-12-11",officeKind:"III_FEAST",
  psalmDay:"Feria VI",rubric:"169(e)",stichs:36,
  originalLatinPsalmWords:469}),
 Object.freeze({date:"2026-12-12",namedOffice:"Third Sunday of Advent",
  civilDayOffice:"Saturday of the Second Week of Advent (III)",
  class:"SUNDAY_FIRST_VESPERS",civilComplineAfter:"FIRST_VESPERS",
  officeDate:"2026-12-13",officeKind:"SUNDAY",
  psalmDay:"Sabbato",rubric:"166(b)",stichs:41,
  originalLatinPsalmWords:null}),
 Object.freeze({date:"2026-12-13",namedOffice:"Third Sunday of Advent (Gaudete)",
  displacedCommemoration:"Saint Lucy, Virgin and Martyr",
  class:"I_SUNDAY",civilComplineAfter:"SECOND_VESPERS",
  officeDate:"2026-12-13",officeKind:"SUNDAY",
  psalmDay:"Dominica",rubric:"166(h)",stichs:30,
  originalLatinPsalmWords:329})
]);
