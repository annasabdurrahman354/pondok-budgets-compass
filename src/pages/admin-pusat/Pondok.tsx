
import React, { useState } from "react";
import { AdminPusatLayout } from "@/components/layout/AdminPusatLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllPondoks, verifyPondok } from "@/services/api";
import { Pondok, UserRole } from "@/types";
import { getPondokJenisLabel } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Search, CheckCircle, Edit, Eye, User, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ResponsiveTable,
  ResponsiveTableBody,
  ResponsiveTableCell,
  ResponsiveTableHead,
  ResponsiveTableHeader,
  ResponsiveTableRow,
} from "@/components/ui/responsive-table";

interface AdminUser {
  id: string;
  nama: string;
  email: string;
  nomor_telepon?: string;
}

const PondokPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPondokId, setSelectedPondokId] = useState<string>("");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    nama: "",
    email: "",
    nomor_telepon: "",
    password: "",
  });

  const { data: pondoks = [], isLoading } = useQuery({
    queryKey: ['pondoks'],
    queryFn: fetchAllPondoks
  });

  const verifyMutation = useMutation({
    mutationFn: verifyPondok,
    onSuccess: () => {
      toast.success("Pondok berhasil diverifikasi");
      queryClient.invalidateQueries({ queryKey: ['pondoks'] });
    },
    onError: () => {
      toast.error("Gagal memverifikasi pondok");
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });
      
      if (authError) throw authError;
      
      // Create profile in user_profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profile')
        .insert({
          id: authData.user?.id,
          email: userData.email,
          nama: userData.nama,
          nomor_telepon: userData.nomor_telepon,
          role: UserRole.ADMIN_PONDOK,
          pondok_id: selectedPondokId
        })
        .select();
      
      if (profileError) throw profileError;
      
      return profileData[0];
    },
    onSuccess: () => {
      toast.success("Admin baru berhasil ditambahkan");
      setIsAddUserOpen(false);
      setNewUser({ nama: "", email: "", nomor_telepon: "", password: "" });
      fetchAdminUsers(selectedPondokId);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_profile')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Also delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;
    },
    onSuccess: () => {
      toast.success("Admin berhasil dihapus");
      fetchAdminUsers(selectedPondokId);
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const fetchAdminUsers = async (pondokId: string) => {
    const { data, error } = await supabase
      .from('user_profile')
      .select('*')
      .eq('pondok_id', pondokId)
      .eq('role', UserRole.ADMIN_PONDOK);
    
    if (error) {
      toast.error("Gagal memuat data admin");
      return;
    }
    
    setAdminUsers(data || []);
  };

  const handleManageUsers = (pondokId: string) => {
    setSelectedPondokId(pondokId);
    fetchAdminUsers(pondokId);
    setIsUserManagementOpen(true);
  };

  const handleCreateUser = () => {
    if (!newUser.nama || !newUser.email || !newUser.password) {
      toast.error("Semua field wajib diisi");
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const filteredPondoks = (pondoks as Pondok[]).filter((pondok) =>
    pondok.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pondok.alamat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (pondok: Pondok) => {
    if (pondok.accepted_at) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terverifikasi</Badge>;
    }
    return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
  };

  const handleVerify = (pondokId: string) => {
    verifyMutation.mutate(pondokId);
  };

  if (isLoading) {
    return (
      <AdminPusatLayout title="Kelola Pondok">
        <div className="flex justify-center items-center h-64">
          <p>Memuat data pondok...</p>
        </div>
      </AdminPusatLayout>
    );
  }

  return (
    <AdminPusatLayout title="Kelola Pondok">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold">Daftar Pondok</h2>
            <p className="text-muted-foreground">Kelola dan verifikasi pondok yang terdaftar</p>
          </div>
          <Button onClick={() => navigate("/admin-pusat/pondok/create")}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Pondok
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pondok..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Data Pondok</CardTitle>
            <CardDescription>
              Daftar semua pondok yang terdaftar dalam sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveTable>
              <ResponsiveTableHeader>
                <ResponsiveTableRow>
                  <ResponsiveTableHead>Nama Pondok</ResponsiveTableHead>
                  <ResponsiveTableHead>Jenis</ResponsiveTableHead>
                  <ResponsiveTableHead>Alamat</ResponsiveTableHead>
                  <ResponsiveTableHead>Status</ResponsiveTableHead>
                  <ResponsiveTableHead>Tanggal Daftar</ResponsiveTableHead>
                  <ResponsiveTableHead className="text-right">Aksi</ResponsiveTableHead>
                </ResponsiveTableRow>
              </ResponsiveTableHeader>
              <ResponsiveTableBody>
                {filteredPondoks.length > 0 ? (
                  filteredPondoks.map((pondok) => (
                    <ResponsiveTableRow key={pondok.id} isCard={isMobile}>
                      <ResponsiveTableCell 
                        label="Nama Pondok" 
                        isCard={isMobile}
                        className="font-medium"
                      >
                        {pondok.nama}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell 
                        label="Jenis" 
                        isCard={isMobile}
                      >
                        {getPondokJenisLabel(pondok.jenis)}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell 
                        label="Alamat" 
                        isCard={isMobile}
                      >
                        {pondok.alamat}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell 
                        label="Status" 
                        isCard={isMobile}
                      >
                        {getStatusBadge(pondok)}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell 
                        label="Tanggal Daftar" 
                        isCard={isMobile}
                      >
                        {pondok.updated_at ? new Date(pondok.updated_at).toLocaleDateString('id-ID') : '-'}
                      </ResponsiveTableCell>
                      <ResponsiveTableCell 
                        label="Aksi" 
                        isCard={isMobile}
                        className={isMobile ? "justify-center" : "text-right"}
                      >
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin-pusat/pondok/${pondok.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManageUsers(pondok.id)}
                          >
                            <User className="h-4 w-4" />
                          </Button>
                          
                          {!pondok.accepted_at && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Verifikasi Pondok</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin memverifikasi pondok "{pondok.nama}"?
                                    Setelah diverifikasi, pondok ini dapat mengajukan RAB dan LPJ.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleVerify(pondok.id)}
                                    disabled={verifyMutation.isPending}
                                  >
                                    {verifyMutation.isPending ? "Memverifikasi..." : "Verifikasi"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </ResponsiveTableCell>
                    </ResponsiveTableRow>
                  ))
                ) : (
                  <ResponsiveTableRow isCard={isMobile}>
                    <ResponsiveTableCell 
                      className="text-center py-8" 
                      isCard={isMobile}
                    >
                      {searchTerm ? "Tidak ada pondok yang sesuai dengan pencarian." : "Belum ada pondok yang terdaftar."}
                    </ResponsiveTableCell>
                  </ResponsiveTableRow>
                )}
              </ResponsiveTableBody>
            </ResponsiveTable>
          </CardContent>
        </Card>

        {/* User Management Dialog */}
        <Dialog open={isUserManagementOpen} onOpenChange={setIsUserManagementOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Kelola Admin Pondok</DialogTitle>
              <DialogDescription>
                Kelola user admin untuk pondok yang dipilih
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Daftar Admin</h3>
                <Button onClick={() => setIsAddUserOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Admin
                </Button>
              </div>
              
              <div className="space-y-2">
                {adminUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Belum ada admin untuk pondok ini
                  </p>
                ) : (
                  adminUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{user.nama}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.nomor_telepon && (
                          <p className="text-sm text-muted-foreground">{user.nomor_telepon}</p>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Admin</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus admin "{user.nama}"?
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              disabled={deleteUserMutation.isPending}
                            >
                              {deleteUserMutation.isPending ? "Menghapus..." : "Hapus"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add User Dialog */}
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Admin Baru</DialogTitle>
              <DialogDescription>
                Buat akun admin baru untuk pondok
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input
                  id="nama"
                  value={newUser.nama}
                  onChange={(e) => setNewUser({...newUser, nama: e.target.value})}
                  placeholder="Nama lengkap admin"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Email admin"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nomor_telepon">Nomor Telepon</Label>
                <Input
                  id="nomor_telepon"
                  value={newUser.nomor_telepon}
                  onChange={(e) => setNewUser({...newUser, nomor_telepon: e.target.value})}
                  placeholder="Nomor telepon (opsional)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Password untuk login"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleCreateUser}
                disabled={createUserMutation.isPending}
              >
                {createUserMutation.isPending ? "Membuat..." : "Buat Admin"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminPusatLayout>
  );
};

export default PondokPage;
