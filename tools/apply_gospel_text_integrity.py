from pathlib import Path

PATH = Path('index.html')
SENTINEL = 'mass-text-proper-integrity-gospel-20260927-v1'

s = PATH.read_text(encoding='utf-8')
if SENTINEL in s:
    print('Gospel text integrity patch already applied.')
    raise SystemExit(0)

# Proper source files can carry their own Sequentia/Continuation heading. The
# Mass graph already supplies the liturgical Gospel announcement/dialogue, so
# the Proper slot must contain scripture body only or the heading is duplicated.
anchor = '''function gospelAnnouncementText(proper) {'''
helper = r'''/* mass-text-proper-integrity-gospel-20260927-v1 */
function stripGospelSourceHeading(text) {
    const clean = (value) => {
        let out = String(value || '').trim();
        // Divinum Officium Gospel sections commonly begin with a rubric/citation
        // and/or Sequentia/Continuation/Suite heading. Keep the citation/body;
        // remove only the liturgical announcement that the graph renders itself.
        out = out.replace(/^(?:Sequéntia|Sequentia)\s+[✠+]?\s*sancti\s+Evangélii\s+secúndum[^\n]*\n*/i, '');
        out = out.replace(/^Continuation\s+[✠+]?\s*of\s+the\s+Holy\s+Gospel\s+according\s+to[^\n]*\n*/i, '');
        out = out.replace(/^Suite\s+[✠+]?\s+du\s+saint\s+Évangile\s+selon[^\n]*\n*/i, '');
        return out.trim();
    };
    const value = text || {};
    return { lat: clean(value.lat), en: clean(value.en), fr: clean(value.fr) };
}
'''
if s.count(anchor) != 1:
    raise RuntimeError(f'Gospel helper anchor: expected 1 match, found {s.count(anchor)}')
s = s.replace(anchor, helper + anchor, 1)

old = '''        gospel: textFrom(sources, "Evangelium"),'''
new = '''        gospel: stripGospelSourceHeading(textFrom(sources, "Evangelium")),'''
if s.count(old) != 1:
    raise RuntimeError(f'Gospel normalization assignment: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

# Make the rendering contract explicit: announcement and body are separate
# canonical objects. This preserves the scripture body regardless of live VOX.
old = '''        case "gospel": return (0, ordinary_1.normaliseText3)(proper.gospel);'''
new = '''        case "gospel": return (0, ordinary_1.normaliseText3)(proper.gospel); // body only; announcement is gospelAnnouncementText(proper)'''
if s.count(old) != 1:
    raise RuntimeError(f'Gospel rendering contract: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

for invariant in [
    SENTINEL,
    'function stripGospelSourceHeading(text)',
    'gospel: stripGospelSourceHeading(textFrom(sources, "Evangelium"))',
    'announcement is gospelAnnouncementText(proper)',
]:
    if invariant not in s:
        raise RuntimeError(f'Gospel integrity invariant missing: {invariant}')

PATH.write_text(s, encoding='utf-8')
print('Applied Gospel body/announcement integrity patch.')
