
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Periode } from "@/types";
import { formatDate, formatPeriode } from "@/lib/utils";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Eye, Trash } from "lucide-react";
import { PeriodeDeleteDialog } from "./PeriodeDeleteDialog";

interface PeriodeTableProps {
  periodes: Periode[];
  isLoading: boolean;
  onViewDetail: (periode: Periode) => void;
  onEdit: (periode: Periode) => void;
  onDelete: (periodeId: string) => void;
}

export const PeriodeTable: React.FC<PeriodeTableProps> = ({
  periodes,
  isLoading,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <p>Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Periode</TableHead>
            <TableHead>RAB Mulai</TableHead>
            <TableHead>RAB Berakhir</TableHead>
            <TableHead>LPJ Mulai</TableHead>
            <TableHead>LPJ Berakhir</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periodes.map((periode) => (
            <TableRow key={periode.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  {formatPeriode(periode.id)}
                </div>
              </TableCell>
              <TableCell>{formatDate(periode.awal_rab)}</TableCell>
              <TableCell>{formatDate(periode.akhir_rab)}</TableCell>
              <TableCell>{formatDate(periode.awal_lpj)}</TableCell>
              <TableCell>{formatDate(periode.akhir_lpj)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onViewDetail(periode)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onEdit(periode)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </AlertDialogTrigger>
                    <PeriodeDeleteDialog 
                      periode={periode} 
                      onDelete={() => onDelete(periode.id)} 
                    />
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {periodes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6">
                Tidak ada data periode
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
