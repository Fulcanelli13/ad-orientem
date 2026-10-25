// The choir's chant windows follow the rite, not the priest's card:
// - Gradual / Alleluia / Tract / Sequence continue while Munda cor meum is said,
//   and end at the Gospel's Dominus vobiscum.
// - The Agnus Dei begins after the choir answers the Pax and continues through
//   the priest's prayers before his Communion.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { properToReaderSlots } from "../src/mass/proper-reader-slots.js";
import { createNativeScholaController } from "../src/mass/reader-schola.js";

const sung = JSON.parse(readFileSync(new URL("../data/presentation/reader-text-sung.v1.json", import.meta.url), "utf8"));
const t = (lat, en) => ({ lat, en });
const properSlots = properToReaderSlots({
  introit: t("Introitus", "Introit"), collect: t("Collecta", "Collect"), epistle: t("Epistola", "Epistle"),
  gradual: t("Graduale et Alleluia", "Gradual and Alleluia"), sequence: t("Sequentia", "Sequence"),
  gospel: t("Evangelium", "Gospel"), offertory: t("Offertorium", "Offertory"), secret: t("Secreta", "Secret"),
  preface: t("Praefatio", "Preface"), communion: t("Communio", "Communion"), postcommunion: t("Postcommunio", "Postcommunion"),
});
// A card as the reader passes it: its source blocks and their cue ids.
const blockCues = new Map(sung.blocks.map(b => [b.Block_ID, (b.units ?? []).map(u => u.cue_id)]));
const card = (...blockIds) => ({
  blocks: blockIds.map(blockId => ({ blockId })),
  paragraphs: blockIds.map(id => ({ id, sourceCueIds: blockCues.get(id) ?? [] })),
});

for (const form of ["MISSA_CANTATA_SIMPLE", "MISSA_CANTATA_INCENSE", "SOLEMN"]) {
  const schola = createNativeScholaController({ sungCorpus: sung, properSlots, prepared: { session: { resolvedMass: { form } } } });
  const track = () => schola.project().trackId;

  // Gradual window across Munda cor, closed by the Gospel.
  schola.activateForCard(card("AO.SM.B021"));
  assert.equal(track(), "GRADUAL", form + ": Gradual card opens the Gradual");
  schola.next();
  const at = schola.project().index;
  schola.activateForCard(card("AO.SM.B023"));
  assert.equal(track(), "GRADUAL", form + ": the choir is still singing while Munda cor meum is said");
  assert.equal(schola.project().index, at, form + ": passing the priest's card does not move the choir");
  schola.reachLiturgicalBoundary("AO.SM.C0081");
  assert.equal(track(), "GRADUAL", form + ": going to the Gospel side does not end the chant");
  schola.reachLiturgicalBoundary("AO.SM.C0082");
  assert.equal(track(), null, form + ": the Gospel's Dominus vobiscum ends the interlectional chant");
  schola.activateForCard(card("AO.SM.B021"));
  schola.activateForCard(card("AO.SM.B024", "AO.SM.B025", "AO.SM.B026"));
  assert.equal(track(), null, form + ": the Gospel card has no choir window");
  // Munda cor alone (no interlectional chant active) does not invent one.
  schola.activateForCard(card("AO.SM.B023"));
  assert.equal(track(), null, form + ": Munda cor does not open a chant by itself");

  // Agnus Dei window: opens at the Pax response or the commingling, runs
  // through the priest's prayers before Communion, gives way to the Communion.
  schola.activateForCard(card("AO.SM.B064", "AO.SM.B065", "AO.SM.B066"));
  assert.equal(track(), null, form + ": no Agnus Dei while the priest sings Pax Domini");
  schola.reachLiturgicalBoundary("AO.SM.C0220");
  assert.equal(track(), "AGNUS_DEI", form + ": the choir begins the Agnus Dei after Et cum spiritu tuo");
  schola.activateForCard(card("AO.SM.B067"));
  assert.equal(track(), "AGNUS_DEI", form + ": Agnus Dei continues during Haec commixtio");
  schola.activateForCard(card("AO.SM.B068"));
  schola.next(); const agnusAt = schola.project().index;
  schola.activateForCard(card("AO.SM.B069", "AO.SM.B070", "AO.SM.B071"));
  assert.equal(track(), "AGNUS_DEI", form + ": Agnus Dei continues during the priest's prayers before Communion");
  assert.equal(schola.project().index, agnusAt, form + ": the priest's prayers do not move the choir");
  schola.activateForCard(card("AO.SM.B072", "AO.SM.B073"));
  assert.equal(track(), "AGNUS_DEI", form + ": Agnus Dei continues through the celebrant's Domine non sum dignus");
  schola.reachLiturgicalBoundary("AO.SM.C0232");
  assert.equal(track(), null, form + ": the priest's Communion ends the Agnus Dei window");
  schola.activateForCard(card("AO.SM.B074"));
  assert.equal(track(), "COMMUNION", form + ": the Communion window takes over");
  // Swiping straight from the commingling card to the priest's Communion.
  schola.activateForCard(card("AO.SM.B067"));
  assert.equal(track(), "AGNUS_DEI");
  schola.activateForCard(card("AO.SM.B074"));
  assert.equal(track(), "COMMUNION");
  // A later, unrelated card still closes the window.
  schola.activateForCard(card("AO.SM.B067"));
  schola.activateForCard(card("AO.SM.B024"));
  assert.equal(track(), null, form + ": an unrelated card ends the Agnus Dei window");
}

// Low Mass has no Schola: none of this may create one.
const low = createNativeScholaController({ sungCorpus: sung, properSlots, prepared: { session: { resolvedMass: { form: "LOW" } } } });
low.activateForCard(card("AO.SM.B067")); low.reachLiturgicalBoundary?.("AO.SM.C0220");
assert.equal(low.project().trackId, null, "Low Mass gained a Schola window");

console.log("Schola windows: PASS — Gradual/Alleluia through Munda cor; Agnus Dei from the Pax response to the priest's Communion.");
