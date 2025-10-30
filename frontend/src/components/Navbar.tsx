import { Home, Users, Calendar, MessageSquare, Bell, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import NotificationCenter from "./NotificationCenter";

const Navbar = () => {
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Social", path: "/social", icon: MessageSquare },
    { name: "Events", path: "/events", icon: Calendar },
    { name: "Users", path: "/users", icon: Users },
    { name: "Chatbot", path: "/chatbot", icon: MessageSquare },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-primary/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold gradient-text overflow-visible">Zwickly Student</h1>
            
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 relative group ${
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full" />
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
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-primary" />
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-primary/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-primary" />
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
