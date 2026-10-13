import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import {
  createSale,
  deleteSale,
  updateSale,
  type SaleInput,
  type TodaySalesResponse,
} from "../lib/api";
import { todaySalesKey } from "./useTodaySales";

// Writes update the cache instantly so rows appear the moment a save
// succeeds, then an invalidation reconciles every page with the server.
// Each cached page holds its own copy of the day-wide total, so every
// entry adjusts its own copy by the row's amount.
function isFirstUnfilteredPage(key: QueryKey): boolean {
  return key[1] === 1 && (key.length < 3 || key[2] === "");
}

function withRecomputedPages(data: TodaySalesResponse): TodaySalesResponse {
  return {
    ...data,
    totalPages: Math.max(1, Math.ceil(data.totalCount / data.pageSize)),
  };
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaleInput) => createSale(input),
    onSuccess: (sale) => {
      queryClient.setQueriesData<TodaySalesResponse>(
        {
          queryKey: todaySalesKey,
          predicate: (query) => isFirstUnfilteredPage(query.queryKey),
        },
        (old) =>
          old
            ? withRecomputedPages({
                ...old,
                sales: [sale, ...old.sales].slice(0, old.pageSize),
                total: old.total + sale.amount,
                totalCount: old.totalCount + 1,
              })
            : old,
      );
      void queryClient.invalidateQueries({ queryKey: todaySalesKey });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SaleInput }) =>
      updateSale(id, input),
    onSuccess: (sale) => {
      queryClient.setQueriesData<TodaySalesResponse>(
        { queryKey: todaySalesKey },
        (old) => {
          if (!old) return old;
          const previous = old.sales.find((row) => row.id === sale.id);
          if (!previous) return old;
          return {
            ...old,
            sales: old.sales.map((row) => (row.id === sale.id ? sale : row)),
            total: old.total - previous.amount + sale.amount,
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: todaySalesKey });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSale(id),
    onSuccess: (_data, id) => {
      queryClient.setQueriesData<TodaySalesResponse>(
        { queryKey: todaySalesKey },
        (old) => {
          if (!old) return old;
          const previous = old.sales.find((row) => row.id === id);
          if (!previous) return old;
          return withRecomputedPages({
            ...old,
            sales: old.sales.filter((row) => row.id !== id),
            total: old.total - previous.amount,
            totalCount: old.totalCount - 1,
          });
        },
      );
      void queryClient.invalidateQueries({ queryKey: todaySalesKey });
    },
  });
}
