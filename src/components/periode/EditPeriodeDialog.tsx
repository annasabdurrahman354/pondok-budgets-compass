
import React from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { PeriodeForm } from "./PeriodeForm";

interface PeriodeFormData {
  tahun: number;
  bulan: number;
  awal_rab: string;
  akhir_rab: string;
  awal_lpj: string;
  akhir_lpj: string;
}

interface EditPeriodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PeriodeFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  periodeId: string | null;
}

export const EditPeriodeDialog: React.FC<EditPeriodeDialogProps> = ({
  isOpen,
  onOpenChange,
  formData,
  onInputChange,
  onSubmit,
  isSubmitting,
  periodeId,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <PeriodeForm
          formData={formData}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          title={`Edit Periode ${periodeId ? periodeId : ""}`}
          description="Ubah jadwal periode RAB dan LPJ"
          isEditMode={true}
        />
      </DialogContent>
    </Dialog>
  );
};
