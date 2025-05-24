
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { fetchLPJ, getFileUrl, updateLPJStatus } from "@/services/api";
import { DocumentStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, File, XCircle, Check, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

const LPJDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: lpj, isLoading, refetch } = useQuery({
    queryKey: ['lpj', id],
    queryFn: () => id ? fetchLPJ(id) : Promise.resolve(null),
    enabled: !!id
  });

  const { data: fileUrl } = useQuery({
    queryKey: ['lpj-file', lpj?.dokumen_path],
    queryFn: () => lpj?.dokumen_path ? getFileUrl(lpj.dokumen_path) : Promise.resolve(null),
    enabled: !!lpj?.dokumen_path
  });

  const handleApprove = async () => {
    if (!lpj?.id) return;
    
    const result = await updateLPJStatus(lpj.id, DocumentStatus.DITERIMA);
    if (result) {
      toast.success("LPJ berhasil disetujui");
      refetch();
    } else {
      toast.error("Gagal menyetujui LPJ");
    }
  };

  const handleRevision = () => {
    const pesanRevisi = prompt("Masukkan pesan revisi:");
    if (pesanRevisi && lpj?.id) {
      updateLPJStatus(lpj.id, DocumentStatus.REVISI, pesanRevisi).then((result) => {
        if (result) {
          toast.success("LPJ ditolak dan memerlukan revisi");
          refetch();
        } else {
          toast.error("Gagal menolak LPJ");
        }
      });
    }
  };

  if (isLoading) {
    return (
      <AdminPusatLayout title="Detail LPJ">
        <div className="flex justify-center items-center h-64">
          <p>Memuat data LPJ...</p>
        </div>
      </AdminPusatLayout>
    );
  }

  if (!lpj) {
    return (
      <AdminPusatLayout title="Detail LPJ">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg">LPJ tidak ditemukan</p>
          <Button onClick={() => navigate("/admin-pusat/lpj")}>
            Kembali ke Daftar LPJ
          </Button>
        </div>
      </AdminPusatLayout>
    );
  }

  return (
    <AdminPusatLayout title="Detail LPJ">
      <div className="mb-4 flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate("/admin-pusat/lpj")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        {lpj.status === DocumentStatus.DIAJUKAN && (
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
            <CardTitle>Informasi LPJ</CardTitle>
            <CardDescription>
              Detail Laporan Pertanggungjawaban dari {lpj.pondok?.nama}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Pondok</h3>
                  <p className="mt-1 text-lg font-semibold">{lpj.pondok?.nama}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <div className="mt-1">
                    {lpj.status === DocumentStatus.DIAJUKAN ? (
                      <Badge variant="outline">Diajukan</Badge>
                    ) : lpj.status === DocumentStatus.DITERIMA ? (
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
                    {lpj.periode
                      ? `${lpj.periode.tahun}-${String(lpj.periode.bulan).padStart(2, "0")}`
                      : "-"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tanggal Pengajuan</h3>
                  <p className="mt-1 text-lg">
                    {lpj.submitted_at
                      ? new Date(lpj.submitted_at).toLocaleDateString("id-ID")
                      : "-"}
                  </p>
                </div>

                {lpj.accepted_at && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tanggal Diterima</h3>
                    <p className="mt-1 text-lg">
                      {new Date(lpj.accepted_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Saldo Awal</h3>
                  <p className="mt-1 text-lg font-semibold">
                    {formatCurrency(lpj.saldo_awal || 0)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Rencana Pemasukan</h3>
                  <p className="mt-1 text-lg">
                    {formatCurrency(lpj.rencana_pemasukan || 0)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Rencana Pengeluaran</h3>
                  <p className="mt-1 text-lg">
                    {formatCurrency(lpj.rencana_pengeluaran || 0)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Realisasi Pemasukan</h3>
                  <p className="mt-1 text-lg">
                    {formatCurrency(lpj.realisasi_pemasukan || 0)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Realisasi Pengeluaran</h3>
                  <p className="mt-1 text-lg">
                    {formatCurrency(lpj.realisasi_pengeluaran || 0)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Sisa Saldo</h3>
                  <p className="mt-1 text-lg font-semibold">
                    {formatCurrency(lpj.sisa_saldo || 0)}
                  </p>
                </div>
              </div>
            </div>

            {lpj.status === DocumentStatus.REVISI && lpj.pesan_revisi && (
              <Alert className="border-amber-500">
                <AlertTitle>Pesan Revisi</AlertTitle>
                <AlertDescription>{lpj.pesan_revisi}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Berkas LPJ</CardTitle>
            <CardDescription>
              Dokumen yang dilampirkan untuk LPJ
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lpj.dokumen_path ? (
              <div className="flex items-center space-x-4">
                <File className="h-10 w-10 text-blue-500" />
                <div>
                  <a
                    href={fileUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    Lihat Berkas LPJ
                  </a>
                  <p className="text-sm text-muted-foreground">
                    Klik untuk membuka berkas LPJ
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <XCircle className="h-10 w-10 text-red-500 mr-4" />
                <div>
                  <p className="font-medium">Berkas tidak tersedia</p>
                  <p className="text-sm text-muted-foreground">
                    Tidak ada berkas dilampirkan untuk LPJ ini.
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

export default LPJDetailPage;
