
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';

// Import your page components here
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// Admin Pusat Pages
import AdminPusatDashboard from "@/pages/admin-pusat/Dashboard";
import PeriodePage from "@/pages/admin-pusat/Periode";
import PondokPage from "@/pages/admin-pusat/Pondok";
import PondokCreatePage from "@/pages/admin-pusat/PondokCreate";
import PondokEditPage from "@/pages/admin-pusat/PondokEdit";
import AdminPusatRABPage from "@/pages/admin-pusat/RAB";
import AdminPusatLPJPage from "@/pages/admin-pusat/LPJ";
import AdminPusatRABDetailPage from "@/pages/admin-pusat/RABDetail";
import AdminPusatLPJDetailPage from "@/pages/admin-pusat/LPJDetail";

// Admin Pondok Pages
import AdminPondokDashboard from "@/pages/admin-pondok/Dashboard";
import AdminPondokRABPage from "@/pages/admin-pondok/RAB";
import AdminPondokLPJPage from "@/pages/admin-pondok/LPJ";
import CreateRABPage from "@/pages/admin-pondok/CreateRAB";
import CreateLPJPage from "@/pages/admin-pondok/CreateLPJ";
import AkunPage from "@/pages/admin-pondok/Akun";
import AdminPondokRABDetailPage from "@/pages/admin-pondok/RABDetail";
import AdminPondokLPJDetailPage from "@/pages/admin-pondok/LPJDetail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin Pusat Routes */}
            <Route path="/admin-pusat/dashboard" element={<AdminPusatDashboard />} />
            <Route path="/admin-pusat/periode" element={<PeriodePage />} />
            <Route path="/admin-pusat/pondok" element={<PondokPage />} />
            <Route path="/admin-pusat/pondok/create" element={<PondokCreatePage />} />
            <Route path="/admin-pusat/pondok/:id/edit" element={<PondokEditPage />} />
            <Route path="/admin-pusat/rab" element={<AdminPusatRABPage />} />
            <Route path="/admin-pusat/rab/:id" element={<AdminPusatRABDetailPage />} />
            <Route path="/admin-pusat/lpj" element={<AdminPusatLPJPage />} />
            <Route path="/admin-pusat/lpj/:id" element={<AdminPusatLPJDetailPage />} />
            
            {/* Admin Pondok Routes */}
            <Route path="/admin-pondok/dashboard" element={<AdminPondokDashboard />} />
            <Route path="/admin-pondok/rab" element={<AdminPondokRABPage />} />
            <Route path="/admin-pondok/rab/create" element={<CreateRABPage />} />
            <Route path="/admin-pondok/rab/:id" element={<AdminPondokRABDetailPage />} />
            <Route path="/admin-pondok/lpj" element={<AdminPondokLPJPage />} />
            <Route path="/admin-pondok/lpj/create" element={<CreateLPJPage />} />
            <Route path="/admin-pondok/lpj/:id" element={<AdminPondokLPJDetailPage />} />
            <Route path="/admin-pondok/akun" element={<AkunPage />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
