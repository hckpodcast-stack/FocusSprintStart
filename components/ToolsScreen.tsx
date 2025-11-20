import { ArrowLeft, Sparkles, Lightbulb, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToolsScreenProps {
  showInsightsAdded: boolean;
  showIdeasAdded: boolean;
  onBack: () => void;
  onViewIdeas: () => void;
  onViewInsights: () => void;
  onViewVault: () => void;
}

export function ToolsScreen({ showInsightsAdded, showIdeasAdded, onBack, onViewIdeas, onViewInsights, onViewVault }: ToolsScreenProps) {
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
          Tools
        </motion.h1>
      </div>

      {/* Tools List */}
      <div className="flex-1 px-6 space-y-3 overflow-y-auto pb-6">
        {/* Ideas */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <button
            onClick={onViewIdeas}
            className="w-full p-5 bg-white/50 border border-[#E8E6E1] rounded-3xl flex items-center justify-between group hover:bg-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E8F5F1] rounded-2xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#7DD3C0]" />
              </div>
              <span className="text-[#2E3F4F]">Ideas</span>
            </div>
            <div className="w-6 h-6 border border-[#D1D5DB] rounded-full flex items-center justify-center group-hover:border-[#9CA3AF] transition-colors">
              <span className="text-[#9CA3AF] text-sm">→</span>
            </div>
          </button>

          {/* Ideas Added Animation */}
          <AnimatePresence>
            {showIdeasAdded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#7DD3C0] text-white px-4 py-2 rounded-full shadow-lg text-sm"
              >
                Ideas added
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="relative"
        >
          <button
            onClick={onViewInsights}
            className="w-full p-5 bg-white/50 border border-[#E8E6E1] rounded-3xl flex items-center justify-between group hover:bg-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E8F5F1] rounded-2xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-[#7DD3C0]" />
              </div>
              <span className="text-[#2E3F4F]">Insights</span>
            </div>
            <div className="w-6 h-6 border border-[#D1D5DB] rounded-full flex items-center justify-center group-hover:border-[#9CA3AF] transition-colors">
              <span className="text-[#9CA3AF] text-sm">→</span>
            </div>
          </button>

          {/* Insights Added Animation */}
          <AnimatePresence>
            {showInsightsAdded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#7DD3C0] text-white px-4 py-2 rounded-full shadow-lg text-sm"
              >
                Insights added
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Vault */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={onViewVault}
            className="w-full p-5 bg-white/50 border border-[#E8E6E1] rounded-3xl flex items-center justify-between group hover:bg-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E8F5F1] rounded-2xl flex items-center justify-center">
                <Archive className="w-5 h-5 text-[#7DD3C0]" />
              </div>
              <span className="text-[#2E3F4F]">Vault</span>
            </div>
            <div className="w-6 h-6 border border-[#D1D5DB] rounded-full flex items-center justify-center group-hover:border-[#9CA3AF] transition-colors">
              <span className="text-[#9CA3AF] text-sm">→</span>
            </div>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
