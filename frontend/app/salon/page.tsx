import AppHeader from "../components/AppHeader";
import { couple, venue } from "../mock-data";

const navItems = [
  { label: "Genel Bakis", href: "/salon" },
  { label: "Etkinlikler", href: "/salon/etkinlikler" },
  { label: "QR Yonetimi", href: "/salon/qr" },
];

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-cream rounded-2xl p-5 border border-soft-border flex flex-col gap-1">
      <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">{label}</p>
      <p className={`text-3xl font-display font-semibold ${accent ?? "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

export default function SalonPage() {
  return (
    <AppHeader
      name={venue.name}
      initials="ES"
      subtitle="Salon Yetkilisi"
      navItems={navItems}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Aktif Etkinlik" value="1" accent="text-sage-dark" />
        <StatCard label="Katilimci" value={String(couple.participantCount)} />
        <StatCard label="Paket" value={venue.monthlyPlan} accent="text-gold" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COL */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Aktif Etkinlik */}
          <section className="bg-cream rounded-2xl border border-soft-border overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-soft-border">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Bugunun Etkinligi</p>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-1">
                {couple.eventName}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {couple.eventDate} &mdash; {couple.startTime} / {couple.endTime}
              </p>
            </div>
            <div className="px-6 py-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-light text-sage-dark text-xs font-semibold px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-dark inline-block" />
                Odeme Onayli
              </span>
              <div className="flex gap-2 ml-auto">
                <button className="rounded-xl bg-sage text-white text-sm font-medium px-4 py-2 hover:bg-sage-dark transition">
                  Etkinligi Baslat
                </button>
                <button className="rounded-xl bg-blush text-white text-sm font-medium px-4 py-2 hover:opacity-90 transition">
                  Etkinligi Bitir
                </button>
              </div>
            </div>
          </section>

          {/* Etkinlik Takvimi */}
          <section className="bg-cream rounded-2xl border border-soft-border overflow-hidden">
            <div className="px-6 py-4 border-b border-soft-border flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Etkinlik Takvimi</h2>
              <button className="text-sm text-sage-dark font-medium hover:underline">+ Yeni Etkinlik</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sage-light/50 text-slate-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-6 py-3 font-medium">Etkinlik</th>
                    <th className="text-left px-4 py-3 font-medium">Tarih</th>
                    <th className="text-left px-4 py-3 font-medium">Saat</th>
                    <th className="text-left px-4 py-3 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-soft-border">
                    <td className="px-6 py-4">
                      <p className="font-display font-medium text-foreground">{couple.eventName}</p>
                      <p className="text-xs text-slate-400">Dugun</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{couple.eventDate}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {couple.startTime} &ndash; {couple.endTime}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-sage-light text-sage-dark text-xs font-semibold px-2.5 py-1">
                        Onayli
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT COL */}
        <div className="flex flex-col gap-6">

          {/* QR Yonetimi */}
          <section className="bg-cream rounded-2xl border border-soft-border overflow-hidden">
            <div className="px-5 py-4 border-b border-soft-border">
              <h2 className="font-display text-lg font-semibold text-foreground">QR Yonetimi</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-gold/30 bg-gold-light p-4">
                <p className="text-sm font-semibold text-amber-800">Henuz QR olusturulmadi</p>
                <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                  Salona ait tekil QR kodu henuz uretilmemistir. Olusturuldugunda PDF
                  cikti alinabilir; masalara ve girise yerlestirilir.
                </p>
              </div>
              <button className="w-full rounded-xl bg-sage text-white text-sm font-medium py-2.5 hover:bg-sage-dark transition">
                QR Olustur
              </button>
              <button
                disabled
                className="w-full rounded-xl border border-soft-border text-slate-400 text-sm font-medium py-2.5 cursor-not-allowed"
              >
                PDF Indir (Pasif)
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppHeader>
  );
}
