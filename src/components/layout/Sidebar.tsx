
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, 
  Users, 
  User,
  Layers,
  FilePen,
  Lock,
  FileText,
  Palette,
  Key,
  Settings,
  ChevronLeft,
  ChevronRight,
  School,
  ChartBar,
  ExternalLink
} from "lucide-react";
import { usePermission } from "@/hooks/use-permission";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({ className, open, setOpen }: SidebarProps) {
  const { 
    hasPermission, 
    isAdmin, 
    canAccessUserManagement,
    canUploadResults,
    canGenerateScratchCards 
  } = usePermission();

  return (
    <div 
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-emerald-700 text-white transition-all duration-300 ease-in-out z-30",
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
          className="absolute -right-4 top-4 bg-emerald-700 rounded-full text-white hover:bg-emerald-600 shadow-md h-8 w-8"
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
                Management
              </h2>
              <div className="space-y-1">
                <NavLink to="/">
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start text-white hover:bg-emerald-600 hover:text-white",
                        isActive && "bg-emerald-800 text-white",
                        !open && "px-0 justify-center"
                      )}
                      size="sm"
                    >
                      <School className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                      <span className={cn("transition-all duration-300", 
                        open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                      )}>Dashboard</span>
                    </Button>
                  )}
                </NavLink>
                
                {canAccessUserManagement && (
                  <NavLink to="/user-management">
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-white hover:bg-emerald-600 hover:text-white",
                          isActive && "bg-emerald-800 text-white",
                          !open && "px-0 justify-center"
                        )}
                        size="sm"
                      >
                        <Users className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                        <span className={cn("transition-all duration-300", 
                          open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}>User Management</span>
                      </Button>
                    )}
                  </NavLink>
                )}

                {hasPermission('Student Management') && (
                  <NavLink to="/students">
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-white hover:bg-emerald-600 hover:text-white",
                          isActive && "bg-emerald-800 text-white",
                          !open && "px-0 justify-center"
                        )}
                        size="sm"
                      >
                        <User className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                        <span className={cn("transition-all duration-300", 
                          open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}>Student Management</span>
                      </Button>
                    )}
                  </NavLink>
                )}

                {hasPermission('Class/Subject Setup') && (
                  <NavLink to="/classes">
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-white hover:bg-emerald-600 hover:text-white",
                          isActive && "bg-emerald-800 text-white",
                          !open && "px-0 justify-center"
                        )}
                        size="sm"
                      >
                        <Layers className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                        <span className={cn("transition-all duration-300", 
                          open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}>Class & Subject</span>
                      </Button>
                    )}
                  </NavLink>
                )}
              </div>
            </div>
            
            <div className="px-3 py-2">
              <h2 className={cn(
                "mb-2 px-4 font-semibold tracking-tight transition-all duration-300",
                open ? "text-lg opacity-100" : "text-xs opacity-0 h-0"
              )}>
                Academic
              </h2>
              <div className="space-y-1">
                {canUploadResults && (
                  <NavLink to="/results">
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-white hover:bg-emerald-600 hover:text-white",
                          isActive && "bg-emerald-800 text-white",
                          !open && "px-0 justify-center"
                        )}
                        size="sm"
                      >
                        <FilePen className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                        <span className={cn("transition-all duration-300", 
                          open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}>Result Entry</span>
                      </Button>
                    )}
                  </NavLink>
                )}

                {hasPermission('Result Approval') && (
                  <NavLink to="/approval">
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-white hover:bg-emerald-600 hover:text-white",
                          isActive && "bg-emerald-800 text-white",
                          !open && "px-0 justify-center"
                        )}
                        size="sm"
                      >
                        <Lock className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                        <span className={cn("transition-all duration-300", 
                          open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}>Result Approval</span>
                      </Button>
                    )}
                  </NavLink>
                )}

                {hasPermission('Position & Ranking') && (
                  <NavLink to="/ranking">
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-white hover:bg-emerald-600 hover:text-white",
                          isActive && "bg-emerald-800 text-white",
                          !open && "px-0 justify-center"
                        )}
                        size="sm"
                      >
                        <BarChart3 className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                        <span className={cn("transition-all duration-300", 
                          open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}>Class Ranking</span>
                      </Button>
                    )}
                  </NavLink>
                )}

                {hasPermission('Report Card Designer') && (
                  <NavLink to="/reportcards">
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-white hover:bg-emerald-600 hover:text-white",
                          isActive && "bg-emerald-800 text-white",
                          !open && "px-0 justify-center"
                        )}
                        size="sm"
                      >
                        <FileText className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                        <span className={cn("transition-all duration-300", 
                          open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}>Report Card Designer</span>
                      </Button>
                    )}
                  </NavLink>
                )}
              </div>
            </div>

            <div className="px-3 py-2">
              <h2 className={cn(
                "mb-2 px-4 font-semibold tracking-tight transition-all duration-300",
                open ? "text-lg opacity-100" : "text-xs opacity-0 h-0"
              )}>
                Administration
              </h2>
              <div className="space-y-1">
                {hasPermission('School Branding') && (
                  <NavLink to="/branding">
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-white hover:bg-emerald-600 hover:text-white",
                          isActive && "bg-emerald-800 text-white",
                          !open && "px-0 justify-center"
                        )}
                        size="sm"
                      >
                        <Palette className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                        <span className={cn("transition-all duration-300", 
                          open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}>School Branding</span>
                      </Button>
                    )}
                  </NavLink>
                )}

                {canGenerateScratchCards && (
                  <NavLink to="/scratchcards">
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-white hover:bg-emerald-600 hover:text-white",
                          isActive && "bg-emerald-800 text-white",
                          !open && "px-0 justify-center"
                        )}
                        size="sm"
                      >
                        <Key className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                        <span className={cn("transition-all duration-300", 
                          open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}>Scratch Cards</span>
                      </Button>
                    )}
                  </NavLink>
                )}

                {hasPermission('Analytics Dashboard') && (
                  <NavLink to="/analytics">
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-white hover:bg-emerald-600 hover:text-white",
                          isActive && "bg-emerald-800 text-white",
                          !open && "px-0 justify-center"
                        )}
                        size="sm"
                      >
                        <ChartBar className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                        <span className={cn("transition-all duration-300", 
                          open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}>Analytics</span>
                      </Button>
                    )}
                  </NavLink>
                )}

                {hasPermission('Settings') && (
                  <NavLink to="/settings">
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start text-white hover:bg-emerald-600 hover:text-white",
                          isActive && "bg-emerald-800 text-white",
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
                )}
              </div>
            </div>

            <div className="px-3 py-2">
              <h2 className={cn(
                "mb-2 px-4 font-semibold tracking-tight transition-all duration-300",
                open ? "text-lg opacity-100" : "text-xs opacity-0 h-0"
              )}>
                Student Portal
              </h2>
              <div className="space-y-1">
                <a 
                  href="/student-portal" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-white hover:bg-emerald-600 hover:text-white",
                      !open && "px-0 justify-center"
                    )}
                    size="sm"
                  >
                    <ExternalLink className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                    <span className={cn("transition-all duration-300", 
                      open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                    )}>Result Portal</span>
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
