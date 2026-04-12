"use client";

import AppHeader from "../components/AppHeader";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchVenueEvents,
  fetchVenueQrDashboard,
  fetchVenueQrPngBlob,
  updateEventStatus,
  type VenueEventItemResponse,
} from "../lib/salon-api";
import { fetchMySalonProfile } from "../lib/profile-api";
import { useHydrationSafeDisplayName } from "../lib/use-hydration-safe-display-name";
import { buildInitials } from "../lib/user-display";

const navItems = [
  { label: "Genel Bakis", href: "/salon" },
  { label: "Etkinlikler", href: "/salon/etkinlikler" },
  { label: "QR Yonetimi", href: "/salon/qr" },
];

const AUTO_REFRESH_INTERVAL_MS = 15000;

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-cream rounded-2xl p-5 border border-soft-border flex flex-col gap-1">
      <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">{label}</p>
      <p className={`text-3xl font-display font-semibold ${accent ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export default function SalonPage() {
  const [events, setEvents] = useState<VenueEventItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserName, setCurrentUserName] = useHydrationSafeDisplayName("Salon");
  const isReloadingRef = useRef(false);

  const [venueId, setVenueId] = useState<string | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
  const [qrReady, setQrReady] = useState(false);

  const reload = useCallback(async () => {
    if (!venueId) {
      setError("Aktif kullaniciya ait salon bulunamadi.");
      setLoading(false);
      return;
    }

    if (isReloadingRef.current) {
      return;
    }
    isReloadingRef.current = true;

    try {
      const response = await fetchVenueEvents(venueId);
      setEvents(response);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Etkinlikler alinamadi.");
    } finally {
      isReloadingRef.current = false;
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    const run = async () => {
      try {
        const mySalon = await fetchMySalonProfile();
        setVenueId(mySalon.venueId);
        setCurrentUserName(mySalon.fullName?.trim() || "Salon");
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Salon bilgisi alinamadi.");
        setLoading(false);
      }
    };

    void run();
  }, []);

  useEffect(() => {
    if (!venueId) {
      return;
    }
    void reload();
  }, [venueId, reload]);

  useEffect(() => {
    if (!venueId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void reload();
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [venueId, reload]);

  useEffect(() => {
    if (!venueId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const dash = await fetchVenueQrDashboard(venueId);
        if (cancelled) {
          return;
        }
        if (!dash.generated) {
          setQrReady(false);
          setQrPreviewUrl((prev) => {
            if (prev) {
              URL.revokeObjectURL(prev);
            }
            return null;
          });
          return;
        }
        setQrReady(true);
        const blob = await fetchVenueQrPngBlob(venueId);
        if (cancelled) {
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        setQrPreviewUrl((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev);
          }
          return objectUrl;
        });
      } catch {
        if (!cancelled) {
          setQrReady(false);
          setQrPreviewUrl((prev) => {
            if (prev) {
              URL.revokeObjectURL(prev);
            }
            return null;
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [venueId]);

  const activeEvent = useMemo(() => events.find((event) => event.status === "ACTIVE") ?? null, [events]);
  const stats = useMemo(() => {
    const participantTotal = events.reduce((sum, event) => sum + event.pax, 0);
    const activeCount = events.filter((event) => event.status === "ACTIVE").length;
    const completedCount = events.filter((event) => event.status === "COMPLETED").length;
    return { participantTotal, activeCount, completedCount };
  }, [events]);

  const handleStatus = async (eventId: string, status: "active" | "completed" | "cancelled") => {
    if (status === "cancelled") {
      const isConfirmed = window.confirm("Bu etkinligi iptal etmek istediginize emin misiniz?");
      if (!isConfirmed) {
        return;
      }
    }

    try {
      await updateEventStatus(eventId, status);
      await reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Etkinlik durumu guncellenemedi.");
    }
  };

  return (
    <AppHeader name={currentUserName} initials={buildInitials(currentUserName, "S")} subtitle="Salon Yetkilisi" navItems={navItems}>
      {loading && <p className="text-sm text-slate-500 mb-4">Veriler yukleniyor...</p>}
      {error && <p className="text-sm text-rose-600 mb-4">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Aktif Etkinlik" value={String(stats.activeCount)} accent="text-sage-dark" />
        <StatCard label="Toplam Katilimci" value={String(stats.participantTotal)} />
        <StatCard label="Tamamlanan" value={String(stats.completedCount)} accent="text-gold" />
        <StatCard label="Toplam Etkinlik" value={String(events.length)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="bg-cream rounded-2xl border border-soft-border overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-soft-border">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">Aktif Etkinlik</p>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-1">{activeEvent?.title ?? "Aktif etkinlik yok"}</h2>
              {activeEvent && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {formatDate(activeEvent.startsAt)} - {formatTime(activeEvent.startsAt)} / {formatTime(activeEvent.endsAt)}
                </p>
              )}
            </div>
            <div className="px-6 py-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-light text-sage-dark text-xs font-semibold px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-dark inline-block" />
                {activeEvent ? "Etkinlik Acik" : "Beklemede"}
              </span>
              {activeEvent && (
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => void handleStatus(activeEvent.id, "cancelled")}
                    className="rounded-xl border border-soft-border bg-white text-sm font-medium text-slate-600 px-4 py-2 hover:bg-slate-50 transition"
                  >
                    Etkinligi Iptal Et
                  </button>
                  <button
                    onClick={() => void handleStatus(activeEvent.id, "completed")}
                    className="rounded-xl bg-blush text-white text-sm font-medium px-4 py-2 hover:opacity-90 transition"
                  >
                    Etkinligi Bitir
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="bg-cream rounded-2xl border border-soft-border overflow-hidden">
            <div className="px-6 py-4 border-b border-soft-border flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Etkinlik Takvimi</h2>
              <Link href="/salon/etkinlikler/yeni" className="text-sm text-sage-dark font-medium hover:underline">
                + Yeni Etkinlik
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sage-light/50 text-slate-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-6 py-3 font-medium">Etkinlik</th>
                    <th className="text-left px-4 py-3 font-medium">Tarih</th>
                    <th className="text-left px-4 py-3 font-medium">Saat</th>
                    <th className="text-left px-4 py-3 font-medium">Durum</th>
                    <th className="text-left px-4 py-3 font-medium">Aksiyon</th>
                    <th className="border-l border-soft-border px-4 py-3 text-center font-medium whitespace-nowrap align-middle">
                      Detay
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 6).map((event) => (
                    <tr key={event.id} className="border-t border-soft-border">
                      <td className="px-6 py-4">
                        <p className="font-display font-medium text-foreground">{event.title}</p>
                        <p className="text-xs text-slate-400">{event.packageName ?? "Paket yok"}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{formatDate(event.startsAt)}</td>
                      <td className="px-4 py-4 text-slate-600">{formatTime(event.startsAt)} - {formatTime(event.endsAt)}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-sage-light text-sage-dark text-xs font-semibold px-2.5 py-1">{event.status}</span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {event.status !== "ACTIVE" && event.status !== "CANCELLED" && event.status !== "COMPLETED" && (
                            <button
                              onClick={() => void handleStatus(event.id, "active")}
                              className="rounded-xl bg-sage text-white text-xs font-medium px-3 py-1.5 hover:bg-sage-dark transition"
                            >
                              Baslat
                            </button>
                          )}
                          {event.status !== "CANCELLED" && event.status !== "COMPLETED" && (
                            <button
                              onClick={() => void handleStatus(event.id, "cancelled")}
                              className="rounded-xl border border-soft-border bg-white text-xs font-medium text-slate-600 px-3 py-1.5 hover:bg-slate-50 transition"
                            >
                              Iptal Et
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="border-l border-soft-border px-4 py-4 text-center align-middle whitespace-nowrap">
                        <Link
                          href={`/salon/etkinlikler/${event.id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-sage-light bg-white px-3.5 py-2 text-xs font-semibold text-sage-dark shadow-sm transition hover:bg-sage-light/60 hover:border-sage min-w-[4.5rem]"
                        >
                          Detay
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="bg-cream rounded-2xl border border-soft-border overflow-hidden">
            <div className="px-5 py-4 border-b border-soft-border">
              <h2 className="font-display text-lg font-semibold text-foreground">QR Yonetimi</h2>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">Mekan QR kodunu ve istatistikleri yonetmek icin QR ekranini kullanin.</p>
              {qrReady && qrPreviewUrl ? (
                <div className="flex justify-center rounded-xl border border-soft-border bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrPreviewUrl} alt="Salon QR onizleme" className="h-28 w-28 object-contain" />
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center">QR henuz olusturulmadi veya yukleniyor.</p>
              )}
              <Link href="/salon/qr" className="w-full inline-flex justify-center rounded-xl bg-sage text-white text-sm font-medium py-2.5 hover:bg-sage-dark transition">
                QR Ekranina Git
              </Link>
            </div>
          </section>
        </div>
      </div>
    </AppHeader>
  );
}
