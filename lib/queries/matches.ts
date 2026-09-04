import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';

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
