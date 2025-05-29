import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RevisionActions } from "@/components/admin-pondok/RevisionActions";
import { fetchLPJDetail } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { DocumentStatus } from "@/types";
import { ArrowLeft, Download, FileText, Calendar, Building2, TrendingUp, TrendingDown } from "lucide-react";

const AdminPondokLPJDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: lpj, isLoading, error } = useQuery({
    queryKey: ['lpj', id],
    queryFn: () => fetchLPJDetail(id!),
    enabled: !!id
  });

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.DIAJUKAN:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Diajukan</Badge>;
      case DocumentStatus.DITERIMA:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Diterima</Badge>;
      case DocumentStatus.REVISI:
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Revisi</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AdminPondokLayout title="Detail LPJ">
        <div className="flex justify-center items-center h-64">
          <p>Memuat data LPJ...</p>
        </div>
      </AdminPondokLayout>
    );
  }

  if (error || !lpj) {
    return (
      <AdminPondokLayout title="Detail LPJ">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg text-red-600">Error memuat data LPJ</p>
          <Button onClick={() => navigate("/admin-pondok/lpj")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar LPJ
          </Button>
        </div>
      </AdminPondokLayout>
    );
  }

  const deviasiPemasukan = (lpj.realisasi_pemasukan || 0) - (lpj.rencana_pemasukan || 0);
  const deviasiPengeluaran = (lpj.realisasi_pengeluaran || 0) - (lpj.rencana_pengeluaran || 0);

  return (
    <AdminPondokLayout title="Detail LPJ">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/admin-pondok/lpj")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          
          {lpj.dokumen_path && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Unduh Dokumen
            </Button>
          )}
        </div>

        {/* Revision Actions */}
        <RevisionActions
          documentType="lpj"
          documentId={lpj.id}
          status={lpj.status}
          pesanRevisi={lpj.pesan_revisi}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  LPJ - {lpj.periode?.tahun}-{lpj.periode?.bulan.toString().padStart(2, '0')}
                </CardTitle>
                <CardDescription>
                  Laporan Pertanggung Jawaban periode {lpj.periode?.tahun}-{lpj.periode?.bulan.toString().padStart(2, '0')}
                </CardDescription>
              </div>
              {getStatusBadge(lpj.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informasi Pondok */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Informasi Pondok
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nama Pondok:</span>
                  <p className="text-muted-foreground">{lpj.pondok?.nama}</p>
                </div>
                <div>
                  <span className="font-medium">Jenis:</span>
                  <p className="text-muted-foreground">{lpj.pondok?.jenis?.toUpperCase()}</p>
                </div>
                <div>
                  <span className="font-medium">Alamat:</span>
                  <p className="text-muted-foreground">{lpj.pondok?.alamat}</p>
                </div>
                <div>
                  <span className="font-medium">Nomor Telepon:</span>
                  <p className="text-muted-foreground">{lpj.pondok?.nomor_telepon}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Informasi Periode */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Informasi Periode
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Periode LPJ:</span>
                  <p className="text-muted-foreground">
                    {lpj.periode && new Date(lpj.periode.awal_lpj).toLocaleDateString('id-ID')} - {lpj.periode && new Date(lpj.periode.akhir_lpj).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Tanggal Diajukan:</span>
                  <p className="text-muted-foreground">
                    {lpj.submitted_at ? new Date(lpj.submitted_at).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
                {lpj.accepted_at && (
                  <div>
                    <span className="font-medium">Tanggal Diterima:</span>
                    <p className="text-muted-foreground">
                      {new Date(lpj.accepted_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Perbandingan Rencana vs Realisasi */}
            <div>
              <h3 className="text-lg font-medium mb-3">Perbandingan Anggaran</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pemasukan */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      Pemasukan
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Rencana:</span>
                      <span className="font-medium">{formatCurrency(lpj.rencana_pemasukan || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Realisasi:</span>
                      <span className="font-medium">{formatCurrency(lpj.realisasi_pemasukan || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm">Deviasi:</span>
                      <span className={`font-medium ${deviasiPemasukan >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(deviasiPemasukan)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Pengeluaran */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      Pengeluaran
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Rencana:</span>
                      <span className="font-medium">{formatCurrency(lpj.rencana_pengeluaran || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Realisasi:</span>
                      <span className="font-medium">{formatCurrency(lpj.realisasi_pengeluaran || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-sm">Deviasi:</span>
                      <span className={`font-medium ${deviasiPengeluaran <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(deviasiPengeluaran)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Ringkasan Keuangan */}
            <div>
              <h3 className="text-lg font-medium mb-3">Ringkasan Keuangan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Saldo Awal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(lpj.saldo_awal || 0)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Realisasi Pemasukan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(lpj.realisasi_pemasukan || 0)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Realisasi Pengeluaran</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(lpj.realisasi_pengeluaran || 0)}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Sisa Saldo:</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(lpj.sisa_saldo || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pesan Revisi jika ada */}
            {lpj.status === DocumentStatus.REVISI && lpj.pesan_revisi && (
              <Alert>
                <AlertDescription>
                  <strong>Pesan Revisi:</strong><br />
                  {lpj.pesan_revisi}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPondokLayout>
  );
};

export default AdminPondokLPJDetailPage;
