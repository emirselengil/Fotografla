"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import AppHeader from "../../../components/AppHeader";
import { createEvent, getDefaultCoupleId, getDefaultVenueId, type EventResponse } from "../../../lib/salon-api";
import { getStoredUserName } from "../../../lib/auth";
import { buildInitials } from "../../../lib/user-display";

const navItems = [
  { label: "Genel Bakis", href: "/salon" },
  { label: "Etkinlikler", href: "/salon/etkinlikler" },
  { label: "QR Yonetimi", href: "/salon/qr" },
];

type EventFormData = {
  brideName: string;
  groomName: string;
  eventType: "dugun" | "nisan" | "kina" | "diger";
  date: string;
  startTime: string;
  endTime: string;
  pax: number;
  packageName: string;
  status: "planned" | "active" | "completed" | "cancelled";
  paymentApproved: boolean;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  photographerNeeded: boolean;
  notes: string;
};

const defaultForm: EventFormData = {
  brideName: "",
  groomName: "",
  eventType: "dugun",
  date: "",
  startTime: "",
  endTime: "",
  pax: 100,
  packageName: "Salon Pro",
  status: "planned",
  paymentApproved: false,
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  photographerNeeded: false,
  notes: "",
};

function toIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

export default function YeniEtkinlikPage() {
  const [form, setForm] = useState<EventFormData>(defaultForm);
  const [createdEvent, setCreatedEvent] = useState<EventResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserName] = useState(() => getStoredUserName() || "Salon");

  const coupleName = useMemo(() => {
    if (!form.groomName && !form.brideName) {
      return "";
    }
    return `${form.groomName} & ${form.brideName}`.trim();
  }, [form.brideName, form.groomName]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!coupleName || !form.date || !form.startTime || !form.endTime) {
      setError("Zorunlu alanlari doldurun.");
      return;
    }

    const venueId = getDefaultVenueId();
    const coupleId = getDefaultCoupleId();
    if (!venueId || !coupleId) {
      setError("Varsayilan venue/couple ID ayarlari eksik.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createEvent({
        venueId,
        coupleId,
        title: coupleName,
        eventType: form.eventType,
        startsAt: toIso(form.date, form.startTime),
        endsAt: toIso(form.date, form.endTime),
        paxPlanned: form.pax,
        packageName: form.packageName,
        status: form.status,
        contactName: form.contactName,
        contactPhoneE164: form.contactPhone,
        contactEmail: form.contactEmail,
        notes: form.notes,
        photographerNeeded: form.photographerNeeded,
      });

      setCreatedEvent(response);
      setForm(defaultForm);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Etkinlik olusturulamadi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppHeader name={currentUserName} initials={buildInitials(currentUserName, "S")} subtitle="Salon Yetkilisi" navItems={navItems}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Yeni Etkinlik Olustur</h1>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">Cift ve etkinlik bilgilerini doldurun.</p>
          </div>
          <Link href="/salon/etkinlikler" className="rounded-xl border border-soft-border bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Etkinliklere Don
          </Link>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-cream border border-soft-border rounded-2xl p-5 md:p-6 flex flex-col gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input value={form.groomName} onChange={(e) => setForm((prev) => ({ ...prev, groomName: e.target.value }))} placeholder="Damat Adi" required className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm" />
              <input value={form.brideName} onChange={(e) => setForm((prev) => ({ ...prev, brideName: e.target.value }))} placeholder="Gelin Adi" required className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm" />
              <input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} required className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm" />
              <input type="number" min={10} max={2000} value={form.pax} onChange={(e) => setForm((prev) => ({ ...prev, pax: Number(e.target.value) }))} className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm" />
              <input type="time" value={form.startTime} onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))} required className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm" />
              <input type="time" value={form.endTime} onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))} required className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm" />
              <input value={form.contactName} onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))} placeholder="Yetkili Kisi" required className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm" />
              <input value={form.contactPhone} onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))} placeholder="Telefon" required className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm" />
              <input type="email" value={form.contactEmail} onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))} placeholder="E-posta" required className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm md:col-span-2" />
              <textarea rows={4} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notlar" className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm md:col-span-2" />
            </div>
          </section>

          <aside className="bg-cream border border-soft-border rounded-2xl p-5 md:p-6 h-fit flex flex-col gap-5">
            <div className="rounded-xl border border-soft-border bg-white p-4 space-y-2">
              <p className="text-xs uppercase tracking-widest text-slate-400">Onizleme</p>
              <p className="font-display text-lg font-semibold text-foreground">{coupleName || "Isim girilmedi"}</p>
            </div>

            <button type="submit" disabled={isLoading} className="w-full rounded-xl bg-sage text-white text-sm font-medium py-3 hover:bg-sage-dark transition">
              {isLoading ? "Olusturuluyor..." : "Etkinligi Olustur"}
            </button>
          </aside>
        </form>

        {createdEvent && (
          <section className="rounded-2xl border border-sage-light bg-sage-light/60 p-5 md:p-6">
            <p className="text-xs uppercase tracking-widest text-sage-dark font-semibold">Etkinlik Olusturuldu</p>
            <h2 className="font-display text-xl font-semibold text-foreground mt-1">{createdEvent.title}</h2>
            <p className="text-sm text-slate-600 mt-1">{new Date(createdEvent.startsAt).toLocaleString("tr-TR")}</p>
            <Link href="/salon/etkinlikler" className="mt-4 inline-flex items-center rounded-xl bg-sage text-white text-sm font-medium px-4 py-2 hover:bg-sage-dark transition">
              Takvime Git
            </Link>
          </section>
        )}
      </div>
    </AppHeader>
  );
}
