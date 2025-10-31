import { Wallet, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const WalletCard = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) setBalance(data.wallet_balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = () => {
    toast.success("Redirecting to top-up page...");
  };

  return (
    <Card className="glass-widget border border-teal-500/20 shadow-2xl shadow-teal-500/10 animate-fadeInUp">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-green-500/10" />

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg shadow-teal-500/30">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-white">Student ID Wallet</h3>
        </div>

        {/* Balance Display */}
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-2xl shadow-teal-500/40">
          <p className="text-sm text-white/80 mb-2">Current Balance</p>
          <p className="text-5xl font-bold text-white mb-4">
            {loading ? "..." : `€${balance.toFixed(2)}`}
          </p>
          <Button
            onClick={handleTopUp}
            className="w-full bg-white text-teal-700 hover:bg-gray-50 font-semibold shadow-lg hover:scale-105 transition-transform"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Top Up Balance
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WalletCard;
