#!/usr/bin/env python3
"""Fetch immutable, exact-object Coello study originals; never authorize app release.

Run from repo root on a research branch. Network/metadata failures fail closed.
Source: Toledo Museum of Art accession 1981.44, Commons PD-Art reproduction.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

from PIL import Image, ImageOps

COMMONS_NAME = 'San José con el Niño - Claudio Coello.jpg'
COMMONS_SHA1 = 'dcbbf752ed5c4089efa877f67c83b48033cdf180'
COMMONS_SIZE = 6058605
COMMONS_DIMS = (2215, 3926)
TOLEDO_MANIFEST = 'https://emuseum.toledomuseum.org/apis/iiif/presentation/v2/1-objects-55088/manifest'
EXPECTED_MUSEUM = {
    '19775': (1164, 1999),
    '48017': (1124, 2000),
}
MAX_BYTES = 12_000_000
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets/staged/module-hero-coello-20261027'
USER_AGENT = 'AdOrientemResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem; no paid services)'


def download(url, allowed_hosts, maximum=MAX_BYTES):
    """Download with no broad redirects; verify final host and bounded response."""
    if urlparse(url).scheme != 'https' or urlparse(url).hostname not in allowed_hosts:
        raise ValueError('Unexpected source address')
    req = Request(url, headers={'User-Agent': USER_AGENT})
    with urlopen(req, timeout=45) as stream:
        final = urlparse(stream.geturl())
        if final.scheme != 'https' or final.hostname not in allowed_hosts:
            raise ValueError('Download redirected outside approved source hosts')
        raw = stream.read(maximum + 1)
    if not raw or len(raw) > maximum:
        raise ValueError('Empty or over-cap download')
    return raw


def validated_image(raw, dimensions):
    """Check actual decoded pixels; preserve original bytes without conversion."""
    with Image.open(io.BytesIO(raw)) as im:
        im.verify()
    with Image.open(io.BytesIO(raw)) as im:
        if im.format not in ('JPEG', 'MPO') or im.size != dimensions:
            raise ValueError(f'Image format or dimensions mismatch: {im.format} {im.size}, expected {dimensions}')
        im.load()
        return {'dimensions': list(im.size), 'format': im.format, 'icc_embedded': bool(im.info.get('icc_profile'))}


def preserved_write(destination, raw):
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        if destination.read_bytes() != raw:
            raise ValueError(f'Existing immutable source differs: {destination}')
        return
    tmp = destination.with_suffix(destination.suffix + '.new')
    try:
        tmp.write_bytes(raw)
        tmp.replace(destination)
    finally:
        tmp.unlink(missing_ok=True)


def acquire_commons():
    qs = urlencode({'action': 'query', 'format': 'json', 'prop': 'imageinfo',
                    'iiprop': 'url|size|sha1|mime|extmetadata', 'titles': 'File:' + COMMONS_NAME})
    data = json.loads(download('https://commons.wikimedia.org/w/api.php?' + qs, {'commons.wikimedia.org'}, 250_000))
    page = next(iter(data['query']['pages'].values()))
    info = page['imageinfo'][0]
    if (info['sha1'].lower() != COMMONS_SHA1 or info['size'] != COMMONS_SIZE
            or info['width'] != COMMONS_DIMS[0] or info['height'] != COMMONS_DIMS[1]
            or info['mime'] != 'image/jpeg'):
        raise ValueError('Commons source mutated: hash, size, dimensions, or MIME changed')
    raw = download(info['url'], {'upload.wikimedia.org'})
    if len(raw) != COMMONS_SIZE or hashlib.sha1(raw).hexdigest() != COMMONS_SHA1:
        raise ValueError('Commons original-byte SHA1 or length mismatch')
    img = validated_image(raw, COMMONS_DIMS)
    f = OUT / 'coello-commons-bookscan-original.jpg'
    preserved_write(f, raw)
    return {'role': 'higher-pixel printed-book source; not museum original',
            'path': str(f.relative_to(ROOT)), 'source_page': 'https://commons.wikimedia.org/wiki/File:San_Jos%C3%A9_con_el_Ni%C3%B1o_-_Claudio_Coello.jpg',
            'source_sha1': COMMONS_SHA1, 'sha256': hashlib.sha256(raw).hexdigest(),
            'bytes': len(raw), **img,
            'rights': 'Commons PD-Art public-domain claim; publication jurisdiction review pending',
            'visual_quality': 'PENDING_BOOK_PRINT_HALFTONE_COLOR_AND_SHARPNESS'}


def acquire_toledo():
    """Try exact IIIF resource, then exact museum dispatcher; never allow a smaller proxy.

    Missing one museum image does not discard another acquired *verified* reference.
    Failed endpoints are reported explicitly; no extrapolation or pixel upscaling.
    """
    manifest = json.loads(download(TOLEDO_MANIFEST, {'emuseum.toledomuseum.org'}, 500_000))
    if manifest.get('label') != 'St. Joseph and the Christ Child':
        raise ValueError('Museum IIIF manifest label mismatch')
    canvases = manifest['sequences'][0]['canvases']
    rows, failures = [], []
    seen = set()
    for canvas in canvases:
        resource = canvas['images'][0]['resource']
        image_url = resource['@id']
        identifier = image_url.split('/image/v2/')[1].split('/')[0]
        if identifier not in EXPECTED_MUSEUM:
            continue
        seen.add(identifier)
        dims = EXPECTED_MUSEUM[identifier]
        if (canvas['width'], canvas['height']) != dims:
            raise ValueError(f'Museum IIIF metadata changed for {identifier}')
        fallback = 'https://emuseum.toledomuseum.org/internal/media/dispatcher/' + identifier + '/full?download='
        attempts = [image_url, fallback]
        chosen = None
        for candidate in attempts:
            try:
                raw = download(candidate, {'emuseum.toledomuseum.org'})
                img = validated_image(raw, dims)
                chosen = (raw, img, candidate)
                break
            except Exception as exc:
                failures.append({'museum_image_id': identifier,
                                 'endpoint': candidate,
                                 'error': type(exc).__name__ + ': ' + str(exc)[:200]})
        if chosen is None:
            continue
        raw, img, chosen_url = chosen
        f = OUT / f'coello-toledo-iiif-{identifier}-original.jpg'
        preserved_write(f, raw)
        rows.append({'role': 'museum exact-object colour reference, not rights cleared',
                     'path': str(f.relative_to(ROOT)), 'source_page': TOLEDO_MANIFEST,
                     'actual_source_url': chosen_url,
                     'iiif_id': identifier, 'sha256': hashlib.sha256(raw).hexdigest(),
                     'bytes': len(raw), **img, 'rights': 'RESEARCH ONLY; museum photo terms pending',
                     'visual_quality': 'PENDING_COLOR_COMPARE_AND_NATIVE_FIDELITY'})
    if seen != set(EXPECTED_MUSEUM):
        raise ValueError('Museum manifest no longer identifies the exact two versions')
    if not rows:
        raise ValueError('Both museum image endpoints inaccessible or returned wrong pixels: ' +
                         json.dumps(failures)[:900])
    return rows, failures


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', choices=('commons', 'toledo', 'all'), default='all')
    args = parser.parse_args()
    rows = []
    museum_endpoint_failures = []
    if args.source in ('commons', 'all'):
        rows.append(acquire_commons())
    if args.source in ('toledo', 'all'):
        museum_rows, museum_endpoint_failures = acquire_toledo()
        rows.extend(museum_rows)
    # Preserve existing verified source records when a second source is acquired.
    # Do not allow a later --source commons run to erase museum references.
    OUT.mkdir(parents=True, exist_ok=True)
    manifest_path = OUT / 'acquisition-manifest.json'
    old_rows = []
    if manifest_path.exists():
        old = json.loads(manifest_path.read_text())
        if old.get('accession') != 'Toledo Museum of Art 1981.44':
            raise ValueError('Pre-existing Coello manifest object mismatch')
        old_rows = old.get('original_files', [])
        for prior in old_rows:
            file = ROOT / prior['path']
            if not file.is_file():
                raise ValueError(f'Previously archived source file absent: {file}')
            if hashlib.sha256(file.read_bytes()).hexdigest() != prior['sha256']:
                raise ValueError(f'Previously archived source file mutated: {file}')
    merged = {row['path']: row for row in old_rows}
    for row in rows:
        previous = merged.get(row['path'])
        if previous and previous['sha256'] != row['sha256']:
            raise ValueError('Source version changed without review: ' + row['path'])
        merged[row['path']] = row
    # Fail-closed research report. Absolutely no release approval or derivatives.
    report = {'module_id': 'joseph', 'object': 'Claudio Coello — St Joseph and Christ Child',
              'accession': 'Toledo Museum of Art 1981.44',
              'original_files': sorted(merged.values(), key=lambda row: row['path']),
              'museum_source_endpoint_failures': museum_endpoint_failures,
              'editorial_approved': True, 'pristine_quality_approved': False,
              'publication_rights_approved': False, 'app_release_approved': False,
              'cost': 'EUR 0; research-source acquisition only',
              'notes': ['Do not remove historic blank upper corners; originally arched canvas.',
                        'Books may introduce halftone and colour shift despite larger pixel count.',
                        'Never substitute an AI reconstruction, enhanced photo, or a different painting.']}
    manifest_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
