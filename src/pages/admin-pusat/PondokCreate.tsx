
import React, { useState } from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { PondokJenis, PengurusJabatan } from "@/types";
import { getPondokJenisLabel } from "@/lib/utils";
import { Plus, Trash, ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

  const handlePengurusChange = (index: number, field: keyof PengurusFormData, value: string) => {
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

  return (
    <AdminPusatLayout title="Tambah Pondok Baru">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate("/admin-pusat/pondok")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Tambah Pondok Baru</CardTitle>
            <CardDescription>
              Isi informasi pondok dan pengurus di bawah ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Pondok</Label>
                  <Input
                    id="nama"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jenis">Jenis Pondok</Label>
                  <Select
                    value={formData.jenis}
                    onValueChange={(value) => handleSelectChange("jenis", value)}
                  >
                    <SelectTrigger id="jenis">
                      <SelectValue placeholder="Pilih jenis pondok" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PondokJenis.PPM}>PPM</SelectItem>
                      <SelectItem value={PondokJenis.PPPM}>PPPM</SelectItem>
                      <SelectItem value={PondokJenis.BOARDING}>Boarding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                  <Input
                    id="nomor_telepon"
                    name="nomor_telepon"
                    value={formData.nomor_telepon}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kode_pos">Kode Pos</Label>
                  <Input
                    id="kode_pos"
                    name="kode_pos"
                    value={formData.kode_pos}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Input
                  id="alamat"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provinsi_id">Provinsi</Label>
                  <Select
                    value={formData.provinsi_id}
                    onValueChange={(value) => handleSelectChange("provinsi_id", value)}
                  >
                    <SelectTrigger id="provinsi_id">
                      <SelectValue placeholder="Pilih provinsi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p1">DKI Jakarta</SelectItem>
                      <SelectItem value="p2">Jawa Barat</SelectItem>
                      <SelectItem value="p3">Jawa Tengah</SelectItem>
                      <SelectItem value="p4">Jawa Timur</SelectItem>
                      <SelectItem value="p5">DIY Yogyakarta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kota_id">Kota</Label>
                  <Select
                    value={formData.kota_id}
                    onValueChange={(value) => handleSelectChange("kota_id", value)}
                    disabled={!formData.provinsi_id}
                  >
                    <SelectTrigger id="kota_id">
                      <SelectValue placeholder="Pilih kota" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.provinsi_id === "p1" && (
                        <>
                          <SelectItem value="k1">Jakarta Pusat</SelectItem>
                          <SelectItem value="k2">Jakarta Barat</SelectItem>
                        </>
                      )}
                      {formData.provinsi_id === "p2" && (
                        <>
                          <SelectItem value="k3">Bandung</SelectItem>
                          <SelectItem value="k4">Bogor</SelectItem>
                        </>
                      )}
                      {formData.provinsi_id === "p3" && (
                        <>
                          <SelectItem value="k5">Semarang</SelectItem>
                          <SelectItem value="k6">Solo</SelectItem>
                        </>
                      )}
                      {formData.provinsi_id === "p4" && (
                        <>
                          <SelectItem value="k7">Surabaya</SelectItem>
                          <SelectItem value="k8">Malang</SelectItem>
                        </>
                      )}
                      {formData.provinsi_id === "p5" && (
                        <SelectItem value="k9">Yogyakarta</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daerah_sambung_id">Daerah Sambung</Label>
                  <Select
                    value={formData.daerah_sambung_id}
                    onValueChange={(value) => handleSelectChange("daerah_sambung_id", value)}
                  >
                    <SelectTrigger id="daerah_sambung_id">
                      <SelectValue placeholder="Pilih daerah sambung" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="d1">Daerah Sambung 1</SelectItem>
                      <SelectItem value="d2">Daerah Sambung 2</SelectItem>
                      <SelectItem value="d3">Daerah Sambung 3</SelectItem>
                      <SelectItem value="d4">Daerah Sambung 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Data Pengurus</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addPengurus}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Tambah Pengurus
                  </Button>
                </div>
                
                {formData.pengurus.map((pengurus, index) => (
                  <div key={index} className="border rounded-md p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Pengurus {index + 1}</h4>
                      {formData.pengurus.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePengurus(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Hapus</span>
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Nama</Label>
                        <Input
                          value={pengurus.nama}
                          onChange={(e) => handlePengurusChange(index, "nama", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Jabatan</Label>
                        <Select
                          value={pengurus.jabatan}
                          onValueChange={(value) => handlePengurusChange(index, "jabatan", value as PengurusJabatan)}
                        >
                          <SelectTrigger>
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
                        <Label>Nomor Telepon</Label>
                        <Input
                          value={pengurus.nomor_telepon}
                          onChange={(e) => handlePengurusChange(index, "nomor_telepon", e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
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
