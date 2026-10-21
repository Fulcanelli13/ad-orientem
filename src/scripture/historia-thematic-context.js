/**
 * Research navigation anchors. These are the nearest relevant reading chapters
 * within the 54-chapter PROPOSAL, not claims that a missing episode is quoted.
 * The underlying 54-chapter source JSON validates the chapter names.
 */
export const THEMATIC_NEAREST_CONTEXT = Object.freeze({
  'hist-omitted-001': 'R02', // Cain / consequences of the Fall
  'hist-omitted-006': 'R06', // Melchizedek / Abraham before Genesis 15
  'hist-omitted-054': 'R20', // David's emergence
  'hist-omitted-087': 'R28', // Daniel during the exile
  'hist-omitted-092': 'R26', // Tobias and the Assyrian diaspora, not the Babylonian exile
  'hist-omitted-093': null,  // Judith's historical setting is disputed; no false placement
  'hist-omitted-094': 'R29', // Esther in the Persian context
  'hist-omitted-116': 'R35', // Ministry: signs
  'hist-omitted-131': 'R35',
  'hist-omitted-132': 'R35',
  'hist-omitted-135': 'R35',
  'hist-omitted-137': 'R35',
  'hist-omitted-144': 'R35',
  'hist-omitted-149': 'R35', // Kingdom teaching
  'hist-omitted-154': 'R38', // Luke's journey narrative
  'hist-omitted-159': 'R38',
  'hist-omitted-161': 'R38',
  'hist-omitted-164': 'R39', // Eschatological discourse after entry to Jerusalem
  'hist-omitted-165': 'R39'
});

export function thematicNearestContext(episodeId, provisionalReading) {
  if (!Object.hasOwn(THEMATIC_NEAREST_CONTEXT, episodeId)) {
    throw new Error('Unknown episode-to-context mapping: ' + episodeId);
  }
  const chapterId = THEMATIC_NEAREST_CONTEXT[episodeId];
  if (!chapterId) return Object.freeze({
    chapterId: null, title: null, anchorStatus: 'CHRONOLOGY_UNCERTAIN_NO_PRECISE_ANCHOR',
    sourceTextPresent: false
  });
  const chapter = provisionalReading?.readingChapters?.find(c => c.id === chapterId);
  if (!chapter || chapter.publicationApproved !== false) {
    throw new Error('Unverified or approved main reading chapter: ' + chapterId);
  }
  return Object.freeze({
    chapterId, title: chapter.title, act: chapter.act, arcNumber: chapter.arcNumber,
    anchorStatus: 'NEAREST_THEMATIC_CONTEXT_NOT_EXACT_SOURCE_PLACEMENT',
    sourceTextPresent: false
  });
}