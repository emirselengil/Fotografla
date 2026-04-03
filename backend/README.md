# Fotografla Backend (Spring Boot + PostgreSQL)

Bu servis Fotografla projesinin backend katmanidir.

## Stack
- Java 17
- Spring Boot 3.3.4
- Spring Web, Security, Validation, JPA
- PostgreSQL
- Flyway (migration-first)
- Testcontainers (PostgreSQL integration test)

## Maven Gereksinimi
- Maven komutlari Java 17 ile calismalidir.
- `JAVA_HOME` degeri `C:\Program Files\Java\jdk-17` olacak sekilde ayarlanmalidir.

## Baslatma

1. PostgreSQL calistir ve DB olustur:
- DB: `fotografla`
- User: `postgres`
- Password: `postgres`

2. Ortam degiskenleri (opsiyonel):
- `DB_URL` (default: `jdbc:postgresql://localhost:5432/fotografla`)
- `DB_USERNAME` (default: `postgres`)
- `DB_PASSWORD` (default: `postgres`)
- `SERVER_PORT` (default: `8080`)

3. Uygulamayi calistir:
```bash
./mvnw spring-boot:run
```

4. Test:
```bash
./mvnw test
```

Not: Docker yoksa Testcontainers testi otomatik skip olur.

## Migration Politikasi
- Tum schema degisiklikleri `src/main/resources/db/migration` altinda SQL migration ile yapilir.
- Dosya formati: `V{n}__{aciklama}.sql`
- Manual schema degisikligi yapilmaz.

## Ilk Endpointler
- `GET /api/v1/system/ping` -> servis ayakta kontrolu
- `POST /api/v1/events` -> yeni etkinlik olusturur (auth gerektirir)
- `GET /api/v1/events` -> etkinlik listesi (opsiyonel `venueId` filtreli, auth gerektirir)
- `PATCH /api/v1/events/{eventId}/status` -> etkinlik durumunu gunceller (auth gerektirir)
- `GET /api/v1/events/active` -> aktif etkinlik ozetini DB'den doner (auth gerektirir)
- `GET /api/v1/guest/resolve?code=...` -> QR kodunu cozer, salon ve aktif etkinlik bilgisini doner (public)
- `POST /api/v1/guest/sessions` -> misafir oturumu olusturur (public)
- `POST /api/v1/media/presign` -> medya yukleme icin objectKey ve gecici upload bilgisi doner (public)
- `POST /api/v1/media/complete` -> yukleme tamamlandiginda metadata kaydini `media_assets` tablosuna yazar (public/auth)
- `GET /api/v1/events/{eventId}/summary` -> cift/salon dashboard icin etkinlik ozetini doner (auth gerektirir)
- `GET /api/v1/events/{eventId}/media` -> etkinlige ait medya listesini doner (auth gerektirir)
- `GET /api/v1/events/{eventId}/participants` -> etkinlige katilan misafir listesini ve medya sayilarini doner (auth gerektirir)
- `GET /api/v1/venues/{venueId}/events` -> salona ait etkinlik listesini doner (auth gerektirir)
- `GET /api/actuator/health` -> health endpoint

## Mevcut Migrationlar
- `V1__init_schema.sql` -> cekirdek tablolar ve indexler
- `V2__seed_baseline.sql` -> baseline test verileri
