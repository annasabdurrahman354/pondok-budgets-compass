
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { LPJ, DocumentStatus, RAB, Periode, Pondok } from "@/types";
import { createLPJ, uploadLPJFile, fetchRABsByPondok, fetchCurrentPeriode } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Upload, FileText, AlertCircle } from "lucide-react";

interface LPJFormProps {
  onSuccess?: () => void;
  pondok?: Pondok;
}

export const LPJForm: React.FC<LPJFormProps> = ({ onSuccess, pondok }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    saldo_awal: "",
    rencana_pemasukan: "",
    rencana_pengeluaran: "",
    realisasi_pemasukan: "",
    realisasi_pengeluaran: "",
    sisa_saldo: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch current periode
  const { data: currentPeriode } = useQuery({
    queryKey: ['currentPeriode'],
    queryFn: fetchCurrentPeriode
  });

  // Fetch approved RAB for current periode
  const { data: rabs = [] } = useQuery({
    queryKey: ['rabs', pondok?.id],
    queryFn: () => pondok?.id ? fetchRABsByPondok(pondok.id) : Promise.resolve([]),
    enabled: !!pondok?.id
  });

  const approvedRAB = rabs.find(rab => 
    rab.periode_id === currentPeriode?.id && 
    rab.status === DocumentStatus.DITERIMA
  );

  const createLPJMutation = useMutation({
    mutationFn: async (data: { lpjData: Omit<LPJ, 'id'>; file?: File }) => {
      const lpj = await createLPJ(data.lpjData);
      if (!lpj) throw new Error("Gagal membuat LPJ");
      
      if (data.file && lpj.id) {
        const filePath = await uploadLPJFile(data.file, lpj.id);
        if (!filePath) throw new Error("Gagal mengunggah file");
      }
      
      return lpj;
    },
    onSuccess: () => {
      toast.success("LPJ berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ['lpjs'] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error(`Gagal membuat LPJ: ${error.message}`);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: "" }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key] = "Field ini harus diisi";
      } else if (isNaN(Number(value))) {
        newErrors[key] = "Harus berupa angka";
      }
    });
    
    if (!file) {
      newErrors.file = "File LPJ harus diunggah";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !pondok || !currentPeriode) return;

    const lpjData: Omit<LPJ, 'id'> = {
      pondok_id: pondok.id,
      periode_id: currentPeriode.id,
      status: DocumentStatus.DIAJUKAN,
      saldo_awal: parseFloat(formData.saldo_awal),
      rencana_pemasukan: parseFloat(formData.rencana_pemasukan),
      rencana_pengeluaran: parseFloat(formData.rencana_pengeluaran),
      realisasi_pemasukan: parseFloat(formData.realisasi_pemasukan),
      realisasi_pengeluaran: parseFloat(formData.realisasi_pengeluaran),
      sisa_saldo: parseFloat(formData.sisa_saldo),
      submitted_at: new Date().toISOString(),
      dokumen_path: null,
      accepted_at: null,
      pesan_revisi: null
    };

    createLPJMutation.mutate({ lpjData, file: file || undefined });
  };

  if (!approvedRAB) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Anda harus memiliki RAB yang sudah disetujui untuk periode ini sebelum dapat membuat LPJ.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buat LPJ Baru</CardTitle>
        <CardDescription>
          Buat Laporan Pertanggungjawaban untuk periode {currentPeriode?.tahun}-{currentPeriode?.bulan.toString().padStart(2, '0')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Data dari RAB yang disetujui */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Data Rencana (dari RAB yang disetujui)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Saldo Awal</Label>
                <div className="p-2 bg-muted rounded">
                  {formatCurrency(approvedRAB.saldo_awal || 0)}
                </div>
              </div>
              <div>
                <Label>Rencana Pemasukan</Label>
                <div className="p-2 bg-muted rounded">
                  {formatCurrency(approvedRAB.rencana_pemasukan || 0)}
                </div>
              </div>
              <div>
                <Label>Rencana Pengeluaran</Label>
                <div className="p-2 bg-muted rounded">
                  {formatCurrency(approvedRAB.rencana_pengeluaran || 0)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Input realisasi */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Realisasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="realisasi_pemasukan" className={errors.realisasi_pemasukan ? "text-destructive" : ""}>
                  Realisasi Pemasukan <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="realisasi_pemasukan"
                  name="realisasi_pemasukan"
                  type="number"
                  value={formData.realisasi_pemasukan}
                  onChange={handleInputChange}
                  placeholder="Masukkan realisasi pemasukan"
                  className={errors.realisasi_pemasukan ? "border-destructive" : ""}
                  required
                />
                {errors.realisasi_pemasukan && <p className="text-sm text-destructive">{errors.realisasi_pemasukan}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="realisasi_pengeluaran" className={errors.realisasi_pengeluaran ? "text-destructive" : ""}>
                  Realisasi Pengeluaran <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="realisasi_pengeluaran"
                  name="realisasi_pengeluaran"
                  type="number"
                  value={formData.realisasi_pengeluaran}
                  onChange={handleInputChange}
                  placeholder="Masukkan realisasi pengeluaran"
                  className={errors.realisasi_pengeluaran ? "border-destructive" : ""}
                  required
                />
                {errors.realisasi_pengeluaran && <p className="text-sm text-destructive">{errors.realisasi_pengeluaran}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sisa_saldo" className={errors.sisa_saldo ? "text-destructive" : ""}>
                  Sisa Saldo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sisa_saldo"
                  name="sisa_saldo"
                  type="number"
                  value={formData.sisa_saldo}
                  onChange={handleInputChange}
                  placeholder="Masukkan sisa saldo"
                  className={errors.sisa_saldo ? "border-destructive" : ""}
                  required
                />
                {errors.sisa_saldo && <p className="text-sm text-destructive">{errors.sisa_saldo}</p>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Upload file */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dokumen LPJ</h3>
            <div className="space-y-2">
              <Label htmlFor="file" className={errors.file ? "text-destructive" : ""}>
                Upload File LPJ <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Pilih File</span>
                </Button>
                {file && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              {errors.file && <p className="text-sm text-destructive">{errors.file}</p>}
              <p className="text-xs text-muted-foreground">
                Format yang didukung: PDF, DOC, DOCX
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="submit"
              disabled={createLPJMutation.isPending}
            >
              {createLPJMutation.isPending ? "Menyimpan..." : "Simpan LPJ"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
