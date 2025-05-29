
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DocumentStatus, RAB, LPJ, Pondok, Periode } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAllRAB, fetchAllLPJ, fetchAllPondoks, fetchCurrentPeriode } from "@/services/api";

interface CombinedRABLPJTableProps {
  type: 'rab' | 'lpj';
}

interface CombinedData {
  pondok: Pondok;
  document?: RAB | LPJ;
  hasDocument: boolean;
}

export const CombinedRABLPJTable: React.FC<CombinedRABLPJTableProps> = ({ type }) => {
  const navigate = useNavigate();
  const [selectedPeriode, setSelectedPeriode] = useState<string>("");

  const { data: currentPeriode } = useQuery({
    queryKey: ['currentPeriode'],
    queryFn: fetchCurrentPeriode
  });

  const { data: rabs = [] } = useQuery({
    queryKey: ['allRABs'],
    queryFn: fetchAllRAB,
    enabled: type === 'rab'
  });

  const { data: lpjs = [] } = useQuery({
    queryKey: ['allLPJs'],
    queryFn: fetchAllLPJ,
    enabled: type === 'lpj'
  });

  const { data: pondoks = [] } = useQuery({
    queryKey: ['pondoks'],
    queryFn: fetchAllPondoks
  });

  // Set current periode as default when it loads
  React.useEffect(() => {
    if (currentPeriode && !selectedPeriode) {
      setSelectedPeriode(currentPeriode.id);
    }
  }, [currentPeriode, selectedPeriode]);

  // Filter documents by selected periode
  const documents = type === 'rab' ? rabs : lpjs;
  const filteredDocuments = documents.filter(doc => 
    selectedPeriode ? doc.periode_id === selectedPeriode : true
  );

  // Combine pondoks with their documents
  const combinedData: CombinedData[] = pondoks.map(pondok => {
    const document = filteredDocuments.find(doc => doc.pondok_id === pondok.id);
    return {
      pondok,
      document,
      hasDocument: !!document
    };
  });

  const getStatusBadge = (status?: DocumentStatus) => {
    if (!status) return <Badge variant="outline" className="bg-gray-100 text-gray-600">Belum Dibuat</Badge>;
    
    switch (status) {
      case DocumentStatus.DIAJUKAN:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Diajukan</Badge>;
      case DocumentStatus.DITERIMA:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Diterima</Badge>;
      case DocumentStatus.REVISI:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Revisi</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleViewAction = (data: CombinedData) => {
    if (data.hasDocument) {
      navigate(`/admin-pusat/${type}/${data.document!.id}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Period Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Periode:</label>
        <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Pilih periode" />
          </SelectTrigger>
          <SelectContent>
            {currentPeriode && (
              <SelectItem value={currentPeriode.id}>
                {currentPeriode.tahun}-{String(currentPeriode.bulan).padStart(2, '0')} (Terkini)
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Pondok</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Status {type.toUpperCase()}</TableHead>
              <TableHead>Tanggal Pengajuan</TableHead>
              {type === 'rab' && (
                <>
                  <TableHead>Saldo Awal</TableHead>
                  <TableHead>Rencana Pemasukan</TableHead>
                  <TableHead>Rencana Pengeluaran</TableHead>
                </>
              )}
              {type === 'lpj' && (
                <>
                  <TableHead>Realisasi Pemasukan</TableHead>
                  <TableHead>Realisasi Pengeluaran</TableHead>
                  <TableHead>Sisa Saldo</TableHead>
                </>
              )}
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinedData.map((data) => (
              <TableRow key={data.pondok.id}>
                <TableCell className="font-medium">{data.pondok.nama}</TableCell>
                <TableCell>{data.pondok.jenis?.toUpperCase()}</TableCell>
                <TableCell>{getStatusBadge(data.document?.status)}</TableCell>
                <TableCell>
                  {data.document?.submitted_at
                    ? new Date(data.document.submitted_at).toLocaleDateString("id-ID")
                    : "-"}
                </TableCell>
                {type === 'rab' && (
                  <>
                    <TableCell>{data.document ? formatCurrency((data.document as RAB).saldo_awal || 0) : "-"}</TableCell>
                    <TableCell>{data.document ? formatCurrency((data.document as RAB).rencana_pemasukan || 0) : "-"}</TableCell>
                    <TableCell>{data.document ? formatCurrency((data.document as RAB).rencana_pengeluaran || 0) : "-"}</TableCell>
                  </>
                )}
                {type === 'lpj' && (
                  <>
                    <TableCell>{data.document ? formatCurrency((data.document as LPJ).realisasi_pemasukan || 0) : "-"}</TableCell>
                    <TableCell>{data.document ? formatCurrency((data.document as LPJ).realisasi_pengeluaran || 0) : "-"}</TableCell>
                    <TableCell>{data.document ? formatCurrency((data.document as LPJ).sisa_saldo || 0) : "-"}</TableCell>
                  </>
                )}
                <TableCell className="text-right">
                  {data.hasDocument ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewAction(data)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Detail
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Belum Tersedia
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
