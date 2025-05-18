
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DocumentStatus, LPJ, Periode, RAB } from "@/types";
import { Loader2, Upload, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createLPJ, fetchRABDetail, uploadLPJFile } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  realisasi_pemasukan: z.coerce.number().min(0, "Realisasi pemasukan harus positif"),
  realisasi_pengeluaran: z.coerce.number().min(0, "Realisasi pengeluaran harus positif"),
  dokumen: z.instanceof(FileList).refine(files => files.length === 1, {
    message: "File LPJ wajib diunggah",
  }).refine(files => files[0]?.size <= MAX_FILE_SIZE, {
    message: `Ukuran file maksimal 5MB`,
  }),
});

type FormData = z.infer<typeof formSchema>;

interface LPJFormProps {
  periode: Periode;
  rab?: RAB | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LPJForm: React.FC<LPJFormProps> = ({
  periode,
  rab,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      realisasi_pemasukan: 0,
      realisasi_pengeluaran: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user?.pondok_id) {
      toast.error("Data pondok tidak ditemukan");
      return;
    }
    
    if (!rab) {
      toast.error("Anda harus mengajukan RAB terlebih dahulu sebelum mengajukan LPJ");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Upload document first
      const file = data.dokumen[0];
      const filePath = await uploadLPJFile(file, user.pondok_id, periode.id);
      
      if (!filePath) {
        throw new Error("Gagal mengunggah dokumen LPJ");
      }
      
      // Calculate remaining balance
      const sisaSaldo = (rab.saldo_awal + data.realisasi_pemasukan) - data.realisasi_pengeluaran;
      
      // 2. Create LPJ record
      const lpjData: Partial<LPJ> = {
        pondok_id: user.pondok_id,
        periode_id: periode.id,
        status: DocumentStatus.DIAJUKAN,
        saldo_awal: rab.saldo_awal,
        rencana_pemasukan: rab.rencana_pemasukan,
        rencana_pengeluaran: rab.rencana_pengeluaran,
        realisasi_pemasukan: data.realisasi_pemasukan,
        realisasi_pengeluaran: data.realisasi_pengeluaran,
        sisa_saldo: sisaSaldo,
        dokumen_path: filePath,
        submitted_at: new Date().toISOString(),
      };
      
      const result = await createLPJ(lpjData);
      
      if (!result) {
        throw new Error("Gagal menyimpan data LPJ");
      }
      
      toast.success("LPJ berhasil diajukan");
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/admin-pondok/lpj");
      }
      
    } catch (error: any) {
      toast.error(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {rab && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted p-4 rounded-md">
                <div>
                  <Label className="text-muted-foreground">Saldo Awal</Label>
                  <div className="text-lg font-medium">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(rab.saldo_awal)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rencana Pemasukan</Label>
                  <div className="text-lg font-medium">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(rab.rencana_pemasukan)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rencana Pengeluaran</Label>
                  <div className="text-lg font-medium">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(rab.rencana_pengeluaran)}
                  </div>
                </div>
              </div>
            </>
          )}
          
          <FormField
            control={form.control}
            name="realisasi_pemasukan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Realisasi Pemasukan</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah pemasukan yang terealisasi pada periode {periode.id}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="realisasi_pengeluaran"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Realisasi Pengeluaran</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Jumlah pengeluaran yang terealisasi pada periode {periode.id}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dokumen"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Dokumen LPJ</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      {...fieldProps}
                      onChange={(e) => onChange(e.target.files)}
                      className="max-w-md"
                    />
                    <Upload className="h-4 w-4" />
                  </div>
                </FormControl>
                <FormDescription>
                  Unggah dokumen LPJ dalam format PDF, Word, atau Excel (maks. 5MB)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting || !rab}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Ajukan LPJ"
            )}
          </Button>
        </div>
        
        {!rab && (
          <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            <div>
              <strong>Perhatian:</strong> Anda harus mengajukan RAB terlebih dahulu sebelum dapat mengajukan LPJ.
            </div>
          </div>
        )}
      </form>
    </Form>
  );
};
