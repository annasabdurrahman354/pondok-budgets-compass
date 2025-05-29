
import React from "react";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { RABTable } from "@/components/tables/RABTable";
import { DocumentStatus, RAB } from "@/types";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchRABsByPondok, fetchCurrentPeriode, fetchPondok } from "@/services/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, Plus, FileText, TrendingUp } from "lucide-react";

const RABPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pondokId = user?.pondok_id;

  // Fetch pondok data to check verification status
  const { data: pondok, isLoading: isLoadingPondok } = useQuery({
    queryKey: ['pondok', pondokId],
    queryFn: () => pondokId ? fetchPondok(pondokId) : Promise.resolve(null),
    enabled: !!pondokId
  });

  // Fetch RABs for the current pondok
  const { data: rabs = [], isLoading: isLoadingRABs } = useQuery({
    queryKey: ['rabs', pondokId],
    queryFn: () => pondokId ? fetchRABsByPondok(pondokId) : Promise.resolve([]),
    enabled: !!pondokId
  });

  // Fetch current period to determine if RAB creation is allowed
  const { data: currentPeriode, isLoading: isLoadingPeriode } = useQuery({
    queryKey: ['currentPeriode'],
    queryFn: fetchCurrentPeriode
  });

  const isLoading = isLoadingRABs || isLoadingPeriode || isLoadingPondok;
  const isVerified = !!pondok?.accepted_at;
  
  // Check if RAB can be submitted (within submission window)
  // Use current date for comparison, not the API date
  const today = new Date();
  const canSubmitRAB = currentPeriode && 
    today >= new Date(currentPeriode.awal_rab) && 
    today <= new Date(currentPeriode.akhir_rab);
  
  // Check if RAB for the current period already exists
  const currentPeriodRABExists = rabs.some(rab => 
    rab.periode_id === currentPeriode?.id
  );

  // Determine button state based on several conditions
  const createButtonDisabled = 
    !isVerified || 
    !canSubmitRAB || 
    currentPeriodRABExists || 
    isLoading;

  const handleView = (rab: RAB) => {
    if (rab.id) {
      navigate(`/admin-pondok/rab/${rab.id}`);
    }
  };

  console.log({
    isVerified,
    canSubmitRAB,
    currentPeriodRABExists,
    isLoading,
    createButtonDisabled,
    today: today.toISOString(),
    awalRab: currentPeriode?.awal_rab,
    akhirRab: currentPeriode?.akhir_rab
  });

  return (
    <AdminPondokLayout title="Rencana Anggaran Belanja">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="surface-container-low rounded-3xl p-6 border-0 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Daftar RAB</h2>
                <p className="text-on-surface-variant">Kelola rencana anggaran belanja pondok</p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate("/admin-pondok/rab/create")}
              disabled={createButtonDisabled}
              className="gap-2 rounded-full px-6 py-3 shadow-lg"
            >
              <Plus className="h-4 w-4" /> Buat RAB
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
          
          {isVerified && !canSubmitRAB && currentPeriode && (
            <Alert className="border-0 surface-container-low rounded-2xl shadow-md">
              <Clock className="h-4 w-4" />
              <AlertTitle className="text-on-surface">Periode pengisian RAB belum dibuka</AlertTitle>
              <AlertDescription className="text-on-surface-variant">
                Pengisian RAB hanya dapat dilakukan pada {new Date(currentPeriode.awal_rab).toLocaleDateString('id-ID')} - {new Date(currentPeriode.akhir_rab).toLocaleDateString('id-ID')}
              </AlertDescription>
            </Alert>
          )}

          {isVerified && canSubmitRAB && currentPeriodRABExists && (
            <Alert className="border-0 primary-container rounded-2xl shadow-md">
              <TrendingUp className="h-4 w-4" />
              <AlertTitle className="text-on-primary-container">RAB untuk periode ini sudah dibuat</AlertTitle>
              <AlertDescription className="text-on-primary-container">
                Anda telah mengajukan RAB untuk periode {currentPeriode?.tahun}-{currentPeriode?.bulan.toString().padStart(2, '0')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* RAB Table */}
        <Card className="surface-container-lowest border-0 shadow-lg overflow-hidden rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardTitle className="text-xl font-semibold text-on-surface">Riwayat RAB</CardTitle>
            <CardDescription className="text-on-surface-variant">
              Daftar RAB yang sudah pernah diajukan
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <RABTable 
                data={rabs}
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

export default RABPage;
