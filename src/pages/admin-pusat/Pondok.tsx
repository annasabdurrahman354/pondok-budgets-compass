
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
import { Pondok, PondokJenis, UserProfile, UserRole } from "@/types";
import { Check, Edit, Plus, Search, Trash, Users } from "lucide-react";
import { getPondokJenisLabel } from "@/lib/utils";

// Mock data for demonstration
const mockPondoks: Pondok[] = [
  {
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
  },
  {
    id: "pd2",
    nama: "Pondok Pesantren B",
    nomor_telepon: "089876543210",
    jenis: PondokJenis.PPPM,
    alamat: "Jl. Pondok B No. 2",
    kode_pos: "54321",
    kota_id: "k3",
    provinsi_id: "p2",
    daerah_sambung_id: "d2",
    updated_at: "2025-03-10T00:00:00Z",
    accepted_at: "2025-03-12T00:00:00Z",
  },
  {
    id: "pd3",
    nama: "Pondok Pesantren C",
    nomor_telepon: "087654321098",
    jenis: PondokJenis.BOARDING,
    alamat: "Jl. Pondok C No. 3",
    kode_pos: "67890",
    kota_id: "k5",
    provinsi_id: "p3",
    daerah_sambung_id: "d3",
    updated_at: "2025-03-20T00:00:00Z",
    accepted_at: null,
  },
];

const mockUsers: UserProfile[] = [
  {
    id: "apd1",
    email: "adminpondokA@example.com",
    nomor_telepon: "081234567890",
    nama: "Admin Pondok A",
    role: UserRole.ADMIN_PONDOK,
    pondok_id: "pd1",
  },
  {
    id: "apd2",
    email: "adminpondokB@example.com",
    nomor_telepon: "089876543210",
    nama: "Admin Pondok B",
    role: UserRole.ADMIN_PONDOK,
    pondok_id: "pd2",
  },
];

const PondokPage: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [jenisFilter, setJenisFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Filter pondoks based on search text, jenis, and verification status
  const filteredPondoks = mockPondoks.filter(
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
          <Button onClick={() => console.log("Create new pondok")}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Pondok
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pondok</CardTitle>
          <CardDescription>
            Kelola dan verifikasi pondok dalam yayasan
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  const adminPondok = mockUsers.find(
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
                              onClick={() => console.log("Verify pondok", pondok)}
                            >
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Verifikasi</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => console.log("Delete pondok", pondok)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Hapus</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminPusatLayout>
  );
};

export default PondokPage;
