"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WeddingPanel from "./components/WeddingPanel";
import { apiRequest } from "./lib/api";
import { clearAuth, getRole, getToken, persistAuth } from "./lib/auth";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
};

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    const role = getRole();

    if (!token || !role) {
      return;
    }

    if (role === "salon_owner" || role === "staff") {
      router.replace("/salon");
      return;
    }

    router.replace("/cift");
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("reason") === "session-expired") {
      setError("Oturum sureniz doldu. Lutfen tekrar giris yapin.");
    }
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    setIsLoading(true);
    clearAuth();

    try {
      const response = await apiRequest<LoginResponse>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      persistAuth(response.token, response.user.role, response.user.fullName);

      if (response.user.role === "salon_owner" || response.user.role === "staff") {
        router.push("/salon");
        return;
      }

      router.push("/cift");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Giris basarisiz.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">

      {/* LEFT — Botanik wedding panel */}
      <div className="hidden lg:flex lg:w-1/2">
        <WeddingPanel />
      </div>

      {/* RIGHT — Form */}
      <div
        className="flex flex-1 flex-col items-center justify-center p-10"
        style={{ background: "#fdfcf8" }}
      >
        <div className="w-full max-w-sm">
          <p
            className="font-display text-center mb-1"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.5rem",
              fontWeight: 500,
              color: "#1c2018",
            }}
          >
            Hos geldiniz
          </p>
          <p className="text-center text-sm text-slate-500 mb-8">
            Hesabiniza giris yapin
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: "#374151" }}>
                E-posta
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kullanici@ornek.com"
                required
                disabled={isLoading}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
                style={{
                  border: "1px solid #dde6d8",
                  background: "#fff",
                  color: "#1c2018",
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: "#374151" }}>
                Sifre
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl px-4 py-3 pr-14 text-sm outline-none transition"
                  style={{
                    border: "1px solid #dde6d8",
                    background: "#fff",
                    color: "#1c2018",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:text-slate-700 transition"
                  style={{ color: "#9ca3af" }}
                >
                  {showPassword ? "Gizle" : "Goster"}
                </button>
              </div>
            </div>

            {/* Sabit yükseklikli hata alanı — layout shift olmaz */}
            <div className="h-9 flex items-center">
              {error && (
                <p
                  className="w-full rounded-xl px-4 py-2 text-sm"
                  style={{
                    background: "#f7eced",
                    border: "1px solid #e8b0b6",
                    color: "#b05060",
                  }}
                >
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl font-medium py-3 text-white transition hover:opacity-90"
              style={{ background: "#7a9b6f" }}
            >
              {isLoading ? "Giris Yapiliyor..." : "Giris Yap"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "#6b7280" }}>
            Hesabin yok mu?{" "}
            <Link
              href="/register"
              className="font-semibold hover:underline"
              style={{ color: "#5a7851" }}
            >
              Kayit Ol
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
