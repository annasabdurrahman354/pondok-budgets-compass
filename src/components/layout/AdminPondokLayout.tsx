
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, LogOut, Menu, ScrollText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface AdminPondokLayoutProps {
  children: ReactNode;
  title: string;
}

export const AdminPondokLayout = ({ children, title }: AdminPondokLayoutProps) => {
  const isMobile = useMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [open, setOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success("Berhasil logout");
      navigate("/login");
    } catch (error) {
      toast.error("Gagal logout");
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      path: "/admin-pondok/dashboard",
    },
    {
      name: "RAB",
      icon: <ScrollText className="h-5 w-5" />,
      path: "/admin-pondok/rab",
    },
    {
      name: "LPJ",
      icon: <ScrollText className="h-5 w-5" />,
      path: "/admin-pondok/lpj",
    },
    {
      name: "Akun",
      icon: <ScrollText className="h-5 w-5" />,
      path: "/admin-pondok/akun",
    },
  ];

  return (
    <div className="flex min-h-screen">
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="fixed left-4 top-4 z-50"
              size="icon"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0" forceMount>
            <p className="px-7 py-6 font-bold">Sistem Manajemen Pondok</p>
            <div className="flex flex-col space-y-1 p-2">
              {menuItems.map((item) => (
                <Button
                  key={item.name}
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    setOpen(false);
                    navigate(item.path);
                  }}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              ))}
              
              <Separator className="my-2" />
              
              <Button
                variant="ghost"
                className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Logout</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="hidden w-[240px] flex-col border-r bg-background md:flex">
          <div className="px-7 py-6 font-bold">Sistem Manajemen Pondok</div>
          <div className="flex flex-col space-y-1 p-2">
            {menuItems.map((item) => (
              <Link key={item.name} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={cn("justify-start w-full")}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Button>
              </Link>
            ))}
            
            <Separator className="my-2" />
            
            <Button
              variant="ghost"
              className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-2">Logout</span>
            </Button>
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b px-4 md:px-6">
          <h1 className="text-lg font-bold md:text-xl">
            {isMobile ? (
              <span className="ml-8">{title}</span>
            ) : (
              <span>{title}</span>
            )}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};
