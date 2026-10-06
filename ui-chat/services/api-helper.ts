// Helper pour récupérer le token depuis le sessionStorage
export function getAuthToken(): string | null {
  const sessionData = sessionStorage.getItem('chat_session');
  if (!sessionData) return null;
  try {
    const parsed = JSON.parse(sessionData);
    return parsed.token || null;
  } catch {
    return null;
  }
}

// Helper pour créer les headers avec authentification
export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
