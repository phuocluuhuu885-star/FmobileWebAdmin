/**
 * Chuẩn hoá payload user từ các dạng response API (data / result / trực tiếp).
 */
export function pickUserFromApiResponse(resData) {
  if (!resData || typeof resData !== "object") return null;
  return resData.data ?? resData.result ?? resData;
}

export function normalizeTrustScore(value, fallback = 100) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(value);
  if (Number.isFinite(n)) return n;
  return fallback;
}

export function normalizeIsBlacklisted(value) {
  return !!value;
}

/** true nếu cần gọi detail-profile để lấy đủ trust fields */
export function needsTrustEnrichment(record) {
  if (!record || typeof record !== "object") return false;
  const hasScore = typeof record.trust_score === "number" && Number.isFinite(record.trust_score);
  const hasBl = typeof record.is_blacklisted === "boolean";
  return !hasScore || !hasBl;
}

export function mergeTrustFromDetail(baseRecord, detailPayload) {
  const u = pickUserFromApiResponse(detailPayload);
  if (!u) return { ...baseRecord };
  return {
    ...baseRecord,
    trust_score: normalizeTrustScore(u.trust_score, baseRecord.trust_score),
    is_blacklisted: normalizeIsBlacklisted(
      u.is_blacklisted ?? baseRecord.is_blacklisted
    ),
  };
}
