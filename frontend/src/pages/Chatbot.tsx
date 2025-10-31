import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, User, Sparkles, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatbotNavbar from "@/components/ChatbotNavbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm Pixi, your enhanced AI assistant for international students at WHZ! 🌟✨\n\nI now have deep knowledge about:\n\n🇩🇪 German culture & traditions\n📋 Bureaucracy (Anmeldung, visa, permits)\n🎓 University life in Saxony\n🗣️ Language tips (Sie vs du)\n🎉 Events & festivals\n🏠 Integration & daily life\n\nI'm powered by Google Gemini AI + a comprehensive cultural knowledge base!\n\nWhat would you like to know?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Call the Enhanced Pixi API with cultural knowledge
      const response = await fetch('http://localhost:3000/api/pixi/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: inputText,
          userId: 'student-demo', // TODO: Replace with actual user ID from auth
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const botMessage: Message = {
        id: messages.length + 2,
        text: data.response || "Sorry, I couldn't process that request.",
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Show helpful info if insights were used
      if (data.insightsUsed > 0) {
        toast({
          title: "Cultural Insights Used",
          description: `Pixi used ${data.insightsUsed} verified knowledge base entries to answer your question!`,
        });
      }
    } catch (error) {
      console.error('Error calling Pixi:', error);
      
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I encountered an error. Please try again! 😅\n\nYou can also try:\n• Asking in the #general channel\n• Contacting the WHZ International Office\n• Visiting the Studentenwerk",
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to get response from Pixi AI",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <ChatbotNavbar />
      <div className="container mx-auto px-6 pt-24 pb-12 flex items-center justify-center">
        <Card className="w-full max-w-4xl h-[80vh] glass-card border-primary/30 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-pink-600 to-purple-600">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
                Pixie
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              </h2>
              <p className="text-sm text-muted-foreground">Your AI Campus Assistant</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 animate-fade-in ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    message.sender === "bot"
                      ? "bg-gradient-to-br from-pink-600 to-purple-600"
                      : "bg-primary"
                  }`}
                >
                  {message.sender === "bot" ? (
                    <Bot className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>

                <div
                  className={`max-w-[70%] p-4 rounded-2xl ${
                    message.sender === "bot"
                      ? "bg-card text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
              ))}
            {isLoading && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="p-2 rounded-full bg-gradient-to-br from-pink-600 to-purple-600">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="max-w-[70%] p-4 rounded-2xl bg-card text-foreground">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Pixie is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            </div>
          </ScrollArea>

        {/* Input */}
        <div className="p-6 border-t border-primary/20">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="glass-card border-primary/20 text-foreground"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className="bg-primary hover:bg-primary/80 text-primary-foreground disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3" />
            Powered by Google Gemini AI • 93 Cultural Insights • Leben in Sachsen
          </p>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default Chatbot;
