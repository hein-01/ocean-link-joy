import React from "react";
import { Home, ShoppingBag, Bookmark, Settings, Wrench, Briefcase } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";


const MobileNavBar = React.memo(() => {
  const location = useLocation();
  
  const navItems = React.useMemo(() => [
    {
      id: "home",
      label: "Home",
      icon: Home,
      path: "/",
      colors: "text-orange-500"
    },
    {
      id: "services",
      label: "Book",
      icon: Wrench,
      path: "/find-services",
      colors: "text-blue-500"
    },
    {
      id: "stores",
      label: "Shops", 
      icon: ShoppingBag,
      path: "/find-shops",
      colors: "text-yellow-500"
    },
    {
      id: "jobs",
      label: "Jobs",
      icon: Briefcase,
      path: "/find-jobs",
      colors: "text-green-500"
    },
    {
      id: "setting",
      label: "For You",
      icon: Settings,
      path: "/dashboard",
      colors: "text-purple-500"
    }
  ], []);


  const isActive = React.useCallback((item: any) => {
    if (item.path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(item.path);
  }, [location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-[75px] z-50 md:hidden">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                active ? 'bg-purple-100' : 'hover:bg-gray-50'
              }`}
            >
              <Icon 
                size={20} 
                className={`mb-1 ${active ? item.colors : 'text-gray-500'}`}
              />
              <span className={`text-xs font-medium ${
                active ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

MobileNavBar.displayName = "MobileNavBar";

export default MobileNavBar;