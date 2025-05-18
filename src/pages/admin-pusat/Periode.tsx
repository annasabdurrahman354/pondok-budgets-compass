
import React, { useState } from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Periode as PeriodeType } from "@/types";
import { formatDate, formatPeriode } from "@/lib/utils";
import { Calendar, Plus } from "lucide-react";

// Mock data for demonstration
const mockPeriodes: PeriodeType[] = [
  {
    id: "202505",
    tahun: 2025,
    bulan: 5,
    awal_rab: "2025-04-01T00:00:00Z",
    akhir_rab: "2025-04-15T23:59:59Z",
    awal_lpj: "2025-05-01T00:00:00Z",
    akhir_lpj: "2025-05-15T23:59:59Z",
  },
  {
    id: "202504",
    tahun: 2025,
    bulan: 4,
    awal_rab: "2025-03-01T00:00:00Z",
    akhir_rab: "2025-03-15T23:59:59Z",
    awal_lpj: "2025-04-01T00:00:00Z",
    akhir_lpj: "2025-04-15T23:59:59Z",
  },
  {
    id: "202503",
    tahun: 2025,
    bulan: 3,
    awal_rab: "2025-02-01T00:00:00Z",
    akhir_rab: "2025-02-15T23:59:59Z",
    awal_lpj: "2025-03-01T00:00:00Z",
    akhir_lpj: "2025-03-15T23:59:59Z",
  },
];

const PeriodePage: React.FC = () => {
  const [periodes, setPeriodes] = useState<PeriodeType[]>(mockPeriodes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPeriode, setNewPeriode] = useState<Partial<PeriodeType>>({
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPeriode((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate the period ID (YYYYMM)
    const periodeId = `${newPeriode.tahun}${String(newPeriode.bulan).padStart(2, '0')}`;
    
    // Create a new period object
    const periode: PeriodeType = {
      id: periodeId,
      tahun: Number(newPeriode.tahun),
      bulan: Number(newPeriode.bulan),
      awal_rab: newPeriode.awal_rab as string,
      akhir_rab: newPeriode.akhir_rab as string,
      awal_lpj: newPeriode.awal_lpj as string,
      akhir_lpj: newPeriode.akhir_lpj as string,
    };
    
    // Add the new period to the state
    setPeriodes((prev) => [periode, ...prev]);
    
    // Close the dialog and reset form
    setIsDialogOpen(false);
    setNewPeriode({
      tahun: new Date().getFullYear(),
      bulan: new Date().getMonth() + 1,
    });
  };

  return (
    <AdminPusatLayout title="Manajemen Periode">
      <div className="mb-6 flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Periode
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Tambah Periode Baru</DialogTitle>
                <DialogDescription>
                  Buat periode baru untuk RAB dan LPJ. Pastikan tanggal yang
                  diinput sudah benar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tahun">Tahun</Label>
                    <Input
                      id="tahun"
                      name="tahun"
                      type="number"
                      value={newPeriode.tahun || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulan">Bulan</Label>
                    <Input
                      id="bulan"
                      name="bulan"
                      type="number"
                      min="1"
                      max="12"
                      value={newPeriode.bulan || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awal_rab">Tanggal Mulai RAB</Label>
                  <Input
                    id="awal_rab"
                    name="awal_rab"
                    type="datetime-local"
                    value={newPeriode.awal_rab || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="akhir_rab">Tanggal Berakhir RAB</Label>
                  <Input
                    id="akhir_rab"
                    name="akhir_rab"
                    type="datetime-local"
                    value={newPeriode.akhir_rab || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awal_lpj">Tanggal Mulai LPJ</Label>
                  <Input
                    id="awal_lpj"
                    name="awal_lpj"
                    type="datetime-local"
                    value={newPeriode.awal_lpj || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="akhir_lpj">Tanggal Berakhir LPJ</Label>
                  <Input
                    id="akhir_lpj"
                    name="akhir_lpj"
                    type="datetime-local"
                    value={newPeriode.akhir_lpj || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Simpan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Periode</CardTitle>
          <CardDescription>
            Periode menentukan jadwal pengisian RAB dan LPJ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periode</TableHead>
                  <TableHead>RAB Mulai</TableHead>
                  <TableHead>RAB Berakhir</TableHead>
                  <TableHead>LPJ Mulai</TableHead>
                  <TableHead>LPJ Berakhir</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodes.map((periode) => (
                  <TableRow key={periode.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatPeriode(periode.id)}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(periode.awal_rab)}</TableCell>
                    <TableCell>{formatDate(periode.akhir_rab)}</TableCell>
                    <TableCell>{formatDate(periode.awal_lpj)}</TableCell>
                    <TableCell>{formatDate(periode.akhir_lpj)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log("Edit periode", periode)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminPusatLayout>
  );
};

export default PeriodePage;
