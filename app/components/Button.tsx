import { ReactNode } from "react";
import Link from "next/link";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
};

export default function Button({ children, href, variant = "primary" }: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  const variants: Record<string, string> = {
    primary:
      "bg-primary text-white hover:bg-primary-light active:bg-primary-dark",
    secondary:
      "bg-slate-800 text-slate-100 hover:bg-slate-700 active:bg-slate-600",
  };

  const className = `${baseClasses} ${variants[variant]}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return <button className={className}>{children}</button>;
}
