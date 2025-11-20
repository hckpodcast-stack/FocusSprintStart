import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Mic, Circle } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import type { Intention } from '../App';

interface ReflectionLogScreenProps {
  intentions: Intention[];
  onBack: () => void;
  onGenerateInsights: (selectedGoals: Intention[]) => void;
}

export function ReflectionLogScreen({ intentions, onBack, onGenerateInsights }: ReflectionLogScreenProps) {
  const [selectedGoalIds, setSelectedGoalIds] = useState<Set<string>>(new Set());
  const completedGoals = intentions.filter(i => i.completed === true && i.reflectionVoice);
  const missedGoals = intentions.filter(i => i.completed === false && i.reflectionVoice);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const toggleGoalSelection = (goalId: string) => {
    const newSelected = new Set(selectedGoalIds);
    if (newSelected.has(goalId)) {
      newSelected.delete(goalId);
    } else {
      newSelected.add(goalId);
    }
    setSelectedGoalIds(newSelected);
  };

  const handleGenerateInsights = () => {
    const selectedGoals = intentions.filter(i => selectedGoalIds.has(i.id));
    if (selectedGoals.length > 0) {
      onGenerateInsights(selectedGoals);
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
          className="mt-4  text-[#2E3F4F]"
        >
          Reflection Log
        </motion.h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 space-y-6 overflow-y-auto pb-6">
        {/* Completed Goals */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#7DD3C0]" />
            <h2 className="text-[#2E3F4F]">Completed Goals</h2>
          </div>

          {completedGoals.length > 0 ? (
            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <Card key={goal.id} className="p-4 bg-white border-[#E8E6E1] rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">{goal.mood}</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[#2E3F4F]">{goal.text}</p>
                      <p className="text-xs text-[#9CA3AF]">{formatDate(goal.dueDate)}</p>
                      {goal.reflectionVoice && (
                        <div className="flex items-center gap-2 pt-2">
                          <Mic className="w-4 h-4 text-[#7DD3C0]" />
                          <p className="text-sm text-[#4A5C6A] italic">
                            Voice reflection recorded
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleGoalSelection(goal.id)}
                      className="flex-shrink-0"
                    >
                      {selectedGoalIds.has(goal.id) ? (
                        <CheckCircle className="w-6 h-6 text-[#7DD3C0] fill-[#7DD3C0]" />
                      ) : (
                        <Circle className="w-6 h-6 text-[#E8E6E1]" />
                      )}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 bg-white/50 border-[#E8E6E1] rounded-2xl">
              <p className="text-sm text-[#9CA3AF] text-center">
                No completed goals yet
              </p>
            </Card>
          )}
        </motion.div>

        {/* Missed Goals */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-[#9CA3AF]" />
            <h2 className="text-[#2E3F4F]">Missed Goals</h2>
          </div>

          {missedGoals.length > 0 ? (
            <div className="space-y-3">
              {missedGoals.map((goal) => (
                <Card key={goal.id} className="p-4 bg-white border-[#E8E6E1] rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">{goal.mood}</div>
                    <div className="flex-1 space-y-1">
                      <p className="text-[#2E3F4F]">{goal.text}</p>
                      <p className="text-xs text-[#9CA3AF]">{formatDate(goal.dueDate)}</p>
                      {goal.reflectionVoice && (
                        <div className="flex items-center gap-2 pt-2">
                          <Mic className="w-4 h-4 text-[#7DD3C0]" />
                          <p className="text-sm text-[#4A5C6A] italic">
                            Voice reflection recorded
                          </p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => toggleGoalSelection(goal.id)}
                      className="flex-shrink-0"
                    >
                      {selectedGoalIds.has(goal.id) ? (
                        <CheckCircle className="w-6 h-6 text-[#7DD3C0] fill-[#7DD3C0]" />
                      ) : (
                        <Circle className="w-6 h-6 text-[#E8E6E1]" />
                      )}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 bg-white/50 border-[#E8E6E1] rounded-2xl">
              <p className="text-sm text-[#9CA3AF] text-center">
                No missed goals yet
              </p>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Generate Insights Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-6"
      >
        <Button
          onClick={handleGenerateInsights}
          disabled={selectedGoalIds.size === 0}
          className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12 disabled:opacity-50"
        >
          Tell Me More
        </Button>
      </motion.div>
    </motion.div>
  );
}
