
import React, { useState } from "react";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import {
  DaerahSambung,
  Kota,
  mockDaerahSambung,
  mockKota,
  mockProvinsi,
  Pengurus,
  PengurusJabatan,
  Pondok,
  PondokJenis,
  Provinsi,
  UserProfile,
} from "@/types";
import { getPengurusJabatanLabel, getPondokJenisLabel } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { AlertCircle, Check, Plus, Save, Trash, User } from "lucide-react";

// Mock data for demonstration
const mockPondok: Pondok = {
  id: "pd1",
  nama: "Pondok Pesantren A",
  nomor_telepon: "081234567890",
  jenis: PondokJenis.PPM,
  alamat: "Jl. Pondok A No. 1",
  kode_pos: "12345",
  kota_id: "k1",
  provinsi_id: "p1",
  daerah_sambung_id: "d1",
  updated_at: "2025-03-15T00:00:00Z",
  accepted_at: "2025-03-16T00:00:00Z",
};

const mockPengurus: Pengurus[] = [
  {
    id: "pg1",
    pondok_id: "pd1",
    nama: "Ahmad",
    nomor_telepon: "081234567111",
    jabatan: PengurusJabatan.KETUA,
  },
  {
    id: "pg2",
    pondok_id: "pd1",
    nama: "Budi",
    nomor_telepon: "081234567222",
    jabatan: PengurusJabatan.SEKRETARIS,
  },
  {
    id: "pg3",
    pondok_id: "pd1",
    nama: "Cindy",
    nomor_telepon: "081234567333",
    jabatan: PengurusJabatan.BENDAHARA,
  },
];

const mockUser: UserProfile = {
  id: "apd1",
  email: "adminpondok@example.com",
  nomor_telepon: "089876543210",
  nama: "Admin Pondok A",
  role: UserRole.ADMIN_PONDOK,
  pondok_id: "pd1",
};

enum UserRole {
  ADMIN_PUSAT = "admin_pusat",
  ADMIN_PONDOK = "admin_pondok",
}

