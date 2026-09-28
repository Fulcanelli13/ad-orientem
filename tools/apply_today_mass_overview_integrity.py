from pathlib import Path

PATH = Path('index.html')
SENTINEL = 'today-mass-overview-integrity-20260928-v1'

s = PATH.read_text(encoding='utf-8')
if SENTINEL in s:
    print("Today's Mass overview integrity patch already applied.")
    raise SystemExit(0)

old = '''    if (state.homeSheet === 'mass') {
        const p = state.resolution?.proper.status === 'ready' ? state.resolution.proper.data : null;
        const slot = (label, v) => { const vern = (l === 'fr' ? v?.fr : v?.en) || ''; const latinOnly = !vern && !!v?.lat; return `<article><b>${esc(label)}</b><p>${esc(vern || (l === 'fr' ? 'Traduction française indisponible.' : 'English translation unavailable.'))}</p>${latinOnly ? `<small class="translationIntegrityNote">${l === 'fr' ? 'Le texte latin existe, mais il n’est pas affiché comme français.' : 'Latin exists, but is not displayed as English.'}</small>` : ''}</article>`; };
        return `<div class="homeSheetBackdrop" data-home-sheet-close><section class="homeSheet" role="dialog" aria-modal="true"><header><div><span>${l === 'fr' ? 'Aujourd’hui' : 'Today'}</span><h2>${l === 'fr' ? "Messe du jour" : "Today’s Mass"}</h2></div><button data-home-sheet-close>×</button></header><div class="homeMassOverview">${slot('Introit', p?.introit)}${slot(l === 'fr' ? 'Collecte' : 'Collect', p?.collects?.[0])}${slot(l === 'fr' ? 'Épître / Leçon' : 'Epistle / Lesson', p?.epistle)}${slot(l === 'fr' ? 'Saint Évangile' : 'Holy Gospel', p?.gospel)}${slot('Offertory', p?.offertory)}${slot('Communion', p?.communion)}</div></section></div>`;
    }'''

new = '''    if (state.homeSheet === 'mass') {
        /* today-mass-overview-integrity-20260928-v1 */
        const p = state.resolution?.proper.status === 'ready' ? state.resolution.proper.data : null;
        const slot = (label, v) => { const vern = (l === 'fr' ? v?.fr : v?.en) || ''; const latinOnly = !vern && !!v?.lat; return `<article><b>${esc(label)}</b><p>${esc(vern || (l === 'fr' ? 'Traduction française indisponible.' : 'English translation unavailable.'))}</p>${latinOnly ? `<small class="translationIntegrityNote">${l === 'fr' ? 'Le texte latin existe, mais il n’est pas affiché comme français.' : 'Latin exists, but is not displayed as English.'}</small>` : ''}</article>`; };
        const slots = [];
        const add = (label, text) => { if (text && (text.lat || text.en || text.fr)) slots.push(slot(label, text)); };
        const addSeries = (baseEn, baseFr, values) => (values || []).filter(Boolean).forEach((text, i, arr) => add(arr.length > 1 ? `${l === 'fr' ? baseFr : baseEn} ${i + 1}` : (l === 'fr' ? baseFr : baseEn), text));
        const chantLabel = (chant, i) => {
            const raw = String(chant?.kind || chant?.id || '').toLowerCase();
            if (raw.includes('tract')) return l === 'fr' ? 'Trait' : 'Tract';
            if (raw.includes('alleluia')) return 'Alleluia';
            if (raw.includes('gradual')) return l === 'fr' ? 'Graduel' : 'Gradual';
            return `${l === 'fr' ? 'Chant' : 'Chant'} ${i + 1}`;
        };
        add('Introit', p?.introit);
        addSeries('Collect', 'Collecte', p?.collects);
        add(l === 'fr' ? 'Épître / Leçon' : 'Epistle / Lesson', p?.epistle);
        (p?.preGospelChants || []).filter(Boolean).forEach((chant, i) => add(chantLabel(chant, i), chant?.text || chant));
        if (!(p?.preGospelChants || []).length) add(l === 'fr' ? 'Graduel / Alleluia / Trait' : 'Gradual / Alleluia / Tract', p?.gradual);
        add(l === 'fr' ? 'Séquence' : 'Sequence', p?.sequence);
        add(l === 'fr' ? 'Saint Évangile' : 'Holy Gospel', p?.gospel);
        add('Offertory', p?.offertory);
        addSeries('Secret', 'Secrète', p?.secrets);
        add(l === 'fr' ? 'Préface' : 'Preface', p?.preface);
        add('Communion', p?.communion);
        addSeries('Postcommunion', 'Postcommunion', p?.postcommunions);
        add(l === 'fr' ? 'Oraison sur le peuple' : 'Prayer over the People', p?.superPopulum);
        return `<div class="homeSheetBackdrop" data-home-sheet-close><section class="homeSheet" role="dialog" aria-modal="true"><header><div><span>${l === 'fr' ? 'Aujourd’hui' : 'Today'}</span><h2>${l === 'fr' ? "Messe du jour" : "Today’s Mass"}</h2></div><button data-home-sheet-close>×</button></header><div class="homeMassOverview">${slots.join('')}</div></section></div>`;
    }'''

count = s.count(old)
if count != 1:
    raise RuntimeError(f"Today's Mass overview anchor: expected 1 match, found {count}")
s = s.replace(old, new, 1)

for invariant in [
    SENTINEL,
    "addSeries('Collect', 'Collecte', p?.collects);",
    "p?.preGospelChants || []",
    "add(l === 'fr' ? 'Séquence' : 'Sequence', p?.sequence);",
    "addSeries('Secret', 'Secrète', p?.secrets);",
    "add(l === 'fr' ? 'Préface' : 'Preface', p?.preface);",
    "addSeries('Postcommunion', 'Postcommunion', p?.postcommunions);",
    "p?.superPopulum",
    "${slots.join('')}"
]:
    if invariant not in s:
        raise RuntimeError(f"Today's Mass overview invariant missing: {invariant}")

# Regression guard: the old six-slot projection must be gone.
if "p?.collects?.[0]" in s:
    raise RuntimeError("Today's Mass still projects only the first Collect")

PATH.write_text(s, encoding='utf-8')
print("Applied complete Today's Mass Proper overview patch.")
