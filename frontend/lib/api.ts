const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  llm_configured: boolean;
  embedding_provider: string;
}

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  is_verified: boolean;
}

function readDetail(detail: unknown): string | undefined {
  if (typeof detail === "string" && detail) return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const field = Array.isArray(item.loc)
            ? item.loc.filter((part: unknown) => part !== "body").join(".")
            : "";
          const msg = typeof item.msg === "string" ? item.msg : "";
          if (!msg) return "";
          return field ? `${field}: ${msg}` : msg;
        }
        return "";
      })
      .filter(Boolean);
    if (messages.length) return messages.join("\n");
  }

  return undefined;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let detail = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      const parsed = readDetail(body?.detail);
      if (parsed) detail = parsed;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/health");
}

export function signup(
  name: string,
  email: string,
  password: string,
): Promise<{ message: string }> {
  return request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function login(email: string, password: string): Promise<UserPublic> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<{ message: string }> {
  return request("/api/auth/logout", { method: "POST" });
}

export function getMe(): Promise<UserPublic> {
  return request("/api/auth/me");
}

export function verifyEmail(token: string): Promise<{ message: string }> {
  return request("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return request("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  return request("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

export interface DocumentItem {
  id: number;
  filename: string;
  status: string;
  chunk_count: number;
  created_at: string | null;
}

export interface UploadResult {
  document_id: number;
  doc_id: string;
  filename: string;
  status: string;
  chunks: number;
  entities: number;
  relationships: number;
  extracted_chunks: number;
  quota_hit: boolean;
}

export async function uploadDocument(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE_URL}/api/documents`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!res.ok) {
    let detail = `Upload failed: ${res.status}`;
    try {
      const body = await res.json();
      const parsed = readDetail(body?.detail);
      if (parsed) detail = parsed;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json() as Promise<UploadResult>;
}

export function listDocuments(): Promise<{ documents: DocumentItem[] }> {
  return request("/api/documents");
}

export interface Citation {
  index: number;
  doc_id: string | null;
  chunk_id: string | null;
  filename: string | null;
  snippet: string;
  score: number | null;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  mode: string;
}

export function askQuestion(
  question: string,
  topK = 5,
  mode = "baseline",
): Promise<ChatResponse> {
  return request("/api/chat", {
    method: "POST",
    body: JSON.stringify({ question, top_k: topK, mode }),
  });
}
