// Guards the canonical Mass icon set (21 Oct 2026): one asset per meaning, every
// chosen file pinned by SHA-256, and priest position / action / voice kept as
// independent lanes. A position picture never stands in for an action, and a
// movement never produces an action icon.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const read = p => JSON.parse(fs.readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const set = read('data/presentation/mass-icon-canonical-set-20261021.v1.json');
const lock = read('data/presentation/mass-icon-final-user-lock-20261020.v1.json');
const positions = read('data/presentation/reader-priest-positions.v1.json').items;
const actions = read('data/presentation/reader-priest-actions.v1.json').items;
const lockById = new Map(lock.items.map(i => [i.id, i]));
const rejected = new Set(lock.permanentlyRejectedExactArtwork.map(r => r.id));

let checks = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); checks++; };

// 1. Meanings: unique ids, valid lanes, lane matches id prefix.
const lanePrefix = {
  faithful_posture: ['faithful.posture.'], faithful_gesture: ['faithful.gesture.'], response: ['response.'],
  schola: ['schola.'], bell: ['bell.'], marker: ['marker.'], priest_position: ['priest.position.'],
  priest_action: ['priest.action.', 'minister.action.'], priest_voice: ['priest.voice.'], special_rite: ['rite.'],
};
const meanings = new Map();
for (const m of set.meanings) {
  ok(!meanings.has(m.meaningId), `duplicate meaning ${m.meaningId}`);
  meanings.set(m.meaningId, m);
  ok(set.lanes[m.lane], `${m.meaningId}: unknown lane ${m.lane}`);
  ok(lanePrefix[m.lane].some(p => m.meaningId.startsWith(p)), `${m.meaningId} is filed in lane ${m.lane}`);
}
const gapIds = new Set(set.gaps.map(g => g.meaningId));
const laneOf = id => meanings.get(id)?.lane ?? (id.startsWith('priest.position.') ? 'priest_position' : id.startsWith('priest.action.') ? 'priest_action' : null);
const known = id => meanings.has(id) || gapIds.has(id);

// 2. Every chosen asset: exists, bytes match the pinned hash, user name exact, never rejected.
const shaByLane = new Map();
const assetSeen = new Map();
for (const m of set.meanings.filter(m => m.assetId)) {
  const item = lockById.get(m.assetId);
  ok(item, `${m.assetId} is not in the Oct 20 lock`);
  ok(!rejected.has(m.assetId) && !['reject', 'replaced'].includes(item.status), `${m.assetId} is rejected or replaced`);
  ok(m.userName === item.name, `${m.assetId}: user name changed (${m.userName} vs ${item.name})`);
  const bytes = fs.readFileSync(new URL('../' + m.path, import.meta.url));
  ok(crypto.createHash('sha256').update(bytes).digest('hex') === m.sha256, `${m.assetId}: bytes differ from pinned hash`);
  if (item.sourceHash) ok(item.sourceHash === m.sha256, `${m.assetId}: hash disagrees with the Oct 20 lock`);
  if (m.reusesMeaning) {
    // A declared reuse: same picture as another meaning in the SAME lane, by explicit user decision.
    const owner = meanings.get(m.reusesMeaning);
    ok(owner && owner.assetId === m.assetId, `${m.meaningId}: declared reuse of ${m.reusesMeaning} but the asset differs`);
    // 25 Oct approved semantic-lexicon exception: the same generic gesture
    // depicts breast striking by either actor. Ownership and count remain in
    // source events; no priest position/faithful posture is inferred.
    const genericBreastStrike = m.meaningId === 'priest.action.strike_breast' &&
      owner.meaningId === 'faithful.gesture.strike_breast' &&
      m.semanticApproval === 'BREAST_STRIKE_ANY_ACTOR' &&
      m.semanticSource === 'data/presentation/mass-icon-final-semantic-lexicon-20261020.v1.json';
    ok(owner.lane === m.lane || genericBreastStrike,
      `${m.meaningId}: a reuse may not cross lanes (${owner.lane} -> ${m.lane})`);
    ok(/^user-/.test(m.decidedBy), `${m.meaningId}: a reuse must be a user decision`);
  } else {
    ok(!assetSeen.has(m.assetId), `${m.assetId} is canonical for two meanings (${assetSeen.get(m.assetId)}, ${m.meaningId})`);
    assetSeen.set(m.assetId, m.meaningId);
  }
  if (!shaByLane.has(m.sha256)) shaByLane.set(m.sha256, new Set());
  shaByLane.get(m.sha256).add(m.lane);
}

