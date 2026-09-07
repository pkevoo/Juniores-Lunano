import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { BoardLine, BoardToken } from '../tacticalBoardTypes';

export interface SchemeRow {
  id: number;
  name: string;
  tokens: BoardToken[];
  lines: BoardLine[];
  player_size: number | null;
  created_by: string | null;
  created_at: string;
}

export function useSchemes() {
  return useQuery({
    queryKey: ['tactical_schemes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tactical_schemes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as SchemeRow[];
    },
  });
}

export function useSaveScheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scheme: { name: string; tokens: BoardToken[]; lines: BoardLine[]; player_size: number; created_by?: string | null }) => {
      const { error } = await supabase.from('tactical_schemes').insert(scheme as never);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tactical_schemes'] }),
  });
}

export function useDeleteScheme() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('tactical_schemes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tactical_schemes'] }),
  });
}
