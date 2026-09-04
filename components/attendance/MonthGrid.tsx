import { format, isSameDay } from 'date-fns';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { buildMonthCells, IT_WEEKDAYS } from '../../lib/dateUtils';
import { useTheme } from '../../lib/ThemeContext';
import type { Database } from '../../types/database';

type Training = Database['public']['Tables']['trainings']['Row'];

export function MonthGrid({
  cursor,
  trainings,
  onDayPress,
}: {
  cursor: Date;
  trainings: Training[];
  onDayPress: (date: Date, trainingId: number | null) => void;
}) {
  const { palette } = useTheme();
  const cells = buildMonthCells(cursor);

  const trainingsOn = (date: Date) => trainings.filter((t) => isSameDay(new Date(t.training_date), date));

  return (
    <View style={[styles.grid, { backgroundColor: palette.ink08, borderColor: palette.ink08 }]}>
      {IT_WEEKDAYS.map((w) => (
        <View key={w} style={[styles.weekdayCell, { backgroundColor: palette.bg }]}>
          <Text style={[styles.weekdayText, { color: palette.ink50 }]}>{w}</Text>
        </View>
      ))}
      {cells.map((cell, i) => {
        const dayTrainings = trainingsOn(cell.date);
        return (
          <Pressable
            key={i}
            onPress={() => onDayPress(cell.date, dayTrainings[0]?.id ?? null)}
            style={[styles.dayCell, { backgroundColor: palette.surface, opacity: cell.inMonth ? 1 : 0.35 }]}
          >
            <View
              style={[
                styles.dayBadge,
                cell.isToday ? { backgroundColor: palette.accent } : { backgroundColor: 'transparent' },
              ]}
            >
              <Text style={[styles.dayNumber, { color: cell.isToday ? '#fff' : palette.tx, fontFamily: cell.isToday ? 'Manrope_700Bold' : 'Manrope_500Medium' }]}>
                {format(cell.date, 'd')}
              </Text>
            </View>
            {dayTrainings[0] && (
              <View style={[styles.trainingPill, { backgroundColor: palette.accentSoft }]}>
                <Text numberOfLines={1} style={[styles.trainingPillText, { color: palette.accent }]}>
                  {dayTrainings[0].focus ?? 'Allen.'}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderRadius: 10, overflow: 'hidden', gap: 1 },
  weekdayCell: { width: '14.28%', alignItems: 'center', paddingVertical: 6 },
  weekdayText: { fontSize: 10, fontFamily: 'Manrope_700Bold' },
  dayCell: { width: '14.28%', minHeight: 46, padding: 4, gap: 3 },
  dayBadge: { width: 18, height: 18, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  dayNumber: { fontSize: 11 },
  trainingPill: { borderRadius: 3, paddingHorizontal: 3, paddingVertical: 1 },
  trainingPillText: { fontSize: 8.5, fontFamily: 'Manrope_700Bold' },
});
