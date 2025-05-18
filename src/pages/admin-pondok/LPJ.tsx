
import React, { useState } from "react";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeClass, formatCurrency, formatPeriode } from "@/lib/utils";
import { DocumentStatus, LPJ, mockPeriode, Pondok, PondokJenis } from "@/types";
import { AlertTriangle, FileText, Plus, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { isWithinDateRange } from "@/lib/utils";

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

const mockLPJs: LPJ[] = [
  {
    id: "1",
    pondok_id: "pd1",
    periode_id: mockPeriode.id,
    status: DocumentStatus.DIAJUKAN,
    saldo_awal: 5000000,
    rencana_pemasukan: 15000000,
    rencana_pengeluaran: 12000000,
    realisasi_pemasukan: 14500000,
    realisasi_pengeluaran: 11800000,
    sisa_saldo: 7700000,
    dokumen_path: "bukti_lpj/lpj-202505-pondok-a-abc1.pdf",
    submitted_at: "2025-05-10T10:30:00Z",
    accepted_at: null,
    pesan_revisi: null,
  },
  {
    id: "2",
    pondok_id: "pd1",
    periode_id: "202504",
    status: DocumentStatus.DITERIMA,
    saldo_awal: 3000000,
    rencana_pemasukan: 10000000,
    rencana_pengeluaran: 9000000,
    realisasi_pemasukan: 9800000,
    realisasi_pengeluaran: 8500000,
    sisa_saldo: 4300000,
    dokumen_path: "bukti_lpj/lpj-202504-pondok-a-def2.pdf",
    submitted_at: "2025-04-10T10:30:00Z",
    accepted_at: "2025-04-12T14:20:00Z",
    pesan_revisi: null,
  },
  {
    id: "3",
    pondok_id: "pd1",
    periode_id: "202503",
    status: DocumentStatus.REVISI,
    saldo_awal: 2000000,
    rencana_pemasukan: 8000000,
    rencana_pengeluaran: 7000000,
    realisasi_pemasukan: 7800000,
    realisasi_pengeluaran: 7200000,
    sisa_saldo: 2600000,
    dokumen_path: "bukti_lpj/lpj-202503-pondok-a-ghi3.pdf",
    submitted_at: "2025-03-10T10:30:00Z",
    accepted_at: null,
    pesan_revisi: "Mohon lampirkan bukti transaksi pendukung",
  },
];

const LPJPage: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const isLPJOpen = isWithinDateRange(mockPeriode.awal_lpj, mockPeriode.akhir_lpj);
  const isPondokVerified = !!mockPondok.accepted_at;
  const canCreateLPJ = isPondokVerified && isLPJOpen;
  
  // Check if LPJ for current period already exists
  const currentPeriodLPJ = mockLPJs.find(lpj => lpj.periode_id === mockPeriode.id);
  const lpjSubmitted = !!currentPeriodLPJ;

  return (
    <AdminPondokLayout title="Laporan Pertanggungjawaban (LPJ)">
      {!isPondokVerified && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Menunggu Verifikasi</AlertTitle>
          <AlertDescription>
            Data pondok Anda sedang menunggu verifikasi dari admin pusat. Pembuatan LPJ tidak dapat dilakukan hingga data Anda diverifikasi.
          </AlertDescription>
        </Alert>
      )}

      {isPondokVerified && !isLPJOpen && (
        <Alert className="mb-6 border-amber-500">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Periode LPJ Belum Dibuka</AlertTitle>
          <AlertDescription>
            Saat ini bukan periode pengisian LPJ. Mohon menunggu hingga periode pengisian LPJ dibuka.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Daftar LPJ</h2>
          <p className="text-sm text-muted-foreground">
            Kelola laporan pertanggungjawaban pondok
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!canCreateLPJ || lpjSubmitted}>
              <Plus className="mr-2 h-4 w-4" />
              Buat LPJ Baru
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat LPJ Baru</DialogTitle>
              <DialogDescription>
                Isi form berikut untuk membuat LPJ baru periode{" "}
                {formatPeriode(mockPeriode.id)}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>Form pembuatan LPJ akan ditampilkan di sini</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {mockLPJs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Belum ada data LPJ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Realisasi Pemasukan</TableHead>
                    <TableHead>Realisasi Pengeluaran</TableHead>
                    <TableHead>Sisa Saldo</TableHead>
                    <TableHead>Tanggal Pengajuan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLPJs.map((lpj) => (
                    <TableRow key={lpj.id || `${lpj.pondok_id}-${lpj.periode_id}`}>
                      <TableCell className="font-medium">
                        {formatPeriode(lpj.periode_id)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(lpj.status)}>
                          {lpj.status === DocumentStatus.DIAJUKAN
                            ? "Diajukan"
                            : lpj.status === DocumentStatus.DITERIMA
                            ? "Diterima"
                            : "Revisi"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(lpj.realisasi_pemasukan)}</TableCell>
                      <TableCell>{formatCurrency(lpj.realisasi_pengeluaran)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(lpj.sisa_saldo)}
                      </TableCell>
                      <TableCell>
                        {lpj.submitted_at
                          ? new Date(lpj.submitted_at).toLocaleDateString("id-ID")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => console.log("View LPJ", lpj)}
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Lihat</span>
                          </Button>
                          
                          {lpj.status !== DocumentStatus.DITERIMA && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              onClick={() => console.log("Delete LPJ", lpj)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Hapus</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {currentPeriodLPJ?.status === DocumentStatus.REVISI && (
        <Alert className="mt-6 border-amber-500">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle>LPJ Memerlukan Revisi</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{currentPeriodLPJ.pesan_revisi}</p>
            <Button size="sm" variant="outline" className="mt-2">
              Edit LPJ
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </AdminPondokLayout>
  );
};

export default LPJPage;
