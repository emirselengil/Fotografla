package com.fotografla.backend.guest.application;

import com.fotografla.backend.guest.application.VenueQrManagementService.VenueQrDashboardResponse;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.MultiFormatWriter;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Font;
import java.awt.FontFormatException;
import java.awt.Graphics2D;
import java.awt.MultipleGradientPaint;
import java.awt.LinearGradientPaint;
import java.awt.RenderingHints;
import java.awt.geom.AffineTransform;
import java.awt.geom.Ellipse2D;
import java.awt.geom.Path2D;
import java.awt.geom.Point2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import javax.imageio.ImageIO;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * QR baskı kartı: giriş ekranı {@code WeddingPanel} ile aynı 600×900 SVG düzeninin raster kopyası + QR ve salon metinleri.
 */
@Service
public class VenueQrPrintService {

    private static final int QR_PX = 720;

    private static final float SVG_W = 600f;
    private static final float SVG_H = 900f;

    /** A4 (pt) */
    private static final float PW = PDRectangle.A4.getWidth();
    private static final float PH = PDRectangle.A4.getHeight();

    private static final Color GOLD_STROKE = new Color(196, 151, 74);
    private static final Color TITLE_FG = new Color(28, 32, 24);
    private static final Color SUBTITLE_FG = new Color(61, 92, 58);

    /** Yaprak: x, y, len, aci, 0xRRGGBB */
    private static final int[][] LEAVES_TR = {
        {590, 210, 115, 10, 0x4e6e45},
        {560, 190, 105, -8, 0x5a7851},
        {530, 210, 100, 22, 0x7a9b6f},
        {488, 195, 110, -32, 0x5a7851},
        {452, 172, 100, -52, 0x6a8860},
        {418, 140, 90, -72, 0x7a9b6f},
        {390, 100, 80, -90, 0x5a7851},
        {600, 140, 85, 18, 0x6a8860},
        {600, 80, 70, 5, 0x8aaa80},
        {560, 55, 65, -18, 0x7a9b6f},
        {490, 30, 60, -55, 0x6a8860},
        {430, 28, 55, -85, 0x5a7851},
        {370, 62, 70, -95, 0x8aaa80},
        {350, 130, 65, -48, 0x6a8860},
    };

    private static final int[][] LEAVES_BL = {
        {10, 760, 115, 108, 0x4e6e45},
        {10, 820, 105, 92, 0x5a7851},
        {30, 895, 100, 75, 0x7a9b6f},
        {70, 900, 95, 55, 0x6a8860},
        {110, 895, 90, 35, 0x5a7851},
        {148, 875, 85, 15, 0x7a9b6f},
        {175, 840, 80, -5, 0x6a8860},
        {195, 800, 75, -22, 0x5a7851},
        {210, 755, 70, -40, 0x8aaa80},
        {10, 700, 80, 122, 0x6a8860},
        {40, 680, 70, 140, 0x7a9b6f},
        {82, 668, 65, 158, 0x5a7851},
        {130, 660, 60, 175, 0x8aaa80},
        {170, 672, 55, -165, 0x6a8860},
    };

    private static final float[][] GOLD_LEAVES_TR = {
        {348, 158, 44, -65},
        {420, 100, 44, -32},
        {488, 52, 44, 5},
        {545, 18, 44, 20},
        {400, 58, 38, -55},
        {470, 28, 34, -20},
        {595, 158, 32, 30},
        {600, 95, 30, 15},
    };

    private static final float[][] GOLD_LEAVES_BL = {
        {205, 760, 42, -148},
        {148, 808, 42, 172},
        {90, 852, 42, 108},
        {30, 892, 42, 80},
        {58, 748, 34, 128},
        {240, 728, 36, -155},
        {10, 762, 30, 100},
    };

    private static final float[][] BERRIES_TR = {
        {362, 114, 4},
        {350, 100, 4},
        {340, 114, 4},
        {353, 126, 4},
        {338, 128, 4},
        {370, 88, 2.5f},
        {358, 78, 2.5f},
    };

