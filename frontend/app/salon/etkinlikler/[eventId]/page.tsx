"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppHeader from "../../../components/AppHeader";
import { fetchEventDetail, updateEventPaymentStatus, type EventResponse } from "../../../lib/salon-api";
import { getStoredUserName } from "../../../lib/auth";
import { buildInitials } from "../../../lib/user-display";

const navItems = [
  { label: "Genel Bakis", href: "/salon" },
  { label: "Etkinlikler", href: "/salon/etkinlikler" },
  { label: "QR Yonetimi", href: "/salon/qr" },
];

function paymentStatusLabel(status: string): string {
  if (status === "approved") return "Onaylandi";
  if (status === "rejected") return "Reddedildi";
  if (status === "refunded") return "Iade";
  return "Beklemede";
}

export default function SalonEtkinlikDetayPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const [eventDetail, setEventDetail] = useState<EventResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [error, setError] = useState("");
  const [currentUserName] = useState(() => getStoredUserName() || "Salon");

  const loadDetail = async () => {
    if (!eventId) {
      setError("Etkinlik ID bulunamadi.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchEventDetail(eventId);
      setEventDetail(response);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Etkinlik detaylari alinamadi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDetail();
  }, [eventId]);

  const handlePayment = async (paymentStatus: "approved" | "rejected") => {
    if (!eventDetail) {
      return;
    }

    setIsUpdatingPayment(true);
    try {
      const response = await updateEventPaymentStatus(eventDetail.id, paymentStatus);
      setEventDetail(response);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Odeme durumu guncellenemedi.");
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  return (
    <AppHeader name={currentUserName} initials={buildInitials(currentUserName, "S")} subtitle="Salon Yetkilisi" navItems={navItems}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Etkinlik Detayi</h1>
            <p className="mt-2 text-sm text-slate-500">Etkinlik bilgileri ve odeme onay islemleri.</p>
          </div>
          <Link href="/salon/etkinlikler" className="rounded-xl border border-soft-border bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Etkinliklere Don
          </Link>
        </div>

        {isLoading && <p className="text-sm text-slate-500">Etkinlik detayi yukleniyor...</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}

        {!isLoading && eventDetail && (
          <section className="rounded-2xl border border-soft-border bg-cream p-6 md:p-7">
            <h2 className="font-display text-2xl font-semibold text-foreground">{eventDetail.title}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {new Date(eventDetail.startsAt).toLocaleDateString("tr-TR")} - {new Date(eventDetail.startsAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
              {" "} / {new Date(eventDetail.endsAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-soft-border bg-white p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Etkinlik Kodu</p>
                <p className="mt-1 text-sm font-semibold text-sage-dark">{eventDetail.accessCode}</p>
              </div>
              <div className="rounded-xl border border-soft-border bg-white p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Durum</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{eventDetail.status.toUpperCase()}</p>
              </div>
              <div className="rounded-xl border border-soft-border bg-white p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Odeme</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{paymentStatusLabel(eventDetail.paymentStatus)}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={isUpdatingPayment}
                onClick={() => void handlePayment("approved")}
                className="rounded-xl bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sage-dark disabled:opacity-60"
              >
                {isUpdatingPayment ? "Isleniyor..." : "Odemeyi Onayla"}
              </button>
              <button
                type="button"
                disabled={isUpdatingPayment}
                onClick={() => void handlePayment("rejected")}
                className="rounded-xl border border-soft-border bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                Odemeyi Reddet
              </button>
            </div>
          </section>
        )}
      </div>
    </AppHeader>
  );
}
