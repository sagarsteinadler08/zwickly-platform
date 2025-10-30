import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";

const GreetingSection = () => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good morning", emoji: "🌅", gradient: "from-amber-400 to-orange-500" };
    if (hour < 18) return { text: "Good afternoon", emoji: "☀️", gradient: "from-blue-400 to-cyan-500" };
    return { text: "Good evening", emoji: "🌙", gradient: "from-purple-500 to-pink-500" };
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const greeting = getGreeting();

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl bg-white animate-fade-in">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${greeting.gradient} opacity-10`} />
      
      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">
                {greeting.text}! {greeting.emoji}
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Ready to conquer your day?</p>
          </div>
        </div>
        
        <div className="flex items-baseline gap-2">
          <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {getCurrentTime()}
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Day Progress</span>
            <span>{Math.round((new Date().getHours() / 24) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${greeting.gradient} rounded-full transition-all duration-500`}
              style={{ width: `${(new Date().getHours() / 24) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GreetingSection;
