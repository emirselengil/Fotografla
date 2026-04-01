"use client";

import { useState } from "react";
import AppHeader from "../../components/AppHeader";
import { venue } from "../../mock-data";

/* ── Navigasyon ─────────────────────────────────────────── */
const navItems = [
  { label: "Genel Bakis", href: "/salon" },
  { label: "Etkinlikler", href: "/salon/etkinlikler" },
  { label: "QR Yonetimi", href: "/salon/qr" },
];

/* ── QR Kodu (SVG Görseli) ─────────────────────────────────────────── */
function PlaceholderQRCode() {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" className="text-foreground" fill="currentColor">
      {/* Basit bir yapay QR kodu deseni */}
      <rect x="10" y="10" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="70" y="10" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="10" y="70" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="4" />
      <rect x="15" y="15" width="10" height="10" />
      <rect x="75" y="15" width="10" height="10" />
      <rect x="15" y="75" width="10" height="10" />
      
      {/* Karmaşık iç mozaik yapı */}
      <path d="M40 10 h20 M40 15 h10 M55 15 h5 M40 20 h20 M45 25 h15 M40 30 h5 M50 30 h10 M10 40 h20 M15 45 h10 M10 50 h5 M20 50 h10 M10 55 h20 M40 40 h20 M45 45 h10 M40 50 h20 M40 55 h5 M50 55 h10 M70 40 h20 M75 45 h5 M85 45 h5 M70 50 h15 M70 55 h20 M40 70 h20 M45 75 h15 M40 80 h5 M50 80 h10 M40 85 h20 M70 70 h5 M80 70 h10 M70 75 h15 M75 80 h10 M70 85 h20" stroke="currentColor" strokeWidth="3" fill="none"/>
    </svg>
  );
}

