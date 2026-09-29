from pathlib import Path

PATH = Path('index.html')
SENTINEL = 'mass-text-proper-integrity-pregospel-20260927-v2'

s = PATH.read_text(encoding='utf-8')
if SENTINEL in s:
    print('Pre-Gospel Proper semantic integrity patch already applied.')
    raise SystemExit(0)

old = '''    const gradualId = firstExisting(sources, ["Graduale", "GradualeP", "Tractus"]);
    const proper = {'''
new = r'''    /* mass-text-proper-integrity-pregospel-20260927-v2
       Divinum Officium commonly stores Gradual+Alleluia, Gradual+Tract, or
       multiple Eastertide Alleluias inside one [Graduale] section. Preserve the
       actual liturgical chant sequence rather than treating section IDs as chants. */
    const preGospelIds = [];
    for (const language of ["la", "en", "fr"]) {
        for (const id of sources[language].order) {
            if (/^(Graduale|GradualeP|Tractus|Alleluia)(?:\d+)?$/.test(id) && !preGospelIds.includes(id))
                preGospelIds.push(id);
        }
    }
    const fallbackKind = (id) => /^Tractus/i.test(id) ? "tract" : /^Alleluia/i.test(id) ? "alleluia" : "gradual";
    const alleluiaWord = /all[eé]l[uú](?:i|í|j)a/ig;
    const splitPreGospelLines = (lines, defaultKind) => {
        const raw = (lines || []).map(line => String(line).trim()).filter(line => line && line !== "_");
        if (!raw.length)
            return [];
        const tractIndex = raw.findIndex(line => /^!Tractus$/i.test(line));
        if (tractIndex >= 0) {
            const before = raw.slice(0, tractIndex);
            const after = raw.slice(tractIndex + 1);
            return [
                ...(before.length ? [{ kind: "gradual", lines: before }] : []),
                ...(after.length ? [{ kind: "tract", lines: after }] : []),
            ];
        }
        let doubleIndex = -1;
        let firstAlleluiaIndex = -1;
        for (let i = 0; i < raw.length; i += 1) {
            const matches = [...raw[i].matchAll(alleluiaWord)];
            alleluiaWord.lastIndex = 0;
            if (matches.length >= 2) {
                doubleIndex = i;
                firstAlleluiaIndex = matches[0].index ?? 0;
                break;
            }
        }
        if (doubleIndex >= 0) {
            const line = raw[doubleIndex];
            const prefixTail = line.slice(0, firstAlleluiaIndex).trim().replace(/[,:;\s]+$/, "");
            const alleluiaStart = line.slice(firstAlleluiaIndex).trim();
            const prefix = [...raw.slice(0, doubleIndex), ...(prefixTail ? [prefixTail] : [])];
            const tail = [alleluiaStart, ...raw.slice(doubleIndex + 1)];
            const groups = [];
            let current = [];
            let seenReference = false;
            for (const item of tail) {
                const isReference = /^!/.test(item);
                if (isReference && seenReference && current.some(value => !/^!/.test(value))) {
                    groups.push(current);
                    current = [];
                }
                if (isReference)
                    seenReference = true;
                current.push(item);
            }
            if (current.length)
                groups.push(current);
            return [
                ...(prefix.length ? [{ kind: defaultKind === "tract" ? "tract" : "gradual", lines: prefix }] : []),
                ...groups.filter(group => group.length).map(lines => ({ kind: "alleluia", lines })),
            ];
        }
        return [{ kind: defaultKind, lines: raw }];
    };
    const semanticByLanguage = {};
    for (const language of ["la", "en", "fr"]) {
        const blocks = [];
        for (const id of preGospelIds) {
            for (const block of splitPreGospelLines(sources[language].map.get(id) || [], fallbackKind(id)))
                blocks.push({ ...block, sourceId: id });
        }
        semanticByLanguage[language] = blocks;
    }
    const authority = semanticByLanguage.la.length ? semanticByLanguage.la : semanticByLanguage.en.length ? semanticByLanguage.en : semanticByLanguage.fr;
    const occurrence = {};
    const preGospelChants = authority.map((base, index) => {
        occurrence[base.kind] = (occurrence[base.kind] || 0) + 1;
        const ordinal = occurrence[base.kind];
        const id = ordinal === 1 ? base.kind : `${base.kind}${ordinal}`;
        const pick = (language) => {
            const sameKind = semanticByLanguage[language].filter(block => block.kind === base.kind);
            return sameKind[ordinal - 1] || semanticByLanguage[language][index] || null;
        };
        const la = pick("la"), en = pick("en"), fr = pick("fr");
        return {
            id,
            kind: base.kind,
            sourceId: base.sourceId,
            sourceOrder: index,
            text: {
                lat: la ? cleanLines(la.lines, "la") : "",
                en: en ? cleanLines(en.lines, "en") : "",
                fr: fr ? cleanLines(fr.lines, "fr") : "",
            },
        };
    });
    const gradualId = preGospelIds[0] || null;
    const proper = {'''
if s.count(old) != 1:
    raise RuntimeError(f'normalizeProper semantic pre-Gospel anchor: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

old = '''        gradual: gradualId ? textFrom(sources, gradualId) : {},
        preGospelChants: gradualId ? [{ kind: gradualId.toLowerCase(), text: textFrom(sources, gradualId) }] : [],
        sequence: textFrom(sources, "Sequentia"),'''
new = '''        gradual: gradualId ? textFrom(sources, gradualId) : {},
        preGospelChants,
        sequence: textFrom(sources, "Sequentia"),'''
if s.count(old) != 1:
    raise RuntimeError(f'preGospelChants semantic assignment: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

old = '''    pushExpected("Gradual / Tract / Alleluia", proper.gradual);
    pushExpected("Sequence", proper.sequence);'''
new = '''    proper.preGospelChants.forEach((chant, i) => pushExpected(`Pre-Gospel chant ${i + 1} (${chant.id || chant.kind})`, chant.text));
    pushExpected("Sequence", proper.sequence);'''
if s.count(old) != 1:
    raise RuntimeError(f'language coverage pre-Gospel anchor: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

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

for invariant in [
    SENTINEL,
    'const splitPreGospelLines = (lines, defaultKind) =>',
    'const tractIndex = raw.findIndex(line => /^!Tractus$/i.test(line));',
    'matches.length >= 2',
    'const preGospelChants = authority.map',
    'preGospelChants,',
    'proper.preGospelChants.forEach',
    'const numberedMatch = numbered ? sameKind[Number(numbered[2]) - 1] : undefined;',
]:
    if invariant not in s:
        raise RuntimeError(f'Pre-Gospel semantic integrity invariant missing: {invariant}')

PATH.write_text(s, encoding='utf-8')
print('Applied semantic ordered pre-Gospel Proper integrity patch.')
