
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <AdminPusatTopNav />
        
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
          </div>
          
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </AuthLayout>
  );
};
