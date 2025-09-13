import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" };

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition";
    const styles =
      variant === "outline"
        ? "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
        : "bg-stone-800 text-white hover:bg-stone-700";
    return <button ref={ref} className={`${base} ${styles} ${className}`} {...props} />;
  }
);
Button.displayName = "Button";