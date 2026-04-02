"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import WeddingPanel from "../components/WeddingPanel";

type AccountType = "" | "salon" | "cift";
type MonthlyPlan = "Salon Basic" | "Salon Pro" | "Salon Plus" | "Salon Elite";

type RegisterForm = {
  accountType: AccountType;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  passwordAgain: string;
  groomName: string;
  brideName: string;
  salonName: string;
  salonCity: string;
  monthlyPlan: MonthlyPlan;
};

const defaultForm: RegisterForm = {
  accountType: "",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  passwordAgain: "",
  groomName: "",
  brideName: "",
  salonName: "",
  salonCity: "",
  monthlyPlan: "Salon Pro",
};

const inputClass =
  "w-full rounded-xl px-4 py-3 text-sm outline-none transition border border-soft-border bg-white text-foreground focus:border-sage focus:ring-1 focus:ring-sage";

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterForm>(defaultForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAgain, setShowPasswordAgain] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.accountType) {
      setError("Lutfen hesap tipi secin.");
      return;
    }
    if (!form.fullName || !form.email || !form.phone || !form.password) {
      setError("Lutfen zorunlu hesap alanlarini doldurun.");
      return;
    }
    if (form.password !== form.passwordAgain) {
      setError("Sifreler ayni degil.");
      return;
    }

    if (form.accountType === "cift" && (!form.groomName || !form.brideName)) {
      setError("Cift icin gelin ve damat adini girin.");
      return;
    }

    if (
      form.accountType === "salon" &&
      (!form.salonName || !form.salonCity || !form.monthlyPlan)
    ) {
      setError("Salon icin tum profil alanlarini doldurun.");
      return;
    }

    const payload =
      form.accountType === "salon"
        ? {
            account: {
              type: "salon",
              fullName: form.fullName,
              email: form.email.toLowerCase().trim(),
              phone: form.phone,
            },
            venue: {
              name: form.salonName,
              city: form.salonCity,
              monthlyPlan: form.monthlyPlan,
            },
          }
        : {
            account: {
              type: "cift",
              fullName: form.fullName,
              email: form.email.toLowerCase().trim(),
              phone: form.phone,
            },
            note: "Cift etkinlik bilgileri salon panelinden aktarilacak.",
          };

    localStorage.setItem("register-last-payload", JSON.stringify(payload));

    if (form.accountType === "cift") {
      localStorage.setItem(
        "cift-profile",
        JSON.stringify({
          fullName: form.fullName,
          email: form.email.toLowerCase().trim(),
          phone: form.phone,
          password: form.password,
          groomName: form.groomName,
          brideName: form.brideName,
        })
      );
    }

    if (form.accountType === "salon") {
      localStorage.setItem(
        "salon-profile",
        JSON.stringify({
          fullName: form.fullName,
          email: form.email.toLowerCase().trim(),
          phone: form.phone,
          password: form.password,
          salonName: form.salonName,
          city: form.salonCity,
          monthlyPlan: form.monthlyPlan,
        })
      );
    }

    setSuccess("Kayit bilgileri alindi. Gerekli tum alanlar tamamlandi.");
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2">
        <WeddingPanel />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-10 bg-cream">
        <div className="w-full max-w-2xl">
          <p className="text-center mb-1 font-display text-3xl font-semibold text-foreground">
            Hesap Olustur
          </p>
          <p className="text-center text-sm text-slate-500 mb-8">
            Hesap tipine gore gerekli tum bilgileri doldurun.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-2xl border border-soft-border bg-white p-4 md:p-5 space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">Hesap Bilgileri</h2>

              <select
                value={form.accountType}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, accountType: e.target.value as AccountType }))
                }
                className={inputClass}
                required
              >
                <option value="">Hesap tipi secin</option>
                <option value="salon">Salon</option>
                <option value="cift">Cift</option>
              </select>

              <div className="grid md:grid-cols-2 gap-3">
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Ad Soyad"
                  className={inputClass}
                  required
                />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Telefon"
                  className={inputClass}
                  required
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="E-posta"
                  className={inputClass}
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Sifre"
                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition border border-soft-border bg-white text-foreground focus:border-sage focus:ring-1 focus:ring-sage"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Sifreyi gizle" : "Sifreyi goster"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 3 18 18" />
                        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                        <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              <div className="md:col-span-2 relative">
                <input
                  type={showPasswordAgain ? "text" : "password"}
                  value={form.passwordAgain}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, passwordAgain: e.target.value }))
                  }
                  placeholder="Sifre Tekrar"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm outline-none transition border border-soft-border bg-white text-foreground focus:border-sage focus:ring-1 focus:ring-sage"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordAgain((prev) => !prev)}
                  aria-label={showPasswordAgain ? "Sifreyi gizle" : "Sifreyi goster"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswordAgain ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 3 18 18" />
                      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              </div>

              {form.accountType === "cift" && (
                <div className="rounded-xl border border-soft-border bg-cream p-3 space-y-3 md:col-span-2">
                  <p className="text-sm font-medium text-slate-600">Cift Bilgileri</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      value={form.groomName}
                      onChange={(e) => setForm((prev) => ({ ...prev, groomName: e.target.value }))}
                      placeholder="Damat Adi"
                      className={inputClass}
                      required
                    />
                    <input
                      value={form.brideName}
                      onChange={(e) => setForm((prev) => ({ ...prev, brideName: e.target.value }))}
                      placeholder="Gelin Adi"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              )}

              {form.accountType === "salon" && (
                <div className="rounded-xl border border-soft-border bg-cream p-3 space-y-3">
                  <p className="text-sm font-medium text-slate-600">Salon Bilgileri</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <input
                      value={form.salonName}
                      onChange={(e) => setForm((prev) => ({ ...prev, salonName: e.target.value }))}
                      placeholder="Salon Adi"
                      className={inputClass}
                      required
                    />
                    <input
                      value={form.salonCity}
                      onChange={(e) => setForm((prev) => ({ ...prev, salonCity: e.target.value }))}
                      placeholder="Sehir"
                      className={inputClass}
                      required
                    />
                    <select
                      value={form.monthlyPlan}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, monthlyPlan: e.target.value as MonthlyPlan }))
                      }
                      className={inputClass}
                      required
                    >
                      <option value="Salon Basic">Salon Basic</option>
                      <option value="Salon Pro">Salon Pro</option>
                      <option value="Salon Plus">Salon Plus</option>
                      <option value="Salon Elite">Salon Elite</option>
                    </select>
                  </div>
                </div>
              )}
            </section>

            {error && <p className="text-sm text-rose-600">{error}</p>}
            {success && <p className="text-sm text-sage-dark">{success}</p>}

            <button
              type="submit"
              className="w-full rounded-xl font-medium py-3 text-white transition hover:opacity-90 bg-sage"
            >
              Kayit Ol
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Zaten hesabin var mi?{" "}
            <Link href="/" className="font-semibold hover:underline text-sage-dark">
              Giris Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
