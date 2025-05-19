
import React from "react";
import { DocumentStatus, LPJ } from "@/types";
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

interface LPJTableProps {
  data?: LPJ[];
  lpjs?: LPJ[];
  title?: string;
  isLoading?: boolean;
  viewOnly?: boolean;
  onSelect?: (lpj: LPJ) => void;
  onApprove?: (lpj: LPJ) => void;
  onRevision?: (lpj: LPJ) => void;
  // Adding onView prop for backward compatibility
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
  
  // Handle both data and lpjs props for backward compatibility
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

  // Handle view action based on different props
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
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Periode</TableHead>
              <TableHead className="whitespace-nowrap">Pondok</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Tanggal Pengajuan</TableHead>
              <TableHead className="whitespace-nowrap">Realisasi Pemasukan</TableHead>
              <TableHead className="whitespace-nowrap">Realisasi Pengeluaran</TableHead>
              <TableHead className="whitespace-nowrap">Sisa Saldo</TableHead>
              <TableHead className="whitespace-nowrap text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((lpj) => (
              <TableRow key={lpj.id}>
                <TableCell className="whitespace-nowrap">
                  {lpj.periode ? `${lpj.periode.tahun}-${String(lpj.periode.bulan).padStart(2, '0')}` : "-"}
                </TableCell>
                <TableCell className="whitespace-nowrap">{lpj.pondok?.nama || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {lpj.status === DocumentStatus.DIAJUKAN ? (
                    <Badge variant="outline">Diajukan</Badge>
                  ) : lpj.status === DocumentStatus.DITERIMA ? (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      Diterima
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Revisi</Badge>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {lpj.submitted_at
                    ? new Date(lpj.submitted_at).toLocaleDateString("id-ID")
                    : "-"}
                </TableCell>
                <TableCell className="whitespace-nowrap">{formatCurrency(lpj.realisasi_pemasukan || 0)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatCurrency(lpj.realisasi_pengeluaran || 0)}</TableCell>
                <TableCell className="whitespace-nowrap">{formatCurrency(lpj.sisa_saldo || 0)}</TableCell>
                <TableCell className="whitespace-nowrap text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewAction(lpj)}
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
