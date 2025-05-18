
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "./AuthLayout";
import { UserRole } from "@/types";
import {
  Home,
  FileText,
  BookOpen,
  Calendar,
  Users,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";

interface AdminPusatLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AdminPusatLayout: React.FC<AdminPusatLayoutProps> = ({
  children,
  title = "Dashboard",
}) => {
  return (
    <AuthLayout requiredRole={UserRole.ADMIN_PUSAT}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AdminSidebar />
          <div className="flex-1 min-h-screen">
            <main className="page-container">
              <div className="page-header">
                <h1 className="page-title">{title}</h1>
              </div>
              <div className="animate-fade-in">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthLayout>
  );
};

const AdminSidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">YP</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">Yayasan Pondok</h2>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem active={location.pathname === "/admin-pusat/dashboard"}>
                <SidebarMenuButton asChild>
                  <Link to="/admin-pusat/dashboard">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem active={location.pathname === "/admin-pusat/rab"}>
                <SidebarMenuButton asChild>
                  <Link to="/admin-pusat/rab">
                    <FileText className="h-4 w-4" />
                    <span>RAB</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem active={location.pathname === "/admin-pusat/lpj"}>
                <SidebarMenuButton asChild>
                  <Link to="/admin-pusat/lpj">
                    <BookOpen className="h-4 w-4" />
                    <span>LPJ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem active={location.pathname === "/admin-pusat/periode"}>
                <SidebarMenuButton asChild>
                  <Link to="/admin-pusat/periode">
                    <Calendar className="h-4 w-4" />
                    <span>Periode</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem active={location.pathname === "/admin-pusat/pondok"}>
                <SidebarMenuButton asChild>
                  <Link to="/admin-pusat/pondok">
                    <Users className="h-4 w-4" />
                    <span>Pondok</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm font-medium">{user?.nama}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