/* ── Sayfa Bileşeni ─────────────────────────────────────────── */
export default function QRYonetimiPage() {
  // Mock verideki duruma göre başlangıç durumu belirliyoruz
  const [isQrGenerated, setIsQrGenerated] = useState((venue.qrStatus as string) === "created");

  // QR Üretme animasyon simülasyonu
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsQrGenerated(true);
    }, 1500); // 1.5 saniye animasyon bekleme süresi
  };

  /* İstatistik Kartı Yardımcı Bileşeni */
  const StatBox = ({ label, value }: { label: string; value: string | number }) => (
    <div className="bg-cream rounded-2xl p-5 border border-soft-border flex flex-col gap-1">
      <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">{label}</p>
      <p className="text-3xl font-display font-semibold text-foreground">{value}</p>
    </div>
  );

  return (
    <AppHeader
      name={venue.name}
      initials="ES"
      subtitle="Salon Yetkilisi"
      navItems={navItems}
    >
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
        {/* Başlık Alanı */}
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">
            QR Kod Yönetimi
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">
            Misafirlerin uygulamaya erişimini sağlamak için masalara ve girişe yerleştireceğiniz etkinlik QR kodunu buradan yönetebilirsiniz.
          </p>
        </div>

        {/* --- DURUM 1: HENÜZ OLUŞTURULMADI --- */}
        {!isQrGenerated && (
          <div className="bg-cream border border-soft-border border-dashed rounded-3xl py-24 px-6 flex flex-col items-center justify-center text-center transition-all duration-500">
            <div className="w-24 h-24 mb-6 rounded-2xl bg-white border border-soft-border shadow-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-sage-light">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <rect x="7" y="7" width="3" height="3"></rect>
                <rect x="14" y="7" width="3" height="3"></rect>
                <rect x="7" y="14" width="3" height="3"></rect>
                <rect x="14" y="14" width="3" height="3"></rect>
              </svg>
            </div>
            
            <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
              QR Kod Henüz Üretilmedi
            </h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed text-sm">
              Salonunuz için kalıcı giriş QR kodunu tek tuşla üretebilirsiniz. <br/>
              Masa standı formatında çıktı alıp hemen kullanıma başlayın.
            </p>
            
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="group relative flex items-center gap-3 bg-sage hover:bg-sage-dark text-white px-8 py-3.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-80 disabled:cursor-not-allowed overflow-hidden"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Üretiliyor...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
                  <span>Mekan QR Kodu Oluştur</span>
                </>
              )}
              {/* Animasyonlu parlama efekti */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            </button>
          </div>
        )}

        {/* --- DURUM 2: AKTİF (YÖNETİM PANELİ) --- */}
        {isQrGenerated && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* SOL SÜTUN: Görsel ve İndirmeler */}
            <div className="flex flex-col gap-6">
              
              {/* QR Önizleme Çerçevesi */}
              <section className="bg-cream rounded-3xl border border-soft-border p-8 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                {/* Dekoratif Köşeler */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-gold/40 rounded-tl-xl" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-gold/40 rounded-tr-xl" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-gold/40 rounded-bl-xl" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-gold/40 rounded-br-xl" />

                <h3 className="font-display text-xl font-semibold text-foreground mb-1 z-10">
                  {venue.name}
                </h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-8 z-10">Resmi Giriş Kodu</p>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-soft-border mb-6 z-10 w-48 h-48">
                  <PlaceholderQRCode />
                </div>
                
                <p className="text-sm font-medium text-sage-dark flex items-center gap-1.5 bg-sage-light/30 px-4 py-1.5 rounded-full z-10">
                  <span className="w-2 h-2 rounded-full bg-sage-dark animate-pulse" />
                  Aktif ve Taranabilir
                </p>
              </section>

              {/* İndirme Aksiyonları */}
              <section className="bg-white rounded-2xl border border-soft-border p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Çıktı ve Paylaşım Formatları</h3>
                <div className="flex flex-col gap-3">
                  <button className="w-full flex items-center justify-between p-3.5 rounded-xl border border-soft-border hover:border-sage hover:bg-sage-light/10 transition group text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sage-light/40 flex items-center justify-center text-sage-dark group-hover:scale-105 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Masa Standı Formatı <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 ml-1">PDF</span></p>
                        <p className="text-xs text-slate-500 mt-0.5">Matbaa için A4 / A5 şablonlu</p>
                      </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-sage"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>

                  <button className="w-full flex items-center justify-between p-3.5 rounded-xl border border-soft-border hover:border-sage hover:bg-sage-light/10 transition group text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-105 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Yüksek Çözünürlüklü <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 ml-1">PNG</span></p>
                        <p className="text-xs text-slate-500 mt-0.5">Kendi tasarımlarınıza eklemek için</p>
                      </div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-sage"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                  
                  <button className="w-full flex items-center justify-center gap-2 p-3 mt-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium text-sm transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Uygulama Linkini Kopyala
                  </button>
                </div>
              </section>

            </div>

            {/* SAĞ SÜTUN: Analitik ve İpuçları */}
            <div className="flex flex-col gap-6">
              
              <div className="grid grid-cols-2 gap-4">
                <StatBox label="Toplam Okutulma" value="7,432" />
                <StatBox label="Bugün Okutulma" value="84" />
                <StatBox label="Oluşturulan Albüm" value="138" />
                <StatBox label="Kullanım Oranı" value="%86" />
              </div>

              {/* Bilgi / İpucu Kartı */}
              <section className="bg-gradient-to-br from-gold-light/50 to-cream rounded-2xl border border-gold/30 p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex flex-shrink-0 items-center justify-center text-amber-600 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Daha Yüksek Etkileşim</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Elde edilen verilere göre; QR kodun her masada en az **2 adet çift taraflı stand** olarak yerleştirilmesi, davetlilerin platforma katılımını ve medya yükleme oranını **%40 artırmaktadır**.
                    </p>
                  </div>
                </div>
              </section>

              {/* Ekstra Seçenekler */}
              <section className="bg-cream rounded-2xl border border-soft-border p-6 flex-grow">
                 <h3 className="font-display text-lg font-semibold text-foreground mb-4">Gelişmiş Seçenekler</h3>
                 
                 <div className="space-y-4">
                   <label className="flex items-center justify-between p-3 border border-soft-border rounded-xl cursor-pointer hover:bg-white transition">
                     <div>
                       <p className="font-medium text-sm text-foreground">Yeni Cihaz Onayı</p>
                       <p className="text-xs text-slate-500 mt-0.5">Sadece şifre değil, SMS onayı da iste</p>
                     </div>
                     <div className="w-10 h-6 bg-slate-200 rounded-full relative">
                       <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm" />
                     </div>
                   </label>
                   
                   <label className="flex items-center justify-between p-3 border border-sage-light/50 bg-sage-light/20 rounded-xl cursor-pointer transition">
                     <div>
                       <p className="font-medium text-sm text-sage-dark">Markasız (White-label) İndirme</p>
                       <p className="text-xs text-sage-dark/70 mt-0.5">QR altında platform logosunu gizle</p>
                     </div>
                     <div className="w-10 h-6 bg-sage rounded-full relative">
                       <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm" />
                     </div>
                   </label>
                   
                   <button className="w-full mt-2 text-rose-500 font-medium text-sm py-2 hover:bg-rose-50 rounded-lg transition">
                     Mevcut QR Kodu İptal Et ve Yenile
                   </button>
                 </div>
              </section>

            </div>

          </div>
        )}
      </div>
    </AppHeader>
  );
}
