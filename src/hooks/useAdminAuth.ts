import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AdminProfile {
  id: string;
  user_id: string;
  admin_role: string;
  two_factor_enabled?: boolean;
  two_factor_secret?: string;
  created_at: string;
  updated_at: string;
}

export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchAdminProfile(session.user.id);
          }, 0);
        } else {
          setAdminProfile(null);
          setLoading(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAdminProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAdminProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching admin profile:', error);
        setAdminProfile(null);
      } else {
        setAdminProfile(data);
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      setAdminProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateAdminProfile = async (updates: Partial<AdminProfile>) => {
    if (!user || !adminProfile) return;

    try {
      const { error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Refresh profile
      await fetchAdminProfile(user.id);
    } catch (error) {
      console.error('Error updating admin profile:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state
      localStorage.removeItem('supabase.auth.token');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

      await supabase.auth.signOut({ scope: 'global' });
      
      // Force redirect to admin login
      window.location.href = '/@admin/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const checkAdminRateLimit = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_admin_rate_limit', { 
        user_email: email 
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Admin rate limit check error:', error);
      return true; // Allow if check fails
    }
  };

  const logAdminLoginAttempt = async (email: string, success: boolean) => {
    try {
      await supabase.rpc('log_admin_login_attempt', {
        user_email: email,
        attempt_success: success
      });
    } catch (error) {
      console.error('Error logging admin login attempt:', error);
    }
  };

  const provisionAdminUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert({
          user_id: userId,
          admin_role: 'admin'
        });

      if (error) throw error;
      
      // Also create profile entry
      await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          role: 'admin'
        });

      await fetchAdminProfile(userId);
    } catch (error) {
      console.error('Error provisioning admin user:', error);
      throw error;
    }
  };

  return {
    user,
    session,
    adminProfile,
    loading,
    updateAdminProfile,
    signOut,
    checkAdminRateLimit,
    logAdminLoginAttempt,
    provisionAdminUser,
    isSuperAdmin: adminProfile?.admin_role === 'super_admin',
    isAdmin: adminProfile?.admin_role === 'admin',
    isModerator: adminProfile?.admin_role === 'moderator',
    isAuthenticated: !!user && !!adminProfile
  };
}