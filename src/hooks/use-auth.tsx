
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '@/types/user';

export type SchoolData = {
  schoolName: string;
  fullName: string;
};

// Email validation function
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
const isStrongPassword = (password: string): boolean => {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /\d/.test(password);
};

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user || null);
          if (session?.user) {
            await fetchUserRole(session.user.id);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setUser(session?.user || null);
          if (session?.user) {
            await fetchUserRole(session.user.id);
          } else {
            setUserRole(null);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_role', { user_id_param: userId });

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('Subject Teacher'); // Default role
      } else if (data) {
        setUserRole(data as UserRole);
      } else {
        setUserRole('Subject Teacher'); // Default role
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('Subject Teacher'); // Default role
    }
  };

  const login = async (email: string, password: string) => {
    try {
      if (!isValidEmail(email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return { success: false, error: "Invalid email format" };
      }

      if (!password) {
        toast({
          title: "Missing Password",
          description: "Please enter your password.",
          variant: "destructive",
        });
        return { success: false, error: "Password required" };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        let friendlyMessage = "Login failed. Please check your credentials.";
        
        if (error.message.includes("Invalid login credentials")) {
          friendlyMessage = "Invalid email or password. Please try again.";
        } else if (error.message.includes("Email not confirmed")) {
          friendlyMessage = "Please check your email and confirm your account.";
        }

        toast({
          title: "Login failed",
          description: friendlyMessage,
          variant: "destructive",
        });
        return { success: false, error: friendlyMessage };
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back to ScoreDesk!",
      });
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: "Unexpected error occurred" };
    }
  };

  const signup = async (email: string, password: string, schoolData: SchoolData) => {
    try {
      if (!isValidEmail(email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return { success: false, error: "Invalid email format" };
      }

      if (!isStrongPassword(password)) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 8 characters with uppercase, lowercase, and numbers.",
          variant: "destructive",
        });
        return { success: false, error: "Password too weak" };
      }

      if (!schoolData.fullName.trim() || !schoolData.schoolName.trim()) {
        toast({
          title: "Missing Information",
          description: "Please provide both your full name and school name.",
          variant: "destructive",
        });
        return { success: false, error: "Missing required information" };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: schoolData.fullName.trim(),
            school_name: schoolData.schoolName.trim(),
          },
        },
      });

      if (error) {
        let friendlyMessage = "Signup failed. Please try again.";
        
        if (error.message.includes("User already registered")) {
          friendlyMessage = "An account with this email already exists. Please login instead.";
        } else if (error.message.includes("Password")) {
          friendlyMessage = "Password does not meet requirements.";
        }

        toast({
          title: "Signup failed",
          description: friendlyMessage,
          variant: "destructive",
        });
        return { success: false, error: friendlyMessage };
      }

      toast({
        title: "Account created",
        description: "Welcome to ScoreDesk! Please check your email for verification.",
      });
      return { success: true, data };
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: "Unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Logout failed",
          description: "Failed to logout. Please try again.",
          variant: "destructive",
        });
        return { success: false, error: "Logout failed" };
      }
      
      setUser(null);
      setUserRole(null);
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
      return { success: true };
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
      return { success: false, error: "Unexpected error occurred" };
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
