"use client";

import { useCallback, useEffect, useState } from "react";
import AppHeader from "../../components/AppHeader";
import {
  fetchVenueQrDashboard,
  fetchVenueQrCardPngBlob,
  fetchVenueQrPdfBlob,
  fetchVenueQrPngBlob,
  generateVenueQr,
  type VenueQrDashboardResponse,
} from "../../lib/salon-api";
import { fetchMySalonProfile } from "../../lib/profile-api";
import { useHydrationSafeDisplayName } from "../../lib/use-hydration-safe-display-name";
import { buildInitials } from "../../lib/user-display";

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
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [venueId, setVenueId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useHydrationSafeDisplayName("Salon");
  const [qrTargetUrl, setQrTargetUrl] = useState<string | null>(null);

  const guestPortalBaseUrl = (process.env.NEXT_PUBLIC_GUEST_PORTAL_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "").trim();

  useEffect(() => {
    if (!dashboard?.codeValue) {
      setQrTargetUrl(null);
      return;
    }
    const base = (guestPortalBaseUrl || window.location.origin).replace(/\/$/, "");
    setQrTargetUrl(`${base}/misafir?salon=${encodeURIComponent(dashboard.codeValue)}`);
  }, [dashboard?.codeValue, guestPortalBaseUrl]);

  const load = useCallback(async () => {
    if (!venueId) {
      setError("Aktif kullaniciya ait salon bulunamadi.");
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
    void load();
  }, [venueId, load]);

  useEffect(() => {
    if (!venueId || !dashboard?.generated) {
      setQrPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const blob = await fetchVenueQrPngBlob(venueId);
        if (cancelled) {
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setQrPreviewUrl((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev);
          }
          return objectUrl;
        });
      } catch {
        if (!cancelled) {
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
  }, [venueId, dashboard?.generated]);

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

  const downloadPng = async () => {
    if (!venueId || !dashboard?.codeValue) {
      return;
    }

    setIsExporting(true);
    try {
      const blob = await fetchVenueQrCardPngBlob(venueId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `fotografla-salon-qr-kart-${dashboard.codeValue}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "PNG indirilemedi.");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadPdf = async () => {
    if (!venueId || !dashboard?.codeValue) {
      return;
    }

    setIsExporting(true);
    try {
      const blob = await fetchVenueQrPdfBlob(venueId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `fotografla-salon-qr.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "PDF indirilemedi.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppHeader name={currentUserName} initials={buildInitials(currentUserName, "S")} subtitle="Salon Yetkilisi" navItems={navItems}>
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">QR Kod Yonetimi</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">
            QR icerigi sunucuda uretilir ve veritabanindaki salon kodunuzla eslesir. Canlida misafir linki icin backend ortaminda{" "}
            <code className="text-xs bg-sage-light/40 px-1 rounded">GUEST_PORTAL_BASE_URL</code> kullanin.
          </p>
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
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-6">Resmi Giris Kodu (sunucu)</p>
              <div className="bg-white p-4 rounded-xl border border-soft-border mb-4 flex items-center justify-center min-h-[230px]">
                {qrPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrPreviewUrl} alt="Salon QR" className="w-56 h-56 object-contain" />
                ) : (
                  <p className="text-sm text-slate-500">QR gorseli yukleniyor...</p>
                )}
              </div>
              <div className="bg-white p-4 rounded-xl border border-soft-border mb-4">
                <p className="text-sm text-slate-500">QR Kod Degeri</p>
                <p className="font-mono text-foreground mt-1 break-all">{dashboard.codeValue}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-soft-border mb-4">
                <p className="text-sm text-slate-500">Yonlendirme URL</p>
                <p className="font-mono text-foreground mt-1 break-all">{qrTargetUrl ?? "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => void downloadPdf()}
                  disabled={isExporting}
                  className="rounded-xl border border-soft-border bg-white text-slate-700 text-sm font-medium py-2.5 hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  PDF Indir
                </button>
                <button
                  onClick={() => void downloadPng()}
                  disabled={isExporting}
                  className="rounded-xl border border-soft-border bg-white text-slate-700 text-sm font-medium py-2.5 hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  PNG Indir
                </button>
              </div>
              <p className="text-xs text-slate-500 text-center">
                Her salon icin tek QR kodu uretilir; baski materyalleriniz bu kodla uyumlu kalir.
              </p>
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
