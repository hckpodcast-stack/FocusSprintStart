import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Volume2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import type { Intention } from '../App';

interface CheckInScreenProps {
  intention: Intention;
  onCheckIn: (completed: boolean) => void;
  onBack: () => void;
  onAddMemo: () => void;
}

export function CheckInScreen({ intention, onCheckIn, onBack, onAddMemo }: CheckInScreenProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [playingVoice, setPlayingVoice] = useState(false);

  const handleYes = () => {
    setShowConfetti(true);
    setTimeout(() => {
      onCheckIn(true);
    }, 1500);
  };

  const handleNo = () => {
    onCheckIn(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col relative"
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
      <div className="flex-1 flex flex-col items-center justify-center p-6">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                backgroundColor: ['#818cf8', '#60a5fa', '#c084fc', '#34d399'][Math.floor(Math.random() * 4)],
              }}
              animate={{
                y: ['0vh', '120vh'],
                x: [0, Math.random() * 100 - 50],
                rotate: [0, Math.random() * 360],
                opacity: [1, 0],
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Voice Playing Indicator */}
      {playingVoice && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 flex items-center gap-3 bg-[#E8F5F1] px-6 py-3 rounded-2xl"
        >
          <Volume2 className="w-5 h-5 text-[#7DD3C0] animate-pulse" />
          <span className="text-sm text-[#2E3F4F]">Playing your voice memo...</span>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-8 max-w-sm"
      >
        <div className="space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-gradient-to-br from-[#E8F5F1] to-[#D4F4E8] rounded-full mx-auto flex items-center justify-center"
          >
            <span className="text-3xl">✨</span>
          </motion.div>
          
          <h2 className="text-[#2E3F4F] font-bold">Did you finish your goal?</h2>
          
          <div className="space-y-1">
            <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">Your Goal</p>
            <p className="text-[#2E3F4F]">{intention.text}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleYes}
            disabled={showConfetti || playingVoice}
            className="w-full h-14 bg-[#7DD3C0] hover:bg-[#6BC4B0] text-[rgb(46,63,79)] rounded-2xl flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span className="text-[rgb(46,63,79)]">Yes, I completed it!</span>
          </Button>

          <Button
            onClick={handleNo}
            disabled={showConfetti || playingVoice}
            variant="outline"
            className="w-full h-14 border-2 border-[#E8E6E1] hover:bg-[#F5F3EF] rounded-2xl flex items-center justify-center gap-2"
          >
            <XCircle className="w-5 h-5 text-[#6B7280]" />
            <span className="text-[#2E3F4F]">Not yet</span>
          </Button>

          <Button
            onClick={onAddMemo}
            disabled={showConfetti || playingVoice}
            variant="outline"
            className="w-full h-12 border border-[#E8E6E1] hover:bg-[#F5F3EF] rounded-2xl flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#7DD3C0]" />
            <span className="text-sm text-[#4A5C6A]">Add Memo</span>
          </Button>
        </div>
      </motion.div>
      </div>
    </motion.div>
  );
}