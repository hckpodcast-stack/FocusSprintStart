import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { VoiceRecorder } from './VoiceRecorder';
import type { Intention } from '../App';

interface AddMemoScreenProps {
  intention: Intention;
  onSave: (voiceMemo?: Blob, textMemo?: string) => void;
  onBack: () => void;
}

export function AddMemoScreen({ intention, onSave, onBack }: AddMemoScreenProps) {
  const [voiceMemo, setVoiceMemo] = useState<Blob | undefined>();
  const [textMemo, setTextMemo] = useState('');
  const [memoInputType, setMemoInputType] = useState<'voice' | 'text'>('voice');

  const handleSave = () => {
    onSave(
      memoInputType === 'voice' ? voiceMemo : undefined,
      memoInputType === 'text' ? textMemo : undefined
    );
  };

  const toggleInputType = () => {
    setMemoInputType(memoInputType === 'voice' ? 'text' : 'voice');
  };

  const canSave = (memoInputType === 'voice' && voiceMemo) || 
                  (memoInputType === 'text' && textMemo.trim());

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
          <h1 className="text-[#2E3F4F]">Add Memo</h1>
          <p className="text-sm text-[#6B7280]">
            Add additional thoughts about "{intention.text}"
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-y-auto pb-6">
        {/* Memo Input Section with Swipe */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm text-[#6B7280]">
              {memoInputType === 'voice' ? 'Record a voice memo' : 'Type a memo'}
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
                  placeholder="Share your additional thoughts... What new insights have emerged? What challenges are you facing? (under 300 words)"
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
        transition={{ delay: 0.3 }}
      >
        <Button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12 disabled:opacity-50"
        >
          Save Memo
        </Button>
      </motion.div>
    </motion.div>
  );
}
