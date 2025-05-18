
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
import { DocumentStatus, Periode, RAB } from "@/types";
import { Loader2, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createRAB, uploadRABFile } from "@/services/api";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  saldo_awal: z.coerce.number().min(0, "Saldo awal harus positif"),
  rencana_pemasukan: z.coerce.number().min(0, "Rencana pemasukan harus positif"),
  rencana_pengeluaran: z.coerce.number().min(0, "Rencana pengeluaran harus positif"),
  dokumen: z.instanceof(FileList).refine(files => files.length === 1, {
    message: "File RAB wajib diunggah",
  }).refine(files => files[0]?.size <= MAX_FILE_SIZE, {
    message: `Ukuran file maksimal 5MB`,
  }),
});

type FormData = z.infer<typeof formSchema>;

interface RABFormProps {
  periode: Periode;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const RABForm: React.FC<RABFormProps> = ({
  periode,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      saldo_awal: 0,
      rencana_pemasukan: 0,
      rencana_pengeluaran: 0,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user?.pondok_id) {
      toast.error("Data pondok tidak ditemukan");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Upload document first
      const file = data.dokumen[0];
      const filePath = await uploadRABFile(file, user.pondok_id, periode.id);
      
      if (!filePath) {
        throw new Error("Gagal mengunggah dokumen RAB");
      }
      
      // 2. Create RAB record
      const rabData: Partial<RAB> = {
        pondok_id: user.pondok_id,
        periode_id: periode.id,
        status: DocumentStatus.DIAJUKAN,
        saldo_awal: data.saldo_awal,
        rencana_pemasukan: data.rencana_pemasukan,
        rencana_pengeluaran: data.rencana_pengeluaran,
        dokumen_path: filePath,
        submitted_at: new Date().toISOString(),
      };
      
      const result = await createRAB(rabData);
      
      if (!result) {
        throw new Error("Gagal menyimpan data RAB");
      }
      
      toast.success("RAB berhasil diajukan");
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/admin-pondok/rab");
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
          <FormField
            control={form.control}
            name="saldo_awal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Saldo Awal</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Saldo awal periode {periode.id}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rencana_pemasukan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rencana Pemasukan</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Estimasi pemasukan pada periode {periode.id}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rencana_pengeluaran"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rencana Pengeluaran</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Estimasi pengeluaran pada periode {periode.id}
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
                <FormLabel>Dokumen RAB</FormLabel>
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
                  Unggah dokumen RAB dalam format PDF, Word, atau Excel (maks. 5MB)
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Ajukan RAB"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
