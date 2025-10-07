import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Compass, ArrowRight } from "lucide-react";
import searchIcon from "../assets/search-icon-new.png";
import gobotGif from "../assets/gobot-animation.gif";
import gobotNewGif from "../assets/gobot-updated.gif";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import BusinessDirectory from "./BusinessDirectory";
import PopularBusinesses from "@/components/PopularBusinesses";
import Footer from "@/components/Footer";
import MobileNavBar from "@/components/MobileNavBar";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
// Import hero background images with error handling
const heroBg1 = "https://github.com/hein-01/mysvgs/raw/552eaf7b2405ff01d6ea749d1f165971814ead9b/banner_image_desktop_01_1920_350.png";
const heroBg2 = "https://github.com/hein-01/mysvgs/raw/552eaf7b2405ff01d6ea749d1f165971814ead9b/banner_image_desktop_02_1920_350.png";
const heroBg3 = "https://github.com/hein-01/mysvgs/raw/552eaf7b2405ff01d6ea749d1f165971814ead9b/banner_image_desktop_03_1920_350.png";
const heroBgMobile1 = "https://raw.githubusercontent.com/hein-01/mysvgs/552eaf7b2405ff01d6ea749d1f165971814ead9b/banner_image_mobile_01_420w_300h.png";
const heroBgMobile2 = "https://github.com/hein-01/mysvgs/raw/552eaf7b2405ff01d6ea749d1f165971814ead9b/banner_image_mobile_02_420w_300h.png";
const heroBgMobile3 = "https://raw.githubusercontent.com/hein-01/mysvgs/552eaf7b2405ff01d6ea749d1f165971814ead9b/banner_image_mobile_03_420w_300h.png";

