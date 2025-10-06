
import { Button } from "@/components/ui/button";
import { Menu, Bell, User, LogOut, Building2, BookOpen } from "lucide-react";
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
      <div className="container flex h-14 sm:h-16 items-center px-2 sm:px-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-8 w-8 sm:h-10 sm:w-10" 
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
         <div className="flex items-center space-x-1 sm:space-x-3 min-w-0 flex-1">
           <Link to="/" className="flex items-center space-x-1 sm:space-x-3 min-w-0">
             {/* ScoreDesk Icon - Using BookOpen like login page */}
             <div className="bg-emerald-700 text-white p-1 sm:p-2 rounded-md flex-shrink-0">
               <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8" />
             </div>
             
             {/* ScoreDesk - School Name */}
             <div className="min-w-0 flex-shrink">
               <span className="font-bold text-sm sm:text-lg md:text-xl lg:text-2xl text-emerald-700 truncate">
                 ScoreDesk
               </span>
               {schoolInfo && (
                 <div className="hidden sm:block">
                   <span className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-emerald-700 ml-1 truncate">
                     - {schoolInfo.name}
                   </span>
                 </div>
               )}
               {schoolInfo && (
                 <div className="block sm:hidden">
                   <span className="font-bold text-xs text-emerald-700 ml-1 truncate">
                     - {schoolInfo.name.length > 12 ? schoolInfo.name.substring(0, 12) + '...' : schoolInfo.name}
                   </span>
                 </div>
               )}
             </div>
             
             {/* School Logo - After the text */}
             <div className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-full overflow-hidden border-2 border-emerald-600 flex-shrink-0">
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
                   <Building2 className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-emerald-600" />
                 </div>
               )}
             </div>
           </Link>
         </div>
        <div className="flex items-center justify-end space-x-1 sm:space-x-2 md:space-x-4">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500"></span>
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium overflow-hidden text-xs sm:text-sm">
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-sm">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile-settings" className="cursor-pointer text-sm">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 sm:h-10 sm:w-10" asChild>
                <Link to="/login">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
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
