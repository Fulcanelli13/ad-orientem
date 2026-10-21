import { buildThematicPilots, selectThematicChapterVerses,
  THEMATIC_EDITION_IDS } from './historia-thematic-collections.js';
import { thematicNearestContext } from './historia-thematic-context.js';
import { loadScriptureWitness } from './witness-loader.js';

const REGISTRY = '/data/research/historia-salutis-thematic-episode-reconciliation-20261021.v2.json';
const P3 = '/data/research/historia-salutis-p3-provisional-reading-chapter-consolidation-20261021.v2.json';
const RESEARCH_BRANCH = 'research/historia-thematic-episodes-20261021';
const P3_LINK = 'https://github.com/Fulcanelli13/ad-orientem/blob/' + RESEARCH_BRANCH + P3;
const EDITION_LABELS = Object.freeze({
  'dr-challoner': 'Douay–Rheims / Challoner · English',
  'cpdv-2009': 'Catholic Public Domain Version · English',
  'crampon-1923': 'Crampon 1923 · Français'
});
const make = (tag, className, content) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined && content !== null) node.textContent = content;
  return node;
};
function appendLink(parent, label, href) {
  const a = make('a', '', label);
  a.href = href; a.rel = 'noopener noreferrer'; a.target = '_blank';
  parent.append(a);
  return a;
}
const byId = id => document.getElementById(id);

