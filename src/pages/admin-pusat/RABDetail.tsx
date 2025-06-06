
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { fetchRAB, getFileUrl, updateRABStatus } from "@/services/api";
import { DocumentStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, File, XCircle, Check, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const RABDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: rab, isLoading, refetch } = useQuery({
    queryKey: ['rab', id],
    queryFn: () => id ? fetchRAB(id) : Promise.resolve(null),
    enabled: !!id
  });

  const { data: fileUrl } = useQuery({
    queryKey: ['rab-file', rab?.dokumen_path],
    queryFn: () => rab?.dokumen_path ? getFileUrl(rab.dokumen_path) : Promise.resolve(null),
    enabled: !!rab?.dokumen_path
  });

  const handleApprove = async () => {
    if (!rab?.id) return;
    
    const result = await updateRABStatus(rab.id, DocumentStatus.DITERIMA);
    if (result) {
      toast.success("RAB berhasil disetujui");
      refetch();
    } else {
      toast.error("Gagal menyetujui RAB");
    }
  };

  const handleRevision = () => {
    const pesanRevisi = prompt("Masukkan pesan revisi:");
    if (pesanRevisi && rab?.id) {
      updateRABStatus(rab.id, DocumentStatus.REVISI, pesanRevisi).then((result) => {
        if (result) {
          toast.success("RAB ditolak dan memerlukan revisi");
          refetch();
        } else {
          toast.error("Gagal menolak RAB");
        }
      });
    }
  };

  if (isLoading) {
    return (
      <AdminPusatLayout title="Detail RAB">
        <div className="flex justify-center items-center h-64">
          <p>Memuat data RAB...</p>
        </div>
      </AdminPusatLayout>
    );
  }

  if (!rab) {
    return (
      <AdminPusatLayout title="Detail RAB">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg">RAB tidak ditemukan</p>
          <Button onClick={() => navigate("/admin-pusat/rab")}>
            Kembali ke Daftar RAB
          </Button>
        </div>
      </AdminPusatLayout>
    );
  }

  return (
    <AdminPusatLayout title="Detail RAB">
      <div className="mb-4 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate("/admin-pusat/rab")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        {rab.status === DocumentStatus.DIAJUKAN && (
          <div className="flex space-x-2">
            <Button
              variant="default"
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="mr-2 h-4 w-4" /> Setujui
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevision}
            >
              <X className="mr-2 h-4 w-4" /> Revisi
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi RAB</CardTitle>
            <CardDescription>
              Detail Rencana Anggaran Belanja dari {rab.pondok?.nama}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Pondok</h3>
                  <p className="mt-1 text-lg font-semibold">{rab.pondok?.nama}</p>
                </div>

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
    </AdminPusatLayout>
  );
};

export default RABDetailPage;
