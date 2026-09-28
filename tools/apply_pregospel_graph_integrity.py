from pathlib import Path

PATH = Path('index.html')
SENTINEL = 'mass-pregospel-graph-integrity-20260928-v1'

s = PATH.read_text(encoding='utf-8')
if SENTINEL in s:
    print('Pre-Gospel graph integrity patch already applied.')
    raise SystemExit(0)

anchor = '''/* mass-sequence-graph-integrity-20260927-v1 */
function insertSequence(steps, proper, properAvailable) {'''
if s.count(anchor) != 1:
    raise RuntimeError(f'pre-Gospel graph helper anchor: expected 1 match, found {s.count(anchor)}')

helper = '''/* mass-pregospel-graph-integrity-20260928-v1 */
function materializePreGospelSteps(steps, proper, properAvailable) {
    const chants = properAvailable ? (proper?.preGospelChants || []).filter(ch => ch?.text) : [];
    if (!chants.length)
        return steps;
    const gradualIndex = steps.findIndex(step => step.id === "gradual");
    const alleluiaIndex = steps.findIndex(step => step.id === "alleluia");
    const indexes = [gradualIndex, alleluiaIndex].filter(index => index >= 0);
    if (!indexes.length)
        throw new Error("Appointed pre-Gospel chants exist but ordinary chant prototypes are missing");
    const insertAt = Math.min(...indexes);
    const gradualPrototype = gradualIndex >= 0 ? steps[gradualIndex] : steps[alleluiaIndex];
    const alleluiaPrototype = alleluiaIndex >= 0 ? steps[alleluiaIndex] : gradualPrototype;
    const keep = steps.filter(step => step.id !== "gradual" && step.id !== "alleluia");
    const titles = {
        gradual: { lat: "Graduale", en: "Gradual", fr: "Graduel" },
        alleluia: { lat: "Alleluia", en: "Alleluia", fr: "Alléluia" },
        tract: { lat: "Tractus", en: "Tract", fr: "Trait" },
    };
    const dynamic = chants.map((chant, index) => {
        const kind = chant.kind || "gradual";
        const prototype = kind === "gradual" ? gradualPrototype : alleluiaPrototype;
        return {
            ...prototype,
            id: chant.id || (index === 0 ? kind : `${kind}${index + 1}`),
            title: titles[kind] || prototype.title,
            properSlot: "preGospelChants",
        };
    });
    return [...keep.slice(0, insertAt), ...dynamic, ...keep.slice(insertAt)];
}
'''
s = s.replace(anchor, helper + anchor, 1)

old = '''    steps = filterOrdinarySteps(steps, options, proper);
    steps = steps.map(step => attachProper(step, proper, properAvailable));
    steps = insertSequence(steps, proper, properAvailable);'''
new = '''    steps = filterOrdinarySteps(steps, options, proper);
    steps = materializePreGospelSteps(steps, proper, properAvailable);
    steps = steps.map(step => attachProper(step, proper, properAvailable));
    steps = insertSequence(steps, proper, properAvailable);'''
if s.count(old) != 1:
    raise RuntimeError(f'buildMassSequence pre-Gospel materialization anchor: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

for invariant in [
    SENTINEL,
    'function materializePreGospelSteps(steps, proper, properAvailable)',
    'step.id !== "gradual" && step.id !== "alleluia"',
    'tract: { lat: "Tractus", en: "Tract", fr: "Trait" }',
    'steps = materializePreGospelSteps(steps, proper, properAvailable);',
]:
    if invariant not in s:
        raise RuntimeError(f'Pre-Gospel graph invariant missing: {invariant}')

PATH.write_text(s, encoding='utf-8')
print('Applied data-driven pre-Gospel Mass graph patch.')
