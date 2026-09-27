from pathlib import Path
import re

PATH = Path("index.html")
text = PATH.read_text(encoding="utf-8")
before = text

def sub_once(pattern, replacement, label, flags=0):
    global text
    text2, n = re.subn(pattern, replacement, text, count=1, flags=flags)
    if n != 1:
        raise SystemExit(f"{label}: expected exactly 1 match, found {n}")
    text = text2
    print("patched:", label)

def replace_once(old, new, label):
    global text
    n = text.count(old)
    if n != 1:
        raise SystemExit(f"{label}: expected exactly 1 match, found {n}")
    text = text.replace(old, new, 1)
    print("patched:", label)

needle = '''function firstExisting(sources, ids) {
    return ids.find(id => sources.la.map.has(id) || sources.en.map.has(id) || sources.fr.map.has(id)) || null;
}
function numbered(sources, base, includeBase = false) {'''
insert = '''function firstExisting(sources, ids) {
    return ids.find(id => sources.la.map.has(id) || sources.en.map.has(id) || sources.fr.map.has(id)) || null;
}
function orderedProperSections(sources, allowedIds) {
    const allowed = new Set(allowedIds);
    const seen = new Set();
    const out = [];
    for (const language of ["la", "en", "fr"]) {
        for (const id of sources[language].order || []) {
            if (allowed.has(id) && !seen.has(id)) {
                seen.add(id);
                out.push(id);
            }
        }
    }
    return out;
}
function preGospelChantsFrom(sources) {
    return orderedProperSections(sources, ["Graduale", "GradualeP", "Tractus", "Alleluia"])
        .map((id, index) => ({ id, kind: id.toLowerCase(), order: index, text: textFrom(sources, id) }))
        .filter(item => item.text.lat || item.text.en || item.text.fr);
}
function stripGospelHeading(value) {
    const out = { ...(value || {}) };
    for (const language of ["lat", "en", "fr"]) {
        const lines = String(out[language] || "").split(/\\r?\\n/);
        if (lines.length && /^(?:Sequéntia|Sequentia|Initium|Continuation|Beginning|Suite|Commencement)\\b.*(?:Evang|Gospel|Évang)/i.test(lines[0].trim()))
            lines.shift();
        out[language] = lines.join("\\n").trim();
    }
    return out;
}
function stripSuperPopulumHeading(value) {
    const out = { ...(value || {}) };
    for (const language of ["lat", "en", "fr"]) {
        const lines = String(out[language] || "").split(/\\r?\\n/);
        if (lines.length && /^(?:Oratio super populum|Prayer over the People|Prayer over the people|Oraison sur le peuple)$/i.test(lines[0].trim()))
            lines.shift();
        out[language] = lines.join("\\n").trim();
    }
    return out;
}
function numbered(sources, base, includeBase = false) {'''
replace_once(needle, insert, "proper parsing helpers")

replace_once(
    'const normal = new Set(["Officium", "Rank", "Rule", "Introitus", "Oratio", "Lectio", "Graduale", "GradualeP", "Tractus", "Sequentia", "Evangelium", "Offertorium", "Secreta", "Communio", "Postcommunio"]);',
    'const normal = new Set(["Officium", "Rank", "Rule", "Introitus", "Oratio", "Lectio", "Graduale", "GradualeP", "Tractus", "Alleluia", "Sequentia", "Evangelium", "Offertorium", "Secreta", "Communio", "Postcommunio", "Super populum"]);',
    "normal section set"
)

replace_once(
    'if (id === "__TOP__" || normal.has(id) || /^LectioL\\\\d+$/.test(id) || /^GradualeL\\\\d+$/.test(id) || /^OratioL\\\\d+$/.test(id))',
    'if (id === "__TOP__" || normal.has(id) || /^LectioL\\\\d+$/.test(id) || /^(?:Graduale|Tractus|Alleluia)L\\\\d+$/.test(id) || /^OratioL\\\\d+$/.test(id))',
    "preparatory-section filtering"
)

replace_once(
    'const gradualId = firstExisting(sources, ["Graduale", "GradualeP", "Tractus"]);\\n    const proper = {'.replace("\\\\n", "\n"),
    'const preGospelChants = preGospelChantsFrom(sources);\\n    const proper = {'.replace("\\\\n", "\n"),
    "pre-Gospel source resolver"
)

