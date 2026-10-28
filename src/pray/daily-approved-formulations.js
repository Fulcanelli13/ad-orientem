/**
 * Historical Daily Prayer forms explicitly released for public recitation.
 *
 * EMPTY BY DESIGN. The printed-witness concordance in PR #1785 is still a
 * research artifact; no user-approved default, territorial distribution
 * clearance, or final copy-editing gate has been completed. Do not import
 * research JSONs, remote lists or ambient global variables into this module.
 *
 * A later separately reviewed change can add a source-bound immutable
 * witnesses/profiles manifest only after the editorial and rights gates.
 * The live personal reader defaults to St Pius X 1913 (Morning 11 / Evening
 * 10 core cards). The historical legacy 11 / 13 reader was a different,
 * earlier canonical structure; it is not the printed Pius X sequence.
 */
export const APPROVED_DAILY_FORMULATION_MANIFEST_V1=Object.freeze({
  witnesses:Object.freeze({}),
  profiles:Object.freeze({})
});

/**
 * A source profile must be explicitly allowed here, marked 'approved' in
 * the manifest and composed only of releaseStatus='cleared' source witnesses
 * before a replacement sequence may appear. No remote feature flag bypass.
 */
export const DAILY_APPROVED_SEQUENCE_RELEASE_V1=Object.freeze({
  enabled:false,
  approvedProfileKeys:Object.freeze({})
});
