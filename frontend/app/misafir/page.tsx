"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { couple, venue } from "../mock-data";

export default function MisafirPage() {
  const [name, setName] = useState("");
  const [step, setStep] = useState<"name" | "upload">("name");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);

  const onContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep("upload");
  };

  const onUpload = () => {
    if (selectedFiles.length === 0) return;
    setUploadedCount((prev) => prev + selectedFiles.length);
    setSelectedFiles([]);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col p-6 md:p-10">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">Fotografla / Misafir Akisi (QR)</p>
        <Link href="/" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white">
          Ana sayfa
        </Link>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-medium text-slate-500">Salon</p>
        <h1 className="text-2xl font-bold">{venue.name}</h1>
        <p className="mt-1 text-sm text-slate-600">Aktif Etkinlik: {couple.eventName}</p>
      </section>

      {step === "name" ? (
        <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold">Hos geldiniz</h2>
          <p className="mt-1 text-sm text-slate-600">
            Isim girisi istege baglidir. Bos birakip devam edebilirsiniz.
          </p>
          <form onSubmit={onContinue} className="mt-4 space-y-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Isminiz (opsiyonel)"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-sky-300 focus:ring"
            />
            <button className="w-full rounded-xl bg-sky-600 px-4 py-3 font-medium text-white">
              Devam Et
            </button>
          </form>
        </section>
      ) : (
        <section className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Galeriye Medya Yukle</h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              {name ? `${name} olarak devam` : "Isimsiz devam"}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Bir veya birden fazla medya secin. Sunucu, daha once eklenmis olanlari filtreler.
          </p>

          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4">
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
              className="w-full text-sm"
            />
            <p className="mt-2 text-xs text-slate-500">
              Secilen dosya: {selectedFiles.length}
            </p>
          </div>

          <button
            onClick={onUpload}
            className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white"
          >
            Yukle
          </button>
          <p className="mt-2 text-center text-sm text-slate-600">
            Bu oturumda yuklenen medya: {uploadedCount}
          </p>
        </section>
      )}
    </div>
  );
}
