
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";

interface AuthLayoutProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading, isLoggedIn } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <Navigate 
        to={user?.role === UserRole.ADMIN_PUSAT ? "/admin-pusat/dashboard" : "/admin-pondok/dashboard"} 
        replace 
      />
    );
  }
  
  return <>{children}</>;
};
