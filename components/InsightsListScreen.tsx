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

interface InsightsListScreenProps {
  insights: SavedInsight[];
  onBack: () => void;
  onSelectInsight: (insight: SavedInsight) => void;
  weeklyMomentumData?: Array<{ day: string; value: number; satisfaction: number }>;
}

export function InsightsListScreen({ insights, onBack, onSelectInsight, weeklyMomentumData }: InsightsListScreenProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  };

  // Sort insights by date (newest first)
  const sortedInsights = [...insights].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Default weekly data if not provided
  const defaultWeeklyData = [
    { day: 'Mon', value: 3, satisfaction: 7 },
    { day: 'Tue', value: 4, satisfaction: 8 },
    { day: 'Wed', value: 2, satisfaction: 5 },
    { day: 'Thu', value: 5, satisfaction: 9 },
    { day: 'Fri', value: 3, satisfaction: 6 },
    { day: 'Sat', value: 0, satisfaction: 0 },
    { day: 'Sun', value: 4, satisfaction: 7 },
  ];

  const weeklyData = weeklyMomentumData || defaultWeeklyData;

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
      <div className="flex-1 px-6 space-y-4 overflow-y-auto pb-6">
        {/* Insights List */}
        {sortedInsights.length > 0 ? (
          sortedInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <button
                onClick={() => onSelectInsight(insight)}
                className="w-full"
              >
                <Card className="p-5 bg-white border-[#E8E6E1] rounded-2xl hover:bg-[#F5F3EF] transition-colors">
                  {insight.goalTitle ? (
                    <div className="space-y-3 text-left">
                      {/* Goal Status Badge */}
                      <div className="flex items-center gap-2">
                        {insight.goalStatus === 'completed' ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#E8F5F1] rounded-full">
                            <CheckCircle className="w-3.5 h-3.5 text-[#7DD3C0]" />
                            <span className="text-xs text-[#7DD3C0]">Completed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F5F3EF] rounded-full">
                            <XCircle className="w-3.5 h-3.5 text-[#9CA3AF]" />
                            <span className="text-xs text-[#9CA3AF]">Missed</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Goal Title */}
                      <p className="text-[#2E3F4F]">{insight.goalTitle}</p>
                      
                      {/* Summary */}
                      <p className="text-sm text-[#6B7280] italic">"{insight.summary}"</p>
                      
                      {/* Date */}
                      <p className="text-xs text-[#9CA3AF]">{formatDate(insight.date)}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 text-left">
                      <p className="text-xs text-[#9CA3AF]">{formatDate(insight.date)}</p>
                      <p className="text-[#2E3F4F] whitespace-pre-wrap">{insight.summary}</p>
                    </div>
                  )}
                </Card>
              </button>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 bg-white/50 border-[#E8E6E1] rounded-2xl">
              <p className="text-sm text-[#9CA3AF] text-center">
                No insights generated yet
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}