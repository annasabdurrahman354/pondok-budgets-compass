
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
import { DocumentStatus, Periode, RAB } from "@/types";
import { AlertTriangle, FileText, Plus, Trash } from "lucide-react";
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
import { RABForm } from "@/components/forms/RABForm";
import { fetchCurrentPeriode, fetchRABsByPondok, getFileUrl } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const RABPage: React.FC = () => {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRAB, setSelectedRAB] = useState<RAB | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Fetch current period
  const { 
    data: periode,
    isLoading: isLoadingPeriode,
  } = useQuery({
    queryKey: ['periode', 'current'],
    queryFn: () => fetchCurrentPeriode(),
  });
  
  // Fetch RABs
  const { 
    data: rabs = [],
    isLoading: isLoadingRABs,
    refetch: refetchRABs,
  } = useQuery({
    queryKey: ['rab', 'pondok', user?.pondok_id],
    queryFn: () => user?.pondok_id ? fetchRABsByPondok(user.pondok_id) : Promise.resolve([]),
    enabled: !!user?.pondok_id,
  });
  
  const isRABOpen = periode ? isWithinDateRange(periode.awal_rab, periode.akhir_rab) : false;
  const isPondokVerified = !!user?.pondok_id;
  const canCreateRAB = isPondokVerified && isRABOpen;
  
  // Check if RAB for current period already exists
  const currentPeriodRAB = periode ? rabs.find(rab => rab.periode_id === periode.id) : null;
  const rabSubmitted = !!currentPeriodRAB;
  
  const handleViewRAB = (rab: RAB) => {
    setSelectedRAB(rab);
    setIsViewDialogOpen(true);
  };
  
  const getDocumentUrl = (rab: RAB) => {
    if (!rab.dokumen_path) return "";
    return getFileUrl('bukti_rab', rab.dokumen_path);
  };

  return (
    <AdminPondokLayout title="Rencana Anggaran Belanja (RAB)">
      {!isPondokVerified && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Menunggu Verifikasi</AlertTitle>
          <AlertDescription>
            Data pondok Anda sedang menunggu verifikasi dari admin pusat. Pembuatan RAB tidak dapat dilakukan hingga data Anda diverifikasi.
          </AlertDescription>
        </Alert>
      )}

      {isPondokVerified && !isRABOpen && (
        <Alert className="mb-6 border-amber-500">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Periode RAB Belum Dibuka</AlertTitle>
          <AlertDescription>
            Saat ini bukan periode pengisian RAB. Mohon menunggu hingga periode pengisian RAB dibuka.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Daftar RAB</h2>
          <p className="text-sm text-muted-foreground">
            Kelola rencana anggaran belanja pondok
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canCreateRAB || rabSubmitted}>
              <Plus className="mr-2 h-4 w-4" />
              Buat RAB Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Buat RAB Baru</DialogTitle>
              <DialogDescription>
                Isi form berikut untuk membuat RAB baru periode{" "}
                {periode ? formatPeriode(periode.id) : ""}
              </DialogDescription>
            </DialogHeader>
            {periode && (
              <RABForm 
                periode={periode} 
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  refetchRABs();
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RAB Pondok</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoadingPeriode || isLoadingRABs ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : rabs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Belum ada data RAB</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Saldo Awal</TableHead>
                    <TableHead>Rencana Pemasukan</TableHead>
                    <TableHead>Rencana Pengeluaran</TableHead>
                    <TableHead>Tanggal Pengajuan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rabs.map((rab) => (
                    <TableRow key={rab.id || `${rab.pondok_id}-${rab.periode_id}`}>
                      <TableCell className="font-medium">
                        {formatPeriode(rab.periode_id)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(rab.status)}>
                          {rab.status === DocumentStatus.DIAJUKAN
                            ? "Diajukan"
                            : rab.status === DocumentStatus.DITERIMA
                            ? "Diterima"
                            : "Revisi"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(rab.saldo_awal)}</TableCell>
                      <TableCell>{formatCurrency(rab.rencana_pemasukan)}</TableCell>
                      <TableCell>{formatCurrency(rab.rencana_pengeluaran)}</TableCell>
                      <TableCell>
                        {rab.submitted_at
                          ? new Date(rab.submitted_at).toLocaleDateString("id-ID")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewRAB(rab)}
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

      {currentPeriodRAB?.status === DocumentStatus.REVISI && (
        <Alert className="mt-6 border-amber-500">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle>RAB Memerlukan Revisi</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{currentPeriodRAB.pesan_revisi}</p>
            <Button size="sm" variant="outline" className="mt-2" 
              onClick={() => {
                setIsCreateDialogOpen(true);
              }}
            >
              Edit RAB
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* View RAB Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Detail RAB - {selectedRAB && formatPeriode(selectedRAB.periode_id)}
            </DialogTitle>
            <DialogDescription>
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

export default RABPage;
