
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Periode, DocumentStatus } from "@/types";
import { formatDate, formatPeriode, isWithinDateRange } from "@/lib/utils";

interface PeriodInfoProps {
  periode: Periode;
}

export const PeriodInfo: React.FC<PeriodInfoProps> = ({ periode }) => {
  const isRABOpen = isWithinDateRange(periode.awal_rab, periode.akhir_rab);
  const isLPJOpen = isWithinDateRange(periode.awal_lpj, periode.akhir_lpj);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Periode {formatPeriode(periode.id)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isRABOpen ? "bg-green-500" : "bg-gray-300"}`}></span>
              <span>Rencana Anggaran Belanja (RAB)</span>
            </h3>
            <div className="text-sm space-y-1">
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Buka:</span>
                <span>{formatDate(periode.awal_rab)}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Tutup:</span>
                <span>{formatDate(periode.akhir_rab)}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Status:</span>
                <span className={isRABOpen ? "text-green-600 font-medium" : "text-gray-500"}>
                  {isRABOpen ? "Terbuka" : "Tertutup"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isLPJOpen ? "bg-green-500" : "bg-gray-300"}`}></span>
              <span>Laporan Pertanggungjawaban (LPJ)</span>
            </h3>
            <div className="text-sm space-y-1">
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Buka:</span>
                <span>{formatDate(periode.awal_lpj)}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Tutup:</span>
                <span>{formatDate(periode.akhir_lpj)}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-muted-foreground">Status:</span>
                <span className={isLPJOpen ? "text-green-600 font-medium" : "text-gray-500"}>
                  {isLPJOpen ? "Terbuka" : "Tertutup"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
