
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
  title?: string;
  isLoading?: boolean;
  viewOnly?: boolean;
  onSelect?: (rab: RAB) => void;
  onApprove?: (rab: RAB) => void;
  onRevision?: (rab: RAB) => void;
  // Adding onView prop for backward compatibility
  onView?: (rab: RAB) => void;
}

export const RABTable: React.FC<RABTableProps> = ({
  data,
  rabs,
  title,
  isLoading = false,
  viewOnly = false,
  onSelect,
  onApprove,
  onRevision,
  onView,
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

  // Handle view action based on different props
  const handleViewAction = (rab: RAB) => {
    if (viewOnly) {
      navigate(`/admin-pondok/rab/${rab.id}`);
    } else if (onView) {
      onView(rab);
    } else if (onSelect) {
      onSelect(rab);
    }
  };

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-medium mb-3">{title}</h3>}
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Periode</TableHead>
              <TableHead className="whitespace-nowrap">Pondok</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Tanggal Pengajuan</TableHead>
              <TableHead className="whitespace-nowrap">Saldo Awal</TableHead>
              <TableHead className="whitespace-nowrap">Rencana Pemasukan</TableHead>
              <TableHead className="whitespace-nowrap">Rencana Pengeluaran</TableHead>
              <TableHead className="whitespace-nowrap text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((rab) => (
              <TableRow key={rab.id}>
                <TableCell className="whitespace-nowrap">
                  {rab.periode ? `${rab.periode.tahun}-${String(rab.periode.bulan).padStart(2, '0')}` : "-"}
                </TableCell>
                <TableCell className="whitespace-nowrap">{rab.pondok?.nama || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">
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
                <TableCell className="whitespace-nowrap">
                  {rab.submitted_at
                    ? new Date(rab.submitted_at).toLocaleDateString("id-ID")
                    : "-"}
                </TableCell>
                <TableCell className="whitespace-nowrap">{formatCurrency(rab.saldo_awal || 0)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatCurrency(rab.rencana_pemasukan || 0)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatCurrency(rab.rencana_pengeluaran || 0)}</TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewAction(rab)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