// 3. Position and action never share a picture (same bytes in both lanes = conflation).
for (const [sha, lanes] of shaByLane) {
  ok(!(lanes.has('priest_position') && lanes.has('priest_action')), `same picture used as both priest position and priest action (${sha.slice(0, 12)})`);
}

// 4. Every station x facing in the source resolves to a position meaning (or explicit text-only).
for (const p of positions) {
  const key = set.stationMap[`${p.station}|${p.facing}`] !== undefined ? `${p.station}|${p.facing}` : p.station;
  ok(key in set.stationMap, `${p.cueId}: station ${p.station} has no mapping`);
  const target = set.stationMap[key];
  if (target !== null) {
    ok(known(target), `${p.cueId}: ${target} is not a known meaning`);
    ok(laneOf(target) === 'priest_position', `${p.cueId}: station mapped outside the position lane (${target})`);
  }
}

// 5. Every action label resolves to an action meaning or an explicit non-icon reason.
const nonIcon = new Set(['POSITION_TRANSITION', 'VOICE_LANE', 'OTHER_ACTOR', 'COVERED_BY_POSITION_AND_FAITHFUL', 'TEXT_ONLY_NO_ART']);
for (const a of actions) {
  const target = set.actionCueOverrides[a.cueId] ?? set.actionLabelMap[a.label];
  ok(target !== undefined, `${a.cueId}: action "${a.label}" has no mapping`);
  if (nonIcon.has(target)) continue;
  ok(known(target), `${a.cueId}: ${target} is not a known meaning`);
  ok(laneOf(target) === 'priest_action', `${a.cueId}: "${a.label}" mapped outside the action lane (${target})`);
}
for (const label of ['ASCENDS ALTAR', 'TURNS TO PEOPLE', 'TURNS TO MISSAL', 'TURNS TO ALTAR']) {
  ok(set.actionLabelMap[label] === 'POSITION_TRANSITION', `${label} must be a position transition, not an action icon`);
}

// 6. Movement cues must agree with the position in force. Known source timing offsets are
//    pinned here: a new disagreement fails, and a fixed one forces this list to be updated.
const KNOWN_OFFSETS = {
  'AO.SM.C0071': 'Turn to the Missal is labelled one cue before the Epistle-side transition at C0072',
  'AO.SM.C0250': 'Return after the Communion antiphon is observer-gated (PRIEST_TRACK_ASYNC) by design',
  'AO.SM.C0256': 'Turn to the people is labelled one cue before the facing-people transition at C0257',
};
const ordered = [...positions].sort((x, y) => x.cueId.localeCompare(y.cueId));
const inForce = cue => { let cur = null; for (const p of ordered) { if (p.cueId > cue) break; cur = p; } return cur; };
const agrees = {
  'TURNS TO PEOPLE': p => ['PEOPLE', 'PEOPLE_DURING_TURN'].includes(p.facing),
  'TURNS TO MISSAL': p => p.facing === 'MISSAL',
  'TURNS TO ALTAR': p => ['LITURGICAL_EAST', 'CROSS', 'OBLATIONS'].includes(p.facing),
  'ASCENDS ALTAR': p => p.station === 'ALTAR_STEPS_ASCENDING',
};
const offsets = actions.filter(a => agrees[a.label]).filter(a => { const p = inForce(a.cueId); return !p || !agrees[a.label](p); }).map(a => a.cueId);
assert.deepEqual(offsets.sort(), Object.keys(KNOWN_OFFSETS).sort(), 'movement/position disagreements changed');
checks++;

// 7. Gaps are text-only, never silently filled.
for (const g of set.gaps) ok(!meanings.get(g.meaningId)?.assetId || meanings.get(g.meaningId)?.status === 'pending-clarification', `${g.meaningId} is listed as a gap but has an asset`);

console.log(`mass-icon-canonical-set: ${checks} checks passed (${set.meanings.length} meanings, ${assetSeen.size} pinned files, ${set.gaps.length} gaps)`);
