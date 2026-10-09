# Approved-structure Mass directory: bulk publication and permission gate

## Current legal position (checked 9 October 2026)
The [Latin Mass Directory terms](https://www.latinmassdir.org/terms-and-conditions/) reserve copyright and prohibit republication, reproduction, copying and redistribution of directory material (License section). Permission to link is separate from permission to republish; section "Hyperlinking to our Content" permits directory websites to link under specified conditions. Do **not** publish the existing 1,531-row third-party research scrape as a mass dataset or describe that census as owned/parish-confirmed entries. Do not embed their website in a frame without prior written permission.

The [existing research census](../data/directory/research/approved-mass-worldwide-candidates-20261009.v1.json) is a research reconciliation artifact, **not** a licensed distribution source. Its presence in repository history does not confer permission for user-facing republication. An open-source/public repository should additionally review whether the raw research export should remain publicly accessible.

## Workable immediate user experience
The live Explore → TLM view contains a direct, attributed link to the original [Latin Mass Directory country index](https://www.latinmassdir.org/countries/), without embedding, mirroring, or representing external schedules as verified. This extends discoverability without inflating our own venue counts.

## If a licence/feed is granted
1. Obtain written permission to reuse data in the Ad Orientem application and, if relevant, redistribute it within a published GitHub repository, with mobile distribution and commercial possibilities separately covered. Check whether weekly synchronization is permitted and obtain permitted attribution wording.
2. Store a JSON feed at `data/directory/licensed/approved-mass.v1.json` **only after authorisation**; it is an optional file. The repository has no preapproved feed and the loader fails closed if absent.
3. Use schema `AO_LICENSED_DIRECTORY_FEED_V1` and a permission block whose evidence reference links to an auditable record of the actual grant. No grant may be invented. Record separate permissions for schedules, street addresses, and photos; the present bridge publishes **no** schedules or photos.
4. Reconcile canonical physical identity against existing FSSP, ICKSP, diocesan and other source records; held duplicate candidates never get a second venue ID.
5. Display imported external entries only as `DIRECTORY_LISTED_UNVERIFIED`. They remain list-only, with no fabricated Mass time, liturgical edition, communion status or coordinate. A source-listed venue is not counted as an independently verified Mass site.
6. Promote a listing to a fully researched source record only after independent original-source Mass-form/schedule confirmation and venue deduplication.

### Example record (illustrative fixture only; not real Mass data)

```json
{
  "schema": "AO_LICENSED_DIRECTORY_FEED_V1",
  "source_id": "LMD_AUTHORIZED",
  "generated_at": "2026-10-09T00:00:00Z",
  "permission": {
    "status": "GRANTED",
    "granted_to": "AD_ORIENTEM_APP",
    "grant_reference": "REFERENCE_TO_REAL_WRITTEN_CONSENT",
    "grant_evidence_url": "https://example.org/replace-with-real-written-permission",
    "attribution": "Use the exact approved provider attribution"
  },
  "records": [
    {
      "source_id": "example-stable-id",
      "name": "Example Chapel",
      "country_code": "FR",
      "city": "Example City",
      "address": "123 Example Road",
      "listing_url": "https://example.org/venue/example-stable-id"
    }
  ]
}
```

The JSON above is schema documentation, **not** evidence of an actual licence. The importer checks the permission metadata and retains the supplied link; the approval must still be reviewed as a real legal/administrative fact. Unlike the 1,531-row research scrape, a licensed feed may carry street addresses and other distributable factual data.

## Proposed permission request

**Subject:** Request for authorised data feed / reuse agreement — Latin Mass Directory × Ad Orientem

> Hello, I am developing Ad Orientem, a Traditional Latin Mass and devotional companion. We would like to link to your directory immediately and ask whether you would consider a licensed data feed for venue names, addresses, institute affiliations and Mass times, with stable IDs, updates and prominent attribution to Latin Mass Directory. Your posted terms restrict copying and republication, so we will not mirror your database without your written permission. Could you advise whether a nonexclusive reuse agreement is possible for a mobile/web app, including permission for local caching, GitHub distribution of licensed fields where appropriate, and future commercial distribution? We would preserve your source URLs, display verification dates and direct users back to your pages. Please let us know the preferred contact for such an agreement and any applicable fees or conditions.

Do not send or auto-approve this request without explicit operator action.
