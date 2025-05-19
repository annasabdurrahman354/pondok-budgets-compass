
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
import { Clock, Plus } from "lucide-react";

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
  const canSubmitRAB = currentPeriode && 
    new Date() >= new Date(currentPeriode.awal_rab) && 
    new Date() <= new Date(currentPeriode.akhir_rab);
  
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

  return (
    <AdminPondokLayout title="Rencana Anggaran Belanja">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold">Daftar RAB</h2>
          <p className="text-muted-foreground">Kelola rencana anggaran belanja pondok</p>
        </div>
        
        <Button
          onClick={() => navigate("/admin-pondok/rab/create")}
          disabled={createButtonDisabled}
        >
          <Plus className="mr-2 h-4 w-4" /> Buat RAB
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
      
      {isVerified && !canSubmitRAB && currentPeriode && (
        <Alert className="mb-6">
          <Clock className="h-4 w-4" />
          <AlertTitle>Periode pengisian RAB belum dibuka</AlertTitle>
          <AlertDescription>
            Pengisian RAB hanya dapat dilakukan pada {new Date(currentPeriode.awal_rab).toLocaleDateString('id-ID')} - {new Date(currentPeriode.akhir_rab).toLocaleDateString('id-ID')}
          </AlertDescription>
        </Alert>
      )}

      {isVerified && canSubmitRAB && currentPeriodRABExists && (
        <Alert className="mb-6">
          <Clock className="h-4 w-4" />
          <AlertTitle>RAB untuk periode ini sudah dibuat</AlertTitle>
          <AlertDescription>
            Anda telah mengajukan RAB untuk periode {currentPeriode?.tahun}-{currentPeriode?.bulan.toString().padStart(2, '0')}
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Riwayat RAB</CardTitle>
          <CardDescription>
            Daftar RAB yang sudah pernah diajukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <RABTable 
              data={rabs}
              isLoading={isLoading}
              viewOnly
            />
          </div>
        </CardContent>
      </Card>
    </AdminPondokLayout>
  );
};

export default RABPage;