old_fields = '''        epistle: textFrom(sources, "Lectio"),
        gradual: gradualId ? textFrom(sources, gradualId) : {},
        preGospelChants: gradualId ? [{ kind: gradualId.toLowerCase(), text: textFrom(sources, gradualId) }] : [],
        sequence: textFrom(sources, "Sequentia"),
        gospel: textFrom(sources, "Evangelium"),
        offertory: textFrom(sources, "Offertorium"),
        secrets: numbered(sources, "Secreta"),
        preface,
        communion: textFrom(sources, "Communio"),
        postcommunions: numbered(sources, "Postcommunio"),
        preparatoryLessons,'''
new_fields = '''        epistle: textFrom(sources, "Lectio"),
        gradual: preGospelChants[0]?.text || {},
        preGospelChants,
        sequence: textFrom(sources, "Sequentia"),
        gospel: stripGospelHeading(textFrom(sources, "Evangelium")),
        offertory: textFrom(sources, "Offertorium"),
        secrets: numbered(sources, "Secreta", true),
        preface,
        communion: textFrom(sources, "Communio"),
        postcommunions: numbered(sources, "Postcommunio", true),
        superPopulum: stripSuperPopulumHeading(textFrom(sources, "Super populum")),
        isRequiem: /^Sancti\\/11-02m/.test(meta.path || "") || meta.path === "Votive/Defunctorum" || /(?:requiem|defunctor)/i.test(String(meta.name || "")),
        preparatoryLessons,'''
replace_once(old_fields, new_fields, "Proper fields")

replace_once(
    '    pushExpected("Epistle / Lesson", proper.epistle);\\n    pushExpected("Gradual / Tract / Alleluia", proper.gradual);\\n    pushExpected("Sequence", proper.sequence);'.replace("\\\\n", "\n"),
    '    pushExpected("Epistle / Lesson", proper.epistle);\\n    proper.preGospelChants.forEach((v, i) => pushExpected("Pre-Gospel chant " + (i + 1), v.text));\\n    pushExpected("Sequence", proper.sequence);'.replace("\\\\n", "\n"),
    "coverage for actual pre-Gospel chants"
)

coverage_pattern = r'''    proper\.postcommunions\.forEach\(\(v, i\) => pushExpected\(.+?\)\);
    proper\.preparatoryLessons\.forEach\(\(row, i\) => \{.+?\}\);
    proper\.languageCoverage = \{\};
    for \(const language of \["en", "fr"\]\) \{'''
coverage_replacement = '''    proper.postcommunions.forEach((v, i) => pushExpected("Postcommunion " + (i + 1), v));
    pushExpected("Prayer over the People", proper.superPopulum);
    proper.preparatoryLessons.forEach((row, i) => { pushExpected("Preparatory lesson " + (i + 1), row.lesson); pushExpected("Preparatory chant " + (i + 1), row.gradual); pushExpected("Preparatory collect " + (i + 1), row.collect); });
    proper.languageCoverage = {};
    for (const language of ["lat", "en", "fr"]) {'''
sub_once(coverage_pattern, coverage_replacement, "LA/EN/FR Proper coverage")

old_commem = '''            const collect = (0, proper_resolver_1.numbered)(sources, 'Oratio', true)[0];
            const secret = (0, proper_resolver_1.numbered)(sources, 'Secreta')[0];
            const postcommunion = (0, proper_resolver_1.numbered)(sources, 'Postcommunio')[0];
            if (collect)
                proper.collects.push(collect);
            if (secret)
                proper.secrets.push(secret);
            if (postcommunion)
                proper.postcommunions.push(postcommunion);'''
new_commem = '''            const collects = (0, proper_resolver_1.numbered)(sources, 'Oratio', true);
            const secrets = (0, proper_resolver_1.numbered)(sources, 'Secreta', true);
            const postcommunions = (0, proper_resolver_1.numbered)(sources, 'Postcommunio', true);
            proper.collects.push(...collects);
            proper.secrets.push(...secrets);
            proper.postcommunions.push(...postcommunions);'''
replace_once(old_commem, new_commem, "commemoration prayer series")

