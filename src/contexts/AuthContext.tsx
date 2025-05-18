
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile, UserRole } from "@/types";

interface AuthContextProps {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Mock user data for development
const mockAdminPusat: UserProfile = {
  id: "ap1",
  email: "adminpusat@example.com",
  nomor_telepon: "081234567890",
  nama: "Admin Pusat",
  role: UserRole.ADMIN_PUSAT,
  pondok_id: null,
};

const mockAdminPondok: UserProfile = {
  id: "apd1",
  email: "adminpondok@example.com",
  nomor_telepon: "089876543210",
  nama: "Admin Pondok",
  role: UserRole.ADMIN_PONDOK,
  pondok_id: "pd1",
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Mock authentication - in real app, this would be a Supabase auth call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let authenticatedUser: UserProfile | null = null;
      
      if (email === "adminpusat@example.com" && password === "password") {
        authenticatedUser = mockAdminPusat;
      } else if (email === "adminpondok@example.com" && password === "password") {
        authenticatedUser = mockAdminPondok;
      }
      
      if (!authenticatedUser) {
        throw new Error("Invalid email or password");
      }
      
      setUser(authenticatedUser);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      
      // Redirect based on role
      if (authenticatedUser.role === UserRole.ADMIN_PUSAT) {
        navigate("/admin-pusat/dashboard");
      } else {
        navigate("/admin-pondok/dashboard");
      }
      
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };
  
  const value = {
    user,
    isLoading,
    login,
    logout,
    isLoggedIn: !!user,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
