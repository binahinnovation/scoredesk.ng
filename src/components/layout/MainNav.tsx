
import { Button } from "@/components/ui/button";
import { Menu, Bell, User, LogOut, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useSchoolId } from "@/hooks/use-school-id";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MainNavProps {
  onMenuClick: () => void;
}

export function MainNav({ onMenuClick }: MainNavProps) {
  const { user, logout } = useAuth();
  const { schoolId } = useSchoolId();
  
  // Fetch school information and user's avatar (school logo)
  const { data: schoolInfo } = useQuery({
    queryKey: ['school-info', schoolId, user?.id],
    queryFn: async () => {
      if (!schoolId || !user?.id) return null;
      
      // Fetch school name
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('name')
        .eq('id', schoolId)
        .single();
      
      if (schoolError) {
        console.error('Error fetching school info:', schoolError);
        return null;
      }
      
      // Fetch user's avatar (school logo) from profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile avatar:', profileError);
      }
      
      const result = {
        name: schoolData?.name,
        logo_url: profileData?.avatar_url
      };
      
      console.log('School info fetched:', result);
      return result;
    },
    enabled: !!schoolId && !!user?.id
  });

  return (
    <header className="fixed top-0 z-40 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
         <div className="flex items-center space-x-3">
           <Link to="/" className="flex items-center space-x-3">
             {/* Original ScoreDesk Icon - Increased size */}
             <div className="bg-emerald-700 text-white p-2 rounded-md flex-shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                 <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
               </svg>
             </div>
             
             {/* ScoreDesk - School Name */}
             <span className="font-bold text-2xl text-emerald-700">
               ScoreDesk
               {schoolInfo && (
                 <span className="font-bold text-2xl text-emerald-700 ml-1">
                   - {schoolInfo.name}
                 </span>
               )}
             </span>
             
             {/* School Logo - After the text */}
             <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-emerald-600 flex-shrink-0">
               {schoolInfo?.logo_url ? (
                 <img 
                   src={schoolInfo.logo_url} 
                   alt={`${schoolInfo.name} logo`}
                   className="h-full w-full object-cover"
                   onError={(e) => {
                     console.log('School logo failed to load:', schoolInfo.logo_url);
                     e.currentTarget.style.display = 'none';
                   }}
                 />
               ) : (
                 <div className="h-full w-full bg-emerald-100 flex items-center justify-center">
                   <Building2 className="h-6 w-6 text-emerald-600" />
                 </div>
               )}
             </div>
           </Link>
         </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500"></span>
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium overflow-hidden">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile-settings" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="rounded-full" asChild>
                <Link to="/login">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium">
                    <User className="h-4 w-4" />
                  </div>
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
