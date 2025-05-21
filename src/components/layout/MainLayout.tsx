
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { MainNav } from "./MainNav";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Animation effect on initial load
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div className={`min-h-screen font-roboto bg-background transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <MainNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className={`flex-1 pt-16 pb-12 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <div className={`p-6 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
