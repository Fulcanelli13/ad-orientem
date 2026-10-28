/**
 * B09: existing eleven complete Communion prayers, assigned by devotional
 * purpose WITHOUT altering the canonical source edition, text or IDs.
 *
 * "distinct" = independent acts, not supposed equivalents (e.g., Faith,
 * Hope, Charity, Contrition). "alternatives" = separate complete prayers
 * addressing the same broad private devotion, not substitute sentences.
 */
export const COMMUNION_PRAYER_PURPOSES=Object.freeze({
 before:Object.freeze([
  Object.freeze({id:"invocation",titleEn:"Invocation",titleFr:"Invocation",relationship:"distinct",
   ids:Object.freeze(["sacrament_come_holy_spirit"])}),
  Object.freeze({id:"disposition",titleEn:"Acts of preparation",titleFr:"Actes de préparation",relationship:"distinct",
   ids:Object.freeze(["foundations_act_of_faith","foundations_act_of_hope","foundations_act_of_love","sacrament_act_of_contrition"])}),
  Object.freeze({id:"approach",titleEn:"Approaching Communion",titleFr:"Avant de communier",relationship:"alternatives",
   ids:Object.freeze(["beforeThomas","beforeAmbrose"])})
 ]),
 after:Object.freeze([
  Object.freeze({id:"union",titleEn:"Union and love of Christ",titleFr:"Union et amour du Christ",relationship:"distinct",
   ids:Object.freeze(["adoration_anima_christi","afterBonaventure"])}),
  Object.freeze({id:"thanksgiving",titleEn:"Thanksgiving",titleFr:"Action de grâces",relationship:"distinct",
   ids:Object.freeze(["afterThomas"])}),
  Object.freeze({id:"crucifix",titleEn:"Prayer before the Crucifix",titleFr:"Prière devant le Crucifix",relationship:"distinct",
   ids:Object.freeze(["enEgo"])})
 ])
});
