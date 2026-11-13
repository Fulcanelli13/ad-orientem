// M63: Christmas Dawn Communion recovered after pinned 2024 archive.
// Two Solesmes 1961 print witnesses corroborate the chant. Not editor-certified.
// Manual research playback only; preserve untouched historic M61/M62 records.
const freeze=Object.freeze;
export const PROPER_M63_RESEARCH_SOURCES=freeze(
[
  {
    "selectionId": "CHRISTMAS_DAWN_COMMUNION",
    "week": "CHRISTMAS_DAWN",
    "role": "COMMUNION",
    "title": "Exsulta filia",
    "scoreId": "GREGOBASE-1125",
    "officePart": "co",
    "printed1961Page": "32",
    "sourceUrl": "https://gregobase.selapa.net/chant.php?id=1125",
    "sha256": "0cd4782be4bc8a2d41e934c5863de2ad2392857f0df9c48d6bff5b23a0112ccc",
    "sourceFingerprint": "60f8bf2e",
    "rendererFingerprint": "e58220d2",
    "sourceNotes": 72,
    "phraseNoteCounts": [
      72
    ],
    "bivirgaCount": 0,
    "sourceGabc": "(c4) EX(d!ewf)súl(cd~)ta(d) *(,) fí(d!f'g)li(gh)a(h) Si(ghe)on,(e.) (;) lau(e_[uh:l]g!hi)da(h) (,) fí(hjj)li(hg)a(g) Je(fg'h)rú(ghf)sa(egff)lem :(fe..) (:) ec(e)ce(g) Rex(h) tu(i_[oh:h]h)us(ij) ve(hiHG'h)nit(hg..) (,) san(h_g~)ctus,(g_[oh:h]f) et(gh) Sal(f)vá(e.f!gwh)tor(hg~) mun(egff)di.(fe..) (::)",
    "scoreApproved": false,
    "sourceCategory": "POST_ARCHIVE_2024_RESEARCH_RECOVERY"
  }
].map(spec=>freeze({...spec,phraseNoteCounts:freeze(spec.phraseNoteCounts)}))
);
