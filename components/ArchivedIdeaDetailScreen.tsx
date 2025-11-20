import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import type { Idea } from './IdeasListScreen';

interface ArchivedIdeaDetailScreenProps {
  idea: Idea;
  onBack: () => void;
}

export function ArchivedIdeaDetailScreen({ idea, onBack }: ArchivedIdeaDetailScreenProps) {
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
      </div>

      {/* Content */}
      <div className="flex-1 px-6 space-y-6 overflow-y-auto pb-6">
        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-[#2E3F4F]">{idea.title}</h1>
        </motion.div>
      </div>
    </motion.div>
  );
}
