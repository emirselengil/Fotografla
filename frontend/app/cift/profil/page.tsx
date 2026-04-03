"use client";

import AppHeader from "../../components/AppHeader";
import { useEffect, useState } from "react";
import { fetchCoupleProfile, updateCoupleProfile } from "../../lib/profile-api";
import { getStoredUserName, setStoredUserName } from "../../lib/auth";
import { buildInitials } from "../../lib/user-display";

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

const inputClass =
  "w-full rounded-xl px-3 py-2.5 text-sm outline-none transition border border-soft-border bg-white text-foreground focus:border-sage focus:ring-1 focus:ring-sage";

const defaultProfile: CoupleProfileData = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  groomName: "",
  brideName: "",
};

export default function CiftProfilPage() {
  const [profile, setProfile] = useState<CoupleProfileData>(defaultProfile);
  const [draft, setDraft] = useState<CoupleProfileData>(defaultProfile);
  const [currentUserName, setCurrentUserName] = useState(() => getStoredUserName() || "Cift");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetchCoupleProfile();
        setCurrentUserName(response.fullName || "Cift");
        setStoredUserName(response.fullName || "Cift");

        const mapped: CoupleProfileData = {
          fullName: response.fullName,
          email: response.email,
          phone: response.phoneE164 ?? "",
          password: "",
          groomName: response.groomName,
          brideName: response.brideName,
        };

        setProfile(mapped);
        setDraft(mapped);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Cift profili alinamadi.");
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
    if (!draft.fullName || !draft.groomName || !draft.brideName || !draft.email) {
      setError("Zorunlu alanlari doldurun.");
      return;
    }

    try {
      const response = await updateCoupleProfile({
        fullName: draft.fullName,
        email: draft.email,
        phoneE164: draft.phone || undefined,
        password: draft.password || undefined,
        groomName: draft.groomName,
        brideName: draft.brideName,
      });

      const mapped: CoupleProfileData = {
        fullName: response.fullName,
        email: response.email,
        phone: response.phoneE164 ?? "",
        password: "",
        groomName: response.groomName,
        brideName: response.brideName,
      };

      setProfile(mapped);
      setDraft(mapped);
      setCurrentUserName(mapped.fullName || "Cift");
      setStoredUserName(mapped.fullName || "Cift");
      setIsEditing(false);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Cift profili kaydedilemedi.");
    }
  };

  return (
    <AppHeader name={currentUserName} initials={buildInitials(currentUserName, "C")} subtitle="Cift Paneli" navItems={navItems}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <section className="rounded-2xl border border-soft-border bg-cream p-6 md:p-7">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Profil</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground">Cift Profili</h1>
          <p className="mt-2 text-sm text-slate-500">Cifte atanmis bilgiler burada goruntulenir.</p>
        </section>

        {isLoading && <p className="text-sm text-slate-500">Profil yukleniyor...</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}

        {!isLoading && (
          <section className="rounded-2xl border border-soft-border bg-cream p-6 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-foreground">Cift Bilgileri</h2>
              {!isEditing ? (
                <button type="button" onClick={startEdit} className="rounded-xl border border-soft-border bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  Duzenle
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={cancelEdit} className="rounded-xl border border-soft-border bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    Vazgec
                  </button>
                  <button type="button" onClick={() => void saveEdit()} className="rounded-xl bg-sage px-3 py-2 text-sm font-medium text-white hover:bg-sage-dark">
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
                    <input value={draft.fullName} onChange={(e) => setDraft((prev) => ({ ...prev, fullName: e.target.value }))} placeholder="Ad Soyad" className={inputClass} />
                    <input type="email" value={draft.email} onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))} placeholder="E-posta" className={inputClass} />
                    <input type="tel" value={draft.phone} onChange={(e) => setDraft((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Telefon" className={inputClass} />
                    <input type="password" value={draft.password} onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))} placeholder="Yeni Sifre (opsiyonel)" className="sm:col-span-3 w-full rounded-xl px-3 py-2.5 text-sm outline-none transition border border-soft-border bg-white text-foreground focus:border-sage focus:ring-1 focus:ring-sage" autoComplete="new-password" />
                  </div>
                ) : (
                  <>
                    <p className="mt-1 text-foreground font-medium">{profile.fullName}</p>
                    <p className="mt-1 text-sm text-slate-500">{profile.email || "-"}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{profile.phone || "-"}</p>
                  </>
                )}
              </div>
              <div className="rounded-xl bg-white border border-soft-border p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Damat</p>
                {isEditing ? (
                  <input value={draft.groomName} onChange={(e) => setDraft((prev) => ({ ...prev, groomName: e.target.value }))} placeholder="Damat Adi" className={`${inputClass} mt-2`} />
                ) : (
                  <p className="mt-1 text-foreground font-medium">{profile.groomName}</p>
                )}
              </div>
              <div className="rounded-xl bg-white border border-soft-border p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Gelin</p>
                {isEditing ? (
                  <input value={draft.brideName} onChange={(e) => setDraft((prev) => ({ ...prev, brideName: e.target.value }))} placeholder="Gelin Adi" className={`${inputClass} mt-2`} />
                ) : (
                  <p className="mt-1 text-foreground font-medium">{profile.brideName}</p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </AppHeader>
  );
}
