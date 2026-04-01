"use client";

import { useState, useRef, useCallback, useEffect, type DragEvent, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { venue, mockEvents, type WeddingEvent } from "../mock-data";
import AppHeader from "../components/AppHeader";

/* ── Geçerli Mock Salon Kodları ─────────────────────────── */
/* QR kod salona özeldir, etkinliğe değil.
   Okutulduğunda sistem o salonun takviminde aktif olan etkinliği bulur. */
const VALID_SALON_CODES = ["eskisehir-dugun-salonu", "fotografla", "demo"];

/* ── Aktif etkinliği bul ────────────────────────────────── */
function findActiveEvent(): WeddingEvent | null {
  return mockEvents.find((e) => e.status === "active") ?? null;
}

/* ── Çift isimlerini ayır ("Emir Selengil & Saliha Goray" → [groom, bride]) ── */
function parseCoupleName(coupleName: string): { groomName: string; brideName: string } {
  const parts = coupleName.split(" & ");
  return {
    groomName: parts[0]?.trim() ?? "Damat",
    brideName: parts[1]?.trim() ?? "Gelin",
  };
}

/* ── Yardımcı: Dosya boyutu formatlama ──────────────────── */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Dekoratif SVG Bileşenleri ──────────────────────────── */
function FloralCornerTopLeft() {
  return (
    <svg className="absolute top-0 left-0 w-28 h-28 text-sage opacity-[0.07] pointer-events-none" viewBox="0 0 120 120" fill="none">
      <path d="M0 0 C20 40 50 60 120 60 C60 50 40 20 0 0Z" fill="currentColor" />
      <path d="M0 0 C40 20 60 50 60 120 C50 60 20 40 0 0Z" fill="currentColor" />
      <circle cx="30" cy="30" r="4" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

/* ── Kilit İkonu (Erişim Engellendi) ────────────────────── */
function LockIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sage">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

/* ── Kamera İkonu ───────────────────────────────────────── */
function CameraIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

/* ── Başarı Animasyonu (Confetti-like) ──────────────────── */
function SuccessAnimation({ count }: { count: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 animate-[fadeScaleIn_0.5s_ease-out]">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-sage/10 flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-sage animate-[drawCheck_0.4s_ease-out_0.3s_both]">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      <h3 className="font-display text-2xl font-semibold text-foreground">
        🎉 Başarıyla Yüklendi!
      </h3>
      <p className="text-slate-500 text-sm">
        <span className="font-semibold text-sage-dark">{count} medya</span> düğün albümüne eklendi.
      </p>
    </div>
  );
}

/* ── Dosya Önizleme Kartı ───────────────────────────────── */
function FilePreviewCard({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const isVideo = file.type.startsWith("video/");

  useEffect(() => {
    if (!isVideo) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file, isVideo]);

  return (
    <div className="group relative bg-white rounded-xl border border-soft-border overflow-hidden shadow-sm animate-[fadeSlideUp_0.3s_ease-out] hover:shadow-md transition-shadow">
      <div className="aspect-square bg-cream flex items-center justify-center overflow-hidden">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-sage">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <span className="text-xs font-medium text-sage-dark">🎬 Video</span>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium text-foreground truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">{formatFileSize(file.size)}</p>
      </div>
      <button
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity text-xs font-bold"
        aria-label="Kaldır"
      >
        ✕
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ANA BİLEŞEN — Misafir Fotoğraf Yükleme Sayfası
   ════════════════════════════════════════════════════════════ */
function MisafirYuklemeContent() {
  const searchParams = useSearchParams();
  const salonCode = searchParams.get("salon");
  const isAuthorized = salonCode !== null && VALID_SALON_CODES.includes(salonCode);

  const activeEvent = findActiveEvent();

  const [step, setStep] = useState<"welcome" | "upload">("welcome");
  const [name, setName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastUploadCount, setLastUploadCount] = useState(0);
  const [totalUploaded, setTotalUploaded] = useState({ photos: 0, videos: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJoin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep("upload");
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    setSelectedFiles((prev) => [...prev, ...arr]);
    setShowSuccess(false);
  }, []);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);
    setShowSuccess(false);

    const totalSteps = 20;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      setUploadProgress(Math.round((currentStep / totalSteps) * 100));

      if (currentStep >= totalSteps) {
        clearInterval(interval);

        const photos = selectedFiles.filter((f) => f.type.startsWith("image/")).length;
        const videos = selectedFiles.filter((f) => f.type.startsWith("video/")).length;

        setTotalUploaded((prev) => ({
          photos: prev.photos + photos,
          videos: prev.videos + videos,
        }));
        setLastUploadCount(selectedFiles.length);
        setSelectedFiles([]);
        setIsUploading(false);
        setUploadProgress(0);
        setShowSuccess(true);
      }
    }, 80);
  };

  const headerInitials = name ? name.charAt(0).toUpperCase() : "A";
  const headerName = !isAuthorized 
    ? "Erişim Kısıtlı" 
    : (!activeEvent ? "Misafir Portalı" : activeEvent.coupleName);
  const headerSubtitle = !isAuthorized 
    ? "Lütfen QR kodu okutun" 
    : (!activeEvent ? venue.name : `${venue.name} — ${activeEvent.date}`);

  return (
    <AppHeader
      name={headerName}
      subtitle={headerSubtitle}
      initials={headerInitials}
      navItems={[]}
      hideProfile={true}
    >
      {!isAuthorized && (
        <div className="max-w-md mx-auto mt-10">
          <section className="bg-cream rounded-2xl border border-soft-border p-10 text-center relative overflow-hidden animate-[fadeSlideUp_0.5s_ease-out]">
            <FloralCornerTopLeft />
            <div className="mx-auto w-24 h-24 rounded-full bg-sage-light/50 flex items-center justify-center mb-6 relative z-10">
              <LockIcon />
            </div>
            <h1 className="font-display text-2xl font-semibold text-foreground mb-3 relative z-10">
              Erişim Kısıtlı
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 relative z-10">
              Bu sayfaya yalnızca düğün mekanındaki <strong className="text-sage-dark">QR kodu okutarak</strong> erişebilirsiniz.
            </p>
          </section>
        </div>
      )}

      {isAuthorized && !activeEvent && (
        <div className="max-w-md mx-auto mt-10">
          <section className="bg-cream rounded-2xl border border-soft-border p-10 text-center relative overflow-hidden animate-[fadeSlideUp_0.5s_ease-out]">
            <FloralCornerTopLeft />
            <div className="mx-auto w-24 h-24 rounded-full bg-gold-light flex items-center justify-center mb-6 relative z-10">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-semibold text-foreground mb-3 relative z-10">
              Şu An Aktif Etkinlik Yok
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-4 relative z-10">
              Takvimde şu anda devam eden bir düğün etkinliği bulunmamaktadır.
            </p>
          </section>
        </div>
      )}

      {isAuthorized && activeEvent && step === "welcome" && (
        <div className="max-w-md mx-auto mt-10">
          <section className="bg-cream rounded-2xl border border-soft-border p-8 md:p-10 text-center relative overflow-hidden animate-[fadeSlideUp_0.6s_ease-out]">
            <FloralCornerTopLeft />
            
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                Hoş Geldiniz
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-8">
                Çektiğiniz fotoğraf ve videoları düğün albümüne ekleyerek bu özel güne katkıda bulunabilirsiniz. 📸
              </p>

              <form onSubmit={handleJoin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">İsminiz (opsiyonel)</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full rounded-xl border border-soft-border bg-white px-4 py-3 text-sm outline-none focus:border-sage transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-sage hover:bg-sage-dark text-white px-6 py-3.5 rounded-xl font-medium text-sm transition-all shadow-sm flex justify-center items-center gap-2 mt-4"
                >
                  <CameraIcon className="w-5 h-5" />
                  Galeriye Katıl
                </button>
              </form>
            </div>
          </section>
        </div>
      )}

      {isAuthorized && activeEvent && step === "upload" && (
        <div className="grid gap-6 lg:grid-cols-3 animate-[fadeSlideUp_0.4s_ease-out]">
          
          {/* Sol Kolon - Sürükle Bırak ve Önizleme */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {showSuccess && (
              <section className="bg-cream rounded-2xl border border-soft-border p-4">
                 <SuccessAnimation count={lastUploadCount} />
              </section>
            )}

            {/* Sürükle & Bırak */}
            <section
              className={`
                bg-cream rounded-2xl border-2 border-dashed p-10 flex flex-col items-center justify-center text-center
                transition-all duration-300 cursor-pointer min-h-[250px]
                ${isDragOver ? "border-sage bg-sage-light/30" : "border-soft-border hover:border-sage hover:bg-sage-light/10"}
              `}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-soft-border flex items-center justify-center mb-4">
                <CameraIcon className="w-8 h-8 text-sage" />
              </div>
              <p className="text-base font-medium text-foreground mb-1">
                {isDragOver ? "Şimdi bırakın!" : "Fotoğraf veya video ekleyin"}
              </p>
              <p className="text-sm text-slate-400">
                Dokunarak seçin veya buraya sürükleyin
              </p>
            </section>

            {/* Seçilen Dosyalar */}
            {selectedFiles.length > 0 && (
              <section className="bg-cream rounded-2xl border border-soft-border p-6">
                <div className="flex items-center justify-between mb-4 border-b border-soft-border pb-3">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Seçilen Dosyalar ({selectedFiles.length})
                  </h3>
                  <button onClick={() => setSelectedFiles([])} className="text-sm text-rose-500 hover:underline">
                    Tümünü Temizle
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedFiles.map((file, index) => (
                    <FilePreviewCard
                      key={`${file.name}-${file.lastModified}-${index}`}
                      file={file}
                      onRemove={() => handleRemoveFile(index)}
                    />
                  ))}
                </div>
              </section>
            )}
            
            {/* İpucu */}
            {selectedFiles.length === 0 && !showSuccess && (
              <section className="bg-sage-light/30 rounded-2xl border border-sage/20 p-5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-sage-dark mb-1">İpucu</p>
                  <p className="text-sm text-slate-600">
                    Birden fazla fotoğraf ve videoları aynı anda seçebilirsiniz. Yüklediğiniz medyalar anında düğün albümüne dahil edilir.
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Sağ Kolon - İşlemler & Durum */}
          <div className="flex flex-col gap-6">
            
            <section className="bg-cream rounded-2xl border border-soft-border overflow-hidden">
              <div className="px-5 py-4 border-b border-soft-border">
                <h2 className="font-display text-lg font-semibold text-foreground">İşlem</h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Seçilen Dosya:</span>
                  <span className="font-medium text-foreground">{selectedFiles.length} adet</span>
                </div>
                
                <button
                  onClick={handleUpload}
                  disabled={isUploading || selectedFiles.length === 0}
                  className="w-full bg-sage hover:bg-sage-dark text-white font-medium py-3 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isUploading ? `Yükleniyor... %${uploadProgress}` : "Medyaları Yükle"}
                </button>
                
                {isUploading && (
                  <div className="w-full bg-sage-light rounded-full h-2 mt-2">
                    <div className="bg-sage-dark h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>
            </section>

            <section className="bg-cream rounded-2xl border border-soft-border overflow-hidden">
              <div className="px-5 py-4 border-b border-soft-border">
                <h2 className="font-display text-lg font-semibold text-foreground">Oturum Bilgisi</h2>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between border-b border-soft-border pb-2">
                  <span className="text-slate-500">Misafir İsmi:</span>
                  <span className="font-medium">{name || "Anonim"}</span>
                </div>
                <div className="flex justify-between border-b border-soft-border pb-2">
                  <span className="text-slate-500">Yüklenen Fotoğraf:</span>
                  <span className="font-medium">{totalUploaded.photos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Yüklenen Video:</span>
                  <span className="font-medium">{totalUploaded.videos}</span>
                </div>
              </div>
            </section>

          </div>
        </div>
      )}
    </AppHeader>
  );
}

/* ── Suspense Wrapper (useSearchParams için) ────────────── */
export default function MisafirPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MisafirYuklemeContent />
    </Suspense>
  );
}
