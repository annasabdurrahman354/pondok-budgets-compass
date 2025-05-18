
import React, { useState, useEffect } from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Periode as PeriodeType } from "@/types";
import { formatDate, formatPeriode } from "@/lib/utils";
import { Calendar, Edit, Eye, Plus, Trash } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllPeriode } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PeriodeFormData {
  tahun: number;
  bulan: number;
  awal_rab: string;
  akhir_rab: string;
  awal_lpj: string;
  akhir_lpj: string;
}

const defaultPeriodeForm = (): PeriodeFormData => ({
  tahun: new Date().getFullYear(),
  bulan: new Date().getMonth() + 1,
  awal_rab: '',
  akhir_rab: '',
  awal_lpj: '',
  akhir_lpj: ''
});

const PeriodePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPeriode, setSelectedPeriode] = useState<PeriodeType | null>(null);
  const [formData, setFormData] = useState<PeriodeFormData>(defaultPeriodeForm());

  // Fetch periods data
  const { data: periodes = [], isLoading } = useQuery({
    queryKey: ['periods'],
    queryFn: fetchAllPeriode
  });

  // Create period mutation
  const createPeriodeMutation = useMutation({
    mutationFn: async (newPeriode: PeriodeFormData) => {
      // Generate the period ID (YYYYMM)
      const periodeId = `${newPeriode.tahun}${String(newPeriode.bulan).padStart(2, '0')}`;
      
      const { data, error } = await supabase
        .from('periode')
        .insert({
          id: periodeId,
          tahun: Number(newPeriode.tahun),
          bulan: Number(newPeriode.bulan),
          awal_rab: newPeriode.awal_rab,
          akhir_rab: newPeriode.akhir_rab,
          awal_lpj: newPeriode.awal_lpj,
          akhir_lpj: newPeriode.akhir_lpj
        })
        .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      setIsDialogOpen(false);
      setFormData(defaultPeriodeForm());
      toast.success("Periode berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Update period mutation
  const updatePeriodeMutation = useMutation({
    mutationFn: async (updatedPeriode: PeriodeType) => {
      const { data, error } = await supabase
        .from('periode')
        .update({
          awal_rab: updatedPeriode.awal_rab,
          akhir_rab: updatedPeriode.akhir_rab,
          awal_lpj: updatedPeriode.awal_lpj,
          akhir_lpj: updatedPeriode.akhir_lpj
        })
        .eq('id', updatedPeriode.id)
        .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      setIsEditDialogOpen(false);
      setSelectedPeriode(null);
      toast.success("Periode berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Delete period mutation
  const deletePeriodeMutation = useMutation({
    mutationFn: async (periodeId: string) => {
      const { error } = await supabase
        .from('periode')
        .delete()
        .eq('id', periodeId);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      toast.success("Periode berhasil dihapus");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createPeriodeMutation.mutate(formData);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPeriode) {
      updatePeriodeMutation.mutate({
        ...selectedPeriode,
        awal_rab: formData.awal_rab,
        akhir_rab: formData.akhir_rab,
        awal_lpj: formData.awal_lpj,
        akhir_lpj: formData.akhir_lpj
      });
    }
  };

  const handleDelete = (periodeId: string) => {
    deletePeriodeMutation.mutate(periodeId);
  };

  const handleViewDetail = (periode: PeriodeType) => {
    setSelectedPeriode(periode);
    setIsDetailDialogOpen(true);
  };

  const handleEdit = (periode: PeriodeType) => {
    setSelectedPeriode(periode);
    setFormData({
      tahun: periode.tahun,
      bulan: periode.bulan,
      awal_rab: periode.awal_rab,
      akhir_rab: periode.akhir_rab,
      awal_lpj: periode.awal_lpj,
      akhir_lpj: periode.akhir_lpj
    });
    setIsEditDialogOpen(true);
  };

  return (
    <AdminPusatLayout title="Manajemen Periode">
      <div className="mb-6 flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Periode
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Tambah Periode Baru</DialogTitle>
                <DialogDescription>
                  Buat periode baru untuk RAB dan LPJ. Pastikan tanggal yang
                  diinput sudah benar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tahun">Tahun</Label>
                    <Input
                      id="tahun"
                      name="tahun"
                      type="number"
                      value={formData.tahun || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulan">Bulan</Label>
                    <Input
                      id="bulan"
                      name="bulan"
                      type="number"
                      min="1"
                      max="12"
                      value={formData.bulan || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awal_rab">Tanggal Mulai RAB</Label>
                  <Input
                    id="awal_rab"
                    name="awal_rab"
                    type="datetime-local"
                    value={formData.awal_rab || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="akhir_rab">Tanggal Berakhir RAB</Label>
                  <Input
                    id="akhir_rab"
                    name="akhir_rab"
                    type="datetime-local"
                    value={formData.akhir_rab || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awal_lpj">Tanggal Mulai LPJ</Label>
                  <Input
                    id="awal_lpj"
                    name="awal_lpj"
                    type="datetime-local"
                    value={formData.awal_lpj || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="akhir_lpj">Tanggal Berakhir LPJ</Label>
                  <Input
                    id="akhir_lpj"
                    name="akhir_lpj"
                    type="datetime-local"
                    value={formData.akhir_lpj || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createPeriodeMutation.isPending}>
                  {createPeriodeMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Periode {selectedPeriode && formatPeriode(selectedPeriode.id)}</DialogTitle>
          </DialogHeader>
          {selectedPeriode && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tahun</p>
                  <p>{selectedPeriode.tahun}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bulan</p>
                  <p>{selectedPeriode.bulan}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">RAB Mulai</p>
                <p>{formatDate(selectedPeriode.awal_rab)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">RAB Berakhir</p>
                <p>{formatDate(selectedPeriode.akhir_rab)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">LPJ Mulai</p>
                <p>{formatDate(selectedPeriode.awal_lpj)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">LPJ Berakhir</p>
                <p>{formatDate(selectedPeriode.akhir_lpj)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Periode {selectedPeriode && formatPeriode(selectedPeriode.id)}</DialogTitle>
              <DialogDescription>
                Ubah jadwal periode RAB dan LPJ
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="awal_rab">Tanggal Mulai RAB</Label>
                <Input
                  id="awal_rab"
                  name="awal_rab"
                  type="datetime-local"
                  value={formData.awal_rab || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="akhir_rab">Tanggal Berakhir RAB</Label>
                <Input
                  id="akhir_rab"
                  name="akhir_rab"
                  type="datetime-local"
                  value={formData.akhir_rab || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awal_lpj">Tanggal Mulai LPJ</Label>
                <Input
                  id="awal_lpj"
                  name="awal_lpj"
                  type="datetime-local"
                  value={formData.awal_lpj || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="akhir_lpj">Tanggal Berakhir LPJ</Label>
                <Input
                  id="akhir_lpj"
                  name="akhir_lpj"
                  type="datetime-local"
                  value={formData.akhir_lpj || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updatePeriodeMutation.isPending}>
                {updatePeriodeMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Periode</CardTitle>
          <CardDescription>
            Periode menentukan jadwal pengisian RAB dan LPJ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <p>Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>RAB Mulai</TableHead>
                    <TableHead>RAB Berakhir</TableHead>
                    <TableHead>LPJ Mulai</TableHead>
                    <TableHead>LPJ Berakhir</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periodes.map((periode) => (
                    <TableRow key={periode.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatPeriode(periode.id)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(periode.awal_rab)}</TableCell>
                      <TableCell>{formatDate(periode.akhir_rab)}</TableCell>
                      <TableCell>{formatDate(periode.awal_lpj)}</TableCell>
                      <TableCell>{formatDate(periode.akhir_lpj)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewDetail(periode)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(periode)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Periode</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus periode {formatPeriode(periode.id)}?
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(periode.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {periodes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        Tidak ada data periode
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPusatLayout>
  );
};

export default PeriodePage;
