"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import AppHeader from "../../components/AppHeader";
import { fetchVenueQrDashboard, generateVenueQr, getDefaultVenueId, type VenueQrDashboardResponse } from "../../lib/salon-api";

const navItems = [
  { label: "Genel Bakis", href: "/salon" },
  { label: "Etkinlikler", href: "/salon/etkinlikler" },
  { label: "QR Yonetimi", href: "/salon/qr" },
];

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-cream rounded-2xl p-5 border border-soft-border flex flex-col gap-1">
      <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">{label}</p>
      <p className="text-3xl font-display font-semibold text-foreground">{value}</p>
    </div>
  );
}

export default function QRYonetimiPage() {
  const [dashboard, setDashboard] = useState<VenueQrDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");

  const venueId = getDefaultVenueId();

  const load = useCallback(async () => {
    if (!venueId) {
      setError("NEXT_PUBLIC_DEFAULT_VENUE_ID ayarlanmalidir.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetchVenueQrDashboard(venueId);
      setDashboard(response);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "QR bilgileri alinamadi.");
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleGenerate = async () => {
    if (!venueId) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateVenueQr(venueId);
      setDashboard(response);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "QR olusturulamadi.");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!dashboard?.codeValue) {
        setQrImageUrl(null);
        return;
      }

      try {
        const dataUrl = await QRCode.toDataURL(dashboard.codeValue, {
          width: 720,
          margin: 1,
          color: {
            dark: "#1f2937",
            light: "#ffffff",
          },
        });

        if (!cancelled) {
          setQrImageUrl(dataUrl);
        }
      } catch {
        if (!cancelled) {
          setQrImageUrl(null);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [dashboard?.codeValue]);

  const downloadPng = () => {
    if (!qrImageUrl || !dashboard?.codeValue) {
      return;
    }

    setIsExporting(true);
    try {
      const anchor = document.createElement("a");
      anchor.href = qrImageUrl;
      anchor.download = `fotografla-qr-${dashboard.codeValue}.png`;
      anchor.click();
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPdf = () => {
    if (!qrImageUrl || !dashboard?.codeValue || !dashboard?.venueName) {
      return;
    }

    setIsExporting(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.text(dashboard.venueName, 105, 26, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.text("Fotografla Misafir Giris QR Kodu", 105, 34, { align: "center" });

      pdf.addImage(qrImageUrl, "PNG", 55, 44, 100, 100, undefined, "FAST");

      pdf.setFontSize(10);
      pdf.text(`Kod: ${dashboard.codeValue}`, 105, 150, { align: "center" });
      pdf.text("Bu kodu salon girisine ve masalara yerlestirin.", 105, 157, { align: "center" });

      pdf.save(`fotografla-qr-${dashboard.codeValue}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppHeader name={dashboard?.venueName ?? "Salon"} initials="ES" subtitle="Salon Yetkilisi" navItems={navItems}>
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">QR Kod Yonetimi</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">Mekanin resmi giris QR kodunu buradan yonetebilirsiniz.</p>
        </div>

        {loading && <p className="text-sm text-slate-500">QR bilgileri yukleniyor...</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}

        {!loading && dashboard && !dashboard.generated && (
          <div className="bg-cream border border-soft-border border-dashed rounded-3xl py-20 px-6 flex flex-col items-center justify-center text-center">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">QR Kod Henuz Olusturulmadi</h2>
            <button onClick={() => void handleGenerate()} disabled={isGenerating} className="bg-sage text-white px-8 py-3.5 rounded-full font-medium">
              {isGenerating ? "Uretiliyor..." : "Mekan QR Kodu Olustur"}
            </button>
          </div>
        )}

        {!loading && dashboard && dashboard.generated && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-cream rounded-3xl border border-soft-border p-8">
              <h3 className="font-display text-xl font-semibold text-foreground mb-1">{dashboard.venueName}</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-6">Resmi Giris Kodu</p>
              <div className="bg-white p-4 rounded-xl border border-soft-border mb-4 flex items-center justify-center min-h-[230px]">
                {qrImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrImageUrl} alt="Salon QR" className="w-56 h-56 object-contain" />
                ) : (
                  <p className="text-sm text-slate-500">QR gorseli hazirlaniyor...</p>
                )}
              </div>
              <div className="bg-white p-4 rounded-xl border border-soft-border mb-4">
                <p className="text-sm text-slate-500">QR Kod Degeri</p>
                <p className="font-mono text-foreground mt-1 break-all">{dashboard.codeValue}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={downloadPdf}
                  disabled={!qrImageUrl || isExporting}
                  className="rounded-xl border border-soft-border bg-white text-slate-700 text-sm font-medium py-2.5 hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  PDF Indir
                </button>
                <button
                  onClick={downloadPng}
                  disabled={!qrImageUrl || isExporting}
                  className="rounded-xl border border-soft-border bg-white text-slate-700 text-sm font-medium py-2.5 hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  PNG Indir
                </button>
              </div>
              <button onClick={() => void handleGenerate()} disabled={isGenerating} className="w-full rounded-xl bg-sage text-white text-sm font-medium py-2.5 hover:bg-sage-dark transition">
                {isGenerating ? "Yenileniyor..." : "QR Yenile"}
              </button>
            </section>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <StatBox label="Toplam Okutulma" value={dashboard.totalScans} />
                <StatBox label="Bugun Okutulma" value={dashboard.scansToday} />
                <StatBox label="Olusan Album" value={dashboard.albumCount} />
                <StatBox label="Kullanim Orani" value={`%${dashboard.usageRatePercent}`} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppHeader>
  );
}
