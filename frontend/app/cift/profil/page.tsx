"use client";

import AppHeader from "../../components/AppHeader";
import { useState } from "react";
import { couple, venue } from "../../mock-data";

const navItems = [
  { label: "Genel Bakis", href: "/cift" },
  { label: "Medya", href: "/cift/medya" },
  { label: "Katilimcilar", href: "/cift/katilimcilar" },
];

type CoupleProfileData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  groomName: string;
  brideName: string;
};

const STORAGE_KEY = "cift-profile";

const defaultProfile: CoupleProfileData = {
  fullName: couple.loggedInAs,
  email: "",
  phone: "",
  password: "",
  groomName: couple.groomName,
  brideName: couple.brideName,
};

const inputClass =
  "w-full rounded-xl px-3 py-2.5 text-sm outline-none transition border border-soft-border bg-white text-foreground focus:border-sage focus:ring-1 focus:ring-sage";

function getInitialProfile(): CoupleProfileData {
  if (typeof window === "undefined") {
    return defaultProfile;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultProfile;
    }
    const parsed = JSON.parse(saved) as Partial<CoupleProfileData>;
    return {
      fullName: parsed.fullName || defaultProfile.fullName,
      email: parsed.email || defaultProfile.email,
      phone: parsed.phone || defaultProfile.phone,
      password: parsed.password || defaultProfile.password,
      groomName: parsed.groomName || defaultProfile.groomName,
      brideName: parsed.brideName || defaultProfile.brideName,
    };
  } catch {
    return defaultProfile;
  }
}

export default function CiftProfilPage() {
  const [profile, setProfile] = useState<CoupleProfileData>(() => getInitialProfile());
  const [draft, setDraft] = useState<CoupleProfileData>(() => getInitialProfile());
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
    if (!draft.groomName || !draft.brideName || !draft.fullName) {
      return;
    }
    const next: CoupleProfileData = {
      ...draft,
      password: draft.password || profile.password,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setProfile(next);
    setIsEditing(false);
  };

  return (
    <AppHeader name={profile.groomName} initials="ES" subtitle="Cift Paneli" navItems={navItems}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <section className="rounded-2xl border border-soft-border bg-cream p-6 md:p-7">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Profil</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">Cift Profili</h1>
          <p className="mt-2 text-sm text-slate-500">
            Cifte atanmis etkinlik ve bagli salon bilgileri burada goruntulenir.
          </p>
        </section>

        <section className="rounded-2xl border border-soft-border bg-cream p-6 md:p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Cift Bilgileri</h2>
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
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Hesap Sahibi</p>
              {isEditing ? (
                <div className="mt-2 grid sm:grid-cols-3 gap-2">
                  <input
                    value={draft.fullName}
                    onChange={(e) => setDraft((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Ad Soyad"
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
                    type="tel"
                    value={draft.phone}
                    onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Telefon"
                    className={inputClass}
                  />
                  <input
                    type="password"
                    value={draft.password}
                    onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Sifre"
                    className="sm:col-span-3 w-full rounded-xl px-3 py-2.5 text-sm outline-none transition border border-soft-border bg-white text-foreground focus:border-sage focus:ring-1 focus:ring-sage"
                    autoComplete="new-password"
                  />
                </div>
              ) : (
                <>
                  <p className="mt-1 text-foreground font-medium">{profile.fullName || couple.loggedInAs}</p>
                  <p className="mt-1 text-sm text-slate-500">{profile.email || "-"}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{profile.phone || "-"}</p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Sifre: {profile.password ? "******" : "-"}
                  </p>
                </>
              )}
            </div>
            <div className="rounded-xl bg-white border border-soft-border p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Damat</p>
              {isEditing ? (
                <input
                  value={draft.groomName}
                  onChange={(e) => setDraft((prev) => ({ ...prev, groomName: e.target.value }))}
                  placeholder="Damat Adi"
                  className={`${inputClass} mt-2`}
                />
              ) : (
                <p className="mt-1 text-foreground font-medium">{profile.groomName || couple.groomName}</p>
              )}
            </div>
            <div className="rounded-xl bg-white border border-soft-border p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Gelin</p>
              {isEditing ? (
                <input
                  value={draft.brideName}
                  onChange={(e) => setDraft((prev) => ({ ...prev, brideName: e.target.value }))}
                  placeholder="Gelin Adi"
                  className={`${inputClass} mt-2`}
                />
              ) : (
                <p className="mt-1 text-foreground font-medium">{profile.brideName || couple.brideName}</p>
              )}
            </div>
            <div className="rounded-xl bg-white border border-soft-border p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Etkinlik</p>
              <p className="mt-1 text-foreground font-medium">{couple.eventName}</p>
              <p className="mt-1 text-sm text-slate-500">
                {couple.eventDate} | {couple.startTime} - {couple.endTime}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-soft-border bg-cream p-6 md:p-7">
          <h2 className="font-display text-xl font-semibold text-foreground">Bagli Salon</h2>
          <div className="mt-4 grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-white border border-soft-border p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Salon Adi</p>
              <p className="mt-1 text-foreground font-medium">{venue.name}</p>
            </div>
            <div className="rounded-xl bg-white border border-soft-border p-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Sehir</p>
              <p className="mt-1 text-foreground font-medium">{venue.city}</p>
            </div>
          </div>
        </section>
      </div>
    </AppHeader>
  );
}
