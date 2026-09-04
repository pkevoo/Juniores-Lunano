import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export function useOpponentNotes() {
  return useQuery({
    queryKey: ['opponent_notes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('opponent_notes').select('*').order('team_name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddOpponentNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (note: { team_name: string; note?: string | null; updated_by?: string | null }) => {
      const { error } = await supabase.from('opponent_notes').insert(note);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['opponent_notes'] }),
  });
}

export function useUpdateOpponentNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, note, updated_by }: { id: number; note: string; updated_by?: string | null }) => {
      const { error } = await supabase.from('opponent_notes').update({ note, updated_by }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['opponent_notes'] }),
  });
}

export function useDeleteOpponentNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('opponent_notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['opponent_notes'] }),
  });
}
