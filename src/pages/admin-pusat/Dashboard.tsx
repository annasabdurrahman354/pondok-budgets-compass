import React from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { Card, CardContent } from "@/components/ui/card";
import { PeriodInfo } from "@/components/dashboard/PeriodInfo";
import { useQuery } from "@tanstack/react-query";
import { fetchAllPeriode, fetchCurrentPeriode } from "@/services/api";
import { StatCard } from "@/components/dashboard/StatCard"; // Changed from default import to named import
import { UserRole } from "@/types";
import { BarChart, CalendarDays, School, User2, Users, FileText } from "lucide-react"; // Added FileText icon as replacement for ScrollText

const AdminDashboard: React.FC = () => {
  // Fetch all periods
  const { data: allPeriodes = [] } = useQuery({
    queryKey: ['allPeriodes'],
    queryFn: fetchAllPeriode
  });

  // Fetch current period
  const { data: currentPeriode, isLoading: isLoadingPeriode } = useQuery({
    queryKey: ['currentPeriode'],
    queryFn: fetchCurrentPeriode
  });

  const totalPondok = allPeriodes.length;
  const totalAdmin = 10;

  if (isLoadingPeriode) {
    return (
      <AdminPusatLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <p>Memuat data...</p>
        </div>
      </AdminPusatLayout>
    );
  }

  if (!currentPeriode) {
    return (
      <AdminPusatLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <p className="text-lg">Tidak ada periode aktif saat ini</p>
          <p className="text-muted-foreground">Silakan buat periode baru</p>
        </div>
      </AdminPusatLayout>
    );
  }

  return (
    <AdminPusatLayout title="Dashboard">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Pondok"
            value={totalPondok}
            icon={<School className="h-5 w-5" />}
          />
          <StatCard
            title="Total Admin"
            value={totalAdmin}
            icon={<User2 className="h-5 w-5" />}
          />
          <StatCard
            title="Total RAB"
            value={50}
            icon={<FileText className="h-5 w-5" />} // Changed from ScrollText to FileText
          />
          <StatCard
            title="Total LPJ"
            value={30}
            icon={<BarChart className="h-5 w-5" />}
          />
        </div>

        <PeriodInfo periode={currentPeriode} />
      </div>
    </AdminPusatLayout>
  );
};

export default AdminDashboard;
