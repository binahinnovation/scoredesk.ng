import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '@/types/user';

export type SchoolData = {
  schoolName: string;
  fullName: string;
};

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          // Fetch user role when session changes
          fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    // Check current session on mount
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        if (session?.user) {
          // Fetch user role on initial load
          await fetchUserRole(session.user.id);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      // Using raw SQL query to avoid TypeScript errors with unrecognized tables
      const { data, error } = await supabase
        .rpc('get_user_role', { user_id_param: userId });

      if (error) {
        console.error('Error fetching user role:', error);
      } else if (data) {
        setUserRole(data as UserRole);
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Special handling for super admin emails
      const superAdmins = ['deepmindfx01@gmail.com', 'aleeyuwada01@gmail.com'];
      if (superAdmins.includes(email)) {
        // For demo purposes, we'll automatically assign the Principal role
        // In a real application, you would validate this against a secure list
        console.log('Logging in as super admin');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back to ScoreDesk!",
      });
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const signup = async (email: string, password: string, schoolData: SchoolData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: schoolData.fullName,
            school_name: schoolData.schoolName,
          },
        },
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }

      toast({
        title: "Account created",
        description: "Welcome to ScoreDesk!",
      });
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Logout failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }
      
      setUser(null);
      setUserRole(null);
      navigate('/login');
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    userRole,
    loading,
    login,
    signup,
    logout,
  };
}
