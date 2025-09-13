import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-xl border border-stone-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400 ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";