if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  console.warn("⚠️ SECURITY WARNING: SESSION_SECRET is not configured in production environment!");
}
const SESSION_SECRET = process.env.SESSION_SECRET || "plumeria_spa_royal_secret_key_2026_dev_only";
export const SESSION_COOKIE_NAME = "plumeria_session";

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: "SUPER_ADMIN" | "BRANCH_MANAGER" | "RECEPTIONIST" | "THERAPIST" | "CUSTOMER";
  branchId?: string | null;
  branchCode?: string | null;
  branchName?: string | null;
  membershipTier?: string;
  exp: number; // timestamp
}

// Convert string to BufferSource
function strToBufferSource(str: string): BufferSource {
  const encoded = new TextEncoder().encode(str);
  return encoded as unknown as BufferSource;
}

// Convert buffer to base64url
function bufferToBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer as ArrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Convert base64url to string
function base64UrlToStr(base64url: string): string {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

// Sign payload using Web Crypto API
export async function signSession(
  payload: Omit<SessionPayload, "exp">,
  expiresInHours = 24
): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const fullPayload: SessionPayload = { ...payload, exp };
  const data = bufferToBase64Url(new TextEncoder().encode(JSON.stringify(fullPayload)));

  const key = await crypto.subtle.importKey(
    "raw",
    strToBufferSource(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, strToBufferSource(data));
  const sigStr = bufferToBase64Url(signature);

  return `${data}.${sigStr}`;
}

// Verify payload using Web Crypto API
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const [data, sigStr] = token.split(".");
    if (!data || !sigStr) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      strToBufferSource(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Decode signature
    const sigBinary = atob(sigStr.replace(/-/g, "+").replace(/_/g, "/"));
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as unknown as BufferSource,
      strToBufferSource(data)
    );

    if (!isValid) return null;

    const payload: SessionPayload = JSON.parse(base64UrlToStr(data));
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}
