"use client";

import AppHeader from "../../components/AppHeader";
import { useEffect, useState } from "react";
import { fetchMySalonProfile, updateSalonProfile } from "../../lib/profile-api";
import { getStoredUserName, setStoredUserName } from "../../lib/auth";
import { buildInitials } from "../../lib/user-display";

const navItems = [
  { label: "Genel Bakis", href: "/salon" },
  { label: "Etkinlikler", href: "/salon/etkinlikler" },
  { label: "QR Yonetimi", href: "/salon/qr" },
];

type MonthlyPlan = "SALON_BASIC" | "SALON_PRO" | "SALON_PLUS" | "SALON_ELITE";

type SalonProfileData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  salonName: string;
  city: string;
  monthlyPlan: MonthlyPlan;
};

const inputClass =
  "w-full rounded-xl px-3 py-2.5 text-sm outline-none transition border border-soft-border bg-white text-foreground focus:border-sage focus:ring-1 focus:ring-sage";

const defaultProfile: SalonProfileData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  salonName: "",
  city: "",
  monthlyPlan: "SALON_PRO",
};

export default function SalonProfilPage() {
  const [profile, setProfile] = useState<SalonProfileData>(defaultProfile);
  const [draft, setDraft] = useState<SalonProfileData>(defaultProfile);
  const [venueId, setVenueId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState(() => getStoredUserName() || "Salon");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetchMySalonProfile();
        setCurrentUserName(response.fullName || "Salon");
        setStoredUserName(response.fullName || "Salon");
        setVenueId(response.venueId);
        const mapped: SalonProfileData = {
          fullName: response.fullName,
          email: response.email,
          phone: response.phoneE164 ?? "",
          password: "",
          salonName: response.salonName,
          city: response.city,
          monthlyPlan: (response.monthlyPlanCode as MonthlyPlan) || "SALON_PRO",
        };
        setProfile(mapped);
        setDraft(mapped);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Profil alinamadi.");
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, []);

  const startEdit = () => {
    setDraft({ ...profile, password: "" });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft({ ...profile, password: "" });
    setIsEditing(false);
  };

  const saveEdit = async () => {
    if (!draft.fullName || !draft.salonName || !draft.city || !draft.email) {
      setError("Zorunlu alanlari doldurun.");
      return;
    }

    if (!venueId) {
      setError("Salon ID bulunamadi.");
      return;
    }

    try {
      const response = await updateSalonProfile(venueId, {
        fullName: draft.fullName,
        email: draft.email,
        phoneE164: draft.phone || undefined,
        password: draft.password || undefined,
        salonName: draft.salonName,
        city: draft.city,
        monthlyPlanCode: draft.monthlyPlan,
      });

      const mapped: SalonProfileData = {
        fullName: response.fullName,
        email: response.email,
        phone: response.phoneE164 ?? "",
        password: "",
        salonName: response.salonName,
        city: response.city,
        monthlyPlan: (response.monthlyPlanCode as MonthlyPlan) || "SALON_PRO",
      };

      setProfile(mapped);
      setDraft(mapped);
      setCurrentUserName(mapped.fullName || "Salon");
      setStoredUserName(mapped.fullName || "Salon");
      setIsEditing(false);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Profil kaydedilemedi.");
    }
  };

  return (
    <AppHeader name={currentUserName} initials={buildInitials(currentUserName, "S")} subtitle="Salon Yetkilisi" navItems={navItems}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <section className="rounded-2xl border border-soft-border bg-cream p-6 md:p-7">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Profil</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">Salon Profili</h1>
          <p className="mt-2 text-sm text-slate-500">Salon hesabiniza ait temel bilgiler burada goruntulenir.</p>
        </section>

        {isLoading && <p className="text-sm text-slate-500">Profil yukleniyor...</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}

        {!isLoading && (
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
                    onClick={() => void saveEdit()}
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
                    <input value={draft.fullName} onChange={(e) => setDraft((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Ad Soyad" className={inputClass} />
                    <input type="tel" value={draft.phone} onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Telefon" className={inputClass} />
                    <input type="email" value={draft.email} onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))} placeholder="E-posta" className={inputClass} />
                    <input type="password" value={draft.password} onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))} placeholder="Yeni Sifre (opsiyonel)" className={inputClass} autoComplete="new-password" />
                  </div>
                ) : (
                  <>
                    <p className="mt-1 text-foreground font-medium">{profile.fullName}</p>
                    <p className="mt-1 text-sm text-slate-500">{profile.phone || "-"}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{profile.email || "-"}</p>
                  </>
                )}
              </div>

              <div className="rounded-xl bg-white border border-soft-border p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Salon Bilgileri</p>
                {isEditing ? (
                  <div className="mt-2 grid sm:grid-cols-3 gap-2">
                    <input value={draft.salonName} onChange={(e) => setDraft((prev) => ({ ...prev, salonName: e.target.value }))} placeholder="Salon Adi" className={inputClass} />
                    <input value={draft.city} onChange={(e) => setDraft((prev) => ({ ...prev, city: e.target.value }))} placeholder="Sehir" className={inputClass} />
                    <select value={draft.monthlyPlan} onChange={(e) => setDraft((prev) => ({ ...prev, monthlyPlan: e.target.value as MonthlyPlan }))} className={inputClass}>
                      <option value="SALON_BASIC">Salon Basic</option>
                      <option value="SALON_PRO">Salon Pro</option>
                      <option value="SALON_PLUS">Salon Plus</option>
                      <option value="SALON_ELITE">Salon Elite</option>
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
        )}
      </div>
    </AppHeader>
  );
}
