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
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPondok } from "@/services/api";
import { toast } from "sonner";
import { getPondokJenisLabel } from "@/lib/utils";
import { PengurusForm } from "@/components/pondok/PengurusForm";
import { supabase } from "@/integrations/supabase/client";

interface PengurusFormData {
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
  pengurus: PengurusFormData[];
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

const defaultPengurusForm = (): PengurusFormData => ({
  nama: "",
  jabatan: PengurusJabatan.KETUA,
  nomor_telepon: ""
});

const PondokCreatePage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PondokFormData>(defaultPondokForm());

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
      });
      
      if (!pondokData) throw new Error("Gagal membuat data pondok");

      // 2. Insert pengurus data
      if (data.pengurus.length > 0) {
        const pengurusPromises = data.pengurus.map(p => {
          const { data: pengurusData, error: pengurusError } = supabase
            .from('pengurus')
            .insert({
              pondok_id: pondokData.id,
              nama: p.nama,
              jabatan: p.jabatan,
              nomor_telepon: p.nomor_telepon
            });
          
          if (pengurusError) throw new Error(pengurusError.message);
          return pengurusData;
        });

        await Promise.all(pengurusPromises);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nama.trim()) {
      toast.error("Nama pondok tidak boleh kosong");
      return;
    }
    
    for (const pengurus of formData.pengurus) {
      if (!pengurus.nama.trim()) {
        toast.error("Nama pengurus tidak boleh kosong");
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
            <CardTitle>Informasi Pondok</CardTitle>
            <CardDescription>
              Tambahkan pondok baru ke dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className="border-t pt-6">
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
          <CardFooter className="justify-end">
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