    private static final float[][] BERRIES_BL = {
        {242, 715, 4},
        {252, 702, 4},
        {262, 715, 4},
        {250, 724, 4},
        {264, 726, 4},
        {248, 692, 2.5f},
        {258, 682, 2.5f},
    };

    private static final float[][] SCATTER_GOLD = {
        {285, 82, 3.5f},
        {310, 148, 2.5f},
        {268, 170, 2},
        {558, 198, 3},
        {308, 52, 2.5f},
        {258, 102, 2},
        {332, 748, 3},
        {280, 802, 2.5f},
        {255, 762, 2},
        {312, 832, 2},
    };

    private final VenueQrManagementService venueQrManagementService;
    private final String guestPortalBaseUrl;

    public VenueQrPrintService(
            VenueQrManagementService venueQrManagementService,
            @Value("${app.guest-portal.base-url:http://localhost:3000}") String guestPortalBaseUrl) {
        this.venueQrManagementService = venueQrManagementService;
        this.guestPortalBaseUrl = guestPortalBaseUrl.trim().replaceAll("/$", "");
    }

    /**
     * Yalnizca QR matrisi (onizleme, kucuk gosterimler).
     */
    public byte[] renderQrPng(UUID venueId) throws IOException {
        VenueQrDashboardResponse dash = venueQrManagementService.dashboard(venueId);
        if (!dash.generated() || dash.codeValue() == null || dash.codeValue().isBlank()) {
            throw new IllegalArgumentException("QR kod henuz olusturulmadi.");
        }
        return encodeQrToPng(buildGuestUrl(dash.codeValue()), QR_PX);
    }

    /**
     * Baskı kartı (giriş teması + salon adı); PNG indirme için.
     */
    public byte[] renderQrCardPng(UUID venueId) throws IOException {
        VenueQrDashboardResponse dash = venueQrManagementService.dashboard(venueId);
        if (!dash.generated() || dash.codeValue() == null || dash.codeValue().isBlank()) {
            throw new IllegalArgumentException("QR kod henuz olusturulmadi.");
        }
        String guestUrl = buildGuestUrl(dash.codeValue());
        String salonName = dash.venueName() != null ? dash.venueName() : "";
        byte[] qrBytes = encodeQrToPng(guestUrl, QR_PX);
        BufferedImage qr = ImageIO.read(new ByteArrayInputStream(qrBytes));
        BufferedImage card = composeCardImage(salonName, qr, 1240, 1754);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(card, "PNG", baos);
        return baos.toByteArray();
    }

