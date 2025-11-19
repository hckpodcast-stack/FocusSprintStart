import { useState } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import type { Idea } from './IdeasListScreen';

interface IdeaDetailScreenProps {
  idea: Idea;
  onBack: () => void;
  onMakeGoal: (idea: Idea) => void;
  onUpdateNotification: (ideaId: string, notificationDate?: Date) => void;
}

export function IdeaDetailScreen({ idea, onBack, onMakeGoal, onUpdateNotification }: IdeaDetailScreenProps) {
  const [isEditingNotification, setIsEditingNotification] = useState(false);
  const [notificationDate, setNotificationDate] = useState<Date | undefined>(idea.notificationDate);
  const [notificationTime, setNotificationTime] = useState(() => {
    if (idea.notificationDate) {
      const hours = idea.notificationDate.getHours().toString().padStart(2, '0');
      const minutes = idea.notificationDate.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    return '09:00';
  });

  // Generate AI summary based on voice memo or text
  const aiSummary = idea.voiceMemo
    ? "This idea explores innovative approaches to user interface design. The voice memo captures enthusiasm for creating a more intuitive user experience. Key themes include simplifying complex workflows and enhancing visual hierarchy."
    : idea.textDescription
    ? `${idea.textDescription.slice(0, 200)}${idea.textDescription.length > 200 ? '...' : ''}`
    : "An exciting new idea waiting to be explored.";

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const handleSaveNotification = () => {
    let finalDate: Date | undefined;
    if (notificationDate) {
      const [hours, minutes] = notificationTime.split(':').map(Number);
      finalDate = new Date(notificationDate);
      finalDate.setHours(hours, minutes, 0, 0);
    }
    onUpdateNotification(idea.id, finalDate);
    setIsEditingNotification(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-[#E8E6E1]/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#4A5C6A]" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 space-y-6 overflow-y-auto pb-6">
        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-[#2E3F4F]">{idea.title}</h1>
        </motion.div>

        {/* Notification Date */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm text-[#6B7280]">Reminder</label>
            <button
              onClick={() => setIsEditingNotification(!isEditingNotification)}
              className="text-xs text-[#7DD3C0] hover:text-[#6BC4B0] flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              Edit
            </button>
          </div>
          
          {isEditingNotification ? (
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="w-full h-12 px-4 bg-white border border-[#E8E6E1] rounded-2xl flex items-center justify-between hover:bg-[#F5F3EF] transition-colors">
                    <span className="text-[#2E3F4F]">
                      {notificationDate ? formatDate(notificationDate).split(',')[0] : 'No reminder set'}
                    </span>
                    <CalendarIcon className="w-4 h-4 text-[#9CA3AF]" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={notificationDate}
                    onSelect={(date) => date && setNotificationDate(date)}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </PopoverContent>
              </Popover>

              {notificationDate && (
                <div className="flex items-center gap-2 w-full h-12 px-4 bg-white border border-[#E8E6E1] rounded-2xl">
                  <Clock className="w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type="time"
                    value={notificationTime}
                    onChange={(e) => setNotificationTime(e.target.value)}
                    className="flex-1 bg-transparent text-[#2E3F4F] outline-none"
                  />
                </div>
              )}

              <Button
                onClick={handleSaveNotification}
                className="w-full bg-[#7DD3C0] hover:bg-[#6BC4B0] text-white rounded-2xl h-10"
              >
                Save Reminder
              </Button>
            </div>
          ) : (
            <Card className="p-4 bg-white border-[#E8E6E1] rounded-2xl">
              <p className="text-sm text-[#4A5C6A]">
                {idea.notificationDate ? formatDate(idea.notificationDate) : 'No reminder set'}
              </p>
            </Card>
          )}
        </motion.div>

        {/* AI Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <label className="text-sm text-[#6B7280]">AI Summary</label>
          <Card className="p-4 bg-white border-[#E8E6E1] rounded-2xl">
            <p className="text-sm text-[#4A5C6A] leading-relaxed">{aiSummary}</p>
          </Card>
        </motion.div>
      </div>

      {/* Make Goal Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-6"
      >
        <Button
          onClick={() => onMakeGoal(idea)}
          className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12"
        >
          Make it a Goal
        </Button>
      </motion.div>
    </motion.div>
  );
}
