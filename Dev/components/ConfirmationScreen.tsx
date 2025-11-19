import { useState } from 'react';
import { Play, Pause, ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import type { Intention } from '../App';

interface ConfirmationScreenProps {
  intention: Intention;
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmationScreen({ intention, onConfirm, onBack }: ConfirmationScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showOriginalMemo, setShowOriginalMemo] = useState(false);

  // Generate AI summary based on memo type
  const generateAISummary = () => {
    if (intention.textMemo) {
      // Simple AI summary generation (mock)
      const words = intention.textMemo.split(' ').slice(0, 15).join(' ');
      return `Key motivation: ${words}...`;
    } else if (intention.voiceMemo) {
      return "You set this goal with clear intention and motivation. Your voice memo captured your commitment.";
    }
    return "You set this goal with determination.";
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6"
      >
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-[#E8E6E1]/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#4A5C6A]" />
        </button>
        <h2 className="text-[#2E3F4F] text-center mt-6">
          You said this mattered. Still true?
        </h2>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 flex items-center justify-center p-6 overflow-y-auto"
      >
        <div className="w-full max-w-sm space-y-4">
          {/* Goal Text */}
          <div className="text-center">
            <p className="text-[#4A5C6A]">{intention.text}</p>
          </div>

          {/* AI Generated Summary */}
          {!showOriginalMemo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#E8F5F1] to-[#F5F3EF] border border-[#D4F4E8] rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#7DD3C0]" />
                <span className="text-xs text-[#7DD3C0]">AI Summary</span>
              </div>
              <p className="text-sm text-[#4A5C6A] italic">
                {generateAISummary()}
              </p>
            </motion.div>
          )}

          {/* Review Memo Button */}
          <Button
            onClick={() => setShowOriginalMemo(!showOriginalMemo)}
            variant="outline"
            className="w-full border-[#E8E6E1] rounded-2xl h-10 text-sm"
          >
            {showOriginalMemo ? 'Hide Memo' : 'Review Memo'}
          </Button>

          {/* Original Memo Display */}
          {showOriginalMemo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {intention.textMemo ? (
                <div className="bg-white border border-[#E8E6E1] rounded-2xl p-4">
                  <p className="text-xs text-[#9CA3AF] mb-2">Original Memo</p>
                  <p className="text-sm text-[#4A5C6A] whitespace-pre-wrap">
                    {intention.textMemo}
                  </p>
                </div>
              ) : intention.voiceMemo ? (
                <div className="bg-white border border-[#E8E6E1] rounded-3xl p-6 space-y-4">
                  <p className="text-xs text-[#9CA3AF] text-center">Voice Memo Playback</p>
                  
                  {/* Waveform Visualization */}
                  <div className="flex items-center justify-center gap-1 h-24">
                    {[0.3, 0.5, 0.8, 0.4, 0.9, 0.6, 0.7, 0.5, 0.8, 0.4, 0.6, 0.9, 0.5, 0.7, 0.4, 0.8, 0.6, 0.5, 0.7, 0.9, 0.4, 0.6, 0.8, 0.5, 0.7].map((height, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-gradient-to-t from-[#7DD3C0] to-[#A8E6CF] rounded-full"
                        style={{
                          height: `${height * 100}%`,
                          opacity: isPlaying ? 1 : 0.4,
                        }}
                        animate={isPlaying ? {
                          height: [`${height * 100}%`, `${height * 80}%`, `${height * 100}%`],
                          opacity: [1, 0.6, 1],
                        } : {}}
                        transition={{
                          duration: 0.5,
                          repeat: isPlaying ? Infinity : 0,
                          delay: i * 0.05,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <motion.button
                      onClick={togglePlayback}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                        isPlaying 
                          ? 'bg-[#7DD3C0] shadow-lg shadow-[#D4F4E8]' 
                          : 'bg-gradient-to-br from-[#7DD3C0] to-[#A8E6CF] hover:shadow-lg hover:shadow-[#D4F4E8]'
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7 text-white" />
                      ) : (
                        <Play className="w-7 h-7 text-white ml-1" />
                      )}
                    </motion.button>

                    {/* Speed Control */}
                    <motion.button
                      onClick={cycleSpeed}
                      className="px-4 py-2 rounded-full bg-white border border-[#E8E6E1] hover:bg-[#F5F3EF] transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-sm text-[#2E3F4F]">{playbackSpeed}x</span>
                    </motion.button>
                  </div>

                  <p className="text-xs text-center text-[#6B7280]">
                    {isPlaying ? 'Playing your voice memo...' : 'Tap to play your voice memo'}
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-[#E8E6E1] rounded-2xl p-4 text-center">
                  <p className="text-sm text-[#9CA3AF]">No memo recorded</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 space-y-3"
      >
        <Button
          onClick={onConfirm}
          className="w-full h-14 bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl"
        >
          Yes
        </Button>
        <Button
          onClick={onConfirm}
          variant="outline"
          className="w-full h-14 border-2 border-[#E8E6E1] hover:bg-[#F5F3EF] rounded-2xl"
        >
          No
        </Button>
      </motion.div>
    </motion.div>
  );
}
