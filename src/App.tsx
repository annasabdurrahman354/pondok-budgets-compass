
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminPusatDashboard from "./pages/admin-pusat/Dashboard";
import AdminPusatRAB from "./pages/admin-pusat/RAB";
import AdminPusatLPJ from "./pages/admin-pusat/LPJ";
import AdminPusatPeriode from "./pages/admin-pusat/Periode";
import AdminPusatPondok from "./pages/admin-pusat/Pondok";
import AdminPondokDashboard from "./pages/admin-pondok/Dashboard";
import AdminPondokRAB from "./pages/admin-pondok/RAB";
import AdminPondokLPJ from "./pages/admin-pondok/LPJ";
import AdminPondokAkun from "./pages/admin-pondok/Akun";
import { toast } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      onError: (error: any) => {
        toast.error(`Error: ${error.message || "Terjadi kesalahan"}`);
      }
    },
    mutations: {
      onError: (error: any) => {
        toast.error(`Error: ${error.message || "Terjadi kesalahan saat memproses data"}`);
      }
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Default route redirects to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Admin Pusat routes */}
            <Route path="/admin-pusat/dashboard" element={<AdminPusatDashboard />} />
            <Route path="/admin-pusat/rab" element={<AdminPusatRAB />} />
            <Route path="/admin-pusat/lpj" element={<AdminPusatLPJ />} />
            <Route path="/admin-pusat/periode" element={<AdminPusatPeriode />} />
            <Route path="/admin-pusat/pondok" element={<AdminPusatPondok />} />
            
            {/* Admin Pondok routes */}
            <Route path="/admin-pondok/dashboard" element={<AdminPondokDashboard />} />
            <Route path="/admin-pondok/rab" element={<AdminPondokRAB />} />
            <Route path="/admin-pondok/lpj" element={<AdminPondokLPJ />} />
            <Route path="/admin-pondok/akun" element={<AdminPondokAkun />} />
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
