"use client";

import { useState, useMemo } from "react";
import AppHeader from "../../components/AppHeader";
import { couple, mockAppUsers, AppUser } from "../../mock-data";

/* ── Navigasyon ─────────────────────────────────────────── */
const navItems = [
  { label: "Genel Bakis", href: "/cift" },
  { label: "Medya", href: "/cift/medya" },
  { label: "Katilimcilar", href: "/cift/katilimcilar" },
];

/* ── Istatistik Karti Bileseni ─────────────────────────────────────────── */
function StatBox({ label, value, highlight = false, subtitle }: { label: string; value: number | string; highlight?: boolean; subtitle?: string }) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-1 transition-all ${highlight ? "bg-sage text-white border-sage-dark shadow-md" : "bg-cream border-soft-border text-foreground"}`}>
      <p className={`text-xs uppercase tracking-widest font-medium ${highlight ? "text-sage-light" : "text-slate-400"}`}>
        {label}
      </p>
      <div className="flex items-end gap-2">
        <p className={`text-3xl font-display font-semibold ${highlight ? "text-white" : "text-foreground"}`}>
          {value}
        </p>
        {subtitle && (
            <span className={`text-sm mb-1 ${highlight ? "text-sage-light" : "text-slate-500"}`}>{subtitle}</span>
        )}
      </div>
    </div>
  );
}

/* ── Ana Sayfa Bileseni ─────────────────────────────────────────── */
export default function KatilimcilarPage() {
  const [filter, setFilter] = useState<"all" | "photos" | "videos">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Istatistiklerin Hesaplanmasi
  const stats = useMemo(() => {
    return {
      totalUsers: mockAppUsers.length,
      totalPhotos: mockAppUsers.reduce((acc, u) => acc + u.uploadedPhotos, 0),
      totalVideos: mockAppUsers.reduce((acc, u) => acc + u.uploadedVideos, 0),
      anonymousUsers: mockAppUsers.filter(u => u.isAnonymous).length,
    };
  }, []);

  // Filtreme ve Arama
  const displayUsers = useMemo(() => {
    return mockAppUsers.filter((u) => {
      let matchesFilter = true;
      if (filter === "photos") matchesFilter = u.uploadedPhotos > 0;
      if (filter === "videos") matchesFilter = u.uploadedVideos > 0;

      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

  // Isimden bas harfleri alma fonksiyonu (Avatar icin)
  const getInitials = (name: string, isAnon: boolean) => {
    if (isAnon) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <AppHeader
      name={couple.groomName}
      initials="ES"
      subtitle="Cift Paneli"
      navItems={navItems}
    >
      <div className="flex flex-col gap-8">
        {/* Sayfa Basligi ve Açiklama */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            Uygulama Kullanıcıları
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">
            Salonunuzdaki QR kodu okutarak dügününüze katılan uygulamayı kullanan tüm misafirlerinizi ve albüme kattıkları anıları (medyaları) buradan takip edebilirsiniz.
          </p>
        </div>

        {/* Dashboard Istatistikleri */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Aktif Kullanıcı" value={stats.totalUsers} highlight />
          <StatBox label="Yüklenen Fotoğraf" value={stats.totalPhotos} />
          <StatBox label="Yüklenen Video" value={stats.totalVideos} />
          <StatBox label="Gizli (Anonim)" value={stats.anonymousUsers} />
        </div>

        {/* Aksiyon ve Filtreleme Cubugu */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-cream p-3 rounded-2xl border border-soft-border shadow-sm">
            {/* Arama */}
            <div className="relative flex-1 max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                    type="text" 
                    placeholder="Misafir ismi ara..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-soft-border rounded-xl text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage placeholder-slate-400"
                />
            </div>

            <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 w-full">
                {/* Durum Filtreleri */}
                <div className="flex items-center bg-white border border-soft-border rounded-xl p-1 overflow-x-auto">
                    {[
                        { id: "all", label: "Tumu" },
                        { id: "photos", label: "Fotograf Ekleyenler" },
                        { id: "videos", label: "Video Ekleyenler" },
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setFilter(btn.id as any)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                filter === btn.id ? "bg-sage-light/50 text-sage-dark" : "text-slate-500 hover:text-foreground hover:bg-slate-50"
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

            </div>
        </div>

        {/* Kullanici Listesi (List Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayUsers.map((user) => {
                const totalMedia = user.uploadedPhotos + user.uploadedVideos;

                return (
                    <article key={user.id} className={`bg-cream border p-5 rounded-2xl transition-all flex items-start gap-4 group cursor-pointer 
                      ${user.isAnonymous ? 'border-dashed border-slate-300 hover:border-slate-400' : 'border-soft-border hover:shadow-md'}`}>
                        
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-semibold text-lg flex-shrink-0
                            ${user.isAnonymous ? 'bg-slate-100 text-slate-400' : 'bg-white border border-sage-light text-sage-dark shadow-sm'}`}>
                            {getInitials(user.name, user.isAnonymous)}
                        </div>

                        {/* Detaylar */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <h3 className={`font-semibold truncate ${user.isAnonymous ? 'text-slate-500 italic' : 'text-foreground'}`}>
                                    {user.name}
                                </h3>
                                {/* Zaman Etiketi */}
                                <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                                    Giris: {user.joinedAt}
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-2">
                                {/* Medya Istatistikleri */}
                                {totalMedia === 0 ? (
                                    <span className="text-xs text-slate-400 italic bg-white px-2 py-1 rounded-md border border-slate-100">Henuz medya yuklemedi</span>
                                ) : (
                                    <>
                                        {user.uploadedPhotos > 0 && (
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-sage-light rounded-lg text-xs font-semibold text-sage-dark">
                                                📸 {user.uploadedPhotos} Foto
                                            </span>
                                        )}
                                        {user.uploadedVideos > 0 && (
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gold/40 rounded-lg text-xs font-semibold text-amber-700">
                                                🎥 {user.uploadedVideos} Video
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </article>
                );
            })}

            {displayUsers.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white border border-soft-border border-dashed rounded-2xl">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <p className="text-foreground font-medium text-lg">Sonuc Bulunamadi</p>
                    <p className="text-slate-500 text-sm mt-1 max-w-sm">Filtrelerinizle eşleşen kullanıcı bulunmuyor.</p>
                </div>
            )}
        </div>
      </div>
    </AppHeader>
  );
}
