import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, MapPin, Phone, Globe, ArrowLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { formatDateWithOrdinal } from "@/lib/dateUtils";

interface Business {
  id: string;
  name: string;
  description?: string;
  category: string;
  address?: string;
  towns?: string;
  province_district?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  image_url?: string;
  rating: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user_id: string;
}

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchBusiness();
      fetchReviews();
    }
    
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [id]);

  const fetchBusiness = async () => {
    try {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setBusiness(data);
    } catch (error) {
      console.error("Error fetching business:", error);
      toast({
        title: "Error",
        description: "Business not found.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("business_reviews")
        .select("*")
        .eq("business_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const submitReview = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to leave a review.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("business_reviews")
        .insert({
          business_id: id,
          user_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your review has been submitted!",
      });

      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
      fetchBusiness(); // Refresh to update rating
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: error.message.includes("duplicate") 
          ? "You have already reviewed this business."
          : "Failed to submit review.",
        variant: "destructive",
      });
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground"
        } ${interactive ? "cursor-pointer hover:scale-110" : ""}`}
        onClick={interactive && onRatingChange ? () => onRatingChange(i + 1) : undefined}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Directory
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Info */}
          <div className="lg:col-span-2 space-y-6">
            {business.image_url && (
              <div className="relative">
                <img
                  src={`${business.image_url}?w=290&h=290&fit=crop`}
                  alt={business.name}
                  className="w-full h-64"
                  style={{ objectFit: 'none', objectPosition: 'top left' }}
                />
              </div>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl">{business.name}</CardTitle>
                    <Badge variant="outline" className="mt-2">{business.category}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {renderStars(business.rating)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {business.rating.toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {business.description && (
                  <p className="text-muted-foreground">{business.description}</p>
                )}
                
                <div className="space-y-3">
                  {business.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{business.address}, {business.towns}, {business.province_district} {business.zip_code}</span>
                    </div>
                  )}
                  
                  {business.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{business.phone}</span>
                    </div>
                  )}
                  
                  {business.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {formatDateWithOrdinal(review.created_at)}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
                
                {reviews.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to review this business!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review Form */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Leave a Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex gap-1">
                        {renderStars(newReview.rating, true, (rating) => 
                          setNewReview(prev => ({ ...prev, rating }))
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Comment (optional)</label>
                      <Textarea
                        placeholder="Share your experience..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        rows={4}
                      />
                    </div>
                    
                    <Button onClick={submitReview} className="w-full">
                      Submit Review
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Please sign in to leave a review
                    </p>
                    <Button asChild>
                      <Link to="/auth/signin">Sign In</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}