import Link from "next/link";
import WeddingPanel from "../components/WeddingPanel";

export default function RegisterPage() {
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
            className="text-center mb-1"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.5rem",
              fontWeight: 500,
              color: "#1c2018",
            }}
          >
            Hesap Oluştur
          </p>
          <p className="text-center text-sm text-slate-500 mb-8">
            Kayıt olarak başlayın
          </p>

          <form className="space-y-3">
            <select
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
              style={{
                border: "1px solid #dde6d8",
                background: "#fff",
                color: "#1c2018",
              }}
            >
              <option value="">Hesap tipi seçin</option>
              <option value="salon">Salon</option>
              <option value="cift">Çift</option>
            </select>

            <input
              placeholder="Ad Soyad"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
              style={{
                border: "1px solid #dde6d8",
                background: "#fff",
                color: "#1c2018",
              }}
            />

            <input
              type="email"
              placeholder="E-posta"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
              style={{
                border: "1px solid #dde6d8",
                background: "#fff",
                color: "#1c2018",
              }}
            />

            <input
              type="tel"
              placeholder="Telefon"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
              style={{
                border: "1px solid #dde6d8",
                background: "#fff",
                color: "#1c2018",
              }}
            />

            <input
              type="password"
              placeholder="Şifre"
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
              style={{
                border: "1px solid #dde6d8",
                background: "#fff",
                color: "#1c2018",
              }}
            />

            <div style={{ height: "0.25rem" }} />

            <button
              type="button"
              className="w-full rounded-xl font-medium py-3 text-white transition hover:opacity-90"
              style={{ background: "#7a9b6f" }}
            >
              Kayıt Ol
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "#6b7280" }}>
            Zaten hesabın var mı?{" "}
            <Link
              href="/"
              className="font-semibold hover:underline"
              style={{ color: "#5a7851" }}
            >
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
