
import React from "react";
import { DocumentStatus, RAB } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ResponsiveTable,
  ResponsiveTableBody,
  ResponsiveTableCell,
  ResponsiveTableHead,
  ResponsiveTableHeader,
  ResponsiveTableRow,
} from "@/components/ui/responsive-table";

interface RABTableProps {
  data?: RAB[];
  rabs?: RAB[];
  title?: string;
  isLoading?: boolean;
  viewOnly?: boolean;
  onSelect?: (rab: RAB) => void;
  onApprove?: (rab: RAB) => void;
  onRevision?: (rab: RAB) => void;
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
  const isMobile = useIsMobile();
  
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
      <ResponsiveTable>
        <ResponsiveTableHeader>
          <ResponsiveTableRow>
            <ResponsiveTableHead>Periode</ResponsiveTableHead>
            <ResponsiveTableHead>Pondok</ResponsiveTableHead>
            <ResponsiveTableHead>Status</ResponsiveTableHead>
            <ResponsiveTableHead>Tanggal Pengajuan</ResponsiveTableHead>
            <ResponsiveTableHead>Saldo Awal</ResponsiveTableHead>
            <ResponsiveTableHead>Rencana Pemasukan</ResponsiveTableHead>
            <ResponsiveTableHead>Rencana Pengeluaran</ResponsiveTableHead>
            <ResponsiveTableHead className="text-right">Aksi</ResponsiveTableHead>
          </ResponsiveTableRow>
        </ResponsiveTableHeader>
        <ResponsiveTableBody>
          {items.map((rab) => (
            <ResponsiveTableRow key={rab.id} isCard={isMobile}>
              <ResponsiveTableCell 
                label="Periode" 
                isCard={isMobile}
              >
                {rab.periode ? `${rab.periode.tahun}-${String(rab.periode.bulan).padStart(2, '0')}` : "-"}
              </ResponsiveTableCell>
              <ResponsiveTableCell 
                label="Pondok" 
                isCard={isMobile}
              >
                {rab.pondok?.nama || "-"}
              </ResponsiveTableCell>
              <ResponsiveTableCell 
                label="Status" 
                isCard={isMobile}
              >
                {rab.status === DocumentStatus.DIAJUKAN ? (
                  <Badge variant="outline">Diajukan</Badge>
                ) : rab.status === DocumentStatus.DITERIMA ? (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    Diterima
                  </Badge>
                ) : (
                  <Badge variant="destructive">Revisi</Badge>
                )}
              </ResponsiveTableCell>
              <ResponsiveTableCell 
                label="Tanggal Pengajuan" 
                isCard={isMobile}
              >
                {rab.submitted_at
                  ? new Date(rab.submitted_at).toLocaleDateString("id-ID")
                  : "-"}
              </ResponsiveTableCell>
              <ResponsiveTableCell 
                label="Saldo Awal" 
                isCard={isMobile}
              >
                {formatCurrency(rab.saldo_awal || 0)}
              </ResponsiveTableCell>
              <ResponsiveTableCell 
                label="Rencana Pemasukan" 
                isCard={isMobile}
              >
                {formatCurrency(rab.rencana_pemasukan || 0)}
              </ResponsiveTableCell>
              <ResponsiveTableCell 
                label="Rencana Pengeluaran" 
                isCard={isMobile}
              >
                {formatCurrency(rab.rencana_pengeluaran || 0)}
              </ResponsiveTableCell>
              <ResponsiveTableCell 
                label="Aksi" 
                isCard={isMobile}
                className={isMobile ? "justify-center" : "text-right"}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewAction(rab)}
                >
                  <Eye className="h-4 w-4 mr-1" /> Detail
                </Button>
              </ResponsiveTableCell>
            </ResponsiveTableRow>
          ))}
        </ResponsiveTableBody>
      </ResponsiveTable>
    </div>
  );
};
