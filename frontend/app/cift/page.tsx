"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AppHeader from "../components/AppHeader";
import {
  fetchEventMedia,
  fetchEventParticipants,
  fetchEventSummary,
  fetchCurrentCoupleLatestEvent,
  linkCurrentCoupleToEvent,
  type EventSummaryResponse,
  type MediaListItemResponse,
  type ParticipantListItemResponse,
} from "../lib/dashboard-api";
import { getStoredUserName } from "../lib/auth";
import { buildInitials } from "../lib/user-display";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function resolveMediaUrl(url: string): string {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  if (!url.startsWith("/")) {
    return `${API_BASE_URL}/${url}`;
  }
  return `${API_BASE_URL}${url}`;
}

/* ── Nav ─────────────────────────────────────────── */
const navItems = [
  { label: "Genel Bakis", href: "/cift" },
  { label: "Medya", href: "/cift/medya" },
  { label: "Katilimcilar", href: "/cift/katilimcilar" },
];

/* ── Yardımcı Bileşenler (Salon kalıbına uygun) ── */

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-cream rounded-2xl p-5 border border-soft-border flex flex-col gap-1">
      <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
        {label}
      </p>
      <p
        className={`text-3xl font-display font-semibold ${accent ?? "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}

/* ── Sayfa ────────────────────────────────────────── */
export default function CiftPage() {
  const [summary, setSummary] = useState<EventSummaryResponse | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaListItemResponse[]>([]);
  const [participants, setParticipants] = useState<ParticipantListItemResponse[]>([]);
  const [eventCode, setEventCode] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [currentUserName] = useState(() => getStoredUserName() || "Cift");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const latestEvent = await fetchCurrentCoupleLatestEvent();

      if (!latestEvent.found || !latestEvent.event?.id) {
        setSummary(null);
        setMediaItems([]);
        setParticipants([]);
        setError("");
        return;
      }

      const eventId = latestEvent.event.id;
      const [eventSummary, eventMedia, eventParticipants] = await Promise.all([
        fetchEventSummary(eventId),
        fetchEventMedia(eventId),
        fetchEventParticipants(eventId),
      ]);

      setSummary(eventSummary);
      setMediaItems(eventMedia);
      setParticipants(eventParticipants);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Veriler alinamadi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const handleLinkEvent = async () => {
    if (!eventCode.trim()) {
      setError("Lutfen etkinlik kodu girin.");
      return;
    }

    setIsLinking(true);
    try {
      await linkCurrentCoupleToEvent(eventCode);
      setEventCode("");
      await loadDashboard();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Etkinlik kodu ile baglanti kurulamadı.");
    } finally {
      setIsLinking(false);
    }
  };

  const mediaPreview = useMemo(() => mediaItems.slice(0, 9), [mediaItems]);
  const participantsPreview = useMemo(() => participants.slice(0, 5), [participants]);
  const paymentApproved = Boolean(summary?.paymentApproved);

  return (
    <AppHeader
      name={currentUserName}
      initials={buildInitials(currentUserName, "C")}
      subtitle="Cift Paneli"
      navItems={navItems}
    >
      {loading && <p className="text-sm text-slate-500">Veriler yukleniyor...</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}

      {!loading && !summary && (
        <section className="rounded-2xl border border-soft-border bg-cream p-6 md:p-7">
          <h2 className="font-display text-2xl font-semibold text-foreground">Etkinlik Kodu ile Baglan</h2>
          <p className="mt-2 text-sm text-slate-500">Salon tarafindan paylasilan benzersiz etkinlik kodunu girin.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={eventCode}
              onChange={(event) => setEventCode(event.target.value.toUpperCase())}
              placeholder="Ornek: AB12CD34"
              className="w-full rounded-xl border border-soft-border bg-white px-4 py-3 text-sm outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              maxLength={8}
              disabled={isLinking}
            />
            <button
              type="button"
              onClick={() => void handleLinkEvent()}
              disabled={isLinking}
              className="rounded-xl bg-sage px-5 py-3 text-sm font-medium text-white hover:bg-sage-dark"
            >
              {isLinking ? "Baglaniyor..." : "Etkinlige Baglan"}
            </button>
          </div>
        </section>
      )}

      {/* Ödeme uyarısı (koşullu) */}
      {!loading && !error && !paymentApproved && (
        <div className="rounded-2xl border border-gold/30 bg-gold-light p-6 mb-8">
          <h2 className="font-display text-lg font-semibold text-amber-800">
            Odeme onayi bekleniyor
          </h2>
          <p className="mt-1 text-sm text-amber-700 leading-relaxed">
            Dugun salonu odeme onayi verdiginde bu sayfa aktif olacak.
          </p>
        </div>
      )}

      {!loading && !error && paymentApproved && summary && (
        <>
          {/* ── İstatistik Kartları ── */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Toplam Katilimci"
              value={String(summary.participantCount)}
              accent="text-sage-dark"
            />
            <StatCard label="Salon" value={summary.venueName} />
            <StatCard
              label="Etkinlik Saati"
              value={`${summary.startTime} - ${summary.endTime}`}
              accent="text-gold"
            />
          </div>

          {/* ── Ana Grid: Sol 2 + Sağ 1 ── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* SOL SÜTUN */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Aktif Etkinlik */}
              <section className="bg-cream rounded-2xl border border-soft-border overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-soft-border">
                  <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                    Etkinlik Detayi
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-foreground mt-1">
                    {summary.eventName}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {summary.eventDate} &mdash; {summary.startTime} /{" "}
                    {summary.endTime}
                  </p>
                </div>
                <div className="px-6 py-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-light text-sage-dark text-xs font-semibold px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage-dark inline-block" />
                    Odeme Onayli
                  </span>
                  <p className="text-sm text-slate-500 ml-auto">
                    Giris yapan:{" "}
                    <strong className="text-foreground">
                      Cift Kullanici
                    </strong>
                  </p>
                </div>
              </section>

              {/* Medya Kutusu (Özet) */}
              <section className="bg-cream rounded-2xl border border-soft-border overflow-hidden flex flex-col flex-grow">
                <div className="px-6 py-4 border-b border-soft-border flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Medya Kutusu
                  </h2>
                  <p className="text-xs font-medium text-slate-500 bg-sage-light/50 px-3 py-1 rounded-full">
                    {mediaItems.length} medya
                  </p>
                </div>
                <div className="p-5 flex flex-col items-center flex-grow">
                  <div className="w-full grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {mediaPreview.map((item) => (
                      <article
                        key={item.id}
                        className="overflow-hidden rounded-xl border border-soft-border bg-cream hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-28 w-full group">
                          {item.type === "PHOTO" ? (
                            <Image
                              src={resolveMediaUrl(item.url)}
                              alt={item.id}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <video
                              src={resolveMediaUrl(item.url)}
                              className="h-full w-full object-cover"
                              muted
                              playsInline
                            />
                          )}
                          {item.type === "VIDEO" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center transition-transform group-hover:scale-110">
                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-foreground ml-0.5" />
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>

                  <Link
                    href="/cift/medya"
                    className="mt-auto flex items-center justify-center w-full sm:w-auto px-10 py-3 rounded-full bg-sage text-white font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-sm group"
                  >
                    Tum Galeriyi Ac
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
                      className="ml-2 opacity-80 group-hover:translate-x-1 transition-transform"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>
              </section>
            </div>

            {/* SAĞ SÜTUN */}
            <div className="flex flex-col gap-6">
              {/* Katılımcılar */}
              <section className="bg-cream rounded-2xl border border-soft-border overflow-hidden">
                <div className="px-5 py-4 border-b border-soft-border flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Aktif Katilimcilar
                  </h2>
                </div>
                <div className="p-5 space-y-2">
                  {participantsPreview.map((user) => {
                    const totalMedia = user.uploadedPhotos + user.uploadedVideos;
                    return (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 rounded-xl bg-sage-light/30 px-3 py-2 text-sm text-foreground font-medium"
                      >
                        <div className="w-8 h-8 rounded-full bg-white border border-soft-border flex items-center justify-center text-xs font-bold text-sage-dark flex-shrink-0">
                          {user.isAnonymous ? "?" : user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm">{user.name}</p>
                          <p className="text-[10px] text-slate-500 font-normal">Giris: {user.joinedAt}</p>
                        </div>
                        {totalMedia > 0 && (
                          <span className="flex items-center gap-1 text-xs text-sage-dark bg-white border border-sage-light/50 px-2 py-1 rounded-lg font-semibold whitespace-nowrap">
                            📸 {totalMedia}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {participants.length > 5 && (
                    <div className="pt-2 text-center">
                      <p className="text-xs text-slate-500 font-medium italic">
                        + {participants.length - 5} kisi daha...
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-5 bg-sage-light/20 border-t border-soft-border">
                  <Link
                    href="/cift/katilimcilar"
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-soft-border hover:border-sage bg-white hover:bg-sage text-slate-600 hover:text-white transition-all text-sm font-medium shadow-sm group"
                  >
                    <span>Tum Kullanicilari Gör</span>
                    <span className="text-xs font-normal opacity-70 group-hover:opacity-100 mt-0.5 transition-opacity">
                      Medya yukleyenleri ve detaylari incele
                    </span>
                  </Link>
                </div>
              </section>

              {/* Etkinlik Bilgisi */}
              <section className="bg-cream rounded-2xl border border-soft-border overflow-hidden flex flex-col flex-grow">
                <div className="px-5 py-4 border-b border-soft-border">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Salon Bilgisi
                  </h2>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                      Mekan
                    </p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {summary.venueName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                      Sehir
                    </p>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {summary.venueCity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                      Paket
                    </p>
                    <p className="text-sm font-medium text-gold mt-1">
                      {summary.venuePlan}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </AppHeader>
  );
}
