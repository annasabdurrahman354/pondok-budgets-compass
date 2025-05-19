import React, { useState } from "react";
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
import { PondokJenis, PengurusJabatan } from "@/types";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPondok, createAdminPondok } from "@/services/api";
import { toast } from "sonner";
import { getPondokJenisLabel } from "@/lib/utils";
import { PengurusForm } from "@/components/pondok/PengurusForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client"; 

interface PengurusFormData {
  nama: string;
  jabatan: PengurusJabatan;
  nomor_telepon: string;
}

interface AdminPondokFormData {
  nama: string;
  email: string;
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
  pengurus: PengurusFormData[];
  admin_pondok: AdminPondokFormData[];
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
  ],
  admin_pondok: [
    {
      nama: "",
      email: "",
      nomor_telepon: ""
    }
  ]
});

const defaultPengurusForm = (): PengurusFormData => ({
  nama: "",
  jabatan: PengurusJabatan.KETUA,
  nomor_telepon: ""
});

const defaultAdminPondokForm = (): AdminPondokFormData => ({
  nama: "",
  email: "",
  nomor_telepon: ""
});

const PondokCreatePage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PondokFormData>(defaultPondokForm());
  const [activeTab, setActiveTab] = useState("info");

  // Create pondok mutation
  const createPondokMutation = useMutation({
    mutationFn: async (data: PondokFormData) => {
      // 1. Insert pondok data - Using updated API function
      const pondokData = await createPondok({
        nama: data.nama,
        jenis: data.jenis,
        nomor_telepon: data.nomor_telepon,
        alamat: data.alamat,
        kode_pos: data.kode_pos,
        provinsi_id: data.provinsi_id,
        kota_id: data.kota_id,
        daerah_sambung_id: data.daerah_sambung_id,
        updated_at: new Date().toISOString() // Add the missing updated_at field
      });
      
      if (!pondokData) throw new Error("Gagal membuat data pondok");

      // 2. Insert pengurus data
      if (data.pengurus.length > 0) {
        const pengurusPromises = data.pengurus.map(p => {
          return supabase
            .from('pengurus')
            .insert({
              pondok_id: pondokData.id,
              nama: p.nama,
              jabatan: p.jabatan,
              nomor_telepon: p.nomor_telepon
            });
        });

        await Promise.all(pengurusPromises);
      }

      // 3. Insert admin pondok data
      if (data.admin_pondok.length > 0) {
        const adminPromises = data.admin_pondok.map(admin => {
          return createAdminPondok({
            pondok_id: pondokData.id,
            nama: admin.nama,
            email: admin.email,
            nomor_telepon: admin.nomor_telepon
          });
        });

        await Promise.all(adminPromises);
      }

      return pondokData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pondoks'] });
      toast.success("Pondok berhasil ditambahkan");
      navigate("/admin-pusat/pondok");
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

  const handlePengurusChange = (index: number, data: PengurusFormData) => {
    const updatedPengurus = [...formData.pengurus];
    updatedPengurus[index] = data;
    setFormData(prev => ({ ...prev, pengurus: updatedPengurus }));
  };

  const addPengurus = () => {
    setFormData(prev => ({
      ...prev,
      pengurus: [...prev.pengurus, defaultPengurusForm()]
    }));
  };

  const removePengurus = (index: number) => {
    if (formData.pengurus.length <= 1) {
      toast.error("Pondok harus memiliki minimal satu pengurus");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      pengurus: prev.pengurus.filter((_, i) => i !== index)
    }));
  };

  const handleAdminChange = (index: number, field: string, value: string) => {
    const updatedAdmins = [...formData.admin_pondok];
    updatedAdmins[index] = {
      ...updatedAdmins[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, admin_pondok: updatedAdmins }));
  };

  const addAdmin = () => {
    setFormData(prev => ({
      ...prev,
      admin_pondok: [...prev.admin_pondok, defaultAdminPondokForm()]
    }));
  };

  const removeAdmin = (index: number) => {
    if (formData.admin_pondok.length <= 1) {
      toast.error("Pondok harus memiliki minimal satu admin");
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      admin_pondok: prev.admin_pondok.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nama.trim()) {
      toast.error("Nama pondok tidak boleh kosong");
      return;
    }
    
    // Validate pengurus
    for (const pengurus of formData.pengurus) {
      if (!pengurus.nama.trim()) {
        setActiveTab("pengurus");
        toast.error("Nama pengurus tidak boleh kosong");
        return;
      }
    }

    // Validate admin
    for (const admin of formData.admin_pondok) {
      if (!admin.nama.trim() || !admin.email.trim()) {
        setActiveTab("admin");
        toast.error("Nama dan email admin pondok tidak boleh kosong");
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(admin.email)) {
        setActiveTab("admin");
        toast.error("Format email admin pondok tidak valid");
        return;
      }
    }
    
    createPondokMutation.mutate(formData);
  };

  return (
    <AdminPusatLayout title="Tambah Pondok">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate("/admin-pusat/pondok")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Tambah Pondok Baru</CardTitle>
            <CardDescription>
              Tambahkan data pondok, pengurus dan admin pondok
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="info">Informasi Pondok</TabsTrigger>
                <TabsTrigger value="pengurus">Data Pengurus</TabsTrigger>
                <TabsTrigger value="admin">Admin Pondok</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Pondok</Label>
                    <Input
                      id="nama"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      placeholder="Nama pondok"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jenis">Jenis Pondok</Label>
                    <Select
                      value={formData.jenis}
                      onValueChange={(value) => handleSelectChange('jenis', value)}
                    >
                      <SelectTrigger id="jenis">
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
                    value={formData.nomor_telepon}
                    onChange={handleInputChange}
                    placeholder="Nomor telepon pondok"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alamat">Alamat</Label>
                  <Input
                    id="alamat"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    placeholder="Alamat pondok"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="kode_pos">Kode Pos</Label>
                    <Input
                      id="kode_pos"
                      name="kode_pos"
                      value={formData.kode_pos}
                      onChange={handleInputChange}
                      placeholder="Kode pos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provinsi_id">Provinsi</Label>
                    <Input
                      id="provinsi_id"
                      name="provinsi_id"
                      value={formData.provinsi_id}
                      onChange={handleInputChange}
                      placeholder="ID Provinsi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kota_id">Kota</Label>
                    <Input
                      id="kota_id"
                      name="kota_id"
                      value={formData.kota_id}
                      onChange={handleInputChange}
                      placeholder="ID Kota"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daerah_sambung_id">Daerah Sambung</Label>
                  <Input
                    id="daerah_sambung_id"
                    name="daerah_sambung_id"
                    value={formData.daerah_sambung_id}
                    onChange={handleInputChange}
                    placeholder="ID Daerah sambung"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="pengurus">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Data Pengurus</h3>
                  <Button type="button" variant="outline" onClick={addPengurus}>
                    Tambah Pengurus
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {formData.pengurus.map((pengurus, index) => (
                    <PengurusForm
                      key={index}
                      pengurus={pengurus}
                      onChange={(data) => handlePengurusChange(index, data)}
                      onRemove={() => removePengurus(index)}
                      showRemoveButton={formData.pengurus.length > 1}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="admin">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Admin Pondok</h3>
                  <Button type="button" variant="outline" onClick={addAdmin}>
                    Tambah Admin
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {formData.admin_pondok.map((admin, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                      {formData.admin_pondok.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeAdmin(index)}
                          className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                      
                      <div>
                        <Label htmlFor={`admin-nama-${index}`}>Nama Admin</Label>
                        <Input
                          id={`admin-nama-${index}`}
                          value={admin.nama}
                          onChange={(e) => handleAdminChange(index, 'nama', e.target.value)}
                          placeholder="Nama admin pondok"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`admin-email-${index}`}>Email</Label>
                        <Input
                          id={`admin-email-${index}`}
                          value={admin.email}
                          onChange={(e) => handleAdminChange(index, 'email', e.target.value)}
                          placeholder="Email admin pondok"
                          type="email"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`admin-telepon-${index}`}>Nomor Telepon</Label>
                        <Input
                          id={`admin-telepon-${index}`}
                          value={admin.nomor_telepon}
                          onChange={(e) => handleAdminChange(index, 'nomor_telepon', e.target.value)}
                          placeholder="Nomor telepon admin"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
            
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/admin-pusat/pondok")}
            >
              Batal
            </Button>
            <Button type="submit" disabled={createPondokMutation.isPending}>
              {createPondokMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AdminPusatLayout>
  );
};

export default PondokCreatePage;
