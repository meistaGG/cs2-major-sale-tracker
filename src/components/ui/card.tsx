import * as React from "react";

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`bg-[#24272f] rounded-2xl shadow-soft border border-white/5 ${className}`}
      {...props}
    />
  );
}

export function CardContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 sm:p-6 ${className}`} {...props} />;
}
