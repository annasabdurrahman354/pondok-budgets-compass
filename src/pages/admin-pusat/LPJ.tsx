
import React, { useState } from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { LPJTable } from "@/components/tables/LPJTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentStatus, LPJ } from "@/types";
import { formatPeriode } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchAllPeriode, fetchLPJsByPeriode, getFileUrl } from "@/services/api";
import { LPJReviewForm } from "@/components/review/LPJReviewForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeClass, formatCurrency } from "@/lib/utils";
import { AlertTriangle, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const LPJPage: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");
  const [selectedLPJ, setSelectedLPJ] = useState<LPJ | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isReviseDialogOpen, setIsReviseDialogOpen] = useState(false);
  
  // Fetch periods
  const { 
    data: periods = [], 
    isLoading: isLoadingPeriods,
  } = useQuery({
    queryKey: ['periods'],
    queryFn: () => fetchAllPeriode(),
  });

  const [selectedPeriode, setSelectedPeriode] = useState<string | null>(
    periods.length > 0 ? periods[0]?.id : null
  );

  // Set selected period when periods are loaded
  React.useEffect(() => {
    if (periods.length > 0 && !selectedPeriode) {
      setSelectedPeriode(periods[0].id);
    }
  }, [periods, selectedPeriode]);

  // Fetch LPJs
  const {
    data: lpjs = [],
    isLoading: isLoadingLPJs,
    refetch: refetchLPJs,
  } = useQuery({
    queryKey: ['lpjs', selectedPeriode],
    queryFn: () => selectedPeriode ? fetchLPJsByPeriode(selectedPeriode) : Promise.resolve([]),
    enabled: !!selectedPeriode,
  });

  // Filter LPJs based on search text and status
  const filteredLPJs = lpjs.filter(
    (lpj) => {
      const pondokNameMatch = lpj.pondok?.nama.toLowerCase().includes(searchText.toLowerCase()) || searchText === "";
      const statusMatch = statusFilter === "all" || lpj.status === statusFilter;
      return pondokNameMatch && statusMatch;
    }
  );

  // Group LPJs by status
  const diajukanLPJs = filteredLPJs.filter((lpj) => lpj.status === DocumentStatus.DIAJUKAN);
  const diterimaLPJs = filteredLPJs.filter((lpj) => lpj.status === DocumentStatus.DITERIMA);
  const revisiLPJs = filteredLPJs.filter((lpj) => lpj.status === DocumentStatus.REVISI);

  const handleViewLPJ = (lpj: LPJ) => {
    setSelectedLPJ(lpj);
    setIsViewDialogOpen(true);
  };

  const handleApproveLPJ = (lpj: LPJ) => {
    setSelectedLPJ(lpj);
    setIsApproveDialogOpen(true);
  };

  const handleReviseLPJ = (lpj: LPJ) => {
    setSelectedLPJ(lpj);
    setIsReviseDialogOpen(true);
  };
  
  const handleStatusUpdated = () => {
    refetchLPJs();
  };
  
  const getDocumentUrl = (lpj: LPJ) => {
    if (!lpj.dokumen_path) return "";
    return getFileUrl('bukti_lpj', lpj.dokumen_path);
  };

  return (
    <AdminPusatLayout title="Laporan Pertanggungjawaban (LPJ)">
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          {isLoadingPeriods ? (
            <Skeleton className="h-10 w-[180px]" />
          ) : (
            <Select
              value={selectedPeriode || ""}
              onValueChange={setSelectedPeriode}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {formatPeriode(period.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as DocumentStatus | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value={DocumentStatus.DIAJUKAN}>Diajukan</SelectItem>
              <SelectItem value={DocumentStatus.DITERIMA}>Diterima</SelectItem>
              <SelectItem value={DocumentStatus.REVISI}>Revisi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-3">
          <Input
            placeholder="Cari pondok..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      {isLoadingLPJs ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Tabs defaultValue="diajukan" className="w-full">
          <TabsList className="mb-6 w-full justify-start">
            <TabsTrigger value="diajukan">
              Diajukan ({diajukanLPJs.length})
            </TabsTrigger>
            <TabsTrigger value="diterima">
              Diterima ({diterimaLPJs.length})
            </TabsTrigger>
            <TabsTrigger value="revisi">
              Revisi ({revisiLPJs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diajukan" className="animate-fade-in">
            <LPJTable
              data={diajukanLPJs}
              title="LPJ yang Sedang Diajukan"
              onView={handleViewLPJ}
              onApprove={handleApproveLPJ}
              onRevision={handleReviseLPJ}
            />
          </TabsContent>

          <TabsContent value="diterima" className="animate-fade-in">
            <LPJTable
              data={diterimaLPJs}
              title="LPJ yang Telah Diterima"
              onView={handleViewLPJ}
            />
          </TabsContent>

          <TabsContent value="revisi" className="animate-fade-in">
            <LPJTable
              data={revisiLPJs}
              title="LPJ yang Perlu Revisi"
              onView={handleViewLPJ}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {/* View LPJ Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Detail LPJ - {selectedLPJ?.pondok?.nama}
            </DialogTitle>
            <DialogDescription>
              Periode: {selectedLPJ && formatPeriode(selectedLPJ.periode_id)} | 
              Status: {selectedLPJ && (
                <Badge className={selectedLPJ ? getStatusBadgeClass(selectedLPJ.status) : ""}>
                  {selectedLPJ?.status === DocumentStatus.DIAJUKAN
                    ? "Diajukan"
                    : selectedLPJ?.status === DocumentStatus.DITERIMA
                    ? "Diterima"
                    : "Revisi"}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedLPJ && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Saldo Awal</h3>
                  <p className="text-lg">{formatCurrency(selectedLPJ.saldo_awal)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tanggal Pengajuan</h3>
                  <p className="text-lg">
                    {selectedLPJ.submitted_at
                      ? new Date(selectedLPJ.submitted_at).toLocaleDateString("id-ID")
                      : "-"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Rencana Pemasukan</h3>
                  <p className="text-lg">{formatCurrency(selectedLPJ.rencana_pemasukan)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Realisasi Pemasukan</h3>
                  <p className="text-lg">{formatCurrency(selectedLPJ.realisasi_pemasukan)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Rencana Pengeluaran</h3>
                  <p className="text-lg">{formatCurrency(selectedLPJ.rencana_pengeluaran)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Realisasi Pengeluaran</h3>
                  <p className="text-lg">{formatCurrency(selectedLPJ.realisasi_pengeluaran)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Sisa Saldo</h3>
                  <p className="text-lg font-bold">{formatCurrency(selectedLPJ.sisa_saldo)}</p>
                </div>
                
                {selectedLPJ.accepted_at && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tanggal Disetujui</h3>
                    <p className="text-lg">
                      {new Date(selectedLPJ.accepted_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedLPJ.dokumen_path && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Dokumen LPJ</h3>
                  <a 
                    href={getDocumentUrl(selectedLPJ)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Lihat Dokumen LPJ
                  </a>
                </div>
              )}
              
              {selectedLPJ.pesan_revisi && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Pesan Revisi</AlertTitle>
                  <AlertDescription>
                    {selectedLPJ.pesan_revisi}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end gap-3">
                {selectedLPJ.status === DocumentStatus.DIAJUKAN && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        handleReviseLPJ(selectedLPJ);
                      }}
                    >
                      Minta Revisi
                    </Button>
                    <Button
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        handleApproveLPJ(selectedLPJ);
                      }}
                    >
                      Setujui
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* LPJ Review Forms */}
      {selectedLPJ && (
        <>
          <LPJReviewForm
            lpj={selectedLPJ}
            isOpen={isApproveDialogOpen}
            onClose={() => setIsApproveDialogOpen(false)}
            onStatusUpdated={handleStatusUpdated}
            action="approve"
          />
          <LPJReviewForm
            lpj={selectedLPJ}
            isOpen={isReviseDialogOpen}
            onClose={() => setIsReviseDialogOpen(false)}
            onStatusUpdated={handleStatusUpdated}
            action="revise"
          />
        </>
      )}
    </AdminPusatLayout>
  );
};

export default LPJPage;
