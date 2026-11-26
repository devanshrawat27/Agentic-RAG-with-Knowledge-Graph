const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  llm_configured: boolean;
  llm_key_count?: number;
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
  if (res.status === 204) {
    return undefined as T;
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

export function updateProfile(name: string): Promise<UserPublic> {
  return request("/api/auth/me", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  return request("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
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
  entity_count: number;
  relationship_count: number;
  created_at: string | null;
}

export interface UploadResult {
  document_id: number;
  doc_id: string;
  filename: string;
  status: string;
  chunks: number;
  extraction: string;
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

export interface CollectionItem {
  id: number;
  name: string;
  description: string;
  document_count: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionDocument {
  id: number;
  filename: string;
  status: string;
  chunk_count: number;
  entity_count: number;
  relationship_count: number;
  created_at: string | null;
}

export interface CollectionDetail extends CollectionItem {
  documents: CollectionDocument[];
}

export function listCollections(): Promise<CollectionItem[]> {
  return request("/api/collections");
}

export function createCollection(
  name: string,
  description = "",
): Promise<CollectionItem> {
  return request("/api/collections", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export function updateCollection(
  collectionId: number,
  data: { name?: string; description?: string },
): Promise<CollectionItem> {
  return request(`/api/collections/${collectionId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteCollection(collectionId: number): Promise<void> {
  return request(`/api/collections/${collectionId}`, { method: "DELETE" });
}

export function getCollection(collectionId: number): Promise<CollectionDetail> {
  return request(`/api/collections/${collectionId}`);
}

export function addCollectionDocument(
  collectionId: number,
  documentId: number,
): Promise<CollectionDetail> {
  return request(`/api/collections/${collectionId}/documents`, {
    method: "POST",
    body: JSON.stringify({ document_id: documentId }),
  });
}

export function removeCollectionDocument(
  collectionId: number,
  documentId: number,
): Promise<CollectionDetail> {
  return request(`/api/collections/${collectionId}/documents/${documentId}`, {
    method: "DELETE",
  });
}

export interface GraphNode {
  id: string;
  label: string;
  labels: string[];
  name: string;
  number: string;
  summary: string;
  date: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  doc_id: string;
  chunk_id: string;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  counts: { nodes: number; edges: number };
}

export function getGraph(params?: {
  limit?: number;
  includeMentions?: boolean;
}): Promise<GraphResponse> {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.includeMentions) query.set("include_mentions", "true");
  const qs = query.toString();
  return request(`/api/graph${qs ? `?${qs}` : ""}`);
}

export interface Citation {
  index: number;
  doc_id: string | null;
  chunk_id: string | null;
  filename: string | null;
  snippet: string;
  score: number | null;
}

export interface Claim {
  text: string;
  supported: boolean;
  evidence_refs: number[];
  reason: string;
}

export interface SourceChunk {
  chunk_id: string;
  chunk_index: number;
  doc_id: string | null;
  filename: string | null;
  text: string;
  is_focus: boolean;
}

export interface SourceChunkContext {
  focus: string;
  chunks: SourceChunk[];
}

export function getChunkContext(
  chunkId: string,
): Promise<SourceChunkContext> {
  return request(`/api/chunks/${encodeURIComponent(chunkId)}`);
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  mode: string;
  chat_id: number;
  claims?: Claim[];
  sub_questions?: string[];
  loop_count?: number;
  collection_id?: number | null;
}

export function askQuestion(
  question: string,
  topK = 8,
  mode = "baseline",
  chatId?: number | null,
  collectionId?: number | null,
): Promise<ChatResponse> {
  return request("/api/chat", {
    method: "POST",
    body: JSON.stringify({
      question,
      top_k: topK,
      mode,
      chat_id: chatId ?? null,
      collection_id: collectionId ?? null,
    }),
  });
}

export interface ChatSummary {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface MessageItem {
  id: number;
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
  created_at: string;
}

export interface ChatDetail {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages: MessageItem[];
}

export function listChats(): Promise<ChatSummary[]> {
  return request("/api/chats");
}

export function getChat(chatId: number): Promise<ChatDetail> {
  return request(`/api/chats/${chatId}`);
}

export function deleteChat(chatId: number): Promise<void> {
  return request(`/api/chats/${chatId}`, { method: "DELETE" });
}
