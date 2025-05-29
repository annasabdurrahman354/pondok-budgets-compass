
import React from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { CombinedRABLPJTable } from "@/components/admin-pusat/CombinedRABLPJTable";

const AdminPusatRABPage: React.FC = () => {
  return (
    <AdminPusatLayout title="Manajemen RAB">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Daftar RAB Semua Pondok</h2>
            <p className="text-sm text-muted-foreground">
              Kelola dan review RAB dari semua pondok
            </p>
          </div>
          
          <CombinedRABLPJTable type="rab" />
        </div>
      </div>
    </AdminPusatLayout>
  );
};

export default AdminPusatRABPage;
