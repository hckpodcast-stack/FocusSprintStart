import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "./ui/button";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export function VoiceRecorder({
  onRecordingComplete,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformBars, setWaveformBars] = useState<number[]>(
    new Array(40).fill(0.3),
  );

  const timerRef = useRef<number>();
  const waveformRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (waveformRef.current)
        clearInterval(waveformRef.current);
    };
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setHasRecording(false);

    // Timer
    timerRef.current = window.setInterval(() => {
      setRecordingTime((t) => {
        if (t >= 60) {
          stopRecording();
          return 60;
        }
        return t + 1;
      });
    }, 1000);

    // Animated waveform
    waveformRef.current = window.setInterval(() => {
      setWaveformBars((bars) =>
        bars.map(() => Math.random() * 0.7 + 0.3),
      );
    }, 100);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecording(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (waveformRef.current) clearInterval(waveformRef.current);

    // Create mock blob
    const mockBlob = new Blob(["mock audio data"], {
      type: "audio/wav",
    });
    onRecordingComplete(mockBlob);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control audio playback
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white border border-[#E8E6E1] rounded-2xl p-5 space-y-4">
      {/* Waveform */}
      <div className="h-20 flex items-center justify-center gap-1">
        {waveformBars.map((height, i) => (
          <motion.div
            key={i}
            className={`w-1 rounded-full ${isRecording ? "bg-[#7DD3C0]" : hasRecording ? "bg-[#7DD3C0]" : "bg-[#E8E6E1]"}`}
            animate={{
              height: isRecording
                ? `${height * 100}%`
                : hasRecording
                  ? "30%"
                  : "20%",
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#6B7280]">
          {formatTime(recordingTime)} / 3:00
        </span>

        <div className="flex items-center gap-2">
          {hasRecording && !isRecording && (
            <Button
              onClick={togglePlayback}
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10 border-[#E8E6E1]"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-[#4A5C6A]" />
              ) : (
                <Play className="w-4 h-4 text-[#4A5C6A]" />
              )}
            </Button>
          )}

          {!isRecording ? (
            <Button
              onClick={startRecording}
              className="rounded-full w-12 h-12 bg-[#7DD3C0] hover:bg-[#6BC4B0]"
            >
              <Mic className="w-5 h-5 text-white" />
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              className="rounded-full w-12 h-12 bg-[#F87171] hover:bg-[#EF4444]"
            >
              <Square className="w-5 h-5 text-white" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}