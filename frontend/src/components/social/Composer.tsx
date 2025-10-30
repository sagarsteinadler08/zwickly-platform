import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

const Composer = ({ onSend, disabled = false }: ComposerProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message... (@username to mention, @pixi for bot)"
        className="flex-1 min-h-[60px] max-h-32 p-3 rounded-2xl border border-gray-200/50 bg-white/70 backdrop-blur-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        disabled={disabled}
      />
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="rounded-full h-12 w-12 p-0"
      >
        <Send className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Composer;

