
import React, { useState } from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { PeriodInfo } from "@/components/dashboard/PeriodInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RABTable } from "@/components/tables/RABTable";
import { LPJTable } from "@/components/tables/LPJTable";
import { formatCurrency, formatPeriode, getCurrentPeriodeId } from "@/lib/utils";
import { DocumentStatus, LPJ, mockPeriode, PondokJenis, RAB } from "@/types";
import { BookOpen, Calculator, CheckCircle, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Mock data for demonstration
const currentPeriode = mockPeriode;

const mockRABs: RAB[] = [
  {
    pondok_id: "pd1",
    periode_id: currentPeriode.id,
    status: DocumentStatus.DIAJUKAN,
    saldo_awal: 5000000,
    rencana_pemasukan: 15000000,
    rencana_pengeluaran: 12000000,
    dokumen_path: "bukti_rab/rab-202505-pondok-a-abc1.pdf",
    submitted_at: "2025-04-10T10:30:00Z",
    accepted_at: null,
    pesan_revisi: null,
    pondok: {
      id: "pd1",
      nama: "Pondok Pesantren A",
      nomor_telepon: "081234567890",
      jenis: PondokJenis.PPM,
      alamat: "Jl. Pondok A No. 1",
      kode_pos: "12345",
      kota_id: "k1",
      provinsi_id: "p1",
      daerah_sambung_id: "d1",
      updated_at: "2025-03-15T00:00:00Z",
      accepted_at: "2025-03-16T00:00:00Z",
    },
  },
  {
    pondok_id: "pd2",
    periode_id: currentPeriode.id,
    status: DocumentStatus.DITERIMA,
    saldo_awal: 4000000,
    rencana_pemasukan: 10000000,
    rencana_pengeluaran: 9000000,
    dokumen_path: "bukti_rab/rab-202505-pondok-b-def2.pdf",
    submitted_at: "2025-04-05T14:20:00Z",
    accepted_at: "2025-04-07T09:15:00Z",
    pesan_revisi: null,
    pondok: {
      id: "pd2",
      nama: "Pondok Pesantren B",
      nomor_telepon: "089876543210",
      jenis: PondokJenis.PPPM,
      alamat: "Jl. Pondok B No. 2",
      kode_pos: "54321",
      kota_id: "k3",
      provinsi_id: "p2",
      daerah_sambung_id: "d2",
      updated_at: "2025-03-10T00:00:00Z",
      accepted_at: "2025-03-12T00:00:00Z",
    },
  },
  {
    pondok_id: "pd3",
    periode_id: currentPeriode.id,
    status: DocumentStatus.REVISI,
    saldo_awal: 3000000,
    rencana_pemasukan: 8000000,
    rencana_pengeluaran: 7500000,
    dokumen_path: "bukti_rab/rab-202505-pondok-c-ghi3.pdf",
    submitted_at: "2025-04-08T11:45:00Z",
    accepted_at: null,
    pesan_revisi: "Mohon jelaskan rencana pengeluaran lebih detail",
    pondok: {
      id: "pd3",
      nama: "Pondok Pesantren C",
      nomor_telepon: "087654321098",
      jenis: PondokJenis.BOARDING,
      alamat: "Jl. Pondok C No. 3",
      kode_pos: "67890",
      kota_id: "k5",
      provinsi_id: "p3",
      daerah_sambung_id: "d3",
      updated_at: "2025-03-20T00:00:00Z",
      accepted_at: "2025-03-22T00:00:00Z",
    },
  },
];

const mockLPJs: LPJ[] = [
  {
    pondok_id: "pd1",
    periode_id: currentPeriode.id,
    status: DocumentStatus.DIAJUKAN,
    saldo_awal: 5000000,
    rencana_pemasukan: 15000000,
    rencana_pengeluaran: 12000000,
    realisasi_pemasukan: 14500000,
    realisasi_pengeluaran: 11800000,
    sisa_saldo: 7700000,
    dokumen_path: "bukti_lpj/lpj-202505-pondok-a-abc1.pdf",
    submitted_at: "2025-05-10T10:30:00Z",
    accepted_at: null,
    pesan_revisi: null,
    pondok: {
      id: "pd1",
      nama: "Pondok Pesantren A",
      nomor_telepon: "081234567890",
      jenis: PondokJenis.PPM,
      alamat: "Jl. Pondok A No. 1",
      kode_pos: "12345",
      kota_id: "k1",
      provinsi_id: "p1",
      daerah_sambung_id: "d1",
      updated_at: "2025-03-15T00:00:00Z",
      accepted_at: "2025-03-16T00:00:00Z",
    },
  },
  {
    pondok_id: "pd2",
    periode_id: currentPeriode.id,
    status: DocumentStatus.DITERIMA,
    saldo_awal: 4000000,
    rencana_pemasukan: 10000000,
    rencana_pengeluaran: 9000000,
    realisasi_pemasukan: 9800000,
    realisasi_pengeluaran: 8500000,
    sisa_saldo: 5300000,
    dokumen_path: "bukti_lpj/lpj-202505-pondok-b-def2.pdf",
    submitted_at: "2025-05-05T14:20:00Z",
    accepted_at: "2025-05-07T09:15:00Z",
    pesan_revisi: null,
    pondok: {
      id: "pd2",
      nama: "Pondok Pesantren B",
      nomor_telepon: "089876543210",
      jenis: PondokJenis.PPPM,
      alamat: "Jl. Pondok B No. 2",
      kode_pos: "54321",
      kota_id: "k3",
      provinsi_id: "p2",
      daerah_sambung_id: "d2",
      updated_at: "2025-03-10T00:00:00Z",
      accepted_at: "2025-03-12T00:00:00Z",
    },
  },
];

const Dashboard: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jenisFilter, setJenisFilter] = useState<string>("all");
  
  const filteredRABs = mockRABs.filter((rab) => {
    return (
      (searchText === "" || 
        rab.pondok?.nama.toLowerCase().includes(searchText.toLowerCase())) &&
      (statusFilter === "all" || rab.status === statusFilter) &&
      (jenisFilter === "all" || rab.pondok?.jenis === jenisFilter)
    );
  });
  
  const filteredLPJs = mockLPJs.filter((lpj) => {
    return (
      (searchText === "" || 
        lpj.pondok?.nama.toLowerCase().includes(searchText.toLowerCase())) &&
      (statusFilter === "all" || lpj.status === statusFilter) &&
      (jenisFilter === "all" || lpj.pondok?.jenis === jenisFilter)
    );
  });
  
  // Calculate totals
  const totalRAB = mockRABs.reduce((sum, rab) => sum + rab.rencana_pengeluaran, 0);
  const totalLPJ = mockLPJs.reduce((sum, lpj) => sum + lpj.realisasi_pengeluaran, 0);
  const rabPending = mockRABs.filter(r => r.status === DocumentStatus.DIAJUKAN).length;
  const lpjPending = mockLPJs.filter(l => l.status === DocumentStatus.DIAJUKAN).length;

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
          <RABTable 
            data={filteredRABs} 
            title={`RAB Periode ${formatPeriode(currentPeriode.id)}`} 
            onView={(rab) => console.log("View RAB", rab)}
            onApprove={(rab) => console.log("Approve RAB", rab)}
            onRevision={(rab) => console.log("Revision RAB", rab)}
          />
        </TabsContent>
        <TabsContent value="lpj" className="animate-fade-in">
          <LPJTable 
            data={filteredLPJs} 
            title={`LPJ Periode ${formatPeriode(currentPeriode.id)}`} 
            onView={(lpj) => console.log("View LPJ", lpj)}
            onApprove={(lpj) => console.log("Approve LPJ", lpj)}
            onRevision={(lpj) => console.log("Revision LPJ", lpj)}
          />
        </TabsContent>
      </Tabs>
    </AdminPusatLayout>
  );
};

export default Dashboard;
