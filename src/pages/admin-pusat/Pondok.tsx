
import React, { useState } from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllPondoks, verifyPondok } from "@/services/api";
import { Pondok } from "@/types";
import { getPondokJenisLabel } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Search, CheckCircle, Clock, Edit, Eye } from "lucide-react";

const PondokPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: pondoks = [], isLoading } = useQuery({
    queryKey: ['pondoks'],
    queryFn: fetchAllPondoks
  });

  const verifyMutation = useMutation({
    mutationFn: verifyPondok,
    onSuccess: () => {
      toast.success("Pondok berhasil diverifikasi");
      queryClient.invalidateQueries({ queryKey: ['pondoks'] });
    },
    onError: () => {
      toast.error("Gagal memverifikasi pondok");
    },
  });

  const filteredPondoks = (pondoks as Pondok[]).filter((pondok) =>
    pondok.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pondok.alamat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (pondok: Pondok) => {
    if (pondok.accepted_at) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terverifikasi</Badge>;
    }
    return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
  };

  const handleVerify = (pondokId: string) => {
    verifyMutation.mutate(pondokId);
  };

  if (isLoading) {
    return (
      <AdminPusatLayout title="Kelola Pondok">
        <div className="flex justify-center items-center h-64">
          <p>Memuat data pondok...</p>
        </div>
      </AdminPusatLayout>
    );
  }

  return (
    <AdminPusatLayout title="Kelola Pondok">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold">Daftar Pondok</h2>
            <p className="text-muted-foreground">Kelola dan verifikasi pondok yang terdaftar</p>
          </div>
          <Button onClick={() => navigate("/admin-pusat/pondok/create")}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Pondok
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pondok..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Pondok</CardTitle>
            <CardDescription>
              Daftar semua pondok yang terdaftar dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Pondok</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPondoks.length > 0 ? (
                    filteredPondoks.map((pondok) => (
                      <TableRow key={pondok.id}>
                        <TableCell className="font-medium">{pondok.nama}</TableCell>
                        <TableCell>{getPondokJenisLabel(pondok.jenis)}</TableCell>
                        <TableCell>{pondok.alamat}</TableCell>
                        <TableCell>{getStatusBadge(pondok)}</TableCell>
                        <TableCell>
                          {pondok.updated_at ? new Date(pondok.updated_at).toLocaleDateString('id-ID') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin-pusat/pondok/${pondok.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            {!pondok.accepted_at && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Verifikasi Pondok</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin memverifikasi pondok "{pondok.nama}"?
                                      Setelah diverifikasi, pondok ini dapat mengajukan RAB dan LPJ.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleVerify(pondok.id)}
                                      disabled={verifyMutation.isPending}
                                    >
                                      {verifyMutation.isPending ? "Memverifikasi..." : "Verifikasi"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {searchTerm ? "Tidak ada pondok yang sesuai dengan pencarian." : "Belum ada pondok yang terdaftar."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPusatLayout>
  );
};

export default PondokPage;
