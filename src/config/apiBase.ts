/** Shared API base URL for fetch calls (must match Vercel env VITE_API_URL in production). */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL?.trim();
  const productionDefault = "https://lms-production-7308.up.railway.app/api";

  if (!raw) {
    return import.meta.env.DEV ? "/api" : productionDefault;
  }

  const base = raw.replace(/\/$/, "");
  if (base.endsWith("/api")) return base;

  try {
    const parsed = new URL(base.includes("://") ? base : `http://${base}`);
    const path = parsed.pathname.replace(/\/$/, "") || "";
    if (path && path !== "/") return base;
  } catch {
    /* fall through */
  }

  return `${base}/api`;
}
