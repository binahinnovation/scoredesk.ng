
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { MainNav } from "./MainNav";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      <MainNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 pt-16">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
