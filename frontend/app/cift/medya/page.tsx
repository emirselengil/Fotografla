"use client";

import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/AppHeader";
import { fetchCurrentCoupleLatestEvent, fetchEventMedia, type MediaListItemResponse } from "../../lib/dashboard-api";
import { useHydrationSafeDisplayName } from "../../lib/use-hydration-safe-display-name";
import { buildInitials } from "../../lib/user-display";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

type MediaItem = {
  id: string;
  type: "photo" | "video";
  uploaderName?: string;
  uploadedAt: string;
  url: string;
};

function resolveMediaUrl(url: string): string {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  if (!url.startsWith("/")) {
    return `${API_BASE_URL}/${url}`;
  }
  return `${API_BASE_URL}${url}`;
}

const navItems = [
  { label: "Genel Bakis", href: "/cift" },
  { label: "Medya", href: "/cift/medya" },
  { label: "Katilimcilar", href: "/cift/katilimcilar" },
];

export default function MedyaPage() {
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [currentUserName] = useHydrationSafeDisplayName("Cift");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const latestEvent = await fetchCurrentCoupleLatestEvent();
        if (!latestEvent.found || !latestEvent.event?.id) {
          setError("Aktif kullaniciya ait etkinlik bulunamadi.");
          return;
        }

        const eventId = latestEvent.event.id;
        const response = await fetchEventMedia(eventId);
        const mapped: MediaItem[] = response.map((item: MediaListItemResponse): MediaItem => ({
          id: item.id,
          type: item.type === "VIDEO" ? "video" : "photo",
          uploaderName: item.uploaderName,
          uploadedAt: item.uploadedAt,
          url: item.url,
        }));
        setMediaItems(mapped);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Medyalar alinamadi.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  // Filtrelenmiş medya
  const filteredMedia = useMemo(() => mediaItems.filter(
    (item) => filter === "all" || item.type === filter
  ), [mediaItems, filter]);

  useEffect(() => {
    if (!lightboxItem) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxItem(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [lightboxItem]);

  return (
    <>
      <AppHeader
        name={currentUserName}
        initials={buildInitials(currentUserName, "C")}
        subtitle="Cift Paneli"
        navItems={navItems}
      >
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-semibold text-foreground">
              Dugun Medyasi
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xl leading-relaxed">
              En guzel anilariniz burada toplaniyor. Sadece onayladiginiz
              kisiler bu galeriye erisebilir. Fotograflari uzerine tiklayarak
              tam ekranda goruntuleyebilirsiniz.
            </p>
          </div>

          {/* Filtre Butonlari */}
          <div className="flex bg-cream p-1.5 rounded-full border border-soft-border shadow-sm w-fit">
            <button
              onClick={() => setFilter("all")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === "all"
                  ? "bg-sage text-white shadow-sm"
                  : "text-slate-500 hover:text-foreground hover:bg-sage-light/50"
              }`}
            >
              Tumu
            </button>
            <button
              onClick={() => setFilter("photo")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === "photo"
                  ? "bg-sage text-white shadow-sm"
                  : "text-slate-500 hover:text-foreground hover:bg-sage-light/50"
              }`}
            >
              Fotograflar
            </button>
            <button
              onClick={() => setFilter("video")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                filter === "video"
                  ? "bg-sage text-white shadow-sm"
                  : "text-slate-500 hover:text-foreground hover:bg-sage-light/50"
              }`}
            >
              Videolar
            </button>
          </div>
        </div>

        {/* CSS Grid Tabankli Masonry (Sag tarafta veya altlarda bosluk birakmayan yontem) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[250px] grid-flow-row-dense">
          {loading && (
            <p className="col-span-full text-sm text-slate-500">Medyalar yukleniyor...</p>
          )}
          {error && (
            <p className="col-span-full text-sm text-rose-600">{error}</p>
          )}
          {/* Medya Ogeleri */}
          {filteredMedia.map((item, index) => {
            // Asimetrik (Pinterest benzeri) görünüm için bazı kılıfları iki katı uzunlukta yapıyoruz
            // Modulo kullanarak tamamen karışık (randomize) ama tutarlı bir görüntü veriyoruz
            const rowSpan = index % 5 === 0 || index % 3 === 0 ? "row-span-2" : "row-span-1";

            return (
              <article
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className={`relative w-full h-full overflow-hidden rounded-2xl cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-500 ${rowSpan}`}
              >
                {item.type === "photo" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveMediaUrl(item.url)}
                    alt={item.id}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                ) : (
                  <video
                    src={resolveMediaUrl(item.url)}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
                )}

                {/* Ust Bilgi (Hover ile gelir) */}
                <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white/90 text-sm font-medium drop-shadow-md">
                    {item.uploaderName} tarafindan
                  </p>
                  <p className="text-white/70 text-xs mt-0.5 drop-shadow-sm">
                    {item.uploadedAt}
                  </p>
                </div>

                {/* Video Ikonu (Ortada) */}
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:bg-white/90 transition-all duration-500 group-hover:scale-110">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-foreground ml-1 group-hover:border-l-sage-dark transition-colors" />
                    </div>
                  </div>
                )}
                
                {/* Alt Gradient (Sadece goz zevki icin hafif karanlik) */}
                <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              </article>
            );
          })}
        </div>
      </AppHeader>

      {/* Lightbox / Tam Ekran Goruntuleyici */}
      {lightboxItem && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
          {/* Kapat Butonu */}
          <button
            onClick={() => setLightboxItem(null)}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-black/70 border border-white/40 text-white hover:bg-black/85 transition-colors z-[130] shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Resim/Video Alanı */}
          <div className="relative w-full max-w-5xl h-[85vh] p-4 flex items-center justify-center">
            <div className="relative w-full h-full max-h-full">
              {lightboxItem.type === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveMediaUrl(lightboxItem.url)}
                  alt={lightboxItem.id}
                  className="h-full w-full object-contain"
                />
              ) : (
                <video
                  src={resolveMediaUrl(lightboxItem.url)}
                  className="h-full w-full object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              )}
            </div>
            
            {/* Ortadaki play ikonu (eğer videoyla açılırsa) */}
            {lightboxItem.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/10 backdrop-blur border border-white/20">
                        <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[20px] border-l-white ml-2 opacity-80" />
                    </div>
                </div>
            )}
            
            {/* Metadata Footer */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-black/50 backdrop-blur border border-white/10 text-white text-sm flex items-center gap-4">
              <p><span className="opacity-60">Yukleyen:</span> {lightboxItem.uploaderName}</p>
              <div className="w-1 h-1 rounded-full bg-white/30" />
              <p><span className="opacity-60">Saat:</span> {lightboxItem.uploadedAt}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
