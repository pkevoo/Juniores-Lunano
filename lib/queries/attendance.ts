import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { AttendanceStatus } from '../../types/database';

export function useAllAttendance() {
  return useQuery({
    queryKey: ['training_attendance'],
    queryFn: async () => {
      const { data, error } = await supabase.from('training_attendance').select('*');
      if (error) throw error;
      return data;
    },
  });
}

export function useAttendanceForTraining(trainingId: number | null) {
  return useQuery({
    queryKey: ['training_attendance', 'training', trainingId],
    enabled: trainingId != null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_attendance')
        .select('*')
        .eq('training_id', trainingId as number);
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: {
      training_id: number;
      player_id: number;
      status: AttendanceStatus;
      motivo?: string | null;
      created_by?: string | null;
    }) => {
      const { error } = await supabase.from('training_attendance').upsert(record, { onConflict: 'training_id,player_id' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training_attendance'] }),
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ trainingId, playerId }: { trainingId: number; playerId: number }) => {
      const { error } = await supabase
        .from('training_attendance')
        .delete()
        .eq('training_id', trainingId)
        .eq('player_id', playerId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training_attendance'] }),
  });
}

/** present = attended; absent + planned_absence both count as not-present for stats purposes. */
export function presencePct(records: { status: AttendanceStatus }[]): number | null {
  if (records.length === 0) return null;
  const present = records.filter((r) => r.status === 'present').length;
  return Math.round((present / records.length) * 100);
}
