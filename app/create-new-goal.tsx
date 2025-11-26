import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { Reminder } from "../lib/goals-storage";
import { startGoalDraft } from "../lib/goal-draft";
import { VoiceMemoCard } from "../components/VoiceMemoCard";

type MemoMode = "voice" | "text";

type DatePickerOverlayProps = {
  initialDate: Date;
  minimumDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

type TimePickerOverlayProps = {
  initialDate: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

type ReminderModalProps = {
  visible: boolean;
  draftDate: Date;
  onChangeDate: (date: Date) => void;
  onChangeTime: (date: Date) => void;
  onAdd: () => void;
  onCancel: () => void;
  canAdd: boolean;
};

const MAX_REMINDERS = 4;
const MAX_RECORD_SECONDS = 3 * 60;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeLabel(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) {
    hours = 12;
  }
  const minuteText = minutes.toString().padStart(2, "0");
  return `${hours.toString().padStart(2, "0")}:${minuteText} ${period}`;
}

function formatDuration(seconds: number): string {
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function buildMonthMatrix(monthDate: Date): Date[][] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  let currentDay = 1 - startWeekday;
  const weeks: Date[][] = [];

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week: Date[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      week.push(new Date(year, month, currentDay));
      currentDay += 1;
    }
    weeks.push(week);
  }

  return weeks;
}

function mergeDatePart(datePart: Date, timeSource: Date): Date {
  const merged = new Date(datePart);
  merged.setHours(timeSource.getHours(), timeSource.getMinutes(), 0, 0);
  return merged;
}

function mergeTimePart(timeSource: Date, dateSource: Date): Date {
  const merged = new Date(dateSource);
  merged.setHours(timeSource.getHours(), timeSource.getMinutes(), 0, 0);
  return merged;
}

