
import React from "react";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface PeriodeFormData {
  tahun: number;
  bulan: number;
  awal_rab: string;
  akhir_rab: string;
  awal_lpj: string;
  akhir_lpj: string;
}

interface PeriodeFormProps {
  formData: PeriodeFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  title: string;
  description: string;
  isEditMode?: boolean;
}

export const PeriodeForm: React.FC<PeriodeFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  isSubmitting,
  title,
  description,
  isEditMode = false,
}) => {
  return (
    <form onSubmit={onSubmit}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {description}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {!isEditMode && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tahun">Tahun</Label>
              <Input
                id="tahun"
                name="tahun"
                type="number"
                value={formData.tahun || ""}
                onChange={onInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulan">Bulan</Label>
              <Input
                id="bulan"
                name="bulan"
                type="number"
                min="1"
                max="12"
                value={formData.bulan || ""}
                onChange={onInputChange}
                required
              />
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="awal_rab">Tanggal Mulai RAB</Label>
          <Input
            id="awal_rab"
            name="awal_rab"
            type="datetime-local"
            value={formData.awal_rab || ""}
            onChange={onInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="akhir_rab">Tanggal Berakhir RAB</Label>
          <Input
            id="akhir_rab"
            name="akhir_rab"
            type="datetime-local"
            value={formData.akhir_rab || ""}
            onChange={onInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="awal_lpj">Tanggal Mulai LPJ</Label>
          <Input
            id="awal_lpj"
            name="awal_lpj"
            type="datetime-local"
            value={formData.awal_lpj || ""}
            onChange={onInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="akhir_lpj">Tanggal Berakhir LPJ</Label>
          <Input
            id="akhir_lpj"
            name="akhir_lpj"
            type="datetime-local"
            value={formData.akhir_lpj || ""}
            onChange={onInputChange}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
};
