
import React from "react";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchRABsByPondok, fetchLPJsByPondok, fetchCurrentPeriode } from "@/services/api";
import { DocumentStatus } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileText, BookOpen, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";

const AdminPondokDashboard: React.FC = () => {
  const { user } = useAuth();
  const pondokId = user?.pondok_id;

  const { data: rabs = [] } = useQuery({
    queryKey: ['rabs', pondokId],
    queryFn: () => pondokId ? fetchRABsByPondok(pondokId) : Promise.resolve([]),
    enabled: !!pondokId
  });

  const { data: lpjs = [] } = useQuery({
    queryKey: ['lpjs', pondokId],
    queryFn: () => pondokId ? fetchLPJsByPondok(pondokId) : Promise.resolve([]),
    enabled: !!pondokId
  });

  const { data: currentPeriode } = useQuery({
    queryKey: ['currentPeriode'],
    queryFn: fetchCurrentPeriode
  });

  // Calculate statistics
  const totalRABs = rabs.length;
  const totalLPJs = lpjs.length;
  const approvedRABs = rabs.filter(rab => rab.status === DocumentStatus.DITERIMA).length;
  const approvedLPJs = lpjs.filter(lpj => lpj.status === DocumentStatus.DITERIMA).length;

  // Status distribution data for charts
  const rabStatusData = [
    { name: 'Diajukan', value: rabs.filter(r => r.status === DocumentStatus.DIAJUKAN).length, color: '#FFA726' },
    { name: 'Diterima', value: rabs.filter(r => r.status === DocumentStatus.DITERIMA).length, color: '#66BB6A' },
    { name: 'Revisi', value: rabs.filter(r => r.status === DocumentStatus.REVISI).length, color: '#EF5350' },
  ];

  const lpjStatusData = [
    { name: 'Diajukan', value: lpjs.filter(l => l.status === DocumentStatus.DIAJUKAN).length, color: '#FFA726' },
    { name: 'Diterima', value: lpjs.filter(l => l.status === DocumentStatus.DITERIMA).length, color: '#66BB6A' },
    { name: 'Revisi', value: lpjs.filter(l => l.status === DocumentStatus.REVISI).length, color: '#EF5350' },
  ];

  // Monthly submission trends
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    const monthStr = month.toISOString().slice(0, 7);
    
    return {
      month: month.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      RAB: rabs.filter(r => r.submitted_at?.startsWith(monthStr)).length,
      LPJ: lpjs.filter(l => l.submitted_at?.startsWith(monthStr)).length,
    };
  }).reverse();

  return (
    <AdminPondokLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="surface-container-low rounded-3xl p-8 border-0 shadow-md">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-on-surface">
                Selamat datang, {user?.nama}
              </h2>
              <p className="text-on-surface-variant text-lg">
                Kelola RAB dan LPJ pondok Anda dengan mudah
              </p>
              {currentPeriode && (
                <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-primary-container rounded-full w-fit">
                  <Clock className="h-4 w-4 text-on-primary-container" />
                  <span className="text-sm font-medium text-on-primary-container">
                    Periode Aktif: {currentPeriode.tahun}-{currentPeriode.bulan.toString().padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-16 w-16 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total RAB"
            value={totalRABs.toString()}
            icon={<FileText className="h-6 w-6 text-primary" />}
            description="Rencana Anggaran Belanja"
            className="surface-container-lowest border-0 shadow-lg"
          />
          <StatCard
            title="RAB Disetujui"
            value={approvedRABs.toString()}
            icon={<CheckCircle className="h-6 w-6 text-green-600" />}
            description="RAB yang telah disetujui"
            className="surface-container-lowest border-0 shadow-lg"
          />
          <StatCard
            title="Total LPJ"
            value={totalLPJs.toString()}
            icon={<BookOpen className="h-6 w-6 text-secondary" />}
            description="Laporan Pertanggung Jawaban"
            className="surface-container-lowest border-0 shadow-lg"
          />
          <StatCard
            title="LPJ Disetujui"
            value={approvedLPJs.toString()}
            icon={<CheckCircle className="h-6 w-6 text-green-600" />}
            description="LPJ yang telah disetujui"
            className="surface-container-lowest border-0 shadow-lg"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Trends */}
          <Card className="surface-container-lowest border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="text-xl font-semibold text-on-surface">Tren Pengajuan Bulanan</CardTitle>
              <CardDescription className="text-on-surface-variant">
                Jumlah RAB dan LPJ yang diajukan per bulan
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #E0E0E0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="RAB" fill="#2196F3" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="LPJ" fill="#9C27B0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <div className="space-y-6">
            <Card className="surface-container-lowest border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-tertiary/5 to-primary/5">
                <CardTitle className="text-lg font-semibold text-on-surface">Status RAB</CardTitle>
                <CardDescription className="text-on-surface-variant">
                  Distribusi status RAB yang diajukan
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={rabStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {rabStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="surface-container-lowest border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-secondary/5 to-tertiary/5">
                <CardTitle className="text-lg font-semibold text-on-surface">Status LPJ</CardTitle>
                <CardDescription className="text-on-surface-variant">
                  Distribusi status LPJ yang diajukan
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={lpjStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {lpjStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminPondokLayout>
  );
};

export default AdminPondokDashboard;
