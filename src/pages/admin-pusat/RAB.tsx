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
import { DocumentStatus, RAB, Periode, Pondok } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Check, Copy, Edit, Eye, Plus, Search, Trash, Upload } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RABTable } from "@/components/tables/RABTable";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import { approveRAB, rejectRAB, fetchAllRAB, getFileUrl } from "@/services/api";

const formSchema = z.object({
  message: z.string().min(2, {
    message: "Pesan harus lebih dari 2 karakter.",
  }),
});

const RABPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [periodeFilter, setPeriodeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [selectedRAB, setSelectedRAB] = useState<RAB | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // Fetch RABs data
  const { data: rabs = [], isLoading: isLoadingRABs } = useQuery({
    queryKey: ['rabs'],
    queryFn: fetchAllRAB
  });

  // Fetch periodes data
  const { data: periodes = [], isLoading: isLoadingPeriodes } = useQuery({
    queryKey: ['periodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('periode')
        .select('*');
      if (error) throw error;
      return data as Periode[];
    }
  });

  const handleApprove = async (rab: RAB) => {
    try {
      await approveRAB(rab.id);
      toast.success("RAB berhasil disetujui");
      queryClient.invalidateQueries({ queryKey: ["rabs"] });
    } catch (error) {
      toast.error("Gagal menyetujui RAB");
      console.error(error);
    }
  };

  const handleRevision = (rab: RAB) => {
    setSelectedRAB(rab);
    setRevisionDialogOpen(true);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const handleSubmitRevision = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = formData.get("message") as string;
    
    if (selectedRAB) {
      try {
        await rejectRAB(selectedRAB.id, message);
        toast.success("RAB berhasil ditolak dan memerlukan revisi");
        setRevisionDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["rabs"] });
      } catch (error) {
        toast.error("Gagal menolak RAB");
        console.error(error);
      }
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Teks berhasil disalin!");
    } catch (err) {
      toast.error("Gagal menyalin teks!");
    }
  };

  const handleSelect = (rab: RAB) => {
    navigate(`/admin-pusat/rab/${rab.id}`);
  };

  const handleViewDetail = async (rab: RAB) => {
    setSelectedRAB(rab);
    try {
      if (rab.dokumen_path) {
        const url = await getFileUrl(rab.dokumen_path);
        setFileUrl(url);
      }
      setDetailDialogOpen(true);
    } catch (error) {
      toast.error("Gagal mengambil detail RAB");
      console.error(error);
    }
  };

  // Filter RABs based on search text, periode, and status
  const filteredRABs = rabs.filter(
    (rab) =>
      (searchText === "" ||
        rab.pondok?.nama.toLowerCase().includes(searchText.toLowerCase())) &&
      (periodeFilter === "all" || rab.periode_id === periodeFilter) &&
      (statusFilter === "all" || rab.status === statusFilter)
  );

  return (
    <AdminPusatLayout title="Manajemen RAB">
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Select
            value={periodeFilter}
            onValueChange={setPeriodeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Periode</SelectItem>
              {periodes.map((periode) => (
                <SelectItem key={periode.id} value={periode.id}>
                  {periode.tahun}-{String(periode.bulan).padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
        </div>

        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pondok..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-8 w-full sm:w-[200px] md:w-[300px]"
            />
          </div>
          <Button asChild>
            <Link to="/admin-pusat/rab/create">
              <Plus className="mr-2 h-4 w-4" /> Tambah RAB
            </Link>
          </Button>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={() => setDetailDialogOpen(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail RAB</DialogTitle>
            <DialogDescription>Informasi lengkap tentang RAB</DialogDescription>
          </DialogHeader>
          {selectedRAB && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Informasi RAB</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Pondok</dt>
                      <dd>{selectedRAB.pondok?.nama}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Periode</dt>
                      <dd>{selectedRAB.periode?.tahun}-{String(selectedRAB.periode?.bulan).padStart(2, '0')}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                      <dd>
                        {selectedRAB.status === DocumentStatus.DIAJUKAN ? (
                          <Badge variant="outline">Diajukan</Badge>
                        ) : selectedRAB.status === DocumentStatus.DITERIMA ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            Diterima
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Revisi</Badge>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Saldo Awal</dt>
                      <dd>{formatCurrency(selectedRAB.saldo_awal || 0)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Rencana Pemasukan</dt>
                      <dd>{formatCurrency(selectedRAB.rencana_pemasukan || 0)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Rencana Pengeluaran</dt>
                      <dd>{formatCurrency(selectedRAB.rencana_pengeluaran || 0)}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Berkas RAB</h3>
                  {fileUrl ? (
                    <div className="flex flex-col space-y-4">
                      <Button variant="secondary" onClick={() => handleCopy(fileUrl)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Salin URL
                      </Button>
                      <Button variant="secondary" asChild>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat Berkas
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Tidak ada berkas yang dilampirkan</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revision Dialog */}
      <Dialog open={revisionDialogOpen} onOpenChange={() => setRevisionDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Revisi RAB</DialogTitle>
            <DialogDescription>
              Masukkan pesan revisi untuk RAB ini.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={handleSubmitRevision} className="space-y-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pesan Revisi</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Masukkan pesan revisi..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Kirim Revisi</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Daftar RAB</CardTitle>
          <CardDescription>
            Kelola dan pantau RAB yang diajukan oleh setiap pondok
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingRABs ? (
            <div className="flex justify-center p-4">
              <p>Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <RABTable
                data={filteredRABs}
                onApprove={handleApprove}
                onRevision={handleRevision}
                onSelect={handleSelect}
                onView={handleViewDetail}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPusatLayout>
  );
};

export default RABPage;
