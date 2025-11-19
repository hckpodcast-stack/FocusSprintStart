import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { VoiceRecorder } from './VoiceRecorder';
import type { Intention } from '../App';

interface ReflectionScreenProps {
  intention: Intention;
  onSave: (mood: string, reflectionVoice: Blob | undefined, textReflection: string | undefined, satisfaction: number) => void;
  onBack: () => void;
}

const moods = [
  { emoji: '😊', label: 'Great' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Tough' },
  { emoji: '😤', label: 'Frustrated' },
];

export function ReflectionScreen({ intention, onSave, onBack }: ReflectionScreenProps) {
  const [selectedMood, setSelectedMood] = useState('');
  const [reflectionVoice, setReflectionVoice] = useState<Blob | undefined>();
  const [textReflection, setTextReflection] = useState('');
  const [reflectionInputType, setReflectionInputType] = useState<'voice' | 'text'>('voice');
  const [satisfaction, setSatisfaction] = useState<number>(5);

  const handleSave = () => {
    if (selectedMood) {
      onSave(
        selectedMood, 
        reflectionInputType === 'voice' ? reflectionVoice : undefined,
        reflectionInputType === 'text' ? textReflection : undefined,
        satisfaction
      );
    }
  };

  const toggleInputType = () => {
    setReflectionInputType(reflectionInputType === 'voice' ? 'text' : 'voice');
  };

  const canSave = selectedMood && (
    (reflectionInputType === 'voice' && reflectionVoice) || 
    (reflectionInputType === 'text' && textReflection.trim())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col p-6"
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-[#E8E6E1]/50 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5 text-[#4A5C6A]" />
        </button>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <h1 className="text-[#2E3F4F]">Reflect</h1>
          <p className="text-sm text-[#6B7280]">
            Take a moment to capture how it went
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-y-auto pb-6">
        {/* Mood Selector */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <label className="text-sm text-[#6B7280]">How are you feeling about this goal?</label>
          <div className="flex items-center justify-between gap-2">
            {moods.map((mood) => (
              <button
                key={mood.emoji}
                onClick={() => setSelectedMood(mood.emoji)}
                className={`flex-1 aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                  selectedMood === mood.emoji
                    ? 'bg-[#E8F5F1] border-2 border-[#7DD3C0] scale-105'
                    : 'bg-white border border-[#E8E6E1] hover:bg-[#F5F3EF]'
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs text-[#4A5C6A]">{mood.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Satisfaction Slider */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm text-[#6B7280]">Satisfaction Level</label>
            <span className="text-sm text-[#2E3F4F]">{satisfaction}/10</span>
          </div>
          <div className="px-2">
            <Slider
              value={[satisfaction]}
              onValueChange={(value) => setSatisfaction(value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-[#9CA3AF] px-2">
            <span>Low</span>
            <span>High</span>
          </div>
        </motion.div>

        {/* Reflection Input Section with Swipe */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm text-[#6B7280]">
              {reflectionInputType === 'voice' ? 'Record a reflection' : 'Type a reflection'}
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleInputType}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#E8E6E1] transition-colors"
              >
                {reflectionInputType === 'voice' ? (
                  <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-[#9CA3AF]" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {reflectionInputType === 'voice' ? (
              <motion.div
                key="voice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <VoiceRecorder onRecordingComplete={setReflectionVoice} />
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
                  value={textReflection}
                  onChange={(e) => setTextReflection(e.target.value)}
                  placeholder="Share your observations about this goal..."
                  className="border-[#E8E6E1] rounded-2xl min-h-[120px] px-4 py-3 resize-none"
                  maxLength={2000}
                />
                <p className="text-xs text-[#9CA3AF] mt-1">
                  {textReflection.split(' ').filter(w => w.length > 0).length} / 300 words
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
        transition={{ delay: 0.4 }}
      >
        <Button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12 disabled:opacity-50"
        >
          Save Reflection
        </Button>
      </motion.div>
    </motion.div>
  );
}
