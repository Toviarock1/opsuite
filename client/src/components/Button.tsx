import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClass: Record<Variant, string> = {
  primary:
    "bg-blue-700 text-white hover:bg-blue-800 focus-visible:outline-blue-600 disabled:bg-gray-400",
  secondary:
    "border border-gray-300 text-gray-800 hover:bg-gray-50 focus-visible:outline-blue-600 disabled:opacity-50",
  danger:
    "bg-red-700 text-white hover:bg-red-800 focus-visible:outline-red-600 disabled:bg-gray-400",
};

const sizeClass: Record<Size, string> = {
  sm: "px-2 py-1 text-xs",
  md: "px-4 py-2 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = "secondary",
    size = "md",
    type = "button",
    className = "",
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`rounded-md font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...rest}
    />
  );
});
