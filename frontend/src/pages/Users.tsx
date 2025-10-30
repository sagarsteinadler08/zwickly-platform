import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import zwicklyLogo from "@/assets/zwickly-logo.png";
import pixieLogo from "@/assets/pixie-logo.png";
import kommpaktLogo from "@/assets/kommpakt-logo.png";

const Users = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.signOut();
  }, []);

  const userTypes = [
    {
      id: "student",
      title: "Zwickly Student",
      description: "Access your campus dashboard",
      logo: zwicklyLogo,
      action: () => navigate("/student-auth"),
      gradient: "from-blue-600 to-purple-600"
    },
    {
      id: "chatbot",
      title: "Pixie",
      description: "Chat with our AI assistant",
      logo: pixieLogo,
      action: () => navigate("/chatbot"),
      gradient: "from-pink-600 to-purple-600"
    },
    {
      id: "admin",
      title: "KommPakt",
      description: "Admin portal access",
      logo: kommpaktLogo,
      action: () => navigate("/admin-auth"),
      gradient: "from-orange-600 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-[#0F172A] relative overflow-hidden transition-colors duration-300">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-6xl relative z-10">
        <div className="text-center mb-16 animate-fadeInUp px-4">
          <h1 className="text-6xl font-bold gradient-text mb-6 pb-2 drop-shadow-lg">Zwickly Products</h1>
          <p className="text-gray-700 dark:text-gray-300 text-xl">Select a product to access its features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {userTypes.map((type, index) => {
            return (
              <Card
                key={type.id}
                onClick={type.action}
                className="relative neo-card cursor-pointer group overflow-hidden transition-all duration-500 hover:scale-110 animate-fadeInUp border-2 border-purple-500/30 hover:border-purple-500/60 p-10"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-5 group-hover:opacity-20 transition-all duration-500`} />
                
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-xl" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  {/* Logo with animated ring */}
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7B5CFA] to-[#48E0E4] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                    <div className="relative w-36 h-36 flex items-center justify-center group-hover:scale-125 transition-transform duration-500 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 group-hover:border-purple-500/50">
                      <img src={type.logo} alt={type.title} className="w-full h-full object-contain drop-shadow-2xl" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white group-hover:gradient-text transition-all duration-300">{type.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors text-base">{type.description}</p>
                  </div>
                  
                  <div className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-[#7B5CFA] to-[#48E0E4] text-white text-sm font-bold shadow-xl shadow-purple-500/30 group-hover:shadow-2xl group-hover:shadow-purple-500/50 group-hover:scale-110 transition-all duration-300">
                    Continue →
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Users;
