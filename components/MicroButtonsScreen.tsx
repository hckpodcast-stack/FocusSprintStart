import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';

interface MicroButtonsScreenProps {
  onBack: () => void;
  onComplete: (selections: {
    goalType?: string;
    feeling?: string;
    friction?: string;
  }) => void;
}

const goalTypes = [
  { value: 'launch', label: '🚀 Launch' },
  { value: 'build', label: '🧱 Build' },
  { value: 'revenue', label: '💰 Revenue' },
  { value: 'audience', label: '📣 Audience' },
  { value: 'learning', label: '🧠 Learning' },
];

const feelings = [
  { value: 'great', label: 'Great' },
  { value: 'calm', label: 'Calm' },
  { value: 'okay', label: 'Okay' },
  { value: 'tough', label: 'Tough' },
  { value: 'frustrated', label: 'Frustrated' },
];

const frictions = [
  { value: 'not-sure', label: '❓ Not sure what to do first' },
  { value: 'slow-execution', label: '🐢 Slow execution' },
  { value: 'context-switching', label: '🧨 Context switching' },
  { value: 'fake-productivity', label: '🧽 Fake productivity' },
];

export function MicroButtonsScreen({ onBack, onComplete }: MicroButtonsScreenProps) {
  const [selectedGoalType, setSelectedGoalType] = useState<string | undefined>();
  const [selectedFeeling, setSelectedFeeling] = useState<string | undefined>();
  const [selectedFriction, setSelectedFriction] = useState<string | undefined>();

  const handleNext = () => {
    onComplete({
      goalType: selectedGoalType,
      feeling: selectedFeeling,
      friction: selectedFriction,
    });
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
        <motion.p
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-sm text-[#6B7280]"
        >
          Just a few quick taps to tailor your experience.
        </motion.p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 space-y-6 overflow-y-auto pb-6">
        {/* Goal Type */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <label className="text-sm text-[#6B7280]">Goal type:</label>
          <div className="flex flex-wrap gap-2">
            {goalTypes.map((type) => (
              <button
                key={type.value}
                onClick={() =>
                  setSelectedGoalType(
                    selectedGoalType === type.value ? undefined : type.value
                  )
                }
                className={`px-4 py-2 rounded-2xl border-2 transition-all ${
                  selectedGoalType === type.value
                    ? 'bg-[#E8F5F1] border-[#7DD3C0] text-[#2E3F4F]'
                    : 'bg-white border-[#E8E6E1] text-[#4A5C6A] hover:bg-[#F5F3EF]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Feeling */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <label className="text-sm text-[#6B7280]">
            How are you feeling about this goal:
          </label>
          <div className="flex flex-wrap gap-2">
            {feelings.map((feeling) => (
              <button
                key={feeling.value}
                onClick={() =>
                  setSelectedFeeling(
                    selectedFeeling === feeling.value ? undefined : feeling.value
                  )
                }
                className={`px-4 py-2 rounded-2xl border-2 transition-all ${
                  selectedFeeling === feeling.value
                    ? 'bg-[#E8F5F1] border-[#7DD3C0] text-[#2E3F4F]'
                    : 'bg-white border-[#E8E6E1] text-[#4A5C6A] hover:bg-[#F5F3EF]'
                }`}
              >
                {feeling.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Friction */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <label className="text-sm text-[#6B7280]">
            Biggest friction right now:
          </label>
          <div className="flex flex-col gap-2">
            {frictions.map((friction) => (
              <button
                key={friction.value}
                onClick={() =>
                  setSelectedFriction(
                    selectedFriction === friction.value ? undefined : friction.value
                  )
                }
                className={`px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                  selectedFriction === friction.value
                    ? 'bg-[#E8F5F1] border-[#7DD3C0] text-[#2E3F4F]'
                    : 'bg-white border-[#E8E6E1] text-[#4A5C6A] hover:bg-[#F5F3EF]'
                }`}
              >
                {friction.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Next Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-6"
      >
        <Button
          onClick={handleNext}
          className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12"
        >
          Next
        </Button>
      </motion.div>
    </motion.div>
  );
}