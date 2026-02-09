"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import RightDrawer from "./RightDrawer";

// Types for API payloads

type SocialSettings = {
  apartment_weight: number;
  building_weight: number;
  project_weight: number;
  service_weight: number;
};

type SocialPhrase = {
  id: string;
  kind: "hook" | "cta" | string;
  text: string;
  active: boolean;
  created_at: string;
};

const DEFAULT_SETTINGS: SocialSettings = {
  apartment_weight: 50,
  building_weight: 25,
  project_weight: 13,
  service_weight: 12,
};

export default function SocialMediaAdminSection() {
  // Settings state
  const [settings, setSettings] = useState<SocialSettings>(DEFAULT_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Phrases state
  const [phrases, setPhrases] = useState<SocialPhrase[]>([]);
  const [loadingPhrases, setLoadingPhrases] = useState(false);
  const [phrasesError, setPhrasesError] = useState<string | null>(null);

  const [newHookText, setNewHookText] = useState("");
  const [newCtaText, setNewCtaText] = useState("");

  const hooks = useMemo(
    () => phrases.filter((p) => p.kind === "hook"),
    [phrases],
  );
  const ctas = useMemo(
    () => phrases.filter((p) => p.kind === "cta"),
    [phrases],
  );

  async function loadSettings() {
    setLoadingSettings(true);
    setSettingsError(null);
    try {
      const res = await fetch("/api/admin/social/settings", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load social settings");
      const data = (await res.json()) as Partial<SocialSettings>;
      setSettings({
        apartment_weight: Number(data.apartment_weight ?? DEFAULT_SETTINGS.apartment_weight),
        building_weight: Number(data.building_weight ?? DEFAULT_SETTINGS.building_weight),
        project_weight: Number(data.project_weight ?? DEFAULT_SETTINGS.project_weight),
        service_weight: Number(data.service_weight ?? DEFAULT_SETTINGS.service_weight),
      });
    } catch (e) {
      setSettingsError((e as Error).message ?? "Failed to load social settings");
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoadingSettings(false);
    }
  }

  async function loadPhrases() {
    setLoadingPhrases(true);
    setPhrasesError(null);
    try {
      const res = await fetch("/api/admin/social/phrases", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load phrases");
      const data = (await res.json()) as SocialPhrase[];
      setPhrases(data);
    } catch (e) {
      setPhrasesError((e as Error).message ?? "Failed to load phrases");
      setPhrases([]);
    } finally {
      setLoadingPhrases(false);
    }
  }

  useEffect(() => {
    void loadSettings();
    void loadPhrases();
  }, []);

  async function handleSettingsSubmit(e: FormEvent) {
    e.preventDefault();
    setSettingsError(null);

    const apartment_weight = Math.max(0, Math.round(settings.apartment_weight));
    const building_weight = Math.max(0, Math.round(settings.building_weight));
    const project_weight = Math.max(0, Math.round(settings.project_weight));
    const service_weight = Math.max(0, Math.round(settings.service_weight));

    if (apartment_weight + building_weight + project_weight + service_weight === 0) {
      setSettingsError("Heildarþyngd má ekki vera 0.");
      return;
    }

    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/social/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apartment_weight,
          building_weight,
          project_weight,
          service_weight,
        }),
      });

      if (!res.ok) {
        let message = "Tókst ekki að vista stillingar.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore
        }
        setSettingsError(message);
        return;
      }

      const data = (await res.json()) as SocialSettings;
      setSettings(data);
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleAddPhrase(kind: "hook" | "cta") {
    const text = (kind === "hook" ? newHookText : newCtaText).trim();
    if (!text) return;

    try {
      const res = await fetch("/api/admin/social/phrases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, text }),
      });

      if (!res.ok) {
        let message = "Tókst ekki að bæta við texta.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore
        }
        alert(message);
        return;
      }

      await loadPhrases();
      if (kind === "hook") setNewHookText("");
      else setNewCtaText("");
    } catch (e) {
      alert((e as Error).message ?? "Tókst ekki að bæta við texta.");
    }
  }

  async function handleToggleActive(phrase: SocialPhrase) {
    try {
      const res = await fetch(`/api/admin/social/phrases/${phrase.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !phrase.active }),
      });
      if (!res.ok) throw new Error("Tókst ekki að uppfæra texta.");
      await loadPhrases();
    } catch (e) {
      alert((e as Error).message ?? "Tókst ekki að uppfæra texta.");
    }
  }

  async function handleEditText(phrase: SocialPhrase) {
    const next = window.prompt("Uppfæra texta:", phrase.text);
    if (next == null) return;
    const trimmed = next.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(`/api/admin/social/phrases/${phrase.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (!res.ok) throw new Error("Tókst ekki að uppfæra texta.");
      await loadPhrases();
    } catch (e) {
      alert((e as Error).message ?? "Tókst ekki að uppfæra texta.");
    }
  }

  async function handleDeletePhrase(phrase: SocialPhrase) {
    const confirmed = window.confirm("Eyða þessum texta?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/social/phrases/${phrase.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Tókst ekki að eyða texta.");
      await loadPhrases();
    } catch (e) {
      alert((e as Error).message ?? "Tókst ekki að eyða texta.");
    }
  }

  const totalWeight =
    settings.apartment_weight +
    settings.building_weight +
    settings.project_weight +
    settings.service_weight;

  const apartmentPercent = totalWeight
    ? Math.round((settings.apartment_weight / totalWeight) * 100)
    : 0;
  const buildingPercent = totalWeight
    ? Math.round((settings.building_weight / totalWeight) * 100)
    : 0;
  const projectPercent = totalWeight
    ? Math.round((settings.project_weight / totalWeight) * 100)
    : 0;
  const servicePercent = totalWeight
    ? Math.round((settings.service_weight / totalWeight) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Social media
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
          Stilla sjálfvirkar Facebook færslur fyrir íbúðir, hús, verkefni og
          þjónustu. Þessar stillingar hafa áhrif á /api/social/candidates.
        </p>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">
              Þyngdir eftir efnisflokkum
            </h2>
            <p className="text-xs text-slate-600">
              Stilltu hversu líklegt er að íbúð, hús, verkefni eða þjónusta verði
              valin þegar öll eru í boði. Hlutföllin eru normaliseruð sjálfkrafa.
            </p>
          </div>

          {settingsError && (
            <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              {settingsError}
            </p>
          )}

          <form
            onSubmit={(e) => void handleSettingsSubmit(e)}
            className="space-y-3 text-xs"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-800">
                  Íbúðir (weight)
                </label>
                <input
                  type="number"
                  value={settings.apartment_weight}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      apartment_weight: Number(e.target.value) || 0,
                    }))
                  }
                  min={0}
                  className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[10px] text-slate-500">
                  Um {apartmentPercent}% líkur þegar allt er í boði.
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-800">
                  Hús (weight)
                </label>
                <input
                  type="number"
                  value={settings.building_weight}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      building_weight: Number(e.target.value) || 0,
                    }))
                  }
                  min={0}
                  className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[10px] text-slate-500">
                  Um {buildingPercent}% líkur þegar allt er í boði.
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-800">
                  Verkefni (weight)
                </label>
                <input
                  type="number"
                  value={settings.project_weight}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      project_weight: Number(e.target.value) || 0,
                    }))
                  }
                  min={0}
                  className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[10px] text-slate-500">
                  Um {projectPercent}% líkur þegar allt er í boði.
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-800">
                  Þjónusta (weight)
                </label>
                <input
                  type="number"
                  value={settings.service_weight}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      service_weight: Number(e.target.value) || 0,
                    }))
                  }
                  min={0}
                  className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[10px] text-slate-500">
                  Um {servicePercent}% líkur þegar allt er í boði.
                </p>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={savingSettings || loadingSettings}
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingSettings ? "Vista stillingar..." : "Vista stillingar"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">
              Textasetningar
            </h2>
            <p className="text-xs text-slate-600">
              Stjórna þeim íslensku setningum sem notaðar eru í upphafslínu ("hook")
              og lokaorðum (CTA) í færslum.
            </p>
          </div>

          {phrasesError && (
            <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              {phrasesError}
            </p>
          )}

          {loadingPhrases && (
            <p className="text-xs text-slate-500">Sæki texta...</p>
          )}

          {!loadingPhrases && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-800">
                  Hooks – upphafssetningar
                </h3>
                <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-2 text-[11px] text-slate-700">
                  {hooks.length === 0 && <p>Engar setningar skilgreindar enn.</p>}
                  {hooks.map((phrase) => (
                    <div
                      key={phrase.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1"
                    >
                      <div className="flex-1 truncate">{phrase.text}</div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void handleToggleActive(phrase)}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${
                            phrase.active
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                              : "bg-slate-50 text-slate-500 ring-slate-200"
                          }`}
                        >
                          {phrase.active ? "Virkt" : "Óvirkt"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleEditText(phrase)}
                          className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                        >
                          Breyta
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeletePhrase(phrase)}
                          className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] text-red-700 hover:bg-red-100"
                        >
                          Eyða
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-800">
                    Bæta við hook-setningu
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newHookText}
                      onChange={(e) => setNewHookText(e.target.value)}
                      maxLength={160}
                      className="h-8 flex-1 rounded-md border border-slate-200 px-2 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => void handleAddPhrase("hook")}
                      className="h-8 rounded-full bg-primary px-3 text-[11px] font-semibold text-white shadow-sm hover:bg-primary-light"
                    >
                      Bæta við
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-800">
                  CTAs – lokaorð
                </h3>
                <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-2 text-[11px] text-slate-700">
                  {ctas.length === 0 && <p>Engar setningar skilgreindar enn.</p>}
                  {ctas.map((phrase) => (
                    <div
                      key={phrase.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1"
                    >
                      <div className="flex-1 truncate">{phrase.text}</div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => void handleToggleActive(phrase)}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${
                            phrase.active
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                              : "bg-slate-50 text-slate-500 ring-slate-200"
                          }`}
                        >
                          {phrase.active ? "Virkt" : "Óvirkt"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleEditText(phrase)}
                          className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                        >
                          Breyta
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeletePhrase(phrase)}
                          className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] text-red-700 hover:bg-red-100"
                        >
                          Eyða
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-800">
                    Bæta við CTA-setningu
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCtaText}
                      onChange={(e) => setNewCtaText(e.target.value)}
                      maxLength={160}
                      className="h-8 flex-1 rounded-md border border-slate-200 px-2 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => void handleAddPhrase("cta")}
                      className="h-8 rounded-full bg-primary px-3 text-[11px] font-semibold text-white shadow-sm hover:bg-primary-light"
                    >
                      Bæta við
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
