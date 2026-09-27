from pathlib import Path

PATH = Path('index.html')
SENTINEL = 'mass-sequence-graph-integrity-20260927-v1'

s = PATH.read_text(encoding='utf-8')
if SENTINEL in s:
    print('Sequence graph integrity patch already applied.')
    raise SystemExit(0)

# Sequentia is already normalized as a Proper slot, but the ordinary templates do
# not contain a dedicated consumer. Insert it dynamically immediately before the
# Gospel announcement, after the pre-Gospel chant complex.
anchor = '''function insertSuperPopulum(steps, proper, properAvailable) {'''
if s.count(anchor) != 1:
    raise RuntimeError(f'Sequence insertion anchor: expected 1 match, found {s.count(anchor)}')
helper = '''/* mass-sequence-graph-integrity-20260927-v1 */
function insertSequence(steps, proper, properAvailable) {
    const text = properAvailable ? (0, ordinary_1.normaliseText3)(proper?.sequence) : undefined;
    if (!text)
        return steps;
    if (steps.some(step => step.id === "sequence"))
        return steps;
    const gospelIdx = steps.findIndex(step => step.id === "gospel-announcement");
    if (gospelIdx < 0)
        throw new Error("Sequence appointed but gospel-announcement step is missing");
    const sequence = {
        id: "sequence",
        phase: "Mass of the Catechumens",
        section: "Epistle & Gospel",
        title: { lat: "Sequentia", en: "Sequence", fr: "Séquence" },
        actor: "choir",
        audibility: "choir",
        privateAction: false,
        text,
        canonicalText: text,
        properSlot: "sequence",
        properStatus: "ready",
        gestures: [],
    };
    return [...steps.slice(0, gospelIdx), sequence, ...steps.slice(gospelIdx)];
}
'''
s = s.replace(anchor, helper + anchor, 1)

old = '''    steps = steps.map(step => attachProper(step, proper, properAvailable));
    steps = insertSuperPopulum(steps, proper, properAvailable);'''
new = '''    steps = steps.map(step => attachProper(step, proper, properAvailable));
    steps = insertSequence(steps, proper, properAvailable);
    steps = insertSuperPopulum(steps, proper, properAvailable);'''
if s.count(old) != 1:
    raise RuntimeError(f'buildMassSequence Sequence wiring anchor: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

# Choir-only steps previously relied on choir sub-events. A first-class Sequence
# carries its own canonical text, so expose that text in VOX when actor=choir.
old = '''    else if (step.audibility === "choir") {
        // Choir already emitted above.
    }'''
new = '''    else if (step.audibility === "choir") {
        // Concurrent choir events are already emitted above. A first-class choir
        // step (notably an appointed Sequence) owns its own canonical text.
        if (step.actor === "choir" && step.text)
            events.push({ stepId: step.id, kind: "choir", actor: "choir", text: step.text, properSlot: step.properSlot });
    }'''
if s.count(old) != 1:
    raise RuntimeError(f'VOX choir Sequence anchor: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

for invariant in [
    SENTINEL,
    'function insertSequence(steps, proper, properAvailable)',
    'steps = insertSequence(steps, proper, properAvailable);',
    'const gospelIdx = steps.findIndex(step => step.id === "gospel-announcement");',
    'properSlot: "sequence"',
    'canonicalText: text',
    'step.actor === "choir" && step.text',
]:
    if invariant not in s:
        raise RuntimeError(f'Sequence graph invariant missing: {invariant}')

# Guard liturgical ordering contract: dynamic Sequence insertion must precede the
# Gospel announcement and happen only when canonical Sequence text exists.
if s.index('steps = insertSequence(steps, proper, properAvailable);') > s.index('steps = insertSuperPopulum(steps, proper, properAvailable);'):
    raise RuntimeError('Sequence graph insertion order unexpectedly moved')

PATH.write_text(s, encoding='utf-8')
print('Applied Sequence graph/render integrity patch.')
