from pathlib import Path

PATH = Path('index.html')
SENTINEL = 'mass-source-loader-cleanup-20260929-v1'

s = PATH.read_text(encoding='utf-8')
if SENTINEL in s:
    print('Mass source loader cleanup already applied.')
    raise SystemExit(0)

old = '''    async loadLocalRoot(path, language, diagnostic) {
        const directory = source_config_1.LANGUAGE_DIR[language];
        const url = `${source_config_1.MISSAL_BASE}/${directory}/${path}.txt`;
        const text = await this.fetcher.tryGet(url, diagnostic);
        const upstream = await this.loadUpstreamParsed(path, language, diagnostic);'''
new = '''    async loadLocalRoot(path, language, diagnostic) {
        /* mass-source-loader-cleanup-20260929-v1
           The pinned Missale Meum missa tree has Latin/English/Polski but no
           Francais directory. Do not issue a guaranteed 404 for every French
           Proper; French resolves directly from the pinned Divinum Officium
           upstream, while the normalized Latin file may still supply structure. */
        const directory = source_config_1.LANGUAGE_DIR[language];
        const url = `${source_config_1.MISSAL_BASE}/${directory}/${path}.txt`;
        const text = language === 'fr' ? null : await this.fetcher.tryGet(url, diagnostic);
        const upstream = await this.loadUpstreamParsed(path, language, diagnostic);'''
if s.count(old) != 1:
    raise RuntimeError(f'loadLocalRoot language-source anchor: expected 1 match, found {s.count(old)}')
s = s.replace(old, new, 1)

# Calling vibration(0) before a user gesture creates Chromium intervention errors.
# Haptics are already disabled through AO_HAPTICS_V4319 and localStorage.
old_vibrate = "   try{navigator.vibrate?.(0)}catch{}\n"
if s.count(old_vibrate) != 1:
    raise RuntimeError(f'early vibration cancellation anchor: expected 1 match, found {s.count(old_vibrate)}')
s = s.replace(old_vibrate, '', 1)

for invariant in [
    SENTINEL,
    "const text = language === 'fr' ? null : await this.fetcher.tryGet(url, diagnostic);",
    "AO_HAPTICS_V4319?.setEnabled?.(false)",
]:
    if invariant not in s:
        raise RuntimeError(f'Mass source loader cleanup invariant missing: {invariant}')
if 'navigator.vibrate?.(0)' in s:
    raise RuntimeError('Early navigator.vibrate(0) call still present')

PATH.write_text(s, encoding='utf-8')
print('Applied Mass source loader cleanup patch.')