replace_once(
    "    if (/^Sancti\\\\/11-02m/.test(path))\\n        return 'requiem_mass_1962';".replace("\\\\n", "\n"),
    "    if (/^Sancti\\\\/11-02m/.test(path) || path === 'Votive/Defunctorum' || proper?.isRequiem)\\n        return 'requiem_mass_1962';".replace("\\\\n", "\n"),
    "Requiem profile detection"
)
replace_once(
    "        requiem_1962: 'requiem-1962', requiem: 'requiem-1962',",
    "        requiem_mass_1962: 'requiem-1962', requiem_1962: 'requiem-1962', requiem: 'requiem-1962',",
    "Requiem exceptional profile map"
)

needle = '''const secretConclusion = {
    lat: "Per ómnia sǽcula sæculórum. ℟. Amen.",
    en: "World without end. ℟. Amen.",
    fr: "Dans tous les siècles des siècles. ℟. Ainsi soit-il.",
};'''
replacement = needle + '''
const gospelConclusion = {
    lat: "℟. Laus tibi, Christe.",
    en: "℟. Praise be to Thee, O Christ.",
    fr: "℟. Louange à vous, ô Christ.",
};'''
replace_once(needle, replacement, "Gospel conclusion")
replace_once(
    '        case "gospel": return (0, ordinary_1.normaliseText3)(proper.gospel);',
    '        case "gospel": return (0, ordinary_1.concatText3)([(0, ordinary_1.normaliseText3)(proper.gospel), gospelConclusion]);',
    "Gospel body plus conclusion"
)

marker = 'function insertSuperPopulum(steps, proper, properAvailable) {'
helper = '''function preGospelStepTitle(item, index) {
    const kind = String(item?.kind || item?.id || "").toLowerCase();
    const lat = String(item?.text?.lat || "");
    const hasTract = /tract/.test(kind) || /(^|\\n)\\s*Tractus\\b/i.test(lat);
    const hasAlleluia = /allel|gradualep/.test(kind) || /Allel[uú]ia/i.test(lat);
    const hasGradual = /gradual/.test(kind);
    if (hasGradual && hasTract)
        return { lat: "Graduale · Tractus", en: "Gradual & Tract", fr: "Graduel et Trait" };
    if (hasGradual && hasAlleluia)
        return { lat: "Graduale · Allelúia", en: "Gradual & Alleluia", fr: "Graduel et Alléluia" };
    if (hasTract)
        return { lat: "Tractus", en: "Tract", fr: "Trait" };
    if (hasAlleluia)
        return { lat: "Allelúia", en: "Alleluia", fr: "Alléluia" };
    if (hasGradual)
        return { lat: "Graduale", en: "Gradual", fr: "Graduel" };
    return { lat: "Cantus " + (index + 1), en: "Chant before the Gospel " + (index + 1), fr: "Chant avant l’Évangile " + (index + 1) };
}
function insertResolvedPreGospel(steps, proper, properAvailable, form) {
    const prototypes = steps.filter(step => ["gradual", "alleluia", "tract", "sequence"].includes(step.id));
    const prototype = prototypes[0] || {
        phase: "Mass of the Catechumens",
        section: "Readings",
        actor: form === "sung" ? "choir" : "celebrant",
        priestPosition: form === "sung" ? "Sedilia / sanctuary" : "Epistle side",
        audibility: "audible",
        privateAction: false,
        posture: { value: "custom", policy: "local", source: "local" },
        gestures: [],
    };
    const out = steps.filter(step => !["gradual", "alleluia", "tract", "sequence"].includes(step.id));
    const insertAt = out.findIndex(step => step.id === "gospel-prep");
    if (insertAt < 0)
        return out;
    const resolved = [];
    if (!properAvailable) {
        const unavailable = clone(prototype);
        unavailable.id = "pre-gospel-proper";
        unavailable.title = { lat: "Cantus ante Evangelium", en: "Chant before the Gospel", fr: "Chant avant l’Évangile" };
        unavailable.subtitle = { en: "Proper of the day", fr: "Propre du jour" };
        unavailable.actor = form === "sung" ? "choir" : "celebrant";
        unavailable.properSlot = "preGospelChants";
        unavailable.properStatus = "unavailable";
        delete unavailable.text;
        delete unavailable.choir;
        resolved.push(unavailable);
    }
    else {
        for (const [index, item] of (proper?.preGospelChants || []).entries()) {
            const resolvedText = (0, ordinary_1.normaliseText3)(item?.text);
            if (!hasText(resolvedText))
                continue;
            const step = clone(prototype);
            step.id = "pre-gospel-chant-" + (index + 1);
            step.title = preGospelStepTitle(item, index);
            step.subtitle = { en: "Proper chant before the Gospel", fr: "Chant propre avant l’Évangile" };
            step.actor = form === "sung" ? "choir" : "celebrant";
            step.audibility = "audible";
            step.privateAction = false;
            step.properSlot = "preGospelChants";
            step.properStatus = "ready";
            step.text = resolvedText;
            delete step.audibleFragment;
            delete step.choir;
            resolved.push(step);
        }
        const sequenceText = (0, ordinary_1.normaliseText3)(proper?.sequence);
        if (hasText(sequenceText)) {
            const step = clone(prototype);
            step.id = "sequence";
            step.title = { lat: "Sequentia", en: "Sequence", fr: "Séquence" };
            step.subtitle = { en: "Proper sequence", fr: "Séquence propre" };
            step.actor = form === "sung" ? "choir" : "celebrant";
            step.audibility = "audible";
            step.privateAction = false;
            step.properSlot = "sequence";
            step.properStatus = "ready";
            step.text = sequenceText;
            delete step.audibleFragment;
            delete step.choir;
            resolved.push(step);
        }
    }
    return [...out.slice(0, insertAt), ...resolved, ...out.slice(insertAt)];
}
''' + marker
replace_once(marker, helper, "dynamic pre-Gospel step resolver")
replace_once(
    '    steps = steps.map(step => attachProper(step, proper, properAvailable));\\n    steps = insertSuperPopulum(steps, proper, properAvailable);'.replace("\\\\n", "\n"),
    '    steps = steps.map(step => attachProper(step, proper, properAvailable));\\n    steps = insertResolvedPreGospel(steps, proper, properAvailable, options.form);\\n    steps = insertSuperPopulum(steps, proper, properAvailable);'.replace("\\\\n", "\n"),
    "dynamic pre-Gospel sequence insertion"
)

