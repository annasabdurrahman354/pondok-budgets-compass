
import React, { useState, useEffect } from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { PeriodInfo } from "@/components/dashboard/PeriodInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RABTable } from "@/components/tables/RABTable";
import { LPJTable } from "@/components/tables/LPJTable";
import { formatCurrency, formatPeriode } from "@/lib/utils";
import { DocumentStatus, LPJ, PondokJenis, RAB } from "@/types";
import { BookOpen, Calculator, CheckCircle, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentPeriode, fetchRABsByPeriode, fetchLPJsByPeriode, updateRABStatus, updateLPJStatus } from "@/services/api";
import { toast } from "sonner";

const Dashboard: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jenisFilter, setJenisFilter] = useState<string>("all");

  // Fetch current period
  const { data: currentPeriode, isLoading: isLoadingPeriode } = useQuery({
    queryKey: ['currentPeriode'],
    queryFn: fetchCurrentPeriode
  });

  // Fetch RABs for current period
  const { data: rabs = [], isLoading: isLoadingRABs } = useQuery({
    queryKey: ['rabs', currentPeriode?.id],
    queryFn: () => currentPeriode?.id ? fetchRABsByPeriode(currentPeriode.id) : Promise.resolve([]),
    enabled: !!currentPeriode?.id,
  });

  // Fetch LPJs for current period
  const { data: lpjs = [], isLoading: isLoadingLPJs } = useQuery({
    queryKey: ['lpjs', currentPeriode?.id],
    queryFn: () => currentPeriode?.id ? fetchLPJsByPeriode(currentPeriode.id) : Promise.resolve([]),
    enabled: !!currentPeriode?.id,
  });
  
  const filteredRABs = rabs.filter((rab) => {
    return (
      (searchText === "" || 
        rab.pondok?.nama.toLowerCase().includes(searchText.toLowerCase())) &&
      (statusFilter === "all" || rab.status === statusFilter) &&
      (jenisFilter === "all" || rab.pondok?.jenis === jenisFilter)
    );
  });
  
  const filteredLPJs = lpjs.filter((lpj) => {
    return (
      (searchText === "" || 
        lpj.pondok?.nama.toLowerCase().includes(searchText.toLowerCase())) &&
      (statusFilter === "all" || lpj.status === statusFilter) &&
      (jenisFilter === "all" || lpj.pondok?.jenis === jenisFilter)
    );
  });
  
  // Calculate totals
  const totalRAB = rabs.reduce((sum, rab) => sum + (rab.rencana_pengeluaran || 0), 0);
  const totalLPJ = lpjs.reduce((sum, lpj) => sum + (lpj.realisasi_pengeluaran || 0), 0);
  const rabPending = rabs.filter(r => r.status === DocumentStatus.DIAJUKAN).length;
  const lpjPending = lpjs.filter(l => l.status === DocumentStatus.DIAJUKAN).length;

  // Handle RAB approval or rejection
  const handleRABApprove = async (rab: RAB) => {
    if (!rab.id) return;
    
    const result = await updateRABStatus(rab.id, DocumentStatus.DITERIMA);
    if (result) {
      toast.success("RAB berhasil disetujui");
    }
  };

  // Fix: Add wrapper function to match expected signature
  const handleRABRevisionWrapper = (rab: RAB) => {
    const pesanRevisi = prompt("Masukkan pesan revisi:");
    if (pesanRevisi) {
      handleRABRevision(rab, pesanRevisi);
    }
  };

  const handleRABRevision = async (rab: RAB, pesanRevisi: string) => {
    if (!rab.id) return;
    
    const result = await updateRABStatus(rab.id, DocumentStatus.REVISI, pesanRevisi);
    if (result) {
      toast.success("RAB ditolak dan memerlukan revisi");
    }
  };

  // Handle LPJ approval or rejection
  const handleLPJApprove = async (lpj: LPJ) => {
    if (!lpj.id) return;
    
    const result = await updateLPJStatus(lpj.id, DocumentStatus.DITERIMA);
    if (result) {
      toast.success("LPJ berhasil disetujui");
    }
  };

  // Fix: Add wrapper function to match expected signature
  const handleLPJRevisionWrapper = (lpj: LPJ) => {
    const pesanRevisi = prompt("Masukkan pesan revisi:");
    if (pesanRevisi) {
      handleLPJRevision(lpj, pesanRevisi);
    }
  };

  const handleLPJRevision = async (lpj: LPJ, pesanRevisi: string) => {
    if (!lpj.id) return;
    
    const result = await updateLPJStatus(lpj.id, DocumentStatus.REVISI, pesanRevisi);
    if (result) {
      toast.success("LPJ ditolak dan memerlukan revisi");
    }
  };

  if (isLoadingPeriode) {
    return (
      <AdminPusatLayout>
        <div className="flex justify-center items-center h-64">
          <p>Memuat data periode...</p>
        </div>
      </AdminPusatLayout>
    );
  }

  if (!currentPeriode) {
    return (
      <AdminPusatLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg">Tidak ada periode aktif saat ini</p>
          <p className="text-muted-foreground">Silakan buat periode baru di halaman Periode</p>
        </div>
      </AdminPusatLayout>
    );
  }

  return (
    <AdminPusatLayout>
      <PeriodInfo periode={currentPeriode} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total RAB Periode Ini"
          value={formatCurrency(totalRAB)}
          description={`Periode ${formatPeriode(currentPeriode.id)}`}
          icon={<Calculator className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total LPJ Periode Ini"
          value={formatCurrency(totalLPJ)}
          description={`Periode ${formatPeriode(currentPeriode.id)}`}
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="RAB Menunggu Persetujuan"
          value={`${rabPending}`}
          description="Butuh tindakan"
          icon={<Clock className="h-4 w-4 text-yellow-500" />}
        />
        <StatCard
          title="LPJ Menunggu Persetujuan"
          value={`${lpjPending}`}
          description="Butuh tindakan"
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
        />
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Cari pondok..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex gap-3">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value={DocumentStatus.DIAJUKAN}>Diajukan</SelectItem>
              <SelectItem value={DocumentStatus.DITERIMA}>Diterima</SelectItem>
              <SelectItem value={DocumentStatus.REVISI}>Revisi</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={jenisFilter}
            onValueChange={setJenisFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Jenis Pondok" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value={PondokJenis.PPM}>PPM</SelectItem>
              <SelectItem value={PondokJenis.PPPM}>PPPM</SelectItem>
              <SelectItem value={PondokJenis.BOARDING}>Boarding</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="rab" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="rab">RAB</TabsTrigger>
          <TabsTrigger value="lpj">LPJ</TabsTrigger>
        </TabsList>
        <TabsContent value="rab" className="animate-fade-in">
          {isLoadingRABs ? (
            <div className="flex justify-center p-6">
              <p>Memuat data RAB...</p>
            </div>
          ) : (
            <RABTable 
              data={filteredRABs} 
              title={`RAB Periode ${formatPeriode(currentPeriode.id)}`} 
              onView={(rab) => console.log("View RAB", rab)}
              onApprove={handleRABApprove}
              onRevision={handleRABRevisionWrapper}
            />
          )}
        </TabsContent>
        <TabsContent value="lpj" className="animate-fade-in">
          {isLoadingLPJs ? (
            <div className="flex justify-center p-6">
              <p>Memuat data LPJ...</p>
            </div>
          ) : (
            <LPJTable 
              data={filteredLPJs} 
              title={`LPJ Periode ${formatPeriode(currentPeriode.id)}`} 
              onView={(lpj) => console.log("View LPJ", lpj)}
              onApprove={handleLPJApprove}
              onRevision={handleLPJRevisionWrapper}
            />
          )}
        </TabsContent>
      </Tabs>
    </AdminPusatLayout>
  );
};

export default Dashboard;
