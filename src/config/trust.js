/**
 * Ngưỡng blacklist phía server: env TRUST_BLACKLIST_THRESHOLD (mặc định 50).
 * Admin build dùng VITE_TRUST_BLACKLIST_THRESHOLD để filter/cảnh báo khớp UI với server.
 * Nếu không khai báo biến này, UI dùng 50 — trùng mặc định server.
 */
export function getTrustBlacklistThreshold() {
  const raw = import.meta.env.VITE_TRUST_BLACKLIST_THRESHOLD;
  if (raw === undefined || raw === "") return 50;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 50;
}

export const TRUST_SERVER_DEFAULT_THRESHOLD = 50;
