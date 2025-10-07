import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import { Smartphone, ChevronDown, Menu } from "lucide-react";
import MyanShopsLogo from "@/assets/MyanShopsLogo.svg";
import { useAuth } from "@/hooks/useAuth";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthModal from "./AuthModal";

export const Navbar = React.memo(() => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const buttonTexts = React.useMemo(() => [
    "Get Website + POS",
    "Free Business Listing"
  ], []);

  const priceTexts = React.useMemo(() => [
    "$10/month",
    "$5/year"
  ], []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navbar border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 relative z-50 md:ml-16">
              <span className="text-xl md:text-2xl font-anton font-normal text-gray-600">
                GoLocalSG<span className="text-base md:text-lg">.com</span>
              </span>
            </Link>
          </div>

          {/* Desktop Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/find-shops"
              className="text-nav-text hover:text-nav-text/80 font-medium transition-colors"
            >
              Find Shops
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default" size="sm" className="flex items-center space-x-1">
                    <span>Dashboard</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" onClick={() => {/* Navigate to wishlists section */}} className="w-full">
                      Wishlists
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/list-&-get-pos-website" className="w-full">
                      Get Website + POS
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setAuthModalOpen(true)}
              >
                Sign in / Register
              </Button>
            )}
            
            <div className="relative">
              <Link to="/list-&-get-pos-website" className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium h-10 flex items-center overflow-hidden">
                <Swiper
                  direction="vertical"
                  spaceBetween={0}
                  slidesPerView={1}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  className="h-6 w-full"
                  modules={[Autoplay]}
                >
                  {buttonTexts.map((text, index) => (
                    <SwiperSlide key={index} className="h-6 flex items-center">
                      <span className="text-sm font-medium text-center w-full">
                        {text}
                      </span>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Link>
              <div className="absolute -top-2 -right-1 bg-yellow-400 text-black text-xs px-2 py-0 rounded-md overflow-hidden">
                <Swiper
                  direction="vertical"
                  spaceBetween={0}
                  slidesPerView={1}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  className="h-4 w-full"
                  modules={[Autoplay]}
                >
                  {priceTexts.map((price, index) => (
                    <SwiperSlide key={index} className="h-4 flex items-center">
                      <span className="text-xs font-medium text-center w-full">
                        {price}
                      </span>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile CTA Button - Always Visible */}
            <div className="relative">
              <Link to="/list-&-get-pos-website" className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded-lg font-medium h-9 flex items-center overflow-hidden">
                <Swiper
                  direction="vertical"
                  spaceBetween={0}
                  slidesPerView={1}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  className="h-5 w-full"
                  modules={[Autoplay]}
                >
                  {buttonTexts.map((text, index) => (
                    <SwiperSlide key={index} className="h-5 flex items-center">
                      <span className="text-xs font-medium text-center w-full">
                        {text}
                      </span>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Link>
              <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1 py-0 rounded-md overflow-hidden">
                <Swiper
                  direction="vertical"
                  spaceBetween={0}
                  slidesPerView={1}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                  loop={true}
                  className="h-3 w-full"
                  modules={[Autoplay]}
                >
                  {priceTexts.map((price, index) => (
                    <SwiperSlide key={index} className="h-3 flex items-center">
                      <span className="text-xs font-medium text-center w-full">
                        {price}
                      </span>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
      />
    </nav>
  );
});

Navbar.displayName = "Navbar";