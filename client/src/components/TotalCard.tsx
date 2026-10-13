import { formatNaira } from "../utils/formatNaira";

export function TotalCard({ total }: { total: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
      <p className="text-sm font-medium text-gray-600">Today&apos;s total</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">
        {formatNaira(total)}
      </p>
    </div>
  );
}
