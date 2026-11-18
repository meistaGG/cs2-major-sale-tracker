import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-lg border border-white/10 bg-[#1b1d24] px-3 py-2.5 text-base text-white placeholder:text-gray-500 focus:border-white/25 focus:outline-none focus:ring-1 focus:ring-[#3987e5] ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";
