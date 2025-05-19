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
import { Pondok, PondokJenis, UserProfile, UserRole, Pengurus, PengurusJabatan } from "@/types";
import { getPondokJenisLabel } from "@/lib/utils";
import { Check, Edit, Eye, Plus, Search, Trash, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllPondok } from "@/services/api";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

interface PengursuFormData {
  nama: string;
  jabatan: PengurusJabatan;
  nomor_telepon: string;
}

interface PondokFormData {
  nama: string;
  jenis: PondokJenis;
  nomor_telepon: string;
  alamat: string;
  kode_pos: string;
  provinsi_id: string;
  kota_id: string;
  daerah_sambung_id: string;
  pengurus: PengursuFormData[];
}

const defaultPondokForm = (): PondokFormData => ({
  nama: "",
  jenis: PondokJenis.PPM,
  nomor_telepon: "",
  alamat: "",
  kode_pos: "",
  provinsi_id: "",
  kota_id: "",
  daerah_sambung_id: "",
  pengurus: [
    {
      nama: "",
      jabatan: PengurusJabatan.KETUA,
      nomor_telepon: ""
    }
  ]
});

const defaultPengurusForm = (): PengursuFormData => ({
  nama: "",
  jabatan: PengurusJabatan.KETUA,
  nomor_telepon: ""
});

const PondokPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [jenisFilter, setJenisFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedPondok, setSelectedPondok] = useState<Pondok | null>(null);
  const [formData, setFormData] = useState<PondokFormData>(defaultPondokForm());
  
  // Fetch pondoks data
  const { data: pondoks = [], isLoading: isLoadingPondoks } = useQuery({
    queryKey: ['pondoks'],
    queryFn: fetchAllPondok
  });

  // Fetch users data
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('role', UserRole.ADMIN_PONDOK);
      if (error) throw error;
      return data as UserProfile[];
    }
  });

  // Create pondok mutation
  const createPondokMutation = useMutation({
    mutationFn: async (data: PondokFormData) => {
      // 1. Insert pondok data
      const { data: pondokData, error: pondokError } = await supabase
        .from('pondok')
        .insert({
          nama: data.nama,
          jenis: data.jenis,
          nomor_telepon: data.nomor_telepon,
          alamat: data.alamat,
          kode_pos: data.kode_pos,
          provinsi_id: data.provinsi_id,
          kota_id: data.kota_id,
          daerah_sambung_id: data.daerah_sambung_id,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (pondokError) throw new Error(pondokError.message);

      // 2. Insert pengurus data
      if (data.pengurus.length > 0) {
        const pengurusData = data.pengurus.map(p => ({
          ...p,
          pondok_id: pondokData.id
        }));

        const { error: pengurusError } = await supabase
          .from('pengurus')
          .insert(pengurusData);
        
        if (pengurusError) throw new Error(pengurusError.message);
      }

      return pondokData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondoks'] });
      setIsDialogOpen(false);
      setFormData(defaultPondokForm());
      toast.success("Pondok berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Verify pondok mutation
  const verifyPondokMutation = useMutation({
    mutationFn: async (pondokId: string) => {
      const { error } = await supabase
        .from('pondok')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', pondokId);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondoks'] });
      toast.success("Pondok berhasil diverifikasi");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Delete pondok mutation
  const deletePondokMutation = useMutation({
    mutationFn: async (pondokId: string) => {
      const { error } = await supabase
        .from('pondok')
        .delete()
        .eq('id', pondokId);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondoks'] });
      toast.success("Pondok berhasil dihapus");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePengurusChange = (index: number, field: keyof PengursuFormData, value: string) => {
    setFormData(prev => {
      const updatedPengurus = [...prev.pengurus];
      updatedPengurus[index] = {
        ...updatedPengurus[index],
        [field]: value
      };
      return { ...prev, pengurus: updatedPengurus };
    });
  };

  const addPengurus = () => {
    setFormData(prev => ({
      ...prev,
      pengurus: [...prev.pengurus, defaultPengurusForm()]
    }));
  };

  const removePengurus = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pengurus: prev.pengurus.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPondokMutation.mutate(formData);
  };

  const handleVerify = (pondokId: string) => {
    verifyPondokMutation.mutate(pondokId);
  };

  const handleDelete = (pondokId: string) => {
    deletePondokMutation.mutate(pondokId);
  };

  const handleViewDetail = (pondok: Pondok) => {
    setSelectedPondok(pondok);
    setIsDetailDialogOpen(true);
  };

  // Filter pondoks based on search text, jenis, and verification status
  const filteredPondoks = pondoks.filter(
    (pondok) =>
      (searchText === "" ||
        pondok.nama.toLowerCase().includes(searchText.toLowerCase())) &&
      (jenisFilter === "all" || pondok.jenis === jenisFilter) &&
      (statusFilter === "all" ||
        (statusFilter === "verified" && pondok.accepted_at) ||
        (statusFilter === "unverified" && !pondok.accepted_at))
  );

  return (
    <AdminPusatLayout title="Manajemen Pondok">
      <div className="mb-6 flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Select
            value={jenisFilter}
            onValueChange={setJenisFilter}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Jenis Pondok" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value={PondokJenis.PPM}>PPM</SelectItem>
              <SelectItem value={PondokJenis.PPPM}>PPPM</SelectItem>
              <SelectItem value={PondokJenis.BOARDING}>Boarding</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status Verifikasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="verified">Terverifikasi</SelectItem>
              <SelectItem value="unverified">Belum Verifikasi</SelectItem>
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
            <Link to="/admin-pusat/pondok/create">
              <Plus className="mr-2 h-4 w-4" /> Tambah Pondok
            </Link>
          </Button>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Pondok</DialogTitle>
          </DialogHeader>
          {selectedPondok && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-4">Informasi Pondok</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Nama</dt>
                      <dd>{selectedPondok.nama}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Jenis</dt>
                      <dd>{getPondokJenisLabel(selectedPondok.jenis)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Nomor Telepon</dt>
                      <dd>{selectedPondok.nomor_telepon}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Alamat</dt>
                      <dd>{selectedPondok.alamat}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Kode Pos</dt>
                      <dd>{selectedPondok.kode_pos}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Status Verifikasi</dt>
                      <dd>
                        {selectedPondok.accepted_at ? (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            Terverifikasi
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            Menunggu Verifikasi
                          </Badge>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Pengurus Pondok</h3>
                  {selectedPondok.pengurus && selectedPondok.pengurus.length > 0 ? (
                    <div className="space-y-4">
                      {selectedPondok.pengurus.map((pengurus, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <p className="font-medium">{pengurus.nama}</p>
                          <p className="text-sm text-muted-foreground">{pengurus.jabatan}</p>
                          <p className="text-sm">{pengurus.nomor_telepon}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Tidak ada data pengurus</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Admin Pondok</h3>
                {users.find(user => user.pondok_id === selectedPondok.id) ? (
                  <div className="border rounded-md p-3">
                    <p className="font-medium">
                      {users.find(user => user.pondok_id === selectedPondok.id)?.nama}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {users.find(user => user.pondok_id === selectedPondok.id)?.email}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Belum ada admin untuk pondok ini</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pondok</CardTitle>
          <CardDescription>
            Kelola dan verifikasi pondok dalam yayasan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPondoks ? (
            <div className="flex justify-center p-4">
              <p>Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Pondok</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead>Nomor Telepon</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPondoks.map((pondok) => {
                    const adminPondok = users.find(
                      (user) => user.pondok_id === pondok.id
                    );

                    return (
                      <TableRow key={pondok.id}>
                        <TableCell className="font-medium">
                          {pondok.nama}
                        </TableCell>
                        <TableCell>
                          {getPondokJenisLabel(pondok.jenis)}
                        </TableCell>
                        <TableCell>{pondok.nomor_telepon}</TableCell>
                        <TableCell>{pondok.alamat}</TableCell>
                        <TableCell>
                          {pondok.accepted_at ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              Terverifikasi
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              Menunggu Verifikasi
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {adminPondok ? (
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                              <span>{adminPondok.nama}</span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Belum ada
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewDetail(pondok)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Detail</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => console.log("Edit pondok", pondok)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            {!pondok.accepted_at && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-green-500 hover:text-green-700"
                                onClick={() => handleVerify(pondok.id)}
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Verifikasi</span>
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                >
                                  <Trash className="h-4 w-4" />
                                  <span className="sr-only">Hapus</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Pondok</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus pondok {pondok.nama}?
                                    Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDelete(pondok.id)}
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
                    );
                  })}
                  {filteredPondoks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        Tidak ada data pondok
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

export default PondokPage;
