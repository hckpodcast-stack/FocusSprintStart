import { useState } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Bell, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { VoiceRecorder } from './VoiceRecorder';
import type { Intention } from '../App';

interface GoalCreationScreenProps {
  onSave: (intention: Omit<Intention, 'id'>) => void;
  onCancel: () => void;
  prefilledTitle?: string;
  prefilledVoiceMemo?: Blob;
}

export function GoalCreationScreen({ onSave, onCancel, prefilledTitle, prefilledVoiceMemo }: GoalCreationScreenProps) {
  const [goalText, setGoalText] = useState(prefilledTitle || '');
  const [dueDate, setDueDate] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [dueTime, setDueTime] = useState('17:00');
  const [voiceMemo, setVoiceMemo] = useState<Blob | undefined>(prefilledVoiceMemo);
  const [textMemo, setTextMemo] = useState('');
  const [memoInputType, setMemoInputType] = useState<'voice' | 'text'>('voice');
  const [checkInNotifications, setCheckInNotifications] = useState<Date[]>([]);
  const [showNotificationPicker, setShowNotificationPicker] = useState(false);
  const [newNotificationDate, setNewNotificationDate] = useState<Date>(new Date());
  const [newNotificationTime, setNewNotificationTime] = useState('12:00');

  const handleSave = () => {
    if (goalText.trim()) {
      const [hours, minutes] = dueTime.split(':').map(Number);
      const finalDate = new Date(dueDate);
      finalDate.setHours(hours, minutes, 0, 0);
      
      onSave({
        text: goalText,
        dueDate: finalDate,
        voiceMemo: memoInputType === 'voice' ? voiceMemo : undefined,
        textMemo: memoInputType === 'text' ? textMemo : undefined,
        checkInNotifications,
      });
    }
  };

  const handleAddNotification = () => {
    if (checkInNotifications.length < 4) {
      const [hours, minutes] = newNotificationTime.split(':').map(Number);
      const notificationDate = new Date(newNotificationDate);
      notificationDate.setHours(hours, minutes, 0, 0);

      const [dueHours, dueMinutes] = dueTime.split(':').map(Number);
      const finalDueDate = new Date(dueDate);
      finalDueDate.setHours(dueHours, dueMinutes, 0, 0);

      if (notificationDate < finalDueDate) {
        setCheckInNotifications([...checkInNotifications, notificationDate].sort((a, b) => a.getTime() - b.getTime()));
        setShowNotificationPicker(false);
        setNewNotificationDate(new Date());
        setNewNotificationTime('12:00');
      }
    }
  };

  const handleRemoveNotification = (index: number) => {
    setCheckInNotifications(checkInNotifications.filter((_, i) => i !== index));
  };

  const toggleInputType = () => {
    setMemoInputType(memoInputType === 'voice' ? 'text' : 'voice');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit' 
    }).format(date);
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
          onClick={onCancel}
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
          New Intention
        </motion.h1>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 space-y-6 overflow-y-auto pb-6">
        {/* Goal Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm text-[#6B7280]">What do you want to accomplish?</label>
          <Input
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="e.g. Finish landing page"
            className="border-[#E8E6E1] rounded-2xl h-12 px-4"
          />
        </motion.div>

        {/* Date Picker */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <label className="text-sm text-[#6B7280]">When will you complete it?</label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full h-12 px-4 bg-white border border-[#E8E6E1] rounded-2xl flex items-center justify-between hover:bg-[#F5F3EF] transition-colors">
                <span className="text-[#2E3F4F]">{formatDate(dueDate)}</span>
                <CalendarIcon className="w-4 h-4 text-[#9CA3AF]" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(date) => date && setDueDate(date)}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
              />
            </PopoverContent>
          </Popover>
          
          {/* Time Picker */}
          <label className="w-full h-12 px-4 bg-white border border-[#E8E6E1] rounded-2xl flex items-center justify-between hover:bg-[#F5F3EF] transition-colors cursor-pointer">
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="flex-1 bg-transparent text-[#2E3F4F] outline-none cursor-pointer"
            />
            <Clock className="w-4 h-4 text-[#9CA3AF] pointer-events-none" />
          </label>
        </motion.div>

        {/* Check-in Notifications */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="space-y-3"
        >
          <label className="text-sm text-[#6B7280]">Check-in Reminders (Optional)</label>
          
          {/* Add Notification Button */}
          <Button
            onClick={() => setShowNotificationPicker(true)}
            disabled={checkInNotifications.length >= 4}
            variant="outline"
            className="w-full h-12 border-[#E8E6E1] rounded-2xl flex items-center justify-center gap-2 hover:bg-[#F5F3EF] disabled:opacity-50"
          >
            <Bell className="w-4 h-4" />
            <span className="text-sm">Add Check-in Reminder ({checkInNotifications.length}/4)</span>
          </Button>

          {/* Notification List */}
          {checkInNotifications.length > 0 && (
            <div className="space-y-2">
              {checkInNotifications.map((notification, index) => (
                <div
                  key={index}
                  className="bg-[#E8F5F1] border border-[#D4F4E8] rounded-2xl px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#7DD3C0]" />
                    <span className="text-sm text-[#2E3F4F]">{formatDateTime(notification)}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveNotification(index)}
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#D4F4E8] transition-colors"
                  >
                    <X className="w-4 h-4 text-[#4A5C6A]" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Notification Picker Modal */}
          <AnimatePresence>
            {showNotificationPicker && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowNotificationPicker(false)}
                  className="fixed inset-0 bg-black/30 z-40"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-x-6 top-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 shadow-2xl z-50 max-w-sm mx-auto"
                >
                  <h3 className="text-[#2E3F4F] mb-4">Add Check-in Reminder</h3>
                  
                  <div className="space-y-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="w-full h-12 px-4 bg-white border border-[#E8E6E1] rounded-2xl flex items-center justify-between hover:bg-[#F5F3EF] transition-colors">
                          <span className="text-[#2E3F4F]">{formatDate(newNotificationDate)}</span>
                          <CalendarIcon className="w-4 h-4 text-[#9CA3AF]" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                        <Calendar
                          mode="single"
                          selected={newNotificationDate}
                          onSelect={(date) => date && setNewNotificationDate(date)}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return date < today;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <label className="w-full h-12 px-4 bg-white border border-[#E8E6E1] rounded-2xl flex items-center justify-between hover:bg-[#F5F3EF] transition-colors cursor-pointer">
                      <input
                        type="time"
                        value={newNotificationTime}
                        onChange={(e) => setNewNotificationTime(e.target.value)}
                        className="flex-1 bg-transparent text-[#2E3F4F] outline-none cursor-pointer"
                      />
                      <Clock className="w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                    </label>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <Button
                      onClick={handleAddNotification}
                      className="flex-1 bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12"
                    >
                      Add
                    </Button>
                    <Button
                      onClick={() => setShowNotificationPicker(false)}
                      variant="outline"
                      className="flex-1 border-[#E8E6E1] rounded-2xl h-12"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Memo Input Section with Swipe */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm text-[#6B7280]">
              {memoInputType === 'voice' ? 'Why this goal matters to you ?' : 'Why this goal matters to you ?'}
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleInputType}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E6E1] transition-colors"
              >
                {memoInputType === 'voice' ? (
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-[#9CA3AF]" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {memoInputType === 'voice' ? (
              <motion.div
                key="voice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <VoiceRecorder onRecordingComplete={setVoiceMemo} />
              </motion.div>
            ) : (
              <motion.div
                key="text"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Textarea
                  value={textMemo}
                  onChange={(e) => setTextMemo(e.target.value)}
                  placeholder="Share your reasons for setting this goal..."
                  className="border-[#E8E6E1] rounded-2xl min-h-[120px] px-4 py-3 resize-none"
                  maxLength={2000}
                />
                <p className="text-xs text-[#9CA3AF] mt-1">
                  {textMemo.split(' ').filter(w => w.length > 0).length} / 300 words
                </p>
              </motion.div>
            )}
          </AnimatePresence>
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
          disabled={!goalText.trim()}
          className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12 disabled:opacity-50"
        >
          Next
        </Button>
      </motion.div>
    </motion.div>
  );
}