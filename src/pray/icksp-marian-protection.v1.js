/**
 * ICKSP-selected Marian devotion, sourced to independently historic editions.
 * Text identity: Fr Louis-Édouard Cestac's "Auguste Reine" (1863/64).
 * This is a private devotional prayer, NOT an exorcism rite.
 * 1890 English witness and early French original are distinct recensions.
 * No unsupported Latin translation is synthesized.
 * Historical indulgence notices are not current-law claims.
 */
export const ICKSP_MARIAN_PROTECTION_V1=Object.freeze({
  augustQueen:Object.freeze({
    id:"icksp_august_queen_heaven",
    title:"August Queen of Heaven",
    titleFr:"Auguste Reine des cieux",
    en:`August Queen of Heaven! Sovereign Mistress of the Angels! Thou, who from the beginning hast received from God the power and mission to crush the head of Satan; we humbly beseech thee to send thy holy legions that, under thy command and by thy power, they may pursue the evil spirits; encounter them on every side: resist their bold attacks, and drive them hence into the abyss of everlasting woe. Amen.

Who is like unto God!

O good and tender Mother! Thou shalt ever be our love and our hope.

O Divine Mother! Send thy Angels to defend me, and drive the cruel enemy from me.

All ye holy Angels and Archangels keep us and defend us. Amen.`,
    fr:`Auguste Reine des cieux et maîtresse des Anges,
Vous qui avez reçu de Dieu
le pouvoir et la mission d’écraser la tête de Satan,
nous vous le demandons humblement,
envoyez les légions célestes pour que, sous vos ordres,
elles poursuivent les démons, les combattent partout,
répriment leur audace et les refoulent dans l’abîme.

Qui est comme Dieu ?

O bonne et tendre Mère,
vous serez toujours notre amour et notre espérance.

O divine Mère, envoyez les Saints Anges
pour me défendre et repousser loin de moi le cruel ennemi.

Saints Anges et Archanges, défendez nous, gardez nous.`,
    editions:Object.freeze({
      english:Object.freeze({
        label:"The Month of Mary · Don Caspar Gilli · London, 1890 · pp. end matter",
        url:"https://www.gutenberg.org/cache/epub/48887/pg48887-images.html",
        status:"HISTORICAL_EN_1890"
      }),
      french:Object.freeze({
        label:"Servantes de Marie · Abbé Cestac · original French prayer, 1863–64",
        url:"https://servantesdemarie.com/fr/pages/pere-cestac-priere-spiritualite-accompagnement-soutien-vierge-marie-auguste-reine",
        status:"HISTORICAL_FR_ORIGINAL"
      }),
      institute:Object.freeze({
        label:"Institute of Christ the King · Prayer to the Virgin",
        url:"https://institute-christ-king.org/resources/devotions-prayers/617-devotions-prayer-virgin-remedy",
        status:"SELECTING_SOURCE_NOT_TRANSLATION_DONOR"
      })
    }),
    historicalNote:Object.freeze({
      en:"The nineteenth-century English and French witnesses differ in wording and order. The English prayers are arranged into the same recitation without altering their words. Historical indulgence references do not imply a present-day grant.",
      fr:"Les témoins anglais et français du XIXe siècle diffèrent légèrement dans leur formulation et leur ordre. Les anciennes mentions d’indulgences ne sont pas présentées comme des concessions actuellement en vigueur."
    })
  })
});
