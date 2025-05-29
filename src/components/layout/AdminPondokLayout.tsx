
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "./AuthLayout";
import { UserRole } from "@/types";
import { Home, FileText, BookOpen, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminPondokLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AdminPondokLayout: React.FC<AdminPondokLayoutProps> = ({
  children,
  title = "Dashboard",
}) => {
  const { logout } = useAuth();
  
  return (
    <AuthLayout requiredRole={UserRole.ADMIN_PONDOK}>
      <div className="min-h-screen pb-safe bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <main className="page-container">
          <div className="page-header flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="page-title text-on-surface">{title}</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
          <div className="animate-fade-in pb-24">{children}</div>
        </main>
        <BottomNav />
      </div>
    </AuthLayout>
  );
};

const BottomNav: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="bottom-nav surface-container-high border-t border-outline/20">
      <div className="flex justify-around items-center px-4 py-3">
        <Link
          to="/admin-pondok/dashboard"
          className={`flex flex-col items-center py-2 px-4 rounded-2xl transition-all duration-200 ${
            isActive("/admin-pondok/dashboard") 
              ? "bg-primary/10 text-primary" 
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Dashboard</span>
        </Link>
        
        <Link
          to="/admin-pondok/rab"
          className={`flex flex-col items-center py-2 px-4 rounded-2xl transition-all duration-200 ${
            isActive("/admin-pondok/rab") 
              ? "bg-primary/10 text-primary" 
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">RAB</span>
        </Link>
        
        <Link
          to="/admin-pondok/lpj"
          className={`flex flex-col items-center py-2 px-4 rounded-2xl transition-all duration-200 ${
            isActive("/admin-pondok/lpj") 
              ? "bg-primary/10 text-primary" 
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">LPJ</span>
        </Link>
        
        <Link
          to="/admin-pondok/akun"
          className={`flex flex-col items-center py-2 px-4 rounded-2xl transition-all duration-200 ${
            isActive("/admin-pondok/akun") 
              ? "bg-primary/10 text-primary" 
              : "text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1 font-medium">Akun</span>
        </Link>
      </div>
    </div>
  );
};