replace_once(
    "    const rawEvents = (0, mass_engine_1.projectStep)(step, state.live.followMode).events;\\n    const events = dedupeProjectedEvents(rawEvents, state.live.form);".replace("\\\\n", "\n"),
    "    const liveEvents = dedupeProjectedEvents((0, mass_engine_1.projectStep)(step, state.live.followMode).events, state.live.form);\\n    const readerEvents = state.live.followMode === 'missal'\\n        ? liveEvents\\n        : dedupeProjectedEvents((0, mass_engine_1.projectStep)(step, 'missal').events, state.live.form);".replace("\\\\n", "\n"),
    "separate live projection from reader projection"
)
replace_once(
    "        const priorEvents = dedupeProjectedEvents((0, mass_engine_1.projectStep)(sequence.steps[i], state.live.followMode).events, state.live.form);",
    "        const priorEvents = dedupeProjectedEvents((0, mass_engine_1.projectStep)(sequence.steps[i], 'missal').events, state.live.form);",
    "canonical continuation history"
)
replace_once(
    "        soundscape: soundscape(step, events, language, state.live.form),",
    "        soundscape: soundscape(step, liveEvents, language, state.live.form),",
    "live soundscape projection"
)
replace_once(
    "        textBlocks: events.map(event => eventToBlock(event, step, language, state.live.textMode, state.live.form, !!event.continuation && priorContinuationKeys.has(projectedTextKey(event.text)))),\\n        properUnavailable: step.properStatus === 'unavailable' || events.some(event => event.kind === 'proper-unavailable'),".replace("\\\\n", "\n"),
    "        textBlocks: readerEvents.map(event => eventToBlock(event, step, language, state.live.textMode, state.live.form, !!event.continuation && priorContinuationKeys.has(projectedTextKey(event.text)))),\\n        properUnavailable: step.properStatus === 'unavailable' || readerEvents.some(event => event.kind === 'proper-unavailable'),".replace("\\\\n", "\n"),
    "canonical reader text blocks"
)

