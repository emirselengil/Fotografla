"use client";

import { useState, useMemo } from "react";
import AppHeader from "../../components/AppHeader";
import { venue, mockEvents, WeddingEvent } from "../../mock-data";

/* ── Navigasyon ─────────────────────────────────────────── */
const navItems = [
  { label: "Genel Bakis", href: "/salon" },
  { label: "Etkinlikler", href: "/salon/etkinlikler" },
  { label: "QR Yonetimi", href: "/salon/qr" },
];

/* ── Durum Konfigurasyon Haritası ─────────────────────────────────────────── */
const statusConfig = {
  active: {
    label: "Aktif",
    dot: "bg-sage",
    badge: "bg-sage-light text-sage-dark border-sage-light",
    bar: "bg-sage",
  },
  planned: {
    label: "Planlandı",
    dot: "bg-gold",
    badge: "bg-gold-light text-amber-800 border-gold/30",
    bar: "bg-gold",
  },
  completed: {
    label: "Tamamlandı",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-500 border-slate-200",
    bar: "bg-slate-300",
  },
  cancelled: {
    label: "İptal",
    dot: "bg-blush",
    badge: "bg-rose-50 text-rose-600 border-rose-200",
    bar: "bg-rose-300",
  },
};

/* ── İstatistik Kartı ─────────────────────────────────────────── */
function StatBox({
  label,
  value,
  highlight = false,
  subtitle,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
  subtitle?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col gap-1 transition-all ${
        highlight
          ? "bg-sage text-white border-sage-dark shadow-md"
          : "bg-cream border-soft-border text-foreground"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-widest font-medium ${
          highlight ? "text-sage-light" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <div className="flex items-end gap-2">
        <p
          className={`text-3xl font-display font-semibold ${
            highlight ? "text-white" : "text-foreground"
          }`}
        >
          {value}
        </p>
        {subtitle && (
          <span
            className={`text-sm mb-1 ${
              highlight ? "text-sage-light" : "text-slate-500"
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Ana Sayfa ─────────────────────────────────────────── */
export default function EtkinliklerPage() {
  const [filter, setFilter] = useState<
    "all" | "active" | "planned" | "completed" | "cancelled"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  /* İstatistikler */
  const stats = useMemo(() => ({
    total: mockEvents.length,
    upcoming: mockEvents.filter((e) => e.status === "planned" || e.status === "active").length,
    completed: mockEvents.filter((e) => e.status === "completed").length,
    totalPax: mockEvents.filter((e) => e.status !== "cancelled").reduce((acc, e) => acc + e.pax, 0),
  }), []);

  /* Filtre + Arama */
  const displayed = useMemo(() => {
    return mockEvents.filter((e) => {
      const matchesFilter = filter === "all" || e.status === filter;
      const matchesSearch = e.coupleName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  return (
    <AppHeader
      name={venue.name}
      initials="ES"
      subtitle="Salon Yetkilisi"
      navItems={navItems}
    >
      <div className="flex flex-col gap-8">
        {/* Sayfa Başlığı */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Etkinlik Takvimi
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">
            Salona ait tüm düğün etkinliklerini, tarihlerini ve durumlarını buradan takip edebilirsiniz.
          </p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Toplam Etkinlik" value={stats.total} />
          <StatBox label="Yaklaşan / Aktif" value={stats.upcoming} />
          <StatBox label="Tamamlanan" value={stats.completed} />
          <StatBox label="Toplam Davetli" value={stats.totalPax.toLocaleString("tr-TR")} />
        </div>

        {/* Araç Çubuğu */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-cream p-3 rounded-2xl border border-soft-border shadow-sm">
          {/* Arama */}
          <div className="relative flex-1 max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Çift adı ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-soft-border rounded-xl text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 w-full">
            {/* Durum Filtreleri */}
            <div className="flex items-center bg-white border border-soft-border rounded-xl p-1 overflow-x-auto">
              {[
                { id: "all", label: "Tümü" },
                { id: "active", label: "Aktif" },
                { id: "planned", label: "Yaklaşan" },
                { id: "completed", label: "Tamamlanan" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilter(btn.id as any)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === btn.id
                      ? "bg-sage-light/50 text-sage-dark"
                      : "text-slate-500 hover:text-foreground hover:bg-slate-50"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Yeni Ekle Butonu */}
            <button className="flex items-center gap-2 bg-sage hover:bg-sage-dark text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm hover:translate-y-px whitespace-nowrap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span className="hidden sm:inline">Yeni Etkinlik</span>
            </button>
          </div>
        </div>

        {/* Etkinlik Kartları Listesi */}
        <div className="flex flex-col gap-4">
          {displayed.map((event) => {
            const s = statusConfig[event.status];
            return (
              <article
                key={event.id}
                className="group relative bg-cream border border-soft-border rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex"
              >
                {/* Sol Durum Çubuğu */}
                <div className={`w-1.5 flex-shrink-0 ${s.bar}`} />

                {/* İçerik */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
                  {/* Tarih Kutusu */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-white border border-soft-border flex flex-col items-center justify-center shadow-sm text-center">
                    <span className="text-xs uppercase tracking-widest text-slate-400 font-medium leading-none">
                      {event.date.split(" ")[1]?.slice(0, 3)}
                    </span>
                    <span className="font-display text-2xl font-semibold text-foreground leading-none mt-0.5">
                      {event.date.split(" ")[0]}
                    </span>
                  </div>

                  {/* Etkinlik Bilgisi */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-display font-semibold text-lg text-foreground truncate">
                        {event.coupleName}
                      </h2>
                      {/* Durum Rozeti */}
                      <span
                        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${s.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      {/* Saat */}
                      <span className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {event.startTime} – {event.endTime}
                      </span>
                      {/* Davetli */}
                      <span className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        {event.pax} davetli
                      </span>
                      {/* Paket */}
                      {event.packageName && (
                        <span className="flex items-center gap-1.5 text-gold font-medium">
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          {event.packageName}
                        </span>
                      )}
                      {/* Ödeme */}
                      {!event.paymentApproved && (
                        <span className="text-rose-500 font-medium text-xs bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          Ödeme Bekleniyor
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sağ Aksiyon Butonu */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-soft-border hover:border-sage hover:text-sage-dark text-slate-500 text-sm font-medium transition-colors">
                      Detay
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          {/* Boş Durum */}
          {displayed.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white border border-soft-border border-dashed rounded-2xl">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <p className="text-foreground font-semibold text-lg font-display">Etkinlik Bulunamadı</p>
              <p className="text-slate-500 text-sm mt-1 max-w-sm">
                Seçili filtre veya aramayla eşleşen etkinlik yok. Farklı bir filtre deneyin.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppHeader>
  );
}
