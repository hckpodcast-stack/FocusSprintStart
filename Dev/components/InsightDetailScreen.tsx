import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from './ui/card';

interface SavedInsight {
  id: string;
  goalTitle?: string;
  goalStatus?: 'completed' | 'missed';
  summary: string;
  fullText: string;
  date: Date;
}

interface InsightDetailScreenProps {
  insight: SavedInsight;
  onBack: () => void;
}

export function InsightDetailScreen({ insight, onBack }: InsightDetailScreenProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
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
          Insight
        </motion.h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 space-y-6 overflow-y-auto pb-6">
        {insight.goalTitle && (
          <>
            {/* Goal Status Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              {insight.goalStatus === 'completed' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#E8F5F1] rounded-full">
                  <CheckCircle className="w-4 h-4 text-[#7DD3C0]" />
                  <span className="text-sm text-[#7DD3C0]">Completed</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#F5F3EF] rounded-full">
                  <XCircle className="w-4 h-4 text-[#9CA3AF]" />
                  <span className="text-sm text-[#9CA3AF]">Missed</span>
                </div>
              )}
            </motion.div>

            {/* Goal Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <h2 className="text-[#2E3F4F]">{insight.goalTitle}</h2>
            </motion.div>
          </>
        )}

        {/* Date */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-[#9CA3AF]">{formatDate(insight.date)}</p>
        </motion.div>

        {/* Full Insight Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="p-5 bg-white border-[#E8E6E1] rounded-2xl">
            <p className="text-[#4A5C6A] leading-relaxed whitespace-pre-wrap">{insight.fullText}</p>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
