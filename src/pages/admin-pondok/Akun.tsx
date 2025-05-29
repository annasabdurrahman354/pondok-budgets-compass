
import React, { useState } from "react";
import { AdminPondokLayout } from "@/components/layout/AdminPondokLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Building, Mail, Phone, MapPin, Calendar, Shield, Edit3, Save, X } from "lucide-react";

const AkunPage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: user?.nama || "",
    email: user?.email || "",
    nomor_telepon: user?.nomor_telepon || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement profile update
    toast.success("Profil berhasil diperbarui");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      nama: user?.nama || "",
      email: user?.email || "",
      nomor_telepon: user?.nomor_telepon || "",
    });
    setIsEditing(false);
  };

  return (
    <AdminPondokLayout title="Akun">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="surface-container-low rounded-3xl p-8 border-0 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
                <User className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-on-surface">{user?.nama}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="primary-container">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin Pondok
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  {user?.nomor_telepon && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">{user.nomor_telepon}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "outline" : "default"}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4" />
                  Batal
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  Edit Profil
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card className="surface-container-lowest border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-on-surface">
                <User className="h-5 w-5" />
                Informasi Pribadi
              </CardTitle>
              <CardDescription className="text-on-surface-variant">
                Kelola informasi akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama" className="text-sm font-medium text-on-surface">Nama Lengkap</Label>
                  {isEditing ? (
                    <Input
                      id="nama"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      className="border-outline/20 focus:border-primary"
                    />
                  ) : (
                    <div className="surface-container rounded-xl p-3">
                      <span className="text-on-surface">{user?.nama}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-on-surface">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="border-outline/20 focus:border-primary"
                    />
                  ) : (
                    <div className="surface-container rounded-xl p-3">
                      <span className="text-on-surface">{user?.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomor_telepon" className="text-sm font-medium text-on-surface">Nomor Telepon</Label>
                  {isEditing ? (
                    <Input
                      id="nomor_telepon"
                      name="nomor_telepon"
                      value={formData.nomor_telepon}
                      onChange={handleInputChange}
                      className="border-outline/20 focus:border-primary"
                    />
                  ) : (
                    <div className="surface-container rounded-xl p-3">
                      <span className="text-on-surface">{user?.nomor_telepon || "-"}</span>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} className="flex-1 gap-2">
                      <Save className="h-4 w-4" />
                      Simpan Perubahan
                    </Button>
                    <Button onClick={handleCancel} variant="outline" className="flex-1">
                      Batal
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pondok Information */}
          <Card className="surface-container-lowest border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-tertiary/5 to-primary/5">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-on-surface">
                <Building className="h-5 w-5" />
                Informasi Pondok
              </CardTitle>
              <CardDescription className="text-on-surface-variant">
                Detail pondok yang Anda kelola
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-on-surface">Nama Pondok</Label>
                  <div className="surface-container rounded-xl p-3">
                    <span className="text-on-surface">{user?.pondok?.nama}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-on-surface">Jenis Pondok</Label>
                  <div className="surface-container rounded-xl p-3">
                    <Badge variant="outline" className="tertiary-container">
                      {user?.pondok?.jenis?.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-on-surface">Alamat</Label>
                  <div className="surface-container rounded-xl p-3 flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-on-surface-variant" />
                    <span className="text-on-surface">{user?.pondok?.alamat}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-on-surface">Telepon Pondok</Label>
                  <div className="surface-container rounded-xl p-3 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-on-surface-variant" />
                    <span className="text-on-surface">{user?.pondok?.nomor_telepon}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-on-surface">Status Verifikasi</Label>
                  <div className="surface-container rounded-xl p-3">
                    {user?.pondok?.accepted_at ? (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <Calendar className="h-3 w-3 mr-1" />
                        Terverifikasi
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        <Calendar className="h-3 w-3 mr-1" />
                        Menunggu Verifikasi
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Actions */}
        <Card className="surface-container-lowest border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-error/5 to-warning/5">
            <CardTitle className="text-xl font-semibold text-on-surface">Pengaturan Akun</CardTitle>
            <CardDescription className="text-on-surface-variant">
              Kelola pengaturan keamanan akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 surface-container rounded-xl">
                <div>
                  <h4 className="font-medium text-on-surface">Ubah Password</h4>
                  <p className="text-sm text-on-surface-variant">Perbarui password untuk keamanan akun</p>
                </div>
                <Button variant="outline">
                  Ubah Password
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 surface-container rounded-xl">
                <div>
                  <h4 className="font-medium text-on-surface">Logout dari Semua Device</h4>
                  <p className="text-sm text-on-surface-variant">Keluar dari semua perangkat yang login</p>
                </div>
                <Button variant="outline">
                  Logout Semua
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPondokLayout>
  );
};

export default AkunPage;
