/**
 * ICKSP-selected Marian devotion, sourced to independently historic editions.
 * Text identity: Fr Louis-Édouard Cestac's "Auguste Reine" (1863/64).
 * This is a private devotional prayer, NOT an exorcism rite.
 * 1890 English witness and French original are distinct recensions.
 * Other English invocations were printed as separate prayers and MUST NOT be silently appended.
 * No unsupported Latin translation is synthesized.
 * Historical indulgence notices are not current-law claims.
 */
export const ICKSP_MARIAN_PROTECTION_V1=Object.freeze({
  augustQueen:Object.freeze({
    id:"icksp_august_queen_heaven",
    title:"August Queen of Heaven",
    titleFr:"Auguste Reine des cieux",
    en:`AUGUST Queen of Heaven! Sovereign Mistress of the Angels! Thou, who from the beginning hast received from God the power and mission to crush the head of Satan; we humbly beseech thee to send thy holy legions that, under thy command and by thy power, they may pursue the evil spirits; encounter them on every side: resist their bold attacks, and drive them hence into the abyss of everlasting woe. Amen.

Who is like unto God!`,
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

Saints Anges et Archanges, défendez nous, gardez nous.

Auguste Reine des cieux et maîtresse des Anges.`,
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
      en:"The 1890 English printing marks its other Marian invocations as separate prayers. This reader contains only the printed Miraculous Prayer and its attached acclamation, not a reordered composite. The French witness includes a concluding refrain. Historical indulgence references do not imply a present-day grant.",
      fr:"Le texte anglais de 1890 distingue la prière principale des autres invocations, qui ne sont pas ajoutées ici. Le texte français conserve sa reprise finale. Les anciennes indulgences ne sont pas présentées comme actuellement en vigueur."
    })
  })
});
