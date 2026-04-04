"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import WeddingPanel from "../components/WeddingPanel";
import { apiRequest } from "../lib/api";

type AccountType = "" | "salon" | "cift";

type RegisterForm = {
  accountType: AccountType;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  passwordAgain: string;
  salonName: string;
  city: string;
  monthlyPlanCode: string;
  groomName: string;
  brideName: string;
};

const defaultForm: RegisterForm = {
  accountType: "",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  passwordAgain: "",
  salonName: "",
  city: "",
  monthlyPlanCode: "SALON_PRO",
  groomName: "",
  brideName: "",
};

const inputClass =
  "w-full rounded-xl px-4 py-3 text-sm outline-none transition border border-soft-border bg-white text-foreground focus:border-sage focus:ring-1 focus:ring-sage";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>(defaultForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAgain, setShowPasswordAgain] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!form.accountType) {
      setError("Lutfen hesap tipi secin.");
      return;
    }

    if (!form.fullName || !form.email || !form.phone || !form.password) {
      setError("Lutfen zorunlu alanlari doldurun.");
      return;
    }

    if (form.password !== form.passwordAgain) {
      setError("Sifreler ayni degil.");
      return;
    }

    if (form.accountType === "salon" && (!form.salonName.trim() || !form.city.trim())) {
      setError("Lutfen salon bilgilerini doldurun.");
      return;
    }

    if (form.accountType === "cift" && (!form.groomName.trim() || !form.brideName.trim())) {
      setError("Lutfen cift bilgilerini doldurun.");
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: form.password,
          role: form.accountType === "salon" ? "salon_owner" : "couple_admin",
          salonName: form.accountType === "salon" ? form.salonName.trim() : undefined,
          city: form.accountType === "salon" ? form.city.trim() : undefined,
          monthlyPlanCode: form.accountType === "salon" ? form.monthlyPlanCode : undefined,
          groomName: form.accountType === "cift" ? form.groomName.trim() : undefined,
          brideName: form.accountType === "cift" ? form.brideName.trim() : undefined,
        }),
      });

      setForm(defaultForm);
      router.replace("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Kayit olusturulamadi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2">
        <WeddingPanel />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-10 bg-cream">
        <div className="w-full max-w-xl">
          <p className="text-center mb-1 font-display text-3xl font-semibold text-foreground">Hesap Olustur</p>
          <p className="text-center text-sm text-slate-500 mb-8">Kayit olup platformu kullanmaya baslayin.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              value={form.accountType}
              onChange={(e) =>
                setForm((prev) => {
                  const accountType = e.target.value as AccountType;
                  return {
                    ...prev,
                    accountType,
                    salonName: accountType === "salon" ? prev.salonName : "",
                    city: accountType === "salon" ? prev.city : "",
                    monthlyPlanCode: accountType === "salon" ? prev.monthlyPlanCode : "SALON_PRO",
                    groomName: accountType === "cift" ? prev.groomName : "",
                    brideName: accountType === "cift" ? prev.brideName : "",
                  };
                })
              }
              className={inputClass}
              required
              disabled={isLoading}
            >
              <option value="">Hesap tipi secin</option>
              <option value="salon">Salon</option>
              <option value="cift">Cift</option>
            </select>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                placeholder="Ad Soyad"
                className={inputClass}
                required
                disabled={isLoading}
              />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Telefon"
                className={inputClass}
                required
                disabled={isLoading}
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="E-posta"
                className={inputClass}
                required
                disabled={isLoading}
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Sifre"
                  className={`${inputClass} pr-16`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-700"
                  disabled={isLoading}
                >
                  {showPassword ? "Gizle" : "Goster"}
                </button>
              </div>

              <div className="relative md:col-span-2">
                <input
                  type={showPasswordAgain ? "text" : "password"}
                  value={form.passwordAgain}
                  onChange={(e) => setForm((prev) => ({ ...prev, passwordAgain: e.target.value }))}
                  placeholder="Sifre Tekrar"
                  className={`${inputClass} pr-16`}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordAgain((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-700"
                  disabled={isLoading}
                >
                  {showPasswordAgain ? "Gizle" : "Goster"}
                </button>
              </div>
            </div>

            {form.accountType === "salon" && (
              <section className="rounded-xl border border-soft-border bg-white/70 p-4">
                <h3 className="mb-3 text-base font-semibold text-foreground">Salon Bilgileri</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input
                    value={form.salonName}
                    onChange={(e) => setForm((prev) => ({ ...prev, salonName: e.target.value }))}
                    placeholder="Salon Adi"
                    className={inputClass}
                    required
                    disabled={isLoading}
                  />
                  <input
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="Sehir"
                    className={inputClass}
                    required
                    disabled={isLoading}
                  />
                  <select
                    value={form.monthlyPlanCode}
                    onChange={(e) => setForm((prev) => ({ ...prev, monthlyPlanCode: e.target.value }))}
                    className={inputClass}
                    required
                    disabled={isLoading}
                  >
                    <option value="SALON_PRO">Salon Pro</option>
                    <option value="SALON_PLUS">Salon Plus</option>
                    <option value="SALON_PREMIUM">Salon Premium</option>
                  </select>
                </div>
              </section>
            )}

            {form.accountType === "cift" && (
              <section className="rounded-xl border border-soft-border bg-white/70 p-4">
                <h3 className="mb-3 text-base font-semibold text-foreground">Cift Bilgileri</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <input
                    value={form.groomName}
                    onChange={(e) => setForm((prev) => ({ ...prev, groomName: e.target.value }))}
                    placeholder="Damat Adi"
                    className={inputClass}
                    required
                    disabled={isLoading}
                  />
                  <input
                    value={form.brideName}
                    onChange={(e) => setForm((prev) => ({ ...prev, brideName: e.target.value }))}
                    placeholder="Gelin Adi"
                    className={inputClass}
                    required
                    disabled={isLoading}
                  />
                </div>
              </section>
            )}

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-sage text-white text-sm font-semibold py-3 hover:bg-sage-dark transition"
            >
              {isLoading ? "Kaydediliyor..." : "Kaydi Tamamla"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Zaten hesabin var mi?{" "}
            <Link href="/" className="font-semibold text-sage-dark hover:underline">
              Giris Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
