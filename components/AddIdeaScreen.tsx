import { useState } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { VoiceRecorder } from './VoiceRecorder';
import type { Idea } from './IdeasListScreen';

interface AddIdeaScreenProps {
  onSave: (idea: Omit<Idea, 'id'>) => void;
  onBack: () => void;
}

export function AddIdeaScreen({ onSave, onBack }: AddIdeaScreenProps) {
  const [title, setTitle] = useState('');
  const [notificationDate, setNotificationDate] = useState<Date | undefined>();
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [voiceMemo, setVoiceMemo] = useState<Blob | undefined>();
  const [textDescription, setTextDescription] = useState('');

  const handleSave = () => {
    if (title.trim()) {
      let finalNotificationDate: Date | undefined;
      if (notificationDate) {
        const [hours, minutes] = notificationTime.split(':').map(Number);
        finalNotificationDate = new Date(notificationDate);
        finalNotificationDate.setHours(hours, minutes, 0, 0);
      }

      onSave({
        title,
        notificationDate: finalNotificationDate,
        voiceMemo: inputMode === 'voice' ? voiceMemo : undefined,
        textDescription: inputMode === 'text' ? textDescription : undefined,
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
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
        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-[#2E3F4F]"
        >
          Add a New Idea
        </motion.h1>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 space-y-6 overflow-y-auto pb-6">
        {/* Title Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm text-[#6B7280]">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. App redesign concept"
            className="border-[#E8E6E1] rounded-2xl h-12 px-4"
          />
        </motion.div>

        {/* Notification Date & Time */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <label className="text-sm text-[#6B7280]">Reminder (optional)</label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full h-12 px-4 bg-white border border-[#E8E6E1] rounded-2xl flex items-center justify-between hover:bg-[#F5F3EF] transition-colors">
                <span className="text-[#2E3F4F]">
                  {notificationDate ? formatDate(notificationDate) : 'No reminder set'}
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
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 w-full h-12 px-4 bg-white border border-[#E8E6E1] rounded-2xl"
            >
              <Clock className="w-4 h-4 text-[#9CA3AF]" />
              <input
                type="time"
                value={notificationTime}
                onChange={(e) => setNotificationTime(e.target.value)}
                className="flex-1 bg-transparent text-[#2E3F4F] outline-none"
              />
            </motion.div>
          )}
        </motion.div>

        {/* Voice/Text Toggle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <label className="text-sm text-[#6B7280]">Description</label>
          <div className="flex gap-2">
            <button
              onClick={() => setInputMode('voice')}
              className={`flex-1 h-10 rounded-2xl text-left pl-3 transition-all ${
                inputMode === 'voice'
                  ? 'bg-[#E8F5F1] border-2 border-[#7DD3C0] text-[#2E3F4F]'
                  : 'bg-white border border-[#E8E6E1] text-[#9CA3AF]'
              }`}
            >
              Voice Memo
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`flex-1 h-10 rounded-2xl text-left pl-3 transition-all ${
                inputMode === 'text'
                  ? 'bg-[#E8F5F1] border-2 border-[#7DD3C0] text-[#2E3F4F]'
                  : 'bg-white border border-[#E8E6E1] text-[#9CA3AF]'
              }`}
            >
              Text
            </button>
          </div>

          {inputMode === 'voice' ? (
            <VoiceRecorder onRecordingComplete={setVoiceMemo} />
          ) : (
            <Textarea
              value={textDescription}
              onChange={(e) => setTextDescription(e.target.value)}
              placeholder="Describe your idea..."
              className="min-h-32 border-[#E8E6E1] rounded-2xl p-4 resize-none"
            />
          )}
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-6"
      >
        <Button
          onClick={handleSave}
          disabled={!title.trim() || (inputMode === 'voice' ? !voiceMemo : !textDescription.trim())}
          className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12 disabled:opacity-50"
        >
          Save this Idea
        </Button>
      </motion.div>
    </motion.div>
  );
}
