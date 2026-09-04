import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfDay } from 'date-fns';
import { supabase } from '../supabase';
import type { Database } from '../../types/database';

type TrainingInsert = Database['public']['Tables']['trainings']['Insert'];

export function useTrainings() {
  return useQuery({
    queryKey: ['trainings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('trainings').select('*').order('training_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Next training = the earliest one on or after today.
 * Deliberately does NOT fall back to trainings[0] when none qualify (a
 * prototype bug showed an already-past training as "next" in that case) —
 * returns null instead, which the dashboard renders as an empty state.
 */
export function useNextTraining() {
  const { data: trainings, ...rest } = useTrainings();
  const today = startOfDay(new Date());
  const nextTraining =
    trainings?.find((t) => startOfDay(new Date(t.training_date)) >= today) ?? null;
  return { nextTraining, ...rest };
}

export function useAddTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (training: TrainingInsert) => {
      const { error } = await supabase.from('trainings').insert(training);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trainings'] }),
  });
}

export function useDeleteTraining() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('trainings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trainings'] }),
  });
}
