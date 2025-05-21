
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { MainNav } from "./MainNav";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Animation effect on initial load
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div className="min-h-screen font-roboto bg-background transition-opacity duration-500 flex">
      <div className={`fixed inset-y-0 z-30 md:relative md:flex transition-all duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>
      
      <div className="flex-1 flex flex-col">
        <MainNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 pt-16 pb-12 transition-all duration-300 ease-in-out">
          <div className={`transition-opacity duration-500 px-4 md:px-6 lg:px-8 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            <Outlet />
          </div>
        </main>
        
        <Toaster />
      </div>
      
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
