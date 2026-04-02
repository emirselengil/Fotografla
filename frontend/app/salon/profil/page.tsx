"use client";

import AppHeader from "../../components/AppHeader";
import { useState } from "react";
import { venue } from "../../mock-data";

const navItems = [
  { label: "Genel Bakis", href: "/salon" },
  { label: "Etkinlikler", href: "/salon/etkinlikler" },
  { label: "QR Yonetimi", href: "/salon/qr" },
];

type MonthlyPlan = "Salon Basic" | "Salon Pro" | "Salon Plus" | "Salon Elite";

type SalonProfileData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  salonName: string;
  city: string;
  monthlyPlan: MonthlyPlan;
};

const STORAGE_KEY = "salon-profile";

const defaultProfile: SalonProfileData = {
  fullName: "Salon Yetkilisi",
  email: "",
  phone: "",
  password: "",
  salonName: venue.name,
  city: venue.city,
  monthlyPlan: venue.monthlyPlan as MonthlyPlan,
};

const inputClass =
  "w-full rounded-xl px-3 py-2.5 text-sm outline-none transition border border-soft-border bg-white text-foreground focus:border-sage focus:ring-1 focus:ring-sage";

function getInitialProfile(): SalonProfileData {
  if (typeof window === "undefined") {
    return defaultProfile;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultProfile;
    }
    const parsed = JSON.parse(saved) as Partial<SalonProfileData>;
    return {
      fullName: parsed.fullName || defaultProfile.fullName,
      email: parsed.email || defaultProfile.email,
      phone: parsed.phone || defaultProfile.phone,
      password: parsed.password || defaultProfile.password,
      salonName: parsed.salonName || defaultProfile.salonName,
      city: parsed.city || defaultProfile.city,
      monthlyPlan: (parsed.monthlyPlan as MonthlyPlan) || defaultProfile.monthlyPlan,
    };
  } catch {
    return defaultProfile;
  }
}

export default function SalonProfilPage() {
  const [profile, setProfile] = useState<SalonProfileData>(() => getInitialProfile());
  const [draft, setDraft] = useState<SalonProfileData>(() => getInitialProfile());
  const [isEditing, setIsEditing] = useState(false);

  const startEdit = () => {
    setDraft(profile);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const saveEdit = () => {
    if (!draft.fullName || !draft.salonName || !draft.city) {
      return;
    }
    const next: SalonProfileData = {
      ...draft,
      password: draft.password || profile.password,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProfile(next);
    setIsEditing(false);
  };

  return (
    <AppHeader name={profile.salonName} initials="ES" subtitle="Salon Yetkilisi" navItems={navItems}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <section className="rounded-2xl border border-soft-border bg-cream p-6 md:p-7">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Profil</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">Salon Profili</h1>
          <p className="mt-2 text-sm text-slate-500">
            Salon hesabiniza ait temel bilgiler burada goruntulenir.
          </p>
        </section>

        <section className="rounded-2xl border border-soft-border bg-cream p-6 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Hesap ve Salon Bilgileri</h2>
            {!isEditing ? (
              <button
                type="button"
                onClick={startEdit}
                className="rounded-xl border border-soft-border bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Duzenle
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-xl border border-soft-border bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Vazgec
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="rounded-xl bg-sage px-3 py-2 text-sm font-medium text-white hover:bg-sage-dark"
                >
                  Kaydet
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white border border-soft-border p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Hesap Bilgileri</p>
              {isEditing ? (
                <div className="mt-2 grid sm:grid-cols-2 gap-2">
                  <input
                    value={draft.fullName}
                    onChange={(e) => setDraft((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Ad Soyad"
                    className={inputClass}
                  />
                  <input
                    type="tel"
                    value={draft.phone}
                    onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Telefon"
                    className={inputClass}
                  />
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="E-posta"
                    className={inputClass}
                  />
                  <input
                    type="password"
                    value={draft.password}
                    onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Sifre"
                    className={inputClass}
                    autoComplete="new-password"
                  />
                </div>
              ) : (
                <>
                  <p className="mt-1 text-foreground font-medium">{profile.fullName}</p>
                  <p className="mt-1 text-sm text-slate-500">{profile.phone || "-"}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{profile.email || "-"}</p>
                  <p className="mt-0.5 text-sm text-slate-500">Sifre: {profile.password ? "******" : "-"}</p>
                </>
              )}
            </div>

            <div className="rounded-xl bg-white border border-soft-border p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Salon Bilgileri</p>
              {isEditing ? (
                <div className="mt-2 grid sm:grid-cols-3 gap-2">
                  <input
                    value={draft.salonName}
                    onChange={(e) => setDraft((prev) => ({ ...prev, salonName: e.target.value }))}
                    placeholder="Salon Adi"
                    className={inputClass}
                  />
                  <input
                    value={draft.city}
                    onChange={(e) => setDraft((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="Sehir"
                    className={inputClass}
                  />
                  <select
                    value={draft.monthlyPlan}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, monthlyPlan: e.target.value as MonthlyPlan }))
                    }
                    className={inputClass}
                  >
                    <option value="Salon Basic">Salon Basic</option>
                    <option value="Salon Pro">Salon Pro</option>
                    <option value="Salon Plus">Salon Plus</option>
                    <option value="Salon Elite">Salon Elite</option>
                  </select>
                </div>
              ) : (
                <>
                  <p className="mt-1 text-foreground font-medium">{profile.salonName}</p>
                  <p className="mt-1 text-sm text-slate-500">{profile.city}</p>
                  <p className="mt-0.5 text-sm text-gold font-semibold">{profile.monthlyPlan}</p>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppHeader>
  );
}
