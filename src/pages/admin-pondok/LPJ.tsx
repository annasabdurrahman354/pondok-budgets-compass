
import React from "react";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LPJTable } from "@/components/tables/LPJTable";
import { DocumentStatus, RAB, LPJ } from "@/types";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchLPJsByPondok, fetchCurrentPeriode, fetchRABsByPondok, fetchPondok } from "@/services/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, Plus, BookOpen, CheckCircle } from "lucide-react";

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
  // Use current date for comparison, not the API date
  const today = new Date();
  const canSubmitLPJ = currentPeriode && 
    today >= new Date(currentPeriode.awal_lpj) && 
    today <= new Date(currentPeriode.akhir_lpj);
  
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

  const handleView = (lpj: LPJ) => {
    if (lpj.id) {
      navigate(`/admin-pondok/lpj/${lpj.id}`);
    }
  };

  console.log({
    isVerified,
    canSubmitLPJ,
    hasApprovedRAB,
    currentPeriodLPJExists,
    isLoading,
    createButtonDisabled,
    today: today.toISOString(),
    awalLpj: currentPeriode?.awal_lpj,
    akhirLpj: currentPeriode?.akhir_lpj
  });

  return (
    <AdminPondokLayout title="Laporan Pertanggung Jawaban">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="surface-container-low rounded-3xl p-6 border-0 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-tertiary/20 rounded-2xl flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Daftar LPJ</h2>
                <p className="text-on-surface-variant">Kelola laporan pertanggung jawaban pondok</p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate("/admin-pondok/lpj/create")}
              disabled={createButtonDisabled}
              className="gap-2 rounded-full px-6 py-3 shadow-lg"
            >
              <Plus className="h-4 w-4" /> Buat LPJ
            </Button>
          </div>
        </div>

        {/* Status Alerts */}
        <div className="space-y-4">
          {!isVerified && (
            <Alert className="border-0 bg-warning-container rounded-2xl shadow-md">
              <Clock className="h-4 w-4" />
              <AlertTitle className="text-on-warning-container">Verifikasi diperlukan</AlertTitle>
              <AlertDescription className="text-on-warning-container">
                Data pondok Anda masih dalam proses verifikasi oleh admin pusat.
              </AlertDescription>
            </Alert>
          )}
          
          {isVerified && !canSubmitLPJ && currentPeriode && (
            <Alert className="border-0 surface-container-low rounded-2xl shadow-md">
              <Clock className="h-4 w-4" />
              <AlertTitle className="text-on-surface">Periode pengisian LPJ belum dibuka</AlertTitle>
              <AlertDescription className="text-on-surface-variant">
                Pengisian LPJ hanya dapat dilakukan pada {new Date(currentPeriode.awal_lpj).toLocaleDateString('id-ID')} - {new Date(currentPeriode.akhir_lpj).toLocaleDateString('id-ID')}
              </AlertDescription>
            </Alert>
          )}

          {isVerified && canSubmitLPJ && !hasApprovedRAB && (
            <Alert className="border-0 error-container rounded-2xl shadow-md">
              <Clock className="h-4 w-4" />
              <AlertTitle className="text-on-error-container">RAB belum disetujui</AlertTitle>
              <AlertDescription className="text-on-error-container">
                Anda harus memiliki RAB yang sudah disetujui untuk periode ini sebelum dapat membuat LPJ.
              </AlertDescription>
            </Alert>
          )}

          {isVerified && canSubmitLPJ && hasApprovedRAB && currentPeriodLPJExists && (
            <Alert className="border-0 primary-container rounded-2xl shadow-md">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle className="text-on-primary-container">LPJ untuk periode ini sudah dibuat</AlertTitle>
              <AlertDescription className="text-on-primary-container">
                Anda telah mengajukan LPJ untuk periode {currentPeriode?.tahun}-{currentPeriode?.bulan.toString().padStart(2, '0')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* LPJ Table */}
        <Card className="surface-container-lowest border-0 shadow-lg overflow-hidden rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-secondary/5 to-tertiary/5">
            <CardTitle className="text-xl font-semibold text-on-surface">Riwayat LPJ</CardTitle>
            <CardDescription className="text-on-surface-variant">
              Daftar LPJ yang sudah pernah diajukan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <LPJTable 
                data={lpjs}
                isLoading={isLoading}
                viewOnly
                onView={handleView}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPondokLayout>
  );
};

export default LPJPage;
