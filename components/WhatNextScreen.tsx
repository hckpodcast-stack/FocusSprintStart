import { CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import type { Intention } from '../App';

interface WhatNextScreenProps {
  intention: Intention;
  onCreateNew: () => void;
  onGoHome: () => void;
}

export function WhatNextScreen({ intention, onCreateNew, onGoHome }: WhatNextScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Success/Miss Indicator */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              intention.completed
                ? 'bg-gradient-to-br from-[#D4F4E8] to-[#C0EFE0]'
                : 'bg-gradient-to-br from-[#F0EEEB] to-[#E8E6E1]'
            }`}
          >
            {intention.completed ? (
              <CheckCircle className="w-10 h-10 text-[#7DD3C0]" />
            ) : (
              <XCircle className="w-10 h-10 text-[#6B7280]" />
            )}
          </motion.div>

          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[#2E3F4F]"
          >
            {intention.completed ? 'Well done!' : 'Keep going'}
          </motion.h2>
        </div>

        {/* Summary Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-white border-[#E8E6E1] rounded-3xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{intention.mood}</div>
              <div className="flex-1 space-y-1">
                <p className="text-[#2E3F4F]">{intention.text}</p>
                <p className="text-sm text-[#6B7280]">
                  {intention.completed ? 'Completed' : 'Missed'}
                </p>
              </div>
            </div>

            {intention.reflection && (
              <div className="pt-3 border-t border-[#F0EEEB]">
                <p className="text-sm text-[#4A5C6A] italic">
                  "{intention.reflection}"
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Button
            onClick={onCreateNew}
            className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create New goal</span>
          </Button>

          <Button
            onClick={onGoHome}
            variant="outline"
            className="w-full border border-[#E8E6E1] hover:bg-[#F5F3EF] rounded-2xl h-12"
          >
            Back to Home
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
