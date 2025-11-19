import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface InsightsGeneratorScreenProps {
  onSave: (insights: string) => void;
  onBack: () => void;
}

export function InsightsGeneratorScreen({ onSave, onBack }: InsightsGeneratorScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [insights, setInsights] = useState(
    "Based on your reflections, you tend to complete goals when you break them into smaller tasks and set clear deadlines. Your voice memos show increased motivation when you record your intentions early in the morning.\n\nMissed goals often correlate with overly ambitious timeframes. Consider giving yourself an extra day or two for complex projects. Your reflections indicate that external interruptions are a common challenge—perhaps try scheduling focused work blocks."
  );

  const handleSaveOrEdit = () => {
    if (isEditing) {
      onSave(insights);
    } else {
      setIsEditing(true);
    }
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
          Insights
        </motion.h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <label className="text-sm text-[#6B7280]">
            AI-generated personalized insights
          </label>
          {isEditing ? (
            <Textarea
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              className="min-h-64 border-[#E8E6E1] rounded-2xl p-4 resize-none"
            />
          ) : (
            <div className="bg-white border border-[#E8E6E1] rounded-2xl p-4 min-h-64">
              <p className="text-[#2E3F4F] whitespace-pre-wrap">{insights}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Action Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6"
      >
        <Button
          onClick={handleSaveOrEdit}
          className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12"
        >
          {isEditing ? 'Save Insights' : 'Edit Insights'}
        </Button>
      </motion.div>
    </motion.div>
  );
}
