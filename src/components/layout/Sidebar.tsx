
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Book, 
  GraduationCap, 
  Home, 
  LineChart, 
  Settings, 
  UserCircle, 
  X,
  Database,
  HelpCircle
} from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  // Navigation items
  const navItems = [
    { title: "Dashboard", icon: Home, href: "/dashboard" },
    { title: "Students", icon: UserCircle, href: "/students" },
    { title: "Classes", icon: Book, href: "/classes" },
    { title: "Teachers", icon: GraduationCap, href: "/teachers" },
    { title: "Results", icon: LineChart, href: "/results" },
    { title: "Analytics", icon: BarChart3, href: "/analytics" },
    { title: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-sidebar border-r pt-16 transition duration-300 ease-in-out md:translate-x-0 md:static md:h-screen ${
        open ? "translate-x-0 shadow-xl" : "-translate-x-full"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-2 md:hidden">
          <span className="font-bold">Menu</span>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Separator className="md:hidden" />
        <div className="flex-1 overflow-auto py-6">
          <nav className="grid items-start px-4 gap-2">
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.href} 
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent transition-colors group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-accent/50 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4 space-y-4">
          <Button className="w-full bg-emerald-700 hover:bg-emerald-800 shadow-md flex items-center gap-2">
            <Database className="h-4 w-4" />
            Connect to Supabase
          </Button>
          
          <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-emerald-700" />
              <h4 className="font-medium text-emerald-700">Need help?</h4>
            </div>
            <p className="text-sm mt-1 text-slate-600">Check our documentation or contact support for assistance.</p>
            <Button variant="link" size="sm" className="text-emerald-700 p-0 h-auto mt-1">
              View documentation
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
