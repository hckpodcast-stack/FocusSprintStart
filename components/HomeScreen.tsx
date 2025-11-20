import { useState } from "react";
import { Calendar, BookOpen, Wrench, Menu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import type { Intention } from "../App";

interface HomeScreenProps {
  upcomingIntentions: Intention[];
  streak: number;
  onCreateNew: () => void;
  onViewLog: () => void;
  onViewTools: () => void;
  onCheckIn: (intention: Intention) => void;
  onOpenSettings: () => void;
  showMemoSaved?: boolean;
  showGoalLockedIn?: boolean;
}

export function HomeScreen({
  upcomingIntentions,
  streak,
  onCreateNew,
  onViewLog,
  onViewTools,
  onCheckIn,
  onOpenSettings,
  showMemoSaved,
  showGoalLockedIn,
}: HomeScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  
  // Check if user has logged any reflection
  const hasLoggedReflection = upcomingIntentions.some(
    (intention) => intention.mood || intention.reflectionVoice || intention.textReflection
  );
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getDaysUntil = (date: Date) => {
    const days = Math.ceil(
      (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (days === 0) return { text: "Today", isOverdue: false };
    if (days === 1)
      return { text: "Tomorrow", isOverdue: false };
    if (days < 0) {
      return {
        text: `${Math.abs(days)} days overdue`,
        isOverdue: true,
      };
    }
    return { text: `${days} days`, isOverdue: false };
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 50;
    if (info.offset.x > threshold && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (
      info.offset.x < -threshold &&
      currentIndex < Math.min(upcomingIntentions.length - 1, 2)
    ) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const maxGoals = Math.min(upcomingIntentions.length, 3);
  const currentIntention = upcomingIntentions[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      {/* Memo Saved Popup */}
      <AnimatePresence>
        {showMemoSaved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#E8F5F1] border border-[#7DD3C0] rounded-2xl px-6 py-3 shadow-lg"
          >
            <p className="text-sm text-[#2E3F4F]">✓ Memo Saved</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Locked In Popup */}
      <AnimatePresence>
        {showGoalLockedIn && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#E8F5F1] border border-[#7DD3C0] rounded-2xl px-6 py-3 shadow-lg"
          >
            <p className="text-sm text-[#2E3F4F]">✓ Goal locked in</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="space-y-2">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#7DD3C0] rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-[#6B7280]">
                {streak} day streak
              </span>
            </div>
            {/* Reflection Prompt */}
            {!hasLoggedReflection && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-[#9CA3AF] pl-4"
              >
                🧠 1 reflection away from your next insight report
              </motion.p>
            )}
          </div>
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-[#E8E6E1]/50 transition-colors"
          >
            <Menu className="w-5 h-5 text-[#4A5C6A]" />
          </button>
        </motion.div>
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-semibold text-[#2E3F4F]"
        >
          Intention Archive
        </motion.h1>
      </div>

      {/* Next Intention Card */}
      {currentIntention && maxGoals > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              drag={maxGoals > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 bg-[rgb(255,255,255)] border-[#E8E6E1] rounded-3xl shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">
                        Up Next
                      </p>
                      <p className="text-[#2E3F4F]">
                        {currentIntention.text}
                      </p>
                    </div>
                    {/* Numeric Indicator */}
                    <div className="w-10 h-10 rounded-full bg-[#F5F3EF] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-[#4A5C6A]">
                        {currentIndex + 1}/{maxGoals}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(currentIntention.dueDate)}
                      </span>
                    </div>
                    {(() => {
                      const daysInfo = getDaysUntil(
                        currentIntention.dueDate,
                      );
                      return (
                        <div
                          className={`text-xs text-[#2E3F4F] px-3 py-1 rounded-full ${
                            daysInfo.isOverdue
                              ? "bg-[#FFE5CC]"
                              : "bg-[#D4F4E8]"
                          }`}
                        >
                          {daysInfo.text}
                        </div>
                      );
                    })()}
                  </div>

                  <Button
                    onClick={() => onCheckIn(currentIntention)}
                    className="w-full bg-[#1D3245] active:bg-gradient-to-r active:from-[#1D3245] active:to-white text-white rounded-2xl h-11"
                  >
                    Check In
                  </Button>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Swipe Indicators */}
          {maxGoals > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {Array.from({ length: maxGoals }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex
                      ? "w-6 bg-[#7DD3C0]"
                      : "w-1.5 bg-[#E8E6E1]"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Reflection Log */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={onViewLog}
          className="w-full p-5 bg-white/50 border border-[#E8E6E1] rounded-3xl flex items-center justify-between group hover:bg-white transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8F5F1] rounded-2xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#7DD3C0]" />
            </div>
            <span className="text-[#2E3F4F]">
              Reflection Log
            </span>
          </div>
          <div className="w-6 h-6 border border-[#D1D5DB] rounded-full flex items-center justify-center group-hover:border-[#9CA3AF] transition-colors">
            <span className="text-[#9CA3AF] text-sm">→</span>
          </div>
        </button>
      </motion.div>

      {/* Tools */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.43 }}
      >
        <button
          onClick={onViewTools}
          className="w-full p-5 bg-white/50 border border-[#E8E6E1] rounded-3xl flex items-center justify-between group hover:bg-white transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E8F5F1] rounded-2xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-[#7DD3C0]" />
            </div>
            <span className="text-[#2E3F4F]">Tools</span>
          </div>
          <div className="w-6 h-6 border border-[#D1D5DB] rounded-full flex items-center justify-center group-hover:border-[#9CA3AF] transition-colors">
            <span className="text-[#9CA3AF] text-sm">→</span>
          </div>
        </button>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-4"
      >
        <Button
          onClick={onCreateNew}
          className="w-full bg-[rgb(46,63,79)] hover:bg-[#3D4F5F] text-white rounded-2xl h-12"
        >
          Create a New Goal
        </Button>
      </motion.div>
    </motion.div>
  );
}