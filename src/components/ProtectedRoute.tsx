import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireBusinessOwner?: boolean;
}

export default function ProtectedRoute({ children, requireBusinessOwner = false }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Check if user is an admin first
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (adminData) {
            // User is an admin, redirect to admin dashboard
            window.location.href = '/admin/dashboard';
            return;
          }

          // Fetch user profile to get role
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('Profile fetch error:', profileError);
            setUserRole(null);
          } else {
            setUserRole(profile?.role || null);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          setUserRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  if (requireBusinessOwner && userRole !== 'business_owner') {
    return <Navigate to="/upgrade-to-business" replace />;
  }

  return <>{children}</>;
}