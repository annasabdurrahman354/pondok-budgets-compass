
import React from "react";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentStatus, LPJ } from "@/types";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchLPJsByPondok, fetchCurrentPeriode, fetchRABsByPondok, fetchPondok } from "@/services/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const LPJPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pondokId = user?.pondok_id;

  // Fetch pondok data to check verification status
  const { data: pondok, isLoading: isLoadingPondok } = useQuery({
    queryKey: ['pondok', pondokId],
    queryFn: () => pondokId ? fetchPondok(pondokId) : Promise.resolve(null),
    enabled: !!pondokId
  });

  // Fetch LPJs for the current pondok
  const { data: lpjs = [], isLoading: isLoadingLPJs } = useQuery({
    queryKey: ['lpjs', pondokId],
    queryFn: () => pondokId ? fetchLPJsByPondok(pondokId) : Promise.resolve([]),
    enabled: !!pondokId
  });

  // Fetch RABs to check if there's an approved RAB for the current period
  const { data: rabs = [], isLoading: isLoadingRABs } = useQuery({
    queryKey: ['rabs', pondokId],
    queryFn: () => pondokId ? fetchRABsByPondok(pondokId) : Promise.resolve([]),
    enabled: !!pondokId
  });

  // Fetch current period to determine if LPJ creation is allowed
  const { data: currentPeriode, isLoading: isLoadingPeriode } = useQuery({
    queryKey: ['currentPeriode'],
    queryFn: fetchCurrentPeriode
  });

  const isLoading = isLoadingLPJs || isLoadingPeriode || isLoadingRABs || isLoadingPondok;
  const isVerified = !!pondok?.accepted_at;
  
  // Check if LPJ can be submitted (within submission window)
  const canSubmitLPJ = currentPeriode && 
    new Date() >= new Date(currentPeriode.awal_lpj) && 
    new Date() <= new Date(currentPeriode.akhir_lpj);
  
  // Check if RAB for the current period exists and has been approved
  const hasApprovedRAB = currentPeriode && rabs.some(rab => 
    rab.periode_id === currentPeriode.id && 
    rab.status === DocumentStatus.DITERIMA
  );
  
  // Check if LPJ for the current period already exists
  const currentPeriodLPJExists = currentPeriode && lpjs.some(lpj => 
    lpj.periode_id === currentPeriode.id
  );

  // Determine button state based on several conditions
  const createButtonDisabled = 
    !isVerified || 
    !canSubmitLPJ || 
    !hasApprovedRAB ||
    currentPeriodLPJExists || 
    isLoading;

  return (
    <AdminPondokLayout title="Laporan Pertanggung Jawaban">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold">Daftar LPJ</h2>
          <p className="text-muted-foreground">Kelola laporan pertanggung jawaban pondok</p>
        </div>
        
        <Button
          onClick={() => navigate("/admin-pondok/lpj/create")}
          disabled={createButtonDisabled}
        >
          <Plus className="mr-2 h-4 w-4" /> Buat LPJ
        </Button>
      </div>

      {!isVerified && (
        <Alert className="mb-6 bg-amber-50 text-amber-800">
          <Clock className="h-4 w-4" />
          <AlertTitle>Verifikasi diperlukan</AlertTitle>
          <AlertDescription>
            Data pondok Anda masih dalam proses verifikasi oleh admin pusat.
          </AlertDescription>
        </Alert>
      )}
      
      {isVerified && !canSubmitLPJ && currentPeriode && (
        <Alert className="mb-6">
          <Clock className="h-4 w-4" />
          <AlertTitle>Periode pengisian LPJ belum dibuka</AlertTitle>
          <AlertDescription>
            Pengisian LPJ hanya dapat dilakukan pada {new Date(currentPeriode.awal_lpj).toLocaleDateString('id-ID')} - {new Date(currentPeriode.akhir_lpj).toLocaleDateString('id-ID')}
          </AlertDescription>
        </Alert>
      )}

      {isVerified && canSubmitLPJ && !hasApprovedRAB && (
        <Alert className="mb-6">
          <Clock className="h-4 w-4" />
          <AlertTitle>RAB belum disetujui</AlertTitle>
          <AlertDescription>
            Anda harus memiliki RAB yang sudah disetujui untuk periode ini sebelum dapat membuat LPJ.
          </AlertDescription>
        </Alert>
      )}

      {isVerified && canSubmitLPJ && hasApprovedRAB && currentPeriodLPJExists && (
        <Alert className="mb-6">
          <Clock className="h-4 w-4" />
          <AlertTitle>LPJ untuk periode ini sudah dibuat</AlertTitle>
          <AlertDescription>
            Anda telah mengajukan LPJ untuk periode {currentPeriode?.tahun}-{currentPeriode?.bulan.toString().padStart(2, '0')}
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Riwayat LPJ</CardTitle>
          <CardDescription>
            Daftar LPJ yang sudah pernah diajukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full overflow-auto">
            <div className="min-w-[800px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium">Periode</th>
                    <th className="py-3 px-4 text-left font-medium">Saldo Awal</th>
                    <th className="py-3 px-4 text-left font-medium">Realisasi Pemasukan</th>
                    <th className="py-3 px-4 text-left font-medium">Realisasi Pengeluaran</th>
                    <th className="py-3 px-4 text-left font-medium">Sisa Saldo</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-muted-foreground">
                        Memuat data...
                      </td>
                    </tr>
                  ) : lpjs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-muted-foreground">
                        Belum ada data LPJ
                      </td>
                    </tr>
                  ) : (
                    lpjs.map((lpj) => (
                      <tr key={lpj.id} className="border-b">
                        <td className="py-3 px-4">
                          {lpj.periode?.tahun}-{lpj.periode?.bulan.toString().padStart(2, '0')}
                        </td>
                        <td className="py-3 px-4">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          }).format(lpj.saldo_awal || 0)}
                        </td>
                        <td className="py-3 px-4">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          }).format(lpj.realisasi_pemasukan || 0)}
                        </td>
                        <td className="py-3 px-4">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          }).format(lpj.realisasi_pengeluaran || 0)}
                        </td>
                        <td className="py-3 px-4">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          }).format(lpj.sisa_saldo || 0)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            lpj.status === DocumentStatus.DITERIMA
                              ? "bg-green-100 text-green-800"
                              : lpj.status === DocumentStatus.REVISI
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {lpj.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            Lihat
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </AdminPondokLayout>
  );
};

export default LPJPage;
