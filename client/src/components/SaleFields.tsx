import { Field, inputClassName } from "./Field";

type Props = {
  idPrefix: string;
  itemName: string;
  amount: string;
  soldAt: string;
  itemPlaceholder?: string;
  amountPlaceholder?: string;
  onItemName: (value: string) => void;
  onAmount: (value: string) => void;
  onSoldAt: (value: string) => void;
};

// The three sale inputs, shared by the create and edit forms
// so their markup and validation can never drift apart.
export function SaleFields({
  idPrefix,
  itemName,
  amount,
  soldAt,
  itemPlaceholder,
  amountPlaceholder,
  onItemName,
  onAmount,
  onSoldAt,
}: Props) {
  return (
    <>
      <Field label="Item name" htmlFor={`${idPrefix}itemName`}>
        <input
          id={`${idPrefix}itemName`}
          type="text"
          maxLength={100}
          value={itemName}
          onChange={(e) => onItemName(e.target.value)}
          placeholder={itemPlaceholder}
          className={inputClassName}
        />
      </Field>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Field label="Amount (₦, whole naira)" htmlFor={`${idPrefix}amount`}>
            <input
              id={`${idPrefix}amount`}
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={amount}
              onChange={(e) => onAmount(e.target.value)}
              placeholder={amountPlaceholder}
              className={inputClassName}
            />
          </Field>
        </div>

        <div className="flex-1">
          <Field label="Time of sale" htmlFor={`${idPrefix}soldAt`}>
            <input
              id={`${idPrefix}soldAt`}
              type="datetime-local"
              value={soldAt}
              onChange={(e) => onSoldAt(e.target.value)}
              className={inputClassName}
            />
          </Field>
        </div>
      </div>
    </>
  );
}
