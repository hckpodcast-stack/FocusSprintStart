import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { useRef, useState, useEffect } from 'react';

interface ContractScreenProps {
  goalTitle: string;
  whyItMatters: string;
  dueDate: Date;
  onConfirm: () => void;
  onBack: () => void;
}

export function ContractScreen({
  goalTitle,
  whyItMatters,
  dueDate,
  onConfirm,
  onBack,
}: ContractScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#2E3F4F';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setIsDrawing(true);
    setLastPoint({ x, y });
    setHasSigned(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (lastPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
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
      </div>

      {/* Content - Contract Design */}
      <div className="flex-1 px-6 flex flex-col justify-center pb-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Header Text */}
          <div className="text-center">
            <h2 className="text-[#2E3F4F] mb-2">
              You just made a promise to your future self:
            </h2>
          </div>

          {/* Contract Box */}
          <div className="bg-white border-2 border-[#E8E6E1] rounded-3xl p-8 space-y-6">
            {/* Goal */}
            <div className="space-y-2">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">
                Goal
              </p>
              <p className="text-[#2E3F4F]">{goalTitle}</p>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E8E6E1]" />

            {/* Why it matters */}
            <div className="space-y-2">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">
                Why it matters
              </p>
              <p className="text-[#4A5C6A] text-sm leading-relaxed italic">
                "{whyItMatters}"
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E8E6E1]" />

            {/* Time window */}
            <div className="space-y-2">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wide">
                Time window
              </p>
              <p className="text-[#2E3F4F]">{formatDateTime(dueDate)}</p>
            </div>
          </div>

          {/* Signature Line */}
          <div className="flex items-center justify-center gap-3 px-8">
            <div className="flex-1 border-b border-[#E8E6E1]" />
            <span className="text-xs text-[#9CA3AF]">✍️</span>
            <div className="flex-1 border-b border-[#E8E6E1]" />
          </div>

          {/* Signature Canvas */}
          <div className="relative bg-white border-2 border-dashed border-[#E8E6E1] rounded-2xl overflow-hidden" style={{ height: '120px' }}>
            {/* Placeholder */}
            {!hasSigned && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm text-[#9CA3AF]">Awaiting signature</p>
              </div>
            )}
            
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={600}
              height={120}
              className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onTouchCancel={stopDrawing}
            />

            {/* Clear Button */}
            {hasSigned && (
              <button
                onClick={clearSignature}
                className="absolute bottom-2 right-2 text-xs text-[#9CA3AF] hover:text-[#2E3F4F] transition-colors bg-white/80 px-2 py-1 rounded"
              >
                clear signature
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Lock Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-6"
      >
        <Button
          onClick={onConfirm}
          className="w-full bg-[#2E3F4F] hover:bg-[#3D4F5F] text-white rounded-2xl h-12 disabled:bg-[#E8E6E1] disabled:text-[#9CA3AF] disabled:cursor-not-allowed"
          disabled={!hasSigned}
        >
          Lock this in
        </Button>
      </motion.div>
    </motion.div>
  );
}