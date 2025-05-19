
import React, { useState, useEffect } from "react";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
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
import { useAuth } from "@/contexts/AuthContext";
import { DocumentStatus, LPJ, RAB } from "@/types";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCurrentPeriode, fetchRABsByPondok, createLPJ, uploadLPJFile } from "@/services/api";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const CreateLPJPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pondokId = user?.pondok_id || "";
  
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<LPJ>>({
    pondok_id: pondokId,
    saldo_awal: 0,
    rencana_pemasukan: 0,
    rencana_pengeluaran: 0,
    realisasi_pemasukan: 0,
    realisasi_pengeluaran: 0,
    sisa_saldo: 0,
    status: DocumentStatus.DIAJUKAN,
  });

  // Fetch current period
  const { data: currentPeriode, isLoading: isLoadingPeriode } = useQuery({
    queryKey: ['currentPeriode'],
    queryFn: fetchCurrentPeriode
  });

  // Fetch RABs for this pondok to get data for the current period
  const { data: rabs = [], isLoading: isLoadingRABs } = useQuery({
    queryKey: ['rabs', pondokId],
    queryFn: () => pondokId ? fetchRABsByPondok(pondokId) : Promise.resolve([]),
    enabled: !!pondokId,
  });

  // Check if LPJ can be submitted (within submission window)
  const canSubmitLPJ = currentPeriode && new Date() >= new Date(currentPeriode.awal_lpj) && 
    new Date() <= new Date(currentPeriode.akhir_lpj);

  // Use the current period's RAB data for prefilling LPJ
  useEffect(() => {
    if (currentPeriode && rabs.length > 0) {
      const currentRAB = rabs.find(rab => rab.periode_id === currentPeriode.id);
      
      if (currentRAB) {
        setFormData(prev => ({
          ...prev,
          periode_id: currentPeriode.id,
          saldo_awal: currentRAB.saldo_awal || 0,
          rencana_pemasukan: currentRAB.rencana_pemasukan || 0,
          rencana_pengeluaran: currentRAB.rencana_pengeluaran || 0
        }));
      }
    }
  }, [currentPeriode, rabs]);

  // Calculate sisa_saldo when relevant fields change
  useEffect(() => {
    const saldoAwal = formData.saldo_awal || 0;
    const realisasiPemasukan = formData.realisasi_pemasukan || 0;
    const realisasiPengeluaran = formData.realisasi_pengeluaran || 0;
    
    const sisaSaldo = saldoAwal + realisasiPemasukan - realisasiPengeluaran;
    
    setFormData(prev => ({
      ...prev,
      sisa_saldo: sisaSaldo
    }));
  }, [formData.saldo_awal, formData.realisasi_pemasukan, formData.realisasi_pengeluaran]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    // Parse numeric values
    if ([
      'saldo_awal', 
      'rencana_pemasukan', 
      'rencana_pengeluaran', 
      'realisasi_pemasukan', 
      'realisasi_pengeluaran'
    ].includes(name)) {
      parsedValue = parseFloat(value) || 0;
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Create LPJ mutation
  const createLPJMutation = useMutation({
    mutationFn: async (data: Partial<LPJ>) => {
      if (!data.periode_id || !data.pondok_id) {
        throw new Error("Missing required fields");
      }

      let dokumenPath = null;
      
      if (file) {
        dokumenPath = await uploadLPJFile(file, data.pondok_id, data.periode_id);
      }
      
      const lpjData = {
        ...data,
        dokumen_path: dokumenPath,
        submitted_at: new Date().toISOString(),
      };
      
      return createLPJ(lpjData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lpjs'] });
      toast.success("LPJ berhasil diajukan");
      navigate("/admin-pondok/lpj");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Harap unggah dokumen bukti LPJ");
      return;
    }
    
    createLPJMutation.mutate(formData);
  };

  if (isLoadingPeriode || isLoadingRABs) {
    return (
      <AdminPondokLayout title="Buat LPJ">
        <div className="flex justify-center items-center h-64">
          <p>Memuat data...</p>
        </div>
      </AdminPondokLayout>
    );
  }

  if (!currentPeriode) {
    return (
      <AdminPondokLayout title="Buat LPJ">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg">Tidak ada periode aktif saat ini</p>
          <p className="text-muted-foreground">Silakan hubungi admin pusat</p>
        </div>
      </AdminPondokLayout>
    );
  }

  if (!canSubmitLPJ) {
    return (
      <AdminPondokLayout title="Buat LPJ">
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => navigate("/admin-pondok/lpj")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Periode Pengajuan LPJ Belum Dibuka</CardTitle>
            <CardDescription>
              Anda hanya dapat mengajukan LPJ pada periode yang telah ditentukan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Periode Pengajuan LPJ:</h3>
                <p>{new Date(currentPeriode.awal_lpj).toLocaleDateString('id-ID')} - {new Date(currentPeriode.akhir_lpj).toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AdminPondokLayout>
    );
  }

  return (
    <AdminPondokLayout title="Buat LPJ">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate("/admin-pondok/lpj")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Pengajuan LPJ</CardTitle>
            <CardDescription>
              Periode {currentPeriode.tahun}-{currentPeriode.bulan.toString().padStart(2, '0')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium mb-3">Data RAB</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="saldo_awal">Saldo Awal</Label>
                    <Input
                      id="saldo_awal"
                      name="saldo_awal"
                      type="number"
                      value={formData.saldo_awal || 0}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rencana_pemasukan">Rencana Pemasukan</Label>
                    <Input
                      id="rencana_pemasukan"
                      name="rencana_pemasukan"
                      type="number"
                      value={formData.rencana_pemasukan || 0}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rencana_pengeluaran">Rencana Pengeluaran</Label>
                    <Input
                      id="rencana_pengeluaran"
                      name="rencana_pengeluaran"
                      type="number"
                      value={formData.rencana_pengeluaran || 0}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-3">Data Realisasi</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="realisasi_pemasukan">Realisasi Pemasukan</Label>
                    <Input
                      id="realisasi_pemasukan"
                      name="realisasi_pemasukan"
                      type="number"
                      value={formData.realisasi_pemasukan || 0}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="realisasi_pengeluaran">Realisasi Pengeluaran</Label>
                    <Input
                      id="realisasi_pengeluaran"
                      name="realisasi_pengeluaran"
                      type="number"
                      value={formData.realisasi_pengeluaran || 0}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sisa_saldo">Sisa Saldo</Label>
                    <Input
                      id="sisa_saldo"
                      name="sisa_saldo"
                      type="number"
                      value={formData.sisa_saldo || 0}
                      readOnly
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Dihitung otomatis: Saldo Awal + Realisasi Pemasukan - Realisasi Pengeluaran
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dokumen">Dokumen Bukti LPJ</Label>
              <div className="grid w-full gap-2">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Klik untuk mengunggah</span> atau seret dan lepas
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF atau Excel (Maks. 10MB)
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.xls,.xlsx,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {file && (
                  <div className="flex items-center p-2 border rounded-md bg-gray-50">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={() => setFile(null)}
                    >
                      Hapus
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <p className="text-sm">
                Deviasi: <strong>{formatCurrency((formData.realisasi_pengeluaran || 0) - (formData.rencana_pengeluaran || 0))}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                (Realisasi Pengeluaran - Rencana Pengeluaran)
              </p>
            </div>
            <Button type="submit" disabled={createLPJMutation.isPending}>
              {createLPJMutation.isPending ? "Menyimpan..." : "Ajukan LPJ"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AdminPondokLayout>
  );
};

export default CreateLPJPage;
