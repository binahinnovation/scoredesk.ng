
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  Users, 
  School,
  ChevronLeft,
  ChevronRight,
  Wallet,
  ReceiptText,
  Download,
  Activity,
  Database
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({ className, open, setOpen }: SidebarProps) {
  return (
    <div 
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-primary text-white transition-all duration-300 ease-in-out z-30",
        open ? "w-64" : "w-16",
        className
      )}
    >
      <div className="relative h-full flex flex-col">
        {/* Toggle button */}
        <Button
          variant="ghost" 
          size="icon"
          onClick={() => setOpen && setOpen(!open)}
          className="absolute -right-4 top-4 bg-primary rounded-full text-white hover:bg-primary/90 shadow-md h-8 w-8"
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
        
        <ScrollArea className="flex-grow">
          <div className="space-y-2 py-6">
            <div className="px-3 py-2">
              <h2 className={cn(
                "mb-2 px-4 font-semibold tracking-tight transition-all duration-300",
                open ? "text-lg opacity-100" : "text-xs opacity-0 h-0"
              )}>
                Dashboard
              </h2>
              <div className="space-y-1">
                <NavLink to="/dashboard">
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-white hover:bg-primary/80",
                        !open && "px-0 justify-center"
                      )}
                      size="sm"
                    >
                      <BarChart3 className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                      <span className={cn("transition-all duration-300", 
                        open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                      )}>Dashboard</span>
                    </Button>
                  )}
                </NavLink>
                
                <NavLink to="/wallet">
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-white hover:bg-primary/80",
                        !open && "px-0 justify-center"
                      )}
                      size="sm"
                    >
                      <Wallet className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                      <span className={cn("transition-all duration-300", 
                        open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                      )}>Wallet</span>
                    </Button>
                  )}
                </NavLink>

                <NavLink to="/transactions">
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-white hover:bg-primary/80",
                        !open && "px-0 justify-center"
                      )}
                      size="sm"
                    >
                      <ReceiptText className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                      <span className={cn("transition-all duration-300", 
                        open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                      )}>Transactions</span>
                    </Button>
                  )}
                </NavLink>

                <NavLink to="/settlements">
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-white hover:bg-primary/80",
                        !open && "px-0 justify-center"
                      )}
                      size="sm"
                    >
                      <Download className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                      <span className={cn("transition-all duration-300", 
                        open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                      )}>Settlements</span>
                    </Button>
                  )}
                </NavLink>

                <NavLink to="/monnify">
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-white hover:bg-primary/80",
                        !open && "px-0 justify-center"
                      )}
                      size="sm"
                    >
                      <Activity className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                      <span className={cn("transition-all duration-300", 
                        open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                      )}>Monnify Status</span>
                    </Button>
                  )}
                </NavLink>

                <NavLink to="/icedata">
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-white hover:bg-primary/80",
                        !open && "px-0 justify-center"
                      )}
                      size="sm"
                    >
                      <Database className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                      <span className={cn("transition-all duration-300", 
                        open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                      )}>Ice Data Services</span>
                    </Button>
                  )}
                </NavLink>
              </div>
            </div>
            
            <div className="px-3 py-2">
              <h2 className={cn(
                "mb-2 px-4 font-semibold tracking-tight transition-all duration-300",
                open ? "text-lg opacity-100" : "text-xs opacity-0 h-0"
              )}>
                Settings
              </h2>
              <div className="space-y-1">
                <NavLink to="/settings">
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-white hover:bg-primary/80",
                        !open && "px-0 justify-center"
                      )}
                      size="sm"
                    >
                      <Settings className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                      <span className={cn("transition-all duration-300", 
                        open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                      )}>Settings</span>
                    </Button>
                  )}
                </NavLink>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
