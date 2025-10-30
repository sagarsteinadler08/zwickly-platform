import { Home, Users, Calendar, MessageSquare, MessageCircle, Bell, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import NotificationCenter from "./NotificationCenter";

const AdminNavbar = () => {
  const [notifications, setNotifications] = useState(0); // Will be updated from API
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const navItems = [
    { name: "Home", path: "/admin/home", icon: Home },
    { name: "Products", path: "/users", icon: Users },
    { name: "Events", path: "/admin/events", icon: Calendar },
    { name: "Social", path: "/admin/social", icon: MessageCircle },
    { name: "Chatbot", path: "/chatbot", icon: MessageSquare },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-primary/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold gradient-text overflow-visible">Zwickly Admin</h1>
          
          <ul className="flex items-center gap-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 relative group ${
                        isActive
                          ? "text-primary"
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
                </li>
              );
            })}
          </ul>
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
              placeholder="Search admin panel..."
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

export default AdminNavbar;
