
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
  X 
} from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  // Navigation items
  const navItems = [
    { title: "Dashboard", icon: Home, href: "/" },
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
        open ? "translate-x-0" : "-translate-x-full"
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
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 gap-1">
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.href} 
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4">
          <Button className="w-full bg-emerald-700 hover:bg-emerald-800">
            Connect to Supabase
          </Button>
        </div>
      </div>
    </aside>
  );
}
