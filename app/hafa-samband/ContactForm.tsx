"use client";

import { FormEvent, useState } from "react";

const inquiryOptions = [
  { value: "ibudir", label: "Íbúðir" },
  { value: "verktaekni", label: "Verktakaþjónusta" },
  { value: "annad", label: "Annað" },
];

export function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      nextErrors.name = "Nafn er nauðsynlegt.";
    }
    if (!form.email.trim()) {
      nextErrors.email = "Netfang er nauðsynlegt.";
    } else if (!form.email.includes("@")) {
      nextErrors.email = "Vinsamlegast sláðu inn gilt netfang.";
    }
    if (!form.message.trim()) {
      nextErrors.message = "Skilaboð eru nauðsynleg.";
    }

    return nextErrors;
  }

  function inputBaseClass(hasError: boolean) {
    return [
      "h-10 w-full rounded-md border bg-white px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40",
      hasError ? "border-red-300" : "border-slate-200",
    ].join(" ");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(false);

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Placeholder: here you could POST to an API route.
    setSubmitted(true);
    // Optionally clear the message but keep contact details.
    setForm((prev) => ({ ...prev, subject: "", message: "" }));
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm">
      <header className="mb-4 space-y-1">
        <h2 className="text-base font-semibold text-slate-900">
          Sendu okkur skilaboð
        </h2>
        <p className="text-xs text-slate-600">
          Segðu stuttlega frá verkefni eða fyrirspurn. Við svörum eins fljótt og auðið er.
        </p>
      </header>

      {submitted && (
        <p className="mb-4 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          Skilaboð send. Við höfum samband fljótlega.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Tegund fyrirspurnar
          </p>
          <div className="flex flex-wrap gap-2">
            {inquiryOptions.map((opt) => {
              const selected = form.inquiryType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, inquiryType: selected ? "" : opt.value }))
                  }
                  className={[
                    "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                    selected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="name"
            className="block text-xs font-medium text-slate-800"
          >
            Nafn*
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputBaseClass(Boolean(errors.name))}
          />
          {errors.name && (
            <p className="text-[11px] text-red-600">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-xs font-medium text-slate-800"
          >
            Netfang*
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={inputBaseClass(Boolean(errors.email))}
          />
          {errors.email && (
            <p className="text-[11px] text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="subject"
            className="block text-xs font-medium text-slate-800"
          >
            Efni
          </label>
          <input
            id="subject"
            name="subject"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className={inputBaseClass(false)}
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="message"
            className="block text-xs font-medium text-slate-800"
          >
            Skilaboð*
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className={[
              "w-full rounded-md border bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40",
              errors.message ? "border-red-300" : "border-slate-200",
            ].join(" ")}
          />
          {errors.message && (
            <p className="text-[11px] text-red-600">{errors.message}</p>
          )}
        </div>

        <div className="pt-1">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 shadow-sm transition-colors duration-200 ease-out hover:border-slate-400 hover:bg-slate-100"
          >
            Senda skilaboð
          </button>
        </div>
      </form>
    </section>
  );
}
