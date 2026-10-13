import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchTodaySales } from "../lib/api";

export const todaySalesKey = ["todaySales"] as const;
export const PAGE_SIZE = 10;

// One page of today's sales, optionally filtered by item name.
// keepPreviousData keeps the old page visible while the new one
// loads, so typing, paging, and saving never flash loading.
export function useTodaySales(page: number, search = "") {
  const query = useQuery({
    queryKey: [...todaySalesKey, page, search],
    queryFn: () => fetchTodaySales(page, PAGE_SIZE, search),
    staleTime: 10_000,
    placeholderData: keepPreviousData,
  });

  return {
    sales: query.data?.sales ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? page,
    totalPages: query.data?.totalPages ?? 1,
    totalCount: query.data?.totalCount ?? 0,
    loading: query.isLoading,
    refreshing: query.isFetching && !query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.isError
          ? "Could not load sales."
          : null,
    reload: query.refetch,
  };
}
