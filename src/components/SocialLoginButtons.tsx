import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function SocialLoginButtons() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(provider);
    
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
      toast({
        title: "Authentication Error",
        description: error.message || `Failed to sign in with ${provider}`,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleTwitterLogin = () => {
    toast({
      title: "Coming Soon",
      description: "Twitter/X login will be available soon. Please use email or other social options.",
    });
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin('google')}
        disabled={loading === 'google'}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin('facebook')}
        disabled={loading === 'facebook'}
      >
        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        {loading === 'facebook' ? 'Connecting...' : 'Continue with Facebook'}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleTwitterLogin}
      >
        <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Continue with X (Twitter)
      </Button>
    </div>
  );
}