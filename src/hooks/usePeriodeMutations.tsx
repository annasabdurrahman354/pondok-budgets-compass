
import { useState } from "react";
import { Periode, PeriodeFormData } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPeriode } from "@/lib/utils";
import { toast } from "sonner";

export const usePeriodeMutations = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPeriode, setSelectedPeriode] = useState<Periode | null>(null);
  
  const defaultPeriodeForm = (): PeriodeFormData => ({
    tahun: new Date().getFullYear(),
    bulan: new Date().getMonth() + 1,
    awal_rab: '',
    akhir_rab: '',
    awal_lpj: '',
    akhir_lpj: ''
  });

  const [formData, setFormData] = useState<PeriodeFormData>(defaultPeriodeForm());

  // Create period mutation
  const createPeriodeMutation = useMutation({
    mutationFn: async (newPeriode: PeriodeFormData) => {
      // Generate the period ID (YYYYMM)
      const periodeId = `${newPeriode.tahun}${String(newPeriode.bulan).padStart(2, '0')}`;
      
      const { data, error } = await supabase
        .from('periode')
        .insert({
          id: periodeId,
          tahun: Number(newPeriode.tahun),
          bulan: Number(newPeriode.bulan),
          awal_rab: newPeriode.awal_rab,
          akhir_rab: newPeriode.akhir_rab,
          awal_lpj: newPeriode.awal_lpj,
          akhir_lpj: newPeriode.akhir_lpj
        })
        .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      setIsDialogOpen(false);
      setFormData(defaultPeriodeForm());
      toast.success("Periode berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Update period mutation
  const updatePeriodeMutation = useMutation({
    mutationFn: async (updatedPeriode: Periode) => {
      const { data, error } = await supabase
        .from('periode')
        .update({
          awal_rab: updatedPeriode.awal_rab,
          akhir_rab: updatedPeriode.akhir_rab,
          awal_lpj: updatedPeriode.awal_lpj,
          akhir_lpj: updatedPeriode.akhir_lpj
        })
        .eq('id', updatedPeriode.id)
        .select();
      
      if (error) throw new Error(error.message);
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      setIsEditDialogOpen(false);
      setSelectedPeriode(null);
      toast.success("Periode berhasil diperbarui");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Delete period mutation
  const deletePeriodeMutation = useMutation({
    mutationFn: async (periodeId: string) => {
      const { error } = await supabase
        .from('periode')
        .delete()
        .eq('id', periodeId);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      toast.success("Periode berhasil dihapus");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createPeriodeMutation.mutate(formData);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPeriode) {
      updatePeriodeMutation.mutate({
        ...selectedPeriode,
        awal_rab: formData.awal_rab,
        akhir_rab: formData.akhir_rab,
        awal_lpj: formData.awal_lpj,
        akhir_lpj: formData.akhir_lpj
      });
    }
  };

  const handleDelete = (periodeId: string) => {
    deletePeriodeMutation.mutate(periodeId);
  };

  const handleViewDetail = (periode: Periode) => {
    setSelectedPeriode(periode);
    setIsDetailDialogOpen(true);
  };

  const handleEdit = (periode: Periode) => {
    setSelectedPeriode(periode);
    setFormData({
      tahun: periode.tahun,
      bulan: periode.bulan,
      awal_rab: periode.awal_rab,
      akhir_rab: periode.akhir_rab,
      awal_lpj: periode.awal_lpj,
      akhir_lpj: periode.akhir_lpj
    });
    setIsEditDialogOpen(true);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    isDetailDialogOpen,
    setIsDetailDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedPeriode,
    formData,
    createPeriodeMutation,
    updatePeriodeMutation,
    deletePeriodeMutation,
    handleInputChange,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleViewDetail,
    handleEdit,
    defaultPeriodeForm,
    setFormData,
  };
};
