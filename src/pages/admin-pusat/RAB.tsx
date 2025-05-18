
import React, { useState } from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { RABTable } from "@/components/tables/RABTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentStatus, mockPeriode, PondokJenis, RAB } from "@/types";
import { formatPeriode } from "@/lib/utils";

// Mock data for demonstration
const mockRABs: RAB[] = [
  {
    pondok_id: "pd1",
    periode_id: mockPeriode.id,
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
    periode_id: mockPeriode.id,
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
    periode_id: mockPeriode.id,
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

const RABPage: React.FC = () => {
  const [selectedPeriode, setSelectedPeriode] = useState(mockPeriode.id);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");

  // Filter RABs based on search text, period, and status
  const filteredRABs = mockRABs.filter(
    (rab) =>
      rab.periode_id === selectedPeriode &&
      (searchText === "" ||
        rab.pondok?.nama.toLowerCase().includes(searchText.toLowerCase())) &&
      (statusFilter === "all" || rab.status === statusFilter)
  );

  // Group RABs by status
  const diajukanRABs = filteredRABs.filter((rab) => rab.status === DocumentStatus.DIAJUKAN);
  const diterimaRABs = filteredRABs.filter((rab) => rab.status === DocumentStatus.DITERIMA);
  const revisiRABs = filteredRABs.filter((rab) => rab.status === DocumentStatus.REVISI);

  return (
    <AdminPusatLayout title="Rencana Anggaran Belanja (RAB)">
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Select
            value={selectedPeriode}
            onValueChange={setSelectedPeriode}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={mockPeriode.id}>
                {formatPeriode(mockPeriode.id)}
              </SelectItem>
              <SelectItem value="202504">April 2025</SelectItem>
              <SelectItem value="202503">Maret 2025</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as DocumentStatus | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value={DocumentStatus.DIAJUKAN}>Diajukan</SelectItem>
              <SelectItem value={DocumentStatus.DITERIMA}>Diterima</SelectItem>
              <SelectItem value={DocumentStatus.REVISI}>Revisi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-3">
          <Input
            placeholder="Cari pondok..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </div>

      <Tabs defaultValue="diajukan" className="w-full">
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="diajukan">
            Diajukan ({diajukanRABs.length})
          </TabsTrigger>
          <TabsTrigger value="diterima">
            Diterima ({diterimaRABs.length})
          </TabsTrigger>
          <TabsTrigger value="revisi">
            Revisi ({revisiRABs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diajukan" className="animate-fade-in">
          <RABTable
            data={diajukanRABs}
            title="RAB yang Sedang Diajukan"
            onView={(rab) => console.log("View RAB", rab)}
            onApprove={(rab) => console.log("Approve RAB", rab)}
            onRevision={(rab) => console.log("Revision RAB", rab)}
          />
        </TabsContent>

        <TabsContent value="diterima" className="animate-fade-in">
          <RABTable
            data={diterimaRABs}
            title="RAB yang Telah Diterima"
            onView={(rab) => console.log("View RAB", rab)}
          />
        </TabsContent>

        <TabsContent value="revisi" className="animate-fade-in">
          <RABTable
            data={revisiRABs}
            title="RAB yang Perlu Revisi"
            onView={(rab) => console.log("View RAB", rab)}
          />
        </TabsContent>
      </Tabs>
    </AdminPusatLayout>
  );
};

export default RABPage;
