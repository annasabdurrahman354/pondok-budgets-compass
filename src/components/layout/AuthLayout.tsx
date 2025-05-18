
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import { Loader2 } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  // Effect to handle unauthorized users
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/login", { replace: true });
    }
    else if (!isLoading && isLoggedIn && requiredRole && user?.role !== requiredRole) {
      // Redirect based on user's role
      if (user?.role === UserRole.ADMIN_PUSAT) {
        navigate("/admin-pusat/dashboard", { replace: true });
      } else if (user?.role === UserRole.ADMIN_PONDOK) {
        navigate("/admin-pondok/dashboard", { replace: true });
      }
    }
  }, [isLoading, isLoggedIn, user, requiredRole, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p>Memuat...</p>
        </div>
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return null; // The useEffect will handle the redirect
  }
  
  return <>{children}</>;
};