const AkunPage: React.FC = () => {
  const { user } = useAuth();
  const [pondokData, setPondokData] = useState<Pondok>(mockPondok);
  const [pengurusData, setPengurusData] = useState<Pengurus[]>(mockPengurus);
  const [userData, setUserData] = useState<UserProfile>(mockUser);
  const [filteredKota, setFilteredKota] = useState<Kota[]>(
    mockKota.filter((kota) => kota.provinsi_id === pondokData.provinsi_id)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler for user profile form changes
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for pondok form changes
  const handlePondokChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPondokData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for province selection change
  const handleProvinsiChange = (provinsiId: string) => {
    setPondokData((prev) => ({ ...prev, provinsi_id: provinsiId, kota_id: "" }));
    setFilteredKota(mockKota.filter((kota) => kota.provinsi_id === provinsiId));
  };

  // Handler for pengurus form changes
  const handlePengurusChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedPengurus = [...pengurusData];
    updatedPengurus[index] = { ...updatedPengurus[index], [name]: value };
    setPengurusData(updatedPengurus);
  };

  // Handler to add new pengurus
  const addPengurus = () => {
    setPengurusData([
      ...pengurusData,
      {
        pondok_id: pondokData.id,
        nama: "",
        nomor_telepon: "",
        jabatan: PengurusJabatan.GURU,
      },
    ]);
  };

  // Handler to remove pengurus
  const removePengurus = (index: number) => {
    const updatedPengurus = [...pengurusData];
    updatedPengurus.splice(index, 1);
    setPengurusData(updatedPengurus);
  };

  // Handler to save all changes
  const handleSaveChanges = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, you would make API calls to update the data
      toast.success("Data berhasil disimpan");
      setIsSubmitting(false);
    }, 1000);
  };

  const isPondokVerified = !!pondokData.accepted_at;

  return (
    <AdminPondokLayout title="Akun & Profil">
      {!isPondokVerified && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Menunggu Verifikasi</AlertTitle>
          <AlertDescription>
            Data pondok Anda sedang menunggu verifikasi dari admin pusat.
            Perubahan data akan memerlukan verifikasi ulang.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profil Pengguna</CardTitle>
            <CardDescription>
              Informasi akun admin pondok
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  name="nama"
                  value={userData.nama}
                  onChange={handleUserChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleUserChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                <Input
                  id="nomor_telepon"
                  name="nomor_telepon"
                  value={userData.nomor_telepon}
                  onChange={handleUserChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pondok Section */}
        <Card>
          <CardHeader>
            <CardTitle>Data Pondok</CardTitle>
            <CardDescription>
              Informasi detail pondok pesantren
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama_pondok">Nama Pondok</Label>
                <Input
                  id="nama_pondok"
                  name="nama"
                  value={pondokData.nama}
                  onChange={handlePondokChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="jenis">Jenis Pondok</Label>
                <Select
                  value={pondokData.jenis}
                  onValueChange={(value) =>
                    setPondokData((prev) => ({ ...prev, jenis: value as PondokJenis }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis pondok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PondokJenis.PPM}>
                      {getPondokJenisLabel(PondokJenis.PPM)}
                    </SelectItem>
                    <SelectItem value={PondokJenis.PPPM}>
                      {getPondokJenisLabel(PondokJenis.PPPM)}
                    </SelectItem>
                    <SelectItem value={PondokJenis.BOARDING}>
                      {getPondokJenisLabel(PondokJenis.BOARDING)}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nomor_telepon_pondok">Nomor Telepon Pondok</Label>
                <Input
                  id="nomor_telepon_pondok"
                  name="nomor_telepon"
                  value={pondokData.nomor_telepon}
                  onChange={handlePondokChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Input
                  id="alamat"
                  name="alamat"
                  value={pondokData.alamat}
                  onChange={handlePondokChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provinsi">Provinsi</Label>
                  <Select
                    value={pondokData.provinsi_id}
                    onValueChange={handleProvinsiChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih provinsi" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProvinsi.map((provinsi: Provinsi) => (
                        <SelectItem key={provinsi.id} value={provinsi.id}>
                          {provinsi.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kota">Kota/Kabupaten</Label>
                  <Select
                    value={pondokData.kota_id}
                    onValueChange={(value) =>
                      setPondokData((prev) => ({ ...prev, kota_id: value }))
                    }
                    disabled={!pondokData.provinsi_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kota/kabupaten" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredKota.map((kota: Kota) => (
                        <SelectItem key={kota.id} value={kota.id}>
                          {kota.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kode_pos">Kode Pos</Label>
                  <Input
                    id="kode_pos"
                    name="kode_pos"
                    value={pondokData.kode_pos}
                    onChange={handlePondokChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="daerah_sambung">Daerah Sambung</Label>
                  <Select
                    value={pondokData.daerah_sambung_id}
                    onValueChange={(value) =>
                      setPondokData((prev) => ({
                        ...prev,
                        daerah_sambung_id: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih daerah sambung" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDaerahSambung.map((daerah: DaerahSambung) => (
                        <SelectItem key={daerah.id} value={daerah.id}>
                          {daerah.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pengurus Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Pengurus Pondok</CardTitle>
                <CardDescription>
                  Daftar pengurus pondok pesantren
                </CardDescription>
              </div>
              <Button size="sm" onClick={addPengurus}>
                <Plus className="h-4 w-4 mr-1" /> Tambah
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {pengurusData.map((pengurus, index) => (
                <div key={pengurus.id || index} className="space-y-4">
                  {index > 0 && <Separator className="my-6" />}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center">
                      <User className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>
                        {getPengurusJabatanLabel(pengurus.jabatan)}
                      </span>
                    </h3>
                    {pengurus.jabatan !== PengurusJabatan.KETUA && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => removePengurus(index)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Hapus</span>
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`pengurus-nama-${index}`}>Nama</Label>
                      <Input
                        id={`pengurus-nama-${index}`}
                        name="nama"
                        value={pengurus.nama}
                        onChange={(e) => handlePengurusChange(index, e)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`pengurus-telepon-${index}`}>
                        Nomor Telepon
                      </Label>
                      <Input
                        id={`pengurus-telepon-${index}`}
                        name="nomor_telepon"
                        value={pengurus.nomor_telepon}
                        onChange={(e) => handlePengurusChange(index, e)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`pengurus-jabatan-${index}`}>
                        Jabatan
                      </Label>
                      <Select
                        value={pengurus.jabatan}
                        onValueChange={(value) => {
                          const updatedPengurus = [...pengurusData];
                          updatedPengurus[index].jabatan = value as PengurusJabatan;
                          setPengurusData(updatedPengurus);
                        }}
                        disabled={pengurus.jabatan === PengurusJabatan.KETUA}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jabatan" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(PengurusJabatan).map((jabatan) => (
                            <SelectItem
                              key={jabatan}
                              value={jabatan}
                              disabled={
                                jabatan === PengurusJabatan.KETUA &&
                                pengurusData.some(
                                  (p, i) =>
                                    p.jabatan === PengurusJabatan.KETUA && i !== index
                                )
                              }
                            >
                              {getPengurusJabatanLabel(jabatan)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}

              {pengurusData.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  Belum ada data pengurus. Klik tombol "Tambah" untuk menambahkan.
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              {isPondokVerified
                ? "Perubahan data akan memerlukan verifikasi ulang"
                : "Mohon lengkapi semua data untuk proses verifikasi"}
            </p>
            <Button onClick={handleSaveChanges} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminPondokLayout>
  );
};

export default AkunPage;
