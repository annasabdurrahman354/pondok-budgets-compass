
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  FileText,
  BookOpen,
  Calendar,
  Users,
  LogOut,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AdminPusatTopNav: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin-pusat/dashboard",
      icon: Home
    },
    {
      name: "RAB",
      path: "/admin-pusat/rab",
      icon: FileText
    },
    {
      name: "LPJ",
      path: "/admin-pusat/lpj",
      icon: BookOpen
    },
    {
      name: "Periode",
      path: "/admin-pusat/periode",
      icon: Calendar
    },
    {
      name: "Pondok",
      path: "/admin-pusat/pondok",
      icon: Users
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">YP</span>
          </div>
          <div className="hidden sm:block">
            <h2 className="font-bold text-lg">Yayasan Pondok</h2>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Menu & Mobile Toggle */}
        <div className="flex items-center gap-2">
          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="hidden sm:flex items-center gap-2">
                <span className="text-sm">{user?.nama}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.nama}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          {/* Mobile User Info */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user?.nama}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
