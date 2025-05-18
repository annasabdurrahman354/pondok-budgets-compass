
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PeriodeForm } from "./PeriodeForm";

interface PeriodeFormData {
  tahun: number;
  bulan: number;
  awal_rab: string;
  akhir_rab: string;
  awal_lpj: string;
  akhir_lpj: string;
}

interface CreatePeriodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: PeriodeFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export const CreatePeriodeDialog: React.FC<CreatePeriodeDialogProps> = ({
  isOpen,
  onOpenChange,
  formData,
  onInputChange,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Periode
        </Button>
      </DialogTrigger>
      <DialogContent>
        <PeriodeForm
          formData={formData}
          onInputChange={onInputChange}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          title="Tambah Periode Baru"
          description="Buat periode baru untuk RAB dan LPJ. Pastikan tanggal yang diinput sudah benar."
        />
      </DialogContent>
    </Dialog>
  );
};
