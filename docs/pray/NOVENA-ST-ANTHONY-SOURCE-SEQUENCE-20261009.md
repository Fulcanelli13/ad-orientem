# St Anthony — Nine Tuesdays: source-to-sequence correction

**Source:** Benedict O'Donoghue, O.F.M., *Say a Prayer to Saint Anthony*, Australian Catholic Truth Society pamphlet ACTS 1014 (1966), [original page](https://www.pamphlets.info/Australia/acts1014/), section "The Devotion of the Nine Tuesdays / Prayers for the Devotion of the Nine Tuesdays". Contemporary French practice context: [Messager de Saint Antoine, neuf mardis et treizaine](https://www.messagerdesaintantoine.com/node/5972).

The source describes nine successive Tuesdays, not a nine-day continuous novena, and explicitly states that no single prayer formula is obligatory. Its suggested sequence after the two customary prayers is one **Our Father**, **Hail Mary**, and **Glory Be**, followed by **the miraculous responsory** (*Si quæris miracula*).

Prior V4 corpus contained the two customary prayers but **omitted the subsequent three prayers and responsory** from both the Simple reader and Guided stages. That was a source-to-reader omission when the app was presenting the selected source's form.

This pass restores the suggested source sequence using the pre-existing canonical Prayer IDs, without copying the text or generating a new St Anthony prayer:
`foundations_our_father` × 1 → `foundations_hail_mary` × 1 → `foundations_glory_be` × 1 → `devotion_st_anthony_lost_items` × 1.

The first two historic prayers remain in the current `repeatText`, followed by the canonical objects. Guided mode uses existing common-prayers and concluding-prayer stages; Simple mode renders the same source-led order continuously. The devotional explanation notes that this is one documented *suggested* practice, not a rule of universal obligation. This correction does not revive historical indulgence grants as current law.

The original prayers, source citation, French editorial translation status, nine-week cadence, June feast date, Calendar semantics, and canonical reader remain unchanged. `tests/pray-novenas.mjs` checks the common prayer configuration, ending link, source status, and no copy/paste duplication. The complete French historical text-collation gate remains open.
