
import React from "react";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { PeriodInfo } from "@/components/dashboard/PeriodInfo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DocumentStatus,
  LPJ,
  mockPeriode,
  Pondok,
  PondokJenis,
  RAB,
} from "@/types";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, InfoIcon } from "lucide-react";

// Mock data
const currentPeriode = mockPeriode;

const mockPondok: Pondok = {
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
};

const mockRAB: RAB = {
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
};

const mockLPJ: LPJ = {
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
};

const PondokDashboard: React.FC = () => {
  const { user } = useAuth();
  const pondok = mockPondok;
  const isVerified = !!pondok.accepted_at;

  const rabStatus = isVerified ? (
    <Card>
      <CardHeader>
        <CardTitle>RAB Periode Ini</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
            <dd className="mt-1 text-lg font-semibold">
              {mockRAB.status === DocumentStatus.DIAJUKAN
                ? "Diajukan"
                : mockRAB.status === DocumentStatus.DITERIMA
                ? "Diterima"
                : "Revisi"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Tanggal Pengajuan
            </dt>
            <dd className="mt-1 text-lg">
              {mockRAB.submitted_at
                ? new Date(mockRAB.submitted_at).toLocaleDateString("id-ID")
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Saldo Awal
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {formatCurrency(mockRAB.saldo_awal)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Rencana Pemasukan
            </dt>
            <dd className="mt-1 text-lg">
              {formatCurrency(mockRAB.rencana_pemasukan)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Rencana Pengeluaran
            </dt>
            <dd className="mt-1 text-lg">
              {formatCurrency(mockRAB.rencana_pengeluaran)}
            </dd>
          </div>
          <div className="col-span-2">
            {mockRAB.status === DocumentStatus.REVISI && mockRAB.pesan_revisi && (
              <Alert className="border-amber-500">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Revisi Diperlukan</AlertTitle>
                <AlertDescription>{mockRAB.pesan_revisi}</AlertDescription>
              </Alert>
            )}
          </div>
        </dl>
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>RAB Periode Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="bg-amber-50 text-amber-800">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Data pondok belum terverifikasi</AlertTitle>
          <AlertDescription>
            Mohon menunggu verifikasi data pondok oleh admin pusat sebelum
            mengisi RAB.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const lpjStatus = isVerified ? (
    <Card>
      <CardHeader>
        <CardTitle>LPJ Periode Ini</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-muted-foreground">Status</dt>
            <dd className="mt-1 text-lg font-semibold">
              {mockLPJ.status === DocumentStatus.DIAJUKAN
                ? "Diajukan"
                : mockLPJ.status === DocumentStatus.DITERIMA
                ? "Diterima"
                : "Revisi"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Tanggal Pengajuan
            </dt>
            <dd className="mt-1 text-lg">
              {mockLPJ.submitted_at
                ? new Date(mockLPJ.submitted_at).toLocaleDateString("id-ID")
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Realisasi Pemasukan
            </dt>
            <dd className="mt-1 text-lg">
              {formatCurrency(mockLPJ.realisasi_pemasukan)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Realisasi Pengeluaran
            </dt>
            <dd className="mt-1 text-lg">
              {formatCurrency(mockLPJ.realisasi_pengeluaran)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-muted-foreground">
              Sisa Saldo
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {formatCurrency(mockLPJ.sisa_saldo)}
            </dd>
          </div>
          <div className="col-span-2">
            {mockLPJ.status === DocumentStatus.REVISI && mockLPJ.pesan_revisi && (
              <Alert className="border-amber-500">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <AlertTitle>Revisi Diperlukan</AlertTitle>
                <AlertDescription>{mockLPJ.pesan_revisi}</AlertDescription>
              </Alert>
            )}
          </div>
        </dl>
      </CardContent>
    </Card>
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>LPJ Periode Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="bg-amber-50 text-amber-800">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Data pondok belum terverifikasi</AlertTitle>
          <AlertDescription>
            Mohon menunggu verifikasi data pondok oleh admin pusat sebelum
            mengisi LPJ.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  return (
    <AdminPondokLayout>
      <div className="space-y-6">
        {!isVerified && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Menunggu Verifikasi</AlertTitle>
            <AlertDescription>
              Data pondok Anda sedang menunggu verifikasi dari admin pusat.
              Pembuatan RAB dan LPJ tidak dapat dilakukan hingga data Anda diverifikasi.
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  Lihat Status Verifikasi
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span>Selamat Datang, {user?.nama}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Selamat datang di Sistem Administrasi Keuangan Pondok. Anda dapat mengelola RAB dan LPJ untuk pondok Anda di sini.
            </p>
          </CardContent>
        </Card>

        <PeriodInfo periode={currentPeriode} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rabStatus}
          {lpjStatus}
        </div>
      </div>
    </AdminPondokLayout>
  );
};

export default PondokDashboard;
