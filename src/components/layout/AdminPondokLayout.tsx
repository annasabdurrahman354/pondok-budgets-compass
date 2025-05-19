
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
      <div className="min-h-screen pb-safe">
        <main className="page-container">
          <div className="page-header flex justify-between items-center">
            <h1 className="page-title">{title}</h1>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
    <div className="bottom-nav">
      <div className="flex justify-between items-center px-4 py-3">
        <Link
          to="/admin-pondok/dashboard"
          className={`flex flex-col items-center ${
            isActive("/admin-pondok/dashboard") ? "text-primary" : "text-gray-500"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        
        <Link
          to="/admin-pondok/rab"
          className={`flex flex-col items-center ${
            isActive("/admin-pondok/rab") ? "text-primary" : "text-gray-500"
          }`}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1">RAB</span>
        </Link>
        
        <Link
          to="/admin-pondok/lpj"
          className={`flex flex-col items-center ${
            isActive("/admin-pondok/lpj") ? "text-primary" : "text-gray-500"
          }`}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-xs mt-1">LPJ</span>
        </Link>
        
        <Link
          to="/admin-pondok/akun"
          className={`flex flex-col items-center ${
            isActive("/admin-pondok/akun") ? "text-primary" : "text-gray-500"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Akun</span>
        </Link>
      </div>
    </div>
  );
};