function DatePickerOverlay(props: DatePickerOverlayProps) {
  const { initialDate, minimumDate, onConfirm, onCancel } = props;
  const [visibleMonth, setVisibleMonth] = useState(startOfDay(initialDate));
  const [selectedDate, setSelectedDate] = useState(startOfDay(initialDate));

  const minDay = minimumDate ? startOfDay(minimumDate).getTime() : undefined;
  const monthMatrix = buildMonthMatrix(visibleMonth);

  const handleChangeMonth = (delta: number) => {
    const next = new Date(visibleMonth);
    next.setMonth(visibleMonth.getMonth() + delta, 1);
    setVisibleMonth(startOfDay(next));
  };

  const handleSelectDay = (day: Date, isDisabled: boolean) => {
    if (isDisabled) return;
    setSelectedDate(startOfDay(day));
    onConfirm(startOfDay(day));
    onCancel();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.calendarCard}>
        <View style={styles.calendarHeaderRow}>
          <TouchableOpacity
            onPress={() => handleChangeMonth(-1)}
            style={styles.calendarHeaderButton}
            hitSlop={8}
          >
            <Feather name="chevron-left" size={18} color="#3D4F5F" />
          </TouchableOpacity>
          <Text style={styles.calendarHeaderTitle}>
            {visibleMonth.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </Text>
          <TouchableOpacity
            onPress={() => handleChangeMonth(1)}
            style={styles.calendarHeaderButton}
            hitSlop={8}
          >
            <Feather name="chevron-right" size={18} color="#3D4F5F" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarWeekdaysRow}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((label) => (
            <Text key={label} style={styles.calendarWeekdayText}>
              {label}
            </Text>
          ))}
        </View>

        {monthMatrix.map((week, index) => {
          const monthIndex = visibleMonth.getMonth();
          return (
            <View key={index} style={styles.calendarWeekRow}>
              {week.map((day) => {
                const isCurrentMonth = day.getMonth() === monthIndex;
                const isSelected = sameDay(day, selectedDate);
                const isBeforeMin = minDay !== undefined && startOfDay(day).getTime() < minDay;
                const isDisabled = !isCurrentMonth || isBeforeMin;

                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[
                      styles.calendarDayCell,
                      isSelected && styles.calendarDaySelected,
                      isDisabled && styles.calendarDayDisabled,
                    ]}
                    onPress={() => handleSelectDay(day, isDisabled)}
                    disabled={isDisabled}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isDisabled && styles.calendarDayTextDisabled,
                        isSelected && styles.calendarDayTextSelected,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function TimePickerOverlay(props: TimePickerOverlayProps) {
  const { initialDate, onConfirm, onCancel } = props;
  const initialHours24 = initialDate.getHours();
  const initialMinutes = initialDate.getMinutes();
  const initialPeriod = initialHours24 >= 12 ? "PM" : "AM";
  let initialHour12 = initialHours24 % 12;
  if (initialHour12 === 0) {
    initialHour12 = 12;
  }

  const [hour, setHour] = useState(initialHour12);
  const [minute, setMinute] = useState(initialMinutes);
  const [period, setPeriod] = useState<"AM" | "PM">(initialPeriod as "AM" | "PM");

  const hours = Array.from({ length: 12 }, (_, index) => index + 1);
  const minutes = Array.from({ length: 60 }, (_, index) => index);

  const handleConfirm = () => {
    const result = new Date(initialDate);
    let hours24 = hour % 12;
    if (period === "PM") {
      hours24 += 12;
    }
    result.setHours(hours24, minute, 0, 0);
    onConfirm(result);
    onCancel();
  };

  const formatTwo = (value: number) => value.toString().padStart(2, "0");

  return (
    <View style={styles.overlay}>
      <View style={styles.timePickerCard}>
        <View style={styles.timeColumnsRow}>
          <View style={styles.timeColumn}>
            <Text style={styles.timeColumnLabel}>Hour</Text>
            <ScrollView
              style={styles.timeValuesScroll}
              showsVerticalScrollIndicator={false}
            >
              {hours.map((value) => {
                const isSelected = value === hour;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.timeValueChip,
                      isSelected && styles.timeValueChipSelected,
                    ]}
                    onPress={() => setHour(value)}
                  >
                    <Text
                      style={[
                        styles.timeValueText,
                        isSelected && styles.timeValueTextSelected,
                      ]}
                    >
                      {formatTwo(value)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.timeColumn}>
            <Text style={styles.timeColumnLabel}>Min</Text>
            <ScrollView
              style={styles.timeValuesScroll}
              showsVerticalScrollIndicator={false}
            >
              {minutes.map((value) => {
                const isSelected = value === minute;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.timeValueChip,
                      isSelected && styles.timeValueChipSelected,
                    ]}
                    onPress={() => setMinute(value)}
                  >
                    <Text
                      style={[
                        styles.timeValueText,
                        isSelected && styles.timeValueTextSelected,
                      ]}
                    >
                      {formatTwo(value)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.timeColumn}>
            <Text style={styles.timeColumnLabel}>Period</Text>
            <ScrollView
              style={styles.timeValuesScroll}
              showsVerticalScrollIndicator={false}
            >
              {(["AM", "PM"] as const).map((value) => {
                const isSelected = value === period;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.timeValueChip,
                      isSelected && styles.timeValueChipSelected,
                    ]}
                    onPress={() => setPeriod(value)}
                  >
                    <Text
                      style={[
                        styles.timeValueText,
                        isSelected && styles.timeValueTextSelected,
                      ]}
                    >
                      {value}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <View style={styles.timePickerActionsRow}>
          <TouchableOpacity
            style={[styles.timePickerButton, styles.timePickerPrimaryButton]}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.timePickerPrimaryText}>Set</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timePickerButton, styles.timePickerSecondaryButton]}
            onPress={onCancel}
            activeOpacity={0.85}
          >
            <Text style={styles.timePickerSecondaryText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function ReminderModal(props: ReminderModalProps) {
  const { visible, draftDate, onChangeDate, onChangeTime, onAdd, onCancel, canAdd } = props;

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.reminderModalCard}>
        <Text style={styles.reminderModalTitle}>Add Check-in Reminder</Text>

        <TouchableOpacity
          style={styles.reminderModalRow}
          activeOpacity={0.85}
          onPress={() => onChangeDate(draftDate)}
        >
          <Text style={styles.reminderModalValueText}>{formatDateLabel(draftDate)}</Text>
          <Feather name="calendar" size={18} color="#8D9299" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reminderModalRow}
          activeOpacity={0.85}
          onPress={() => onChangeTime(draftDate)}
        >
          <Text style={styles.reminderModalValueText}>{formatTimeLabel(draftDate)}</Text>
          <Feather name="clock" size={18} color="#8D9299" />
        </TouchableOpacity>

        <View style={styles.reminderModalActionsRow}>
          <TouchableOpacity
            style={[
              styles.reminderModalButton,
              styles.reminderModalPrimaryButton,
              !canAdd && styles.reminderModalButtonDisabled,
            ]}
            onPress={onAdd}
            activeOpacity={0.9}
            disabled={!canAdd}
          >
            <Text style={styles.reminderModalPrimaryText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reminderModalButton, styles.reminderModalSecondaryButton]}
            onPress={onCancel}
            activeOpacity={0.9}
          >
            <Text style={styles.reminderModalSecondaryText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CreateNewGoal() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [goalDateTime, setGoalDateTime] = useState<Date>(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    return now;
  });
  const [memoMode, setMemoMode] = useState<MemoMode>("voice");
  const [textMemo, setTextMemo] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [reminderDraftDate, setReminderDraftDate] = useState<Date>(() => new Date());
  const [isGoalDatePickerVisible, setGoalDatePickerVisible] = useState(false);
  const [isGoalTimePickerVisible, setGoalTimePickerVisible] = useState(false);
  const [isReminderDatePickerVisible, setReminderDatePickerVisible] = useState(false);
  const [isReminderTimePickerVisible, setReminderTimePickerVisible] = useState(false);
  const [isReminderModalVisible, setReminderModalVisible] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [waveformValues, setWaveformValues] = useState<number[]>(
    () => new Array(40).fill(0.3),
  );
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingRef = useRef<null>(null);
  const playbackSoundRef = useRef<null>(null);

  const updateWaveform = () => {
    setWaveformValues((previous) =>
      previous.map(() => 0.3 + Math.random() * 0.7),
    );
  };

  useEffect(() => {
    if (isRecording) {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      setIsPlaying(false);
      recordingIntervalRef.current = setInterval(() => {
        setRecordSeconds((previous) => {
          const next = Math.min(previous + 0.1, MAX_RECORD_SECONDS);
          if (next >= MAX_RECORD_SECONDS) {
            setIsRecording(false);
          }
          return next;
        });
        updateWaveform();
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
  }, [isRecording]);

  useEffect(() => {
    if (isPlaying) {
      playbackIntervalRef.current = setInterval(() => {
        setPlaybackSeconds((previous) => {
          const next = previous + 0.1;
          if (next >= recordSeconds) {
            setIsPlaying(false);
            return recordSeconds;
          }
          return next;
        });
      }, 120);
    } else if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
    };
  }, [isPlaying, recordSeconds]);

  const handleToggleRecord = async () => {
    // Deprecated: behavior handled by VoiceMemoCard
  };

  const handleTogglePlayback = async () => {
    // Deprecated: behavior handled by VoiceMemoCard
  };

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    const memoType: "voice" | "text" | null =
      memoMode === "voice" && recordSeconds > 0
        ? "voice"
        : memoMode === "text" && textMemo.trim().length > 0
        ? "text"
        : null;

    startGoalDraft({
      title,
      dueAt: goalDateTime.toISOString(),
      reminders: reminders.map((reminder) => ({
        id: reminder.id,
        dateTime: reminder.dateTime.toISOString(),
      })),
      memoType,
      textMemo: memoType === "text" ? textMemo : undefined,
      voiceMemoFileUri: memoType === "voice" ? recordingUri ?? undefined : undefined,
    });

    router.push("/add-info");
  };

  const toggleMemoMode = () => {
    setMemoMode((prev) => (prev === "voice" ? "text" : "voice"));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={24}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBack} hitSlop={16}>
              <Feather name="arrow-left" size={22} color="#3D4F5F" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.screenTitle}>New Intention</Text>

            {/* Goal title */}
            <View style={styles.section}>
              <Text style={styles.questionLabel}>What do you want to accomplish?</Text>
              <View style={styles.inputShell}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Finish landing page"
                  placeholderTextColor="#B2B6BE"
                  value={title}
                  onChangeText={setTitle}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Due date and time */}
            <View style={styles.section}>
              <Text style={styles.questionLabel}>When will you complete it?</Text>

              <TouchableOpacity
                style={styles.dateTimeRow}
                activeOpacity={0.8}
                onPress={() => setGoalDatePickerVisible(true)}
              >
                <Text style={styles.dateTimeText}>{formatDateLabel(goalDateTime)}</Text>
                <Feather name="calendar" size={18} color="#8D9299" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeRow}
                activeOpacity={0.8}
                onPress={() => setGoalTimePickerVisible(true)}
              >
                <Text style={styles.dateTimeText}>{formatTimeLabel(goalDateTime)}</Text>
                <Feather name="clock" size={18} color="#8D9299" />
              </TouchableOpacity>
            </View>

            {/* Check-in reminders */}
            <View style={styles.section}>
              <Text style={styles.questionLabel}>Check-in Reminders (Optional)</Text>
              <TouchableOpacity
                style={styles.reminderButton}
                activeOpacity={0.85}
                onPress={() => {
                  if (reminders.length >= MAX_REMINDERS) {
                    return;
                  }
                  setReminderDraftDate(startOfDay(goalDateTime));
                  setReminderModalVisible(true);
                }}
              >
                <Feather name="bell" size={16} color="#3D4F5F" />
                <Text style={styles.reminderButtonText}>
                  Add Check-in Reminder ({reminders.length}/{MAX_REMINDERS})
                </Text>
              </TouchableOpacity>

              {reminders.map((reminder) => (
                <View key={reminder.id} style={styles.reminderPill}>
                  <View style={styles.reminderPillRow}>
                    <View style={styles.reminderPillLeft}>
                      <Feather name="bell" size={16} color="#3D4F5F" />
                      <Text style={styles.reminderPillText}>
                        {formatDateLabel(reminder.dateTime)}, {formatTimeLabel(reminder.dateTime)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      hitSlop={8}
                      onPress={() =>
                        setReminders((previous) =>
                          previous.filter((item) => item.id !== reminder.id),
                        )
                      }
                    >
                      <Feather name="x" size={18} color="#3D4F5F" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Why this goal matters */}
            <View style={styles.section}>
              <View style={styles.memoHeaderRow}>
                <Text style={styles.questionLabel}>Why this goal matters to you?</Text>
                <TouchableOpacity
                  onPress={toggleMemoMode}
                  hitSlop={12}
                  style={styles.memoToggleIcon}
                >
                  <Feather
                    name={memoMode === "voice" ? "chevron-right" : "chevron-left"}
                    size={18}
                    color="#8D9299"
                  />
                </TouchableOpacity>
              </View>

              {memoMode === "voice" ? (
                <VoiceMemoCard
                  maxSeconds={MAX_RECORD_SECONDS}
                  initialUri={recordingUri}
                  onChange={({ uri, durationSeconds }) => {
                    setRecordingUri(uri);
                    setRecordSeconds(durationSeconds);
                  }}
                />
              ) : (
                <View>
                  <View style={styles.memoInputShell}>
                    <TextInput
                      style={styles.memoTextInput}
                      placeholder="Share your reasons for setting this goal..."
                      placeholderTextColor="#B2B6BE"
                      value={textMemo}
                      onChangeText={setTextMemo}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                  <Text style={styles.wordCountText}>0 / 300 words</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {isGoalDatePickerVisible && (
            <DatePickerOverlay
              initialDate={goalDateTime}
              minimumDate={new Date()}
              onConfirm={(date) => {
                setGoalDateTime((previous) => mergeDatePart(date, previous));
              }}
              onCancel={() => setGoalDatePickerVisible(false)}
            />
          )}

          {isGoalTimePickerVisible && (
            <TimePickerOverlay
              initialDate={goalDateTime}
              onConfirm={(date) => {
                setGoalDateTime((previous) => mergeTimePart(date, previous));
              }}
              onCancel={() => setGoalTimePickerVisible(false)}
            />
          )}

          <ReminderModal
            visible={isReminderModalVisible}
            draftDate={reminderDraftDate}
            onChangeDate={() => {
              setReminderDatePickerVisible(true);
            }}
            onChangeTime={() => {
              setReminderTimePickerVisible(true);
            }}
            onAdd={() => {
              if (reminders.length >= MAX_REMINDERS) {
                setReminderModalVisible(false);
                return;
              }
              setReminders((previous) => [
                ...previous,
                { id: `${Date.now()}-${previous.length}`, dateTime: reminderDraftDate },
              ]);
              setReminderModalVisible(false);
            }}
            onCancel={() => setReminderModalVisible(false)}
            canAdd={reminders.length < MAX_REMINDERS}
          />

          {isReminderDatePickerVisible && (
            <DatePickerOverlay
              initialDate={reminderDraftDate}
              minimumDate={new Date()}
              onConfirm={(date) => {
                setReminderDraftDate((previous) => mergeDatePart(date, previous));
              }}
              onCancel={() => setReminderDatePickerVisible(false)}
            />
          )}

          {isReminderTimePickerVisible && (
            <TimePickerOverlay
              initialDate={reminderDraftDate}
              onConfirm={(date) => {
                setReminderDraftDate((previous) => mergeTimePart(date, previous));
              }}
              onCancel={() => setReminderTimePickerVisible(false)}
            />
          )}

          <TouchableOpacity style={styles.nextButton} activeOpacity={0.9} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#EFECE5",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2F3C4A",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  questionLabel: {
    fontSize: 14,
    color: "#8D9299",
    marginBottom: 8,
  },
  inputShell: {
    borderRadius: 18,
    backgroundColor: "#F5F3EF",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 15,
    color: "#2F3C4A",
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  dateTimeText: {
    fontSize: 15,
    color: "#2F3C4A",
  },
  reminderButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  reminderButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#2F3C4A",
    fontWeight: "500",
  },
  memoHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  memoToggleIcon: {
    padding: 4,
  },
  voiceCard: {
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  voiceTimerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  voiceTimerText: {
    fontSize: 13,
    color: "#8D9299",
  },
  voicePlayButton: {
    marginLeft: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D4D7DD",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceRecordButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#7DD3C0",
    alignItems: "center",
    justifyContent: "center",
  },
  memoInputShell: {
    borderRadius: 18,
    backgroundColor: "#F5F3EF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 120,
  },
  memoTextInput: {
    fontSize: 15,
    color: "#2F3C4A",
    flexGrow: 1,
  },
  wordCountText: {
    marginTop: 6,
    fontSize: 12,
    color: "#8D9299",
  },
  nextButton: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: "#3D4F5F",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarCard: {
    width: "88%",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  calendarHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  calendarHeaderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F3EF",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2F3C4A",
  },
  calendarWeekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calendarWeekdayText: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    color: "#B2B6BE",
  },
  calendarWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  calendarDayCell: {
    flex: 1,
    marginVertical: 4,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 16,
  },
  calendarDaySelected: {
    backgroundColor: "#2F3C4A",
  },
  calendarDayDisabled: {
    opacity: 0.35,
  },
  calendarDayText: {
    fontSize: 14,
    color: "#2F3C4A",
  },
  calendarDayTextDisabled: {
    color: "#C6CAD2",
  },
  calendarDayTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  timePickerCard: {
    width: "80%",
    borderRadius: 20,
    backgroundColor: "#1F2933",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  timeColumnsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeValuesScroll: {
    maxHeight: 180,
  },
  timeColumnLabel: {
    fontSize: 12,
    color: "#E5E7EB",
    marginBottom: 8,
  },
  timeValueChip: {
    paddingVertical: 4,
    marginBottom: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  timeValueChipSelected: {
    backgroundColor: "#60A5FA",
  },
  timeValueText: {
    fontSize: 14,
    color: "#F9FAFB",
  },
  timeValueTextSelected: {
    fontWeight: "600",
  },
  timePickerActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  timePickerButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  timePickerPrimaryButton: {
    backgroundColor: "#3D4F5F",
    marginRight: 6,
  },
  timePickerSecondaryButton: {
    backgroundColor: "#111827",
    marginLeft: 6,
  },
  timePickerPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  timePickerSecondaryText: {
    color: "#F9FAFB",
    fontSize: 14,
  },
  reminderModalCard: {
    width: "86%",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  reminderModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2F3C4A",
    marginBottom: 16,
  },
  reminderModalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  reminderModalValueText: {
    fontSize: 15,
    color: "#2F3C4A",
  },
  reminderModalActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  reminderModalButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderModalPrimaryButton: {
    backgroundColor: "#3D4F5F",
    marginRight: 8,
  },
  reminderModalSecondaryButton: {
    backgroundColor: "#F5F3EF",
    marginLeft: 8,
  },
  reminderModalPrimaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  reminderModalSecondaryText: {
    color: "#2F3C4A",
    fontSize: 15,
    fontWeight: "500",
  },
  reminderModalButtonDisabled: {
    opacity: 0.4,
  },
  reminderPill: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: "#D4F4E8",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  reminderPillRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reminderPillLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  reminderPillText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#2F3C4A",
  },
});
