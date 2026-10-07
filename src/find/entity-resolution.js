function asciiFold(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function normalizeName(value) {
  return asciiFold(value)
    .replace(/\b(st\.?|saint|sainte|ste\.?)\b/g, "saint")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizeAddress(value) {
  return asciiFold(value)
    .replace(/\b(street|st\.|road|rd\.|avenue|ave\.|boulevard|blvd\.|route|rue)\b/g, match => match.replace(/\./g, ""))
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function haversineMeters(a, b) {
  const raw=[a?.lat,a?.lng,b?.lat,b?.lng];
  if(raw.some(value=>value===null||value===undefined||value===""))return Infinity;
  const [lat1,lng1,lat2,lng2]=raw.map(Number);
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return Infinity;
  const toRad = value => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const x = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function tokenSet(value) {
  return new Set(normalizeName(value).split(" ").filter(Boolean));
}

export function tokenSimilarity(a, b) {
  const left = tokenSet(a), right = tokenSet(b);
  if (!left.size || !right.size) return 0;
  let common = 0;
  for (const token of left) if (right.has(token)) common += 1;
  return (2 * common) / (left.size + right.size);
}

function kindSignature(record) {
  const primary = record?.venue_type ?? record?.kind ?? "other";
  const also = Array.isArray(record?.alsoKinds) ? record.alsoKinds : [];
  return [primary, ...also].map(String).sort().join("|");
}

function formattedAddress(record) {
  const address = record?.address ?? {};
  if (typeof address === "string") return address;
  return address.formatted
    ?? [address.line1, address.line2, address.postal_code, address.city, address.region, address.country_code]
      .filter(Boolean).join(" ");
}

export function compareVenueCandidates(a, b) {
  const distanceMeters = haversineMeters(a?.geo ?? a, b?.geo ?? b);
  const nameSimilarity = tokenSimilarity(a?.name?.official ?? a?.name, b?.name?.official ?? b?.name);
  const addressA = normalizeAddress(formattedAddress(a));
  const addressB = normalizeAddress(formattedAddress(b));
  const exactAddress = Boolean(addressA && addressB && addressA === addressB);
  const sameCountry = String(a?.address?.country_code ?? a?.countryCode ?? "") === String(b?.address?.country_code ?? b?.countryCode ?? "");
  const sameKind = kindSignature(a) === kindSignature(b);

  let classification = "DISTINCT";
  if (sameCountry && exactAddress && sameKind && distanceMeters <= 50 && nameSimilarity >= 0.9) {
    classification = "AUTO_MERGE_SAFE";
  } else if (
    sameCountry &&
    (
      (exactAddress && distanceMeters <= 150) ||
      (distanceMeters <= 100 && nameSimilarity >= 0.72)
    )
  ) {
    classification = "REVIEW";
  }

  return Object.freeze({
    classification,
    distanceMeters,
    nameSimilarity,
    exactAddress,
    sameCountry,
    sameKind,
  });
}

export function findDuplicateCandidates(venues) {
  const records = Array.isArray(venues) ? venues : [];
  const candidates = [];
  for (let i = 0; i < records.length; i += 1) {
    for (let j = i + 1; j < records.length; j += 1) {
      const comparison = compareVenueCandidates(records[i], records[j]);
      if (comparison.classification !== "DISTINCT") {
        candidates.push(Object.freeze({
          leftVenueId: records[i]?.venue_id ?? null,
          rightVenueId: records[j]?.venue_id ?? null,
          ...comparison,
        }));
      }
    }
  }
  return candidates;
}
