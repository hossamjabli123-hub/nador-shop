const BASE_URL = import.meta.env.BASE_URL || "/";

export function getApiBase(): string {
  const base = BASE_URL.replace(/\/$/, "");
  return `${base}/api`;
}

export function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem("adminToken");
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export function formatPrice(price: number, currency = "د.م."): string {
  return `${price.toFixed(2)} ${currency}`;
}

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = BASE_URL.replace(/\/$/, "");
  return `${base}/api/storage${path}`;
}