home_start = text.index("    if (state.homeSheet === 'mass') {")
home_end_marker = "\n    }\n    return "
home_end = text.index(home_end_marker, home_start) + len("\n    }")
home_block = '''    if (state.homeSheet === 'mass') {
        const p = state.resolution?.proper.status === 'ready' ? state.resolution.proper.data : null;
        const slot = (label, v) => {
            const vern = (l === 'fr' ? v?.fr : v?.en) || '';
            const latinOnly = !vern && !!v?.lat;
            const fallback = l === 'fr' ? 'Traduction française indisponible.' : 'English translation unavailable.';
            const note = latinOnly ? '<small class="translationIntegrityNote">' + (l === 'fr' ? 'Le texte latin existe, mais il n’est pas affiché comme français.' : 'Latin exists, but is not displayed as English.') + '</small>' : '';
            return '<article><b>' + esc(label) + '</b><p>' + esc(vern || fallback) + '</p>' + note + '</article>';
        };
        const series = (label, values) => (values || []).map((v, i, all) => slot(all.length > 1 ? label + ' ' + (i + 1) : label, v)).join('');
        const chantLabel = (item, index) => {
            const kind = String(item?.kind || item?.id || '').toLowerCase();
            const lat = String(item?.text?.lat || '');
            const hasTract = /tract/.test(kind) || /(^|\\n)\\s*Tractus\\b/i.test(lat);
            const hasAlleluia = /allel|gradualep/.test(kind) || /Allel[uú]ia/i.test(lat);
            if (/gradual/.test(kind) && hasTract) return l === 'fr' ? 'Graduel et Trait' : 'Gradual & Tract';
            if (/gradual/.test(kind) && hasAlleluia) return l === 'fr' ? 'Graduel et Alléluia' : 'Gradual & Alleluia';
            if (hasTract) return l === 'fr' ? 'Trait' : 'Tract';
            if (hasAlleluia) return 'Alleluia';
            return l === 'fr' ? 'Graduel ' + (index + 1) : 'Gradual ' + (index + 1);
        };
        const chants = (p?.preGospelChants || []).map((item, i) => slot(chantLabel(item, i), item?.text)).join('');
        const sequence = p?.sequence && Object.values(p.sequence).some(Boolean) ? slot(l === 'fr' ? 'Séquence' : 'Sequence', p.sequence) : '';
        const superPopulum = p?.superPopulum && Object.values(p.superPopulum).some(Boolean) ? slot(l === 'fr' ? 'Oraison sur le peuple' : 'Prayer over the People', p.superPopulum) : '';
        return '<div class="homeSheetBackdrop" data-home-sheet-close><section class="homeSheet" role="dialog" aria-modal="true"><header><div><span>' +
            (l === 'fr' ? 'Aujourd’hui' : 'Today') + '</span><h2>' + (l === 'fr' ? 'Messe du jour' : 'Today’s Mass') +
            '</h2></div><button data-home-sheet-close>×</button></header><div class="homeMassOverview">' +
            slot('Introit', p?.introit) +
            series(l === 'fr' ? 'Collecte' : 'Collect', p?.collects) +
            slot(l === 'fr' ? 'Épître / Leçon' : 'Epistle / Lesson', p?.epistle) +
            chants + sequence +
            slot(l === 'fr' ? 'Saint Évangile' : 'Holy Gospel', p?.gospel) +
            slot('Offertory', p?.offertory) +
            series(l === 'fr' ? 'Secrète' : 'Secret', p?.secrets) +
            slot(l === 'fr' ? 'Préface' : 'Preface', p?.preface) +
            slot('Communion', p?.communion) +
            series('Postcommunion', p?.postcommunions) +
            superPopulum +
            '</div></section></div>';
    }'''
text = text[:home_start] + home_block + text[home_end:]
print("patched: complete Today Mass Proper")

