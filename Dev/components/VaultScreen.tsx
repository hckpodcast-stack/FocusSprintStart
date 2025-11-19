import { ArrowLeft, Archive } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import type { Idea } from './IdeasListScreen';

interface VaultScreenProps {
  archivedIdeas: Idea[];
  onBack: () => void;
  onSelectIdea: (idea: Idea) => void;
}

export function VaultScreen({ archivedIdeas, onBack, onSelectIdea }: VaultScreenProps) {
  const formatCreatedDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
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
          Vault
        </motion.h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Ideas you've archived
        </p>
      </div>

      {/* Archived Ideas List */}
      <div className="flex-1 px-6 space-y-3 overflow-y-auto pb-6">
        {archivedIdeas.length > 0 ? (
          archivedIdeas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <button
                onClick={() => onSelectIdea(idea)}
                className="w-full"
              >
                <Card className="p-4 bg-white border-[#E8E6E1] rounded-2xl hover:bg-[#F5F3EF] transition-colors">
                  <div className="flex items-start gap-3">
                    <Archive className="w-5 h-5 text-[#9CA3AF] flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-left space-y-1">
                      <p className="text-[#2E3F4F]">{idea.title}</p>
                      <p className="text-xs text-[#9CA3AF]">
                        Created: {formatCreatedDate(idea.createdDate)}
                      </p>
                    </div>
                  </div>
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
                No archived ideas yet
              </p>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
