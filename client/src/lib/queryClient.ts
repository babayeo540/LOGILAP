import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Overload pour GET requests avec seulement l'URL
export async function apiRequest(url: string): Promise<any>;
// Overload pour requests avec options
export async function apiRequest(
  url: string,
  options: {
    method: string;
    body?: string;
    data?: unknown;
  }
): Promise<any>;
// Overload pour la signature legacy
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response>;

// Implementation
export async function apiRequest(
  urlOrMethod: string,
  urlOrOptions?: string | {
    method: string;
    body?: string;
    data?: unknown;
  },
  data?: unknown | undefined,
): Promise<any> {
  let method: string;
  let url: string;
  let requestData: unknown;

  if (typeof urlOrOptions === 'string') {
    // Legacy signature: apiRequest(method, url, data)
    method = urlOrMethod;
    url = urlOrOptions;
    requestData = data;
  } else if (typeof urlOrOptions === 'object' && urlOrOptions !== null) {
    // New signature: apiRequest(url, options)
    method = urlOrOptions.method;
    url = urlOrMethod;
    requestData = urlOrOptions.data || (urlOrOptions.body ? JSON.parse(urlOrOptions.body) : undefined);
  } else {
    // GET request: apiRequest(url)
    method = 'GET';
    url = urlOrMethod;
    requestData = undefined;
  }

  const res = await fetch(url, {
    method,
    headers: requestData ? { "Content-Type": "application/json" } : {},
    body: requestData ? JSON.stringify(requestData) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