// Mobile slider image URLs
const mobileSlider1 = "https://github.com/hein-01/mysvgs/raw/1df6944ef5b84ea6383de1af9e25c88273798a99/Mizu-01-280w-400h.png";
const mobileSlider2 = "https://github.com/hein-01/mysvgs/raw/1df6944ef5b84ea6383de1af9e25c88273798a99/Mizu-02-280w-400h.png";
const mobileSlider3 = "https://github.com/hein-01/mysvgs/raw/1df6944ef5b84ea6383de1af9e25c88273798a99/Mizu-03-280w-400h.png";
const Index = () => {
  console.log('Index component is rendering...'); // Debug log
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("product");
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const navigate = useNavigate();
  const heroBackgrounds = [heroBg1, heroBg2, heroBg3];
  const heroBackgroundsMobile = [heroBgMobile1, heroBgMobile2, heroBgMobile3];
  const categories = [{
    value: "product",
    label: "Find Product"
  }, {
    value: "service",
    label: "Find Service"
  }, {
    value: "business",
    label: "Find Business"
  }];
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex(prev => (prev + 1) % heroBackgrounds.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/find-shops?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  console.log('Index component returning JSX...'); // Debug log

  return <div className="min-h-screen bg-background pt-16 overflow-x-hidden">
      <Navbar />
      
      {/* Hero Banner Section */}
      <section className="relative h-[300px] md:h-[350px] px-4 overflow-visible mb-8">
        {/* Background Images Slider */}
        <div className="absolute inset-0">
          {/* Desktop Background Images */}
          {heroBackgrounds.map((bg, index) => <div key={`desktop-${index}`} className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 hidden md:block ${index === currentBgIndex ? 'opacity-100' : 'opacity-0'}`} style={{
          backgroundImage: `url(${bg})`
        }} />)}
          {/* Mobile Background Images */}
          {heroBackgroundsMobile.map((bg, index) => <div key={`mobile-${index}`} className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 block md:hidden ${index === currentBgIndex ? 'opacity-100' : 'opacity-0'}`} style={{
          backgroundImage: `url(${bg})`
        }} />)}
          
        </div>
        <div className="container mx-auto text-center relative z-10">
        </div>
        
        {/* Search Bar - positioned extending below hero */}
        <div className="absolute left-4 right-4 top-full transform -translate-y-1/2 z-20">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-2 flex items-center">
            <div className="bg-yellow-400 rounded-l-md overflow-hidden">
              <Swiper direction="vertical" spaceBetween={0} slidesPerView={1} autoplay={{
              delay: 2000,
              disableOnInteraction: false
            }} loop={true} className="h-10 w-full" modules={[Autoplay]}>
                {categories.map(category => <SwiperSlide key={category.value} className="h-10 flex items-center">
                     <button onClick={() => setSelectedCategory(category.value)} className={`w-full h-full text-black font-medium text-xs sm:text-sm flex items-center justify-center px-1 sm:px-4 ${selectedCategory === category.value ? 'bg-yellow-500' : 'bg-yellow-400'}`}>
                      {category.label}
                    </button>
                  </SwiperSlide>)}
              </Swiper>
            </div>
            
            <div className="flex-1 relative">
              <Input type="text" placeholder="Search by business name, etc" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()} className="w-full border border-[#F5F4F8] border-l-0 hover:border-l-0 focus:border-l-0 rounded-l-none text-gray-600 placeholder-gray-400 focus-visible:ring-0 text-sm sm:text-base placeholder:text-xs sm:placeholder:text-sm pr-12" />
              <button onClick={handleSearchSubmit} className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 rounded-md flex items-center justify-center hover:bg-primary hover:bg-opacity-10 active:bg-primary active:bg-opacity-10 transition-colors duration-200">
                <ArrowRight className="h-6 w-6 text-primary hover:text-white active:text-white transition-colors duration-200" />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Find a shop/Start your online shop Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="relative overflow-hidden bg-white dark:bg-white rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm">
            
            <div className="relative z-10 p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
              
              {/* Mobile Layout - Reorganized: text, slider, buttons */}
              <div className="flex lg:hidden flex-col items-center gap-6 w-full">
                
                {/* GOBOT GIF */}
                <div className="flex-shrink-0 animate-scale-in">
                  <div className="animated-gradient-border">
                    <img src={gobotNewGif} alt="GOBOT Animation" className="w-[150px] h-[150px] rounded-full object-cover" />
                  </div>
                </div>
                
                {/* Centered Text */}
                <h2 className="text-lg bg-white bg-gradient-to-r from-slate-600 via-purple-600 to-slate-600 dark:from-gray-300 dark:via-purple-300 dark:to-gray-300 bg-clip-text text-transparent mb-4 leading-relaxed px-4 rounded-lg md:text-xl font-bold text-center py-0">
                  Find a business or<br className="sm:hidden" /> Start your online business!
                </h2>
                
                {/* Mobile Image Slider */}
                <div className="w-full -mx-6 md:mx-0">
                  <Swiper spaceBetween={0} slidesPerView={1} centeredSlides={false} autoplay={{
                  delay: 4500,
                  disableOnInteraction: false
                }} modules={[Autoplay]} className="mobile-business-slider px-0">
                    <SwiperSlide>
                      <div className="h-[400px] rounded-none md:rounded-xl overflow-hidden shadow-md w-full transition-all duration-300 md:hover:scale-105">
                      <img src={mobileSlider1} alt="Local business directory app interface" className="w-full h-full object-cover" />
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className="h-[400px] rounded-none md:rounded-xl overflow-hidden shadow-md w-full transition-all duration-300 md:hover:scale-105">
                      <img src={mobileSlider2} alt="Small business owner managing online store" className="w-full h-full object-cover" />
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className="h-[400px] rounded-none md:rounded-xl overflow-hidden shadow-md w-full transition-all duration-300 md:hover:scale-105">
                      <img src={mobileSlider3} alt="Modern POS system interface" className="w-full h-full object-cover" />
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </div>
                
                {/* CTA Buttons at Bottom */}
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <Button className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white px-6 py-3 rounded-xl font-medium text-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                    Find Shops
                  </Button>
                  <Button variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white px-6 py-3 rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm" asChild>
                    <Link to="/list-business">
                      List your business
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Desktop Layout - New reorganized layout */}
              <div className="hidden lg:flex flex-col items-center gap-6 w-full">
                
                {/* GOBOT GIF */}
                <div className="flex-shrink-0 animate-scale-in">
                  <div className="animated-gradient-border">
                    <img src={gobotNewGif} alt="GOBOT Animation" className="w-[150px] h-[150px] rounded-full object-cover" />
                  </div>
                </div>
                
                {/* Centered Heading */}
                <h2 className="text-2xl xl:text-3xl font-bold bg-white bg-gradient-to-r from-slate-600 via-purple-600 to-slate-600 dark:from-gray-300 dark:via-purple-300 dark:to-gray-300 bg-clip-text text-transparent mb-4 leading-relaxed text-center px-4 py-2 rounded-lg">
                  Find a business or Start your online business!
                </h2>
                
                {/* Desktop Image Slider */}
                <div className="px-2 w-full max-w-3xl">
                  <Swiper spaceBetween={16} slidesPerView={1.8} centeredSlides={true} autoplay={{
                  delay: 4500,
                  disableOnInteraction: false
                }} modules={[Autoplay]} className="desktop-business-slider">
                    <SwiperSlide>
                      <div className="h-[300px] rounded-xl overflow-hidden shadow-md w-full transition-all duration-300 hover:scale-105">
                        <img src={mobileSlider1} alt="Local business directory app interface" className="w-full h-full object-contain" />
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className="h-[300px] rounded-xl overflow-hidden shadow-md w-full transition-all duration-300 hover:scale-105">
                        <img src={mobileSlider2} alt="Small business owner managing online store" className="w-full h-full object-contain" />
                      </div>
                    </SwiperSlide>
                    <SwiperSlide>
                      <div className="h-[300px] rounded-xl overflow-hidden shadow-md w-full transition-all duration-300 hover:scale-105">
                        <img src={mobileSlider3} alt="Modern POS system interface" className="w-full h-full object-contain" />
                      </div>
                    </SwiperSlide>
                  </Swiper>
                </div>
                
                {/* Desktop CTA Buttons below slider */}
                <div className="flex flex-row gap-4 mt-4">
                  <Button className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white px-6 py-3 rounded-xl font-medium text-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                    Find Shops
                  </Button>
                  <Button variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white px-6 py-3 rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm" asChild>
                    <Link to="/list-business">
                      List your business
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Popular Categories</h2>
          
          <div className="relative group overflow-hidden">
            <Swiper spaceBetween={15} slidesPerView="auto" loop={true} autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            reverseDirection: false
          }} navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom'
          }} allowTouchMove={true} grabCursor={true} touchRatio={1} modules={[Autoplay, Navigation]} className="popular-categories-swiper">
              {[{
              id: 1,
              image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=310&h=160&fit=crop",
              link: "https://example.com/category1"
            }, {
              id: 2,
              image: "https://images.unsplash.com/photo-1509316975850-ff9c5bee0cd9?w=310&h=160&fit=crop",
              link: "https://example.com/category2"
            }, {
              id: 3,
              image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=310&h=160&fit=crop",
              link: "https://example.com/category3"
            }, {
              id: 4,
              image: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=310&h=160&fit=crop",
              link: "https://example.com/category4"
            }, {
              id: 5,
              image: "https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=310&h=160&fit=crop",
              link: "https://example.com/category5"
            }, {
              id: 6,
              image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=310&h=160&fit=crop",
              link: "https://example.com/category6"
            }, {
              id: 7,
              image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=310&h=160&fit=crop",
              link: "https://example.com/category7"
            }, {
              id: 8,
              image: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=310&h=160&fit=crop",
              link: "https://example.com/category8"
            }, {
              id: 9,
              image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=310&h=160&fit=crop",
              link: "https://example.com/category9"
            }, {
              id: 10,
              image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=310&h=160&fit=crop",
              link: "https://example.com/category10"
            }, {
              id: 11,
              image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=310&h=160&fit=crop",
              link: "https://example.com/category11"
            }, {
              id: 12,
              image: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=310&h=160&fit=crop",
              link: "https://example.com/category12"
            }].map(category => <SwiperSlide key={category.id} className="!w-[280px] sm:!w-[310px]">
                  <a href={category.link} target="_blank" rel="noopener noreferrer" className="block relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
                    <img src={category.image} alt={`Category ${category.id}`} className="w-full h-[160px] object-cover group-hover:scale-105 transition-transform duration-300" />
                  </a>
                </SwiperSlide>)}
            </Swiper>
            
            {/* Custom Navigation Buttons */}
            <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            
            <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Popular Products</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {[{
            id: 1,
            image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=320&h=70&fit=crop",
            name: "Laptops",
            bgColor: "bg-pink-500",
            link: "#laptops"
          }, {
            id: 2,
            image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=320&h=70&fit=crop",
            name: "MacBooks",
            bgColor: "bg-pink-500",
            link: "#macbooks"
          }, {
            id: 3,
            image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=320&h=70&fit=crop",
            name: "Gaming",
            bgColor: "bg-pink-500",
            link: "#gaming"
          }, {
            id: 4,
            image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=320&h=70&fit=crop",
            name: "Workstations",
            bgColor: "bg-gradient-to-r from-orange-400 to-orange-500",
            link: "#workstations"
          }, {
            id: 5,
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=320&h=70&fit=crop",
            name: "Desks",
            bgColor: "bg-gradient-to-r from-teal-400 to-orange-400",
            link: "#desks"
          }, {
            id: 6,
            image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=320&h=70&fit=crop",
            name: "Phones",
            bgColor: "bg-gradient-to-r from-teal-500 to-orange-500",
            link: "#phones"
          }, {
            id: 7,
            image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=320&h=70&fit=crop",
            name: "Tablets",
            bgColor: "bg-gradient-to-r from-orange-500 to-orange-600",
            link: "#tablets"
          }, {
            id: 8,
            image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=320&h=70&fit=crop",
            name: "Audio",
            bgColor: "bg-gradient-to-r from-teal-400 to-orange-400",
            link: "#audio"
          }, {
            id: 9,
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=320&h=70&fit=crop",
            name: "Furniture",
            bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
            link: "#furniture"
          }, {
            id: 10,
            image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=320&h=70&fit=crop",
            name: "Appliances",
            bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
            link: "#appliances"
          }, {
            id: 11,
            image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=320&h=70&fit=crop",
            name: "Home",
            bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
            link: "#home"
          }, {
            id: 12,
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=320&h=70&fit=crop",
            name: "Footwear",
            bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
            link: "#footwear"
          }].map(product => <a key={product.id} href={product.link} className="group relative rounded-lg overflow-hidden shadow-lg cursor-pointer block transition-all duration-300 hover:ring-4 hover:ring-primary">
                <img src={product.image} alt={product.name} className="w-full h-[70px] object-cover" />
                <div className="absolute inset-0 flex flex-col justify-between p-3 text-white">
                  <div>
                    <h3 className="text-sm font-semibold">{product.name}.</h3>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="underline">See Shops</span>
                    <svg className="w-3 h-3 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>)}
          </div>
          
          {/* Full Width Banner */}
          <div className="mt-2.5">
            <a href="/find-shops" className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer group block w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-80"></div>
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1280&h=35&fit=crop" alt="Full width banner" className="w-full h-[35px] object-cover" />
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <h3 className="text-sm font-semibold underline">Find Product</h3>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">Popular Services</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {[{
            id: 1,
            image: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=320&h=70&fit=crop",
            name: "Cleaning",
            bgColor: "bg-pink-500",
            link: "#cleaning"
          }, {
            id: 2,
            image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=320&h=70&fit=crop",
            name: "Repair",
            bgColor: "bg-pink-500",
            link: "#repair"
          }, {
            id: 3,
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=320&h=70&fit=crop",
            name: "Beauty",
            bgColor: "bg-pink-500",
            link: "#beauty"
          }, {
            id: 4,
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=320&h=70&fit=crop",
            name: "Healthcare",
            bgColor: "bg-gradient-to-r from-orange-400 to-orange-500",
            link: "#healthcare"
          }, {
            id: 5,
            image: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=320&h=70&fit=crop",
            name: "Education",
            bgColor: "bg-gradient-to-r from-teal-400 to-orange-400",
            link: "#education"
          }, {
            id: 6,
            image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=320&h=70&fit=crop",
            name: "Food Delivery",
            bgColor: "bg-gradient-to-r from-teal-500 to-orange-500",
            link: "#food-delivery"
          }, {
            id: 7,
            image: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=320&h=70&fit=crop",
            name: "Transport",
            bgColor: "bg-gradient-to-r from-orange-500 to-orange-600",
            link: "#transport"
          }, {
            id: 8,
            image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=320&h=70&fit=crop",
            name: "Consulting",
            bgColor: "bg-gradient-to-r from-teal-400 to-orange-400",
            link: "#consulting"
          }, {
            id: 9,
            image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=320&h=70&fit=crop",
            name: "Installation",
            bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
            link: "#installation"
          }, {
            id: 10,
            image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=320&h=70&fit=crop",
            name: "Legal",
            bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
            link: "#legal"
          }, {
            id: 11,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=320&h=70&fit=crop",
            name: "Photography",
            bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
            link: "#photography"
          }, {
            id: 12,
            image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=320&h=70&fit=crop",
            name: "Marketing",
            bgColor: "bg-gradient-to-r from-purple-500 to-purple-600",
            link: "#marketing"
          }].map(service => <a key={service.id} href={service.link} className="group relative rounded-lg overflow-hidden shadow-lg cursor-pointer block transition-all duration-300 hover:ring-4 hover:ring-primary">
                <img src={service.image} alt={service.name} className="w-full h-[70px] object-cover" />
                <div className="absolute inset-0 flex flex-col justify-between p-3 text-white">
                  <div>
                    <h3 className="text-sm font-semibold">{service.name}.</h3>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="underline">Find Services</span>
                    <svg className="w-3 h-3 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>)}
          </div>
          
          {/* Full Width Banner */}
          <div className="mt-2.5">
            <a href="/find-shops" className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer group block w-full">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-80"></div>
              <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1280&h=35&fit=crop" alt="Full width banner" className="w-full h-[35px] object-cover" />
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <h3 className="text-sm font-semibold underline">Find/Book Services</h3>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Popular Businesses Section */}
      <PopularBusinesses />
      
      {/* Footer Section */}
      <Footer />
      
      {/* Mobile Navigation Bar */}
      <MobileNavBar />
    </div>;
};
export default Index;