
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
  Pondok,
  RAB,
} from "@/types";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, InfoIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentPeriode, fetchPondok, fetchRABsByPondok, fetchLPJsByPondok } from "@/services/api";
import { Link } from "react-router-dom";

const PondokDashboard: React.FC = () => {
  const { user } = useAuth();

  // Fetch current period
  const { data: currentPeriode, isLoading: isLoadingPeriode } = useQuery({
    queryKey: ['currentPeriode'],
    queryFn: fetchCurrentPeriode
  });

  // Fetch pondok data
  const { data: pondok, isLoading: isLoadingPondok } = useQuery({
    queryKey: ['pondok', user?.pondok_id],
    queryFn: () => user?.pondok_id ? fetchPondok(user.pondok_id) : Promise.resolve(null),
    enabled: !!user?.pondok_id,
  });

  // Fetch RAB for current period and pondok
  const { data: rabs = [], isLoading: isLoadingRABs } = useQuery({
    queryKey: ['rabs', user?.pondok_id, currentPeriode?.id],
    queryFn: () => user?.pondok_id && currentPeriode?.id ? 
      fetchRABsByPondok(user.pondok_id).then(allRabs => 
        allRabs.filter(rab => rab.periode_id === currentPeriode.id)
      ) : Promise.resolve([]),
    enabled: !!user?.pondok_id && !!currentPeriode?.id,
  });

  // Fetch LPJ for current period and pondok
  const { data: lpjs = [], isLoading: isLoadingLPJs } = useQuery({
    queryKey: ['lpjs', user?.pondok_id, currentPeriode?.id],
    queryFn: () => user?.pondok_id && currentPeriode?.id ? 
      fetchLPJsByPondok(user.pondok_id).then(allLpjs => 
        allLpjs.filter(lpj => lpj.periode_id === currentPeriode.id)
      ) : Promise.resolve([]),
    enabled: !!user?.pondok_id && !!currentPeriode?.id,
  });

  // Get current RAB and LPJ for this period
  const currentRAB = rabs.length > 0 ? rabs[0] : null;
  const currentLPJ = lpjs.length > 0 ? lpjs[0] : null;
  
  const isVerified = pondok?.accepted_at ? true : false;
  const isLoading = isLoadingPeriode || isLoadingPondok || isLoadingRABs || isLoadingLPJs;

  if (isLoading) {
    return (
      <AdminPondokLayout>
        <div className="flex justify-center items-center h-64">
          <p>Memuat data...</p>
        </div>
      </AdminPondokLayout>
    );
  }

  if (!currentPeriode) {
    return (
      <AdminPondokLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg">Tidak ada periode aktif saat ini</p>
          <p className="text-muted-foreground">Silakan hubungi admin pusat</p>
        </div>
      </AdminPondokLayout>
    );
  }

  const rabStatus = isVerified ? (
    <Card>
      <CardHeader>
        <CardTitle>RAB Periode Ini</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentRAB ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">Anda belum membuat RAB untuk periode ini</p>
            <Button asChild>
              <Link to="/admin-pondok/rab">Buat RAB</Link>
            </Button>
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1 text-lg font-semibold">
                {currentRAB.status === DocumentStatus.DIAJUKAN
                  ? "Diajukan"
                  : currentRAB.status === DocumentStatus.DITERIMA
                  ? "Diterima"
                  : "Revisi"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Tanggal Pengajuan
              </dt>
              <dd className="mt-1 text-lg">
                {currentRAB.submitted_at
                  ? new Date(currentRAB.submitted_at).toLocaleDateString("id-ID")
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Saldo Awal
              </dt>
              <dd className="mt-1 text-lg font-semibold">
                {formatCurrency(currentRAB.saldo_awal || 0)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Rencana Pemasukan
              </dt>
              <dd className="mt-1 text-lg">
                {formatCurrency(currentRAB.rencana_pemasukan || 0)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Rencana Pengeluaran
              </dt>
              <dd className="mt-1 text-lg">
                {formatCurrency(currentRAB.rencana_pengeluaran || 0)}
              </dd>
            </div>
            <div className="col-span-2">
              {currentRAB.status === DocumentStatus.REVISI && currentRAB.pesan_revisi && (
                <Alert className="border-amber-500">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle>Revisi Diperlukan</AlertTitle>
                  <AlertDescription>{currentRAB.pesan_revisi}</AlertDescription>
                </Alert>
              )}
            </div>
          </dl>
        )}
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
        {!currentLPJ ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">Anda belum membuat LPJ untuk periode ini</p>
            <Button asChild>
              <Link to="/admin-pondok/lpj">Buat LPJ</Link>
            </Button>
          </div>
        ) : (
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1 text-lg font-semibold">
                {currentLPJ.status === DocumentStatus.DIAJUKAN
                  ? "Diajukan"
                  : currentLPJ.status === DocumentStatus.DITERIMA
                  ? "Diterima"
                  : "Revisi"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Tanggal Pengajuan
              </dt>
              <dd className="mt-1 text-lg">
                {currentLPJ.submitted_at
                  ? new Date(currentLPJ.submitted_at).toLocaleDateString("id-ID")
                  : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Realisasi Pemasukan
              </dt>
              <dd className="mt-1 text-lg">
                {formatCurrency(currentLPJ.realisasi_pemasukan || 0)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Realisasi Pengeluaran
              </dt>
              <dd className="mt-1 text-lg">
                {formatCurrency(currentLPJ.realisasi_pengeluaran || 0)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                Sisa Saldo
              </dt>
              <dd className="mt-1 text-lg font-semibold">
                {formatCurrency(currentLPJ.sisa_saldo || 0)}
              </dd>
            </div>
            <div className="col-span-2">
              {currentLPJ.status === DocumentStatus.REVISI && currentLPJ.pesan_revisi && (
                <Alert className="border-amber-500">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle>Revisi Diperlukan</AlertTitle>
                  <AlertDescription>{currentLPJ.pesan_revisi}</AlertDescription>
                </Alert>
              )}
            </div>
          </dl>
        )}
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
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin-pondok/akun">Lihat Status Verifikasi</Link>
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

        {currentPeriode && <PeriodInfo periode={currentPeriode} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rabStatus}
          {lpjStatus}
        </div>
      </div>
    </AdminPondokLayout>
  );
};

export default PondokDashboard;
