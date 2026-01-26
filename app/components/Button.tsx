import { ReactNode } from "react";
import Link from "next/link";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
};

export default function Button({ children, href, variant = "primary" }: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight shadow-sm transition-transform transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50";

  const variants: Record<string, string> = {
    primary:
      "bg-primary text-white hover:bg-primary-light active:bg-primary-dark hover:-translate-y-0.5",
    secondary:
      "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100 hover:-translate-y-0.5",
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
