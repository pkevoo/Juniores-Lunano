import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Database } from '../../types/database';

type MatchInsert = Database['public']['Tables']['matches']['Insert'];

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('matches').select('*').order('match_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useNextMatch() {
  const { data: matches, ...rest } = useMatches();
  const nextMatch = matches?.find((m) => !m.played) ?? null;
  return { nextMatch, ...rest };
}

export function useAddMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (match: MatchInsert) => {
      const { error } = await supabase.from('matches').insert(match);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches'] }),
  });
}

export function useBulkImportMatches() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (matches: MatchInsert[]) => {
      const { error } = await supabase.from('matches').insert(matches);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches'] }),
  });
}

export function useDeleteMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('matches').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches'] }),
  });
}
