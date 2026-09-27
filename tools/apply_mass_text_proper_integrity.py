from pathlib import Path

PATH = Path('index.html')
SENTINEL = 'mass-text-proper-integrity-pregospel-20260927-v1'

s = PATH.read_text(encoding='utf-8')
if SENTINEL in s:
    print('Pre-Gospel Proper integrity patch already applied.')
    raise SystemExit(0)

old = '''    const gradualId = firstExisting(sources, ["Graduale", "GradualeP", "Tractus"]);
    const proper = {'''
new = '''    /* mass-text-proper-integrity-pregospel-20260927-v1
       Preserve the source-order sequence of all pre-Gospel chants instead of
       collapsing Gradual / Alleluia / Tract material to one firstExisting id. */
    const preGospelIds = [];
    for (const id of sources.la.order) {
        if (/^(Graduale|GradualeP|Tractus|Alleluia)(?:\\d+)?$/.test(id) && !preGospelIds.includes(id))
            preGospelIds.push(id);
    }
    for (const language of ["en", "fr"]) {
        for (const id of sources[language].order) {
            if (/^(Graduale|GradualeP|Tractus|Alleluia)(?:\\d+)?$/.test(id) && !preGospelIds.includes(id))
                preGospelIds.push(id);
        }
    }
    const gradualId = preGospelIds[0] || null;
    const proper = {'''
if s.count(old) != 1:
    raise RuntimeError(f'normalizeProper pre-Gospel anchor: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

old = '''        gradual: gradualId ? textFrom(sources, gradualId) : {},
        preGospelChants: gradualId ? [{ kind: gradualId.toLowerCase(), text: textFrom(sources, gradualId) }] : [],
        sequence: textFrom(sources, "Sequentia"),'''
new = '''        gradual: gradualId ? textFrom(sources, gradualId) : {},
        preGospelChants: preGospelIds.map((id, index) => ({
            id,
            kind: /^Tractus/i.test(id) ? "tract" : /^Alleluia/i.test(id) ? "alleluia" : "gradual",
            sourceOrder: index,
            text: textFrom(sources, id),
        })),
        sequence: textFrom(sources, "Sequentia"),'''
if s.count(old) != 1:
    raise RuntimeError(f'preGospelChants assignment: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

old = '''    pushExpected("Gradual / Tract / Alleluia", proper.gradual);
    pushExpected("Sequence", proper.sequence);'''
new = '''    proper.preGospelChants.forEach((chant, i) => pushExpected(`Pre-Gospel chant ${i + 1} (${chant.id || chant.kind})`, chant.text));
    pushExpected("Sequence", proper.sequence);'''
if s.count(old) != 1:
    raise RuntimeError(f'language coverage pre-Gospel anchor: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

# The rendering layer already accepts an array and resolves by exact id/kind.
# Harden its index fallback so a second Gradual/Alleluia cannot silently collapse
# back to the final chant when the step id carries a numeric suffix.
old = '''            const stepKind = stepId.toLowerCase();
            const semantic = chants.find(ch => (ch.kind || "").toLowerCase().includes(stepKind));
            const byIndex = stepKind === "gradual" ? chants[0] : stepKind === "alleluia" ? chants.find(ch => /allel/i.test(ch.kind || "")) || chants[1] : undefined;
            return (0, ordinary_1.normaliseText3)((exact || semantic || byIndex || chants[chants.length - 1])?.text);'''
new = '''            const stepKind = stepId.toLowerCase();
            const semantic = chants.find(ch => (ch.kind || "").toLowerCase() === stepKind);
            const numbered = stepKind.match(/^(gradual|alleluia|tract)(\\d+)$/);
            const sameKind = numbered ? chants.filter(ch => (ch.kind || "").toLowerCase() === numbered[1]) : [];
            const numberedMatch = numbered ? sameKind[Number(numbered[2]) - 1] : undefined;
            const byIndex = stepKind === "gradual" ? chants.find(ch => (ch.kind || "").toLowerCase() === "gradual") : stepKind === "alleluia" ? chants.find(ch => (ch.kind || "").toLowerCase() === "alleluia") : stepKind === "tract" ? chants.find(ch => (ch.kind || "").toLowerCase() === "tract") : undefined;
            return (0, ordinary_1.normaliseText3)((exact || numberedMatch || semantic || byIndex || chants[chants.length - 1])?.text);'''
if s.count(old) != 1:
    raise RuntimeError(f'properText pre-Gospel resolver: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

# Guard the resulting contract before writing.
for invariant in [
    SENTINEL,
    'preGospelChants: preGospelIds.map',
    'sourceOrder: index',
    'proper.preGospelChants.forEach',
    'const numberedMatch = numbered ? sameKind[Number(numbered[2]) - 1] : undefined;',
]:
    if invariant not in s:
        raise RuntimeError(f'Pre-Gospel integrity invariant missing: {invariant}')

PATH.write_text(s, encoding='utf-8')
print('Applied ordered pre-Gospel Proper integrity patch.')
