import Image from "next/image";
import Link from "next/link";
import { couple, mediaItems, venue } from "../mock-data";

const participants = [
  "Emir Selengil",
  "Saliha Goray",
  "Ayse K.",
  "Can T.",
  "Merve Y.",
];

export default function CiftPage() {
  return (
    <div className="mx-auto w-full max-w-7xl p-6 md:p-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Fotografla / Cift Paneli</p>
          <h1 className="text-3xl font-bold tracking-tight">{couple.eventName}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Giris yapan: <strong>{couple.loggedInAs}</strong>
          </p>
        </div>
        <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
          Cikis Yap
        </Link>
      </div>

      {!couple.paymentApproved ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-900">Odeme onayi bekleniyor</h2>
          <p className="mt-1 text-sm text-amber-800">
            Dugun salonu odeme onayi verdiginde bu sayfa aktif olacak.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Toplam Katilimci</p>
            <p className="mt-2 text-3xl font-bold">{couple.participantCount}</p>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Salon</p>
            <p className="mt-2 text-xl font-semibold">{venue.name}</p>
          </section>
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Etkinlik Saati</p>
            <p className="mt-2 text-xl font-semibold">
              {couple.startTime} - {couple.endTime}
            </p>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:col-span-1">
            <h2 className="text-lg font-semibold">Katilimci Isimleri</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {participants.map((name) => (
                <li key={name} className="rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                  {name}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Medya Kutusu</h2>
              <div className="flex flex-wrap gap-2 text-sm">
                <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-white">Tum Medya</button>
                <button className="rounded-lg border border-slate-300 px-3 py-1.5">Foto</button>
                <button className="rounded-lg border border-slate-300 px-3 py-1.5">Video</button>
                <button className="rounded-lg border border-slate-300 px-3 py-1.5">Tarihe Gore</button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mediaItems.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-xl ring-1 ring-slate-200">
                  <div className="relative h-36 w-full">
                    <Image src={item.url} alt={item.id} fill className="object-cover" />
                  </div>
                  <div className="p-3 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">
                      {item.type === "photo" ? "Fotograf" : "Video"}
                    </p>
                    <p>
                      {item.uploaderName} - {item.uploadedAt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
