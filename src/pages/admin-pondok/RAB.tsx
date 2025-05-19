
import React from "react";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { DocumentStatus, RAB } from "@/types";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchRABsByPondok, fetchCurrentPeriode, fetchPondok } from "@/services/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Clock, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const currentPeriodRABExists = currentPeriode && rabs.some(rab => 
    rab.periode_id === currentPeriode.id
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
          <ScrollArea className="w-full overflow-auto">
            <div className="min-w-[800px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium">Periode</th>
                    <th className="py-3 px-4 text-left font-medium">Saldo Awal</th>
                    <th className="py-3 px-4 text-left font-medium">Rencana Pemasukan</th>
                    <th className="py-3 px-4 text-left font-medium">Rencana Pengeluaran</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">
                        Memuat data...
                      </td>
                    </tr>
                  ) : rabs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">
                        Belum ada data RAB
                      </td>
                    </tr>
                  ) : (
                    rabs.map((rab) => (
                      <tr key={rab.id} className="border-b">
                        <td className="py-3 px-4">
                          {rab.periode?.tahun}-{rab.periode?.bulan.toString().padStart(2, '0')}
                        </td>
                        <td className="py-3 px-4">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          }).format(rab.saldo_awal || 0)}
                        </td>
                        <td className="py-3 px-4">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          }).format(rab.rencana_pemasukan || 0)}
                        </td>
                        <td className="py-3 px-4">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                          }).format(rab.rencana_pengeluaran || 0)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            rab.status === DocumentStatus.DITERIMA
                              ? "bg-green-100 text-green-800"
                              : rab.status === DocumentStatus.REVISI
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {rab.status}
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

export default RABPage;
