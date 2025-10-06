import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserRole } from "@/hooks/use-user-role";
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
  ExternalLink,
  Mail,
  Send,
  Inbox,
  PenTool,
  Shield
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Sidebar({ className, open, setOpen }: SidebarProps) {
  const { hasPermission } = useUserRole();
  
  return (
    <div 
      className={cn(
        "fixed left-0 top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-emerald-700 text-white transition-all duration-300 ease-in-out z-30",
        // Responsive widths: smaller on mobile, standard on desktop
        open ? "w-48 sm:w-56 md:w-60 lg:w-64" : "w-12 sm:w-14 md:w-16",
        // Mobile behavior: overlay on small screens
        "lg:relative lg:translate-x-0",
        // Mobile overlay behavior
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}
    >
      <div className="relative h-full flex flex-col">
        {/* Toggle button */}
        <Button
          variant="ghost" 
          size="icon"
          onClick={() => setOpen && setOpen(!open)}
          className="absolute -right-3 top-4 bg-emerald-700 rounded-full text-white hover:bg-emerald-600 shadow-md h-7 w-7 sm:h-8 sm:w-8 z-40"
        >
          {open ? <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" /> : <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />}
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
                <NavLink to="/dashboard">
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
                
{hasPermission("User Management") && (
                  <NavLink to="/users">
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

{hasPermission("Student Management") && (
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

{hasPermission("Class/Subject Setup") && (
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
{hasPermission("Result Upload") && (
                  <NavLink to="/results/entry">
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

{hasPermission("Result Upload") && (
                  <NavLink to="/questions/submission">
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
                        )}>Question Papers</span>
                      </Button>
                    )}
                  </NavLink>
                )}

{hasPermission("Result Approval") && (
                  <NavLink to="/results/approval">
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

{hasPermission("Result Approval") && (
                  <NavLink to="/questions/management">
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
                        )}>Paper Management</span>
                      </Button>
                    )}
                  </NavLink>
                )}

{hasPermission("Position & Ranking") && (
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

{hasPermission("Report Card Designer") && (
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

                {hasPermission("Attendance Management") && (
                  <NavLink to="/attendance/mark">
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
                        )}>Mark Attendance</span>
                      </Button>
                    )}
                  </NavLink>
                )}

                {hasPermission("Attendance Management") && (
                  <NavLink to="/attendance/summary">
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
                        )}>Attendance Summary</span>
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
                Communication
              </h2>
              <div className="space-y-1">
                <NavLink to="/messages/inbox">
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
                      <Inbox className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                      <span className={cn("transition-all duration-300", 
                        open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                      )}>Inbox</span>
                    </Button>
                  )}
                </NavLink>

                <NavLink to="/messages/sent">
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
                      <Send className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                      <span className={cn("transition-all duration-300", 
                        open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                      )}>Sent</span>
                    </Button>
                  )}
                </NavLink>

                <NavLink to="/messages/drafts">
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
                      )}>Drafts</span>
                    </Button>
                  )}
                </NavLink>

                <NavLink to="/messages/compose">
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
                      <PenTool className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                      <span className={cn("transition-all duration-300", 
                        open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                      )}>Compose</span>
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
                Administration
              </h2>
              <div className="space-y-1">
{hasPermission("School Branding") && (
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

{hasPermission("Scratch Card Generator") && (
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

{hasPermission("Analytics Dashboard") && (
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

{hasPermission("Settings") && (
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

{hasPermission("Assessment Management") && (
                  <NavLink to="/settings/assessments">
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
                        )}>Assessment Settings</span>
                      </Button>
                    )}
                  </NavLink>
                )}

                {hasPermission("User Management") && (
                  <NavLink to="/admin/logs">
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
                        <Shield className={cn("h-4 w-4", open ? "mr-2" : "mr-0")} />
                        <span className={cn("transition-all duration-300", 
                          open ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                        )}>Audit Logs</span>
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
                  href="/student-results" 
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