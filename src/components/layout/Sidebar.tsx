
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Wallet, 
  FileText, 
  Banknote,
  ExternalLink,
  Database,
  Settings, 
  HelpCircle, 
  LogOut 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({ className, open, setOpen }: SidebarProps) {
  const { logout } = useAuth();
  
  return (
    <div className={cn("pb-12 bg-[#023047] text-white", className)}>
      <div className="space-y-4 py-4">
        {/* User Profile Section */}
        <div className="px-6 py-4 flex flex-col items-center border-b border-white/10">
          <div className="h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
            M
          </div>
          <h3 className="font-semibold text-lg">Muhammad Ismail</h3>
          <p className="text-sm text-gray-300 mb-2">abberhismael@gmail.com</p>
          <span className="bg-teal-600 text-xs px-3 py-1 rounded-md">ADMIN</span>
        </div>
        
        <div className="px-3 py-2">
          <div className="space-y-1">
            {/* Ice Data Services */}
            <NavLink to="/ice-data" className="block">
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start py-6 rounded-md text-base",
                    isActive 
                      ? "bg-teal-600 text-white hover:bg-teal-700" 
                      : "text-white hover:bg-[#034567] hover:text-white"
                  )}
                  size="lg"
                >
                  <Database className="mr-3 h-5 w-5" />
                  Ice data services
                  <div className="ml-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                </Button>
              )}
            </NavLink>
            
            {/* Dashboard */}
            <NavLink to="/dashboard">
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start py-6 rounded-md text-base",
                    isActive 
                      ? "bg-teal-600 text-white hover:bg-teal-700" 
                      : "text-white hover:bg-[#034567] hover:text-white"
                  )}
                  size="lg"
                >
                  <LayoutDashboard className="mr-3 h-5 w-5" />
                  Dashboard
                </Button>
              )}
            </NavLink>
            
            {/* Wallet */}
            <NavLink to="/wallet">
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start py-6 rounded-md text-base",
                    isActive 
                      ? "bg-teal-600 text-white hover:bg-teal-700" 
                      : "text-white hover:bg-[#034567] hover:text-white"
                  )}
                  size="lg"
                >
                  <Wallet className="mr-3 h-5 w-5" />
                  Wallet
                </Button>
              )}
            </NavLink>
            
            {/* Transactions */}
            <NavLink to="/transactions">
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start py-6 rounded-md text-base",
                    isActive 
                      ? "bg-teal-600 text-white hover:bg-teal-700" 
                      : "text-white hover:bg-[#034567] hover:text-white"
                  )}
                  size="lg"
                >
                  <FileText className="mr-3 h-5 w-5" />
                  Transactions
                </Button>
              )}
            </NavLink>
            
            {/* Settlements */}
            <NavLink to="/settlements">
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start py-6 rounded-md text-base",
                    isActive 
                      ? "bg-teal-600 text-white hover:bg-teal-700" 
                      : "text-white hover:bg-[#034567] hover:text-white"
                  )}
                  size="lg"
                >
                  <Banknote className="mr-3 h-5 w-5" />
                  Settlements
                </Button>
              )}
            </NavLink>
            
            {/* Monnify Status */}
            <NavLink to="/monnify-status">
              {({ isActive }) => (
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start py-6 rounded-md text-base",
                    isActive 
                      ? "bg-teal-600 text-white hover:bg-teal-700" 
                      : "text-white hover:bg-[#034567] hover:text-white"
                  )}
                  size="lg"
                >
                  <ExternalLink className="mr-3 h-5 w-5" />
                  Monnify Status
                </Button>
              )}
            </NavLink>
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around py-4 bg-[#012437]">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-12 w-12 bg-[#023047] hover:bg-[#034567]"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full h-12 w-12 bg-[#023047] hover:bg-[#034567]"
            asChild
          >
            <NavLink to="/settings">
              <Settings className="h-6 w-6" />
            </NavLink>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-12 w-12 bg-[#023047] hover:bg-[#034567]"
            onClick={() => logout()}
          >
            <LogOut className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
