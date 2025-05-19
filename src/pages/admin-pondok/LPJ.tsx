
import React from "react";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LPJTable } from "@/components/tables/LPJTable";
import { DocumentStatus, RAB } from "@/types";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchLPJsByPondok, fetchCurrentPeriode, fetchRABsByPondok, fetchPondok } from "@/services/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, Plus } from "lucide-react";

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
  const hasApprovedRAB = rabs.some(rab => 
    rab.periode_id === currentPeriode?.id && 
    rab.status === DocumentStatus.DITERIMA
  );
  
  // Check if LPJ for the current period already exists
  const currentPeriodLPJExists = lpjs.some(lpj => 
    lpj.periode_id === currentPeriode?.id
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
          <div className="overflow-x-auto">
            <LPJTable 
              lpjs={lpjs} 
              isLoading={isLoading}
              viewOnly
            />
          </div>
        </CardContent>
      </Card>
    </AdminPondokLayout>
  );
};

export default LPJPage;
