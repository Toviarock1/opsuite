import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSale, deleteSale, updateSale, type SaleInput } from "../lib/api";
import { todaySalesKey } from "./useTodaySales";

// Each write refetches today's sales on success. The table stays
// visible during the refetch (no loading flash) because the cached
// data remains while the new data loads.
export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaleInput) => createSale(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: todaySalesKey });
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SaleInput }) =>
      updateSale(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: todaySalesKey });
    },
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSale(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: todaySalesKey });
    },
  });
}
