
import React from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Periode } from "@/types";
import { formatDate, formatPeriode } from "@/lib/utils";

interface PeriodeDetailDialogProps {
  periode: Periode;
}

export const PeriodeDetailDialog: React.FC<PeriodeDetailDialogProps> = ({
  periode,
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Detail Periode {formatPeriode(periode.id)}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tahun</p>
            <p>{periode.tahun}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bulan</p>
            <p>{periode.bulan}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">RAB Mulai</p>
          <p>{formatDate(periode.awal_rab)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">RAB Berakhir</p>
          <p>{formatDate(periode.akhir_rab)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">LPJ Mulai</p>
          <p>{formatDate(periode.awal_lpj)}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">LPJ Berakhir</p>
          <p>{formatDate(periode.akhir_lpj)}</p>
        </div>
      </div>
    </DialogContent>
  );
};
