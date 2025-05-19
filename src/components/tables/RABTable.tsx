
import React from "react";
import { DocumentStatus, RAB } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RABTableProps {
  data?: RAB[];
  rabs?: RAB[];
  isLoading?: boolean;
  viewOnly?: boolean; // Set to true to only show view button
  onSelect?: (rab: RAB) => void;
  onApprove?: (rab: RAB) => void;
  onRevision?: (rab: RAB) => void;
}

export const RABTable: React.FC<RABTableProps> = ({
  data,
  rabs,
  isLoading = false,
  viewOnly = false,
  onSelect,
  onApprove,
  onRevision,
}) => {
  const navigate = useNavigate();
  
  // Handle both data and rabs props for backward compatibility
  const items = data || rabs || [];

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p>Memuat data...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Belum ada data RAB</p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="min-w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Periode</TableHead>
              <TableHead>Pondok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal Pengajuan</TableHead>
              <TableHead>Saldo Awal</TableHead>
              <TableHead>Rencana Pemasukan</TableHead>
              <TableHead>Rencana Pengeluaran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((rab) => (
              <TableRow key={rab.id}>
                <TableCell>
                  {rab.periode ? `${rab.periode.tahun}-${String(rab.periode.bulan).padStart(2, '0')}` : "-"}
                </TableCell>
                <TableCell>{rab.pondok?.nama || "-"}</TableCell>
                <TableCell>
                  {rab.status === DocumentStatus.DIAJUKAN ? (
                    <Badge variant="outline">Diajukan</Badge>
                  ) : rab.status === DocumentStatus.DITERIMA ? (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Diterima
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Revisi</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {rab.submitted_at
                    ? new Date(rab.submitted_at).toLocaleDateString("id-ID")
                    : "-"}
                </TableCell>
                <TableCell>{formatCurrency(rab.saldo_awal || 0)}</TableCell>
                <TableCell>{formatCurrency(rab.rencana_pemasukan || 0)}</TableCell>
                <TableCell>{formatCurrency(rab.rencana_pengeluaran || 0)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => (viewOnly ? navigate(`/admin-pondok/rab/${rab.id}`) : onSelect?.(rab))}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
};
