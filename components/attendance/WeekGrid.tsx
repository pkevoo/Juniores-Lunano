import { format, isSameDay } from 'date-fns';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/ThemeContext';
import type { Database } from '../../types/database';

type Training = Database['public']['Tables']['trainings']['Row'];

const WEEK_HOURS = [16, 17, 18, 19, 20, 21, 22];

export function WeekGrid({
  weekDates,
  trainings,
  onSlotPress,
}: {
  weekDates: Date[];
  trainings: Training[];
  onSlotPress: (date: Date, trainingId: number | null) => void;
}) {
  const { palette } = useTheme();

  const trainingAt = (date: Date, hour: number) =>
    trainings.find((t) => {
      if (!isSameDay(new Date(t.training_date), date)) return false;
      const trainingHour = parseInt(t.training_time.split(':')[0] ?? '0', 10);
      return trainingHour === hour;
    });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.headerRow}>
          <View style={styles.hourLabelCol} />
          {weekDates.map((d) => (
            <View key={d.toISOString()} style={styles.dayHeaderCol}>
              <Text style={[styles.dayHeaderText, { color: palette.tx }]}>{format(d, 'EEE d')}</Text>
            </View>
          ))}
        </View>
        {WEEK_HOURS.map((hour) => (
          <View key={hour} style={[styles.hourRow, { borderTopColor: palette.ink08 }]}>
            <View style={styles.hourLabelCol}>
              <Text style={[styles.hourLabelText, { color: palette.ink50 }]}>{hour}:00</Text>
            </View>
            {weekDates.map((d) => {
              const training = trainingAt(d, hour);
              return (
                <Pressable
                  key={d.toISOString()}
                  onPress={() => onSlotPress(d, training?.id ?? null)}
                  style={[styles.slot, { borderColor: palette.ink06 }]}
                >
                  {training && (
                    <View style={[styles.trainingBlock, { backgroundColor: palette.accentSoft }]}>
                      <Text numberOfLines={2} style={[styles.trainingText, { color: palette.accent }]}>
                        {training.training_time.slice(0, 5)} {training.focus ?? ''}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row' },
  hourLabelCol: { width: 48 },
  dayHeaderCol: { width: 84, alignItems: 'center', paddingBottom: 6 },
  dayHeaderText: { fontSize: 10.5, fontFamily: 'Manrope_700Bold' },
  hourRow: { flexDirection: 'row', borderTopWidth: 1, minHeight: 44 },
  hourLabelText: { fontSize: 9.5, fontFamily: 'Manrope_500Medium', paddingTop: 2 },
  slot: { width: 84, borderLeftWidth: 1, padding: 2 },
  trainingBlock: { flex: 1, borderRadius: 6, padding: 4, justifyContent: 'center' },
  trainingText: { fontSize: 9, fontFamily: 'Manrope_700Bold' },
});
