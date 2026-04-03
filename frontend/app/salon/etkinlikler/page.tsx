"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/AppHeader";
import { fetchVenueEvents, type VenueEventItemResponse } from "../../lib/salon-api";
import { fetchMySalonProfile } from "../../lib/profile-api";
import { getStoredUserName } from "../../lib/auth";
import { buildInitials } from "../../lib/user-display";

const navItems = [
  { label: "Genel Bakis", href: "/salon" },
  { label: "Etkinlikler", href: "/salon/etkinlikler" },
  { label: "QR Yonetimi", href: "/salon/qr" },
];

type EventFilter = "all" | "active" | "planned" | "completed" | "cancelled";

const filterButtons: Array<{ id: EventFilter; label: string }> = [
  { id: "all", label: "Tumu" },
  { id: "active", label: "Aktif" },
  { id: "planned", label: "Yaklasan" },
  { id: "completed", label: "Tamamlanan" },
  { id: "cancelled", label: "Iptal" },
];

function mapStatus(status: VenueEventItemResponse["status"]): EventFilter {
  if (status === "ACTIVE") return "active";
  if (status === "PLANNED") return "planned";
  if (status === "COMPLETED") return "completed";
  return "cancelled";
}

export default function EtkinliklerPage() {
  const [filter, setFilter] = useState<EventFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<VenueEventItemResponse[]>([]);
  const [currentUserName] = useState(() => getStoredUserName() || "Salon");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const mySalon = await fetchMySalonProfile();
        const venueId = mySalon.venueId;
        const response = await fetchVenueEvents(venueId);
        setEvents(response);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Etkinlikler alinamadi.");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  const displayed = useMemo(() => {
    return events.filter((event) => {
      const normalized = mapStatus(event.status);
      const matchesFilter = filter === "all" || normalized === filter;
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [events, filter, searchQuery]);

  return (
    <AppHeader name={currentUserName} initials={buildInitials(currentUserName, "S")} subtitle="Salon Yetkilisi" navItems={navItems}>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Etkinlik Takvimi</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">Salona ait tum etkinlikleri buradan takip edebilirsiniz.</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-cream p-3 rounded-2xl border border-soft-border shadow-sm">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cift/etkinlik adi ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-soft-border rounded-xl text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage placeholder-slate-400"
            />
          </div>

          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 w-full">
            <div className="flex items-center bg-white border border-soft-border rounded-xl p-1 overflow-x-auto">
              {filterButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilter(btn.id)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === btn.id ? "bg-sage-light/50 text-sage-dark" : "text-slate-500 hover:text-foreground hover:bg-slate-50"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <Link href="/salon/etkinlikler/yeni" className="flex items-center gap-2 bg-sage hover:bg-sage-dark text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm whitespace-nowrap">
              <span>Yeni Etkinlik</span>
            </Link>
          </div>
        </div>

        {loading && <p className="text-sm text-slate-500">Etkinlikler yukleniyor...</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex flex-col gap-4">
          {displayed.map((event) => {
            const status = mapStatus(event.status);
            return (
              <article key={event.id} className="relative bg-cream border border-soft-border rounded-2xl overflow-hidden flex">
                <div className={`w-1.5 flex-shrink-0 ${status === "active" ? "bg-sage" : status === "planned" ? "bg-gold" : status === "completed" ? "bg-slate-300" : "bg-rose-300"}`} />
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display font-semibold text-lg text-foreground truncate">{event.title}</h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                      <span>{new Date(event.startsAt).toLocaleDateString("tr-TR")}</span>
                      <span>{new Date(event.startsAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} - {new Date(event.endsAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>{event.pax} davetli</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sage-light text-sage-dark">{event.status}</span>
                </div>
              </article>
            );
          })}

          {!loading && displayed.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white border border-soft-border border-dashed rounded-2xl">
              <p className="text-foreground font-medium text-lg">Sonuc bulunamadi</p>
            </div>
          )}
        </div>
      </div>
    </AppHeader>
  );
}
