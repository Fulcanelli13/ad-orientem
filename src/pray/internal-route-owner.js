/** Exact in-reader Prayer ownership. Never infer Angelus for an unknown ID.
 * Registry-owned/traditional modules are intentionally excluded here. */
export const INTERNAL_PRAYER_VIEWS=Object.freeze({
  "pray.hub":"home",
  "pray.angelus":"angelus",
  "pray.angelus_regina":"angelus",
  "pray.divine_mercy":"mercy",
  "pray.five_wounds":"fiveWounds",
  "pray.precious_blood":"preciousBlood",
  "pray.rosary_methods":"rosaryMethods",
  "pray.confession":"confession",
  "pray.benediction":"benediction",
  "pray.adoration":"adoration",
  "pray.visit_blessed_sacrament":"adoration",
  "pray.stations":"stations",
  "pray.library":"library",
  "pray.for_priests":"priests",
  "pray.occasional_intercessions":"occasionals",
  "pray.st_joseph_seven_sorrows":"josephSeven",
  "pray.penitential_psalms":"penitential",
  "pray.litany_saints":"litany",
  "pray.seven_words":"sevenWords",
  "pray.tenebrae":"tenebrae",
  "pray.forty_hours":"fortyHours",
  "pray.de_profundis":"prayerOnly",
  "pray.eternal_rest":"prayerOnly",
  "programme.first_friday":"firstFriday",
  "programme.first_saturday":"firstSaturday"
});
export function internalPrayerView(id){
  return Object.hasOwn(INTERNAL_PRAYER_VIEWS,String(id??""))?INTERNAL_PRAYER_VIEWS[id]:null;
}

// The Rosary is the one supported direct route whose display is delegated to
// the bead engine rather than one of the in-reader presentation views.
export function supportedDirectPrayerRoute(id){
  return id==="pray.rosary"||internalPrayerView(id)!==null;
}
