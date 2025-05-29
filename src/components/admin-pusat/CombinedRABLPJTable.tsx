
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DocumentStatus, RAB, LPJ, Pondok, Periode } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAllRAB, fetchAllLPJ, fetchAllPondoks, fetchCurrentPeriode, fetchAllPeriode } from "@/services/api";
import { toast } from "sonner";

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
  const isMobile = useIsMobile();
  const [selectedPeriode, setSelectedPeriode] = useState<string>("");

  const { data: currentPeriode } = useQuery({
    queryKey: ['currentPeriode'],
    queryFn: fetchCurrentPeriode
  });

  const { data: allPeriodes = [] } = useQuery({
    queryKey: ['allPeriodes'],
    queryFn: fetchAllPeriode
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

  const handleExportExcel = () => {
    const selectedPeriodeName = allPeriodes.find(p => p.id === selectedPeriode);
    if (!selectedPeriodeName) {
      toast.error("Pilih periode terlebih dahulu");
      return;
    }

    // Create CSV data
    const headers = [
      'Nama Pondok',
      'Jenis',
      `Status ${type.toUpperCase()}`,
      'Tanggal Pengajuan',
      ...(type === 'rab' ? ['Saldo Awal', 'Rencana Pemasukan', 'Rencana Pengeluaran'] : ['Realisasi Pemasukan', 'Realisasi Pengeluaran', 'Sisa Saldo'])
    ];

    const csvContent = [
      headers.join(','),
      ...combinedData.map(data => [
        `"${data.pondok.nama}"`,
        `"${data.pondok.jenis?.toUpperCase() || ''}"`,
        `"${data.document?.status || 'Belum Dibuat'}"`,
        `"${data.document?.submitted_at ? new Date(data.document.submitted_at).toLocaleDateString("id-ID") : '-'}"`,
        ...(type === 'rab' ? [
          data.document ? (data.document as RAB).saldo_awal || 0 : 0,
          data.document ? (data.document as RAB).rencana_pemasukan || 0 : 0,
          data.document ? (data.document as RAB).rencana_pengeluaran || 0 : 0
        ] : [
          data.document ? (data.document as LPJ).realisasi_pemasukan || 0 : 0,
          data.document ? (data.document as LPJ).realisasi_pengeluaran || 0 : 0,
          data.document ? (data.document as LPJ).sisa_saldo || 0 : 0
        ])
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type.toUpperCase()}_${selectedPeriodeName.tahun}_${selectedPeriodeName.bulan}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Export ${type.toUpperCase()} berhasil`);
  };

  return (
    <div className="space-y-4">
      {/* Period Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Periode:</label>
          <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              {allPeriodes.map((periode) => (
                <SelectItem key={periode.id} value={periode.id}>
                  {periode.tahun}-{String(periode.bulan).padStart(2, '0')}
                  {currentPeriode?.id === periode.id && ' (Terkini)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={handleExportExcel}
          disabled={!selectedPeriode}
          variant="outline"
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border">
        <ResponsiveTable>
          <ResponsiveTableHeader>
            <ResponsiveTableRow>
              <ResponsiveTableHead>Nama Pondok</ResponsiveTableHead>
              <ResponsiveTableHead>Jenis</ResponsiveTableHead>
              <ResponsiveTableHead>Status {type.toUpperCase()}</ResponsiveTableHead>
              <ResponsiveTableHead>Tanggal Pengajuan</ResponsiveTableHead>
              {type === 'rab' && (
                <>
                  <ResponsiveTableHead>Saldo Awal</ResponsiveTableHead>
                  <ResponsiveTableHead>Rencana Pemasukan</ResponsiveTableHead>
                  <ResponsiveTableHead>Rencana Pengeluaran</ResponsiveTableHead>
                </>
              )}
              {type === 'lpj' && (
                <>
                  <ResponsiveTableHead>Realisasi Pemasukan</ResponsiveTableHead>
                  <ResponsiveTableHead>Realisasi Pengeluaran</ResponsiveTableHead>
                  <ResponsiveTableHead>Sisa Saldo</ResponsiveTableHead>
                </>
              )}
              <ResponsiveTableHead className="text-right">Aksi</ResponsiveTableHead>
            </ResponsiveTableRow>
          </ResponsiveTableHeader>
          <ResponsiveTableBody>
            {combinedData.map((data) => (
              <ResponsiveTableRow key={data.pondok.id} isCard={isMobile}>
                <ResponsiveTableCell 
                  label="Nama Pondok" 
                  isCard={isMobile}
                  className="font-medium"
                >
                  {data.pondok.nama}
                </ResponsiveTableCell>
                <ResponsiveTableCell 
                  label="Jenis" 
                  isCard={isMobile}
                >
                  {data.pondok.jenis?.toUpperCase()}
                </ResponsiveTableCell>
                <ResponsiveTableCell 
                  label={`Status ${type.toUpperCase()}`} 
                  isCard={isMobile}
                >
                  {getStatusBadge(data.document?.status)}
                </ResponsiveTableCell>
                <ResponsiveTableCell 
                  label="Tanggal Pengajuan" 
                  isCard={isMobile}
                >
                  {data.document?.submitted_at
                    ? new Date(data.document.submitted_at).toLocaleDateString("id-ID")
                    : "-"}
                </ResponsiveTableCell>
                {type === 'rab' && (
                  <>
                    <ResponsiveTableCell 
                      label="Saldo Awal" 
                      isCard={isMobile}
                    >
                      {data.document ? formatCurrency((data.document as RAB).saldo_awal || 0) : "-"}
                    </ResponsiveTableCell>
                    <ResponsiveTableCell 
                      label="Rencana Pemasukan" 
                      isCard={isMobile}
                    >
                      {data.document ? formatCurrency((data.document as RAB).rencana_pemasukan || 0) : "-"}
                    </ResponsiveTableCell>
                    <ResponsiveTableCell 
                      label="Rencana Pengeluaran" 
                      isCard={isMobile}
                    >
                      {data.document ? formatCurrency((data.document as RAB).rencana_pengeluaran || 0) : "-"}
                    </ResponsiveTableCell>
                  </>
                )}
                {type === 'lpj' && (
                  <>
                    <ResponsiveTableCell 
                      label="Realisasi Pemasukan" 
                      isCard={isMobile}
                    >
                      {data.document ? formatCurrency((data.document as LPJ).realisasi_pemasukan || 0) : "-"}
                    </ResponsiveTableCell>
                    <ResponsiveTableCell 
                      label="Realisasi Pengeluaran" 
                      isCard={isMobile}
                    >
                      {data.document ? formatCurrency((data.document as LPJ).realisasi_pengeluaran || 0) : "-"}
                    </ResponsiveTableCell>
                    <ResponsiveTableCell 
                      label="Sisa Saldo" 
                      isCard={isMobile}
                    >
                      {data.document ? formatCurrency((data.document as LPJ).sisa_saldo || 0) : "-"}
                    </ResponsiveTableCell>
                  </>
                )}
                <ResponsiveTableCell 
                  label="Aksi" 
                  isCard={isMobile}
                  className={isMobile ? "justify-center" : "text-right"}
                >
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
                </ResponsiveTableCell>
              </ResponsiveTableRow>
            ))}
          </ResponsiveTableBody>
        </ResponsiveTable>
      </div>
    </div>
  );
};
