// ICKSP-selected Holy Face / Holy Name Act of Reparation, distinct from Pius XI Iesu dulcissime.
// Witnesses are pre-1900 public-domain recensions, not modern Institute webpage translations.
// The 1884 English and 1887 French printed traditions differ in wording and order;
// label each as an independently preserved witness rather than a literal parallel translation.
// No independently attested Latin edition has been admitted: do not synthesize one.

export const GOLDEN_ARROW_REPARATION_V1=Object.freeze({
  id:"holy_face_golden_arrow",
  title:"The Golden Arrow · Reparation to the Holy Name",
  titleFr:"La Flèche d'Or · Réparation au Saint Nom",
  kind:"PRIVATE_REPARATORY_ASPIRATION",
  en:`May the most holy, the most sacred, the most adorable, the most unknown and the most inexpressible Name of God be adored, praised, blessed, loved and glorified, in heaven, on earth and in hell, by all creatures formed by His sacred hand, and by the loving Heart of Our Lord Jesus Christ in the most Blessed Sacrament of the altar. Amen.`,
  fr:`Qu'à jamais soit loué, béni, aimé, adoré, glorifié le très saint, très sacré, très adorable, très inconnu, très inexprimable Nom de Dieu, au ciel, sur la terre et dans les enfers, par toutes les créatures sorties des mains de Dieu et par le Sacré Cœur de Notre-Seigneur Jésus-Christ au très saint Sacrement de l'autel ! Ainsi soit-il.`,
  // Intentionally absent; neither source should be passed off as authenticated Latin.
  la:null,
  witnesses:Object.freeze({
    en:Object.freeze({
      edition:"Abbé Janvier, Life of Sister Mary St. Peter (English), 1884, ch. VII, The Golden Dagger",
      url:"https://holyfacechapel.org/life-of-sr-marie-de-st-pierre-chapter-7/",
      status:"HISTORICAL_ENGLISH"
    }),
    fr:Object.freeze({
      edition:"Dévotion à la Sainte Face de Notre-Seigneur Jésus-Christ (1887), La Flèche d'Or",
      url:"https://sainteface.com/devotion/fleche-d-or.html",
      status:"HISTORICAL_FRENCH"
    }),
    institute:Object.freeze({
      edition:"Institute of Christ the King · Prayer of Reparation, selected devotional witness",
      url:"https://institute-christ-king.org/resources/devotions-prayers/613-devotions-reparation",
      status:"MODERN_REFERENTIAL_LINK_ONLY"
    })
  }),
  distinctFrom:Object.freeze(["sacred_heart_short_prayer","devotion_consecration_christ_king"]),
  warningEn:"This short Holy Face / Holy Name aspiration is not the Act of Reparation (Iesu dulcissime) prescribed by Pius XI. Historic English and French witnesses have differing recensions; no Latin translation has been inferred.",
  warningFr:"Cette aspiration de la Sainte Face et du Saint Nom est distincte de l'acte de réparation Iesu dulcissime prescrit par Pie XI. Les témoins anglais et français sont deux recensions historiques ; aucune traduction latine n'est supposée."
});
