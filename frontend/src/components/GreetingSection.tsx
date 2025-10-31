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
    <Card className="glass-widget border border-pink-500/20 shadow-2xl shadow-pink-500/10 animate-fadeInUp">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${greeting.gradient} opacity-20`} />

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-pink-400 dark:text-pink-400" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-white">
                {greeting.text}! {greeting.emoji}
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-3">Ready to conquer your day?</p>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-5xl font-bold bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">
            {getCurrentTime()}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 mb-1">
            <span>Day Progress</span>
            <span>{Math.round((new Date().getHours() / 24) * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-200/70 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${greeting.gradient} rounded-full transition-all duration-500 shadow-lg`}
              style={{ width: `${(new Date().getHours() / 24) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GreetingSection;
