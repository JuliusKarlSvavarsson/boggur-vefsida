"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = searchParams.get("from") || "/admin";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error || "Innskráning mistókst.");
        return;
      }

      router.push(from);
      router.refresh();
    } catch (err) {
      setError("Innskráning mistókst. Reyndu aftur síðar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg shadow-slate-200">
        <h1 className="mb-1 text-base font-semibold text-slate-900">Admin innskráning</h1>
        <p className="mb-4 text-xs text-slate-600">
          Sláðu inn aðgangsorð til að opna stjórnborðið.
        </p>

        {error && (
          <p className="mb-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700" htmlFor="password">
              Aðgangsorð
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Aðgangsorð admin"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors duration-200 ease-out hover:bg-slate-800 disabled:opacity-60"
          >
            {isSubmitting ? "Skrái inn..." : "Skrá inn"}
          </button>
        </form>
      </div>
    </div>
  );
}
