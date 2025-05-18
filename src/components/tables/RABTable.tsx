
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
import { RAB, DocumentStatus } from "@/types";
import { formatCurrency, formatPeriode, getStatusBadgeClass } from "@/lib/utils";
import { FileText, CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface RABTableProps {
  data: RAB[];
  title?: string;
  onView?: (rab: RAB) => void;
  onApprove?: (rab: RAB) => void;
  onRevision?: (rab: RAB) => void;
}

export const RABTable: React.FC<RABTableProps> = ({
  data,
  title = "Daftar RAB",
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
            Belum ada data RAB
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pondok</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Saldo Awal</TableHead>
                  <TableHead>Rencana Pemasukan</TableHead>
                  <TableHead>Rencana Pengeluaran</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((rab) => (
                  <TableRow key={rab.pondok_id + rab.periode_id}>
                    <TableCell className="font-medium">
                      {rab.pondok?.nama || "Unknown"}
                    </TableCell>
                    <TableCell>{formatPeriode(rab.periode_id)}</TableCell>
                    <TableCell>{formatCurrency(rab.saldo_awal)}</TableCell>
                    <TableCell>{formatCurrency(rab.rencana_pemasukan)}</TableCell>
                    <TableCell>{formatCurrency(rab.rencana_pengeluaran)}</TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusBadgeClass(rab.status)}
                      >
                        {rab.status === DocumentStatus.DIAJUKAN
                          ? "Diajukan"
                          : rab.status === DocumentStatus.DITERIMA
                          ? "Diterima"
                          : "Revisi"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rab.submitted_at
                        ? new Date(rab.submitted_at).toLocaleDateString("id-ID")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onView(rab)}
                            className="h-8 w-8 p-0"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Lihat</span>
                          </Button>
                        )}
                        {onApprove && rab.status === DocumentStatus.DIAJUKAN && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-700"
                            onClick={() => onApprove(rab)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span className="sr-only">Setujui</span>
                          </Button>
                        )}
                        {onRevision && rab.status === DocumentStatus.DIAJUKAN && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => onRevision(rab)}
                          >
                            <XCircle className="h-4 w-4" />
                            <span className="sr-only">Revisi</span>
                          </Button>
                        )}
                        {rab.dokumen_path && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            asChild
                          >
                            <a
                              href="#"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
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
