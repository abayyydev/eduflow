"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Radio,
  Sliders,
  Layers,
} from "lucide-react";
import { updateCampusLocationAction } from "../actions";

interface CampusLocationSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId?: string;
  classNameTitle?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  initialRadiusMeters?: number;
  onSaved?: (newCoords: { latitude: number; longitude: number; radiusMeters: number }) => void;
}

export function CampusLocationSettingModal({
  isOpen,
  onClose,
  classId,
  classNameTitle,
  initialLatitude = -6.914744,
  initialLongitude = 107.60981,
  initialRadiusMeters = 300,
  onSaved,
}: CampusLocationSettingModalProps) {
  const [latitude, setLatitude] = useState<string>(String(initialLatitude));
  const [longitude, setLongitude] = useState<string>(String(initialLongitude));
  const [radiusMeters, setRadiusMeters] = useState<number>(initialRadiusMeters);
  const [pasteInput, setPasteInput] = useState<string>("");
  const [applyToAll, setApplyToAll] = useState<boolean>(!classId);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLatitude(String(initialLatitude));
      setLongitude(String(initialLongitude));
      setRadiusMeters(initialRadiusMeters);
      setPasteInput("");
      setApplyToAll(!classId);
      setFeedback(null);
    }
  }, [isOpen, initialLatitude, initialLongitude, initialRadiusMeters, classId]);

  // Smart parser for Google Maps URL or raw coordinates
  const parseCoordinatesOrUrl = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Pattern 1: Google Maps URL with @lat,lng,zoom
    const atMatch = trimmed.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (atMatch) {
      setLatitude(atMatch[1]);
      setLongitude(atMatch[2]);
      setFeedback({
        type: "success",
        message: `Koordinat berhasil diekstrak dari Google Maps URL: (${atMatch[1]}, ${atMatch[2]})`,
      });
      return;
    }

    // Pattern 2: Google Maps search query q=lat,lng
    const qMatch = trimmed.match(/[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (qMatch) {
      setLatitude(qMatch[1]);
      setLongitude(qMatch[2]);
      setFeedback({
        type: "success",
        message: `Koordinat berhasil diekstrak: (${qMatch[1]}, ${qMatch[2]})`,
      });
      return;
    }

    // Pattern 3: Raw coordinates "lat, lng" or "lat,lng"
    const coordMatch = trimmed.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (coordMatch) {
      setLatitude(coordMatch[1]);
      setLongitude(coordMatch[2]);
      setFeedback({
        type: "success",
        message: `Koordinat berhasil dibaca: (${coordMatch[1]}, ${coordMatch[2]})`,
      });
      return;
    }

    setFeedback({
      type: "error",
      message: "Format tidak dikenali. Tempel link Google Maps atau format '-6.914744, 107.60981'.",
    });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setFeedback({
        type: "error",
        message: "Peramban Anda tidak mendukung fitur Geolocation GPS.",
      });
      return;
    }

    setGpsLoading(true);
    setFeedback(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const lat = pos.coords.latitude.toFixed(7);
        const lng = pos.coords.longitude.toFixed(7);
        setLatitude(lat);
        setLongitude(lng);
        setFeedback({
          type: "success",
          message: `Lokasi GPS Anda berhasil dideteksi dengan akurasi ±${Math.round(pos.coords.accuracy)} meter.`,
        });
      },
      (err) => {
        setGpsLoading(false);
        setFeedback({
          type: "error",
          message: `Gagal membaca GPS: ${err.message}. Pastikan izin lokasi diizinkan di browser Anda.`,
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSave = async () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setFeedback({
        type: "error",
        message: "Koordinat Latitude dan Longitude harus berupa angka yang valid.",
      });
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setFeedback({
        type: "error",
        message: "Rentang koordinat tidak valid (Latitude: -90 s/d 90, Longitude: -180 s/d 180).",
      });
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      const res = await updateCampusLocationAction({
        classId,
        applyToAll,
        latitude: lat,
        longitude: lng,
        radiusMeters,
      });

      if (res.error) {
        setFeedback({ type: "error", message: res.error });
        setSaving(false);
        return;
      }

      setFeedback({
        type: "success",
        message: applyToAll
          ? "Lokasi kampus dan geofencing berhasil disimpan untuk seluruh kelas aktif Anda!"
          : `Lokasi kampus untuk kelas ${classNameTitle || ""} berhasil diperbarui!`,
      });

      if (onSaved) {
        onSaved({ latitude: lat, longitude: lng, radiusMeters });
      }

      setTimeout(() => {
        setSaving(false);
        onClose();
      }, 1200);
    } catch (e: any) {
      setFeedback({
        type: "error",
        message: e?.message || "Terjadi kesalahan saat menyimpan pengaturan lokasi.",
      });
      setSaving(false);
    }
  };

  const parsedLat = parseFloat(latitude) || -6.914744;
  const parsedLng = parseFloat(longitude) || 107.60981;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${parsedLat},${parsedLng}&hl=id&z=16&output=embed`;
  const googleMapsUrl = `https://www.google.com/maps?q=${parsedLat},${parsedLng}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Posisi Kampus (Google Maps)"
      description={
        classNameTitle
          ? `Tentukan koordinat pusat kampus dan radius absensi untuk kelas ${classNameTitle}.`
          : "Tentukan koordinat pusat kampus dan toleransi jarak presensi geofencing mahasiswa."
      }
      maxWidth="xl"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <p className="font-medium">{feedback.message}</p>
          </div>
        )}

        {/* Smart Paste Input */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
          <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              Deteksi Cepat dari Google Maps (Link atau Koordinat)
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Contoh: paste link Maps atau -6.914744, 107.60981
            </span>
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Paste link Google Maps atau angka koordinat di sini..."
              value={pasteInput}
              onChange={(e) => {
                setPasteInput(e.target.value);
                if (e.target.value.includes(",") || e.target.value.includes("google.com/maps")) {
                  parseCoordinatesOrUrl(e.target.value);
                }
              }}
              className="text-xs bg-white"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => parseCoordinatesOrUrl(pasteInput)}
              className="shrink-0 text-xs"
            >
              Terapkan
            </Button>
          </div>
        </div>

        {/* GPS Current Location Button & Open External */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetCurrentLocation}
            disabled={gpsLoading}
            className="text-xs border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700"
          >
            <Navigation className={`w-3.5 h-3.5 mr-1.5 ${gpsLoading ? "animate-spin" : ""}`} />
            {gpsLoading ? "Membaca GPS..." : "Gunakan Posisi Saya Saat Ini (GPS)"}
          </Button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 transition-colors py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Buka di Google Maps
          </a>
        </div>

        {/* Coordinate Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Latitude (Garis Lintang)
            </label>
            <Input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="-6.914744"
              className="text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Longitude (Garis Bujur)
            </label>
            <Input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="107.609810"
              className="text-xs font-mono"
            />
          </div>
        </div>

        {/* Radius Geofencing */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-blue-600" />
              Radius Toleransi Geofencing
            </label>
            <Badge variant="primary" className="text-xs font-bold">
              {radiusMeters} Meter
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500">
            Mahasiswa hanya dapat melakukan scan presensi barcode jika berada dalam radius ini dari titik kampus.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {[50, 100, 200, 300, 500, 1000].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadiusMeters(r)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  radiusMeters === r
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {r} m
              </button>
            ))}
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] text-slate-500">Kustom:</span>
              <Input
                type="number"
                min={10}
                max={50000}
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(parseInt(e.target.value) || 100)}
                className="w-20 h-7 text-xs font-mono text-center bg-white"
              />
            </div>
          </div>
        </div>

        {/* Live Google Maps Embed Preview */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              Pratinjau Titik Kampus (Google Maps)
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              {parsedLat.toFixed(5)}, {parsedLng.toFixed(5)}
            </span>
          </div>
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-52">
            <iframe
              title="Google Maps Campus Geofence"
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute top-2 left-2 pointer-events-none bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200 text-[11px] font-semibold text-slate-800 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Titik Pusat Kampus ({radiusMeters}m radius)
            </div>
          </div>
        </div>

        {/* Apply Scope Checkbox */}
        <div className="flex items-start gap-2.5 bg-blue-50/50 border border-blue-100 rounded-xl p-3">
          <input
            type="checkbox"
            id="applyToAllClasses"
            checked={applyToAll}
            onChange={(e) => setApplyToAll(e.target.checked)}
            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="applyToAllClasses" className="text-xs text-slate-700 cursor-pointer">
            <strong className="text-slate-900 block font-semibold">
              Terapkan koordinat &amp; radius ini ke seluruh kelas aktif saya
            </strong>
            <span className="text-[11px] text-slate-500">
              Jika dicentang, semua mata kuliah dan kelas yang Anda ampu akan menggunakan lokasi ini untuk validasi absensi mahasiswa.
            </span>
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="min-w-[120px]"
          >
            {saving ? "Menyimpan..." : "Simpan Lokasi"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
