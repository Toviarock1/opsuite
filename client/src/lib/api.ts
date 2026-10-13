import axios, { AxiosError, type AxiosInstance } from "axios";

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

export type SaleInput = {
  itemName: string;
  amount: number;
  soldAt: string;
};

const client: AxiosInstance = axios.create({
  // Empty baseURL means same-origin relative calls (VITE_API_URL unset).
  baseURL:
    (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
    "",
  headers: { "Content-Type": "application/json" },
  // Render's free tier can take ~60s to wake up; don't cut it off early.
  timeout: 60_000,
});

function toApiError(error: unknown, fallback: string): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string }>;
    if (axiosError.response) {
      // Server answered with an error status. Prefer its message.
      const serverMessage = axiosError.response.data?.error;
      if (typeof serverMessage === "string" && serverMessage)
        return new Error(serverMessage);
      return new Error(`Request failed (${axiosError.response.status}).`);
    }
    // No response: wrong URL, backend asleep/unreachable, or timeout.
    return new Error(
      "Cannot reach the API. Check VITE_API_URL and that the backend is running.",
    );
  }
  return new Error(fallback);
}

function assertTodayShape(data: unknown): asserts data is TodaySalesResponse {
  const response = data as TodaySalesResponse;
  if (
    typeof response !== "object" ||
    response === null ||
    !Array.isArray(response.sales) ||
    typeof response.total !== "number" ||
    typeof response.page !== "number" ||
    typeof response.totalPages !== "number" ||
    typeof response.totalCount !== "number"
  ) {
    throw new Error(
      "API returned an unexpected shape. Expected { sales, total, page, totalPages, totalCount }.",
    );
  }
}

export async function fetchTodaySales(
  page = 1,
  pageSize = 10,
  search = "",
): Promise<TodaySalesResponse> {
  const params: Record<string, string> = {
    page: String(page),
    pageSize: String(pageSize),
  };
  if (search.trim()) params.search = search.trim();
  try {
    const { data } = await client.get("/api/sales/today", { params });
    if (typeof data === "string") {
      // HTML instead of JSON: wrong VITE_API_URL or backend waking up.
      throw new Error(
        "API did not return JSON. Check VITE_API_URL and that the backend is awake.",
      );
    }
    assertTodayShape(data);
    return data;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("API did not return JSON")
    )
      throw error;
    if (
      error instanceof Error &&
      error.message.startsWith("API returned an unexpected shape")
    ) {
      throw error;
    }
    throw toApiError(error, "Could not load sales.");
  }
}

export async function createSale(input: SaleInput): Promise<void> {
  try {
    await client.post("/api/sales", input);
  } catch (error) {
    throw toApiError(error, "Could not save sale.");
  }
}

export async function updateSale(id: number, input: SaleInput): Promise<void> {
  try {
    await client.put(`/api/sales/${id}`, input);
  } catch (error) {
    throw toApiError(error, "Could not update sale.");
  }
}

export async function deleteSale(id: number): Promise<void> {
  try {
    await client.delete(`/api/sales/${id}`);
  } catch (error) {
    throw toApiError(error, "Could not delete sale.");
  }
}
