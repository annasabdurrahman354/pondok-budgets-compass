
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
import { fetchCurrentPeriode, fetchLPJsByPondok, createRAB, uploadRABFile } from "@/services/api";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const CreateRABPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pondokId = user?.pondok_id || "";
  
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<RAB>>({
    pondok_id: pondokId,
    saldo_awal: 0,
    rencana_pemasukan: 0,
    rencana_pengeluaran: 0,
    status: DocumentStatus.DIAJUKAN,
  });

  // Fetch current period
  const { data: currentPeriode, isLoading: isLoadingPeriode } = useQuery({
    queryKey: ['currentPeriode'],
    queryFn: fetchCurrentPeriode
  });

  // Fetch LPJs for this pondok to get the most recent sisa_saldo
  const { data: lpjs = [], isLoading: isLoadingLPJs } = useQuery({
    queryKey: ['lpjs', pondokId],
    queryFn: () => pondokId ? fetchLPJsByPondok(pondokId) : Promise.resolve([]),
    enabled: !!pondokId,
  });

  // Check if RAB can be submitted (within submission window)
  const canSubmitRAB = currentPeriode && new Date() >= new Date(currentPeriode.awal_rab) && 
    new Date() <= new Date(currentPeriode.akhir_rab);

  // Use the most recent LPJ's sisa_saldo as the initial saldo_awal
  useEffect(() => {
    if (lpjs.length > 0) {
      // Sort by periode_id desc
      const sortedLPJs = [...lpjs].sort((a, b) => 
        b.periode_id && a.periode_id ? 
          b.periode_id.localeCompare(a.periode_id) : 0);
      
      // Use the most recent LPJ that has been accepted
      const mostRecentLPJ = sortedLPJs.find(lpj => lpj.status === DocumentStatus.DITERIMA);
      
      if (mostRecentLPJ && mostRecentLPJ.sisa_saldo) {
        setFormData(prev => ({
          ...prev,
          saldo_awal: mostRecentLPJ.sisa_saldo
        }));
      }
    }
  }, [lpjs]);

  // Update periode_id when currentPeriode changes
  useEffect(() => {
    if (currentPeriode) {
      setFormData(prev => ({
        ...prev,
        periode_id: currentPeriode.id
      }));
    }
  }, [currentPeriode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;
    
    // Parse numeric values
    if (name === 'saldo_awal' || name === 'rencana_pemasukan' || name === 'rencana_pengeluaran') {
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

  // Create RAB mutation
  const createRABMutation = useMutation({
    mutationFn: async (data: Partial<RAB>) => {
      if (!data.periode_id || !data.pondok_id) {
        throw new Error("Missing required fields");
      }

      let dokumenPath = null;
      
      if (file) {
        dokumenPath = await uploadRABFile(file, data.pondok_id, data.periode_id);
      }
      
      const rabData = {
        ...data,
        dokumen_path: dokumenPath,
        submitted_at: new Date().toISOString(),
      };
      
      return createRAB(rabData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rabs'] });
      toast.success("RAB berhasil diajukan");
      navigate("/admin-pondok/rab");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error("Harap unggah dokumen bukti RAB");
      return;
    }
    
    createRABMutation.mutate(formData);
  };

  if (isLoadingPeriode) {
    return (
      <AdminPondokLayout title="Buat RAB">
        <div className="flex justify-center items-center h-64">
          <p>Memuat data periode...</p>
        </div>
      </AdminPondokLayout>
    );
  }

  if (!currentPeriode) {
    return (
      <AdminPondokLayout title="Buat RAB">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg">Tidak ada periode aktif saat ini</p>
          <p className="text-muted-foreground">Silakan hubungi admin pusat</p>
        </div>
      </AdminPondokLayout>
    );
  }

  if (!canSubmitRAB) {
    return (
      <AdminPondokLayout title="Buat RAB">
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => navigate("/admin-pondok/rab")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Periode Pengajuan RAB Belum Dibuka</CardTitle>
            <CardDescription>
              Anda hanya dapat mengajukan RAB pada periode yang telah ditentukan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Periode Pengajuan RAB:</h3>
                <p>{new Date(currentPeriode.awal_rab).toLocaleDateString('id-ID')} - {new Date(currentPeriode.akhir_rab).toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </AdminPondokLayout>
    );
  }

  return (
    <AdminPondokLayout title="Buat RAB">
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate("/admin-pondok/rab")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Pengajuan RAB</CardTitle>
            <CardDescription>
              Periode {currentPeriode.tahun}-{currentPeriode.bulan.toString().padStart(2, '0')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <p className="text-xs text-muted-foreground">
                  Saldo awal dari sisa saldo periode sebelumnya
                </p>
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

            <div className="space-y-2">
              <Label htmlFor="dokumen">Dokumen Bukti RAB</Label>
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
            <p className="text-sm">
              Total Saldo: <strong>{formatCurrency((formData.saldo_awal || 0) + (formData.rencana_pemasukan || 0) - (formData.rencana_pengeluaran || 0))}</strong>
            </p>
            <Button type="submit" disabled={createRABMutation.isPending}>
              {createRABMutation.isPending ? "Menyimpan..." : "Ajukan RAB"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AdminPondokLayout>
  );
};

export default CreateRABPage;
