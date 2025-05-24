
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { fetchRAB, getFileUrl } from "@/services/api";
import { DocumentStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, File, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const RABDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: rab, isLoading } = useQuery({
    queryKey: ['rab', id],
    queryFn: () => id ? fetchRAB(id) : Promise.resolve(null),
    enabled: !!id
  });

  const { data: fileUrl } = useQuery({
    queryKey: ['rab-file', rab?.dokumen_path],
    queryFn: () => rab?.dokumen_path ? getFileUrl(rab.dokumen_path) : Promise.resolve(null),
    enabled: !!rab?.dokumen_path
  });

  if (isLoading) {
    return (
      <AdminPondokLayout title="Detail RAB">
        <div className="flex justify-center items-center h-64">
          <p>Memuat data RAB...</p>
        </div>
      </AdminPondokLayout>
    );
  }

  if (!rab) {
    return (
      <AdminPondokLayout title="Detail RAB">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg">RAB tidak ditemukan</p>
          <Button onClick={() => navigate("/admin-pondok/rab")}>
            Kembali ke Daftar RAB
          </Button>
        </div>
      </AdminPondokLayout>
    );
  }

  return (
    <AdminPondokLayout title="Detail RAB">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate("/admin-pondok/rab")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi RAB</CardTitle>
            <CardDescription>
              Detail Rencana Anggaran Belanja
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="mt-1">
                    {rab.status === DocumentStatus.DIAJUKAN ? (
                      <Badge variant="outline">Diajukan</Badge>
                    ) : rab.status === DocumentStatus.DITERIMA ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        Diterima
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Revisi</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Periode</h3>
                  <p className="mt-1 text-lg">
                    {rab.periode
                      ? `${rab.periode.tahun}-${String(rab.periode.bulan).padStart(2, "0")}`
                      : "-"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tanggal Pengajuan</h3>
                  <p className="mt-1 text-lg">
                    {rab.submitted_at
                      ? new Date(rab.submitted_at).toLocaleDateString("id-ID")
                      : "-"}
                  </p>
                </div>

                {rab.accepted_at && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tanggal Diterima</h3>
                    <p className="mt-1 text-lg">
                      {new Date(rab.accepted_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Saldo Awal</h3>
                  <p className="mt-1 text-lg font-semibold">
                    {formatCurrency(rab.saldo_awal || 0)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Rencana Pemasukan</h3>
                  <p className="mt-1 text-lg">
                    {formatCurrency(rab.rencana_pemasukan || 0)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Rencana Pengeluaran</h3>
                  <p className="mt-1 text-lg">
                    {formatCurrency(rab.rencana_pengeluaran || 0)}
                  </p>
                </div>
              </div>
            </div>

            {rab.status === DocumentStatus.REVISI && rab.pesan_revisi && (
              <Alert className="border-amber-500">
                <AlertTitle>Pesan Revisi</AlertTitle>
                <AlertDescription>{rab.pesan_revisi}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Berkas RAB</CardTitle>
            <CardDescription>
              Dokumen yang dilampirkan untuk RAB
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rab.dokumen_path ? (
              <div className="flex items-center space-x-4">
                <File className="h-10 w-10 text-blue-500" />
                <div>
                  <a
                    href={fileUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    Lihat Berkas RAB
                  </a>
                  <p className="text-sm text-muted-foreground">
                    Klik untuk membuka berkas RAB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <XCircle className="h-10 w-10 text-red-500 mr-4" />
                <div>
                  <p className="font-medium">Berkas tidak tersedia</p>
                  <p className="text-sm text-muted-foreground">
                    Tidak ada berkas dilampirkan untuk RAB ini.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPondokLayout>
  );
};

export default RABDetailPage;
