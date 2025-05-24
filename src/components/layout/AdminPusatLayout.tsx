
import React, { useState } from "react";
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
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <AuthLayout requiredRole={UserRole.ADMIN_PUSAT}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <div className="md:hidden fixed top-4 left-4 z-50">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="bg-white/80 backdrop-blur-sm"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>

          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block`}>
            <AdminSidebar />
          </div>
          
          <div className="flex-1 min-h-screen overflow-x-hidden">
            <main className="page-container p-4 md:p-6">
              <div className="page-header mb-6">
                <h1 className="page-title text-2xl font-bold">{title}</h1>
              </div>
              <div className="animate-fade-in overflow-x-auto p-2">{children}</div>
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

  // Helper function to check if a menu item is active
  const isActive = (path: string) => {
    if (path === "/admin-pusat/dashboard" && location.pathname === "/admin-pusat/dashboard") {
      return true;
    }
    if (path !== "/admin-pusat/dashboard" && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <Sidebar className="z-40 h-screen" variant="floating">
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
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className={isActive("/admin-pusat/dashboard") ? "bg-secondary/50 font-medium" : ""}
                >
                  <Link to="/admin-pusat/dashboard">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className={isActive("/admin-pusat/rab") ? "bg-secondary/50 font-medium" : ""}
                >
                  <Link to="/admin-pusat/rab">
                    <FileText className="h-4 w-4" />
                    <span>RAB</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className={isActive("/admin-pusat/lpj") ? "bg-secondary/50 font-medium" : ""}
                >
                  <Link to="/admin-pusat/lpj">
                    <BookOpen className="h-4 w-4" />
                    <span>LPJ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className={isActive("/admin-pusat/periode") ? "bg-secondary/50 font-medium" : ""}
                >
                  <Link to="/admin-pusat/periode">
                    <Calendar className="h-4 w-4" />
                    <span>Periode</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className={isActive("/admin-pusat/pondok") ? "bg-secondary/50 font-medium" : ""}
                >
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
