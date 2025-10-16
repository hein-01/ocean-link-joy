import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BusinessDetail from "./pages/BusinessDetail";
import BusinessDirectory from "./pages/BusinessDirectory";
import FindShops from "./pages/FindShops";
import ListBusiness from "./pages/ListBusiness";
import ServiceSelection from "./pages/ServiceSelection";
import FutsalCourtListing from "./pages/FutsalCourtListing";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import SavedListings from "./pages/SavedListings";
import AdminAuth from "./pages/admin/AdminAuth";
import AdminAuthCallback from "./pages/admin/AdminAuthCallback";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import ListAndGetPOS from "./pages/ListAndGetPOS";
import UserDashboard from "./pages/UserDashboard";
import MobileNavBar from "./components/MobileNavBar";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient(); // Refresh trigger

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <div className="pb-[75px] md:pb-0">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/businesses" element={<BusinessDirectory />} />
            <Route path="/find-shops" element={<FindShops />} />
            <Route path="/business/:id" element={<BusinessDetail />} />
            <Route path="/list-business" element={<ListBusiness />} />
            <Route path="/service-selection" element={<ServiceSelection />} />
            <Route path="/list-futsal-court" element={<FutsalCourtListing />} />
            <Route path="/auth/signin" element={<Auth />} />
            <Route path="/auth/signup" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/@admin/login" element={<AdminAuth />} />
            <Route path="/@admin/signup" element={<AdminAuth />} />
            <Route path="/@admin/callback" element={<AdminAuthCallback />} />
            <Route path="/admin/dashboard" element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } />
            <Route path="/list-&-get-pos-website" element={<ListAndGetPOS />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/saved" element={
              <ProtectedRoute>
                <SavedListings />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <MobileNavBar />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