    public byte[] renderPrintPdf(UUID venueId) throws IOException {
        VenueQrDashboardResponse dash = venueQrManagementService.dashboard(venueId);
        if (!dash.generated() || dash.codeValue() == null || dash.codeValue().isBlank()) {
            throw new IllegalArgumentException("QR kod henuz olusturulmadi.");
        }
        String guestUrl = buildGuestUrl(dash.codeValue());
        byte[] pngBytes = encodeQrToPng(guestUrl, QR_PX);
        String salonName = dash.venueName() != null ? dash.venueName() : "";
        BufferedImage qr = ImageIO.read(new ByteArrayInputStream(pngBytes));
        BufferedImage card = composeCardImage(salonName, qr, 1240, 1754);

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            ByteArrayOutputStream pngOut = new ByteArrayOutputStream();
            ImageIO.write(card, "PNG", pngOut);
            PDImageXObject img = PDImageXObject.createFromByteArray(document, pngOut.toByteArray(), "card");
            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                cs.drawImage(img, 0, 0, PW, PH);
            }
            ByteArrayOutputStream pdfOut = new ByteArrayOutputStream();
            document.save(pdfOut);
            return pdfOut.toByteArray();
        }
    }

    private BufferedImage composeCardImage(String salonName, BufferedImage qrImage, int w, int h) throws IOException {
        float sx = w / SVG_W;
        float sy = h / SVG_H;
        float smin = Math.min(sx, sy);

        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);

        drawLoginGradientBackground(g, w, h);
        drawWatercolorBlobs(g, sx, sy);
        drawLeavesBatch(g, LEAVES_TR, sx, sy);
        drawLeavesBatch(g, LEAVES_BL, sx, sy);

        drawGoldBranch(g, 305, 205, 430, 110, 570, 10, sx, sy, 1f);
        drawGoldBranch(g, 390, 155, 470, 80, 570, 30, sx, sy, 0.8f);
        drawGoldBranch(g, 268, 705, 155, 790, 18, 880, sx, sy, 1f);
        drawGoldBranch(g, 215, 740, 118, 820, 10, 900, sx, sy, 0.8f);

        for (float[] gl : GOLD_LEAVES_TR) {
            drawGoldLeafOutline(g, gl[0], gl[1], gl[2], gl[3], sx, sy);
        }
        for (float[] gl : GOLD_LEAVES_BL) {
            drawGoldLeafOutline(g, gl[0], gl[1], gl[2], gl[3], sx, sy);
        }

        drawBerriesCluster(g, BERRIES_TR, 360, 130, sx, sy, true);
        drawBerriesCluster(g, BERRIES_BL, 250, 728, sx, sy, false);

        drawRose(g, 530, 148, 75, 0xf0c4cc, 0xdfa0ae, 0xc87888, 15, sx, sy);
        drawRose(g, 420, 62, 56, 0xf0c8a8, 0xd8a080, 0xc08060, -10, sx, sy);
        drawRose(g, 595, 75, 42, 0xf0c4cc, 0xdfa0ae, 0xc87888, 28, sx, sy);
        drawRose(g, 480, 22, 35, 0xf0c8a8, 0xd8a080, 0xc08060, 5, sx, sy);
        drawRose(g, 598, 170, 30, 0xf0c4cc, 0xdfa0ae, 0xc87888, -18, sx, sy);

        drawRose(g, 88, 748, 68, 0xf0c8a8, 0xd8a080, 0xc08060, -22, sx, sy);
        drawRose(g, 182, 820, 50, 0xf0c4cc, 0xdfa0ae, 0xc87888, 12, sx, sy);
        drawRose(g, 28, 830, 42, 0xf0c8a8, 0xd8a080, 0xc08060, -35, sx, sy);
        drawRose(g, 128, 880, 35, 0xf0c4cc, 0xdfa0ae, 0xc87888, 20, sx, sy);
        drawRose(g, 210, 880, 28, 0xf0c8a8, 0xd8a080, 0xc08060, -8, sx, sy);

        for (float[] d : SCATTER_GOLD) {
            float px = d[0] * sx;
            float py = d[1] * sy;
            float r = d[2] * smin;
            g.setColor(new Color(196, 151, 74, (int) (255 * 0.65f)));
            g.fill(new Ellipse2D.Float(px - r, py - r, r * 2f, r * 2f));
        }

        /* ── Merkez içerik: QR üstte, giriş ekranı tipografisi ── */
        float qrSideSvg = 258f;
        float qrPx = qrSideSvg * smin;
        float cx = (SVG_W / 2f) * sx;
        float qrTopY = 198f * sy;
        int qxi = Math.round(cx - qrPx / 2f);
        int qyi = Math.round(qrTopY);
        int qw = Math.round(qrPx);
        g.drawImage(qrImage, qxi, qyi, qw, qw, null);

        Font fontSerifBold = loadAwtFont("NotoSerif-Bold.ttf", Math.max(36f, 51f * sy));
        Font fontSansBold = loadAwtFont("NotoSans-Bold.ttf", Math.max(14f, 18f * sy));

        float titleY = qrTopY + qrPx + 28f * sy;
        g.setFont(fontSerifBold);
        g.setColor(TITLE_FG);
        String title = "Fotoğrafla";
        int tw = g.getFontMetrics().stringWidth(title);
        g.drawString(title, Math.round(cx - tw / 2f), Math.round(titleY + g.getFontMetrics().getAscent()));

        float ornY = titleY + 42f * sy;
        float lineW = 100f * sx;
        float midX = cx;
        g.setStroke(new BasicStroke(Math.max(0.8f, 0.8f * smin)));
        g.setColor(GOLD_STROKE);
        g.drawLine(Math.round(midX - lineW - 35f * sx), Math.round(ornY), Math.round(midX - 35f * sx), Math.round(ornY));
        g.drawLine(Math.round(midX + 35f * sx), Math.round(ornY), Math.round(midX + lineW + 35f * sx), Math.round(ornY));
        float dotR = 3.2f * smin;
        g.fill(new Ellipse2D.Float(midX - dotR, ornY - dotR, dotR * 2f, dotR * 2f));
        float small = 1.8f * smin;
        g.setColor(new Color(196, 151, 74, (int) (255 * 0.6f)));
        g.fill(new Ellipse2D.Float(midX - 30f * sx - small, ornY - small, small * 2f, small * 2f));
        g.fill(new Ellipse2D.Float(midX + 30f * sx - small, ornY - small, small * 2f, small * 2f));

        float subY = ornY + 32f * sy;
        Font subFont = fontSerifBold.deriveFont(Font.ITALIC, Math.max(15f, 20f * sy));
        g.setFont(subFont);
        g.setColor(SUBTITLE_FG);
        String sub = "Anılarınız tek bir çerçevede.";
        int sw = g.getFontMetrics().stringWidth(sub);
        g.drawString(sub, Math.round(cx - sw / 2f), Math.round(subY + g.getFontMetrics().getAscent()));

        float salonY = subY + 48f * sy;
        float salonPt = salonName.length() > 34 ? 22f : 30f;
        g.setFont(fontSansBold.deriveFont(salonPt * smin));
        g.setColor(SUBTITLE_FG);
        int salonW = g.getFontMetrics().stringWidth(salonName);
        int maxSalon = w - Math.round(56f * sx);
        String salonDraw = salonName;
        if (salonW > maxSalon) {
            while (salonDraw.length() > 3 && g.getFontMetrics().stringWidth(salonDraw + "…") > maxSalon) {
                salonDraw = salonDraw.substring(0, salonDraw.length() - 1);
            }
            salonDraw = salonDraw + "…";
            salonW = g.getFontMetrics().stringWidth(salonDraw);
        }
        g.drawString(salonDraw, Math.round(cx - salonW / 2f), Math.round(salonY + g.getFontMetrics().getAscent()));

        String brand = "Fotoğrafla";
        g.setFont(fontSerifBold.deriveFont(11.5f * smin));
        g.setColor(TITLE_FG);
        int bw = g.getFontMetrics().stringWidth(brand);
        int margin = Math.round(36f * sx);
        g.drawString(brand, w - margin - bw, h - margin);

        g.dispose();
        return img;
    }

    private void drawLoginGradientBackground(Graphics2D g, int w, int h) {
        Point2D.Float p0 = new Point2D.Float(w, 0);
        Point2D.Float p1 = new Point2D.Float(0, h);
        float[] fr = {0f, 0.55f, 1f};
        Color[] c = {
            new Color(0xdc, 0xe8, 0xd8),
            new Color(0xe8, 0xe4, 0xdc),
            new Color(0xed, 0xe0, 0xd4),
        };
        g.setPaint(new LinearGradientPaint(p0, p1, fr, c, MultipleGradientPaint.CycleMethod.NO_CYCLE));
        g.fillRect(0, 0, w, h);
    }

    private void drawWatercolorBlobs(Graphics2D g, float sx, float sy) {
        g.setColor(new Color(0xc8, 0xdd, 0xc0, (int) (255 * 0.22f)));
        g.fill(ellipseSvg(560, 80, 240, 170, sx, sy));
        g.setColor(new Color(0xd4, 0xe8, 0xcc, (int) (255 * 0.15f)));
        g.fill(ellipseSvg(600, 40, 160, 100, sx, sy));
        g.setColor(new Color(0xc8, 0xdd, 0xc0, (int) (255 * 0.20f)));
        g.fill(ellipseSvg(60, 840, 220, 160, sx, sy));
        g.setColor(new Color(0xd4, 0xe8, 0xcc, (int) (255 * 0.15f)));
        g.fill(ellipseSvg(10, 900, 140, 90, sx, sy));
    }

    private static Ellipse2D.Float ellipseSvg(float cx, float cy, float rx, float ry, float sx, float sy) {
        return new Ellipse2D.Float((cx - rx) * sx, (cy - ry) * sy, rx * 2f * sx, ry * 2f * sy);
    }

    private void drawLeavesBatch(Graphics2D g, int[][] leaves, float sx, float sy) {
        for (int[] L : leaves) {
            int rgb = L[4];
            Color c = new Color(rgb >> 16 & 0xff, rgb >> 8 & 0xff, rgb & 0xff);
            drawLeafSvg(g, L[0], L[1], L[2], L[3], c, sx, sy);
        }
    }

    private void drawLeafSvg(Graphics2D g, float x, float y, float len, float aDeg, Color fill, float sx, float sy) {
        float w = len * 0.32f;
        Path2D.Float p = new Path2D.Float();
        p.moveTo(0, 0);
        p.curveTo(-w, -len * 0.35f, -w * 0.7f, -len * 0.75f, 0, -len);
        p.curveTo(w * 0.7f, -len * 0.75f, w, -len * 0.35f, 0, 0);
        AffineTransform old = g.getTransform();
        g.translate(x * sx, y * sy);
        g.rotate(Math.toRadians(aDeg));
        g.scale(sx, sy);
        g.setColor(fill);
        g.fill(p);
        g.setTransform(old);
    }

    private void drawGoldLeafOutline(Graphics2D g, float x, float y, float len, float aDeg, float sx, float sy) {
        float w = len * 0.28f;
        Path2D.Float p = new Path2D.Float();
        p.moveTo(0, 0);
        p.curveTo(-w, -len * 0.35f, -w * 0.6f, -len * 0.75f, 0, -len);
        p.curveTo(w * 0.6f, -len * 0.75f, w, -len * 0.35f, 0, 0);
        AffineTransform old = g.getTransform();
        g.translate(x * sx, y * sy);
        g.rotate(Math.toRadians(aDeg));
        g.scale(sx, sy);
        g.setColor(GOLD_STROKE);
        g.setStroke(new BasicStroke(0.9f, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g.draw(p);
        g.setTransform(old);
    }

    private void drawGoldBranch(
            Graphics2D g, float x0, float y0, float cx, float cy, float x1, float y1, float sx, float sy, float sw) {
        Path2D.Float path = new Path2D.Float();
        path.moveTo(x0 * sx, y0 * sy);
        path.quadTo(cx * sx, cy * sy, x1 * sx, y1 * sy);
        g.setColor(GOLD_STROKE);
        g.setStroke(new BasicStroke(Math.max(0.65f, sw * Math.min(sx, sy)), BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g.draw(path);
    }

    private void drawBerriesCluster(Graphics2D g, float[][] berries, float hubX, float hubY, float sx, float sy, boolean top) {
        float smin = Math.min(sx, sy);
        for (int i = 0; i < berries.length; i++) {
            float[] b = berries[i];
            float rad = b[2] * smin;
            int rgb = i < 5 ? 0x3d5c3a : 0x4d7048;
            g.setColor(new Color(rgb));
            g.fill(new Ellipse2D.Float(b[0] * sx - rad, b[1] * sy - rad, rad * 2f, rad * 2f));
        }
        g.setStroke(new BasicStroke(Math.min(sx, sy), BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g.setColor(new Color(0x3d5c3a));
        if (top) {
            g.drawLine(Math.round(hubX * sx), Math.round(hubY * sy), Math.round(362 * sx), Math.round(114 * sy));
            g.drawLine(Math.round(hubX * sx), Math.round(hubY * sy), Math.round(350 * sx), Math.round(100 * sy));
            g.drawLine(Math.round(hubX * sx), Math.round(hubY * sy), Math.round(340 * sx), Math.round(114 * sy));
            g.drawLine(Math.round(hubX * sx), Math.round(hubY * sy), Math.round(353 * sx), Math.round(126 * sy));
            g.drawLine(Math.round(hubX * sx), Math.round(hubY * sy), Math.round(338 * sx), Math.round(128 * sy));
        } else {
            g.drawLine(Math.round(hubX * sx), Math.round(hubY * sy), Math.round(242 * sx), Math.round(715 * sy));
            g.drawLine(Math.round(hubX * sx), Math.round(hubY * sy), Math.round(252 * sx), Math.round(702 * sy));
            g.drawLine(Math.round(hubX * sx), Math.round(hubY * sy), Math.round(262 * sx), Math.round(715 * sy));
            g.drawLine(Math.round(hubX * sx), Math.round(hubY * sy), Math.round(264 * sx), Math.round(726 * sy));
        }
    }

    private void drawRose(
            Graphics2D g, float cx, float cy, float size, int c1, int c2, int c3, float rotDeg, float sx, float sy) {
        float r1 = size * 0.44f;
        float pw1 = size * 0.26f;
        float ph1 = size * 0.2f;
        float r2 = size * 0.25f;
        float pw2 = size * 0.2f;
        float ph2 = size * 0.15f;
        Color col1 = new Color(c1);
        Color col2 = new Color(c2);
        Color col3 = new Color(c3);
        AffineTransform base = new AffineTransform();
        base.translate(cx * sx, cy * sy);
        base.rotate(Math.toRadians(rotDeg));
        base.scale(sx, sy);
        for (int a : new int[] {0, 72, 144, 216, 288}) {
            AffineTransform old = g.getTransform();
            g.transform(base);
            g.rotate(Math.toRadians(a));
            g.setColor(col1);
            g.fill(new Ellipse2D.Float(-pw1, -r1 - ph1, pw1 * 2f, ph1 * 2f));
            g.setTransform(old);
        }
        for (int a : new int[] {36, 108, 180, 252, 324}) {
            AffineTransform old = g.getTransform();
            g.transform(base);
            g.rotate(Math.toRadians(a));
            g.setColor(col2);
            g.fill(new Ellipse2D.Float(-pw2, -r2 - ph2, pw2 * 2f, ph2 * 2f));
            g.setTransform(old);
        }
        AffineTransform old = g.getTransform();
        g.transform(base);
        g.setColor(col3);
        float cr = size * 0.13f;
        g.fill(new Ellipse2D.Float(-cr, -cr, cr * 2f, cr * 2f));
        g.setTransform(old);
    }

    private Font loadAwtFont(String fileName, float size) throws IOException {
        try (InputStream in = fontStream(fileName)) {
            return Font.createFont(Font.TRUETYPE_FONT, in).deriveFont(size);
        } catch (FontFormatException e) {
            throw new IOException("Font yuklenemedi: " + fileName, e);
        }
    }

    private String buildGuestUrl(String codeValue) {
        return guestPortalBaseUrl
                + "/misafir?salon="
                + URLEncoder.encode(codeValue, StandardCharsets.UTF_8);
    }

    private InputStream fontStream(String name) {
        InputStream in = getClass().getResourceAsStream("/fonts/" + name);
        if (in == null) {
            throw new IllegalStateException("Font bulunamadi: fonts/" + name);
        }
        return in;
    }

    private static byte[] encodeQrToPng(String contents, int size) throws IOException {
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.MARGIN, 1);
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        try {
            BitMatrix matrix = new MultiFormatWriter().encode(contents, BarcodeFormat.QR_CODE, size, size, hints);
            BufferedImage im = MatrixToImageWriter.toBufferedImage(matrix);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(im, "PNG", baos);
            return baos.toByteArray();
        } catch (WriterException e) {
            throw new IOException("QR uretilemedi", e);
        }
    }
}