export async function mountHistoriaThematicPreview() {
  const tabs = byId('collections'), index = byId('episode-index'),
    indexHeading = byId('episode-index-heading'), reading = byId('episode-reading');
  if (!tabs || !index || !reading) throw new Error('Thematic reader mount elements are missing');
  const fetchJson = async url => {
    const response = await fetch(url, {cache: 'no-store'});
    if (!response.ok) throw new Error('Cannot load source file (' + response.status + '): ' + url);
    return response.json();
  };
  const [registry, p3] = await Promise.all([fetchJson(REGISTRY), fetchJson(P3)]);
  const collections = buildThematicPilots(registry), cache = new Map();
  let collection = collections[0], episode = collection.episodes[0],
    pageIndex = 0, edition = 'dr-challoner', generation = 0;
  const rawHash = decodeURIComponent(location.hash.slice(1));
  const deepLinked = collections.flatMap(group => group.episodes.map(ep => ({group, ep})))
    .find(item => item.ep.id === rawHash);
  if (deepLinked) { collection = deepLinked.group; episode = deepLinked.ep; }

  function setHash() {
    history.replaceState(null, '', location.pathname + location.search + '#' +
      encodeURIComponent(episode.id));
  }
  function selectEpisode(next, group = collection) {
    collection = group; episode = next; pageIndex = 0;
    // Esther's manuscript numbering is edition-specific, not cross-edition interchangeable.
    if (episode.plan.book === 'Esther' && edition !== 'dr-challoner') edition = 'dr-challoner';
    setHash(); drawTabs(); drawIndex(); void drawReading();
  }
  function drawTabs() {
    tabs.replaceChildren();
    for (const group of collections) {
      const btn = make('button', '', group.title + ' · ' + group.episodes.length);
      btn.type = 'button'; btn.setAttribute('aria-pressed', String(group.id === collection.id));
      btn.addEventListener('click', () => selectEpisode(group.episodes[0], group));
      tabs.append(btn);
    }
  }
  function drawIndex() {
    indexHeading.textContent = collection.title;
    index.replaceChildren();
    for (const [i, ep] of collection.episodes.entries()) {
      const item = make('li'), btn = make('button');
      btn.type = 'button'; btn.setAttribute('aria-current', String(episode.id === ep.id));
      const no = make('span', 'episode-order', String(i + 1).padStart(2, '0'));
      const label = make('span');
      label.append(make('span', '', ep.title), make('small', '', ep.reference));
      btn.append(no, label);
      btn.addEventListener('click', () => selectEpisode(ep));
      item.append(btn); index.append(item);
    }
  }
  async function getWitness(id, book) {
    const key = id + '|' + book;
    if (!cache.has(key)) {
      cache.set(key, loadScriptureWitness(id, book).catch(error => {
        cache.delete(key); throw error;
      }));
    }
    return cache.get(key);
  }
  function drawContext(target) {
    const nearest = thematicNearestContext(episode.id, p3);
    const summary = make('details', 'research-notes');
    summary.append(make('summary', '', 'Narrative context, Atlas and source provenance'));
    summary.append(make('p', '', 'Covenantal / literary context: ' + episode.covenantalContext));
    if (nearest.chapterId) {
      summary.append(make('p', '', 'Nearest Historia Salutis reading chapter: ' +
        nearest.chapterId + ' · ' + nearest.title + ' (Act: ' + nearest.act + '). ' +
        'This is a thematic navigation context, not evidence that the episode is quoted in the main reading.'));
      const p = make('p');
      appendLink(p, 'Inspect provisional Historia Salutis chapter mapping', P3_LINK);
      summary.append(p);
    } else {
      summary.append(make('p', '', 'No precise chapter anchor assigned: the historical placement requires review.'));
    }
    if (episode.atlasRefs.length) {
      const unique = new Set(episode.atlasRefs.map(x => x.placeId + ' / ' + x.eventId));
      summary.append(make('p', '', 'Existing Biblical Atlas event references: ' +
        Array.from(unique).join('; ') + '. Cross-references only; not proof of identical episode identity.'));
    }
    summary.append(make('p', '', 'Original classification: ' + episode.sourceCoverage +
      '. Original verse limits were taken from the omission inventory. ' +
      'No new editorial connectors or typological assertions appear in this reading.'));
    target.append(summary);
  }
  async function drawReading() {
    const token = ++generation;
    reading.replaceChildren();
    const header = make('div');
    header.append(make('div', 'backline', 'HISTORIA SALUTIS · SCRIPTURE COLLECTIONS'));
    header.append(make('h2', '', episode.title), make('p', 'ref', episode.reference));
    header.append(make('p', 'context', episode.covenantalContext));
    reading.append(header);
    const bar = make('div', 'sourcebar'), label = make('label', '', 'Source-language / historical witness');
    const select = make('select');
    select.setAttribute('aria-label', 'Choose Scripture source edition');
    for (const id of THEMATIC_EDITION_IDS) {
      const option = make('option', '', EDITION_LABELS[id]);
      option.value = id;
      if (episode.plan.book === 'Esther' && id !== 'dr-challoner') {
        option.disabled = true;
        option.textContent += ' · versification review needed';
      }
      select.append(option);
    }
    select.value = edition;
    select.addEventListener('change', () => {
      edition = select.value; void drawReading();
    });
    label.append(select); bar.append(label);
    bar.append(make('span', 'eyebrow', 'UNAPPROVED RESEARCH READER'));
    reading.append(bar);
    reading.append(make('p', 'source-note',
      'Direct Scripture text from one source-labelled, uncollated Catholic witness. ' +
      'Transcription and printed-edition collation remain pending. This is not a certified publication text.'));

    const page = episode.plan.chapters[pageIndex], section = make('section', 'scripture-chapter');
    const head = make('div', 'chapter-heading');
    head.append(make('h3', '', page.label),
      make('span', '', 'Chapter ' + (pageIndex + 1) + ' of ' + episode.plan.chapters.length));
    section.append(head);
    const prose = make('div', 'verses');
    prose.setAttribute('aria-live', 'polite');
    prose.append(make('p', 'loading', 'Loading the source witness…'));
    section.append(prose); reading.append(section);
    const pager = make('nav', 'pager');
    pager.setAttribute('aria-label', 'Scripture chapter navigation');
    const previous = make('button', '', '← Previous chapter');
    previous.type = 'button'; previous.disabled = pageIndex === 0;
    previous.addEventListener('click', () => {pageIndex--; void drawReading();});
    const next = make('button', '', 'Next chapter →');
    next.type = 'button'; next.disabled = pageIndex === episode.plan.chapters.length - 1;
    next.addEventListener('click', () => {pageIndex++; void drawReading();});
    pager.append(previous, next);
    if (episode.plan.chapters.length > 1) reading.append(pager);
    drawContext(reading);
    const current = collection.episodes.findIndex(item => item.id === episode.id);
    const bottom = make('nav', 'hist-bottom');
    bottom.setAttribute('aria-label', 'Related episodes in this collection');
    const prevEp = make('button', '', '← Previous episode');
    prevEp.disabled = current <= 0;
    prevEp.addEventListener('click', () => selectEpisode(collection.episodes[current - 1]));
    const nextEp = make('button', '', 'Next episode →');
    nextEp.disabled = current >= collection.episodes.length - 1;
    nextEp.addEventListener('click', () => selectEpisode(collection.episodes[current + 1]));
    bottom.append(prevEp, nextEp); reading.append(bottom);
    try {
      const witness = await getWitness(edition, page.book);
      const result = selectThematicChapterVerses(witness, edition, page);
      if (token !== generation) return;
      prose.replaceChildren();
      if (result.missingVerseNumbers.length) {
        prose.append(make('p', 'source-gap',
          'Transcription gap at verse(s): ' + result.missingVerseNumbers.join(', ') +
          '. Missing text has not been guessed or filled.'));
      }
      for (const v of result.verses) {
        const para = make('p', 'verse');
        para.append(make('span', 'verse-number', v.verse), document.createTextNode(v.text));
        prose.append(para);
      }
      const first = result.verses[0];
      if (first.sourceUrl) {
        const credit = make('p', 'source-note');
        credit.append(document.createTextNode('Source: ' + first.sourceEdition + ' · '));
        appendLink(credit, 'Pinned transcription provenance', first.sourceUrl);
        prose.append(credit);
      }
    } catch (error) {
      if (token !== generation) return;
      prose.replaceChildren(make('p', 'error', 'This source passage cannot be displayed. ' +
        'No Scripture will be reconstructed from memory.\n' + String(error.message || error) +
        '\nServe the repository over HTTP, not file://, to load its original data files.'));
    }
  }
  drawTabs(); drawIndex(); setHash(); await drawReading();
  window.addEventListener('hashchange', () => {
    const wanted = decodeURIComponent(location.hash.slice(1));
    const found = collections.flatMap(group => group.episodes.map(ep => ({group, ep})))
      .find(item => item.ep.id === wanted);
    if (found && found.ep.id !== episode.id) selectEpisode(found.ep, found.group);
  });
  return Object.freeze({
    getStatus: () => ({collection: collection.id, episode: episode.id, edition,
      sourceReviewStatus: 'UNCOLLATED_SOURCE_WITNESS', chapterPage: pageIndex + 1}),
    selectEpisodeById(id) {
      const found = collections.flatMap(group => group.episodes.map(ep => ({group, ep})))
        .find(item => item.ep.id === id);
      if (!found) return false;
      selectEpisode(found.ep, found.group); return true;
    }
  });
}

mountHistoriaThematicPreview().catch(error => {
  const reader = byId('episode-reading');
  if (reader) reader.replaceChildren(make('p', 'error',
    'The Historia thematic preview cannot initialize: ' + String(error.message || error)));
});