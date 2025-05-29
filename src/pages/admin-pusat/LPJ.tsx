
import React from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { CombinedRABLPJTable } from "@/components/admin-pusat/CombinedRABLPJTable";

const AdminPusatLPJPage: React.FC = () => {
  return (
    <AdminPusatLayout title="Manajemen LPJ">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Daftar LPJ Semua Pondok</h2>
            <p className="text-sm text-muted-foreground">
              Kelola dan review LPJ dari semua pondok
            </p>
          </div>
          
          <CombinedRABLPJTable type="lpj" />
        </div>
      </div>
    </AdminPusatLayout>
  );
};

export default AdminPusatLPJPage;
