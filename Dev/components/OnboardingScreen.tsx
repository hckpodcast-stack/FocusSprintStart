import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sparkles, ArrowRight } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (tone: string) => void;
}

const tones = [
  { value: 'factual', label: 'Factual', description: 'Clear, data-driven insights' },
  { value: 'sarcastic', label: 'Sarcastic', description: 'A bit of wit with honesty' },
  { value: 'firm', label: 'Firm', description: 'Direct and no-nonsense' },
  { value: 'encouraging', label: 'Encouraging', description: 'Positive and supportive' },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<'welcome' | 'intro' | 'privacy' | 'tone' | 'tracking' | 'insights'>(
    'welcome'
  );
  const [selectedTone, setSelectedTone] = useState<string>('');

  const handleComplete = () => {
    if (selectedTone) {
      onComplete(selectedTone);
    }
  };

  // Get AI message based on tone
  const getTrackingMessage = (tone: string) => {
    const messages = {
      factual: "I'll track key data to help you understand your performance patterns: start and finish times of each goal, satisfaction ratings after completion, and optional voice or text memos. More detailed memos enable more precise insights based on your own observations.",
      sarcastic: "Alright, here's what I'm keeping tabs on: when you start and finish (or don't finish) your goals, how satisfied you actually felt afterward, and any voice or text memos you want to share. The more you tell me, the better I can connect the dots. No pressure though.",
      firm: "Here's what gets tracked: start and finish times for every goal, your satisfaction level after each one, and optional voice or text memos. Be thorough with your memos—detail drives clarity in the insights you'll receive.",
      encouraging: "I'll keep track of your journey: when you start and finish your goals, how satisfied you feel after each one, and any voice or text memos you'd like to share. The more you share in your memos, the richer and more meaningful your insights will be!",
    };
    return messages[tone as keyof typeof messages] || messages.encouraging;
  };

  const getInsightsMessage = (tone: string) => {
    const messages = {
      factual: "I provide analytical tools to visualize your progress: clean charts displaying completion rates and satisfaction trends, weekly performance summaries, and pattern-based insights derived from your reflections.",
      sarcastic: "You'll get some pretty charts showing when you're crushing it (and when you're not), weekly summaries that tell it like it is, and insights pulled straight from what you've been saying. Basically, I organize the chaos.",
      firm: "You'll see your focus rhythm through clear charts, weekly summaries, and insights built from your own reflections. No fluff—just what the data shows.",
      encouraging: "You'll discover your focus rhythm through beautiful charts, helpful weekly summaries, and meaningful insights drawn from your own reflections. It's all about helping you see your progress and patterns!",
    };
    return messages[tone as keyof typeof messages] || messages.encouraging;
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {/* Welcome Screen */}
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col p-8 justify-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex items-center justify-center mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-[#7DD3C0] to-[#A8E6CF] rounded-3xl flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Slogan */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mb-12 space-y-4"
            >
              <h1 className="text-[#2E3F4F]">FocusSprint</h1>
              <p className="text-lg text-[#4A5C6A] italic px-4">
                "When focus drifts, we bring you back"
              </p>
            </motion.div>

            {/* Continue Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={() => setStep('intro')}
                className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12 flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Introduction Screen */}
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col p-8 justify-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 mb-12"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#7DD3C0] to-[#A8E6CF] rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              
              <p className="text-[#2E3F4F] leading-relaxed text-center">
                FocusSprint is an AI agent that helps you understand your rhythm: when focus flows, when it drifts, and what brings it back.
              </p>
              
              <p className="text-[#4A5C6A] text-sm leading-relaxed text-center">
                You'll get reminders at times you choose to help reconnect with your goal.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={() => setStep('privacy')}
                className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12"
              >
                Continue
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Privacy Screen */}
        {step === 'privacy' && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col p-8 justify-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 mb-12"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#7DD3C0] to-[#A8E6CF] rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl">🔒</span>
              </div>
              
              <div className="space-y-4">
                <p className="text-[#2E3F4F] leading-relaxed text-center">
                  Your data is encrypted and stays private.
                </p>
                
                <p className="text-[#4A5C6A] text-sm leading-relaxed text-center">
                  Delete your history anytime.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={() => setStep('tone')}
                className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12"
              >
                I Understand
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Tone Selection Screen */}
        {step === 'tone' && (
          <motion.div
            key="tone"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col p-8 justify-center"
          >
            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8 space-y-2"
            >
              <h1 className="text-[#2E3F4F]">Choose Your Tone</h1>
              <p className="text-[#6B7280]">
                How should your accountability partner speak to you?
              </p>
            </motion.div>

            {/* Tone Selection */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-3 mb-8"
            >
              <label className="text-sm text-[#6B7280]">Select a tone</label>
              <Select value={selectedTone} onValueChange={setSelectedTone}>
                <SelectTrigger className="w-full h-14 bg-white border-[#E8E6E1] rounded-2xl px-4">
                  <SelectValue placeholder="Choose your tone..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-[#E8E6E1]">
                  {tones.map((tone) => (
                    <SelectItem
                      key={tone.value}
                      value={tone.value}
                      className="rounded-xl cursor-pointer"
                    >
                      <span className="text-[#2E3F4F]">{tone.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>

            {/* Description Box - Only shows after selection */}
            {selectedTone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#E8F5F1] border border-[#7DD3C0] rounded-2xl p-4 mb-8"
              >
                <p className="text-sm text-[#4A5C6A]">
                  {tones.find((t) => t.value === selectedTone)?.description}
                </p>
              </motion.div>
            )}

            {/* Continue Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={() => setStep('tracking')}
                disabled={!selectedTone}
                className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12 disabled:opacity-50"
              >
                Meet Your Partner
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Tracking Explanation Screen */}
        {step === 'tracking' && selectedTone && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col p-8 justify-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 mb-12"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#7DD3C0] to-[#A8E6CF] rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl">📊</span>
              </div>
              
              <p className="text-[#2E3F4F] leading-relaxed">
                {getTrackingMessage(selectedTone)}
              </p>

              <div className="bg-[#E8F5F1] border border-[#D4F4E8] rounded-2xl p-4 space-y-2">
                <p className="text-sm text-[#4A5C6A]">I'll note:</p>
                <ul className="text-sm text-[#4A5C6A] space-y-1 ml-4">
                  <li>• Start and finish times of goal</li>
                  <li>• Satisfaction after each goal</li>
                  <li>• Voice or text memos</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={() => setStep('insights')}
                className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12"
              >
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Insights Explanation Screen */}
        {step === 'insights' && selectedTone && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col p-8 justify-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 mb-12"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#7DD3C0] to-[#A8E6CF] rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl">✨</span>
              </div>
              
              <p className="text-[#2E3F4F] leading-relaxed">
                {getInsightsMessage(selectedTone)}
              </p>

              <div className="bg-[#E8F5F1] border border-[#D4F4E8] rounded-2xl p-4 space-y-2">
                <p className="text-sm text-[#4A5C6A]">You'll see:</p>
                <ul className="text-sm text-[#4A5C6A] space-y-1 ml-4">
                  <li>• Clean charts</li>
                  <li>• Weekly summaries</li>
                  <li>• Insights from your reflections</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={handleComplete}
                className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12"
              >
                Let's Begin
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
