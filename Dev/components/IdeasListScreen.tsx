import { useState } from 'react';
import { ArrowLeft, Sparkles, Archive, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export interface Idea {
  id: string;
  title: string;
  notificationDate?: Date;
  voiceMemo?: Blob;
  textDescription?: string;
  createdDate: Date;
}

interface IdeasListScreenProps {
  ideas: Idea[];
  onBack: () => void;
  onAddNew: () => void;
  onSelectIdea: (idea: Idea) => void;
  onArchiveIdea: (ideaId: string) => void;
  onDeleteIdea: (ideaId: string) => void;
}

export function IdeasListScreen({ ideas, onBack, onAddNew, onSelectIdea, onArchiveIdea, onDeleteIdea }: IdeasListScreenProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  // Sort ideas: with notification date (closest first), then without notification date
  const sortedIdeas = [...ideas].sort((a, b) => {
    if (a.notificationDate && b.notificationDate) {
      return a.notificationDate.getTime() - b.notificationDate.getTime();
    }
    if (a.notificationDate && !b.notificationDate) return -1;
    if (!a.notificationDate && b.notificationDate) return 1;
    return 0;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
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
          Ideas
        </motion.h1>
      </div>

      {/* Ideas List */}
      <div className="flex-1 px-6 space-y-3 overflow-y-auto pb-6">
        {sortedIdeas.length > 0 ? (
          sortedIdeas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="relative"
            >
              {/* Action Buttons (shown when dragged) */}
              <AnimatePresence>
                {draggedId === idea.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-0 top-0 h-full flex items-center gap-2 pr-2"
                  >
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchiveIdea(idea.id);
                        setDraggedId(null);
                      }}
                      className="w-12 h-12 rounded-2xl bg-[#E8F5F1] flex items-center justify-center hover:bg-[#D4F4E8] transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Archive className="w-5 h-5 text-[#7DD3C0]" />
                    </motion.button>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteIdea(idea.id);
                        setDraggedId(null);
                      }}
                      className="w-12 h-12 rounded-2xl bg-[#FFE5E5] flex items-center justify-center hover:bg-[#FFD1D1] transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 className="w-5 h-5 text-[#EF4444]" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Swipeable Card */}
              <motion.div
                drag="x"
                dragConstraints={{ left: -100, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(event, info) => {
                  if (info.offset.x < -50) {
                    setDraggedId(idea.id);
                  } else if (info.offset.x > 20) {
                    setDraggedId(null);
                  }
                }}
                animate={{
                  x: draggedId === idea.id ? -100 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <button
                  onClick={() => {
                    if (draggedId !== idea.id) {
                      onSelectIdea(idea);
                    }
                  }}
                  className="w-full"
                >
                  <Card className="p-4 bg-white border-[#E8E6E1] rounded-2xl hover:bg-[#F5F3EF] transition-colors">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[#7DD3C0] flex-shrink-0 mt-0.5" />
                      <div className="flex-1 text-left space-y-1">
                        <p className="text-[#2E3F4F]">{idea.title}</p>
                        {idea.notificationDate && (
                          <p className="text-xs text-[#9CA3AF]">
                            Remind me: {formatDate(idea.notificationDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </button>
              </motion.div>
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
                No ideas saved yet
              </p>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Add Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6"
      >
        <Button
          onClick={onAddNew}
          className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12"
        >
          Add a New Idea
        </Button>
      </motion.div>
    </motion.div>
  );
}
