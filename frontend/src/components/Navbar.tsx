import { Home, Users, Calendar, MessageSquare, Bell, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import NotificationCenter from "./NotificationCenter";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Social", path: "/social", icon: MessageSquare },
    { name: "Events", path: "/events", icon: Calendar },
    { name: "Products", path: "/users", icon: Users },
    { name: "Chatbot", path: "/chatbot", icon: MessageSquare },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0F172A]/80 border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold gradient-text overflow-visible">Zwickly Student</h1>
            
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 relative ${
                        isActive
                          ? "text-white bg-gradient-to-r from-[#7B5CFA] to-[#48E0E4] shadow-lg shadow-purple-500/30"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                        {isActive && (
                          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7B5CFA] to-[#48E0E4] opacity-20 blur-xl animate-pulse" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2.5 rounded-full hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/20"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-gray-300 hover:text-white transition-colors" />
            </button>
            <ThemeToggle />
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-full hover:bg-white/10 transition-all hover:shadow-lg hover:shadow-purple-500/20"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-300 hover:text-white transition-colors" />
              {notifications > 0 && (
                <span className="notification-badge">{notifications}</span>
              )}
            </button>
          </div>
        </div>
        
        {showSearch && (
          <div className="mt-4 pb-2">
            <input
              type="text"
              placeholder="Search events, users, or content..."
              className="search-input"
              autoFocus
            />
          </div>
        )}
      </div>
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </nav>
  );
};

export default Navbar;
