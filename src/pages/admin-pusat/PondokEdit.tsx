import React, { useState, useEffect } from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { PengurusForm } from "@/components/pondok/PengurusForm";
import { PondokJenis, PengurusJabatan, UserRole } from "@/types";
import { ArrowLeft, Plus, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchPondok, updatePondok, verifyPondok, addPengurus, updatePengurus, deletePengurus } from "@/services/api";
import { toast } from "sonner";
import { getPondokJenisLabel } from "@/lib/utils";

interface PengurusFormData {
  id?: string;
  nama: string;
  jabatan: PengurusJabatan;
  nomor_telepon: string;
}

interface AdminFormData {
  id?: string;
  nama: string;
  email: string;
  nomor_telepon: string;
}

const PondokEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [pondokForm, setPondokForm] = useState({
    nama: "",
    jenis: PondokJenis.PPM,
    nomor_telepon: "",
    alamat: "",
    kode_pos: "",
    provinsi_id: "",
    kota_id: "",
    daerah_sambung_id: "",
  });

  const [pengurusList, setPengurusList] = useState<PengurusFormData[]>([]);
  const [adminList, setAdminList] = useState<AdminFormData[]>([]);
  const [newPengurus, setNewPengurus] = useState<PengurusFormData>({
    nama: "",
    jabatan: PengurusJabatan.KETUA,
    nomor_telepon: "",
  });
  const [newAdmin, setNewAdmin] = useState<AdminFormData>({
    nama: "",
    email: "",
    nomor_telepon: "",
  });
  const [activeTab, setActiveTab] = useState("info");

  // Fetch pondok data
  const { data: pondok, isLoading: isLoadingPondok } = useQuery({
    queryKey: ['pondok', id],
    queryFn: () => id ? fetchPondok(id) : Promise.resolve(null),
    enabled: !!id,
  });

  // Fetch users for this pondok
  const { data: adminUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['adminUsers', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('user_profile')
        .select('*')
        .eq('pondok_id', id)
        .eq('role', UserRole.ADMIN_PONDOK);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Populate form with existing data
  useEffect(() => {
    if (pondok) {
      setPondokForm({
        nama: pondok.nama,
        jenis: pondok.jenis as PondokJenis || PondokJenis.PPM,
        nomor_telepon: pondok.nomor_telepon || "",
        alamat: pondok.alamat || "",
        kode_pos: pondok.kode_pos || "",
        provinsi_id: pondok.provinsi_id || "",
        kota_id: pondok.kota_id || "",
        daerah_sambung_id: pondok.daerah_sambung_id || "",
      });

      if (pondok.pengurus) {
        setPengurusList(
          pondok.pengurus.map(p => ({
            id: p.id,
            nama: p.nama,
            jabatan: p.jabatan as PengurusJabatan,
            nomor_telepon: p.nomor_telepon || "",
          }))
        );
      }
    }
  }, [pondok]);

  // Populate admin users
  useEffect(() => {
    if (adminUsers.length > 0) {
      setAdminList(
        adminUsers.map(user => ({
          id: user.id,
          nama: user.nama,
          email: user.email,
          nomor_telepon: user.nomor_telepon || "",
        }))
      );
    }
  }, [adminUsers]);

  // Update pondok mutation
  const updatePondokMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const pondokData = {
        nama: data.get("nama") as string,
        jenis: data.get("jenis") as PondokJenis,
        nomor_telepon: data.get("nomor_telepon") as string,
        alamat: data.get("alamat") as string,
        kode_pos: data.get("kode_pos") as string,
      };

      return updatePondok(pondokId as string, pondokData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondok'] });
      toast.success("Data pondok berhasil diperbarui");
      setActiveTab("info");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Verify pondok mutation
  const verifyPondokMutation = useMutation({
    mutationFn: () => {
      if (!id) throw new Error("ID not found");
      return verifyPondok(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondok'] });
      toast.success("Pondok berhasil diverifikasi");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Add pengurus mutation
  const addPengurusMutation = useMutation({
    mutationFn: async (data: Omit<Pengurus, "id">) => {
      return addPengurus(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondok'] });
      setNewPengurus({
        nama: "",
        jabatan: PengurusJabatan.KETUA,
        nomor_telepon: "",
      });
      toast.success("Pengurus berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Update pengurus mutation
  const updatePengurusMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Pengurus> }) => {
      return updatePengurus(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondok'] });
      toast.success("Data pengurus berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Delete pengurus mutation
  const deletePengurusMutation = useMutation({
    mutationFn: (id: string) => deletePengurus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondok'] });
      toast.success("Pengurus berhasil dihapus");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Add admin user mutation
  const addAdminMutation = useMutation({
    mutationFn: async (data: AdminFormData) => {
      if (!id) throw new Error("ID not found");
      
      // Create a random password for the user
      const password = Math.random().toString(36).slice(-8);
      
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password,
      });
      
      if (authError) throw authError;
      
      // Create profile in user_profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profile')
        .insert({
          id: authData.user?.id,
          email: data.email,
          nama: data.nama,
          nomor_telepon: data.nomor_telepon,
          role: UserRole.ADMIN_PONDOK,
          pondok_id: id
        })
        .select();
      
      if (profileError) throw profileError;
      
      return { user: profileData[0], password };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setNewAdmin({
        nama: "",
        email: "",
        nomor_telepon: "",
      });
      toast.success(`Admin baru berhasil ditambahkan. Password: ${data.password}`);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Handle input changes for pondok form
  const handlePondokInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPondokForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePondokSelectChange = (name: string, value: string) => {
    setPondokForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle pengurus changes
  const handleUpdatePengurus = (index: number, data: PengurusFormData) => {
    const newList = [...pengurusList];
    newList[index] = data;
    setPengurusList(newList);
  };

  const handleRemovePengurus = (index: number) => {
    const pengurus = pengurusList[index];
    if (pengurus.id) {
      deletePengurusMutation.mutate(pengurus.id);
    } else {
      const newList = [...pengurusList];
      newList.splice(index, 1);
      setPengurusList(newList);
    }
  };

  const handleAddPengurus = () => {
    if (newPengurus.nama === "") {
      toast.error("Nama pengurus tidak boleh kosong");
      return;
    }
    
    addPengurusMutation.mutate(newPengurus);
  };

  const handleSavePengurus = (pengurus: PengurusFormData) => {
    if (!pengurus.id) return;
    updatePengurusMutation.mutate(pengurus);
  };

  // Handle admin changes
  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAdmin = () => {
    if (newAdmin.nama === "" || newAdmin.email === "") {
      toast.error("Nama dan email admin tidak boleh kosong");
      return;
    }
    
    addAdminMutation.mutate(newAdmin);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePondokMutation.mutate(pondokForm);
  };

  if (isLoadingPondok) {
    return (
      <AdminPusatLayout title="Edit Pondok">
        <div className="flex justify-center p-4">
          <p>Memuat data...</p>
        </div>
      </AdminPusatLayout>
    );
  }

  if (!pondok) {
    return (
      <AdminPusatLayout title="Edit Pondok">
        <div className="flex justify-center p-4">
          <p>Pondok tidak ditemukan</p>
        </div>
      </AdminPusatLayout>
    );
  }

  return (
    <AdminPusatLayout title="Edit Pondok">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate("/admin-pusat/pondok")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>

      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold mb-4">Edit Pondok: {pondok.nama}</h2>
        {!pondok.accepted_at && (
          <Button 
            onClick={() => verifyPondokMutation.mutate()}
            className="bg-green-600 hover:bg-green-700"
          >
            Verifikasi Pondok
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full sm:w-auto mb-4">
          <TabsTrigger value="info">Informasi Pondok</TabsTrigger>
          <TabsTrigger value="pengurus">Pengurus Pondok</TabsTrigger>
          <TabsTrigger value="admin">Admin Pondok</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Informasi Pondok</CardTitle>
                <CardDescription>
                  Edit informasi dasar pondok
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Pondok</Label>
                    <Input
                      id="nama"
                      name="nama"
                      value={pondokForm.nama}
                      onChange={handlePondokInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jenis">Jenis Pondok</Label>
                    <Select
                      value={pondokForm.jenis}
                      onValueChange={(value) => handlePondokSelectChange('jenis', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis pondok" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PondokJenis.PPM}>{getPondokJenisLabel(PondokJenis.PPM)}</SelectItem>
                        <SelectItem value={PondokJenis.PPPM}>{getPondokJenisLabel(PondokJenis.PPPM)}</SelectItem>
                        <SelectItem value={PondokJenis.BOARDING}>{getPondokJenisLabel(PondokJenis.BOARDING)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                  <Input
                    id="nomor_telepon"
                    name="nomor_telepon"
                    value={pondokForm.nomor_telepon}
                    onChange={handlePondokInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Input
                    id="alamat"
                    name="alamat"
                    value={pondokForm.alamat}
                    onChange={handlePondokInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="kode_pos">Kode Pos</Label>
                    <Input
                      id="kode_pos"
                      name="kode_pos"
                      value={pondokForm.kode_pos}
                      onChange={handlePondokInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provinsi_id">Provinsi</Label>
                    <Input
                      id="provinsi_id"
                      name="provinsi_id"
                      value={pondokForm.provinsi_id}
                      onChange={handlePondokInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kota_id">Kota</Label>
                    <Input
                      id="kota_id"
                      name="kota_id"
                      value={pondokForm.kota_id}
                      onChange={handlePondokInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daerah_sambung_id">Daerah Sambung</Label>
                  <Input
                    id="daerah_sambung_id"
                    name="daerah_sambung_id"
                    value={pondokForm.daerah_sambung_id}
                    onChange={handlePondokInputChange}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={updatePondokMutation.isPending}>
                  {updatePondokMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="pengurus">
          <Card>
            <CardHeader>
              <CardTitle>Data Pengurus</CardTitle>
              <CardDescription>
                Kelola pengurus pondok
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Accordion type="multiple" defaultValue={pengurusList.map((_p, i) => `pengurus-${i}`)}>
                {pengurusList.map((pengurus, index) => (
                  <AccordionItem key={index} value={`pengurus-${index}`}>
                    <AccordionTrigger>
                      {pengurus.nama} - {pengurus.jabatan}
                    </AccordionTrigger>
                    <AccordionContent>
                      <PengurusForm
                        pengurus={pengurus}
                        onChange={(data) => handleUpdatePengurus(index, data)}
                        onRemove={() => handleRemovePengurus(index)}
                      />
                      {pengurus.id && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={() => handleSavePengurus(pengurus)}
                            disabled={updatePengurusMutation.isPending}
                          >
                            {updatePengurusMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Tambah Pengurus Baru</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-nama">Nama Pengurus</Label>
                    <Input
                      id="new-nama"
                      value={newPengurus.nama}
                      onChange={(e) => setNewPengurus({...newPengurus, nama: e.target.value})}
                      placeholder="Nama lengkap pengurus"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-jabatan">Jabatan</Label>
                    <Select 
                      value={newPengurus.jabatan} 
                      onValueChange={(value) => setNewPengurus({...newPengurus, jabatan: value as PengurusJabatan})}
                    >
                      <SelectTrigger id="new-jabatan">
                        <SelectValue placeholder="Pilih jabatan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PengurusJabatan.KETUA}>Ketua</SelectItem>
                        <SelectItem value={PengurusJabatan.WAKIL_KETUA}>Wakil Ketua</SelectItem>
                        <SelectItem value={PengurusJabatan.SEKRETARIS}>Sekretaris</SelectItem>
                        <SelectItem value={PengurusJabatan.BENDAHARA}>Bendahara</SelectItem>
                        <SelectItem value={PengurusJabatan.ANGGOTA}>Anggota</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-nomor-telepon">Nomor Telepon</Label>
                    <Input
                      id="new-nomor-telepon"
                      value={newPengurus.nomor_telepon}
                      onChange={(e) => setNewPengurus({...newPengurus, nomor_telepon: e.target.value})}
                      placeholder="Nomor telepon pengurus"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddPengurus}
                      disabled={addPengurusMutation.isPending}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {addPengurusMutation.isPending ? "Menambahkan..." : "Tambah Pengurus"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>Admin Pondok</CardTitle>
              <CardDescription>
                Kelola user admin pondok
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {isLoadingUsers && <p>Memuat data admin...</p>}
                
                {!isLoadingUsers && adminList.length === 0 && (
                  <p className="text-muted-foreground">Belum ada admin untuk pondok ini</p>
                )}

                {adminList.map((admin, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">{admin.nama}</h3>
                    </div>
                    <div className="pl-7 text-sm space-y-1">
                      <p>Email: {admin.email}</p>
                      {admin.nomor_telepon && <p>Telepon: {admin.nomor_telepon}</p>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Tambah Admin Baru</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-nama">Nama Admin</Label>
                    <Input
                      id="admin-nama"
                      name="nama"
                      value={newAdmin.nama}
                      onChange={handleAdminInputChange}
                      placeholder="Nama lengkap admin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      name="email"
                      type="email"
                      value={newAdmin.email}
                      onChange={handleAdminInputChange}
                      placeholder="Email admin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-nomor-telepon">Nomor Telepon</Label>
                    <Input
                      id="admin-nomor-telepon"
                      name="nomor_telepon"
                      value={newAdmin.nomor_telepon}
                      onChange={handleAdminInputChange}
                      placeholder="Nomor telepon admin"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddAdmin}
                      disabled={addAdminMutation.isPending}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {addAdminMutation.isPending ? "Menambahkan..." : "Tambah Admin"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPusatLayout>
  );
};

export default PondokEditPage;
