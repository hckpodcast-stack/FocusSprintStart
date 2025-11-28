import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type VoiceMemoCardProps = {
  maxSeconds?: number;
  initialUri?: string | null;
  onChange?: (info: { uri: string | null; durationSeconds: number }) => void;
};

export function VoiceMemoCard(props: VoiceMemoCardProps) {
  const { maxSeconds = 3 * 60, initialUri = null, onChange } = props;

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [waveformValues, setWaveformValues] = useState<number[]>(() =>
    new Array(40).fill(0.3),
  );
  const [recordingUri, setRecordingUri] = useState<string | null>(initialUri);

  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const playbackSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordSeconds((previous) => {
          const next = Math.min(previous + 0.1, maxSeconds);
          if (next >= maxSeconds) {
            setIsRecording(false);
          }
          return next;
        });
        setWaveformValues((previous) => previous.map(() => 0.3 + Math.random() * 0.7));
      }, 120);
    } else if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    };
  }, [isRecording, maxSeconds]);

  useEffect(() => {
    onChange?.({ uri: recordingUri, durationSeconds: recordSeconds });
  }, [recordSeconds, recordingUri, onChange]);

  const formatDuration = (seconds: number) => {
    const whole = Math.floor(seconds);
    const mins = Math.floor(whole / 60);
    const secs = whole % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleRecord = async () => {
    if (!isRecording) {
      setIsPlaying(false);
      setRecordingUri(null);
      setRecordSeconds(0);
      setPlaybackSeconds(0);
      setIsRecording(true);
      try {
        const permission = await Audio.requestPermissionsAsync();
        if (!permission.granted) {
          setIsRecording(false);
          return;
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );
        recordingRef.current = recording;
      } catch (error) {
        console.log("Failed to start recording", error);
        setIsRecording(false);
      }
      return;
    }

    setIsRecording(false);
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        setRecordingUri(uri ?? null);
        const status = await recordingRef.current.getStatusAsync();
        if (
          status.isLoaded &&
          typeof status.durationMillis === "number" &&
          status.durationMillis > 0
        ) {
          setRecordSeconds(status.durationMillis / 1000);
        }
      }
    } catch (error) {
      console.log("Failed to stop recording", error);
    } finally {
      recordingRef.current = null;
    }
  };

  const handleTogglePlayback = async () => {
    if (recordSeconds <= 0 || isRecording) return;
    if (!recordingUri) return;

    if (isPlaying) {
      try {
        await playbackSoundRef.current?.stopAsync();
        await playbackSoundRef.current?.unloadAsync();
      } catch (error) {
        console.log("Failed to stop playback", error);
      }
      playbackSoundRef.current = null;
      setIsPlaying(false);
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
      await sound.setVolumeAsync(1.0);
      playbackSoundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if ("positionMillis" in status && typeof status.positionMillis === "number") {
          setPlaybackSeconds(status.positionMillis / 1000);
        }
        if (status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
          playbackSoundRef.current = null;
        }
      });
      setIsPlaying(true);
      await sound.playAsync();
    } catch (error) {
      console.log("Failed to play sound", error);
    }
  };

  const renderWaveform = () => (
    <View style={styles.waveformRow}>
      {waveformValues.map((value, index) => (
        <View
          key={index}
          style={[
            styles.waveformBar,
            {
              height: 16 + value * 16,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.card}>
      {renderWaveform()}
      <View style={styles.voiceBottomRow}>
        <View style={styles.voiceTimerRow}>
          <Text style={styles.voiceTimerText}>
            {formatDuration(isPlaying ? playbackSeconds : recordSeconds)} /{" "}
            {formatDuration(maxSeconds)}
          </Text>
        </View>
        <View style={styles.voiceButtonsRow}>
          {recordSeconds > 0 && !isRecording && (
            <TouchableOpacity
              style={styles.voicePlayButton}
              onPress={handleTogglePlayback}
              activeOpacity={0.9}
            >
              <Feather
                name={isPlaying ? "pause" : "play"}
                size={18}
                color="#3D4F5F"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.recordButton}
            activeOpacity={0.9}
            onPress={handleToggleRecord}
          >
            <Feather name={isRecording ? "square" : "mic"} size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  waveformRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 40,
    marginBottom: 16,
  },
  waveformBar: {
    width: 4,
    borderRadius: 2,
    marginHorizontal: 1,
    backgroundColor: "#38B2AC",
  },
  voiceBottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  voiceTimerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  voiceTimerText: {
    fontSize: 13,
    color: "#8D9299",
  },
  voiceButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  voicePlayButton: {
    marginRight: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D4D7DD",
    alignItems: "center",
    justifyContent: "center",
  },
  recordButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7DD3C0",
    alignItems: "center",
    justifyContent: "center",
  },
});

