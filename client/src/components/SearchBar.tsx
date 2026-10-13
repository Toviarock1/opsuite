import { Button } from "./Button";
import { Field, inputClassName } from "./Field";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
      <Field label="Search items" htmlFor="search">
        <div className="flex gap-2">
          <input
            id="search"
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Indomie"
            className={inputClassName}
          />
          {value && (
            <Button onClick={() => onChange("")} className="shrink-0">
              Clear
            </Button>
          )}
        </div>
      </Field>
    </div>
  );
}
