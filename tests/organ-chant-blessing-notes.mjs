// 1958 §16b (no instruments with the celebrant's / ministers' chant or the sung
// responses) and §27g (no organ during the final blessing) on real Mass cards.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { project1962ReaderOrganNote, isPriestChantOnlyCard } from "../src/mass/reader-organ-permission-presentation.js";

const sung = JSON.parse(readFileSync(new URL("../data/presentation/reader-text-sung.v1.json", import.meta.url), "utf8"));
const cues = new Map(sung.blocks.map(b => [b.Block_ID, (b.units ?? []).map(u => u.cue_id)]));
const card = (sectionId, ...blockIds) => ({
  sectionId, blocks: blockIds.map(blockId => ({ blockId })),
  paragraphs: blockIds.map(id => ({ id, sourceCueIds: cues.get(id) ?? [] })),
});
const blockOf = cue => [...cues].find(([, list]) => list.includes(cue))[0];
const note = (c, form) => project1962ReaderOrganNote({ massCard: c, resolvedMass: { form, overlays: [], provenance: {} } });

const silent = {
  collect: card("AO.CARD.004", "AO.SM.B017", "AO.SM.B018", "AO.SM.B019"),
  preface: card("AO.CARD.012", "AO.SM.B042", "AO.SM.B043", "AO.SM.B044", "AO.SM.B045"),
  gloriaIntonation: { sectionId: "AO.CARD.003", blocks: [{ blockId: blockOf("AO.SM.C0053") }], paragraphs: [{ id: "i", sourceCueIds: ["AO.SM.C0053", "AO.SM.C0054"] }] },
  credoIntonation: { sectionId: "AO.CARD.009", blocks: [{ blockId: blockOf("AO.SM.C0089") }], paragraphs: [{ id: "i", sourceCueIds: ["AO.SM.C0089", "AO.SM.C0090"] }] },
  paxDomini: card("AO.CARD.020", "AO.SM.B065", "AO.SM.B066"),
  dismissal: card("AO.CARD.028", "AO.SM.B089", "AO.SM.B090"),
};
for (const form of ["MISSA_CANTATA_SIMPLE", "MISSA_CANTATA_INCENSE", "SOLEMN"]) {
  for (const [name, c] of Object.entries(silent)) {
    const n = note(c, form);
    assert.equal(n?.status, "SILENT", `${form} ${name}: §16b silence missing`);
    assert.ok(n.authority.includes("16b"), `${form} ${name}: wrong authority`);
    assert.equal(n.actuallyPlaying, "UNKNOWN");
  }
  const blessing = note(card("AO.CARD.029", "AO.SM.B092"), form);
  assert.equal(blessing?.status, "SILENT", form + ": §27g final blessing silence missing");
  assert.ok(blessing.authority.includes("27g"));
  // Cards carrying the choir's text are never marked silent by §16b.
  const gloria = { sectionId: "AO.CARD.003", blocks: [], paragraphs: [{ id: "g", sourceCueIds: ["AO.SM.C0055", "AO.SM.C0056"] }] };
  assert.equal(note(gloria, form), null, form + ": the choir's Gloria was marked silent");
  const sanctus = { sectionId: "AO.CARD.013", blocks: [], paragraphs: [{ id: "s", sourceCueIds: ["AO.SM.C0145", "AO.SM.C0146"] }] };
  assert.equal(note(sanctus, form), null, form + ": the Sanctus was marked silent");
  // The choir's Offertory antiphon and the silent Secret share cards with sung dialogues.
  assert.equal(note(card("AO.CARD.010", "AO.SM.B028", "AO.SM.B029", "AO.SM.B030"), form), null,
    form + ": the Offertory antiphon card was marked silent");
  assert.equal(note(card("AO.CARD.011", "AO.SM.B040", "AO.SM.B041"), form), null,
    form + ": the silent Secret was marked as organ-silent chant");
  // The Consecration keeps its own rule (§27e).
  assert.ok(note(card("AO.CARD.015", "AO.SM.B052"), form).authority.includes("27e"));
}
// Low Mass: §16b / §27g are sung-Mass rules; §29 governs Low Mass separately.
for (const c of [...Object.values(silent), card("AO.CARD.029", "AO.SM.B092")]) assert.equal(note(c, "LOW"), null, "sung-Mass rule leaked into Low Mass");
// A mixed card (oration + the choir's Kyrie) is not a priest-chant-only card.
assert.equal(isPriestChantOnlyCard({ paragraphs: [{ sourceCueIds: ["AO.SM.C0070", "AO.SM.C0044"] }] }), false);
assert.equal(isPriestChantOnlyCard({ paragraphs: [] }), false, "an empty card is not a chant card");

console.log("Organ §16b / §27g card notes: PASS — sung dialogues, Preface, intonations, Pax, dismissal and blessing silent; choir texts and Low Mass untouched.");