replace_once(
    "const groups = exceptional_steps_json_1.default.groups;",
    '''const requiemAgnus = {
    lat: 'Agnus Dei, qui tollis peccáta mundi: dona eis réquiem.\\nAgnus Dei, qui tollis peccáta mundi: dona eis réquiem.\\nAgnus Dei, qui tollis peccáta mundi: dona eis réquiem sempitérnam.',
    en: 'Lamb of God, Who takest away the sins of the world, grant them rest.\\nLamb of God, Who takest away the sins of the world, grant them rest.\\nLamb of God, Who takest away the sins of the world, grant them eternal rest.',
    fr: 'Agneau de Dieu, qui enlevez les péchés du monde, donnez-leur le repos.\\nAgneau de Dieu, qui enlevez les péchés du monde, donnez-leur le repos.\\nAgneau de Dieu, qui enlevez les péchés du monde, donnez-leur le repos éternel.',
};
const requiemDismissal = {
    lat: '℣. Requiéscant in pace.\\n℟. Amen.',
    en: '℣. May they rest in peace.\\n℟. Amen.',
    fr: '℣. Qu’ils reposent en paix.\\n℟. Ainsi soit-il.',
};
const groups = exceptional_steps_json_1.default.groups;''',
    "Requiem fixed variants"
)

old_requiem = '''function requiem(steps, form) {
    let out = steps.filter(step => !['incense-entrance', 'peace-prayer', 'blessing'].includes(step.id));
    const prep = out.find(step => step.id === 'gospel-prep');
    if (prep)
        prep.id = 'gospel-prep-requiem';
    if (form === 'sung') {
        const gospel = out.find(step => step.id === 'gospel');
        if (gospel) {
            gospel.text = stripLausTibi(gospel.text);
            gospel.variantNoteId = 'requiem-sung-no-laus-tibi';
        }
    }
    return out;
}'''
new_requiem = '''function requiem(steps, form) {
    let out = steps.filter(step => !['judica', 'gloria', 'credo', 'incense-entrance', 'peace-prayer', 'blessing'].includes(step.id));
    const prep = out.find(step => step.id === 'gospel-prep');
    if (prep)
        prep.id = 'gospel-prep-requiem';
    const agnus = out.find(step => step.id === 'agnus');
    if (agnus) {
        agnus.text = clone(requiemAgnus);
        agnus.gestures = [];
        agnus.variantNoteId = 'requiem-agnus-dona-eis-requiem';
        agnus.explanation = 'Mass for the Dead: dona eis requiem replaces miserere nobis / dona nobis pacem; the third invocation ends with requiem sempiternam. The ordinary breast-strikes are omitted.';
    }
    const dismissal = out.find(step => step.id === 'dismissal');
    if (dismissal) {
        dismissal.title = { lat: 'Requiéscant in pace', en: 'Requiescant in pace', fr: 'Requiescant in pace' };
        dismissal.text = clone(requiemDismissal);
        dismissal.variantNoteId = 'requiem-dismissal';
    }
    if (form === 'sung') {
        const gospel = out.find(step => step.id === 'gospel');
        if (gospel) {
            gospel.text = stripLausTibi(gospel.text);
            gospel.variantNoteId = 'requiem-sung-no-laus-tibi';
        }
    }
    return out;
}'''
replace_once(old_requiem, new_requiem, "Requiem sequence overrides")

required = {
    "Secret base section": 'secrets: numbered(sources, "Secreta", true)',
    "Postcommunion base section": 'postcommunions: numbered(sources, "Postcommunio", true)',
    "Super populum parser": 'superPopulum: stripSuperPopulumHeading',
    "Gospel source-heading strip": 'gospel: stripGospelHeading',
    "Explicit Gospel conclusion": 'const gospelConclusion =',
    "Dynamic pre-Gospel sequence": 'insertResolvedPreGospel(steps, proper, properAvailable, options.form)',
    "Canonical reader projection": "projectStep)(step, 'missal').events",
    "Today Mass Secret": "series(l === 'fr' ? 'Secrète' : 'Secret', p?.secrets)",
    "Requiem Agnus": 'dona eis réquiem sempitérnam',
    "Requiem dismissal": 'Requiéscant in pace',
    "Requiem profile map": "requiem_mass_1962: 'requiem-1962'",
}
missing = [name for name, token in required.items() if token not in text]
if missing:
    raise SystemExit("contract failed: " + ", ".join(missing))
if text == before:
    raise SystemExit("no changes produced")

PATH.write_text(text, encoding="utf-8")
print("OK: wrote", PATH, "delta", len(text) - len(before), "chars")
