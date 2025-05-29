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
import { fetchRABDetail } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { DocumentStatus } from "@/types";
import { ArrowLeft, Download, FileText, Calendar, Building2 } from "lucide-react";

const AdminPondokRABDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: rab, isLoading, error } = useQuery({
    queryKey: ['rab', id],
    queryFn: () => fetchRABDetail(id!),
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
      <AdminPondokLayout title="Detail RAB">
        <div className="flex justify-center items-center h-64">
          <p>Memuat data RAB...</p>
        </div>
      </AdminPondokLayout>
    );
  }

  if (error || !rab) {
    return (
      <AdminPondokLayout title="Detail RAB">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg text-red-600">Error memuat data RAB</p>
          <Button onClick={() => navigate("/admin-pondok/rab")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar RAB
          </Button>
        </div>
      </AdminPondokLayout>
    );
  }

  return (
    <AdminPondokLayout title="Detail RAB">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/admin-pondok/rab")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
          
          {rab.dokumen_path && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Unduh Dokumen
            </Button>
          )}
        </div>

        {/* Revision Actions */}
        <RevisionActions
          documentType="rab"
          documentId={rab.id}
          status={rab.status}
          pesanRevisi={rab.pesan_revisi}
        />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  RAB - {rab.periode?.tahun}-{rab.periode?.bulan.toString().padStart(2, '0')}
                </CardTitle>
                <CardDescription>
                  Rencana Anggaran Belanja periode {rab.periode?.tahun}-{rab.periode?.bulan.toString().padStart(2, '0')}
                </CardDescription>
              </div>
              {getStatusBadge(rab.status)}
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
                  <p className="text-muted-foreground">{rab.pondok?.nama}</p>
                </div>
                <div>
                  <span className="font-medium">Jenis:</span>
                  <p className="text-muted-foreground">{rab.pondok?.jenis?.toUpperCase()}</p>
                </div>
                <div>
                  <span className="font-medium">Alamat:</span>
                  <p className="text-muted-foreground">{rab.pondok?.alamat}</p>
                </div>
                <div>
                  <span className="font-medium">Nomor Telepon:</span>
                  <p className="text-muted-foreground">{rab.pondok?.nomor_telepon}</p>
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
                  <span className="font-medium">Periode RAB:</span>
                  <p className="text-muted-foreground">
                    {rab.periode && new Date(rab.periode.awal_rab).toLocaleDateString('id-ID')} - {rab.periode && new Date(rab.periode.akhir_rab).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Tanggal Diajukan:</span>
                  <p className="text-muted-foreground">
                    {rab.submitted_at ? new Date(rab.submitted_at).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
                {rab.accepted_at && (
                  <div>
                    <span className="font-medium">Tanggal Diterima:</span>
                    <p className="text-muted-foreground">
                      {new Date(rab.accepted_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Detail Anggaran */}
            <div>
              <h3 className="text-lg font-medium mb-3">Detail Anggaran</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Saldo Awal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(rab.saldo_awal || 0)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Rencana Pemasukan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(rab.rencana_pemasukan || 0)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Rencana Pengeluaran</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(rab.rencana_pengeluaran || 0)}
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estimasi Saldo Akhir:</span>
                  <span className="text-lg font-bold">
                    {formatCurrency((rab.saldo_awal || 0) + (rab.rencana_pemasukan || 0) - (rab.rencana_pengeluaran || 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Pesan Revisi jika ada */}
            {rab.status === DocumentStatus.REVISI && rab.pesan_revisi && (
              <Alert>
                <AlertDescription>
                  <strong>Pesan Revisi:</strong><br />
                  {rab.pesan_revisi}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPondokLayout>
  );
};

export default AdminPondokRABDetailPage;
