import React from "react";
import { useNavigate } from "react-router-dom";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RABTable } from "@/components/tables/RABTable";
import { LPJTable } from "@/components/tables/LPJTable";
import { PeriodInfo } from "@/components/dashboard/PeriodInfo";
import { StatCard } from "@/components/dashboard/StatCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchCurrentPeriode, 
  fetchRABsByPeriode, 
  fetchLPJsByPeriode,
  updateRABStatus,
  updateLPJStatus
} from "@/services/api";
import { DocumentStatus, RAB, LPJ } from "@/types";
import { toast } from "sonner";
import { FileText, Building2, Calendar, CheckCircle } from "lucide-react";

const AdminPusatDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch current periode and data
  const { data: currentPeriode, isLoading: isLoadingPeriode } = useQuery({
    queryKey: ['currentPeriode'],
    queryFn: fetchCurrentPeriode
  });

  const { data: rabs = [], isLoading: isLoadingRABs } = useQuery({
    queryKey: ['rabs', currentPeriode?.id],
    queryFn: () => currentPeriode ? fetchRABsByPeriode(currentPeriode.id) : Promise.resolve([]),
    enabled: !!currentPeriode
  });

  const { data: lpjs = [], isLoading: isLoadingLPJs } = useQuery({
    queryKey: ['lpjs', currentPeriode?.id],
    queryFn: () => currentPeriode ? fetchLPJsByPeriode(currentPeriode.id) : Promise.resolve([]),
    enabled: !!currentPeriode
  });

  // mutations and handlers
  const updateRABMutation = useMutation({
    mutationFn: ({ id, status, pesanRevisi }: { id: string; status: DocumentStatus; pesanRevisi?: string }) =>
      updateRABStatus(id, status, pesanRevisi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rabs'] });
      toast.success('Status RAB berhasil diperbarui');
    },
    onError: () => {
      toast.error('Gagal memperbarui status RAB');
    }
  });

  const updateLPJMutation = useMutation({
    mutationFn: ({ id, status, pesanRevisi }: { id: string; status: DocumentStatus; pesanRevisi?: string }) =>
      updateLPJStatus(id, status, pesanRevisi),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lpjs'] });
      toast.success('Status LPJ berhasil diperbarui');
    },
    onError: () => {
      toast.error('Gagal memperbarui status LPJ');
    }
  });

  const handleRABApprove = async (rab: RAB) => {
    if (!rab.id) return;
    updateRABMutation.mutate({ id: rab.id, status: DocumentStatus.DITERIMA });
  };

  const handleRABRevision = (rab: RAB) => {
    // Navigate to detail page for review
    navigate(`/admin-pusat/rab/${rab.id}`);
  };

  const handleLPJApprove = async (lpj: LPJ) => {
    if (!lpj.id) return;
    updateLPJMutation.mutate({ id: lpj.id, status: DocumentStatus.DITERIMA });
  };

  const handleLPJRevision = (lpj: LPJ) => {
    // Navigate to detail page for review
    navigate(`/admin-pusat/lpj/${lpj.id}`);
  };

  const handleRABView = (rab: RAB) => {
    navigate(`/admin-pusat/rab/${rab.id}`);
  };

  const handleLPJView = (lpj: LPJ) => {
    navigate(`/admin-pusat/lpj/${lpj.id}`);
  };

  // statistics calculation
  const totalPondoks = new Set(rabs.map(rab => rab.pondok_id)).size;
  const approvedRABs = rabs.filter(rab => rab.status === DocumentStatus.DITERIMA).length;
  const approvedLPJs = lpjs.filter(lpj => lpj.status === DocumentStatus.DITERIMA).length;
  const pendingRABs = rabs.filter(rab => rab.status === DocumentStatus.DIAJUKAN).length;
  const pendingLPJs = lpjs.filter(lpj => lpj.status === DocumentStatus.DIAJUKAN).length;

  const isLoading = isLoadingPeriode || isLoadingRABs || isLoadingLPJs;

  if (isLoading) {
    return (
      <AdminPusatLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat data...</p>
          </div>
        </div>
      </AdminPusatLayout>
    );
  }

  return (
    <AdminPusatLayout title="Dashboard">
      <div className="space-y-6">
        {currentPeriode && <PeriodInfo periode={currentPeriode} />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Pondok"
            value={totalPondoks.toString()}
            icon={Building2}
            description="Pondok terdaftar"
          />
          <StatCard
            title="RAB Disetujui"
            value={approvedRABs.toString()}
            icon={CheckCircle}
            description="Dari total RAB"
          />
          <StatCard
            title="LPJ Disetujui"
            value={approvedLPJs.toString()}
            icon={CheckCircle}
            description="Dari total LPJ"
          />
          <StatCard
            title="Menunggu Review"
            value={(pendingRABs + pendingLPJs).toString()}
            icon={FileText}
            description="RAB & LPJ pending"
          />
        </div>

        <Tabs defaultValue="rab" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rab">RAB ({rabs.length})</TabsTrigger>
            <TabsTrigger value="lpj">LPJ ({lpjs.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rab" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daftar RAB</CardTitle>
                <CardDescription>
                  Rencana Anggaran Belanja periode {currentPeriode?.tahun}-{currentPeriode?.bulan.toString().padStart(2, '0')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <RABTable 
                    data={rabs}
                    onView={handleRABView}
                    onApprove={handleRABApprove}
                    onRevision={handleRABRevision}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="lpj" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daftar LPJ</CardTitle>
                <CardDescription>
                  Laporan Pertanggung Jawaban periode {currentPeriode?.tahun}-{currentPeriode?.bulan.toString().padStart(2, '0')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <LPJTable 
                    data={lpjs}
                    onView={handleLPJView}
                    onApprove={handleLPJApprove}
                    onRevision={handleLPJRevision}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPusatLayout>
  );
};

export default AdminPusatDashboard;
