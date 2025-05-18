
import React, { useState } from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { RABTable } from "@/components/tables/RABTable";
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
import { DocumentStatus, RAB } from "@/types";
import { formatPeriode } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchAllPeriode, fetchRABsByPeriode, getFileUrl } from "@/services/api";
import { RABReviewForm } from "@/components/review/RABReviewForm";
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

const RABPage: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");
  const [selectedRAB, setSelectedRAB] = useState<RAB | null>(null);
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

  // Fetch RABs
  const {
    data: rabs = [],
    isLoading: isLoadingRABs,
    refetch: refetchRABs,
  } = useQuery({
    queryKey: ['rabs', selectedPeriode],
    queryFn: () => selectedPeriode ? fetchRABsByPeriode(selectedPeriode) : Promise.resolve([]),
    enabled: !!selectedPeriode,
  });

  // Filter RABs based on search text and status
  const filteredRABs = rabs.filter(
    (rab) => {
      const pondokNameMatch = rab.pondok?.nama.toLowerCase().includes(searchText.toLowerCase()) || searchText === "";
      const statusMatch = statusFilter === "all" || rab.status === statusFilter;
      return pondokNameMatch && statusMatch;
    }
  );

  // Group RABs by status
  const diajukanRABs = filteredRABs.filter((rab) => rab.status === DocumentStatus.DIAJUKAN);
  const diterimaRABs = filteredRABs.filter((rab) => rab.status === DocumentStatus.DITERIMA);
  const revisiRABs = filteredRABs.filter((rab) => rab.status === DocumentStatus.REVISI);

  const handleViewRAB = (rab: RAB) => {
    setSelectedRAB(rab);
    setIsViewDialogOpen(true);
  };

  const handleApproveRAB = (rab: RAB) => {
    setSelectedRAB(rab);
    setIsApproveDialogOpen(true);
  };

  const handleReviseRAB = (rab: RAB) => {
    setSelectedRAB(rab);
    setIsReviseDialogOpen(true);
  };
  
  const handleStatusUpdated = () => {
    refetchRABs();
  };
  
  const getDocumentUrl = (rab: RAB) => {
    if (!rab.dokumen_path) return "";
    return getFileUrl('bukti_rab', rab.dokumen_path);
  };

  return (
    <AdminPusatLayout title="Rencana Anggaran Belanja (RAB)">
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

      {isLoadingRABs ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Tabs defaultValue="diajukan" className="w-full">
          <TabsList className="mb-6 w-full justify-start">
            <TabsTrigger value="diajukan">
              Diajukan ({diajukanRABs.length})
            </TabsTrigger>
            <TabsTrigger value="diterima">
              Diterima ({diterimaRABs.length})
            </TabsTrigger>
            <TabsTrigger value="revisi">
              Revisi ({revisiRABs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="diajukan" className="animate-fade-in">
            <RABTable
              data={diajukanRABs}
              title="RAB yang Sedang Diajukan"
              onView={handleViewRAB}
              onApprove={handleApproveRAB}
              onRevision={handleReviseRAB}
            />
          </TabsContent>

          <TabsContent value="diterima" className="animate-fade-in">
            <RABTable
              data={diterimaRABs}
              title="RAB yang Telah Diterima"
              onView={handleViewRAB}
            />
          </TabsContent>

          <TabsContent value="revisi" className="animate-fade-in">
            <RABTable
              data={revisiRABs}
              title="RAB yang Perlu Revisi"
              onView={handleViewRAB}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {/* View RAB Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Detail RAB - {selectedRAB?.pondok?.nama}
            </DialogTitle>
            <DialogDescription>
              Periode: {selectedRAB && formatPeriode(selectedRAB.periode_id)} | 
              Status: {selectedRAB && (
                <Badge className={selectedRAB ? getStatusBadgeClass(selectedRAB.status) : ""}>
                  {selectedRAB?.status === DocumentStatus.DIAJUKAN
                    ? "Diajukan"
                    : selectedRAB?.status === DocumentStatus.DITERIMA
                    ? "Diterima"
                    : "Revisi"}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRAB && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Saldo Awal</h3>
                  <p className="text-lg">{formatCurrency(selectedRAB.saldo_awal)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tanggal Pengajuan</h3>
                  <p className="text-lg">
                    {selectedRAB.submitted_at
                      ? new Date(selectedRAB.submitted_at).toLocaleDateString("id-ID")
                      : "-"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Rencana Pemasukan</h3>
                  <p className="text-lg">{formatCurrency(selectedRAB.rencana_pemasukan)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Rencana Pengeluaran</h3>
                  <p className="text-lg">{formatCurrency(selectedRAB.rencana_pengeluaran)}</p>
                </div>
                
                {selectedRAB.accepted_at && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tanggal Disetujui</h3>
                    <p className="text-lg">
                      {new Date(selectedRAB.accepted_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedRAB.dokumen_path && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Dokumen RAB</h3>
                  <a 
                    href={getDocumentUrl(selectedRAB)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Lihat Dokumen RAB
                  </a>
                </div>
              )}
              
              {selectedRAB.pesan_revisi && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Pesan Revisi</AlertTitle>
                  <AlertDescription>
                    {selectedRAB.pesan_revisi}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex justify-end gap-3">
                {selectedRAB.status === DocumentStatus.DIAJUKAN && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        handleReviseRAB(selectedRAB);
                      }}
                    >
                      Minta Revisi
                    </Button>
                    <Button
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        handleApproveRAB(selectedRAB);
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
      
      {/* RAB Review Forms */}
      {selectedRAB && (
        <>
          <RABReviewForm
            rab={selectedRAB}
            isOpen={isApproveDialogOpen}
            onClose={() => setIsApproveDialogOpen(false)}
            onStatusUpdated={handleStatusUpdated}
            action="approve"
          />
          <RABReviewForm
            rab={selectedRAB}
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

export default RABPage;
