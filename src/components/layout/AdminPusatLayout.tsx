
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "./AuthLayout";
import { UserRole } from "@/types";
import { AdminPusatTopNav } from "./AdminPusatTopNav";

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
      <div className="min-h-screen bg-gray-50">
        <AdminPusatTopNav />
        
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
          
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </AuthLayout>
  );
};
