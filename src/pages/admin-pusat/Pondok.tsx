
import React, { useState } from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllPondok } from "@/services/api";
import { PondokJenis } from "@/types";
import { getPondokJenisLabel } from "@/lib/utils";
import { ResponsiveTable, ResponsiveTableBody, ResponsiveTableCell, ResponsiveTableHead, ResponsiveTableHeader, ResponsiveTableRow } from "@/components/ui/responsive-table";

const PondokPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: pondoks = [], isLoading } = useQuery({
    queryKey: ['pondoks'],
    queryFn: fetchAllPondok,
  });

  const filteredPondoks = pondoks.filter(pondok =>
    pondok.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pondok.alamat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminPusatLayout title="Manajemen Pondok">
        <div className="flex justify-center p-4">
          <p>Memuat data...</p>
        </div>
      </AdminPusatLayout>
    );
  }

  return (
    <AdminPusatLayout title="Manajemen Pondok">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari pondok..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => navigate("/admin-pusat/pondok/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pondok
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Pondok</CardTitle>
            <CardDescription>
              Kelola semua pondok yang terdaftar dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveTable>
              <ResponsiveTableHeader>
                <ResponsiveTableRow>
                  <ResponsiveTableHead>Nama Pondok</ResponsiveTableHead>
                  <ResponsiveTableHead>Jenis</ResponsiveTableHead>
                  <ResponsiveTableHead>Alamat</ResponsiveTableHead>
                  <ResponsiveTableHead>Status</ResponsiveTableHead>
                  <ResponsiveTableHead>Aksi</ResponsiveTableHead>
                </ResponsiveTableRow>
              </ResponsiveTableHeader>
              <ResponsiveTableBody>
                {filteredPondoks.map((pondok) => (
                  <ResponsiveTableRow key={pondok.id}>
                    <ResponsiveTableCell label="Nama Pondok">
                      <div className="font-medium">{pondok.nama}</div>
                      {pondok.nomor_telepon && (
                        <div className="text-sm text-muted-foreground">
                          {pondok.nomor_telepon}
                        </div>
                      )}
                    </ResponsiveTableCell>
                    <ResponsiveTableCell label="Jenis">
                      <Badge variant="outline">
                        {getPondokJenisLabel(pondok.jenis as PondokJenis)}
                      </Badge>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell label="Alamat">
                      <div className="max-w-xs truncate">
                        {pondok.alamat || "-"}
                      </div>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell label="Status">
                      <Badge 
                        variant={pondok.accepted_at ? "default" : "secondary"}
                      >
                        {pondok.accepted_at ? "Terverifikasi" : "Belum Verifikasi"}
                      </Badge>
                    </ResponsiveTableCell>
                    <ResponsiveTableCell label="Aksi">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin-pusat/pondok/${pondok.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="ml-1 hidden sm:inline">Edit</span>
                        </Button>
                      </div>
                    </ResponsiveTableCell>
                  </ResponsiveTableRow>
                ))}
              </ResponsiveTableBody>
            </ResponsiveTable>

            {filteredPondoks.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                {searchTerm ? "Tidak ada pondok yang sesuai dengan pencarian" : "Belum ada pondok yang terdaftar"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPusatLayout>
  );
};

export default PondokPage;
