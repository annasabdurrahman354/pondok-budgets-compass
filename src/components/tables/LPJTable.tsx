
import React from "react";
import { DocumentStatus, LPJ } from "@/types";
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

interface LPJTableProps {
  data?: LPJ[];
  lpjs?: LPJ[];
  title?: string;
  isLoading?: boolean;
  viewOnly?: boolean;
  onSelect?: (lpj: LPJ) => void;
  onApprove?: (lpj: LPJ) => void;
  onRevision?: (lpj: LPJ) => void;
  onView?: (lpj: LPJ) => void;
}

export const LPJTable: React.FC<LPJTableProps> = ({
  data,
  lpjs,
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
  
  const items = data || lpjs || [];

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
        <p className="text-muted-foreground">Belum ada data LPJ</p>
      </div>
    );
  }

  const handleViewAction = (lpj: LPJ) => {
    if (viewOnly) {
      navigate(`/admin-pondok/lpj/${lpj.id}`);
    } else if (onView) {
      onView(lpj);
    } else if (onSelect) {
      onSelect(lpj);
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
            <ResponsiveTableHead>Realisasi Pemasukan</ResponsiveTableHead>
            <ResponsiveTableHead>Realisasi Pengeluaran</ResponsiveTableHead>
            <ResponsiveTableHead>Sisa Saldo</ResponsiveTableHead>
            <ResponsiveTableHead className="text-right">Aksi</ResponsiveTableHead>
          </ResponsiveTableRow>
        </ResponsiveTableHeader>
        <ResponsiveTableBody>
          {items.map((lpj) => (
            <ResponsiveTableRow key={lpj.id} isCard={isMobile}>
              <ResponsiveTableCell 
                label="Periode" 
                isCard={isMobile}
              >
                {lpj.periode ? `${lpj.periode.tahun}-${String(lpj.periode.bulan).padStart(2, '0')}` : "-"}
              </ResponsiveTableCell>
              <ResponsiveTableCell 
                label="Pondok" 
                isCard={isMobile}
              >
                {lpj.pondok?.nama || "-"}
              </ResponsiveTableCell>
              <ResponsiveTableCell 
                label="Status" 
                isCard={isMobile}
              >
                {lpj.status === DocumentStatus.DIAJUKAN ? (
                  <Badge variant="outline">Diajukan</Badge>
                ) : lpj.status === DocumentStatus.DITERIMA ? (
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
                {lpj.submitted_at
                  ? new Date(lpj.submitted_at).toLocaleDateString("id-ID")
                  : "-"}
              </ResponsiveTableCell>
              <ResponsiveTableCell 
                label="Realisasi Pemasukan" 
                isCard={isMobile}
              >
                {formatCurrency(lpj.realisasi_pemasukan || 0)}
              </ResponsiveTableCell>
              <ResponsiveTableCell 
                label="Realisasi Pengeluaran" 
                isCard={isMobile}
              >
                {formatCurrency(lpj.realisasi_pengeluaran || 0)}
              </ResponsiveTableCell>
              <ResponsiveTableCell 
                label="Sisa Saldo" 
                isCard={isMobile}
              >
                {formatCurrency(lpj.sisa_saldo || 0)}
              </ResponsiveTableCell>
              <ResponsiveTableCell 
                label="Aksi" 
                isCard={isMobile}
                className={isMobile ? "justify-center" : "text-right"}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewAction(lpj)}
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
