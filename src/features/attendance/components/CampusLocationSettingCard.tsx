"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Radio, ExternalLink, SlidersHorizontal } from "lucide-react";
import { CampusLocationSettingModal } from "./CampusLocationSettingModal";

interface CampusLocationSettingCardProps {
  initialLatitude?: number;
  initialLongitude?: number;
  initialRadiusMeters?: number;
}

export function CampusLocationSettingCard({
  initialLatitude = -6.914744,
  initialLongitude = 107.60981,
  initialRadiusMeters = 300,
}: CampusLocationSettingCardProps) {
  const [coords, setCoords] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude,
    radiusMeters: initialRadiusMeters,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mapEmbedUrl = `https://maps.google.com/maps?q=${coords.latitude},${coords.longitude}&hl=id&z=16&output=embed`;
  const googleMapsUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <CardTitle>Lokasi Kampus &amp; Geofencing Presensi</CardTitle>
          </div>
          <Badge variant="primary" className="text-xs">
            Geofence Aktif
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <p className="text-[#667085]">
            Titik koordinat pusat kampus digunakan untuk memvalidasi posisi GPS mahasiswa saat melakukan scan barcode/QR presensi. Mahasiswa yang berada di luar radius tidak dapat melakukan presensi.
          </p>

          {/* Coordinate & Radius Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Latitude (Lintang)</p>
              <p className="font-mono font-semibold text-slate-900 mt-0.5">
                {coords.latitude.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Longitude (Bujur)</p>
              <p className="font-mono font-semibold text-slate-900 mt-0.5">
                {coords.longitude.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Radius Toleransi</p>
              <p className="font-semibold text-blue-600 mt-0.5 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" />
                {coords.radiusMeters} Meter
              </p>
            </div>
          </div>

          {/* Map Embed Preview */}
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-44">
            <iframe
              title="Campus Geofence Location Preview"
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 transition-colors py-1.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka di Google Maps
            </a>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Atur Posisi Kampus (Google Maps)
            </Button>
          </div>
        </CardContent>
      </Card>

      <CampusLocationSettingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialLatitude={coords.latitude}
        initialLongitude={coords.longitude}
        initialRadiusMeters={coords.radiusMeters}
        onSaved={(newCoords) => setCoords(newCoords)}
      />
    </>
  );
}
