export type Sale = {
  id: number;
  itemName: string;
  amount: number;
  soldAt: string;
};

export type TodaySalesResponse = {
  sales: Sale[];
  total: number;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

const baseUrl =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "";

function requestUrl(path: string): string {
  if (!baseUrl) return path;
  return `${baseUrl}${path}`;
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // fall through to generic message
  }
  return `Request failed (${res.status}).`;
}

async function readJson(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      `API did not return JSON (status ${res.status}). Check VITE_API_URL and that the backend is awake.`,
    );
  }
  try {
    return await res.json();
  } catch {
    throw new Error(
      `API did not return JSON (status ${res.status}). Check VITE_API_URL and that the backend is awake.`,
    );
  }
}

export async function fetchTodaySales(
  page = 1,
  pageSize = 10,
  search = "",
): Promise<TodaySalesResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (search.trim()) params.set("search", search.trim());
  let res: Response;
  try {
    res = await fetch(requestUrl(`/api/sales/today?${params.toString()}`));
  } catch {
    throw new Error(
      "Cannot reach the API. Check VITE_API_URL and that the backend is running.",
    );
  }
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await readJson(res)) as TodaySalesResponse;
  if (
    !Array.isArray(data.sales) ||
    typeof data.total !== "number" ||
    typeof data.page !== "number" ||
    typeof data.totalPages !== "number" ||
    typeof data.totalCount !== "number"
  ) {
    throw new Error(
      "API returned an unexpected shape. Expected { sales, total, page, totalPages, totalCount }.",
    );
  }
  return data;
}

export type SaleInput = {
  itemName: string;
  amount: number;
  soldAt: string;
};

export async function createSale(input: SaleInput): Promise<void> {
  let res: Response;
  try {
    res = await fetch(requestUrl("/api/sales"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error(
      "Cannot reach the API. Check VITE_API_URL and that the backend is running.",
    );
  }
  if (!res.ok) throw new Error(await parseError(res));
}

export async function updateSale(id: number, input: SaleInput): Promise<void> {
  let res: Response;
  try {
    res = await fetch(requestUrl(`/api/sales/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error(
      "Cannot reach the API. Check VITE_API_URL and that the backend is running.",
    );
  }
  if (!res.ok) throw new Error(await parseError(res));
}

export async function deleteSale(id: number): Promise<void> {
  let res: Response;
  try {
    res = await fetch(requestUrl(`/api/sales/${id}`), { method: "DELETE" });
  } catch {
    throw new Error(
      "Cannot reach the API. Check VITE_API_URL and that the backend is running.",
    );
  }
  if (!res.ok) throw new Error(await parseError(res));
}
