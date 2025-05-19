import React, { useState } from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { LPJ, DocumentStatus } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Eye, Plus, Search, File, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllLPJ,
  approveLPJ,
  rejectLPJ,
  getFileUrl,
} from "@/services/api";
import { toast } from "sonner";
import { LPJTable } from "@/components/tables/LPJTable";
import { Link } from "react-router-dom";

const LPJPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [selectedLPJ, setSelectedLPJ] = useState<LPJ | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const { data: lpjs = [], isLoading: isLoadingLPJs } = useQuery({
    queryKey: ["lpjs"],
    queryFn: fetchAllLPJ,
  });

  const handleApprove = async (lpj: LPJ) => {
    try {
      await approveLPJ(lpj.id);
      toast.success("LPJ berhasil disetujui");
      queryClient.invalidateQueries({ queryKey: ["lpjs"] });
    } catch (error) {
      toast.error("Gagal menyetujui LPJ");
      console.error(error);
    }
  };

  const handleRevision = (lpj: LPJ) => {
    setSelectedLPJ(lpj);
    setRevisionDialogOpen(true);
  };

  const handleSubmitRevision = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = formData.get("message") as string;
    
    if (selectedLPJ) {
      try {
        await rejectLPJ(selectedLPJ.id, message);
        toast.success("LPJ berhasil ditolak dan memerlukan revisi");
        setRevisionDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["lpjs"] });
      } catch (error) {
        toast.error("Gagal menolak LPJ");
        console.error(error);
      }
    }
  };

  const filteredLPJs = lpjs.filter(
    (lpj) =>
      (searchText === "" ||
        lpj.pondok?.nama.toLowerCase().includes(searchText.toLowerCase())) &&
      (statusFilter === "all" || lpj.status === statusFilter)
  );

  const handleViewDetail = async (lpj: LPJ) => {
    setSelectedLPJ(lpj);
    try {
      if (lpj.dokumen_path) {
        const url = await getFileUrl(lpj.dokumen_path);
        setFileUrl(url);
      }
      setDetailDialogOpen(true);
    } catch (error) {
      toast.error("Gagal mengambil detail LPJ");
      console.error(error);
    }
  };

  return (
    <AdminPusatLayout title="Manajemen LPJ">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari LPJ..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8 w-full sm:w-[300px]"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(
                value === "all" ? "all" : (value as DocumentStatus)
              )
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value={DocumentStatus.DIAJUKAN}>Diajukan</SelectItem>
              <SelectItem value={DocumentStatus.DITERIMA}>Diterima</SelectItem>
              <SelectItem value={DocumentStatus.REVISI}>Revisi</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link to="/admin-pusat/lpj/create">
            <Plus className="mr-2 h-4 w-4" /> Tambah LPJ
          </Link>
        </Button>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail LPJ</DialogTitle>
            <DialogDescription>Informasi lengkap tentang LPJ</DialogDescription>
          </DialogHeader>
          {selectedLPJ && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Informasi LPJ</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Pondok
                      </dt>
                      <dd>{selectedLPJ.pondok?.nama}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Periode
                      </dt>
                      <dd>
                        {selectedLPJ.periode
                          ? `${selectedLPJ.periode.tahun}-${String(
                              selectedLPJ.periode.bulan
                            ).padStart(2, "0")}`
                          : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Status
                      </dt>
                      <dd>
                        {selectedLPJ.status === DocumentStatus.DIAJUKAN ? (
                          <Badge variant="outline">Diajukan</Badge>
                        ) : selectedLPJ.status === DocumentStatus.DITERIMA ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            Diterima
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Revisi</Badge>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Tanggal Pengajuan
                      </dt>
                      <dd>
                        {selectedLPJ.submitted_at
                          ? new Date(
                              selectedLPJ.submitted_at
                            ).toLocaleDateString("id-ID")
                          : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Realisasi Pemasukan
                      </dt>
                      <dd>{formatCurrency(selectedLPJ.realisasi_pemasukan || 0)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Realisasi Pengeluaran
                      </dt>
                      <dd>
                        {formatCurrency(selectedLPJ.realisasi_pengeluaran || 0)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Sisa Saldo
                      </dt>
                      <dd>{formatCurrency(selectedLPJ.sisa_saldo || 0)}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Berkas LPJ</h3>
                  {selectedLPJ.dokumen_path ? (
                    <div className="flex items-center space-x-4">
                      <File className="h-10 w-10 text-blue-500" />
                      <div>
                        <a
                          href={fileUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline"
                        >
                          Lihat Berkas
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
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                {selectedLPJ.status === DocumentStatus.DIAJUKAN && (
                  <>
                    <Button
                      variant="ghost"
                      className="text-green-500 hover:text-green-700"
                      onClick={() => handleApprove(selectedLPJ)}
                    >
                      Setujui
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRevision(selectedLPJ)}
                    >
                      Revisi
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revision Dialog */}
      <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Revisi LPJ</DialogTitle>
            <DialogDescription>
              Berikan pesan mengapa LPJ ini perlu direvisi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitRevision} className="space-y-4">
            <div>
              <Label htmlFor="message">Pesan Revisi</Label>
              <Input
                id="message"
                name="message"
                required
                placeholder="Jelaskan mengapa LPJ ini perlu direvisi..."
              />
            </div>
            <DialogFooter>
              <Button type="submit" variant="destructive">
                Kirim Revisi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Daftar LPJ</CardTitle>
          <CardDescription>
            Kelola dan pantau Laporan Pertanggungjawaban (LPJ)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingLPJs ? (
            <div className="flex justify-center p-4">
              <p>Memuat data...</p>
            </div>
          ) : (
            <LPJTable
              lpjs={filteredLPJs}
              onView={handleViewDetail}
              onApprove={handleApprove}
              onRevision={handleRevision}
            />
          )}
        </CardContent>
      </Card>
    </AdminPusatLayout>
  );
};

export default LPJPage;
