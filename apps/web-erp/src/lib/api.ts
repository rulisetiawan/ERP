// Central API Integration Client for 10 Go Microservices via Nginx API Gateway

export const API_BASE_URLS = {
  auth: "/api/v1/auth",
  hr: "/api/v1/hr",
  inventory: "/api/v1/inventory",
  pos: "/api/v1/pos",
  purchasing: "/api/v1/purchasing",
  finance: "/api/v1/finance",
  chat: "/api/v1/chat",
  crm: "/api/v1/crm",
  ai: "/api/v1/ai",
  asset: "/api/v1/assets",
};

export async function fetchFromBackend<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!res.ok) {
      console.error(`[API Error] ${url} returned status ${res.status}`);
      return null;
    }

    const json = await res.json();
    return json.data as T;
  } catch (error) {
    console.error(`[API Network Error] ${url}:`, error);
    return null;
  }
}
