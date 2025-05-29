
import React from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllRAB, fetchAllLPJ, fetchAllPondoks } from "@/services/api";
import { DocumentStatus } from "@/types";
import { StatCard } from "@/components/dashboard/StatCard";
import { Building2, FileText, ClipboardList, CheckCircle, TrendingUp, AlertTriangle, Calendar, Users } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const AdminPusatDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Fetch data for statistics
  const { data: rabs = [] } = useQuery({
    queryKey: ['allRABs'],
    queryFn: fetchAllRAB
  });

  const { data: lpjs = [] } = useQuery({
    queryKey: ['allLPJs'], 
    queryFn: fetchAllLPJ
  });

  const { data: pondoks = [] } = useQuery({
    queryKey: ['pondoks'],
    queryFn: fetchAllPondoks
  });

  // Calculate comprehensive statistics
  const totalPondoks = pondoks.length;
  const verifiedPondoks = pondoks.filter(p => p.accepted_at).length;
  const pendingRABs = rabs.filter(r => r.status === DocumentStatus.DIAJUKAN).length;
  const pendingLPJs = lpjs.filter(l => l.status === DocumentStatus.DIAJUKAN).length;
  const approvedRABs = rabs.filter(r => r.status === DocumentStatus.DITERIMA).length;
  const approvedLPJs = lpjs.filter(l => l.status === DocumentStatus.DITERIMA).length;
  const revisionRABs = rabs.filter(r => r.status === DocumentStatus.REVISI).length;
  const revisionLPJs = lpjs.filter(l => l.status === DocumentStatus.REVISI).length;

  // Chart data for status distribution
  const rabStatusData = [
    { name: 'Diajukan', value: pendingRABs, color: '#f59e0b' },
    { name: 'Diterima', value: approvedRABs, color: '#10b981' },
    { name: 'Revisi', value: revisionRABs, color: '#ef4444' }
  ];

  const lpjStatusData = [
    { name: 'Diajukan', value: pendingLPJs, color: '#f59e0b' },
    { name: 'Diterima', value: approvedLPJs, color: '#10b981' },
    { name: 'Revisi', value: revisionLPJs, color: '#ef4444' }
  ];

  // Monthly submission trends
  const monthlyData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthRABs = rabs.filter(r => {
        if (!r.submitted_at) return false;
        const date = new Date(r.submitted_at);
        return date.getFullYear() === currentYear && date.getMonth() === index;
      }).length;
      
      const monthLPJs = lpjs.filter(l => {
        if (!l.submitted_at) return false;
        const date = new Date(l.submitted_at);
        return date.getFullYear() === currentYear && date.getMonth() === index;
      }).length;
      
      return {
        month,
        RAB: monthRABs,
        LPJ: monthLPJs
      };
    });
  }, [rabs, lpjs]);

  // Recent submissions for quick action
  const recentRABs = rabs
    .filter(r => r.status === DocumentStatus.DIAJUKAN)
    .slice(0, 5);
    
  const recentLPJs = lpjs
    .filter(l => l.status === DocumentStatus.DIAJUKAN)
    .slice(0, 5);

  const chartConfig = {
    RAB: {
      label: "RAB",
      color: "#3182CE",
    },
    LPJ: {
      label: "LPJ", 
      color: "#38A169",
    },
  };

  return (
    <AdminPusatLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Selamat Datang, Admin Pusat</h2>
              <p className="text-blue-100 text-lg">Kelola sistem administrasi keuangan pondok dengan mudah</p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <Building2 className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Pondok"
            value={totalPondoks.toString()}
            description="Pondok terdaftar"
            icon={<Building2 className="h-5 w-5 text-blue-600" />}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          />
          <StatCard
            title="Pondok Terverifikasi"
            value={verifiedPondoks.toString()}
            description={`${Math.round((verifiedPondoks/totalPondoks)*100) || 0}% dari total`}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
            className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
          />
          <StatCard
            title="RAB Pending"
            value={pendingRABs.toString()}
            description="Menunggu review"
            icon={<FileText className="h-5 w-5 text-amber-600" />}
            className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
          />
          <StatCard
            title="LPJ Pending"
            value={pendingLPJs.toString()}
            description="Menunggu review"
            icon={<ClipboardList className="h-5 w-5 text-purple-600" />}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
          />
        </div>

        {/* Expert Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trends */}
          <Card className="lg:col-span-2 shadow-lg border-0 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Tren Pengajuan Bulanan
              </CardTitle>
              <CardDescription>
                Grafik pengajuan RAB dan LPJ per bulan tahun ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="RAB" 
                      stroke="#3182CE" 
                      strokeWidth={3}
                      dot={{ fill: '#3182CE', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="LPJ" 
                      stroke="#38A169" 
                      strokeWidth={3}
                      dot={{ fill: '#38A169', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Status Pondok
              </CardTitle>
              <CardDescription>
                Distribusi status verifikasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div>
                  <p className="text-sm text-green-700 font-medium">Terverifikasi</p>
                  <p className="text-2xl font-bold text-green-800">{verifiedPondoks}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <div>
                  <p className="text-sm text-amber-700 font-medium">Belum Verifikasi</p>
                  <p className="text-2xl font-bold text-amber-800">{totalPondoks - verifiedPondoks}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RAB Status Chart */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Status RAB
              </CardTitle>
              <CardDescription>
                Distribusi status pengajuan RAB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rabStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {rabStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* LPJ Status Chart */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-green-600" />
                Status LPJ
              </CardTitle>
              <CardDescription>
                Distribusi status pengajuan LPJ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={lpjStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {lpjStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent RAB Submissions */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                RAB Terbaru
              </CardTitle>
              <CardDescription>
                RAB yang menunggu review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentRABs.length > 0 ? (
                  recentRABs.map((rab) => (
                    <div key={rab.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div>
                        <p className="font-medium text-blue-900">{rab.pondok?.nama}</p>
                        <p className="text-sm text-blue-700">
                          {rab.periode?.tahun}-{rab.periode?.bulan.toString().padStart(2, '0')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/admin-pusat/rab/${rab.id}`)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Review
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Tidak ada RAB yang menunggu review</p>
                  </div>
                )}
                
                {recentRABs.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate("/admin-pusat/rab")}
                  >
                    Lihat Semua RAB
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent LPJ Submissions */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-green-600" />
                LPJ Terbaru
              </CardTitle>
              <CardDescription>
                LPJ yang menunggu review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLPJs.length > 0 ? (
                  recentLPJs.map((lpj) => (
                    <div key={lpj.id} className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                      <div>
                        <p className="font-medium text-green-900">{lpj.pondok?.nama}</p>
                        <p className="text-sm text-green-700">
                          {lpj.periode?.tahun}-{lpj.periode?.bulan.toString().padStart(2, '0')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/admin-pusat/lpj/${lpj.id}`)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Review
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Tidak ada LPJ yang menunggu review</p>
                  </div>
                )}
                
                {recentLPJs.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate("/admin-pusat/lpj")}
                  >
                    Lihat Semua LPJ
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Aksi Cepat
            </CardTitle>
            <CardDescription>
              Akses menu utama dengan cepat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col space-y-2 border-2 hover:border-blue-300 hover:bg-blue-50"
                onClick={() => navigate("/admin-pusat/pondok")}
              >
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="font-medium">Kelola Pondok</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col space-y-2 border-2 hover:border-purple-300 hover:bg-purple-50"
                onClick={() => navigate("/admin-pusat/periode")}
              >
                <Calendar className="h-8 w-8 text-purple-600" />
                <span className="font-medium">Kelola Periode</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col space-y-2 border-2 hover:border-amber-300 hover:bg-amber-50"
                onClick={() => navigate("/admin-pusat/rab")}
              >
                <FileText className="h-8 w-8 text-amber-600" />
                <span className="font-medium">Review RAB</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col space-y-2 border-2 hover:border-green-300 hover:bg-green-50"
                onClick={() => navigate("/admin-pusat/lpj")}
              >
                <ClipboardList className="h-8 w-8 text-green-600" />
                <span className="font-medium">Review LPJ</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPusatLayout>
  );
};

export default AdminPusatDashboard;
