
import React, { useState, useEffect } from "react";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeClass, formatCurrency, formatPeriode } from "@/lib/utils";
import { DocumentStatus, LPJ, Periode } from "@/types";
import { AlertTriangle, FileText, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { isWithinDateRange } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LPJForm } from "@/components/forms/LPJForm";
import { 
  fetchCurrentPeriode, 
  fetchLPJsByPondok, 
  fetchRABsByPondok, 
  getFileUrl 
} from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const LPJPage: React.FC = () => {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedLPJ, setSelectedLPJ] = useState<LPJ | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Fetch current period
  const { 
    data: periode,
    isLoading: isLoadingPeriode,
  } = useQuery({
    queryKey: ['periode', 'current'],
    queryFn: () => fetchCurrentPeriode(),
  });
  
  // Fetch LPJs
  const { 
    data: lpjs = [],
    isLoading: isLoadingLPJs,
    refetch: refetchLPJs,
  } = useQuery({
    queryKey: ['lpj', 'pondok', user?.pondok_id],
    queryFn: () => user?.pondok_id ? fetchLPJsByPondok(user.pondok_id) : Promise.resolve([]),
    enabled: !!user?.pondok_id,
  });
  
  // Fetch RABs to check if current period RAB exists and is approved
  const { 
    data: rabs = [],
    isLoading: isLoadingRABs,
  } = useQuery({
    queryKey: ['rab', 'pondok', user?.pondok_id],
    queryFn: () => user?.pondok_id ? fetchRABsByPondok(user.pondok_id) : Promise.resolve([]),
    enabled: !!user?.pondok_id,
  });
  
  const isLPJOpen = periode ? isWithinDateRange(periode.awal_lpj, periode.akhir_lpj) : false;
  const isPondokVerified = !!user?.pondok_id;
  const canCreateLPJ = isPondokVerified && isLPJOpen;
  
  // Check if LPJ for current period already exists
  const currentPeriodLPJ = periode ? lpjs.find(lpj => lpj.periode_id === periode.id) : null;
  const lpjSubmitted = !!currentPeriodLPJ;
  
  // Check if RAB for current period is approved
  const currentPeriodRAB = periode ? rabs.find(rab => 
    rab.periode_id === periode.id && rab.status === DocumentStatus.DITERIMA
  ) : null;
  
  const handleViewLPJ = (lpj: LPJ) => {
    setSelectedLPJ(lpj);
    setIsViewDialogOpen(true);
  };
  
  const getDocumentUrl = (lpj: LPJ) => {
    if (!lpj.dokumen_path) return "";
    return getFileUrl('bukti_lpj', lpj.dokumen_path);
  };

  return (
    <AdminPondokLayout title="Laporan Pertanggungjawaban (LPJ)">
      {!isPondokVerified && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Menunggu Verifikasi</AlertTitle>
          <AlertDescription>
            Data pondok Anda sedang menunggu verifikasi dari admin pusat. Pembuatan LPJ tidak dapat dilakukan hingga data Anda diverifikasi.
          </AlertDescription>
        </Alert>
      )}

      {isPondokVerified && !isLPJOpen && (
        <Alert className="mb-6 border-amber-500">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Periode LPJ Belum Dibuka</AlertTitle>
          <AlertDescription>
            Saat ini bukan periode pengisian LPJ. Mohon menunggu hingga periode pengisian LPJ dibuka.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Daftar LPJ</h2>
          <p className="text-sm text-muted-foreground">
            Kelola laporan pertanggungjawaban pondok
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canCreateLPJ || lpjSubmitted || !currentPeriodRAB}>
              <Plus className="mr-2 h-4 w-4" />
              Buat LPJ Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Buat LPJ Baru</DialogTitle>
              <DialogDescription>
                Isi form berikut untuk membuat LPJ baru periode{" "}
                {periode ? formatPeriode(periode.id) : ""}
              </DialogDescription>
            </DialogHeader>
            {periode && (
              <LPJForm 
                periode={periode}
                rab={currentPeriodRAB} 
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  refetchLPJs();
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>LPJ Pondok</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoadingPeriode || isLoadingLPJs ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : lpjs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Belum ada data LPJ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Realisasi Pemasukan</TableHead>
                    <TableHead>Realisasi Pengeluaran</TableHead>
                    <TableHead>Sisa Saldo</TableHead>
                    <TableHead>Tanggal Pengajuan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lpjs.map((lpj) => (
                    <TableRow key={lpj.id || `${lpj.pondok_id}-${lpj.periode_id}`}>
                      <TableCell className="font-medium">
                        {formatPeriode(lpj.periode_id)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(lpj.status)}>
                          {lpj.status === DocumentStatus.DIAJUKAN
                            ? "Diajukan"
                            : lpj.status === DocumentStatus.DITERIMA
                            ? "Diterima"
                            : "Revisi"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(lpj.realisasi_pemasukan)}</TableCell>
                      <TableCell>{formatCurrency(lpj.realisasi_pengeluaran)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(lpj.sisa_saldo)}
                      </TableCell>
                      <TableCell>
                        {lpj.submitted_at
                          ? new Date(lpj.submitted_at).toLocaleDateString("id-ID")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewLPJ(lpj)}
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Lihat</span>
                          </Button>
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

      {currentPeriodLPJ?.status === DocumentStatus.REVISI && (
        <Alert className="mt-6 border-amber-500">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle>LPJ Memerlukan Revisi</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{currentPeriodLPJ.pesan_revisi}</p>
            <Button size="sm" variant="outline" className="mt-2" 
              onClick={() => {
                setIsCreateDialogOpen(true);
              }}
            >
              Edit LPJ
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* View LPJ Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Detail LPJ - {selectedLPJ && formatPeriode(selectedLPJ.periode_id)}
            </DialogTitle>
            <DialogDescription>
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
              
              <div className="flex justify-end">
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
    </AdminPondokLayout>
  );
};

export default LPJPage;
