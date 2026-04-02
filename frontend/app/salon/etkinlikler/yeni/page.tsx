"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import AppHeader from "../../../components/AppHeader";
import { venue, WeddingEvent } from "../../../mock-data";

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
  status: WeddingEvent["status"];
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

function InputLabel({ htmlFor, label }: { htmlFor: string; label: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-slate-600">
      {label}
    </label>
  );
}

export default function YeniEtkinlikPage() {
  const [form, setForm] = useState<EventFormData>(defaultForm);
  const [createdEvent, setCreatedEvent] = useState<WeddingEvent | null>(null);

  const coupleName = useMemo(() => {
    if (!form.groomName && !form.brideName) {
      return "";
    }
    return `${form.groomName} & ${form.brideName}`.trim();
  }, [form.brideName, form.groomName]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!coupleName || !form.date || !form.startTime || !form.endTime) {
      return;
    }

    const nextEvent: WeddingEvent = {
      id: `e-${Date.now()}`,
      coupleName,
      date: new Date(form.date).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      startTime: form.startTime,
      endTime: form.endTime,
      pax: form.pax,
      status: form.status,
      packageName: form.packageName,
      paymentApproved: form.paymentApproved,
    };

    try {
      const saved = localStorage.getItem("salon-created-events");
      const parsed = saved ? (JSON.parse(saved) as WeddingEvent[]) : [];
      localStorage.setItem("salon-created-events", JSON.stringify([nextEvent, ...parsed]));
    } catch {
      // Keep UX stable even if storage is not available.
    }

    setCreatedEvent(nextEvent);
    setForm(defaultForm);
  };

  return (
    <AppHeader name={venue.name} initials="ES" subtitle="Salon Yetkilisi" navItems={navItems}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Yeni Etkinlik Olustur
            </h1>
            <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">
              Cifte ait tum bilgileri doldurun, etkinligi olusturun ve takvime ekleyin.
            </p>
          </div>
          <Link
            href="/salon/etkinlikler"
            className="rounded-xl border border-soft-border bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Etkinliklere Don
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 bg-cream border border-soft-border rounded-2xl p-5 md:p-6 flex flex-col gap-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Etkinlik Bilgileri</h2>
              <p className="text-sm text-slate-500 mt-1">Temel tarih, saat ve durum ayarlari.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <InputLabel htmlFor="groomName" label="Damat Adi" />
                <input
                  id="groomName"
                  value={form.groomName}
                  onChange={(e) => setForm((prev) => ({ ...prev, groomName: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <InputLabel htmlFor="brideName" label="Gelin Adi" />
                <input
                  id="brideName"
                  value={form.brideName}
                  onChange={(e) => setForm((prev) => ({ ...prev, brideName: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <InputLabel htmlFor="eventType" label="Etkinlik Tipi" />
                <select
                  id="eventType"
                  value={form.eventType}
                  onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value as EventFormData["eventType"] }))}
                  className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                >
                  <option value="dugun">Dugun</option>
                  <option value="nisan">Nisan</option>
                  <option value="kina">Kina</option>
                  <option value="diger">Diger</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <InputLabel htmlFor="pax" label="Davetli Sayisi" />
                <input
                  id="pax"
                  type="number"
                  min={10}
                  max={2000}
                  value={form.pax}
                  onChange={(e) => setForm((prev) => ({ ...prev, pax: Number(e.target.value) }))}
                  className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <InputLabel htmlFor="date" label="Etkinlik Tarihi" />
                <input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <InputLabel htmlFor="startTime" label="Baslangic" />
                  <input
                    id="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <InputLabel htmlFor="endTime" label="Bitis" />
                  <input
                    id="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    required
                    className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <InputLabel htmlFor="packageName" label="Paket" />
                <select
                  id="packageName"
                  value={form.packageName}
                  onChange={(e) => setForm((prev) => ({ ...prev, packageName: e.target.value }))}
                  className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                >
                  <option>Salon Basic</option>
                  <option>Salon Pro</option>
                  <option>Salon Plus</option>
                  <option>Salon Elite</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <InputLabel htmlFor="status" label="Durum" />
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as WeddingEvent["status"] }))}
                  className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                >
                  <option value="planned">Planlandi</option>
                  <option value="active">Aktif</option>
                  <option value="completed">Tamamlandi</option>
                  <option value="cancelled">Iptal</option>
                </select>
              </div>
            </div>

            <div className="h-px bg-soft-border" />

            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Iletisim Bilgileri</h2>
              <p className="text-sm text-slate-500 mt-1">Cift ile iletisim kurulacak bilgiler.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <InputLabel htmlFor="contactName" label="Yetkili Kisi" />
                <input
                  id="contactName"
                  value={form.contactName}
                  onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <InputLabel htmlFor="contactPhone" label="Telefon" />
                <input
                  id="contactPhone"
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <InputLabel htmlFor="contactEmail" label="E-posta" />
                <input
                  id="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  required
                  className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <InputLabel htmlFor="notes" label="Notlar" />
              <textarea
                id="notes"
                rows={4}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Masa duzeni, ozel talepler, repertuvar notlari..."
                className="w-full rounded-xl border border-soft-border bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
              />
            </div>
          </section>

          <aside className="bg-cream border border-soft-border rounded-2xl p-5 md:p-6 h-fit flex flex-col gap-5">
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">Onizleme</h3>
              <p className="text-sm text-slate-500 mt-1">Kayit edilmeden once etkinlik ozetini kontrol edin.</p>
            </div>

            <div className="rounded-xl border border-soft-border bg-white p-4 space-y-2">
              <p className="text-xs uppercase tracking-widest text-slate-400">Cift</p>
              <p className="font-display text-lg font-semibold text-foreground">
                {coupleName || "Isim girilmedi"}
              </p>
              <p className="text-sm text-slate-500">
                {form.date || "Tarih secilmedi"} | {form.startTime || "--:--"} - {form.endTime || "--:--"}
              </p>
              <p className="text-sm text-slate-500">{form.pax} davetli</p>
            </div>

            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.paymentApproved}
                onChange={(e) => setForm((prev) => ({ ...prev, paymentApproved: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-soft-border text-sage focus:ring-sage"
              />
              Odeme onayi alindi
            </label>

            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.photographerNeeded}
                onChange={(e) => setForm((prev) => ({ ...prev, photographerNeeded: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-soft-border text-sage focus:ring-sage"
              />
              Fotograf ve video ekibi talep edildi
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-sage text-white text-sm font-medium py-3 hover:bg-sage-dark transition"
            >
              Etkinligi Olustur
            </button>

            <button
              type="button"
              onClick={() => setForm(defaultForm)}
              className="w-full rounded-xl border border-soft-border bg-white text-slate-600 text-sm font-medium py-3 hover:bg-slate-50 transition"
            >
              Formu Temizle
            </button>
          </aside>
        </form>

        {createdEvent && (
          <section className="rounded-2xl border border-sage-light bg-sage-light/60 p-5 md:p-6">
            <p className="text-xs uppercase tracking-widest text-sage-dark font-semibold">Etkinlik Olusturuldu</p>
            <h2 className="font-display text-xl font-semibold text-foreground mt-1">
              {createdEvent.coupleName}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {createdEvent.date} | {createdEvent.startTime} - {createdEvent.endTime} | {createdEvent.pax} davetli
            </p>
            <p className="text-sm text-slate-600 mt-0.5">
              Paket: {createdEvent.packageName} | Odeme: {createdEvent.paymentApproved ? "Onayli" : "Beklemede"}
            </p>
            <Link
              href="/salon/etkinlikler"
              className="mt-4 inline-flex items-center rounded-xl bg-sage text-white text-sm font-medium px-4 py-2 hover:bg-sage-dark transition"
            >
              Takvime Git
            </Link>
          </section>
        )}
      </div>
    </AppHeader>
  );
}
