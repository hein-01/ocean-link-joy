import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function AdminAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { provisionAdminUser } = useAdminAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session?.user) {
          // Check if user is already an admin
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single();

          if (!adminUser) {
            // Provision admin user
            await provisionAdminUser(data.session.user.id);
          }

          setStatus('success');
          setMessage('Admin account confirmed successfully!');
          
          toast({
            title: "Welcome!",
            description: "Your admin account has been confirmed. Redirecting to dashboard...",
          });

          // Redirect to admin dashboard after a short delay
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 2000);
        } else {
          throw new Error('No user session found');
        }
      } catch (error: any) {
        console.error('Admin auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to confirm admin account');
        
        toast({
          title: "Confirmation Failed",
          description: "There was an error confirming your admin account. Please try again.",
          variant: "destructive",
        });

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/@admin/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, toast, provisionAdminUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold">Admin Portal</span>
          </div>
          <CardTitle className="text-center">
            {status === 'loading' && 'Confirming Account...'}
            {status === 'success' && 'Account Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Please wait while we confirm your admin account.'}
            {status === 'success' && 'Your admin account has been successfully confirmed.'}
            {status === 'error' && 'There was an issue confirming your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === 'loading' && (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
          {status === 'success' && (
            <CheckCircle className="h-8 w-8 text-green-600" />
          )}
          {status === 'error' && (
            <XCircle className="h-8 w-8 text-red-600" />
          )}
          
          <p className="text-center text-sm text-muted-foreground">
            {message}
          </p>
          
          {status === 'success' && (
            <p className="text-center text-xs text-muted-foreground">
              Redirecting to admin dashboard...
            </p>
          )}
          
          {status === 'error' && (
            <p className="text-center text-xs text-muted-foreground">
              Redirecting to login page...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}