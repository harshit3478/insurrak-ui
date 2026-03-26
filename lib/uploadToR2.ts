const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

/**
 * Upload a file to Cloudflare R2 via the backend proxy.
 * Avoids browser CORS restrictions on the R2 private endpoint.
 * Returns the public URL of the uploaded file.
 */
export async function uploadToR2(file: File, folder = "policies"): Promise<string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch(`${API_BASE_URL}/files/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Upload failed: ${res.statusText}`);
  }

  const { public_url } = await res.json();
  return public_url;
}
