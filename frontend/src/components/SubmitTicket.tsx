import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Ticket, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SubmitTicketProps {
  userId?: string;
  channelId?: string;
}

const SubmitTicket = ({ userId = 'student-user', channelId }: SubmitTicketProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'normal',
  });

  const categories = [
    { value: 'technical', label: 'Technical Issue', icon: '💻' },
    { value: 'academic', label: 'Academic Question', icon: '📚' },
    { value: 'facilities', label: 'Facilities & Infrastructure', icon: '🏢' },
    { value: 'billing', label: 'Billing & Payments', icon: '💰' },
    { value: 'other', label: 'Other', icon: '❓' },
    { value: 'general', label: 'General Support', icon: '💬' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-slate-400' },
    { value: 'normal', label: 'Normal', color: 'text-blue-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
  ];

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          channelId: channelId || null,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          department: 'support', // Default to support
        }),
      });

      if (res.ok) {
        toast.success('🎫 Support ticket submitted! Our team will respond soon.');
        setFormData({
          title: '',
          description: '',
          category: 'general',
          priority: 'normal',
        });
        setOpen(false);
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast.error('Failed to submit ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-slate-800/50 border-purple-500/30 hover:bg-slate-700/50 hover:border-purple-500/50 text-white"
        >
          <Ticket className="h-4 w-4 mr-2" />
          Submit Support Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center gap-2">
            <Ticket className="h-6 w-6 text-purple-400" />
            Submit Support Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info Banner */}
          <Card className="bg-blue-500/10 border-blue-500/30 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">Need help?</p>
                <p className="text-xs text-blue-400">
                  Submit a ticket and our support team will respond within 24 hours.
                </p>
              </div>
            </div>
          </Card>

          {/* Title */}
          <div>
            <Label className="text-slate-300">Issue Title *</Label>
            <Input
              placeholder="Brief description of your issue"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-slate-300">Detailed Description *</Label>
            <Textarea
              placeholder="Please provide as much detail as possible about your issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-800 border-slate-600 text-white mt-1 min-h-[120px]"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-slate-300">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <Label className="text-slate-300">Priority *</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {priorities.map(priority => (
                  <SelectItem key={priority.value} value={priority.value}>
                    <span className={`font-semibold ${priority.color}`}>{priority.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              Select "Urgent" only for critical issues requiring immediate attention
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim() || !formData.description.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitTicket;

