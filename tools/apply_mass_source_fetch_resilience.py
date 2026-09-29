from pathlib import Path
import re

PATH = Path('index.html')
SENTINEL = 'mass-source-fetch-resilience-20260929-v1'

s = PATH.read_text(encoding='utf-8')
if SENTINEL in s:
    print('Mass source fetch resilience patch already applied.')
    raise SystemExit(0)

# 1) Harden the runtime transport used by all Mass/calendar/scripture source requests.
#    Keep the same pinned repository/revision URL as authority; jsDelivr is only a
#    transport mirror for the identical owner/repo/commit/path when raw GitHub is
#    unavailable from a local preview/browser environment.
boot_old = 'const fetcher = new text_fetcher_1.MemoryTextFetcher((url, init) => fetch(url, init));'
boot_new = '''/* mass-source-fetch-resilience-20260929-v1 */
    const sourceFetch = async (url, init) => {
        const primary = String(url || '');
        const rawGithub = /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/i.exec(primary);
        try {
            const response = await fetch(primary, init);
            if (response.ok || response.status === 404 || !rawGithub)
                return response;
        }
        catch (error) {
            if (!rawGithub)
                throw error;
        }
        const mirror = `https://cdn.jsdelivr.net/gh/${rawGithub[1]}/${rawGithub[2]}@${rawGithub[3]}/${rawGithub[4]}`;
        return fetch(mirror, init);
    };
    const fetcher = new text_fetcher_1.MemoryTextFetcher(sourceFetch);'''
if s.count(boot_old) != 1:
    raise RuntimeError(f'Mass boot fetcher anchor: expected 1 match, found {s.count(boot_old)}')
s = s.replace(boot_old, boot_new, 1)

# 2) tryGet really should be a fallback-aware probe. A single transport failure
#    must not abort the whole Proper before the resolver can try its next pinned
#    source (Missale Meum -> Divinum Officium missa -> Divinum Officium horas).
try_old = '''    async tryGet(url, diagnostic) {
        try {
            return await this.get(url, diagnostic);
        }
        catch (error) {
            if (error.status === 404)
                return null;
            throw error;
        }
    }'''
try_new = '''    async tryGet(url, diagnostic) {
        try {
            return await this.get(url, diagnostic);
        }
        catch (error) {
            if (error?.status !== 404) {
                const message = error instanceof Error ? error.message : String(error);
                diagnostic?.warnings?.push(`Source transport failed; trying fallback · ${url} · ${message}`);
            }
            return null;
        }
    }'''
if s.count(try_old) != 1:
    raise RuntimeError(f'MemoryTextFetcher tryGet anchor: expected 1 match, found {s.count(try_old)}')
s = s.replace(try_old, try_new, 1)

for invariant in [
    SENTINEL,
    'cdn.jsdelivr.net/gh/',
    'const fetcher = new text_fetcher_1.MemoryTextFetcher(sourceFetch);',
    'Source transport failed; trying fallback',
]:
    if invariant not in s:
        raise RuntimeError(f'Mass source resilience invariant missing: {invariant}')

PATH.write_text(s, encoding='utf-8')
print('Applied Mass source fetch resilience patch.')
