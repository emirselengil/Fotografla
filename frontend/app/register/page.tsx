import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 items-center p-6 md:p-10">
      <main className="w-full rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
          Fotografla
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Register</h1>
        <p className="mt-2 text-sm text-slate-600">
          Bu sayfa su an frontend mock icin statik tasarimdir.
        </p>

        <form className="mt-6 grid gap-3 md:grid-cols-2">
          <select className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-sky-300 focus:ring md:col-span-2">
            <option>Hesap tipi secin</option>
            <option>Salon</option>
            <option>Cift</option>
          </select>
          <input
            placeholder="Ad Soyad"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-sky-300 focus:ring"
          />
          <input
            placeholder="E-posta"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-sky-300 focus:ring"
          />
          <input
            placeholder="Telefon"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-sky-300 focus:ring"
          />
          <input
            placeholder="Sifre"
            type="password"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-sky-300 focus:ring"
          />
          <button
            type="button"
            className="mt-2 w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white md:col-span-2"
          >
            Kayit Ol (Mock)
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Zaten hesabin var mi?{" "}
          <Link href="/sign-in" className="font-semibold text-sky-700 hover:underline">
            Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
