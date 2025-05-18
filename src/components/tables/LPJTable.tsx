
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LPJ, DocumentStatus } from "@/types";
import { formatCurrency, formatPeriode, getStatusBadgeClass } from "@/lib/utils";
import { FileText, CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface LPJTableProps {
  data: LPJ[];
  title?: string;
  onView?: (lpj: LPJ) => void;
  onApprove?: (lpj: LPJ) => void;
  onRevision?: (lpj: LPJ) => void;
}

export const LPJTable: React.FC<LPJTableProps> = ({
  data,
  title = "Daftar LPJ",
  onView,
  onApprove,
  onRevision,
}) => {
  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Belum ada data LPJ
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pondok</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Saldo Awal</TableHead>
                  <TableHead>Realisasi Pemasukan</TableHead>
                  <TableHead>Realisasi Pengeluaran</TableHead>
                  <TableHead>Sisa Saldo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((lpj) => (
                  <TableRow key={lpj.pondok_id + lpj.periode_id}>
                    <TableCell className="font-medium">
                      {lpj.pondok?.nama || "Unknown"}
                    </TableCell>
                    <TableCell>{formatPeriode(lpj.periode_id)}</TableCell>
                    <TableCell>{formatCurrency(lpj.saldo_awal)}</TableCell>
                    <TableCell>{formatCurrency(lpj.realisasi_pemasukan)}</TableCell>
                    <TableCell>{formatCurrency(lpj.realisasi_pengeluaran)}</TableCell>
                    <TableCell>{formatCurrency(lpj.sisa_saldo)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(lpj.status)}>
                        {lpj.status === DocumentStatus.DIAJUKAN
                          ? "Diajukan"
                          : lpj.status === DocumentStatus.DITERIMA
                          ? "Diterima"
                          : "Revisi"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onView(lpj)}
                            className="h-8 w-8 p-0"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Lihat</span>
                          </Button>
                        )}
                        {onApprove && lpj.status === DocumentStatus.DIAJUKAN && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-700"
                            onClick={() => onApprove(lpj)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Setujui</span>
                          </Button>
                        )}
                        {onRevision && lpj.status === DocumentStatus.DIAJUKAN && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => onRevision(lpj)}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Revisi</span>
                          </Button>
                        )}
                        {lpj.dokumen_path && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            asChild
                          >
                            <a href="#" target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">Dokumen</span>
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
