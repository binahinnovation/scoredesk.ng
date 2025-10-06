
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { MainNav } from "./MainNav";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to closed on mobile
  const [mounted, setMounted] = useState(false);
  
  // Animation effect on initial load
  useEffect(() => {
    setMounted(true);
    
    // Set sidebar open on desktop, closed on mobile
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className={`min-h-screen font-roboto bg-gray-50 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <MainNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex pt-14 sm:pt-16">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 pb-12 transition-all duration-300 ease-in-out overflow-x-auto min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
          <div className={`
            p-2 sm:p-3 md:p-4 lg:p-4 transition-opacity duration-500 
            ${mounted ? 'opacity-100' : 'opacity-0'}
            min-h-full
          `}>
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
