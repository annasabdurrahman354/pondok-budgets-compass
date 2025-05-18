
import React from "react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Periode } from "@/types";
import { formatPeriode } from "@/lib/utils";

interface PeriodeDeleteDialogProps {
  periode: Periode;
  onDelete: () => void;
}

export const PeriodeDeleteDialog: React.FC<PeriodeDeleteDialogProps> = ({
  periode,
  onDelete,
}) => {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Hapus Periode</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menghapus periode {formatPeriode(periode.id)}?
          Tindakan ini tidak dapat dibatalkan.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Batal</AlertDialogCancel>
        <AlertDialogAction 
          onClick={onDelete}
          className="bg-red-600 hover:bg-red-700"
        >
          Hapus
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};
