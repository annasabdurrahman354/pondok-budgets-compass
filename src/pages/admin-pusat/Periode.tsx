
import React from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { fetchAllPeriode } from "@/services/api";
import { PeriodeTable } from "@/components/periode/PeriodeTable";
import { PeriodeDetailDialog } from "@/components/periode/PeriodeDetailDialog";
import { CreatePeriodeDialog } from "@/components/periode/CreatePeriodeDialog";
import { EditPeriodeDialog } from "@/components/periode/EditPeriodeDialog";
import { usePeriodeMutations } from "@/hooks/usePeriodeMutations";

const PeriodePage: React.FC = () => {
  const {
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
  } = usePeriodeMutations();

  // Fetch periods data
  const { data: periodes = [], isLoading } = useQuery({
    queryKey: ['periods'],
    queryFn: fetchAllPeriode
  });

  return (
    <AdminPusatLayout title="Manajemen Periode">
      <div className="mb-6 flex justify-end">
        <CreatePeriodeDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleCreate}
          isSubmitting={createPeriodeMutation.isPending}
        />
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        {selectedPeriode && <PeriodeDetailDialog periode={selectedPeriode} />}
      </Dialog>

      {/* Edit Dialog */}
      <EditPeriodeDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleUpdate}
        isSubmitting={updatePeriodeMutation.isPending}
        periodeId={selectedPeriode?.id || null}
      />

      <Card>
        <CardHeader>
          <CardTitle>Daftar Periode</CardTitle>
          <CardDescription>
            Periode menentukan jadwal pengisian RAB dan LPJ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PeriodeTable
            periodes={periodes}
            isLoading={isLoading}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </AdminPusatLayout>
  );
};

export default PeriodePage;
