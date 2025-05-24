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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { PondokJenis, PengurusJabatan, UserRole } from "@/types";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPondok, createPengurus, createAdminPondok } from "@/services/api";
import { toast } from "sonner";
import { getPondokJenisLabel } from "@/lib/utils";
import { PengurusForm } from "@/components/pondok/PengurusForm";
import { Separator } from "@/components/ui/separator";

interface PengurusFormData {
  nama: string;
  jabatan: PengurusJabatan;
  nomor_telepon: string;
}

interface AdminPondokFormData {
  nama: string;
  email: string;
  nomor_telepon: string;
  password: string;
  confirm_password: string;
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
  admin: AdminPondokFormData;
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
  admin: {
    nama: "",
    email: "",
    nomor_telepon: "",
    password: "",
    confirm_password: ""
  }
});

const defaultPengurusForm = (): PengurusFormData => ({
  nama: "",
  jabatan: PengurusJabatan.ANGGOTA,
  nomor_telepon: ""
});

const PondokCreatePage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PondokFormData>(defaultPondokForm());
  const [activeTab, setActiveTab] = useState("pondok");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common form handling functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user selects
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Pengurus handling
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

  // Admin handling
  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      admin: {
        ...prev.admin,
        [name]: value
      }
    }));
    
    // Clear error when user types
    if (errors[`admin_${name}`]) {
      setErrors(prev => ({ ...prev, [`admin_${name}`]: "" }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    // Validate pondok fields
    if (!formData.nama) newErrors.nama = "Nama pondok harus diisi";
    if (!formData.jenis) newErrors.jenis = "Jenis pondok harus dipilih";
    if (!formData.alamat) newErrors.alamat = "Alamat harus diisi";
    if (!formData.provinsi_id) newErrors.provinsi_id = "Provinsi harus dipilih";
    if (!formData.kota_id) newErrors.kota_id = "Kota harus dipilih";
    
    // Validate pengurus
    formData.pengurus.forEach((p, idx) => {
      if (!p.nama) newErrors[`pengurus_${idx}_nama`] = "Nama pengurus harus diisi";
      if (!p.jabatan) newErrors[`pengurus_${idx}_jabatan`] = "Jabatan harus dipilih";
    });
    
    // Validate admin pondok
    if (!formData.admin.nama) newErrors.admin_nama = "Nama admin harus diisi";
    if (!formData.admin.email) newErrors.admin_email = "Email admin harus diisi";
    else if (!validateEmail(formData.admin.email)) newErrors.admin_email = "Format email tidak valid";
    
    if (!formData.admin.password) newErrors.admin_password = "Password harus diisi";
    else if (formData.admin.password.length < 6) newErrors.admin_password = "Password minimal 6 karakter";
    
    if (!formData.admin.confirm_password) newErrors.admin_confirm_password = "Konfirmasi password harus diisi";
    else if (formData.admin.password !== formData.admin.confirm_password) {
      newErrors.admin_confirm_password = "Password tidak cocok";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!validateForm()) {
      setIsSubmitting(false);
      
      // Switch to the tab with errors
      if (Object.keys(errors).some(key => key.startsWith('admin_'))) {
        setActiveTab("admin");
      } else {
        setActiveTab("pondok");
      }
      
      return;
    }
    
    try {
      // 1. Create the pondok first
      const pondokData = {
        id: crypto.randomUUID(), // Generate ID manually
        nama: formData.nama,
        jenis: formData.jenis,
        nomor_telepon: formData.nomor_telepon || null,
        alamat: formData.alamat,
        kode_pos: formData.kode_pos || null,
        provinsi_id: formData.provinsi_id,
        kota_id: formData.kota_id,
        daerah_sambung_id: formData.daerah_sambung_id || null,
        updated_at: new Date().toISOString(),
        accepted_at: null, // Add this field
      };
      
      const newPondok = await createPondok(pondokData);
      
      if (!newPondok || !newPondok.id) {
        throw new Error("Gagal membuat data pondok");
      }
      
      // 2. Create pengurus data
      const pengurusPromises = formData.pengurus.map(async (p) => {
        return createPengurus({
          pondok_id: newPondok.id,
          nama: p.nama,
          jabatan: p.jabatan,
          nomor_telepon: p.nomor_telepon || null,
        });
      });
      
      await Promise.all(pengurusPromises);
      
      // 3. Create admin pondok user
      await createAdminPondok({
        id: crypto.randomUUID(),
        nama: formData.admin.nama,
        email: formData.admin.email,
        nomor_telepon: formData.admin.nomor_telepon || null,
        role: UserRole.ADMIN_PONDOK,
        pondok_id: newPondok.id,
      });
      
      toast.success(`Pondok ${formData.nama} berhasil ditambahkan`);
      queryClient.invalidateQueries({ queryKey: ['pondoks'] });
      navigate("/admin-pusat/pondok");
      
    } catch (err: any) {
      toast.error(`Gagal menambahkan pondok: ${err.message || "Terjadi kesalahan"}`);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pondok">Data Pondok</TabsTrigger>
            <TabsTrigger value="admin">Admin Pondok</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pondok">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pondok</CardTitle>
                <CardDescription>
                  Tambahkan data dasar pondok baru
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nama" className={errors.nama ? "text-destructive" : ""}>
                      Nama Pondok <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nama"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      placeholder="Nama pondok"
                      className={errors.nama ? "border-destructive" : ""}
                      required
                    />
                    {errors.nama && <p className="text-sm text-destructive">{errors.nama}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jenis" className={errors.jenis ? "text-destructive" : ""}>
                      Jenis Pondok <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.jenis}
                      onValueChange={(value) => handleSelectChange('jenis', value)}
                    >
                      <SelectTrigger id="jenis" className={errors.jenis ? "border-destructive" : ""}>
                        <SelectValue placeholder="Pilih jenis pondok" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PondokJenis.PPM}>{getPondokJenisLabel(PondokJenis.PPM)}</SelectItem>
                        <SelectItem value={PondokJenis.PPPM}>{getPondokJenisLabel(PondokJenis.PPPM)}</SelectItem>
                        <SelectItem value={PondokJenis.BOARDING}>{getPondokJenisLabel(PondokJenis.BOARDING)}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.jenis && <p className="text-sm text-destructive">{errors.jenis}</p>}
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
                  <Label htmlFor="alamat" className={errors.alamat ? "text-destructive" : ""}>
                    Alamat <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="alamat"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    placeholder="Alamat pondok"
                    className={errors.alamat ? "border-destructive" : ""}
                    required
                  />
                  {errors.alamat && <p className="text-sm text-destructive">{errors.alamat}</p>}
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
                    <Label htmlFor="provinsi_id" className={errors.provinsi_id ? "text-destructive" : ""}>
                      Provinsi <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="provinsi_id"
                      name="provinsi_id"
                      value={formData.provinsi_id}
                      onChange={handleInputChange}
                      placeholder="ID Provinsi"
                      className={errors.provinsi_id ? "border-destructive" : ""}
                      required
                    />
                    {errors.provinsi_id && <p className="text-sm text-destructive">{errors.provinsi_id}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kota_id" className={errors.kota_id ? "text-destructive" : ""}>
                      Kota <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="kota_id"
                      name="kota_id"
                      value={formData.kota_id}
                      onChange={handleInputChange}
                      placeholder="ID Kota"
                      className={errors.kota_id ? "border-destructive" : ""}
                      required
                    />
                    {errors.kota_id && <p className="text-sm text-destructive">{errors.kota_id}</p>}
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

                <Separator className="my-6" />
                
                <div className="space-y-4">
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
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate("/admin-pusat/pondok")}
                >
                  Batal
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setActiveTab("admin")}
                >
                  Lanjut ke Admin Pondok
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Pondok</CardTitle>
                <CardDescription>
                  Buat akun admin untuk mengelola pondok
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="admin_nama" className={errors.admin_nama ? "text-destructive" : ""}>
                      Nama Admin <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="admin_nama"
                      name="nama"
                      value={formData.admin.nama}
                      onChange={handleAdminChange}
                      placeholder="Nama lengkap admin"
                      className={errors.admin_nama ? "border-destructive" : ""}
                      required
                    />
                    {errors.admin_nama && <p className="text-sm text-destructive">{errors.admin_nama}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin_nomor_telepon">Nomor Telepon</Label>
                    <Input
                      id="admin_nomor_telepon"
                      name="nomor_telepon"
                      value={formData.admin.nomor_telepon}
                      onChange={handleAdminChange}
                      placeholder="Nomor telepon admin"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_email" className={errors.admin_email ? "text-destructive" : ""}>
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="admin_email"
                    name="email"
                    type="email"
                    value={formData.admin.email}
                    onChange={handleAdminChange}
                    placeholder="Email admin"
                    className={errors.admin_email ? "border-destructive" : ""}
                    required
                  />
                  {errors.admin_email && <p className="text-sm text-destructive">{errors.admin_email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="admin_password" className={errors.admin_password ? "text-destructive" : ""}>
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="admin_password"
                      name="password"
                      type="password"
                      value={formData.admin.password}
                      onChange={handleAdminChange}
                      placeholder="Masukkan password"
                      className={errors.admin_password ? "border-destructive" : ""}
                      required
                    />
                    {errors.admin_password && <p className="text-sm text-destructive">{errors.admin_password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin_confirm_password" className={errors.admin_confirm_password ? "text-destructive" : ""}>
                      Konfirmasi Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="admin_confirm_password"
                      name="confirm_password"
                      type="password"
                      value={formData.admin.confirm_password}
                      onChange={handleAdminChange}
                      placeholder="Konfirmasi password"
                      className={errors.admin_confirm_password ? "border-destructive" : ""}
                      required
                    />
                    {errors.admin_confirm_password && <p className="text-sm text-destructive">{errors.admin_confirm_password}</p>}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab("pondok")}
                >
                  Kembali
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </AdminPusatLayout>
  );
};

export default PondokCreatePage;
