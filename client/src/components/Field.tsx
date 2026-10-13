import type { ReactNode } from "react";

export const inputClassName =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

type Props = {
  label: string;
  htmlFor: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, children }: Props) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
