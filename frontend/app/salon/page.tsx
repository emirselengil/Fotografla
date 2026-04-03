"use client";

import AppHeader from "../components/AppHeader";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchVenueEvents, getDefaultVenueId, updateEventStatus, type VenueEventItemResponse } from "../lib/salon-api";

const navItems = [
  { label: "Genel Bakis", href: "/salon" },
  { label: "Etkinlikler", href: "/salon/etkinlikler" },
  { label: "QR Yonetimi", href: "/salon/qr" },
];

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

  const venueId = getDefaultVenueId();

  const reload = useCallback(async () => {
    if (!venueId) {
      setError("NEXT_PUBLIC_DEFAULT_VENUE_ID ayarlanmalidir.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetchVenueEvents(venueId);
      setEvents(response);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Etkinlikler alinamadi.");
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const activeEvent = useMemo(() => events.find((event) => event.status === "ACTIVE") ?? null, [events]);
  const stats = useMemo(() => {
    const participantTotal = events.reduce((sum, event) => sum + event.pax, 0);
    const activeCount = events.filter((event) => event.status === "ACTIVE").length;
    const completedCount = events.filter((event) => event.status === "COMPLETED").length;
    return { participantTotal, activeCount, completedCount };
  }, [events]);

  const handleStatus = async (eventId: string, status: "active" | "completed") => {
    try {
      await updateEventStatus(eventId, status);
      await reload();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Etkinlik durumu guncellenemedi.");
    }
  };

  return (
    <AppHeader name="Salon Paneli" initials="ES" subtitle="Salon Yetkilisi" navItems={navItems}>
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
                      <td className="px-4 py-4">
                        {event.status !== "ACTIVE" && (
                          <button
                            onClick={() => void handleStatus(event.id, "active")}
                            className="rounded-xl bg-sage text-white text-xs font-medium px-3 py-1.5 hover:bg-sage-dark transition"
                          >
                            Baslat
                          </button>
                        )}
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
