
import React, { useEffect, useState } from "react";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pengurus, PengurusJabatan, PondokJenis } from "@/types";
import { Edit, Plus, Trash, UserCog } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPondok } from "@/services/api";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getPondokJenisLabel } from "@/lib/utils";

interface PengurusFormData {
  id?: string;
  nama: string;
  jabatan: PengurusJabatan;
  nomor_telepon: string;
}

const defaultPengurusForm = (): PengurusFormData => ({
  nama: "",
  jabatan: PengurusJabatan.KETUA,
  nomor_telepon: ""
});

const AkunPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isPengurusDialogOpen, setIsPengurusDialogOpen] = useState(false);
  const [pengurusForm, setPengurusForm] = useState<PengurusFormData>(defaultPengurusForm());
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch pondok data
  const { data: pondok, isLoading } = useQuery({
    queryKey: ['pondok', user?.pondok_id],
    queryFn: () => user?.pondok_id ? fetchPondok(user.pondok_id) : Promise.resolve(null),
    enabled: !!user?.pondok_id,
  });

  // Update pondok mutation
  const updatePondokMutation = useMutation({
    mutationFn: async (pondokData: { 
      nomor_telepon: string; 
      alamat: string;
      kode_pos: string;
    }) => {
      if (!user?.pondok_id) throw new Error("Pondok ID tidak ditemukan");

      const { error } = await supabase
        .from('pondok')
        .update({
          nomor_telepon: pondokData.nomor_telepon,
          alamat: pondokData.alamat,
          kode_pos: pondokData.kode_pos,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.pondok_id);
      
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondok', user?.pondok_id] });
      toast.success("Data pondok berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Create pengurus mutation
  const createPengurusMutation = useMutation({
    mutationFn: async (data: PengurusFormData) => {
      if (!user?.pondok_id) throw new Error("Pondok ID tidak ditemukan");

      const { data: result, error } = await supabase
        .from('pengurus')
        .insert({
          pondok_id: user.pondok_id,
          nama: data.nama,
          jabatan: data.jabatan,
          nomor_telepon: data.nomor_telepon
        })
        .select();
      
      if (error) throw new Error(error.message);
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondok', user?.pondok_id] });
      setIsPengurusDialogOpen(false);
      setPengurusForm(defaultPengurusForm());
      toast.success("Pengurus berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Update pengurus mutation
  const updatePengurusMutation = useMutation({
    mutationFn: async (data: PengurusFormData) => {
      if (!data.id) throw new Error("ID pengurus tidak ditemukan");

      const { error } = await supabase
        .from('pengurus')
        .update({
          nama: data.nama,
          jabatan: data.jabatan,
          nomor_telepon: data.nomor_telepon
        })
        .eq('id', data.id);
      
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondok', user?.pondok_id] });
      setIsPengurusDialogOpen(false);
      setPengurusForm(defaultPengurusForm());
      setIsEditing(false);
      toast.success("Pengurus berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Delete pengurus mutation
  const deletePengurusMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pengurus')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondok', user?.pondok_id] });
      toast.success("Pengurus berhasil dihapus");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const [pondokForm, setPondokForm] = useState({
    nomor_telepon: "",
    alamat: "",
    kode_pos: "",
  });

  // Update form when pondok data is loaded
  useEffect(() => {
    if (pondok) {
      setPondokForm({
        nomor_telepon: pondok.nomor_telepon || "",
        alamat: pondok.alamat || "",
        kode_pos: pondok.kode_pos || "",
      });
    }
  }, [pondok]);

  const handlePondokInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPondokForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePengurusInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPengurusForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePengurusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updatePengurusMutation.mutate(pengurusForm);
    } else {
      createPengurusMutation.mutate(pengurusForm);
    }
  };

  const handlePondokSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePondokMutation.mutate(pondokForm);
  };

  const handleEditPengurus = (pengurus: Pengurus) => {
    setPengurusForm({
      id: pengurus.id,
      nama: pengurus.nama,
      jabatan: pengurus.jabatan as PengurusJabatan,
      nomor_telepon: pengurus.nomor_telepon || ""
    });
    setIsEditing(true);
    setIsPengurusDialogOpen(true);
  };

  const handleDeletePengurus = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengurus ini?")) {
      deletePengurusMutation.mutate(id);
    }
  };

  const handleAddPengurus = () => {
    setPengurusForm(defaultPengurusForm());
    setIsEditing(false);
    setIsPengurusDialogOpen(true);
  };

  if (isLoading) {
    return (
      <AdminPondokLayout title="Akun">
        <div className="flex justify-center items-center h-64">
          <p>Memuat data...</p>
        </div>
      </AdminPondokLayout>
    );
  }

  if (!pondok) {
    return (
      <AdminPondokLayout title="Akun">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg">Data pondok tidak ditemukan</p>
          <p className="text-muted-foreground">Silakan hubungi admin pusat</p>
        </div>
      </AdminPondokLayout>
    );
  }

  return (
    <AdminPondokLayout title="Akun">
      <div className="space-y-6">
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profil Pondok</TabsTrigger>
            <TabsTrigger value="pengurus">Data Pengurus</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profil Pondok</CardTitle>
                    <CardDescription>
                      Informasi dan detail tentang pondok Anda
                    </CardDescription>
                  </div>
                  <Badge className={pondok.accepted_at ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {pondok.accepted_at ? "Terverifikasi" : "Menunggu Verifikasi"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground">Nama Pondok</Label>
                    <p className="font-medium text-lg">{pondok.nama}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Jenis Pondok</Label>
                    <p className="font-medium text-lg">{getPondokJenisLabel(pondok.jenis)}</p>
                  </div>
                </div>
                
                <form onSubmit={handlePondokSubmit}>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                        <Input 
                          id="nomor_telepon" 
                          name="nomor_telepon" 
                          value={pondokForm.nomor_telepon}
                          onChange={handlePondokInputChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kode_pos">Kode Pos</Label>
                        <Input 
                          id="kode_pos" 
                          name="kode_pos" 
                          value={pondokForm.kode_pos}
                          onChange={handlePondokInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="alamat">Alamat</Label>
                      <Input 
                        id="alamat" 
                        name="alamat" 
                        value={pondokForm.alamat}
                        onChange={handlePondokInputChange}
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={updatePondokMutation.isPending}
                      >
                        {updatePondokMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Profil Akun</CardTitle>
                <CardDescription>
                  Detail akun login Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground">Nama</Label>
                    <p className="font-medium">{user?.nama}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nomor Telepon</Label>
                    <p className="font-medium">{user?.nomor_telepon || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Role</Label>
                    <p className="font-medium">Admin Pondok</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  Ganti Password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="pengurus" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Data Pengurus</CardTitle>
                    <CardDescription>
                      Kelola data pengurus pondok
                    </CardDescription>
                  </div>
                  <Dialog open={isPengurusDialogOpen} onOpenChange={setIsPengurusDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={handleAddPengurus}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Pengurus
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handlePengurusSubmit}>
                        <DialogHeader>
                          <DialogTitle>{isEditing ? "Edit Pengurus" : "Tambah Pengurus"}</DialogTitle>
                          <DialogDescription>
                            {isEditing ? "Perbarui informasi pengurus" : "Tambahkan data pengurus baru"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="nama">Nama</Label>
                            <Input
                              id="nama"
                              name="nama"
                              value={pengurusForm.nama}
                              onChange={handlePengurusInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="jabatan">Jabatan</Label>
                            <Select
                              value={pengurusForm.jabatan}
                              onValueChange={(value) => setPengurusForm(prev => ({ ...prev, jabatan: value as PengurusJabatan }))}
                            >
                              <SelectTrigger id="jabatan">
                                <SelectValue placeholder="Pilih jabatan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={PengurusJabatan.KETUA}>Ketua</SelectItem>
                                <SelectItem value={PengurusJabatan.WAKIL_KETUA}>Wakil Ketua</SelectItem>
                                <SelectItem value={PengurusJabatan.PINISEPUH}>Pinisepuh</SelectItem>
                                <SelectItem value={PengurusJabatan.SEKRETARIS}>Sekretaris</SelectItem>
                                <SelectItem value={PengurusJabatan.BENDAHARA}>Bendahara</SelectItem>
                                <SelectItem value={PengurusJabatan.GURU}>Guru</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                            <Input
                              id="nomor_telepon"
                              name="nomor_telepon"
                              value={pengurusForm.nomor_telepon}
                              onChange={handlePengurusInputChange}
                              required
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={createPengurusMutation.isPending || updatePengurusMutation.isPending}>
                            {createPengurusMutation.isPending || updatePengurusMutation.isPending 
                              ? "Menyimpan..." 
                              : isEditing ? "Perbarui" : "Simpan"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pondok.pengurus && pondok.pengurus.length > 0 ? (
                    pondok.pengurus.map((pengurus) => (
                      <Card key={pengurus.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <UserCog className="h-10 w-10 text-primary mr-4" />
                              <div>
                                <p className="font-medium text-lg">{pengurus.nama}</p>
                                <div className="flex items-center space-x-4">
                                  <Badge variant="secondary">{pengurus.jabatan}</Badge>
                                  <p className="text-sm text-muted-foreground">{pengurus.nomor_telepon}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEditPengurus(pengurus)}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => pengurus.id && handleDeletePengurus(pengurus.id)}
                              >
                                <Trash className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Belum ada data pengurus</p>
                      <p className="text-sm mt-1">Tambahkan pengurus dengan klik tombol "Tambah Pengurus"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPondokLayout>
  );
};

export default AkunPage;
