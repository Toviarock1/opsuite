import type { Sale } from "../lib/api";
import { formatLagosTime } from "../utils/datetime";
import { formatNaira } from "../utils/formatNaira";
import { Button } from "./Button";

type Props = {
  sales: Sale[];
  deletingId: number | null;
  search?: string;
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
};

export function SalesTable({
  sales,
  deletingId,
  search,
  onEdit,
  onDelete,
}: Props) {
  if (sales.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
        {search ? (
          <>
            <p className="text-gray-700">
              No sales match &quot;{search}&quot;.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Try a different search or clear it.
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-700">No sales logged today yet.</p>
            <p className="mt-1 text-sm text-gray-500">
              Use the form above to log your first sale.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium text-gray-700">
              Item
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-gray-700">
              Time
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right font-medium text-gray-700"
            >
              Amount
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right font-medium text-gray-700"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr
              key={sale.id}
              className="border-b border-gray-100 last:border-0"
            >
              <td className="px-4 py-3 text-gray-900">{sale.itemName}</td>
              <td className="px-4 py-3 text-gray-600">
                {formatLagosTime(sale.soldAt)}
              </td>
              <td className="px-4 py-3 text-right font-medium text-gray-900">
                {formatNaira(sale.amount)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="inline-flex gap-2">
                  <Button size="sm" onClick={() => onEdit(sale)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={deletingId === sale.id}
                    onClick={() => onDelete(sale)}
                  >
                    {deletingId === sale.id ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
