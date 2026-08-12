/**
 * API utility to resolve endpoints whether running locally or with a dedicated Render backend
 */
export function getApiUrl(path: string): string {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backendUrl && backendUrl.startsWith("http")) {
    const cleanBase = backendUrl.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }
  return path;
}
