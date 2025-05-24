
import React from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllRAB, fetchAllLPJ, fetchAllPondoks } from "@/services/api";
import { DocumentStatus } from "@/types";
import { StatCard } from "@/components/dashboard/StatCard";
import { Building2, FileText, ClipboardList, CheckCircle } from "lucide-react";

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

  // Calculate statistics
  const totalPondoks = pondoks.length;
  const verifiedPondoks = pondoks.filter(p => p.accepted_at).length;
  const pendingRABs = rabs.filter(r => r.status === DocumentStatus.DIAJUKAN).length;
  const pendingLPJs = lpjs.filter(l => l.status === DocumentStatus.DIAJUKAN).length;

  // Recent submissions for quick action
  const recentRABs = rabs
    .filter(r => r.status === DocumentStatus.DIAJUKAN)
    .slice(0, 5);
    
  const recentLPJs = lpjs
    .filter(l => l.status === DocumentStatus.DIAJUKAN)
    .slice(0, 5);

  return (
    <AdminPusatLayout title="Dashboard">
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Pondok"
            value={totalPondoks.toString()}
            description="Pondok terdaftar"
            icon={<Building2 className="h-4 w-4" />}
          />
          <StatCard
            title="Pondok Terverifikasi"
            value={verifiedPondoks.toString()}
            description="Pondok yang sudah diverifikasi"
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <StatCard
            title="RAB Pending"
            value={pendingRABs.toString()}
            description="Menunggu review"
            icon={<FileText className="h-4 w-4" />}
          />
          <StatCard
            title="LPJ Pending"
            value={pendingLPJs.toString()}
            description="Menunggu review"
            icon={<ClipboardList className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent RAB Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>RAB Terbaru</CardTitle>
              <CardDescription>
                RAB yang menunggu review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRABs.length > 0 ? (
                  recentRABs.map((rab) => (
                    <div key={rab.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{rab.pondok?.nama}</p>
                        <p className="text-sm text-muted-foreground">
                          {rab.periode?.tahun}-{rab.periode?.bulan.toString().padStart(2, '0')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/admin-pusat/rab/${rab.id}`)}
                      >
                        Review
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Tidak ada RAB yang menunggu review
                  </p>
                )}
                
                {recentRABs.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/admin-pusat/rab")}
                  >
                    Lihat Semua RAB
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent LPJ Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>LPJ Terbaru</CardTitle>
              <CardDescription>
                LPJ yang menunggu review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLPJs.length > 0 ? (
                  recentLPJs.map((lpj) => (
                    <div key={lpj.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{lpj.pondok?.nama}</p>
                        <p className="text-sm text-muted-foreground">
                          {lpj.periode?.tahun}-{lpj.periode?.bulan.toString().padStart(2, '0')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/admin-pusat/lpj/${lpj.id}`)}
                      >
                        Review
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Tidak ada LPJ yang menunggu review
                  </p>
                )}
                
                {recentLPJs.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
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
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>
              Akses menu utama dengan cepat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col space-y-2"
                onClick={() => navigate("/admin-pusat/pondok")}
              >
                <Building2 className="h-6 w-6" />
                <span>Kelola Pondok</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col space-y-2"
                onClick={() => navigate("/admin-pusat/periode")}
              >
                <FileText className="h-6 w-6" />
                <span>Kelola Periode</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col space-y-2"
                onClick={() => navigate("/admin-pusat/rab")}
              >
                <FileText className="h-6 w-6" />
                <span>Review RAB</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col space-y-2"
                onClick={() => navigate("/admin-pusat/lpj")}
              >
                <ClipboardList className="h-6 w-6" />
                <span>Review LPJ</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPusatLayout>
  );
};

export default AdminPusatDashboard;
